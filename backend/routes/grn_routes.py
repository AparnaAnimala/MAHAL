# from flask import Blueprint, request, jsonify
# from psycopg2.extras import RealDictCursor
# from db import get_db_connection
# import jwt

# JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# grn_bp = Blueprint("grn_bp", __name__)

# # =========================
# # AUTH (RESTAURANT)
# # =========================
# def get_restaurant_from_token():
#     auth = request.headers.get("Authorization", "")
#     if not auth.startswith("Bearer "):
#         return None, ("Unauthorized", 401)

#     token = auth.replace("Bearer ", "")

#     try:
#         decoded = jwt.decode(
#             token,
#             JWT_SECRET,
#             algorithms=["HS256"]
#         )

#         role = decoded.get("role", "")
#         restaurant_id = decoded.get("linked_id")

#         if role.upper() != "RESTAURANT":
#             return None, ("Forbidden", 403)

#         if not restaurant_id:
#             return None, ("Invalid token", 401)

#         return restaurant_id, None

#     except jwt.ExpiredSignatureError:
#         return None, ("Token expired", 401)
#     except Exception as e:
#         print("JWT ERROR (GRN):", e)
#         return None, ("Invalid token", 401)



# # =========================
# # CREATE GRN (DRAFT)
# # =========================
# @grn_bp.route("/grn/<order_id>", methods=["POST"])
# def create_grn(order_id):
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT order_id, supplier_id, restaurant_id, status
#             FROM order_header
#             WHERE order_id = %s AND restaurant_id = %s
#         """, (order_id, restaurant_id))

#         order = cur.fetchone()

#         if not order:
#             return jsonify({"error": "Order not found"}), 404

#         if order["status"] != "DELIVERED":
#             return jsonify({"error": "Order not delivered"}), 400

#         cur.execute(
#             "SELECT 1 FROM grn_header WHERE order_id = %s",
#             (order_id,)
#         )
#         if cur.fetchone():
#             return jsonify({"error": "GRN already exists"}), 400

#         cur.execute("""
#             INSERT INTO grn_header (order_id, supplier_id, restaurant_id)
#             VALUES (%s, %s, %s)
#             RETURNING grn_id
#         """, (order_id, order["supplier_id"], restaurant_id))

#         grn_id = cur.fetchone()["grn_id"]

#         cur.execute("""
#             SELECT item_id, product_id, quantity
#             FROM order_items
#             WHERE order_id = %s
#         """, (order_id,))

#         for item in cur.fetchall():
#             cur.execute("""
#                 INSERT INTO grn_items
#                 (grn_id, order_item_id, product_id, ordered_quantity, received_quantity)
#                 VALUES (%s, %s, %s, %s, %s)
#             """, (
#                 grn_id,
#                 item["item_id"],
#                 item["product_id"],
#                 item["quantity"],
#                 item["quantity"]
#             ))

#         conn.commit()
#         return jsonify({"grn_id": grn_id}), 201

#     finally:
#         cur.close()
#         conn.close()

# # =========================
# # GET GRN
# # =========================
# @grn_bp.route("/grn/<order_id>", methods=["GET"])
# def get_grn(order_id):
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT * FROM grn_header
#             WHERE order_id = %s AND restaurant_id = %s
#         """, (order_id, restaurant_id))
#         header = cur.fetchone()

#         if not header:
#             return jsonify({"error": "GRN not found"}), 404

#         cur.execute("""
#             SELECT * FROM grn_items
#             WHERE grn_id = %s
#         """, (header["grn_id"],))

#         return jsonify({
#             "header": header,
#             "items": cur.fetchall()
#         }), 200

#     finally:
#         cur.close()
#         conn.close()

# # =========================
# # UPDATE GRN ITEMS
# # =========================
# @grn_bp.route("/grn/<int:grn_id>", methods=["PUT"])
# def update_grn(grn_id):
#     data = request.get_json() or {}
#     items = data.get("items", [])

#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # 🔒 Check GRN status
#         cur.execute("""
#             SELECT status
#             FROM grn_header
#             WHERE grn_id = %s AND restaurant_id = %s
#         """, (grn_id, restaurant_id))

#         grn = cur.fetchone()
#         if not grn:
#             return jsonify({"error": "GRN not found"}), 404

#         if grn["status"] == "CONFIRMED":
#             return jsonify({"error": "GRN already confirmed"}), 400

#         # ✅ Update items
#         for i in items:
#             cur.execute("""
#                 UPDATE grn_items
#                 SET received_quantity = %s,
#                     rejected_quantity = %s,
#                     remarks = %s
#                 WHERE grn_item_id = %s
#             """, (
#                 i["received_quantity"],
#                 i["rejected_quantity"],
#                 i.get("remarks"),
#                 i["grn_item_id"]
#             ))

#         conn.commit()
#         return jsonify({"message": "GRN saved (DRAFT)"}), 200

#     finally:
#         cur.close()
#         conn.close()


# # =========================
# # CONFIRM GRN
# # =========================
# @grn_bp.route("/grn/<int:grn_id>/confirm", methods=["POST"])
# def confirm_grn(grn_id):
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # 1️⃣ Fetch GRN (LOCKED)
#         cur.execute("""
#             SELECT grn_id, status
#             FROM grn_header
#             WHERE grn_id = %s
#               AND restaurant_id = %s
#               AND status = 'DRAFT'
#             FOR UPDATE
#         """, (grn_id, restaurant_id))

#         grn = cur.fetchone()
#         if not grn:
#             return jsonify({
#                 "error": "GRN not found or already confirmed"
#             }), 400

#         # 2️⃣ Fetch GRN items
#         cur.execute("""
#             SELECT
#                 grn_item_id,
#                 product_id,
#                 ordered_quantity,
#                 received_quantity,
#                 rejected_quantity
#             FROM grn_items
#             WHERE grn_id = %s
#         """, (grn_id,))

#         items = cur.fetchall()
#         if not items:
#             return jsonify({"error": "No GRN items"}), 400

#         # 3️⃣ Validate quantities
#         for i in items:
#             if (i["received_quantity"] + i["rejected_quantity"]) != i["ordered_quantity"]:
#                 return jsonify({
#                     "error": "Received + Rejected must equal Ordered quantity"
#                 }), 400

#         # 4️⃣ Update inventory + shortages
#         for i in items:
#             # INVENTORY
#             if i["received_quantity"] > 0:
#                 cur.execute("""
#                     INSERT INTO restaurant_inventory
#                     (restaurant_id, product_id, quantity)
#                     VALUES (%s, %s, %s)
#                     ON CONFLICT (restaurant_id, product_id)
#                     DO UPDATE SET
#                         quantity = restaurant_inventory.quantity + EXCLUDED.quantity,
#                         updated_at = NOW()
#                 """, (
#                     restaurant_id,
#                     i["product_id"],
#                     i["received_quantity"]
#                 ))

#             # SHORTAGES (B2B AUDIT)
#             # if i["rejected_quantity"] > 0:
#             #     cur.execute("""
#             #         INSERT INTO grn_shortages
#             #         (grn_id, product_id, rejected_quantity, created_at)
#             #         VALUES (%s, %s, %s, NOW())
#             #     """, (
#             #         grn_id,
#             #         i["product_id"],
#             #         i["rejected_quantity"]
#             #     ))

#         # 5️⃣ Confirm GRN
#         cur.execute("""
#             UPDATE grn_header
#             SET status = 'CONFIRMED',
#                 confirmed_at = NOW(),
#                 confirmed_by = %s
#             WHERE grn_id = %s
#         """, (restaurant_id, grn_id))

#         conn.commit()

#         return jsonify({
#             "message": "GRN confirmed successfully. Inventory updated."
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         print("GRN CONFIRM ERROR:", e)
#         return jsonify({"error": "Failed to confirm GRN"}), 500

#     finally:
#         cur.close()
#         conn.close()





from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from db import get_db_connection
import jwt
import base64
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
import io
from flask import send_file
from datetime import datetime
from routes.inventory_restaurant_routes import (
    send_restaurant_low_stock_email,
    send_restaurant_out_of_stock_email,
    LOW_STOCK_LIMIT
)

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

grn_bp = Blueprint("grn_bp", __name__)

# =========================
# AUTH (RESTAURANT)
# =========================
def get_restaurant_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, ("Unauthorized", 401)

    token = auth.replace("Bearer ", "")

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

        if decoded.get("role", "").upper() != "RESTAURANT":
            return None, ("Forbidden", 403)

        restaurant_id = decoded.get("linked_id")
        if not restaurant_id:
            return None, ("Invalid token", 401)

        return restaurant_id, None

    except jwt.ExpiredSignatureError:
        return None, ("Token expired", 401)
    except Exception as e:
        print("JWT ERROR (GRN):", e)
        return None, ("Invalid token", 401)

# for pdf generation
from datetime import datetime
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
import io

def generate_grn_pdf(header, items, image_bytes=None):
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

    title_style = ParagraphStyle(
        "title",
        parent=styles["Title"],
        alignment=1
    )

    elements.append(Paragraph("Goods Receipt Note (GRN)", title_style))
    elements.append(Spacer(1, 15))

    # HEADER INFO
    header_table = Table([
        ["GRN No", f"GRN-{header['grn_id']:05d}"],
        ["Supplier", header["supplier_name"]],
        ["Status", header["status"]],
        ["GRN Date", datetime.now().strftime("%d-%m-%Y")]
    ], colWidths=[2*inch, 4*inch])

    header_table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.black),
        ("BACKGROUND", (0,0), (0,-1), colors.whitesmoke),
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE")
    ]))

    elements.append(header_table)
    elements.append(Spacer(1, 20))

    # ITEMS TABLE
    table_data = [["Product", "UOM", "Ordered", "Received", "Rejected"]]
    total_ordered = total_received = total_rejected = 0

    for i in items:
        table_data.append([
            i["product_name"],
            i["uom"],
            f"{i['ordered_quantity']}",
            f"{i['received_quantity']}",
            f"{i['rejected_quantity']}"
        ])
        total_ordered += float(i["ordered_quantity"])
        total_received += float(i["received_quantity"])
        total_rejected += float(i["rejected_quantity"])

    items_table = Table(table_data, colWidths=[2.5*inch, 1*inch, 1*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.black),
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("ALIGN", (2,1), (-1,-1), "CENTER")
    ]))

    elements.append(items_table)
    elements.append(Spacer(1, 15))

    # TOTALS
    totals_table = Table([
        ["Total Ordered Qty", f"{total_ordered}"],
        ["Total Received Qty", f"{total_received}"],
        ["Total Rejected Qty", f"{total_rejected}"]
    ], colWidths=[3*inch, 2*inch])

    totals_table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.black),
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold")
    ]))

    elements.append(totals_table)
    elements.append(Spacer(1, 25))

    # SIGNATURE
    # SIGNATURE SECTION
    elements.append(Spacer(1, 25))
    elements.append(Paragraph("<b>Received & Verified By</b>", styles["Normal"]))
    elements.append(Spacer(1, 6))

    info_table = Table([
        ["Name", header.get("received_by", "N/A")],
        ["Date", header.get("confirmed_at").strftime("%d-%m-%Y %H:%M")
            if header.get("confirmed_at") else "N/A"]
    ], colWidths=[1.5*inch, 3*inch])

    info_table.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.black),
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
    ]))

    elements.append(info_table)
    elements.append(Spacer(1, 10))

    if image_bytes:
        elements.append(Paragraph("Signature / Proof", styles["Normal"]))
        elements.append(Spacer(1, 6))
        elements.append(Image(
            io.BytesIO(image_bytes),
            width=2.5*inch,
            height=1.2*inch,
            kind="proportional"
        ))


    elements.append(Spacer(1, 30))

    # FOOTER
    elements.append(Paragraph(
        f"<font size=8>This is a system generated GRN. Generated on {datetime.now().strftime('%d-%m-%Y %H:%M')}</font>",
        styles["Normal"]
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()

# from datetime import datetime
# from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
# from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
# from reportlab.lib.pagesizes import A4
# from reportlab.lib import colors
# from reportlab.lib.units import inch
# import io

# def generate_grn_pdf(header, items, image_bytes=None):
#     buffer = io.BytesIO()
#     doc = SimpleDocTemplate(
#         buffer,
#         pagesize=A4,
#         leftMargin=30,
#         rightMargin=30,
#         topMargin=30,
#         bottomMargin=30
#     )

#     styles = getSampleStyleSheet()
#     elements = []

#     # TITLE
#     elements.append(
#         Paragraph(
#             "GOODS RECEIPT NOTE (GRN)",
#             ParagraphStyle(
#                 name="TitleCenter",
#                 parent=styles["Title"],
#                 alignment=1
#             )
#         )
#     )
#     elements.append(Spacer(1, 12))

#     # HEADER TABLE
#     header_table = Table([
#         ["GRN No", f"GRN-{header['grn_id']:05d}"],
#         ["Supplier", header["supplier_name"]],
#         ["Status", header["status"]],
#         ["GRN Date", datetime.now().strftime("%d-%m-%Y")]
#     ], colWidths=[2*inch, 4*inch])

#     header_table.setStyle(TableStyle([
#         ("GRID", (0,0), (-1,-1), 0.5, colors.black),
#         ("BACKGROUND", (0,0), (0,-1), colors.whitesmoke),
#         ("FONTNAME", (0,0), (-1,-1), "Helvetica"),
#         ("BOTTOMPADDING", (0,0), (-1,-1), 6)
#     ]))

#     elements.append(header_table)
#     elements.append(Spacer(1, 16))

#     # ITEMS TABLE
#     item_data = [["Sl", "Product", "UOM", "Ordered", "Received", "Rejected"]]
#     for idx, i in enumerate(items, start=1):
#         item_data.append([
#             idx,
#             i["product_name"],
#             i["uom"],
#             i["ordered_quantity"],
#             i["received_quantity"],
#             i["rejected_quantity"]
#         ])

#     item_table = Table(item_data, colWidths=[
#         0.6*inch, 2.2*inch, 1*inch, 1*inch, 1*inch, 1*inch
#     ])

#     item_table.setStyle(TableStyle([
#         ("GRID", (0,0), (-1,-1), 0.5, colors.black),
#         ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
#         ("ALIGN", (3,1), (-1,-1), "CENTER"),
#         ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold")
#     ]))

#     elements.append(item_table)
#     elements.append(Spacer(1, 14))

#     # SUMMARY
#     totals = {
#         "ordered": sum(float(i["ordered_quantity"]) for i in items),
#         "received": sum(float(i["received_quantity"]) for i in items),
#         "rejected": sum(float(i["rejected_quantity"]) for i in items),
#     }

#     summary_table = Table([
#         ["Total Ordered Qty", totals["ordered"]],
#         ["Total Received Qty", totals["received"]],
#         ["Total Rejected Qty", totals["rejected"]],
#     ], colWidths=[3*inch, 1.5*inch])

#     summary_table.setStyle(TableStyle([
#         ("GRID", (0,0), (-1,-1), 0.5, colors.black),
#         ("BACKGROUND", (0,0), (0,-1), colors.whitesmoke),
#         ("ALIGN", (1,0), (-1,-1), "RIGHT"),
#     ]))

#     elements.append(summary_table)
#     elements.append(Spacer(1, 20))

#     # SIGNATURE SECTION
#     elements.append(Paragraph("<b>Received & Verified By</b>", styles["Normal"]))
#     elements.append(Spacer(1, 10))

#     sign_table = Table([
#         ["Received By (Restaurant)", "Verified By (Supplier)"],
#         ["Signature:", "Signature / Stamp:"],
#         ["", ""],
#         [f"Name: {header.get('received_by', '')}", f"Name: {header['supplier_name']}"],
#         ["Date: " + datetime.now().strftime("%d-%m-%Y"), "Date: " + datetime.now().strftime("%d-%m-%Y")]
#     ], colWidths=[3*inch, 3*inch], rowHeights=[None, None, 50, None, None])

#     sign_table.setStyle(TableStyle([
#         ("GRID", (0,0), (-1,-1), 0.5, colors.black),
#         ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
#     ]))

#     elements.append(sign_table)
#     elements.append(Spacer(1, 16))

#     # FOOTER
#     elements.append(
#         Paragraph(
#             f"<font size=8>This is a system generated GRN. Generated on {datetime.now().strftime('%d-%m-%Y %H:%M')}</font>",
#             styles["Normal"]
#         )
#     )

#     doc.build(elements)
#     buffer.seek(0)
#     return buffer.read()

# =========================
# CREATE GRN (DRAFT)
# =========================
@grn_bp.route("/grn/<order_id>", methods=["POST"])
def create_grn(order_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT order_id, supplier_id, restaurant_id, status
            FROM order_header
            WHERE order_id = %s AND restaurant_id = %s
        """, (order_id, restaurant_id))

        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        if order["status"] != "DELIVERED":
            return jsonify({"error": "Order not delivered"}), 400

        cur.execute("SELECT 1 FROM grn_header WHERE order_id = %s", (order_id,))
        if cur.fetchone():
            return jsonify({"error": "GRN already exists"}), 400

        cur.execute("""
            INSERT INTO grn_header (order_id, supplier_id, restaurant_id)
            VALUES (%s, %s, %s)
            RETURNING grn_id
        """, (order_id, order["supplier_id"], restaurant_id))

        grn_id = cur.fetchone()["grn_id"]

        cur.execute("""
            INSERT INTO grn_items
            (grn_id, order_item_id, product_id, ordered_quantity, received_quantity)
            SELECT
                %s,
                item_id,
                product_id,
                quantity,
                quantity
            FROM order_items
            WHERE order_id = %s
        """, (grn_id, order_id))

        conn.commit()
        return jsonify({"grn_id": grn_id}), 201

    finally:
        cur.close()
        conn.close()


# =========================
# GET GRN (ENRICHED)
# =========================
@grn_bp.route("/grn/<order_id>", methods=["GET"])
def get_grn(order_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # HEADER
        cur.execute("""
        SELECT
        gh.grn_id,
        gh.order_id,
        gh.supplier_id,
        gh.restaurant_id,
        gh.status,
        gh.created_at,
        gh.confirmed_at,
        gh.confirmed_by,
        sr.company_name_english AS supplier_name,
        sr.company_name_arabic AS supplier_name_arabic,
        CASE WHEN gh.grn_pdf IS NOT NULL THEN true ELSE false END AS has_pdf

        FROM grn_header gh
        JOIN supplier_registration sr
        ON sr.supplier_id = gh.supplier_id
        WHERE gh.order_id = %s
        AND gh.restaurant_id = %s
    """, (order_id, restaurant_id))


        header = cur.fetchone()
        if not header:
            return jsonify({"error": "GRN not found"}), 404

        # ITEMS (FIXED)
        cur.execute("""
            SELECT
                gi.grn_item_id,
                gi.product_id,
                pm.product_name_english AS product_name,
                pm.product_name_arabic,
                pm.unit_of_measure AS uom,
                gi.ordered_quantity,
                gi.received_quantity,
                gi.rejected_quantity,
                gi.remarks
            FROM grn_items gi
            JOIN product_management pm
              ON pm.product_id = gi.product_id
            WHERE gi.grn_id = %s
            ORDER BY gi.grn_item_id
        """, (header["grn_id"],))

        return jsonify({
            "header": header,
            "items": cur.fetchall()
        }), 200

    finally:
        cur.close()
        conn.close()


# =========================
# UPDATE GRN ITEMS (DRAFT)
# =========================
@grn_bp.route("/grn/<int:grn_id>", methods=["PUT"])
def update_grn(grn_id):
    data = request.get_json() or {}
    items = data.get("items", [])

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT status
            FROM grn_header
            WHERE grn_id = %s AND restaurant_id = %s
        """, (grn_id, restaurant_id))

        grn = cur.fetchone()
        if not grn:
            return jsonify({"error": "GRN not found"}), 404

        if grn["status"] == "CONFIRMED":
            return jsonify({"error": "GRN already confirmed"}), 400

        for i in items:
            cur.execute("""
                UPDATE grn_items
                SET received_quantity = %s,
                    rejected_quantity = %s,
                    remarks = %s
                WHERE grn_item_id = %s
            """, (
                i["received_quantity"],
                i["rejected_quantity"],
                i.get("remarks"),
                i["grn_item_id"]
            ))

        conn.commit()
        return jsonify({"message": "GRN saved (DRAFT)"}), 200

    finally:
        cur.close()
        conn.close()


# =========================
# CONFIRM GRN
# =========================
# @grn_bp.route("/grn/<int:grn_id>/confirm", methods=["POST"])
# def confirm_grn(grn_id):
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT grn_id
#             FROM grn_header
#             WHERE grn_id = %s
#               AND restaurant_id = %s
#               AND status = 'DRAFT'
#             FOR UPDATE
#         """, (grn_id, restaurant_id))

#         if not cur.fetchone():
#             return jsonify({"error": "GRN not found or already confirmed"}), 400

#         cur.execute("""
#             SELECT product_id, ordered_quantity, received_quantity, rejected_quantity
#             FROM grn_items
#             WHERE grn_id = %s
#         """, (grn_id,))

#         items = cur.fetchall()
#         if not items:
#             return jsonify({"error": "No GRN items"}), 400

#         for i in items:
#             if i["received_quantity"] + i["rejected_quantity"] != i["ordered_quantity"]:
#                 return jsonify({
#                     "error": "Received + Rejected must equal Ordered quantity"
#                 }), 400

#         for i in items:
#             if i["received_quantity"] > 0:
#                 cur.execute("""
#                     INSERT INTO restaurant_inventory
#                     (restaurant_id, product_id, quantity)
#                     VALUES (%s, %s, %s)
#                     ON CONFLICT (restaurant_id, product_id)
#                     DO UPDATE SET
#                         quantity = restaurant_inventory.quantity + EXCLUDED.quantity,
#                         updated_at = NOW()
#                 """, (
#                     restaurant_id,
#                     i["product_id"],
#                     i["received_quantity"]
#                 ))

#         cur.execute("""
#             UPDATE grn_header
#             SET status = 'CONFIRMED',
#                 confirmed_at = NOW(),
#                 confirmed_by = %s
#             WHERE grn_id = %s
#         """, (restaurant_id, grn_id))

#         conn.commit()

#         return jsonify({
#             "message": "GRN confirmed successfully. Inventory updated."
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         print("GRN CONFIRM ERROR:", e)
#         return jsonify({"error": "Failed to confirm GRN"}), 500

#     finally:
#         cur.close()
#         conn.close()



@grn_bp.route("/grn/<int:grn_id>/confirm", methods=["POST"])
def confirm_grn(grn_id):
    data = request.get_json() or {}
    image_base64 = data.get("image_base64")
    image_mime = data.get("image_mime")

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    image_bytes = None
    if image_base64:
        try:
            image_bytes = base64.b64decode(image_base64)
        except Exception:
            return jsonify({"error": "Invalid image"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 🔒 LOCK GRN
        cur.execute("""
            SELECT grn_id
            FROM grn_header
            WHERE grn_id = %s
              AND restaurant_id = %s
              AND status = 'DRAFT'
            FOR UPDATE
        """, (grn_id, restaurant_id))

        if not cur.fetchone():
            return jsonify({"error": "GRN not found or already confirmed"}), 400

        # 📦 FETCH ITEMS
        cur.execute("""
            SELECT product_id, ordered_quantity, received_quantity, rejected_quantity
            FROM grn_items
            WHERE grn_id = %s
        """, (grn_id,))
        items = cur.fetchall()

        if not items:
            return jsonify({"error": "No GRN items"}), 400

        # ✅ VALIDATE
        for i in items:
            if i["received_quantity"] + i["rejected_quantity"] != i["ordered_quantity"]:
                return jsonify({"error": "Quantity mismatch"}), 400

        # ==================================================
        # LEDGER + STOCK + EMAIL CHECK
        # ==================================================
        for i in items:
            qty = float(i["received_quantity"])
            if qty <= 0:
                continue

            product_id = i["product_id"]

            # 1️⃣ LEDGER
            cur.execute("""
                INSERT INTO inventory_ledger
                (restaurant_id, product_id, movement_type, quantity, reference_type, reference_id)
                VALUES (%s, %s, 'GRN_IN', %s, 'GRN', %s)
            """, (restaurant_id, product_id, qty, grn_id))

            # 2️⃣ STOCK UPDATE
            cur.execute("""
                INSERT INTO inventory_stock
                (restaurant_id, store_id, product_id, batch_no, available_qty)
                VALUES (%s, 1, %s, 'DEFAULT', %s)
                ON CONFLICT (restaurant_id, store_id, product_id, batch_no)
                DO UPDATE SET
                    available_qty = inventory_stock.available_qty + EXCLUDED.available_qty,
                    last_updated = NOW()
            """, (restaurant_id, product_id, qty))

            # 3️⃣ CHECK STOCK LEVEL
            cur.execute("""
                SELECT available_qty, low_stock_notified, out_of_stock_notified
                FROM inventory_stock
                WHERE restaurant_id = %s
                  AND store_id = 1
                  AND product_id = %s
                  AND batch_no = 'DEFAULT'
            """, (restaurant_id, product_id))

            stock = cur.fetchone()
            if not stock:
                continue

            # 🚨 OUT OF STOCK
            if stock["available_qty"] <= 0 and not stock["out_of_stock_notified"]:
                send_restaurant_out_of_stock_email(
                    cur, restaurant_id, product_id, store_id=1
                )
                cur.execute("""
                    UPDATE inventory_stock
                    SET out_of_stock_notified = true
                    WHERE restaurant_id = %s AND product_id = %s
                """, (restaurant_id, product_id))

            # ⚠️ LOW STOCK
            elif stock["available_qty"] <= LOW_STOCK_LIMIT and not stock["low_stock_notified"]:
                send_restaurant_low_stock_email(
                    cur, restaurant_id, product_id, stock["available_qty"], store_id=1
                )
                cur.execute("""
                    UPDATE inventory_stock
                    SET low_stock_notified = true
                    WHERE restaurant_id = %s AND product_id = %s
                """, (restaurant_id, product_id))

        # ==================================================
        # PDF GENERATION
        # ==================================================
        cur.execute("""
            SELECT
                pm.product_name_english AS product_name,
                pm.unit_of_measure AS uom,
                gi.ordered_quantity,
                gi.received_quantity,
                gi.rejected_quantity
            FROM grn_items gi
            JOIN product_management pm ON pm.product_id = gi.product_id
            WHERE gi.grn_id = %s
        """, (grn_id,))
        pdf_items = cur.fetchall()

        confirmed_at = datetime.now()
        pdf_bytes = generate_grn_pdf(
            header={
                "grn_id": grn_id,
                "supplier_name": "Supplier",
                "status": "CONFIRMED",
                "received_by": restaurant_id,
                "confirmed_at": confirmed_at
            },
            items=pdf_items,
            image_bytes=image_bytes
        )

        # ✅ FINAL CONFIRM
        cur.execute("""
            UPDATE grn_header
            SET status = 'CONFIRMED',
                confirmed_at = %s,
                confirmed_by = %s,
                proof_image = %s,
                proof_image_mime = %s,
                grn_pdf = %s
            WHERE grn_id = %s
        """, (
            confirmed_at,
            restaurant_id,
            image_bytes,
            image_mime,
            pdf_bytes,
            grn_id
        ))

        conn.commit()
        return jsonify({"message": "GRN confirmed, inventory updated & alerts sent"}), 200

    except Exception as e:
        conn.rollback()
        print("GRN CONFIRM ERROR:", e)
        return jsonify({"error": "GRN confirmation failed"}), 500

    finally:
        cur.close()
        conn.close()


@grn_bp.route("/grn/<int:grn_id>/pdf", methods=["POST"])
def generate_grn_pdf_route(grn_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # HEADER
        cur.execute("""
    SELECT
        gh.grn_id,
        gh.status,
        sr.company_name_english AS supplier_name,
        gh.proof_image
    FROM grn_header gh
    JOIN supplier_registration sr ON sr.supplier_id = gh.supplier_id
    WHERE gh.grn_id = %s AND gh.restaurant_id = %s
""", (grn_id, restaurant_id))


        header = cur.fetchone()
        if not header:
            return jsonify({"error": "GRN not found"}), 404

        # ITEMS
        cur.execute("""
            SELECT
                pm.product_name_english AS product_name,
                pm.unit_of_measure AS uom,
                gi.ordered_quantity,
                gi.received_quantity,
                gi.rejected_quantity
            FROM grn_items gi
            JOIN product_management pm ON pm.product_id = gi.product_id
            WHERE gi.grn_id = %s
        """, (grn_id,))

        items = cur.fetchall()

        pdf_bytes = generate_grn_pdf(
            header,
            items,
            header.get("proof_image")
        )

        cur.execute("""
            UPDATE grn_header
            SET grn_pdf = %s
            WHERE grn_id = %s
        """, (pdf_bytes, grn_id))

        conn.commit()

        return jsonify({"message": "GRN PDF generated"}), 200

    finally:
        cur.close()
        conn.close()


@grn_bp.route("/grn/<int:grn_id>/pdf", methods=["GET"])
def download_grn_pdf(grn_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT grn_pdf
            FROM grn_header
            WHERE grn_id = %s
              AND restaurant_id = %s
              AND status = 'CONFIRMED'
        """, (grn_id, restaurant_id))

        row = cur.fetchone()
        if not row or not row["grn_pdf"]:
            return jsonify({"error": "PDF not available"}), 404

        return send_file(
            io.BytesIO(row["grn_pdf"]),
            download_name=f"GRN-{grn_id:05d}.pdf",
            as_attachment=True,
            mimetype="application/pdf"
        )

    finally:
        cur.close()
        conn.close()
@grn_bp.route("/grn", methods=["GET"])
def list_grns():
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                gh.grn_id,
                gh.order_id,
                gh.status,
                gh.created_at, 
                sr.company_name_english AS supplier_name,
                sr.company_name_arabic AS supplier_name_arabic,
                CASE WHEN gh.grn_pdf IS NOT NULL THEN true ELSE false END AS has_pdf
            FROM grn_header gh
            JOIN supplier_registration sr ON sr.supplier_id = gh.supplier_id
            WHERE gh.restaurant_id = %s
            ORDER BY gh.created_at DESC
        """, (restaurant_id,))

        return jsonify(cur.fetchall()), 200

    finally:
        cur.close()
        conn.close()
