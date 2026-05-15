from flask import Blueprint, request, jsonify, g
from psycopg2.extras import RealDictCursor
from db import get_db_connection
from routes.admin_guard import require_admin
import json
from flask import send_file
import io
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4
admin_supplier_bp = Blueprint(
    "admin_supplier_bp",
    __name__,
    url_prefix="/api/admin/supplier-payments"
)


# =====================================================
# GET SUPPLIERS WITH CREDIT DUES ONLY
# =====================================================
@admin_supplier_bp.route("/suppliers", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def get_suppliers():

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            s.supplier_id,
            s.company_name_english AS supplier_name,
            SUM(COALESCE(oh.supplier_due_amount,0)) AS total_due
        FROM supplier_registration s
        JOIN order_header oh
            ON s.supplier_id = oh.supplier_id
        WHERE LOWER(COALESCE(oh.payment_method,'')) = 'credit'
        GROUP BY s.supplier_id, s.company_name_english
        HAVING SUM(COALESCE(oh.supplier_due_amount,0)) > 0
        ORDER BY supplier_name
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(data)


# =====================================================
# GET SUPPLIER ORDERS (ONLY CREDIT DUE)
# =====================================================
@admin_supplier_bp.route("/orders/<int:supplier_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def get_supplier_orders(supplier_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            oh.order_id,
            oh.order_date,
            oh.status, 
            oh.total_amount,
            oh.restaurant_id,

            r.restaurant_name_english,
            r.contact_person_name,
            r.contact_person_mobile,
            r.address,
            r.city,
                
            s.company_name_english AS supplier_name,
            s.contact_person_name AS supplier_contact,
            s.contact_person_mobile AS supplier_mobile,
            s.contact_person_email AS supplier_email,
            s.bank_name,
            s.iban,
            s.city AS supplier_city,
            s.address AS supplier_address,

            -- RESTAURANT PAYMENT
            COALESCE(oh.restaurant_paid_amount,0) AS restaurant_paid_amount,
            (oh.total_amount - COALESCE(oh.restaurant_paid_amount,0)) AS restaurant_due_amount,
            COALESCE(oh.restaurant_payment_status,'UNPAID') AS restaurant_payment_status,

            -- SUPPLIER PAYMENT
            COALESCE(oh.supplier_paid_amount,0) AS supplier_paid_amount,
            COALESCE(oh.supplier_due_amount,0) AS supplier_due_amount,
            COALESCE(oh.supplier_payment_status,'UNPAID') AS supplier_payment_status,

            oi.product_name_english,
            oi.quantity,
            oi.price_per_unit,
            oi.total_amount AS item_total

        FROM order_header oh
        JOIN restaurant_registration r
            ON r.restaurant_id = oh.restaurant_id
        JOIN supplier_registration s
            ON s.supplier_id = oh.supplier_id
        JOIN order_items oi
            ON oi.order_id = oh.order_id

        WHERE oh.supplier_id = %s
          AND LOWER(COALESCE(oh.payment_method,'')) = 'credit'
          AND COALESCE(oh.supplier_due_amount,0) > 0

        ORDER BY oh.order_date DESC
    """, (supplier_id,))

    rows = cur.fetchall()

    orders = {}

    for r in rows:

        oid = r["order_id"]

        if oid not in orders:
            orders[oid] = {
                "order_id": oid,
                "order_date": r["order_date"],
                "status": r["status"],
                "total_amount": float(r["total_amount"]),
                "restaurant_id": r["restaurant_id"],

                # RESTAURANT PAYMENT
                "restaurant_paid_amount": float(r["restaurant_paid_amount"]),
                "restaurant_due_amount": float(r["restaurant_due_amount"]),
                "restaurant_payment_status": r["restaurant_payment_status"],

                # SUPPLIER PAYMENT
                "supplier_paid_amount": float(r["supplier_paid_amount"]),
                "supplier_due_amount": float(r["supplier_due_amount"]),
                "supplier_payment_status": r["supplier_payment_status"],

                # restaurant details
                "restaurant_name_english": r["restaurant_name_english"],
                "contact_person_name": r["contact_person_name"],
                "contact_person_mobile": r["contact_person_mobile"],
                "address": r["address"],
                "city": r["city"],

                #supplier details
                "supplier_name": r["supplier_name"],
                "supplier_contact": r["supplier_contact"],
                "supplier_mobile": r["supplier_mobile"],
                "supplier_email": r["supplier_email"],
                "bank_name": r["bank_name"],
                "iban": r["iban"],
                "supplier_city": r["supplier_city"],
                "supplier_address": r["supplier_address"],

                "items": []
            }

        orders[oid]["items"].append({
            "product_name": r["product_name_english"],
            "qty": float(r["quantity"]),
            "price": float(r["price_per_unit"]),
            "total": float(r["item_total"])
        })

    cur.close()
    conn.close()

    return jsonify(list(orders.values()))


# =====================================================
# PAY SUPPLIER (PARTIAL OR FULL) — CREDIT ONLY
# =====================================================
@admin_supplier_bp.route("/pay", methods=["POST"])
@require_admin("MANAGE_ADMIN_USERS")
def pay_supplier():

    supplier_id = int(request.form.get("supplier_id"))
    order_ids = json.loads(request.form.get("order_ids", "[]"))

    try:
        amount = float(request.form.get("amount", 0))
    except:
        return jsonify({"error": "Invalid amount"}), 400

    payment_mode = request.form.get("payment_mode")
    reference_no = request.form.get("reference_no")
    remarks = request.form.get("remarks")

    file = request.files.get("receipt")

    if amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        remaining = amount
        used = 0

        for oid in order_ids:

            if remaining <= 0:
                break

            # ✅ CREDIT SAFETY FILTER
            cur.execute("""
                SELECT supplier_due_amount
                FROM order_header
                WHERE order_id = %s
                  AND LOWER(payment_method) = 'credit'
                    AND status = 'DELIVERED'
                FOR UPDATE
            """, (oid,))

            row = cur.fetchone()
            if not row:
                continue

            due = float(row["supplier_due_amount"] or 0)

            pay_amount = min(due, remaining)
            new_due = due - pay_amount

            status = "PAID" if new_due == 0 else "PARTIAL"

            cur.execute("""
                UPDATE order_header
                SET
                    supplier_paid_amount = supplier_paid_amount + %s,
                    supplier_due_amount = %s,
                    supplier_payment_status = %s,
                    updated_at = NOW()
                WHERE order_id = %s
                  AND LOWER(payment_method) = 'credit'
                    AND status = 'DELIVERED'
            """, (pay_amount, new_due, status, oid))

            remaining -= pay_amount
            used += pay_amount


        # ===============================
        # STORE RECEIPT FILE
        # ===============================
        receipt_data = None
        receipt_name = None
        receipt_type = None

        if file:
            receipt_data = file.read()
            receipt_name = file.filename
            receipt_type = file.mimetype


        # ===============================
        # INSERT PAYMENT LEDGER
        # ===============================
        cur.execute("""
        INSERT INTO supplier_payments
        (
            supplier_id,
            order_ids,
            amount,
            payment_mode,
            reference_no,
            remarks,
            receipt_file,
            receipt_filename,
            receipt_mimetype,
            created_by_admin
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING payment_id
        """, (
            supplier_id,
            json.dumps(order_ids),
            used,
            payment_mode,
            reference_no,
            remarks,
            receipt_data,
            receipt_name,
            receipt_type,
            g.admin["admin_id"]
        ))

        payment_id = cur.fetchone()["payment_id"]

        # ===============================
        # 🔔 SUPPLIER NOTIFICATION
        # ===============================
        cur.execute("""
        INSERT INTO supplier_notifications
        (
            supplier_id,
            type,
            title,
            message,
            reference_id
        )
        VALUES (%s,%s,%s,%s,%s)
        """, (
            supplier_id,
            "PAYMENT_RECEIVED",
            "Payment Received",
            f"QAR  {used:.2f} credited to your account.\nOrders cleared: {len(order_ids)}",
            json.dumps({
                "payment_id": payment_id,
                "order_ids": order_ids
            })
        ))

        conn.commit()

        return jsonify({
            "success": True,
            "paid_amount": used
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =====================================================
# DOWNLOAD PAYMENT RECEIPT
# =====================================================
@admin_supplier_bp.route("/receipt/<int:payment_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def download_receipt(payment_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT receipt_file, receipt_filename, receipt_mimetype
        FROM supplier_payments
        WHERE payment_id = %s
    """, (payment_id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row or not row["receipt_file"]:
        return jsonify({"error": "No receipt found"}), 404

    return send_file(
        io.BytesIO(row["receipt_file"]),
        mimetype=row["receipt_mimetype"],
        as_attachment=True,
        download_name=row["receipt_filename"]
    )
@admin_supplier_bp.route("/history/<int:supplier_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def payment_history(supplier_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            payment_id,
            order_ids,
            amount,
            payment_mode,
            reference_no,
            remarks,
            created_at,
            receipt_filename
        FROM supplier_payments
        WHERE supplier_id = %s
        ORDER BY created_at DESC
    """, (supplier_id,))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(data)


# =====================================================
# GET RESTAURANTS LINKED TO SUPPLIER
# =====================================================
@admin_supplier_bp.route("/restaurants/<int:supplier_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def supplier_restaurants(supplier_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT DISTINCT
            r.restaurant_id,
            r.restaurant_name_english,
            r.contact_person_name,
            r.contact_person_mobile,
            r.address,
            r.city,
            r.credit_limit,
            r.credit_used,
            r.credit_days
        FROM order_header oh
        JOIN restaurant_registration r
            ON r.restaurant_id = oh.restaurant_id
        WHERE oh.supplier_id = %s
        ORDER BY r.restaurant_name_english
    """, (supplier_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)


@admin_supplier_bp.route("/payment-pdf/<int:payment_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def payment_pdf(payment_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ---------------- PAYMENT ----------------
    cur.execute("""
        SELECT sp.*, s.company_name_english
        FROM supplier_payments sp
        JOIN supplier_registration s
            ON s.supplier_id = sp.supplier_id
        WHERE sp.payment_id = %s
    """, (payment_id,))

    row = cur.fetchone()

    if not row:
        return jsonify({"error": "Not found"}), 404


    # ---------------- LOAD ORDERS ----------------
    orders = row["order_ids"]

    if isinstance(orders, str):
        orders = json.loads(orders)

    order_rows = []

    previous_due = 0
    remaining_due = 0


    for oid in orders:

        cur.execute("""
            SELECT
                order_id,
                total_amount,
                COALESCE(supplier_due_amount,0) AS due
            FROM order_header
            WHERE order_id = %s
        """, (oid,))

        o = cur.fetchone()

        if not o:
            continue

        total_amt = float(o["total_amount"] or 0)
        due_amt = float(o["due"] or 0)

        paid_amt = total_amt - due_amt

        previous_due += total_amt
        remaining_due += due_amt

        order_rows.append([
            o["order_id"],
            f"{total_amt:.2f}",
            f"{paid_amt:.2f}",
            f"{due_amt:.2f}"
        ])


    # ---------------- PDF ----------------
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    elements = []


    # =====================================================
    # HEADER
    # =====================================================

    header_data = [
        ["MAHAL"],
        ["SUPPLIER PAYMENT RECEIPT"]
    ]

    header_table = Table(header_data, colWidths=[500])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#2E86C1")),
        ("TEXTCOLOR", (0,0), (-1,-1), colors.white),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("FONTNAME", (0,0), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 16),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 10)
    ]))

    elements.append(header_table)
    elements.append(Spacer(1, 25))


    # =====================================================
    # PAYMENT INFO
    # =====================================================

    info_data = [
        ["Supplier", row["company_name_english"]],
        ["Payment ID", str(row["payment_id"])],
        ["Date", str(row["created_at"])[:19]],
        ["Payment Mode", row["payment_mode"]],
        ["Reference No", row["reference_no"] or "-"]
    ]

    info_table = Table(info_data, colWidths=[180, 320])

    info_table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("BACKGROUND", (0,0), (0,-1), colors.whitesmoke),
        ("FONTNAME", (0,0), (-1,-1), "Helvetica"),
        ("FONTSIZE", (0,0), (-1,-1), 10)
    ]))

    elements.append(info_table)
    elements.append(Spacer(1, 25))


    # =====================================================
    # ORDERS TABLE
    # =====================================================

    elements.append(Paragraph("<b>Orders Paid</b>", styles["Heading3"]))
    elements.append(Spacer(1, 10))

    table_data = [["Order ID", "Total", "Paid", "Remaining"]] + order_rows

    orders_table = Table(table_data, colWidths=[120,120,120,120])

    orders_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#D6EAF8")),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("ALIGN", (1,1), (-1,-1), "RIGHT"),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 10)
    ]))

    elements.append(orders_table)
    elements.append(Spacer(1, 30))


    # =====================================================
    # TOTALS
    # =====================================================

    totals = [
        ["Total Due", f"QAR  {previous_due:.2f}"],
        ["Amount Paid", f"QAR  {float(row['amount']):.2f}"],
        ["Remaining Due", f"QAR  {remaining_due:.2f}"]
    ]

    totals_table = Table(totals, colWidths=[250,200])

    totals_table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 1, colors.black),
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F9E79F")),
        ("FONTNAME", (0,0), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 11)
    ]))

    elements.append(totals_table)
    elements.append(Spacer(1, 40))


    # =====================================================
    # SIGNATURES
    # =====================================================

    sign_data = [
        ["Authorized Signature", "", "Supplier Signature"],
        ["__________________", "", "__________________"]
    ]

    sign_table = Table(sign_data, colWidths=[200,100,200])

    sign_table.setStyle(TableStyle([
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("FONTNAME", (0,0), (-1,-1), "Helvetica")
    ]))

    elements.append(sign_table)
    elements.append(Spacer(1, 30))


    # =====================================================
    # FOOTER
    # =====================================================

    elements.append(
        Paragraph(
            "This is a system generated supplier payment receipt.",
            styles["Normal"]
        )
    )

    doc.build(elements)

    buffer.seek(0)

    cur.close()
    conn.close()

    return send_file(
        buffer,
        download_name=f"SupplierPayment_{payment_id}.pdf",
        mimetype="application/pdf"
    )

@admin_supplier_bp.route("/paid-orders/<int:supplier_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def paid_orders(supplier_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            oh.order_id,
            oh.order_date,
            oh.total_amount,
            oh.supplier_paid_amount,
            oh.supplier_due_amount,
            oh.supplier_payment_status,
            oh.status,
            oh.restaurant_id,  -- ✅ ADD THIS LINE
            r.restaurant_name_english
        FROM order_header oh
        JOIN restaurant_registration r
            ON r.restaurant_id = oh.restaurant_id
        WHERE oh.supplier_id = %s
        AND LOWER(oh.payment_method) = 'credit'
        AND COALESCE(oh.supplier_due_amount,0) = 0
        ORDER BY oh.order_date DESC
    """, (supplier_id,))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(data)