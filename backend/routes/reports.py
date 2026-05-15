from flask import Blueprint, request, jsonify, send_file
from psycopg2.extras import RealDictCursor
import jwt
import pandas as pd
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from db import get_db_connection
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
from reportlab.platypus import Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

# ✅ YOUR ARABIC SETUP
import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
font_path = os.path.join(BASE_DIR, "..", "fonts", "NotoSansArabic-Regular.ttf")

pdfmetrics.registerFont(TTFont('Arabic', font_path))

def fix_ar(text):
    if not text:
        return ""
    reshaped = arabic_reshaper.reshape(str(text))
    return get_display(reshaped)

# =====================================================
# CONFIG
# =====================================================
JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

reports_bp = Blueprint("reports_bp", __name__)

# =====================================================
# JWT HELPER (SUPPLIER ONLY)
# =====================================================
def get_supplier_from_token():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return None, ("Unauthorized", 401)

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if decoded.get("role") != "supplier":
            return None, ("Forbidden", 403)
        return decoded.get("linked_id"), None
    except jwt.ExpiredSignatureError:
        return None, ("Token expired", 401)
    except jwt.InvalidTokenError:
        return None, ("Invalid token", 401)

# =====================================================
# CORE INVENTORY REPORT QUERY
# =====================================================
def build_inventory_report_query(supplier_id, args):
    query = """
        SELECT
            product_id,
            product_name_english,
            product_name_arabic,
            stock_availability,
            minimum_order_quantity,
            price_per_unit,
            expiry_date,
            updated_at,

            CASE
                WHEN stock_availability = 0 THEN 'OUT_OF_STOCK'
                WHEN stock_availability < minimum_order_quantity THEN 'LOW_STOCK'
                ELSE 'IN_STOCK'
            END AS stock_status,

            CASE
                WHEN expiry_date IS NULL THEN 'NO_EXPIRY'
                WHEN expiry_date < CURRENT_DATE THEN 'EXPIRED'
                WHEN expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'EXPIRING_SOON'
                ELSE 'VALID'
            END AS expiry_status

        FROM product_management
        WHERE supplier_id = %s
          AND flag = 'A'
    """
    params = [supplier_id]

    # -------- STOCK FILTER --------
    stock = args.get("stock")
    if stock == "OUT_OF_STOCK":
        query += " AND stock_availability = 0"
    elif stock == "LOW_STOCK":
        query += " AND stock_availability > 0 AND stock_availability < minimum_order_quantity"
    elif stock == "IN_STOCK":
        query += " AND stock_availability >= minimum_order_quantity"

    # -------- EXPIRY FILTER --------
    expiry = args.get("expiry")
    if expiry == "EXPIRED":
        query += " AND expiry_date < CURRENT_DATE"
    elif expiry == "EXPIRING_SOON":
        query += " AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'"
    elif expiry == "VALID":
        query += " AND expiry_date > CURRENT_DATE + INTERVAL '7 days'"
    elif expiry == "NO_EXPIRY":
        query += " AND expiry_date IS NULL"

    query += " ORDER BY updated_at DESC"

    return query, params


# =====================================================
# 1️⃣ INVENTORY REPORT (JSON FOR UI)
# =====================================================
@reports_bp.route("/inventory", methods=["GET"])
def inventory_report():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    query, params = build_inventory_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200


# =====================================================
# 2️⃣ INVENTORY REPORT — EXCEL DOWNLOAD (FIXED)
# =====================================================
@reports_bp.route("/inventory/excel", methods=["GET"])
def inventory_report_excel():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    query, params = build_inventory_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return jsonify({"error": "No data for selected filters"}), 404

    df = pd.DataFrame.from_records(rows)

    output = BytesIO()
    df.to_excel(output, index=False, sheet_name="Inventory Report")
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name="inventory_report.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

# ================= COMMON TABLE LAYOUT =================
TABLE_TOP_Y = 70
ROW_HEIGHT = 14
HEADER_FONT_SIZE = 9
BODY_FONT_SIZE = 9
LEFT_MARGIN = 40
RIGHT_MARGIN = 40

# =====================================================
# 3️⃣ INVENTORY REPORT — PDF DOWNLOAD (FIXED)
# =====================================================
@reports_bp.route("/inventory/pdf", methods=["GET"])
def inventory_report_pdf():

    def ar_para(text):
        return Paragraph(fix_ar(str(text or "-")), arabic_style)

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    # ✅ LANGUAGE
    lang = request.args.get("lang", "en")
    is_arabic = lang.startswith("ar")

    query, params = build_inventory_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return jsonify({"error": "No data for selected filters"}), 404

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20,
        leftMargin=20,
        topMargin=40,
        bottomMargin=20
    )

    styles = getSampleStyleSheet()
    elements = []

    # ✅ Arabic style
    arabic_style = ParagraphStyle(
        name="ArabicNormal",
        parent=styles["Normal"],
        fontName="Arabic",
        alignment=2,
        wordWrap="CJK"
    )

    # ================= TITLE =================
    title = "تقرير المخزون" if is_arabic else "Inventory Report"
    title = fix_ar(title) if is_arabic else title

    title_style = ParagraphStyle(
        name="ArabicTitle",
        parent=styles["Title"],
        fontName="Arabic",
        alignment=2
    ) if is_arabic else styles["Title"]

    elements.append(Paragraph(f"<b>{title}</b>", title_style))
    elements.append(Spacer(1, 16))

    # ================= HEADERS =================
    if is_arabic:
        headers = [
            ar_para("المنتج"),
            ar_para("المخزون"),
            ar_para("الحد الأدنى"),
            ar_para("السعر"),
            ar_para("حالة المخزون"),
            ar_para("حالة الصلاحية"),
            ar_para("آخر تحديث"),
        ]
    else:
        headers = [
            "Product", "Stock", "Min Qty", "Price",
            "Stock Status", "Expiry Status", "Updated"
        ]

    table_data = [headers]

    # ✅ STATUS MAP (Arabic)
    stock_map = {
        "IN_STOCK": "متوفر",
        "LOW_STOCK": "مخزون منخفض",
        "OUT_OF_STOCK": "غير متوفر"
    }

    expiry_map = {
        "VALID": "صالح",
        "EXPIRING_SOON": "ينتهي قريباً",
        "EXPIRED": "منتهي",
        "NO_EXPIRY": "بدون تاريخ انتهاء"
    }

    # ================= DATA =================
    for r in rows:
        table_data.append([
            ar_para(r["product_name_arabic"]) if is_arabic
            else r["product_name_english"],

            r["stock_availability"],
            r["minimum_order_quantity"],
            r["price_per_unit"],

            ar_para(stock_map.get(r["stock_status"], r["stock_status"])) if is_arabic
            else r["stock_status"],

            ar_para(expiry_map.get(r["expiry_status"], r["expiry_status"])) if is_arabic
            else r["expiry_status"],

            r["updated_at"].strftime("%Y-%m-%d") if r["updated_at"] else "-"
        ])

    # ✅ RTL FIX
    if is_arabic:
        table_data = [row[::-1] for row in table_data]

    table = Table(
        table_data,
        colWidths=[120, 50, 55, 55, 80, 90, 60]
    )

    table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),

        ("FONTNAME", (0,0), (-1,-1), "Arabic" if is_arabic else "Helvetica"),
        ("FONTSIZE", (0,0), (-1,-1), 9),

        ("ALIGN", (0,0), (-1,-1), "RIGHT" if is_arabic else "CENTER"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))

    elements.append(table)
    doc.build(elements)

    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="inventory_report.pdf",
        mimetype="application/pdf"
    )

def build_product_report_query(supplier_id, args):
    query = """
        SELECT
            pm.product_id,
            pm.supplier_id,
            sr.company_name_english,
            sr.company_name_arabic,
            pm.branch_name_english,
            pm.store_name_english,
            pm.product_name_english,
            pm.product_name_arabic,
            pm.unit_of_measure,
            pm.currency,
            pm.price_per_unit,
            pm.minimum_order_quantity,
            pm.stock_availability,
            pm.product_status,
            pm.flag,
            pm.category_id,
            pm.sub_category_id,
            pm.description,
            pm.expiry_date,
            pm.shelf_life,
            pm.expiry_time,
            pm.low_stock_alert_sent,
            pm.out_of_stock_alert_sent,
            pm.created_at,
            pm.updated_at
        FROM product_management pm
        JOIN supplier_registration sr 
        ON pm.supplier_id = sr.supplier_id
        WHERE pm.supplier_id = %s
    """
    params = [supplier_id]

    # -------- STATUS FILTER --------
    status = args.get("status")
    if status and status != "ALL":
        query += " AND product_status = %s"
        params.append(status)

    # -------- ACTIVE FILTER --------
    active = args.get("active")
    if active == "ACTIVE":
        query += " AND flag = 'A'"
    elif active == "INACTIVE":
        query += " AND flag = 'D'"

    # -------- PRODUCT NAME --------
    name = args.get("name")
    if name:
        query += " AND LOWER(product_name_english) LIKE %s"
        params.append(f"%{name.lower()}%")

    # -------- STOCK RANGE --------
    min_stock = args.get("minStock")
    max_stock = args.get("maxStock")

    if min_stock:
        query += " AND stock_availability >= %s"
        params.append(int(min_stock))

    if max_stock:
        query += " AND stock_availability <= %s"
        params.append(int(max_stock))

    # -------- STOCK TYPE --------
    stock = args.get("stock")
    if stock == "OUT_OF_STOCK":
        query += " AND stock_availability = 0"
    elif stock == "LOW_STOCK":
        query += " AND stock_availability > 0 AND stock_availability <= minimum_order_quantity"
    elif stock == "IN_STOCK":
        query += " AND stock_availability > minimum_order_quantity"

    query += " ORDER BY created_at DESC"

    return query, params

@reports_bp.route("/products", methods=["GET"])
def product_report():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    query, params = build_product_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200




@reports_bp.route("/products/excel", methods=["GET"])
def product_report_excel():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    query, params = build_product_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return jsonify({"error": "No product data"}), 404

    df = pd.DataFrame.from_records(rows)

    output = BytesIO()
    df.to_excel(output, index=False, sheet_name="Product Report")
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name="product_report.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )



@reports_bp.route("/products/pdf", methods=["GET"])
def product_report_pdf():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    # ✅ LANGUAGE
    lang = request.args.get("lang", "en")
    is_arabic = lang.startswith("ar")

    query, params = build_product_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return jsonify({"error": "No data for selected filters"}), 404

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20,
        rightMargin=20,
        topMargin=40,
        bottomMargin=20
    )

    elements = []
    styles = getSampleStyleSheet()

    # ✅ TITLE STYLE FIX (IMPORTANT 🔥)
    arabic_title_style = ParagraphStyle(
        name="ArabicTitle",
        parent=styles["Title"],
        fontName="Arabic",
        alignment=2  # RIGHT ALIGN
    )

    title = "تقرير المنتجات" if is_arabic else "Product Report"
    title = fix_ar(title) if is_arabic else title

    elements.append(
        Paragraph(
            f"<b>{title}</b>",
            arabic_title_style if is_arabic else styles["Title"]
        )
    )
    elements.append(Spacer(1, 16))

    # ✅ HEADERS
    if is_arabic:
        headers = [
            fix_ar("المنتج"),
            fix_ar("السعر"),
            fix_ar("الوحدة"),
            fix_ar("المخزون"),
            fix_ar("الحالة"),
            fix_ar("نشط"),
            fix_ar("تاريخ الإنشاء"),
        ]
    else:
        headers = ["Product", "Price", "UOM", "Stock", "Status", "Active", "Created"]

    table_data = [headers]

    # ✅ STATUS TRANSLATION
    status_map = {
        "Pending Approval": "قيد الموافقة",
        "Approved": "تمت الموافقة"
    }

    # ✅ DATA
    for r in rows:
        status = r["product_status"] or "-"

        if is_arabic:
            status = fix_ar(status_map.get(status, status))

        table_data.append([
            fix_ar(r["product_name_arabic"]) if is_arabic else r["product_name_english"],
            r["price_per_unit"] or "-",
            r["unit_of_measure"] or "-",
            r["stock_availability"] or 0,
            status,
            fix_ar("نعم") if (is_arabic and r["flag"] == "A") else ("Yes" if r["flag"] == "A" else "No"),
            r["created_at"].strftime("%Y-%m-%d") if r["created_at"] else "-"
        ])

    # ✅ RTL FIX
    if is_arabic:
        table_data = [row[::-1] for row in table_data]

    table = Table(
        table_data,
        repeatRows=1,
        colWidths = [150, 70, 60, 60, 100, 60, 80] if not is_arabic else [100, 80, 70, 70, 110, 50, 70]
    )

    # ✅ TABLE STYLE
    table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
        ("FONTNAME", (0,0), (-1,-1), "Arabic" if is_arabic else "Helvetica"),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("ALIGN", (0,0), (-1,-1), "RIGHT" if is_arabic else "CENTER"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
       
    ]))

    elements.append(table)
    doc.build(elements)

    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="product_report.pdf",
        mimetype="application/pdf"
    )

def build_order_report_query(supplier_id, args):
    query = """
        SELECT
    oh.order_id,
    oh.order_date,
    oh.expected_delivery_date,
    oh.status AS order_status,
    oh.payment_status,
    oh.total_amount AS order_total,

    oi.product_id,                       -- ✅ ADD THIS LINE
    oi.product_name_english,
    pm.product_name_arabic,
    oi.quantity,
    oi.price_per_unit,
    oi.discount,
    oi.total_amount AS item_total
FROM order_header oh
JOIN order_items oi ON oi.order_id = oh.order_id
JOIN product_management pm   -- 🔥 IMPORTANT JOIN
    ON pm.product_id = oi.product_id
WHERE oh.supplier_id = %s

    """
    params = [supplier_id]

    # -------- ORDER ID --------
    order_id = args.get("orderId")
    if order_id and order_id != "ALL":
        query += " AND oh.order_id = %s"
        params.append(order_id)

    # -------- STATUS --------
    status = args.get("status")
    if status and status != "ALL":
        query += " AND oh.status = %s"
        params.append(status)

    # -------- PAYMENT --------
    payment = args.get("payment")
    if payment and payment != "ALL":
        query += " AND oh.payment_status = %s"
        params.append(payment)

    # -------- PRODUCT --------
    product = args.get("product")
    if product and product != "ALL":
        query += " AND oi.product_name_english = %s"
        params.append(product)

    query += " ORDER BY oh.order_date DESC"

    return query, params

@reports_bp.route("/orders", methods=["GET"])
def order_report():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    query, params = build_order_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200


@reports_bp.route("/orders/pdf", methods=["GET"])
def order_report_pdf():

    def ar_para(text):
        return Paragraph(fix_ar(str(text or "-")), arabic_style)

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    # ✅ LANGUAGE
    lang = request.args.get("lang", "en")
    is_arabic = lang.startswith("ar")

    query, params = build_order_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return jsonify({"error": "No order data for selected filters"}), 404

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=20,
        rightMargin=20,
        topMargin=30,
        bottomMargin=20
    )

    styles = getSampleStyleSheet()
    elements = []

    # ✅ Arabic style
    arabic_style = ParagraphStyle(
        name="ArabicNormal",
        parent=styles["Normal"],
        fontName="Arabic",
        alignment=2,
        wordWrap="CJK"
    )

    # ================= TITLE =================
    title = "تقرير الطلبات" if is_arabic else "Order Report"
    title = fix_ar(title) if is_arabic else title

    title_style = ParagraphStyle(
        name="ArabicTitle",
        parent=styles["Title"],
        fontName="Arabic",
        alignment=2
    ) if is_arabic else styles["Title"]

    elements.append(Paragraph(f"<b>{title}</b>", title_style))
    elements.append(Spacer(1, 14))

    # ================= HEADERS =================
    if is_arabic:
        headers = [
            ar_para("رقم الطلب"),
            ar_para("التاريخ"),
            ar_para("الحالة"),
            ar_para("الدفع"),
            ar_para("المنتج"),
            ar_para("الكمية"),
            ar_para("السعر"),
            ar_para("الإجمالي"),
        ]
    else:
        headers = [
            "Order ID", "Order Date", "Status", "Payment",
            "Product", "Qty", "Price", "Line Total"
        ]

    table_data = [headers]

    # ================= DATA =================
    for r in rows:
        table_data.append([
            r["order_id"],
            r["order_date"].strftime("%Y-%m-%d"),

            ar_para(r["order_status"]) if is_arabic else r["order_status"],
            ar_para(r["payment_status"]) if is_arabic else r["payment_status"],

            ar_para(r["product_name_arabic"]) if is_arabic
            else Paragraph(r["product_name_english"] or "-", styles["Normal"]),

            r["quantity"],
            f"{r['price_per_unit']:.2f}",
            f"{r['item_total']:.2f}",
        ])

    # ✅ RTL
    if is_arabic:
        table_data = [row[::-1] for row in table_data]

    table = Table(
        table_data,
        colWidths=[110, 90, 80, 80, 120, 50, 70, 110]
    )

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),

        ("FONTNAME", (0, 0), (-1, -1), "Arabic" if is_arabic else "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),

        ("ALIGN", (0, 0), (-1, -1), "RIGHT" if is_arabic else "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))

    elements.append(table)
    doc.build(elements)
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="order_report.pdf",
        mimetype="application/pdf"
    )

@reports_bp.route("/orders/excel", methods=["GET"])
def order_report_excel():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    query, params = build_order_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return jsonify({"error": "No order data for selected filters"}), 404

    df = pd.DataFrame.from_records(rows)

    output = BytesIO()
    df.to_excel(output, index=False, sheet_name="Order Report")
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name="order_report.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )



# =====================================================
# INVOICE REPORT QUERY
# =====================================================
def build_invoice_report_query(supplier_id, args):
    query = """
        SELECT
            ih.invoice_id,
            ih.invoice_number,
            ih.order_id,
            ih.invoice_date,
            ih.invoice_status,
            ih.payment_status,
            ih.subtotal_amount,
            ih.tax_amount,
            ih.grand_total,

            rr.restaurant_name_english,
            rr.restaurant_name_arabic,

            ii.product_name_english,
            pm.product_name_arabic,
            ii.quantity,
            ii.price_per_unit,
            ii.discount,
            ii.total_amount AS item_total
        FROM invoice_header ih
        JOIN invoice_items ii
            ON ii.invoice_id = ih.invoice_id
        LEFT JOIN product_management pm   -- ✅ IMPORTANT (LEFT JOIN safer)
            ON pm.product_id = ii.product_id
        JOIN restaurant_registration rr
            ON rr.restaurant_id = ih.restaurant_id
        WHERE ih.supplier_id = %s
    """
    params = [supplier_id]

    # -------- INVOICE NUMBER --------
    invoice = args.get("invoice")
    if invoice and invoice != "ALL":
        query += " AND ih.invoice_number = %s"
        params.append(invoice)

    # -------- STATUS --------
    status = args.get("status")
    if status and status != "ALL":
        query += " AND ih.invoice_status = %s"
        params.append(status)

    query += " ORDER BY ih.invoice_date DESC"

    return query, params

@reports_bp.route("/invoices", methods=["GET"])
def invoice_report():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    query, params = build_invoice_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200


@reports_bp.route("/invoices/excel", methods=["GET"])
def invoice_report_excel():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    query, params = build_invoice_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return jsonify({"error": "No invoice data for selected filters"}), 404

    df = pd.DataFrame.from_records(rows)

    df = df[[
        "invoice_number",
        "order_id",
        "invoice_date",
        "restaurant_name_english",
        "product_name_english",
        "quantity",
        "price_per_unit",
        "discount",
        "item_total",
        "subtotal_amount",
        "tax_amount",
        "grand_total",
        "invoice_status",
        "payment_status"
    ]]

    df.rename(columns={
        "invoice_number": "Invoice No",
        "order_id": "Order ID",
        "invoice_date": "Invoice Date",
        "restaurant_name_english": "Restaurant",
        "product_name_english": "Product",
        "quantity": "Qty",
        "price_per_unit": "Price",
        "discount": "Discount",
        "item_total": "Item Total",
        "subtotal_amount": "Subtotal",
        "tax_amount": "Tax",
        "grand_total": "Grand Total",
        "invoice_status": "Invoice Status",
        "payment_status": "Payment Status"
    }, inplace=True)


    output = BytesIO()
    df.to_excel(output, index=False, sheet_name="Invoice Report")
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name="invoice_report.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
@reports_bp.route("/invoices/pdf", methods=["GET"])
def invoice_report_pdf():

    # ================= HELPERS =================
    def wrap(text, style):
        return Paragraph(str(text or "-"), style)

    def ar_para(text):
        return Paragraph(fix_ar(str(text or "-")), arabic_style)

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    # ================= LANGUAGE =================
    lang = request.args.get("lang", "en")
    is_arabic = lang.startswith("ar")

    query, params = build_invoice_report_query(supplier_id, request.args)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        return jsonify({"error": "No invoice data for selected filters"}), 404

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=30,
        rightMargin=30,
        topMargin=30,
        bottomMargin=20
    )

    styles = getSampleStyleSheet()
    elements = []

    # ================= ARABIC STYLE =================
    arabic_style = ParagraphStyle(
        name="ArabicNormal",
        parent=styles["Normal"],
        fontName="Arabic",   # 🔥 MUST
        alignment=2,         # RIGHT
        wordWrap="CJK"
    )

    # ================= TITLE =================
    title = "تقرير الفواتير" if is_arabic else "Invoice Report"
    title = fix_ar(title) if is_arabic else title

    title_style = ParagraphStyle(
        name="ArabicTitle",
        parent=styles["Title"],
        fontName="Arabic",
        alignment=2
    ) if is_arabic else styles["Title"]

    elements.append(Paragraph(f"<b>{title}</b>", title_style))
    elements.append(Spacer(1, 16))

    # ================= HEADERS =================
    if is_arabic:
        headers = [
            ar_para("رقم الفاتورة"),
            ar_para("رقم الطلب"),
            ar_para("التاريخ"),
            ar_para("المطعم"),
            ar_para("المنتج"),
            ar_para("الكمية"),
            ar_para("السعر"),
            ar_para("الخصم"),
            ar_para("إجمالي العنصر"),
            ar_para("المجموع الفرعي"),
            ar_para("الضريبة"),
            ar_para("الإجمالي"),
            ar_para("الحالة"),
            ar_para("الدفع"),
        ]
    else:
        headers = [
            "Invoice No", "Order ID", "Date", "Restaurant", "Product",
            "Qty", "Price", "Discount", "Item Total",
            "Subtotal", "Tax", "Grand Total", "Status", "Payment"
        ]

    table_data = [headers]

    # ================= DATA =================
    for r in rows:
        table_data.append([
            wrap(r["invoice_number"], styles["Normal"]),
            wrap(r["order_id"], styles["Normal"]),
            r["invoice_date"].strftime("%Y-%m-%d") if r["invoice_date"] else "-",

            # 🔥 RESTAURANT
            ar_para(r["restaurant_name_arabic"]) if is_arabic
            else Paragraph(r["restaurant_name_english"] or "-", styles["Normal"]),

            # 🔥 PRODUCT
            ar_para(r["product_name_arabic"]) if is_arabic
            else Paragraph(r["product_name_english"] or "-", styles["Normal"]),

            r["quantity"] or 0,
            f"{r['price_per_unit']:.2f}",
            f"{r['discount']:.2f}",
            f"{r['item_total']:.2f}",
            f"{r['subtotal_amount']:.2f}",
            f"{r['tax_amount']:.2f}",
            f"{r['grand_total']:.2f}",

            ar_para(r["invoice_status"]) if is_arabic else r["invoice_status"],
            ar_para(r["payment_status"]) if is_arabic else r["payment_status"],
        ])

    # ================= RTL FIX =================
    if is_arabic:
        table_data = [row[::-1] for row in table_data]

    # ================= TABLE =================
    table = Table(
        table_data,
        repeatRows=1,
        colWidths=[
            80, 85, 60, 90, 80, 35, 45, 40,
            50, 50, 40, 60, 55, 50
        ]
    )

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),

        ("FONTNAME", (0, 0), (-1, -1), "Arabic" if is_arabic else "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),

        ("ALIGN", (0, 0), (-1, -1), "RIGHT" if is_arabic else "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),

        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))

    elements.append(table)

    # ================= BUILD =================
    doc.build(elements)
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="invoice_report.pdf",
        mimetype="application/pdf"
    )