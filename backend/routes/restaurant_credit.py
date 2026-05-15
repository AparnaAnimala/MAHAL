from flask import Blueprint, jsonify
from psycopg2.extras import RealDictCursor
from db import get_db_connection
from routes.restaurantOrder import get_restaurant_from_token
from flask import send_file
import io
import json
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
restaurant_credit_bp = Blueprint(
    "restaurant_credit_bp",
    __name__,
    url_prefix="/api/restaurant/credit"
)

# =================================================
# CREDIT SUMMARY
# =================================================
@restaurant_credit_bp.route("/summary", methods=["GET"])
def credit_summary():

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            credit_limit,
            credit_used,
            credit_days,
            (credit_limit - credit_used) AS credit_available
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    return jsonify(row or {})

@restaurant_credit_bp.route("/orders", methods=["GET"])
def credit_orders():

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            order_id,
            order_date,
            total_amount,
            restaurant_due_amount,
            credit_due_date,
            restaurant_payment_status
        FROM order_header
        WHERE restaurant_id = %s
        AND LOWER(payment_method) = 'credit'
        ORDER BY order_date DESC
    """, (restaurant_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows or [])

@restaurant_credit_bp.route("/settlements", methods=["GET"])
def settlement_history():

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

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

    return jsonify(rows or [])

# =================================================
# GET RECEIPT FILE
# =================================================
@restaurant_credit_bp.route("/receipt/<int:settlement_id>", methods=["GET"])
def get_receipt(settlement_id):

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            receipt_file,
            receipt_filename,
            receipt_mimetype
        FROM restaurant_credit_settlements
        WHERE settlement_id = %s
        AND restaurant_id = %s
    """, (settlement_id, restaurant_id))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row or not row["receipt_file"]:
        return jsonify({"error": "Receipt not found"}), 404

    return send_file(
        io.BytesIO(row["receipt_file"]),
        mimetype=row["receipt_mimetype"] or "application/octet-stream",
        as_attachment=True,
        download_name=row["receipt_filename"] or f"receipt_{settlement_id}"
    )


# =================================================
# SETTLEMENT PDF (Restaurant Download)
# =================================================
@restaurant_credit_bp.route("/settlement-pdf/<int:settlement_id>", methods=["GET"])
def settlement_pdf(settlement_id):

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ---------------- SETTLEMENT ----------------
    cur.execute("""
        SELECT sc.*, r.restaurant_name_english
        FROM restaurant_credit_settlements sc
        JOIN restaurant_registration r
            ON r.restaurant_id = sc.restaurant_id
        WHERE sc.settlement_id = %s
        AND sc.restaurant_id = %s
    """, (settlement_id, restaurant_id))

    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return jsonify({"error": "Settlement not found"}), 404


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
    # TOTALS SECTION
    # =====================================================

    totals = [
        ["Previous Due", f"QAR  {previous_due:.2f}"],
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
        ["Authorized Signature", "", "Restaurant Signature"],
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