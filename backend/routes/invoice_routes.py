# # ============================================================
# # 📘 INVOICE ROUTES + PDF GENERATOR (PRODUCTION READY)
# # ============================================================

# from flask import Blueprint, jsonify, request, send_file
# from db import get_db_connection
# from datetime import datetime
# from psycopg2.extras import RealDictCursor
# import io

# # PDF
# from reportlab.platypus import (
#     SimpleDocTemplate,
#     Paragraph,
#     Table,
#     TableStyle,
#     Spacer
# )
# from reportlab.lib.pagesizes import A4
# from reportlab.lib.styles import getSampleStyleSheet
# from reportlab.lib import colors

# from routes.orders_routes import get_supplier_from_token


# invoice_bp = Blueprint(
#     "invoice_bp",
#     __name__,
#     url_prefix="/api/v1/invoice"
# )

# # ============================================================
# # UTIL: INVOICE NUMBER
# # ============================================================
# def generate_invoice_number(cur):
#     cur.execute("""
#         SELECT invoice_number
#         FROM invoice_header
#         ORDER BY created_at DESC
#         LIMIT 1
#     """)
#     row = cur.fetchone()

#     year = datetime.now().year
#     seq = int(row["invoice_number"].split("-")[-1]) + 1 if row else 1
#     return f"INV-{year}-{seq:05d}"


# # ============================================================
# # 1️⃣ GENERATE INVOICE (FROM ORDER – IDEMPOTENT)
# # ============================================================
# @invoice_bp.route("/generate/<order_id>", methods=["POST"])
# def generate_invoice(order_id):
#     supplier_id, err = get_supplier_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # Validate order ownership
#         cur.execute("""
#             SELECT *
#             FROM order_header
#             WHERE order_id = %s
#               AND supplier_id = %s
#         """, (order_id, supplier_id))
#         order = cur.fetchone()

#         if not order:
#             return jsonify({"error": "Unauthorized or order not found"}), 403

#         # Idempotency
#         cur.execute("""
#             SELECT invoice_id, invoice_number
#             FROM invoice_header
#             WHERE order_id = %s
#         """, (order_id,))
#         existing = cur.fetchone()

#         if existing:
#             return jsonify({
#                 "invoice_id": existing["invoice_id"],
#                 "invoice_number": existing["invoice_number"],
#                 "message": "Invoice already exists"
#             }), 200

#         invoice_id = f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}"
#         invoice_number = generate_invoice_number(cur)

#         # Insert header
#         cur.execute("""
#             INSERT INTO invoice_header (
#                 invoice_id,
#                 invoice_number,
#                 order_id,
#                 supplier_id,
#                 restaurant_id,
#                 subtotal_amount,
#                 discount_amount,
#                 tax_amount,
#                 grand_total,
#                 invoice_status,
#                 payment_status,
#                 invoice_date
#             )
#             VALUES (%s,%s,%s,%s,%s,%s,0,0,%s,'GENERATED','UNPAID',NOW())
#         """, (
#             invoice_id,
#             invoice_number,
#             order["order_id"],
#             supplier_id,
#             order["restaurant_id"],
#             order["total_amount"],
#             order["total_amount"]
#         ))

#         # Copy items
#         cur.execute("""
#             SELECT *
#             FROM order_items
#             WHERE order_id = %s
#         """, (order_id,))
#         items = cur.fetchall()

#         for i in items:
#             cur.execute("""
#                 INSERT INTO invoice_items (
#                     invoice_id,
#                     order_item_id,
#                     product_id,
#                     product_name_english,
#                     quantity,
#                     price_per_unit,
#                     discount,
#                     total_amount
#                 )
#                 VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
#             """, (
#                 invoice_id,
#                 i["item_id"],
#                 i["product_id"],
#                 i["product_name_english"],
#                 i["quantity"],
#                 i["price_per_unit"],
#                 i["discount"],
#                 i["total_amount"]
#             ))

#         conn.commit()

#         return jsonify({
#             "invoice_id": invoice_id,
#             "invoice_number": invoice_number,
#             "message": "Invoice generated successfully"
#         }), 201

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()


# # ============================================================
# # 2️⃣ GET SUPPLIER INVOICES (LIST)
# # ============================================================
# @invoice_bp.route("", methods=["GET"])
# def get_invoices():
#     supplier_id, err = get_supplier_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             ih.invoice_id,
#             ih.invoice_number,
#             ih.order_id,
#             rr.restaurant_name_english,
#             ih.invoice_date,
#             ih.grand_total,
#             ih.invoice_status
#         FROM invoice_header ih
#         JOIN restaurant_registration rr
#             ON rr.restaurant_id = ih.restaurant_id
#         WHERE ih.supplier_id = %s
#         ORDER BY ih.created_at DESC
#     """, (supplier_id,))

#     rows = cur.fetchall()
#     cur.close()
#     conn.close()

#     return jsonify(rows), 200


# # ============================================================
# # 3️⃣ GET FULL INVOICE DETAILS
# # ============================================================
# @invoice_bp.route("/<invoice_id>", methods=["GET"])
# def get_invoice_details(invoice_id):
#     supplier_id, err = get_supplier_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             ih.*,
#             rr.restaurant_name_english,
#             rs.contact_person_name   AS restaurant_contact_name,
#             rs.contact_person_mobile AS restaurant_contact_mobile,
#             rs.email                 AS restaurant_email,
#             rs.street                AS restaurant_street,
#             rs.zone                  AS restaurant_zone,
#             rs.building              AS restaurant_building,
#             rs.shop_no               AS restaurant_shop_no,
#             ss.store_name_english    AS supplier_store,
#             ss.contact_person_name   AS supplier_contact_name,
#             ss.contact_person_mobile AS supplier_contact_mobile,
#             ss.email                 AS supplier_email,
#             ss.street                AS supplier_street,
#             ss.zone                  AS supplier_zone,
#             ss.building              AS supplier_building,
#             ss.shop_no               AS supplier_shop_no
#         FROM invoice_header ih
#         JOIN restaurant_registration rr
#             ON rr.restaurant_id = ih.restaurant_id
#         LEFT JOIN restaurant_store_registration rs
#             ON rs.restaurant_id = ih.restaurant_id
#         LEFT JOIN supplier_store_registration ss
#             ON ss.supplier_id = ih.supplier_id
#         WHERE ih.invoice_id = %s
#           AND ih.supplier_id = %s
#     """, (invoice_id, supplier_id))

#     header = cur.fetchone()
#     if not header:
#         return jsonify({"error": "Unauthorized"}), 403

#     cur.execute("""
#         SELECT *
#         FROM invoice_items
#         WHERE invoice_id = %s
#         ORDER BY invoice_item_id
#     """, (invoice_id,))
#     items = cur.fetchall()

#     cur.close()
#     conn.close()

#     return jsonify({
#         "header": header,
#         "items": items
#     }), 200


# # ============================================================
# # 4️⃣ DOWNLOAD INVOICE PDF
# # ============================================================
# @invoice_bp.route("/<invoice_id>/pdf", methods=["GET"])
# def download_invoice_pdf(invoice_id):
#     supplier_id, err = get_supplier_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT *
#         FROM invoice_header
#         WHERE invoice_id = %s
#           AND supplier_id = %s
#     """, (invoice_id, supplier_id))
#     header = cur.fetchone()

#     if not header:
#         return jsonify({"error": "Unauthorized"}), 403

#     cur.execute("""
#         SELECT *
#         FROM invoice_items
#         WHERE invoice_id = %s
#         ORDER BY invoice_item_id
#     """, (invoice_id,))
#     items = cur.fetchall()

#     cur.close()
#     conn.close()

#     buffer = io.BytesIO()
#     doc = SimpleDocTemplate(buffer, pagesize=A4)
#     styles = getSampleStyleSheet()
#     elements = []

#     elements.append(Paragraph("<b>INVOICE</b>", styles["Title"]))
#     elements.append(Spacer(1, 12))

#     elements.append(Paragraph(f"Invoice Number: {header['invoice_number']}", styles["Normal"]))
#     elements.append(Paragraph(f"Invoice Date: {header['invoice_date']}", styles["Normal"]))
#     elements.append(Paragraph(f"Order ID: {header['order_id']}", styles["Normal"]))
#     elements.append(Spacer(1, 12))

#     table_data = [["Product", "Qty", "Price", "Discount", "Total"]]
#     for i in items:
#         table_data.append([
#             i["product_name_english"],
#             i["quantity"],
#             f"{i['price_per_unit']}",
#             f"{i['discount']}",
#             f"{i['total_amount']}"
#         ])

#     table = Table(table_data, colWidths=[200, 50, 70, 70, 70])
#     table.setStyle(TableStyle([
#         ("BACKGROUND", (0,0), (-1,0), colors.orange),
#         ("TEXTCOLOR", (0,0), (-1,0), colors.white),
#         ("GRID", (0,0), (-1,-1), 1, colors.black),
#         ("ALIGN", (1,1), (-1,-1), "CENTER")
#     ]))

#     elements.append(table)
#     elements.append(Spacer(1, 20))

#     elements.append(Paragraph(
#         f"<b>Grand Total:</b> {header['grand_total']}",
#         styles["Heading2"]
#     ))

#     doc.build(elements)
#     buffer.seek(0)

#     return send_file(
#         buffer,
#         as_attachment=True,
#         download_name=f"{header['invoice_number']}.pdf",
#         mimetype="application/pdf"
#     )






# ============================================================
# 📘 INVOICE ROUTES + PDF GENERATOR (PRODUCTION READY)
# ============================================================

from flask import Blueprint, jsonify, request, send_file
from db import get_db_connection
from datetime import datetime
from psycopg2.extras import RealDictCursor
import io

# PDF
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Table,
    TableStyle,
    Spacer
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from routes.orders_routes import get_supplier_from_token

import arabic_reshaper
from bidi.algorithm import get_display
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
from reportlab.lib.styles import ParagraphStyle
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
font_path = os.path.join(BASE_DIR, "..", "fonts", "NotoSansArabic-Regular.ttf")

pdfmetrics.registerFont(TTFont('Arabic', font_path))

def fix_ar(text):
    if not text:
        return ""
    reshaped = arabic_reshaper.reshape(str(text))
    return get_display(reshaped)
invoice_bp = Blueprint(
    "invoice_bp",
    __name__,
    url_prefix="/api/v1/invoice"
)

# ============================================================
# UTIL: INVOICE NUMBER
# ============================================================
def generate_invoice_number(cur):
    cur.execute("""
        SELECT invoice_number
        FROM invoice_header
        ORDER BY created_at DESC
        LIMIT 1
    """)
    row = cur.fetchone()

    year = datetime.now().year
    seq = int(row["invoice_number"].split("-")[-1]) + 1 if row else 1
    return f"INV-{year}-{seq:05d}"




@invoice_bp.route("/generate/<order_id>", methods=["POST"])
def generate_invoice(order_id):
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 1️⃣ Validate order
        cur.execute("""
            SELECT *
            FROM order_header
            WHERE order_id = %s
            AND supplier_id = %s
            AND status = 'DELIVERED'
        """, (order_id, supplier_id))
        order = cur.fetchone()

        if not order:
            return jsonify({
                "error": "Order must be DELIVERED before invoice generation"
            }), 400


        # 2️⃣ Block if GRN not confirmed
        cur.execute("""
            SELECT grn_id
            FROM grn_header
            WHERE order_id = %s
              AND status = 'CONFIRMED'
        """, (order_id,))
        grn = cur.fetchone()

        if not grn:
            return jsonify({
                "error": "GRN not confirmed. Invoice cannot be generated."
            }), 400

        # 3️⃣ Idempotency
        cur.execute("""
            SELECT invoice_id, invoice_number
            FROM invoice_header
            WHERE order_id = %s
        """, (order_id,))
        existing = cur.fetchone()

        if existing:
            return jsonify({
                "invoice_id": existing["invoice_id"],
                "invoice_number": existing["invoice_number"],
                "message": "Invoice already exists"
            }), 200

        # 4️⃣ Generate invoice header
        invoice_id = f"INV-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        invoice_number = generate_invoice_number(cur)

        cur.execute("""
            INSERT INTO invoice_header (
                invoice_id,
                invoice_number,
                order_id,
                supplier_id,
                supplier_store_id,
                restaurant_id,
                restaurant_store_id,
                subtotal_amount,
                discount_amount,
                tax_amount,
                grand_total,
                invoice_status,
                payment_status,
                invoice_date
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,0,0,0,0,'GENERATED','UNPAID',NOW())
        """, (
            invoice_id,
            invoice_number,
            order_id,
            supplier_id,
            order.get("store_id"),          # ✅ supplier_store_id
            order["restaurant_id"],
            order.get("store_id"),          # ✅ restaurant_store_id
        ))



        # 5️⃣ 🔥 FETCH ITEMS FROM GRN (THIS IS THE FIX)
        cur.execute("""
            SELECT
                gi.order_item_id,
                gi.product_id,
                oi.product_name_english,
                gi.received_quantity AS quantity,
                oi.price_per_unit,
                oi.discount,
                (gi.received_quantity * oi.price_per_unit - oi.discount) AS total_amount
            FROM grn_items gi
            JOIN grn_header gh
              ON gh.grn_id = gi.grn_id
            JOIN order_items oi
              ON oi.item_id = gi.order_item_id
            WHERE gh.order_id = %s
              AND gh.status = 'CONFIRMED'
        """, (order_id,))

        items = cur.fetchall()
        if not items:
            return jsonify({"error": "No billable items"}), 400

        grand_total = 0

        for i in items:
            grand_total += i["total_amount"]

            cur.execute("""
                INSERT INTO invoice_items (
                    invoice_id,
                    order_item_id,
                    product_id,
                    product_name_english,
                    quantity,
                    price_per_unit,
                    discount,
                    total_amount
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                invoice_id,
                i["order_item_id"],
                i["product_id"],
                i["product_name_english"],
                i["quantity"],
                i["price_per_unit"],
                i["discount"],
                i["total_amount"]
            ))

        # 6️⃣ Update totals
        cur.execute("""
            UPDATE invoice_header
            SET grand_total = %s,
                subtotal_amount = %s
            WHERE invoice_id = %s
        """, (grand_total, grand_total, invoice_id))

        

        conn.commit()

        return jsonify({
            "invoice_id": invoice_id,
            "invoice_number": invoice_number,
            "grand_total": grand_total,
            "message": "Invoice generated successfully"
        }), 201

    except Exception as e:
        conn.rollback()
        print("INVOICE ERROR:", e)
        return jsonify({"error": "Failed to generate invoice"}), 500

    finally:
        cur.close()
        conn.close()


# ============================================================
# 2️⃣ GET SUPPLIER INVOICES (LIST)
# ============================================================
@invoice_bp.route("", methods=["GET"])
def get_invoices():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            ih.invoice_id,
            ih.invoice_number,
            ih.order_id,
            rr.restaurant_name_english,
            rr.restaurant_name_arabic,
            ih.invoice_date,
            ih.grand_total,
            ih.invoice_status
        FROM invoice_header ih
        JOIN restaurant_registration rr
            ON rr.restaurant_id = ih.restaurant_id
        WHERE ih.supplier_id = %s
        ORDER BY ih.created_at DESC
    """, (supplier_id,))

    rows = cur.fetchall()

    lang = request.args.get("lang", "en")

    for r in rows:
        if lang == "ar" and r.get("restaurant_name_arabic"):
            r["restaurant_name"] = r["restaurant_name_arabic"]
        else:
            r["restaurant_name"] = r["restaurant_name_english"]
    cur.close()
    conn.close()

    return jsonify(rows), 200

@invoice_bp.route("/<invoice_id>", methods=["GET"])
def get_invoice_details(invoice_id):
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    lang = request.args.get("lang", "en")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ---------------- HEADER ----------------
    cur.execute("""
        SELECT
            ih.*,

            rr.restaurant_name_english,
            rr.restaurant_name_arabic,

            COALESCE(rs.contact_person_name, rr.contact_person_name)
                AS restaurant_contact_name,

            COALESCE(
                rs.contact_person_mobile,
                rr.contact_person_mobile::text
            ) AS restaurant_contact_mobile,

            COALESCE(rs.email, rr.contact_person_email)
                AS restaurant_email,

            COALESCE(rs.street, rr.city) AS restaurant_street,
            COALESCE(rs.zone, '') AS restaurant_zone,
            COALESCE(rs.building, '') AS restaurant_building,
            COALESCE(rs.shop_no, '') AS restaurant_shop_no,

            ss.store_name_english AS supplier_store,
            ss.contact_person_name AS supplier_contact_name,
            ss.contact_person_mobile AS supplier_contact_mobile,
            ss.email AS supplier_email,
            ss.street AS supplier_street,
            ss.zone AS supplier_zone,
            ss.building AS supplier_building,
            ss.shop_no AS supplier_shop_no

        FROM invoice_header ih

        JOIN restaurant_registration rr
          ON rr.restaurant_id = ih.restaurant_id

        LEFT JOIN restaurant_store_registration rs
          ON rs.store_id = ih.restaurant_store_id

        LEFT JOIN supplier_store_registration ss
          ON ss.supplier_id = ih.supplier_id

        WHERE ih.invoice_id = %s
          AND ih.supplier_id = %s
    """, (invoice_id, supplier_id))

    header = cur.fetchone()

    if not header:
        return jsonify({"error": "Unauthorized"}), 403

    # ---------------- ITEMS ----------------
    cur.execute("""
        SELECT 
            ii.*,
            pm.product_name_english,
            pm.product_name_arabic
        FROM invoice_items ii
        LEFT JOIN product_management pm
            ON pm.product_id = ii.product_id
        WHERE ii.invoice_id = %s
        ORDER BY ii.invoice_item_id
    """, (invoice_id,))

    items = cur.fetchall()

    # ---------------- LANGUAGE SWITCH ----------------
    arabic_rest = header.get("restaurant_name_arabic")

    if lang == "ar" and arabic_rest and arabic_rest.strip():
        header["restaurant_name"] = arabic_rest
    else:
        header["restaurant_name"] = header.get("restaurant_name_english", "")

    for i in items:
        arabic_name = i.get("product_name_arabic")

        if lang == "ar" and arabic_name and arabic_name.strip():
            i["product_name"] = arabic_name
        else:
            i["product_name"] = i.get("product_name_english", "")

    cur.close()
    conn.close()

    return jsonify({
        "header": header,
        "items": items
    }), 200

# ============================================================
# 4️⃣ DOWNLOAD INVOICE PDF
# ============================================================
@invoice_bp.route("/<invoice_id>/pdf", methods=["GET"])
def download_invoice_pdf(invoice_id):
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    lang = request.args.get("lang", "en")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # HEADER
    cur.execute("""
        SELECT ih.*, rr.restaurant_name_english, rr.restaurant_name_arabic
        FROM invoice_header ih
        JOIN restaurant_registration rr
        ON rr.restaurant_id = ih.restaurant_id
        WHERE ih.invoice_id = %s AND ih.supplier_id = %s
    """, (invoice_id, supplier_id))

    header = cur.fetchone()

    # ITEMS (JOIN PRODUCT TABLE)
    cur.execute("""
        SELECT ii.*, pm.product_name_english, pm.product_name_arabic
        FROM invoice_items ii
        LEFT JOIN product_management pm
        ON pm.product_id = ii.product_id
        WHERE ii.invoice_id = %s
    """, (invoice_id,))

    items = cur.fetchall()

    # LANGUAGE
    if lang == "ar":
        header_name = header.get("restaurant_name_arabic") or header.get("restaurant_name_english")
    else:
        header_name = header.get("restaurant_name_english")

    # BUFFER
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40)

    styles = getSampleStyleSheet()
    elements = []
    arabic_style = ParagraphStyle(
        name="ArabicStyle",
        fontName="Arabic",
        fontSize=16,
        leading=20,
        alignment=1  # center (better for title)
    )

    arabic_right = ParagraphStyle(
        name="ArabicRight",
        fontName="Arabic",
        fontSize=12,
        leading=16,
        alignment=2  # right align
    )
    # ================= HEADER =================
    title = "فاتورة" if lang == "ar" else "INVOICE"

    elements.append(Paragraph(
        fix_ar(title) if lang == "ar" else title,
        arabic_style if lang == "ar" else styles["Title"]
    ))

    elements.append(Spacer(1, 20))

    # ================= INFO =================
    info_data = [
        ["Invoice ID", header["invoice_id"]],
        ["Date", str(header["invoice_date"])[:10]],
        ["Restaurant", header_name]
    ]

    if lang == "ar":
        info_data = [
            [fix_ar("رقم الفاتورة"), fix_ar(header["invoice_id"])],
            [fix_ar("التاريخ"), fix_ar(str(header["invoice_date"])[:10])],
            [fix_ar("المطعم"), fix_ar(header_name)]
        ]

    table = Table(info_data, colWidths=[150, 300])
    table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("FONTNAME", (0,0), (-1,-1), "Arabic" if lang=="ar" else "Helvetica")
    ]))

    elements.append(table)
    elements.append(Spacer(1, 20))

    # ================= ITEMS =================
    headers = ["Product", "Qty", "Price", "Total"]

    if lang == "ar":
        headers = list(map(fix_ar, ["المنتج", "الكمية", "السعر", "الإجمالي"]))

    table_data = [headers]

    for i in items:
        name = i.get("product_name_arabic") if lang == "ar" else i.get("product_name_english")
        if lang == "ar":
            name = fix_ar(name)

        table_data.append([
            name,
            i["quantity"],
            f"{i['price_per_unit']}",
            f"{i['total_amount']}"
        ])

    table = Table(table_data, colWidths=[200, 80, 80, 80])

    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#2E86C1")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("FONTNAME", (0,0), (-1,-1), "Arabic" if lang=="ar" else "Helvetica")
    ]))

    elements.append(table)
    elements.append(Spacer(1, 20))

    # ================= TOTAL =================
    total_text = "الإجمالي الكلي" if lang == "ar" else "Grand Total"

    elements.append(Paragraph(
        fix_ar(f"{total_text}: {header['grand_total']}") if lang == "ar"
        else f"{total_text}: {header['grand_total']}",
        arabic_right if lang == "ar" else styles["Heading2"]
    ))

    doc.build(elements)
    buffer.seek(0)

    return send_file(buffer, as_attachment=True,
                     download_name=f"{header['invoice_number']}.pdf",
                     mimetype="application/pdf")