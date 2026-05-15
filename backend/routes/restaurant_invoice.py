# # ============================================================
# # 🧾 RESTAURANT INVOICE ROUTES (B2B SAFE & COMPLETE)
# # ============================================================

# from flask import Blueprint, jsonify, request, send_file
# from psycopg2.extras import RealDictCursor
# from db import get_db_connection
# import jwt
# import io
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
# from flask_cors import CORS

# JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# restaurant_invoice_bp = Blueprint(
#     "restaurant_invoice_bp",
#     __name__,
#     url_prefix="/api/v1/restaurant/invoices"
# )
# CORS(
#     restaurant_invoice_bp,
#     resources={r"/api/v1/restaurant/invoices/*": {"origins": "*"}},
#     supports_credentials=True
# )

# # ============================================================
# # 🔐 AUTH HELPER
# # ============================================================
# def get_restaurant_from_token():
#     auth = request.headers.get("Authorization", "")
#     if not auth.startswith("Bearer "):
#         return None, ("Unauthorized", 401)

#     try:
#         decoded = jwt.decode(
#             auth.replace("Bearer ", ""),
#             JWT_SECRET,
#             algorithms=["HS256"]
#         )

#         if decoded.get("role", "").upper() != "RESTAURANT":
#             return None, ("Forbidden", 403)

#         return decoded.get("linked_id"), None

#     except Exception:
#         return None, ("Invalid token", 401)


# # ============================================================
# # 1️⃣ LIST RESTAURANT INVOICES
# # ============================================================
# @restaurant_invoice_bp.route("", methods=["GET"])
# def list_restaurant_invoices():
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             ih.invoice_id,
#             ih.invoice_number,
#             ih.order_id,
#             ih.invoice_date,
#             ih.grand_total,
#             ih.invoice_status
#         FROM invoice_header ih
#         JOIN order_header oh
#           ON oh.order_id = ih.order_id
#         WHERE oh.restaurant_id = %s
#         ORDER BY ih.created_at DESC
#     """, (restaurant_id,))

#     rows = cur.fetchall() or []

#     cur.close()
#     conn.close()

#     return jsonify(rows), 200


# # ============================================================
# # 2️⃣ VIEW SINGLE INVOICE (FULL DETAILS)
# # ============================================================
# @restaurant_invoice_bp.route("/<invoice_id>", methods=["GET"])
# def view_invoice(invoice_id):
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     # ---------- HEADER ----------
#     cur.execute("""
#         SELECT
#             ih.invoice_id,
#             ih.invoice_number,
#             ih.order_id,
#             ih.invoice_date,
#             ih.invoice_status,
#             ih.subtotal_amount,
#             ih.discount_amount,
#             ih.tax_amount,
#             ih.grand_total,

#             -- SUPPLIER DETAILS
#             sr.company_name_english      AS supplier_name,
#             sr.contact_person_name       AS supplier_contact_name,
#             sr.contact_person_mobile     AS supplier_contact_mobile,
#             sr.company_email             AS supplier_email,
#             sr.street                    AS supplier_street,
#             sr.zone                      AS supplier_zone,
#             sr.country                   AS supplier_country

#         FROM invoice_header ih
#         JOIN order_header oh
#           ON oh.order_id = ih.order_id
#         JOIN supplier_registration sr
#           ON sr.supplier_id = ih.supplier_id
#         WHERE ih.invoice_id = %s
#           AND oh.restaurant_id = %s
#     """, (invoice_id, restaurant_id))

#     header = cur.fetchone()
#     if not header:
#         cur.close()
#         conn.close()
#         return jsonify({"error": "Invoice not found"}), 404

#     # ---------- ITEMS ----------
#     cur.execute("""
#         SELECT
#             product_name_english,
#             quantity,
#             price_per_unit,
#             discount,
#             total_amount
#         FROM invoice_items
#         WHERE invoice_id = %s
#         ORDER BY invoice_item_id
#     """, (invoice_id,))

#     items = cur.fetchall() or []

#     cur.close()
#     conn.close()

#     return jsonify({
#         "header": header,
#         "items": items
#     }), 200


# # ============================================================
# # 3️⃣ DOWNLOAD INVOICE PDF
# # ============================================================
# @restaurant_invoice_bp.route("/<invoice_id>/pdf", methods=["GET"])
# def download_invoice_pdf(invoice_id):
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             ih.invoice_number,
#             ih.order_id,
#             ih.invoice_date,
#             ih.grand_total,

#             -- SUPPLIER DETAILS
#             sr.company_name_english  AS supplier_name,
#             sr.contact_person_name   AS supplier_contact,
#             sr.contact_person_mobile AS supplier_mobile,
#             sr.company_email         AS supplier_email,
#             sr.street                AS supplier_street,
#             sr.zone                  AS supplier_zone,
#             sr.country               AS supplier_country

#         FROM invoice_header ih
#         JOIN order_header oh
#         ON oh.order_id = ih.order_id
#         JOIN supplier_registration sr
#         ON sr.supplier_id = ih.supplier_id
#         WHERE ih.invoice_id = %s
#         AND oh.restaurant_id = %s
#     """, (invoice_id, restaurant_id))

#     header = cur.fetchone()
#     if not header:
#         cur.close()
#         conn.close()
#         return jsonify({"error": "Unauthorized"}), 403

#     cur.execute("""
#         SELECT
#             product_name_english,
#             quantity,
#             price_per_unit,
#             discount,
#             total_amount
#         FROM invoice_items
#         WHERE invoice_id = %s
#     """, (invoice_id,))

#     items = cur.fetchall() or []

#     cur.close()
#     conn.close()

#     # ---------- PDF ----------
#     buffer = io.BytesIO()
#     doc = SimpleDocTemplate(buffer, pagesize=A4)
#     styles = getSampleStyleSheet()
#     elements = []

#     elements.append(Paragraph("<b>TAX INVOICE</b>", styles["Title"]))
#     elements.append(Spacer(1, 12))
#     elements.append(Paragraph(f"Invoice Number: {header['invoice_number']}", styles["Normal"]))
#     elements.append(Paragraph(f"Order ID: {header['order_id']}", styles["Normal"]))
#     elements.append(Paragraph(f"Invoice Date: {header['invoice_date']}", styles["Normal"]))
#     elements.append(Spacer(1, 12))
#     elements.append(Paragraph("<b>Supplier Details</b>", styles["Heading3"]))
#     elements.append(Paragraph(header["supplier_name"], styles["Normal"]))
#     elements.append(
#         Paragraph(
#             f"{header['supplier_street']}, {header['supplier_zone']}, {header['supplier_country']}",
#             styles["Normal"]
#         )
#     )
#     elements.append(Paragraph(f"Contact: {header['supplier_contact']}", styles["Normal"]))
#     elements.append(Paragraph(f"Phone: {header['supplier_mobile']}", styles["Normal"]))
#     elements.append(Paragraph(f"Email: {header['supplier_email']}", styles["Normal"]))
#     elements.append(Spacer(1, 14))

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
#     elements.append(
#         Paragraph(f"<b>Grand Total:</b> {header['grand_total']}", styles["Heading2"])
#     )

#     doc.build(elements)
#     buffer.seek(0)

#     return send_file(
#         buffer,
#         as_attachment=True,
#         download_name=f"{header['invoice_number']}.pdf",
#         mimetype="application/pdf"
#     )


# # ============================================================
# # 1️⃣5️⃣ GET INVOICE BY ORDER ID (AUTO-OPEN SUPPORT)
# # ============================================================
# @restaurant_invoice_bp.route("/by-order/<order_id>", methods=["GET", "OPTIONS"])
# def get_invoice_by_order(order_id):

#     # ✅ HANDLE PREFLIGHT FIRST
#     if request.method == "OPTIONS":
#         return jsonify({"status": "ok"}), 200

#     # 🔐 AUTH ONLY FOR GET
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             ih.invoice_id,
#             ih.invoice_number,
#             ih.order_id,
#             ih.invoice_date,
#             ih.invoice_status,
#             ih.subtotal_amount,
#             ih.discount_amount,
#             ih.tax_amount,
#             ih.grand_total,
#             ih.payment_status,

#             sr.company_name_english      AS supplier_name,
#             sr.contact_person_name       AS supplier_contact_name,
#             sr.contact_person_mobile     AS supplier_contact_mobile,
#             sr.company_email             AS supplier_email

#         FROM invoice_header ih
#         JOIN order_header oh
#           ON oh.order_id = ih.order_id
#         JOIN supplier_registration sr
#           ON sr.supplier_id = ih.supplier_id
#         WHERE ih.order_id = %s
#           AND oh.restaurant_id = %s
#     """, (order_id, restaurant_id))

#     header = cur.fetchone()
#     if not header:
#         cur.close()
#         conn.close()
#         return jsonify({"error": "Invoice not found for this order"}), 404

#     cur.execute("""
#         SELECT
#             product_name_english,
#             quantity,
#             price_per_unit,
#             discount,
#             total_amount
#         FROM invoice_items
#         WHERE invoice_id = %s
#         ORDER BY invoice_item_id
#     """, (header["invoice_id"],))

#     items = cur.fetchall() or []

#     cur.close()
#     conn.close()

#     return jsonify({
#         "header": header,
#         "items": items
#     }), 200





# from flask import Blueprint, request, jsonify, send_file
# from flask_cors import CORS
# from psycopg2.extras import RealDictCursor
# import jwt
# import io
# from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
# from reportlab.lib.pagesizes import A4
# from reportlab.lib.styles import getSampleStyleSheet
# from reportlab.lib import colors
# from db import get_db_connection

# JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# restaurant_invoice_bp = Blueprint(
#     "restaurant_invoice_bp",
#     __name__,
#     url_prefix="/api/v1"
# )


# # ✅ GLOBAL CORS (IMPORTANT)
# CORS(
#     restaurant_invoice_bp,
#     resources={r"/*": {"origins": "*"}},
#     supports_credentials=True
# )

# # =========================================================
# # AUTH
# # =========================================================
# def get_restaurant_from_token():
#     auth = request.headers.get("Authorization", "")
#     if not auth.startswith("Bearer "):
#         return None, ("Unauthorized", 401)

#     try:
#         decoded = jwt.decode(
#             auth.replace("Bearer ", ""),
#             JWT_SECRET,
#             algorithms=["HS256"],
#             options={"require": ["role", "linked_id"]},
#         )

#         if decoded["role"].upper() != "RESTAURANT":
#             return None, ("Forbidden", 403)

#         return decoded["linked_id"], None

#     except Exception:
#         return None, ("Invalid token", 401)

# # =========================================================
# # 1️⃣ LIST INVOICES
# # =========================================================
# @restaurant_invoice_bp.route("/restaurant/invoices", methods=["GET", "OPTIONS"])
# def list_restaurant_invoices():

#     # ✅ PREFLIGHT
#     if request.method == "OPTIONS":
#         return jsonify({"status": "ok"}), 200

#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify([]), 200

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT
#                 ih.invoice_id,
#                 ih.invoice_number,
#                 ih.order_id,
#                 ih.invoice_date,
#                 ih.grand_total,
#                 ih.invoice_status
#             FROM order_header oh
#             JOIN invoice_header ih
#               ON ih.order_id = oh.order_id
#             WHERE oh.restaurant_id = %s
#             ORDER BY ih.created_at DESC
#         """, (restaurant_id,))

#         return jsonify(cur.fetchall() or []), 200

#     finally:
#         cur.close()
#         conn.close()

# # =========================================================
# # 2️⃣ SINGLE INVOICE
# # =========================================================
# @restaurant_invoice_bp.route(
#     "/restaurant/invoices/<invoice_id>",
#     methods=["GET", "OPTIONS"]
# )
# def view_invoice(invoice_id):

#     if request.method == "OPTIONS":
#         return jsonify({"status": "ok"}), 200

#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": "Unauthorized"}), 401

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT
#     ih.invoice_id,
#     ih.invoice_number,
#     ih.invoice_date,
#     ih.invoice_status,
#     ih.subtotal_amount,
#     ih.discount_amount,
#     ih.tax_amount,
#     ih.grand_total,
#     ih.payment_status,
#     oh.order_id,

#     -- ✅ ALIASES MATCH FRONTEND
#     ssr.company_name        AS supplier_name,
#     ssr.contact_person_name AS supplier_contact_name,
#     ssr.contact_person_mobile AS supplier_contact_mobile,
#     ssr.email               AS supplier_email,

#     ssr.street,
#     ssr.zone,
#     ssr.city,
#     ssr.country

# FROM order_header oh
# JOIN invoice_header ih
#   ON ih.order_id = oh.order_id
# JOIN supplier_store_registration ssr
#   ON ssr.store_id = ih.supplier_store_id
# WHERE ih.invoice_id = %s
# AND oh.restaurant_id = %s

#         """, (invoice_id, restaurant_id))

#         header = cur.fetchone()
#         if not header:
#             return jsonify({"error": "Invoice not found"}), 404

#         cur.execute("""
#             SELECT
#                 product_name_english,
#                 quantity,
#                 price_per_unit,
#                 discount,
#                 total_amount
#             FROM invoice_items
#             WHERE invoice_id = %s
#             ORDER BY invoice_item_id
#         """, (invoice_id,))

#         items = cur.fetchall() or []

#         return jsonify({"header": header, "items": items}), 200

#     finally:
#         cur.close()
#         conn.close()

# # =========================================================
# # 3️⃣ GET INVOICE BY ORDER ID
# # =========================================================
# @restaurant_invoice_bp.route(
#     "/restaurant/invoices/by-order/<order_id>",
#     methods=["GET", "OPTIONS"]
# )
# def get_invoice_by_order(order_id):

#     if request.method == "OPTIONS":
#         return jsonify({"status": "ok"}), 200

#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": "Unauthorized"}), 401

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT
#                 ih.invoice_id,
#                 ih.invoice_number,
#                 ih.invoice_date,
#                 ih.invoice_status,
#                 ih.subtotal_amount,
#                 ih.discount_amount,
#                 ih.tax_amount,
#                 ih.grand_total,
#                 ih.payment_status
#             FROM order_header oh
#             JOIN invoice_header ih
#               ON ih.order_id = oh.order_id
#             WHERE oh.order_id = %s
#             AND oh.restaurant_id = %s
#         """, (order_id, restaurant_id))

#         header = cur.fetchone()
#         if not header:
#             return jsonify({"error": "Invoice not found"}), 404

#         cur.execute("""
#             SELECT
#                 product_name_english,
#                 quantity,
#                 price_per_unit,
#                 discount,
#                 total_amount
#             FROM invoice_items
#             WHERE invoice_id = %s
#             ORDER BY invoice_item_id
#         """, (header["invoice_id"],))

#         items = cur.fetchall() or []

#         return jsonify({"header": header, "items": items}), 200

#     finally:
#         cur.close()
#         conn.close()

# # =========================================================
# # 4️⃣ DOWNLOAD PDF
# # =========================================================
# @restaurant_invoice_bp.route(
#     "/restaurant/invoices/<invoice_id>/pdf",
#     methods=["GET", "OPTIONS"]
# )
# def download_invoice_pdf(invoice_id):

#     # ✅ PREFLIGHT
#     if request.method == "OPTIONS":
#         return jsonify({"status": "ok"}), 200

#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": "Unauthorized"}), 401

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # ================= HEADER =================
#         cur.execute("""
#            SELECT
#                 ih.invoice_number,
#                 ih.invoice_date,
#                 ih.grand_total,
#                 oh.order_id,

#                 -- SUPPLIER DETAILS (STORE LEVEL)
#                 ssr.company_name            AS supplier_name,
#                 ssr.contact_person_name     AS supplier_contact,
#                 ssr.contact_person_mobile  AS supplier_mobile,
#                 ssr.email                   AS supplier_email,
#                 ssr.street                  AS supplier_street,
#                 ssr.zone                    AS supplier_zone,
#                 ssr.country                 AS supplier_country

#             FROM order_header oh
#             JOIN invoice_header ih
#             ON ih.order_id = oh.order_id
#             JOIN supplier_store_registration ssr
#             ON ssr.store_id = ih.supplier_store_id

#             WHERE ih.invoice_id = %s
#             AND oh.restaurant_id = %s

#         """, (invoice_id, restaurant_id))

#         header = cur.fetchone()
#         if not header:
#             return jsonify({"error": "Unauthorized"}), 403

#         # ================= ITEMS =================
#         cur.execute("""
#             SELECT
#                 product_name_english,
#                 quantity,
#                 price_per_unit,
#                 discount,
#                 total_amount
#             FROM invoice_items
#             WHERE invoice_id = %s
#             ORDER BY invoice_item_id
#         """, (invoice_id,))

#         items = cur.fetchall() or []

#     finally:
#         cur.close()
#         conn.close()

#     # ================= PDF =================
#     buffer = io.BytesIO()
#     doc = SimpleDocTemplate(buffer, pagesize=A4)
#     styles = getSampleStyleSheet()
#     elements = []

#     # ---------- TITLE ----------
#     elements.append(Paragraph("<b>TAX INVOICE</b>", styles["Title"]))
#     elements.append(Spacer(1, 12))

#     # ---------- INVOICE INFO ----------
#     elements.append(Paragraph(
#         f"Invoice Number: {header['invoice_number']}", styles["Normal"]
#     ))
#     elements.append(Paragraph(
#         f"Order ID: {header['order_id']}", styles["Normal"]
#     ))
#     elements.append(Paragraph(
#         f"Invoice Date: {header['invoice_date']}", styles["Normal"]
#     ))

#     elements.append(Spacer(1, 14))

#     # ---------- SUPPLIER DETAILS ----------
#     elements.append(Paragraph("<b>Supplier Details</b>", styles["Heading3"]))
#     elements.append(Paragraph(header["supplier_name"], styles["Normal"]))
#     elements.append(Paragraph(
#         f"{header['supplier_street']}, "
#         f"{header['supplier_zone']}, "
#         f"{header['supplier_country']}",
#         styles["Normal"]
#     ))
#     elements.append(Paragraph(
#         f"Contact: {header['supplier_contact']}", styles["Normal"]
#     ))
#     elements.append(Paragraph(
#         f"Phone: {header['supplier_mobile']}", styles["Normal"]
#     ))
#     elements.append(Paragraph(
#         f"Email: {header['supplier_email']}", styles["Normal"]
#     ))

#     elements.append(Spacer(1, 16))

#     # ---------- ITEMS TABLE ----------
#     table_data = [["Product", "Qty", "Price", "Discount", "Total"]]
#     for i in items:
#         table_data.append([
#             i["product_name_english"],
#             i["quantity"],
#             f"{i['price_per_unit']:.2f}",
#             f"{i['discount']:.2f}",
#             f"{i['total_amount']:.2f}",
#         ])

#     table = Table(table_data, colWidths=[200, 50, 70, 70, 70])
#     table.setStyle(TableStyle([
#         ("BACKGROUND", (0, 0), (-1, 0), colors.orange),
#         ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
#         ("GRID", (0, 0), (-1, -1), 1, colors.black),
#         ("ALIGN", (1, 1), (-1, -1), "CENTER"),
#     ]))

#     elements.append(table)
#     elements.append(Spacer(1, 20))

#     # ---------- GRAND TOTAL ----------
#     elements.append(
#         Paragraph(
#             f"<b>Grand Total:</b> {header['grand_total']:.2f}",
#             styles["Heading2"]
#         )
#     )

#     doc.build(elements)
#     buffer.seek(0)

#     return send_file(
#         buffer,
#         as_attachment=True,
#         download_name=f"{header['invoice_number']}.pdf",
#         mimetype="application/pdf",
#     )







from flask import Blueprint, request, jsonify, send_file
from flask_cors import CORS
from psycopg2.extras import RealDictCursor
import jwt
import io

from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from db import get_db_connection

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# ============================================================
# BLUEPRINT
# ============================================================
restaurant_invoice_bp = Blueprint(
    "restaurant_invoice_bp",
    __name__,
    url_prefix="/api/v1/restaurant/invoices"
)

CORS(restaurant_invoice_bp, resources={r"/*": {"origins": "*"}})

# ============================================================
# AUTH
# ============================================================
def get_restaurant_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, ("Unauthorized", 401)

    try:
        decoded = jwt.decode(
            auth.replace("Bearer ", ""),
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded["role"].upper() != "RESTAURANT":
            return None, ("Forbidden", 403)

        return decoded["linked_id"], None

    except Exception:
        return None, ("Invalid token", 401)

# ============================================================
# 1️⃣ LIST RESTAURANT INVOICES
# ============================================================
@restaurant_invoice_bp.route("", methods=["GET"])
def list_restaurant_invoices():
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify([]), 200

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            ih.invoice_id,
            ih.invoice_number,
            ih.order_id,
            ih.invoice_date,
            ih.grand_total,
            ih.invoice_status
        FROM invoice_header ih
        WHERE ih.restaurant_id = %s
        ORDER BY ih.created_at DESC
    """, (restaurant_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200

# ============================================================
# 2️⃣ VIEW SINGLE INVOICE
# ============================================================
@restaurant_invoice_bp.route("/<invoice_id>", methods=["GET"])
def view_invoice(invoice_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # HEADER
    cur.execute("""
        SELECT
            ih.invoice_id,
            ih.invoice_number,
            ih.invoice_date,
            ih.invoice_status,
            ih.subtotal_amount,
            ih.tax_amount,
            ih.discount_amount,
            ih.grand_total,
            ih.payment_status,
            ih.order_id,

            ss.store_name_english AS supplier_name,
            ss.store_name_arabic AS supplier_name_arabic,
            ss.contact_person_name AS supplier_contact_name,
            ss.contact_person_mobile AS supplier_contact_mobile,
            ss.email AS supplier_email,
            ss.street,
            ss.zone,
            ss.country
        FROM invoice_header ih
        JOIN supplier_store_registration ss
            ON ss.supplier_id = ih.supplier_id
        WHERE ih.invoice_id = %s
          AND ih.restaurant_id = %s
    """, (invoice_id, restaurant_id))

    header = cur.fetchone()
    if not header:
        return jsonify({"error": "Invoice not found"}), 404

    # ITEMS
    cur.execute("""
        SELECT
            ii.product_name_english,
            pm.product_name_arabic,
            ii.quantity,
            ii.price_per_unit,
            ii.discount,
            ii.total_amount
        FROM invoice_items ii
        LEFT JOIN product_management pm
            ON pm.product_name_english = ii.product_name_english
        WHERE ii.invoice_id = %s
        ORDER BY ii.invoice_item_id
    """, (invoice_id,))

    items = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({"header": header, "items": items}), 200

# ============================================================
# 3️⃣ DOWNLOAD PDF
# ============================================================
@restaurant_invoice_bp.route("/<invoice_id>/pdf", methods=["GET"])
def download_invoice_pdf(invoice_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            ih.invoice_number,
            ih.invoice_date,
            ih.grand_total,
            ih.order_id,

            ss.store_name_english AS supplier_name,
            ss.contact_person_name AS supplier_contact,
            ss.contact_person_mobile AS supplier_mobile,
            ss.email AS supplier_email,
            ss.street,
            ss.zone,
            ss.country
        FROM invoice_header ih
        JOIN supplier_store_registration ss
            ON ss.supplier_id = ih.supplier_id
        WHERE ih.invoice_id = %s
          AND ih.restaurant_id = %s
    """, (invoice_id, restaurant_id))

    header = cur.fetchone()
    if not header:
        return jsonify({"error": "Unauthorized"}), 403

    cur.execute("""
        SELECT
            product_name_english,
            quantity,
            price_per_unit,
            discount,
            total_amount
        FROM invoice_items
        WHERE invoice_id = %s
        ORDER BY invoice_item_id
    """, (invoice_id,))

    items = cur.fetchall()
    cur.close()
    conn.close()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("<b>TAX INVOICE</b>", styles["Title"]))
    elements.append(Spacer(1, 12))

    elements.append(Paragraph(f"Invoice Number: {header['invoice_number']}", styles["Normal"]))
    elements.append(Paragraph(f"Order ID: {header['order_id']}", styles["Normal"]))
    elements.append(Paragraph(f"Invoice Date: {header['invoice_date']}", styles["Normal"]))
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("<b>Supplier Details</b>", styles["Heading3"]))
    elements.append(Paragraph(header["supplier_name"], styles["Normal"]))
    elements.append(Paragraph(
        f"{header['street']}, {header['zone']}, {header['country']}",
        styles["Normal"]
    ))
    elements.append(Paragraph(f"Contact: {header['supplier_contact']}", styles["Normal"]))
    elements.append(Paragraph(f"Phone: {header['supplier_mobile']}", styles["Normal"]))
    elements.append(Paragraph(f"Email: {header['supplier_email']}", styles["Normal"]))
    elements.append(Spacer(1, 16))

    table_data = [["Product", "Qty", "Price", "Discount", "Total"]]
    for i in items:
        table_data.append([
            i["product_name_english"],
            i["quantity"],
            f"{i['price_per_unit']:.2f}",
            f"{i['discount']:.2f}",
            f"{i['total_amount']:.2f}"
        ])

    table = Table(table_data, colWidths=[200, 50, 70, 70, 70])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.orange),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("ALIGN", (1, 1), (-1, -1), "CENTER"),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(
        f"<b>Grand Total:</b> {header['grand_total']:.2f}",
        styles["Heading2"]
    ))

    doc.build(elements)
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"{header['invoice_number']}.pdf",
        mimetype="application/pdf"
    )
