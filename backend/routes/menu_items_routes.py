# from flask import Blueprint, request, jsonify
# import psycopg2
# from psycopg2.extras import RealDictCursor
# import base64

# menu_items_bp = Blueprint("menu_items_bp", __name__, url_prefix="/api")

# def get_db_connection():
#     return psycopg2.connect(
#         host="localhost",
#         database="MAHALDATABASE",
#         user="postgres",
#         password="S@ndeep9392",
#         port="5432"
#     )

# # =====================================================
# # CREATE MENU ITEM (ADD)
# # =====================================================
# @menu_items_bp.route("/menu-items", methods=["POST"])
# def create_menu_item():
#     name = request.form.get("name")
#     category = request.form.get("category")
#     price = request.form.get("price")
#     portion_size = request.form.get("portion_size")
#     description = request.form.get("description")
#     status = request.form.get("status", "true").lower() == "true"

#     image_file = request.files.get("image")
#     image_bytes = image_file.read() if image_file else None

#     if not all([name, category, price, portion_size]):
#         return jsonify({"error": "Missing required fields"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         INSERT INTO menu_items
#         (name, category, price, portion_size, description, image, status)
#         VALUES (%s,%s,%s,%s,%s,%s,%s)
#         RETURNING id
#     """, (
#         name,
#         category,
#         float(price),
#         portion_size,
#         description,
#         psycopg2.Binary(image_bytes) if image_bytes else None,
#         status
#     ))

#     new_id = cur.fetchone()[0]
#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"id": new_id}), 201


# # =====================================================
# # GET MENU ITEMS (LIST)
# # =====================================================
# @menu_items_bp.route("/menu-items", methods=["GET"])
# def get_menu_items():
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             id,
#             name,
#             category,
#             price,
#             portion_size,
#             description,
#             status,
#             encode(image, 'base64') AS image
#         FROM menu_items
#         ORDER BY name
#     """)

#     rows = cur.fetchall()

#     for r in rows:
#         if r["image"]:
#             r["image"] = f"data:image/png;base64,{r['image']}"
#         else:
#             r["image"] = "/images/food-placeholder.png"

#     cur.close()
#     conn.close()
#     return jsonify(rows), 200


# # =====================================================
# # UPDATE MENU ITEM (EDIT)
# # =====================================================
# @menu_items_bp.route("/menu-items/<int:item_id>", methods=["PUT"])
# def update_menu_item(item_id):
#     name = request.form.get("name")
#     category = request.form.get("category")
#     price = request.form.get("price")
#     portion_size = request.form.get("portion_size")
#     description = request.form.get("description")
#     status = request.form.get("status", "true").lower() == "true"

#     image_file = request.files.get("image")
#     image_bytes = image_file.read() if image_file else None

#     conn = get_db_connection()
#     cur = conn.cursor()

#     if image_bytes:
#         cur.execute("""
#             UPDATE menu_items
#             SET name=%s, category=%s, price=%s,
#                 portion_size=%s, description=%s,
#                 image=%s, status=%s
#             WHERE id=%s
#         """, (
#             name, category, price,
#             portion_size, description,
#             psycopg2.Binary(image_bytes),
#             status, item_id
#         ))
#     else:
#         cur.execute("""
#             UPDATE menu_items
#             SET name=%s, category=%s, price=%s,
#                 portion_size=%s, description=%s,
#                 status=%s
#             WHERE id=%s
#         """, (
#             name, category, price,
#             portion_size, description,
#             status, item_id
#         ))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"message": "Updated"}), 200
