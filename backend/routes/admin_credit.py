from flask import Blueprint, request, jsonify, send_file, g
from psycopg2.extras import RealDictCursor
from db import get_db_connection
from routes.admin_guard import require_admin
from routes.admin_audit import log_admin_action
import io
import json
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER
from reportlab.lib import colors
from datetime import date

admin_credit_bp = Blueprint(
    "admin_credit_bp",
    __name__,
    url_prefix="/api/admin/credit"
)

# ======================================================
# GET ALL RESTAURANTS CREDIT
# ======================================================
@admin_credit_bp.route("/restaurants", methods=["GET", "OPTIONS"])
@require_admin("VIEW_DASHBOARD")
def get_restaurant_credits():

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
        SELECT
            r.restaurant_id,
            r.restaurant_name_english,
            r.credit_limit,
            r.credit_used,
            r.credit_days,
            r.is_credit_blocked,
            (r.credit_limit - r.credit_used) AS credit_available,

            -- overdue check
            EXISTS(
                SELECT 1
                FROM order_header o
                WHERE o.restaurant_id = r.restaurant_id
                AND o.restaurant_due_amount > 0
                AND o.credit_due_date < CURRENT_DATE
            ) AS is_overdue,

            -- overdue days
            COALESCE(
                MAX(
                    CASE
                        WHEN o.credit_due_date < CURRENT_DATE
                        THEN CURRENT_DATE - o.credit_due_date
                        ELSE 0
                    END
                ),0
            ) AS overdue_days,

            -- next due date
            MIN(
                CASE
                    WHEN o.restaurant_due_amount > 0
                    THEN o.credit_due_date
                END
            ) AS next_due_date

        FROM restaurant_registration r

        LEFT JOIN order_header o
            ON o.restaurant_id = r.restaurant_id

        WHERE r.approval_status = 'Approved'

        GROUP BY
            r.restaurant_id,
            r.restaurant_name_english,
            r.credit_limit,
            r.credit_used,
            r.credit_days,
            r.is_credit_blocked

        ORDER BY r.restaurant_name_english
        """)

        rows = cur.fetchall() or []

        

        for r in rows:

            next_due = r.get("next_due_date")

            if next_due:
                days = (next_due - date.today()).days
                r["next_due_in_days"] = days

                if days >= 0 and days <= 3:
                    r["is_due_soon"] = True
                else:
                    r["is_due_soon"] = False
            else:
                r["next_due_in_days"] = None
                r["is_due_soon"] = False

        # ✅ AUDIT — READ ACCESS
        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="READ_ACCESS",
            entity_type="restaurant_credit_list",
            entity_id=0,
            ip_address=request.remote_addr
        )

        return jsonify(rows), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ======================================================
# UPDATE CREDIT SETTINGS
# ======================================================
@admin_credit_bp.route("/update/<int:restaurant_id>", methods=["PUT", "OPTIONS"])
@require_admin("MANAGE_ADMIN_USERS")
def update_credit(restaurant_id):

    data = request.get_json() or {}

    credit_limit = float(data.get("credit_limit", 0))
    credit_days = int(data.get("credit_days", 0))
    is_blocked = bool(data.get("is_credit_blocked", False))

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE restaurant_registration
            SET credit_limit = %s,
                credit_days = %s,
                is_credit_blocked = %s,
                updated_at = NOW()
            WHERE restaurant_id = %s
        """, (credit_limit, credit_days, is_blocked, restaurant_id))

        conn.commit()

        # ✅ AUDIT
        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="UPDATE_CREDIT_SETTINGS",
            entity_type="restaurant_credit",
            entity_id=restaurant_id,
            new_value=data,
            ip_address=request.remote_addr
        )

        return jsonify({"success": True})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ======================================================
# ADJUST CREDIT
# ======================================================
# ======================================================
# ADJUST CREDIT (ADMIN PAYMENT)
# ======================================================
@admin_credit_bp.route("/adjust", methods=["POST", "OPTIONS"])
@require_admin("MANAGE_ADMIN_USERS")
def adjust_credit():

    try:
        restaurant_id = int(request.form.get("restaurant_id"))
        amount = float(request.form.get("amount", 0))

        if amount <= 0:
            return jsonify({"error": "Amount must be greater than 0"}), 400

    except Exception:
        return jsonify({"error": "Invalid amount"}), 400

    payment_mode = request.form.get("payment_mode", "CASH")
    remarks = request.form.get("remarks", "")

    receipt = request.files.get("receipt")

    receipt_data = None
    receipt_filename = None
    receipt_mimetype = None

    if receipt:
        receipt_data = receipt.read()
        receipt_filename = receipt.filename
        receipt_mimetype = receipt.mimetype

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # ✅ REDUCE ONLY PAID AMOUNT (SAFE — NEVER NEGATIVE)
        cur.execute("""
            UPDATE restaurant_registration
            SET credit_used = GREATEST(credit_used - %s, 0),
                updated_at = NOW()
            WHERE restaurant_id = %s
        """, (amount, restaurant_id))

        # ✅ SAVE TRANSACTION HISTORY
        cur.execute("""
            INSERT INTO restaurant_credit_transactions
            (
                restaurant_id,
                amount,
                type,
                payment_mode,
                remarks,
                receipt_file,
                receipt_filename,
                receipt_mimetype
            )
            VALUES (%s,%s,'PAYMENT',%s,%s,%s,%s,%s)
        """, (
            restaurant_id,
            amount,
            payment_mode,
            remarks,
            receipt_data,
            receipt_filename,
            receipt_mimetype
        ))

        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="ADJUST_CREDIT_PAYMENT",
            entity_type="restaurant_credit",
            entity_id=restaurant_id,
            new_value={
                "amount": amount,
                "payment_mode": payment_mode,
                "remarks": remarks
            },
            ip_address=request.remote_addr
        )

        return jsonify({"success": True})

    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# ======================================================
# SUMMARY
# ======================================================
@admin_credit_bp.route("/summary", methods=["GET", "OPTIONS"])
@require_admin("VIEW_DASHBOARD")
def credit_summary():

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                SUM(credit_limit) AS total_limit,
                SUM(credit_used) AS total_used,
                SUM(credit_limit - credit_used) AS total_available
            FROM restaurant_registration
            WHERE approval_status = 'Approved'
        """)

        summary = cur.fetchone() or {}

        cur.execute("""
            SELECT COUNT(*) AS overdue_count
            FROM order_header
            WHERE payment_method='CREDIT'
              AND payment_status='UNPAID'
              AND credit_due_date < CURRENT_DATE
        """)

        overdue = cur.fetchone()["overdue_count"]

        # ✅ AUDIT
        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="READ_ACCESS",
            entity_type="credit_summary",
            entity_id=0,
            ip_address=request.remote_addr
        )

        return jsonify({
            "total_limit": float(summary.get("total_limit") or 0),
            "total_used": float(summary.get("total_used") or 0),
            "total_available": float(summary.get("total_available") or 0),
            "overdue_accounts": int(overdue)
        })

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ======================================================
# LEDGER
# ======================================================
@admin_credit_bp.route("/ledger/<int:restaurant_id>", methods=["GET", "OPTIONS"])
@require_admin("VIEW_DASHBOARD")
def credit_ledger(restaurant_id):

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                id,
                restaurant_id,
                amount,
                type,
                payment_mode,
                remarks,
                COALESCE(receipt_filename, '') AS receipt_filename,
                created_at
            FROM restaurant_credit_transactions
            WHERE restaurant_id = %s

            UNION ALL

            SELECT
                settlement_id AS id,
                restaurant_id,
                amount,
                'SETTLEMENT' AS type,
                payment_mode,
                remarks,
                COALESCE(receipt_filename, '') AS receipt_filename,
                created_at
            FROM restaurant_credit_settlements
            WHERE restaurant_id = %s

            ORDER BY created_at DESC
        """, (restaurant_id, restaurant_id))

        rows = cur.fetchall() or []

        # ✅ AUDIT
        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="READ_ACCESS",
            entity_type="credit_ledger",
            entity_id=restaurant_id,
            ip_address=request.remote_addr
        )

        return jsonify(rows)

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ======================================================
# RECEIPT
# ======================================================
@admin_credit_bp.route("/receipt/<int:txn_id>", methods=["GET", "OPTIONS"])
@require_admin("VIEW_DASHBOARD")
def get_receipt(txn_id):

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT receipt_file, receipt_filename, receipt_mimetype
            FROM restaurant_credit_transactions
            WHERE id = %s
        """, (txn_id,))

        row = cur.fetchone()

        if not row or not row["receipt_file"]:
            return "No receipt", 404

        # ✅ AUDIT
        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="READ_ACCESS",
            entity_type="credit_receipt",
            entity_id=txn_id,
            ip_address=request.remote_addr
        )

        return send_file(
            io.BytesIO(row["receipt_file"]),
            download_name=row["receipt_filename"] or "receipt",
            mimetype=row["receipt_mimetype"] or "application/octet-stream"
        )

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@admin_credit_bp.route("/credit-orders/<int:restaurant_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def get_credit_orders(restaurant_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            oh.order_id,
            oh.order_date,
            oh.total_amount,
            oh.credit_due_date,
            
            r.restaurant_name_english,
            r.contact_person_name AS restaurant_contact,
            r.contact_person_mobile AS restaurant_mobile,
            r.city AS restaurant_city,
            r.address AS restaurant_address,
            r.credit_limit,
            r.credit_used,
            r.credit_days,

            COALESCE(oh.restaurant_paid_amount,0) AS paid_amount,
            (oh.total_amount - COALESCE(oh.restaurant_paid_amount,0)) AS due_amount,
            COALESCE(oh.restaurant_payment_status,'UNPAID') AS payment_status,

            s.company_name_english AS supplier_name,
            s.contact_person_name,
            s.contact_person_mobile,

            oi.product_name_english,
            oi.quantity,
            oi.price_per_unit,
            oi.total_amount AS item_total

        FROM order_header oh
        JOIN supplier_registration s
          ON s.supplier_id = oh.supplier_id
        JOIN restaurant_registration r
            ON r.restaurant_id = oh.restaurant_id
        JOIN order_items oi
          ON oi.order_id = oh.order_id

        WHERE oh.restaurant_id = %s
          AND LOWER(oh.payment_method) = 'credit'
          AND (oh.total_amount - COALESCE(oh.restaurant_paid_amount,0)) > 0

        ORDER BY oh.order_date DESC
    """, (restaurant_id,))

    rows = cur.fetchall()

    orders = {}

    for r in rows:

        oid = r["order_id"]

        if oid not in orders:
            orders[oid] = {
                "order_id": oid,
                "order_date": r["order_date"],
                "total_amount": float(r["total_amount"]),
                "paid_amount": float(r["paid_amount"]),
                "due_amount": float(r["due_amount"]),
                "payment_status": r["payment_status"],
                "credit_due_date": r["credit_due_date"],
                "supplier_name": r["supplier_name"],
                "contact_person_name": r["contact_person_name"],
                "contact_person_mobile": r["contact_person_mobile"],
                "restaurant_name": r["restaurant_name_english"],
                "restaurant_contact": r["restaurant_contact"],
                "restaurant_mobile": r["restaurant_mobile"],
                "restaurant_city": r["restaurant_city"],
                "restaurant_address": r["restaurant_address"],
                "credit_limit": float(r["credit_limit"] or 0),
                "credit_used": float(r["credit_used"] or 0),
                "credit_days": r["credit_days"],
                "items": []
            }

        orders[oid]["items"].append({
            "product_name": r["product_name_english"],
            "qty": r["quantity"],
            "price": float(r["price_per_unit"]),
            "total": float(r["item_total"])
        })

    cur.close()
    conn.close()

    return jsonify(list(orders.values()))

@admin_credit_bp.route("/settle-orders", methods=["POST"])
@require_admin("MANAGE_ADMIN_USERS")
def settle_orders():

    restaurant_id = int(request.form.get("restaurant_id"))
    order_ids = json.loads(request.form.get("order_ids") or "[]")

    payment_mode = request.form.get("payment_mode", "BANK")
    reference_no = request.form.get("reference_no")
    remarks = request.form.get("remarks")

    amount_received = float(request.form.get("amount") or 0)


    receipt = request.files.get("receipt")

    receipt_data = None
    receipt_filename = None
    receipt_mimetype = None

    if receipt:
        receipt_data = receipt.read()
        receipt_filename = receipt.filename
        receipt_mimetype = receipt.mimetype

    if not order_ids:
        return jsonify({"error": "No orders selected"}), 400

    if amount_received <= 0:
        return jsonify({"error": "Amount must be > 0"}), 400


    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        remaining_amount = amount_received
        total_settled = 0

        for oid in order_ids:

            if remaining_amount <= 0:
                break

            cur.execute("""
                SELECT
                    total_amount,
                    COALESCE(restaurant_paid_amount,0) AS paid
                FROM order_header
                WHERE order_id = %s
                FOR UPDATE
            """, (oid,))

            order_row = cur.fetchone()

            if not order_row:
                continue

            total_amt = float(order_row["total_amount"] or 0)
            paid_amt = float(order_row["paid"] or 0)

            due_amt = total_amt - paid_amt

            # how much we can pay for this order
            pay_now = min(due_amt, remaining_amount)

            new_paid = paid_amt + pay_now
            new_due = total_amt - new_paid

            # decide status
            if new_due == 0:
                status = "PAID"
                credit_status = "SETTLED"
            else:
                status = "PARTIAL"
                credit_status = "PARTIAL"

            cur.execute("""
                UPDATE order_header
                SET
                    restaurant_paid_amount = %s,
                    restaurant_due_amount = %s,
                    restaurant_payment_status = %s,
                    payment_status = %s,
                    credit_status = %s,
                    updated_at = NOW()
                WHERE order_id = %s
            """, (
                new_paid,
                new_due,
                status,
                status,
                credit_status,
                oid
            ))

            remaining_amount -= pay_now
            total_settled += pay_now


        # reduce restaurant credit used
        cur.execute("""
            UPDATE restaurant_registration
            SET credit_used = GREATEST(COALESCE(credit_used,0) - %s, 0)
            WHERE restaurant_id = %s
        """, (total_settled, restaurant_id))


        # save settlement
        cur.execute("""
            INSERT INTO restaurant_credit_settlements
            (
                restaurant_id,
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
            RETURNING settlement_id
        """, (
            restaurant_id,
            json.dumps(order_ids),
            total_settled,
            payment_mode,
            reference_no,
            remarks,
            receipt_data,
            receipt_filename,
            receipt_mimetype,
            g.admin["admin_id"]
        ))

        settlement_id = cur.fetchone()["settlement_id"]


        # ledger entry
        # cur.execute("""
        #     INSERT INTO restaurant_credit_transactions
        #     (
        #         restaurant_id,
        #         amount,
        #         type,
        #         payment_mode,
        #         remarks
        #     )
        #     VALUES (%s,%s,'SETTLEMENT',%s,%s)
        # """, (    
        #     restaurant_id,
        #     total_settled,
        #     payment_mode,
        #     remarks
        # ))

        # ===============================
        # 🔔 CREATE RESTAURANT NOTIFICATION
        # ===============================
        cur.execute("""
            INSERT INTO restaurant_notifications
            (
                restaurant_id,
                title,
                message,
                type,
                reference_id
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            restaurant_id,
            "Payment Settled",
            f"Payment of QAR {total_settled:.2f} received. {len(order_ids)} orders updated.",
            "PAYMENT_SETTLED",
            str(settlement_id)
        ))

        conn.commit()

        return jsonify({
            "success": True,
            "settlement_id": settlement_id,
            "settled_amount": total_settled
        })

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

@admin_credit_bp.route("/receipt/order/<order_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def order_receipt(order_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT *
        FROM order_header
        WHERE order_id = %s
    """, (order_id,))

    order = cur.fetchone()

    cur.execute("""
        SELECT *
        FROM order_items
        WHERE order_id = %s
    """, (order_id,))

    items = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "order": order,
        "items": items
    })

@admin_credit_bp.route("/settlement-history/<int:restaurant_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def settlement_history(restaurant_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            settlement_id,
            order_ids,
            amount,
            payment_mode,
            reference_no,
            remarks,
            created_at
        FROM restaurant_credit_settlements
        WHERE restaurant_id = %s
        ORDER BY created_at DESC
    """, (restaurant_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)

@admin_credit_bp.route("/settlement-receipt/<int:settlement_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def settlement_receipt(settlement_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT receipt_file, receipt_filename, receipt_mimetype
        FROM restaurant_credit_settlements
        WHERE settlement_id = %s
    """, (settlement_id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row or not row["receipt_file"]:
        return jsonify({"error": "No receipt"}), 404

    return send_file(
        io.BytesIO(row["receipt_file"]),
        download_name=row["receipt_filename"],
        mimetype=row["receipt_mimetype"]
    )

@admin_credit_bp.route("/settlement-pdf/<int:settlement_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def settlement_pdf(settlement_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ---------------- SETTLEMENT ----------------
    cur.execute("""
        SELECT sc.*, r.restaurant_name_english
        FROM restaurant_credit_settlements sc
        JOIN restaurant_registration r
            ON r.restaurant_id = sc.restaurant_id
        WHERE sc.settlement_id = %s
    """, (settlement_id,))

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
                COALESCE(restaurant_due_amount,0) AS due
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
    # COMPANY HEADER
    # =====================================================

    header_data = [
        ["MAHAL"],
        ["RESTAURANT CREDIT SETTLEMENT RECEIPT"]
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
    # SETTLEMENT INFO
    # =====================================================

    info_data = [
        ["Restaurant", row["restaurant_name_english"]],
        ["Settlement ID", str(row["settlement_id"])],
        ["Date", str(row["created_at"])[:19]],
        ["Payment Mode", row["payment_mode"]],
        ["Reference No", row["reference_no"] if row["reference_no"] else "-"]
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

    elements.append(Paragraph("<b>Orders Settled</b>", styles["Heading3"]))
    elements.append(Spacer(1, 10))

    table_data = [["Order ID", "Total", "Paid", "Remaining"]] + order_rows

    orders_table = Table(table_data, colWidths=[120, 120, 120, 120])

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
    # TOTALS SECTION
    # =====================================================

    totals = [
        ["Previous Due", f"QAR  {previous_due:.2f}"],
        ["Amount Paid", f"QAR  {float(row['amount']):.2f}"],
        ["Remaining Due", f"QAR  {remaining_due:.2f}"]
    ]

    totals_table = Table(totals, colWidths=[250, 200])

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
        ["Authorized Signature", "", "Restaurant Signature"],
        ["__________________", "", "__________________"]
    ]

    sign_table = Table(sign_data, colWidths=[200, 100, 200])

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
            "This is a system generated settlement receipt.",
            styles["Normal"]
        )
    )


    doc.build(elements)

    buffer.seek(0)

    cur.close()
    conn.close()

    return send_file(
        buffer,
        download_name=f"Settlement_{settlement_id}.pdf",
        mimetype="application/pdf"
    )

@admin_credit_bp.route("/paid-credit-orders/<int:restaurant_id>", methods=["GET"])
@require_admin("VIEW_DASHBOARD")
def get_paid_credit_orders(restaurant_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            oh.order_id,
            oh.order_date,
            oh.total_amount,
            oh.restaurant_paid_amount AS paid_amount,
            0 AS due_amount,
            'PAID' AS payment_status,
            oh.credit_due_date,
            s.company_name_english AS supplier_name
        FROM order_header oh
        JOIN supplier_registration s
            ON s.supplier_id = oh.supplier_id
        WHERE oh.restaurant_id = %s
          AND LOWER(oh.payment_method) = 'credit'
          AND COALESCE(oh.restaurant_due_amount,0) = 0
        ORDER BY oh.order_date DESC
    """, (restaurant_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)