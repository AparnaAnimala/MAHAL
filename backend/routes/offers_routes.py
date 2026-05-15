# from flask import Blueprint, jsonify, request, Response, send_file
# from flask_cors import cross_origin
# from db import get_db_connection
# from io import BytesIO
# import pandas as pd

# bp = Blueprint("offers", __name__)

# # ======================================================
# # PRODUCTS (SUPPLIER BASED)
# # ======================================================
# @bp.route("/products", methods=["GET"])
# @cross_origin()
# def get_products():
#     supplier_id = request.args.get("supplier_id")

#     if not supplier_id:
#         return jsonify({"error": "supplier_id is required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT product_id, product_name_english, price_per_unit
#         FROM product_management
#         WHERE supplier_id = %s AND flag = 'A'
#         ORDER BY created_at DESC
#     """, (supplier_id,))

#     rows = cur.fetchall()
#     cur.close()
#     conn.close()

#     products = [{
#         "product_id": r["product_id"],
#         "product_name_english": r["product_name_english"],
#         "price_per_unit": r["price_per_unit"],
#         "image_url": f"/api/products/image/{r['product_id']}"
#     } for r in rows]

#     return jsonify(products), 200


# # ======================================================
# # PRODUCT IMAGE (BYTEA)
# # ======================================================
# @bp.route("/products/image/<int:product_id>", methods=["GET"])
# @cross_origin()
# def get_product_image(product_id):
#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT product_images
#         FROM product_management
#         WHERE product_id = %s
#         LIMIT 1
#     """, (product_id,))

#     row = cur.fetchone()
#     cur.close()
#     conn.close()

#     if not row or not row["product_images"]:
#         return "", 404

#     return Response(bytes(row["product_images"][0]), mimetype="image/jpeg")


# # ======================================================
# # OFFERS (SUPPLIER BASED)
# # ======================================================
# @bp.route("/offers", methods=["GET"])
# @cross_origin()
# def get_offers():
#     supplier_id = request.args.get("supplier_id")

#     if not supplier_id:
#         return jsonify({"error": "supplier_id required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT
#             o.offer_id,
#             o.product_id,
#             p.product_name_english,
#             p.price_per_unit AS current_price,
#             o.discount_value AS offer_price,
#             o.discount_percentage,
#             o.start_date,
#             o.end_date,
#             o.is_active
#         FROM offers o
#         JOIN product_management p ON p.product_id = o.product_id
#         WHERE o.supplier_id = %s
#         ORDER BY o.created_at DESC
#     """, (supplier_id,))

#     rows = cur.fetchall()
#     cur.close()
#     conn.close()

#     offers = [{
#         "offer_id": r["offer_id"],
#         "product_name_english": r["product_name_english"],
#         "current_price": r["current_price"],
#         "offer_price": r["offer_price"],
#         "discount_percentage": r["discount_percentage"],
#         "start_date": str(r["start_date"]),
#         "end_date": str(r["end_date"]),
#         "status": "Active" if r["is_active"] else "Inactive",
#         "image_url": f"/api/products/image/{r['product_id']}"
#     } for r in rows]

#     return jsonify(offers), 200


# # ======================================================
# # CREATE OFFER (CATEGORY + MANUAL)
# # ======================================================
# @bp.route("/offers", methods=["POST"])
# @cross_origin()
# def create_offer():
#     data = request.form

#     supplier_id = data.get("supplier_id")
#     category_id = data.get("category_id")
#     sub_category_id = data.get("sub_category_id")
#     product_ids = data.getlist("product_ids[]")

#     discount_percentage = data.get("discount_percentage")

#     if not supplier_id:
#         return jsonify({"error": "supplier_id required"}), 400

#     if not discount_percentage or float(discount_percentage) <= 0:
#         return jsonify({"error": "Invalid discount percentage"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor()

#     # CATEGORY MODE
#     if category_id and sub_category_id:
#         cur.execute("""
#             SELECT product_id
#             FROM product_management
#             WHERE supplier_id = %s
#               AND category_id = %s
#               AND sub_category_id = %s
#               AND flag = 'A'
#         """, (supplier_id, category_id, sub_category_id))

#         product_ids = [r["product_id"] for r in cur.fetchall()]

#     if not product_ids:
#         return jsonify({"error": "No products found for offer"}), 400

#     for pid in product_ids:
#         cur.execute("""
#             INSERT INTO offers (
#                 supplier_id,
#                 product_id,
#                 offer_title,
#                 offer_description,
#                 discount_type,
#                 discount_value,
#                 discount_percentage,
#                 start_date,
#                 end_date,
#                 is_featured,
#                 is_active
#             )
#             VALUES (%s,%s,%s,%s,'Percentage',1,%s,%s,%s,%s,true)
#         """, (
#             supplier_id,
#             pid,
#             data.get("offer_title"),
#             data.get("offer_description"),
#             discount_percentage,
#             data.get("start_date"),
#             data.get("end_date"),
#             data.get("is_featured") == "true"
#         ))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"message": "Offer applied successfully"}), 201


# # ======================================================
# # DELETE OFFER
# # ======================================================
# @bp.route("/offers/<int:offer_id>", methods=["DELETE"])
# @cross_origin()
# def delete_offer(offer_id):
#     supplier_id = request.args.get("supplier_id")

#     if not supplier_id:
#         return jsonify({"error": "supplier_id required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         DELETE FROM offers
#         WHERE offer_id = %s AND supplier_id = %s
#     """, (offer_id, supplier_id))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"message": "Offer deleted"}), 200


# # ======================================================
# # CATEGORIES
# # ======================================================
# @bp.route("/categories", methods=["GET"])
# @cross_origin()
# def get_categories():
#     supplier_id = request.args.get("supplier_id")

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT DISTINCT c.id, c.name
#         FROM category c
#         JOIN product_management p ON p.category_id = c.id
#         WHERE p.supplier_id = %s AND p.flag = 'A'
#         ORDER BY c.name
#     """, (supplier_id,))

#     rows = cur.fetchall()
#     cur.close()
#     conn.close()

#     return jsonify(rows), 200


# # ======================================================
# # SUB-CATEGORIES
# # ======================================================
# @bp.route("/subcategories", methods=["GET"])
# @cross_origin()
# def get_subcategories():
#     supplier_id = request.args.get("supplier_id")
#     category_id = request.args.get("category_id")

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT DISTINCT sc.id, sc.name
#         FROM sub_category sc
#         JOIN product_management p ON p.sub_category_id = sc.id
#         WHERE p.supplier_id = %s
#           AND p.category_id = %s
#           AND p.flag = 'A'
#         ORDER BY sc.name
#     """, (supplier_id, category_id))

#     rows = cur.fetchall()
#     cur.close()
#     conn.close()

#     return jsonify(rows), 200


# # ======================================================
# # PRODUCT COUNT
# # ======================================================
# @bp.route("/products/count", methods=["GET"])
# @cross_origin()
# def product_count():
#     supplier_id = request.args.get("supplier_id")
#     category_id = request.args.get("category_id")
#     sub_category_id = request.args.get("sub_category_id")

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT COUNT(*) AS count
#         FROM product_management
#         WHERE supplier_id = %s
#           AND category_id = %s
#           AND sub_category_id = %s
#           AND flag = 'A'
#     """, (supplier_id, category_id, sub_category_id))

#     count = cur.fetchone()["count"]
#     cur.close()
#     conn.close()

#     return jsonify({"count": count}), 200


# # ======================================================
# # OFFER BULK TEMPLATE (UPDATED)
# # ======================================================
# @bp.route("/offers/template", methods=["GET"])
# def download_offer_template():
#     columns = [
#         "product_id",
#         "category_id",
#         "sub_category_id",
#         "offer_title",
#         "offer_description",
#         "discount_percentage",  # ✅ NEW
#         "offer_price",
#         "start_date",
#         "end_date",
#         "is_featured"
#     ]

#     df = pd.DataFrame(columns=columns)

#     output = BytesIO()
#     with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
#         df.to_excel(writer, index=False, sheet_name="Offers")

#     output.seek(0)

#     return send_file(
#         output,
#         as_attachment=True,
#         download_name="offer_bulk_template.xlsx",
#         mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
#     )





from flask import Blueprint, jsonify, request, Response, send_file
from flask_cors import cross_origin
from db import get_db_connection
from io import BytesIO
import pandas as pd
from psycopg2.extras import RealDictCursor

bp = Blueprint("offers", __name__)



def product_has_active_offer(cur, product_id, exclude_offer_id=None):
    query = """
        SELECT 1
        FROM offers
        WHERE product_id = %s
          AND is_active = true
    """
    params = [product_id]

    if exclude_offer_id:
        query += " AND offer_id != %s"
        params.append(exclude_offer_id)

    cur.execute(query, tuple(params))
    return cur.fetchone() is not None

def serialize_row(row):
    """
    Safely convert date/time/datetime objects to JSON strings
    """
    for key, value in row.items():
        if hasattr(value, "isoformat"):
            row[key] = value.isoformat()
    return row

# ======================================================
# PRODUCTS (SUPPLIER BASED)
# ======================================================
@bp.route("/products", methods=["GET"])
@cross_origin()
def get_products():
    supplier_id = request.args.get("supplier_id")

    if not supplier_id:
        return jsonify({"error": "supplier_id is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT product_id, product_name_english,product_name_arabic, price_per_unit
        FROM product_management
        WHERE supplier_id = %s AND flag = 'A'
        ORDER BY created_at DESC
    """, (supplier_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    products = [{
        "product_id": r["product_id"],
        "product_name_english": r["product_name_english"],
        "product_name_arabic": r.get("product_name_arabic"),
        "price_per_unit": r["price_per_unit"],
        "image_url": f"/api/products/image/{r['product_id']}"
    } for r in rows]

    return jsonify(products), 200


# ======================================================
# PRODUCT IMAGE (BYTEA)
# ======================================================
@bp.route("/products/image/<int:product_id>", methods=["GET"])
@cross_origin()
def get_product_image(product_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT product_images
        FROM product_management
        WHERE product_id = %s
        LIMIT 1
    """, (product_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row or not row["product_images"]:
        return "", 404

    return Response(bytes(row["product_images"][0]), mimetype="image/jpeg")


# ======================================================
# OFFERS (SUPPLIER BASED)
# ======================================================
@bp.route("/offers", methods=["GET"])
@cross_origin()
def get_offers():
    supplier_id = request.args.get("supplier_id")

    if not supplier_id:
        return jsonify({"error": "supplier_id required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            o.offer_id,
            o.offer_title,
            o.offer_description,
            o.offer_type,

            o.category_id,
            o.sub_category_id,
            o.product_id,

            p.product_name_english,
            p.product_name_arabic, 
            p.price_per_unit,

            o.discount_percentage,
            o.flat_amount,
            o.buy_quantity,
            o.get_quantity,

            o.free_delivery,
            o.free_delivery_min_amount,

            o.start_date,
            o.end_date,
            o.start_time,
            o.end_time,

            o.is_featured,
            o.is_active

        FROM offers o
        LEFT JOIN product_management p
            ON p.product_id = o.product_id

        WHERE o.supplier_id = %s
        ORDER BY o.created_at DESC
    """, (supplier_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    offers = []
    for r in rows:
        offers.append({
            "offer_id": r["offer_id"],
            "offer_title": r["offer_title"],
            "offer_description": r["offer_description"],
            "offer_type": r["offer_type"],

            "category_id": r["category_id"],
            "sub_category_id": r["sub_category_id"],
            "product_id": r["product_id"],

            "product_name_english": r["product_name_english"],
            "product_name_arabic": r.get("product_name_arabic"),
            "price_per_unit": float(r["price_per_unit"]) if r["price_per_unit"] else None,

            "discount_percentage": float(r["discount_percentage"]) if r["discount_percentage"] else "",
            "flat_amount": float(r["flat_amount"]) if r["flat_amount"] else "",
            "buy_quantity": r["buy_quantity"],
            "get_quantity": r["get_quantity"],

            "free_delivery": r["free_delivery"],
            "free_delivery_min_amount": float(r["free_delivery_min_amount"]) if r["free_delivery_min_amount"] else "",

            "start_date": str(r["start_date"]),
            "end_date": str(r["end_date"]),
            "start_time": str(r["start_time"]) if r["start_time"] else "",
            "end_time": str(r["end_time"]) if r["end_time"] else "",

            "is_featured": r["is_featured"],
            "is_active": r["is_active"],

            "image_url": f"/api/products/image/{r['product_id']}" if r["product_id"] else None
        })

    return jsonify(offers), 200




# ======================================================
# CREATE OFFER (CATEGORY + MANUAL)
@bp.route("/offers", methods=["POST"])
@cross_origin()
def create_offer():
    data = request.get_json()

    supplier_id = data.get("supplier_id")
    offer_type = data.get("offer_type")

    category_id = data.get("category_id")
    sub_category_id = data.get("sub_category_id")
    product_ids = data.get("product_id", [])

    free_delivery = data.get("free_delivery", False)
    free_delivery_min_amount = data.get("min_order_for_free_delivery")

    if not supplier_id:
        return jsonify({"error": "supplier_id required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # ---------------- HELPERS ----------------
    def to_num(val):
        return None if val in ("", None) else float(val)

    def to_int(val):
        return None if val in ("", None) else int(val)

    def normalize_time(t):
        if not t or str(t).strip() == "":
            return None
        return t + ":00"   # HH:MM → HH:MM:SS

    # ---------------- PRODUCT RESOLUTION ----------------
    if category_id and sub_category_id:
        cur.execute("""
            SELECT product_id
            FROM product_management
            WHERE supplier_id = %s
              AND category_id = %s
              AND sub_category_id = %s
              AND flag = 'A'
        """, (supplier_id, category_id, sub_category_id))

        rows = cur.fetchall()
        product_ids = [r["product_id"] for r in rows]

        if not product_ids:
            cur.close()
            conn.close()
            return jsonify({"error": "No products found for this category"}), 400

    elif not (isinstance(product_ids, list) and len(product_ids) > 0):
        cur.close()
        conn.close()
        return jsonify({"error": "Invalid offer target"}), 400

    category_id = to_int(category_id)
    sub_category_id = to_int(sub_category_id)
    free_delivery_min_amount = to_num(free_delivery_min_amount)

    # ---------------- 🔒 ACTIVE OFFER CHECK (ADDED) ----------------
    for pid in product_ids:
        cur.execute("""
            SELECT 1
            FROM offers
            WHERE product_id = %s
              AND is_active = true
            LIMIT 1
        """, (pid,))

        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({
                "error": f"Product {pid} already has an active offer"
            }), 400

    # ---------------- DISCOUNT LOGIC ----------------
    discount_value = 1
    discount_percentage = None
    flat_amount = None
    buy_quantity = None
    get_quantity = None

    if offer_type == "Percentage":
        discount_percentage = to_num(data.get("discount_percentage"))
        discount_value = discount_percentage

    elif offer_type == "Flat":
        flat_amount = to_num(data.get("flat_amount"))
        discount_value = flat_amount

    elif offer_type == "BOGO":
        buy_quantity = to_int(data.get("bogo_buy"))
        get_quantity = to_int(data.get("bogo_get"))
          
        discount_value = buy_quantity or 1

    else:
        cur.close()
        conn.close()
        return jsonify({"error": "Unsupported discount type"}), 400

    # ---------------- TIME NORMALIZATION ----------------
    start_time = normalize_time(data.get("start_time"))
    end_time = normalize_time(data.get("end_time"))

    # ---------------- INSERT ----------------
    for pid in product_ids:
        cur.execute("""
            INSERT INTO offers (
                supplier_id,
                offer_title,
                offer_description,
                offer_type,
                discount_value,
                discount_percentage,
                flat_amount,
                buy_quantity,
                get_quantity,
                free_delivery,
                free_delivery_min_amount,
                category_id,
                sub_category_id,
                product_id,
                start_date,
                end_date,
                start_time,
                end_time,
                is_featured,
                is_active
            )
            VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,%s,true
            )
        """, (
            supplier_id,
            data.get("title"),
            data.get("description"),
            offer_type,
            discount_value,
            discount_percentage,
            flat_amount,
            buy_quantity,
            get_quantity,
            free_delivery,
            free_delivery_min_amount,
            category_id,
            sub_category_id,
            pid,
            data.get("start_date"),
            data.get("end_date"),
            start_time,
            end_time,
            data.get("featured")
        ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Offer created"}), 201





# ======================================================
# DELETE OFFER
# ======================================================
@bp.route("/offers/<int:offer_id>", methods=["DELETE"])
@cross_origin()
def delete_offer(offer_id):
    supplier_id = request.args.get("supplier_id")

    if not supplier_id:
        return jsonify({"error": "supplier_id required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM offers
        WHERE offer_id = %s AND supplier_id = %s
    """, (offer_id, supplier_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Offer deleted"}), 200


# ======================================================
# CATEGORIES
# ======================================================
@bp.route("/categories", methods=["GET"])
@cross_origin()
def get_categories():
    supplier_id = request.args.get("supplier_id")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT c.id, c.name
        FROM category c
        JOIN product_management p ON p.category_id = c.id
        WHERE p.supplier_id = %s AND p.flag = 'A'
        ORDER BY c.name
    """, (supplier_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200


# ======================================================
# SUB-CATEGORIES
# ======================================================
@bp.route("/subcategories", methods=["GET"])
@cross_origin()
def get_subcategories():
    supplier_id = request.args.get("supplier_id")
    category_id = request.args.get("category_id")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT sc.id, sc.name
        FROM sub_category sc
        JOIN product_management p ON p.sub_category_id = sc.id
        WHERE p.supplier_id = %s
          AND p.category_id = %s
          AND p.flag = 'A'
        ORDER BY sc.name
    """, (supplier_id, category_id))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200


# ======================================================
# PRODUCT COUNT
# ======================================================
@bp.route("/products/count", methods=["GET"])
@cross_origin()
def product_count():
    supplier_id = request.args.get("supplier_id")
    category_id = request.args.get("category_id")
    sub_category_id = request.args.get("sub_category_id")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT COUNT(*) AS count
        FROM product_management
        WHERE supplier_id = %s
          AND category_id = %s
          AND sub_category_id = %s
          AND flag = 'A'
    """, (supplier_id, category_id, sub_category_id))

    count = cur.fetchone()["count"]
    cur.close()
    conn.close()

    return jsonify({"count": count}), 200

    
@bp.route("/offers/<int:offer_id>", methods=["PUT"])
@cross_origin()
def update_offer(offer_id):
    data = request.get_json()
    supplier_id = data.get("supplier_id")

    if not supplier_id:
        return jsonify({"error": "supplier_id required"}), 400

        # ==================================================
    # 🔁 TOGGLE OFFER ACTIVE / INACTIVE
    # ==================================================
    if "is_active" in data:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE offers
            SET is_active = %s,
                updated_at = NOW()
            WHERE offer_id = %s
              AND supplier_id = %s
        """, (
            data["is_active"],
            offer_id,
            supplier_id
        ))

        if cur.rowcount == 0:
            cur.close()
            conn.close()
            return jsonify({"error": "Offer not found"}), 404

        conn.commit()
        cur.close()
        conn.close()

        # 🔥 If only toggling status, stop here
        if len(data.keys()) <= 2:  # supplier_id + is_active
            return jsonify({
                "message": "Offer status updated",
                "is_active": data["is_active"]
            }), 200


    # ---------------- HELPERS ----------------
    def to_num(val):
        return None if val in ("", None) else float(val)

    def to_int(val):
        return None if val in ("", None) else int(val)

    def normalize_time(t):
        if not t or str(t).strip() == "":
            return None
        return t if len(t) == 8 else t + ":00"  # HH:MM → HH:MM:SS

    # ---------------- NORMALIZE INPUT ----------------
    offer_type = data.get("offer_type")

    discount_percentage = to_num(data.get("discount_percentage"))
    flat_amount = to_num(data.get("flat_amount"))

    # buy_quantity = to_int(data.get("bogo_buy"))
    # get_quantity = to_int(data.get("bogo_get"))
    buy_quantity = to_int(data.get("buy_quantity"))
    get_quantity = to_int(data.get("get_quantity"))

    free_delivery = bool(data.get("free_delivery", False))
    free_delivery_min_amount = to_num(data.get("min_order_for_free_delivery"))

    start_time = normalize_time(data.get("start_time"))
    end_time = normalize_time(data.get("end_time"))

    # ---------------- VALIDATION ----------------
    if offer_type == "Percentage":
        if not discount_percentage or discount_percentage <= 0:
            return jsonify({"error": "Invalid discount percentage"}), 400
        flat_amount = None
        buy_quantity = None
        get_quantity = None

    elif offer_type == "Flat":
        if not flat_amount or flat_amount <= 0:
            return jsonify({"error": "Invalid flat amount"}), 400
        discount_percentage = None
        buy_quantity = None
        get_quantity = None

    elif offer_type == "BOGO":
        if not buy_quantity or not get_quantity:
            return jsonify({"error": "Invalid BOGO quantities"}), 400
        discount_percentage = None
        flat_amount = None

    else:
        return jsonify({"error": "Unsupported offer type"}), 400

    # ---------------- DB UPDATE ----------------
    conn = get_db_connection()
    cur = conn.cursor()

    # ---------------- 🔒 ACTIVE OFFER CHECK (ADDED – SAFE) ----------------
    product_id = data.get("product_id")

    # normalize product_id (handle [id] or id)
    if isinstance(product_id, list):
        product_id = product_id[0] if product_id else None

    if product_id:
        cur.execute("""
            SELECT 1
            FROM offers
            WHERE product_id = %s
              AND is_active = true
              AND offer_id != %s
            LIMIT 1
        """, (product_id, offer_id))

        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({
                "error": "This product already belongs to another active offer"
            }), 400

    cur.execute("""
        UPDATE offers SET
            offer_title = %s,
            offer_description = %s,
            offer_type = %s,
            discount_percentage = %s,
            flat_amount = %s,
            buy_quantity = %s,
            get_quantity = %s,
            free_delivery = %s,
            free_delivery_min_amount = %s,
            start_date = %s,
            end_date = %s,
            start_time = %s,
            end_time = %s,
            is_featured = %s,
            updated_at = NOW()
        WHERE offer_id = %s
          AND supplier_id = %s
    """, (
        data.get("title"),
        data.get("description"),
        offer_type,
        discount_percentage,
        flat_amount,
        buy_quantity,
        get_quantity,
        free_delivery,
        free_delivery_min_amount,
        data.get("start_date"),
        data.get("end_date"),
        start_time,
        end_time,
        data.get("featured"),
        offer_id,
        supplier_id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Offer updated successfully"}), 200


# @bp.route("/offers/by-product/<int:product_id>", methods=["GET"])
# @cross_origin()
# def get_offer_by_product(product_id):
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             offer_id,
#             offer_title,
#             offer_description,
#             offer_type,
#             discount_percentage,
#             flat_amount,
#             buy_quantity,
#             get_quantity,
#             start_date,
#             end_date,
#             start_time,
#             end_time,
#             CASE
#                 WHEN CURRENT_DATE BETWEEN start_date AND end_date
#                  AND (
#                     start_time IS NULL
#                     OR end_time IS NULL
#                     OR CURRENT_TIME BETWEEN start_time AND end_time
#                  )
#                 THEN 'ACTIVE'
#                 WHEN CURRENT_DATE < start_date
#                 THEN 'UPCOMING'
#                 ELSE 'EXPIRED'
#             END AS offer_status
#         FROM offers
#         WHERE product_id = %s
#           AND is_active = true
#         ORDER BY start_date ASC, created_at DESC
#         LIMIT 1
#     """, (product_id,))

#     row = cur.fetchone()
#     cur.close()
#     conn.close()

#     # ✅ FIX: convert time → string for JSON
#     if row:
#         if row.get("start_time"):
#             row["start_time"] = row["start_time"].strftime("%H:%M")
#         if row.get("end_time"):
#             row["end_time"] = row["end_time"].strftime("%H:%M")

#     return jsonify(row), 200

# @bp.route("/offers/by-product/<int:product_id>", methods=["GET"])
# @cross_origin()
# def get_offer_by_product(product_id):
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             offer_id,
#             offer_title,
#             offer_description,
#             offer_type,
#             discount_percentage,
#             flat_amount,
#             buy_quantity,
#             get_quantity,
#             start_date,
#             end_date,
#             start_time,
#             end_time,
#             is_active,
#             CASE
#             WHEN is_active = false THEN 'INACTIVE'
#             WHEN CURRENT_TIMESTAMP < (
#                 start_date + COALESCE(start_time, TIME '00:00')
#             ) THEN 'UPCOMING'
#             WHEN CURRENT_TIMESTAMP BETWEEN
#                 (start_date + COALESCE(start_time, TIME '00:00'))
#                 AND
#                 (end_date + COALESCE(end_time, TIME '23:59:59'))
#             THEN 'ACTIVE'
#             ELSE 'EXPIRED'
#             END AS offer_status
#         FROM offers
#         WHERE product_id = %s
#         ORDER BY created_at DESC
#         LIMIT 1

#     """, (product_id,))

#     row = cur.fetchone()
#     cur.close()
#     conn.close()

#     if row:
#         if row.get("start_time"):
#             row["start_time"] = row["start_time"].strftime("%H:%M")
#         if row.get("end_time"):
#             row["end_time"] = row["end_time"].strftime("%H:%M")

#     return jsonify(row), 200


@bp.route("/offers/by-product/<int:product_id>", methods=["GET"])
@cross_origin()
def get_offer_by_product(product_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            offer_id,
            offer_title,
            offer_description,
            offer_type,
            discount_percentage,
            flat_amount,
            buy_quantity,
            get_quantity,
            start_date,
            end_date,
            start_time,
            end_time,
            is_active,
            CASE
              WHEN is_active = false THEN 'INACTIVE'
              WHEN CURRENT_TIMESTAMP < (
                start_date + COALESCE(start_time, TIME '00:00')
              ) THEN 'UPCOMING'
              WHEN CURRENT_TIMESTAMP BETWEEN
                (start_date + COALESCE(start_time, TIME '00:00'))
                AND
                (end_date + COALESCE(end_time, TIME '23:59:59'))
              THEN 'ACTIVE'
              ELSE 'EXPIRED'
            END AS offer_status
        FROM offers
        WHERE product_id = %s
        ORDER BY created_at DESC
        LIMIT 1
    """, (product_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if row:
        row = serialize_row(row)

    return jsonify(row), 200



@bp.route("/offers/by-product/<int:product_id>", methods=["PUT"])
@cross_origin()
def update_offer_by_product(product_id):
    data = request.get_json()
    supplier_id = data.get("supplier_id")

    if not supplier_id:
        return jsonify({"error": "supplier_id required"}), 400

    # ==========================================================
    # 🔁 TOGGLE OFFER ACTIVE / INACTIVE (DEACTIVATE / REACTIVATE)
    # ==========================================================
    if "is_active" in data:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE offers
            SET is_active = %s,
                updated_at = NOW()
            WHERE product_id = %s
              AND supplier_id = %s
        """, (
            data["is_active"],
            product_id,
            supplier_id
        ))

        if cur.rowcount == 0:
            cur.close()
            conn.close()
            return jsonify({"error": "Offer not found for this product"}), 404

        conn.commit()
        cur.close()
        conn.close()

        # 🔥 If request is only for toggle, stop here
        if len(data.keys()) == 2:  # supplier_id + is_active
            return jsonify({
                "message": "Offer status updated",
                "is_active": data["is_active"]
            }), 200
    # ==========================================================
    # 🔁 END TOGGLE BLOCK
    # ==========================================================


    # ---------------- HELPERS ----------------
    def to_num(val):
        return None if val in ("", None) else float(val)

    def to_int(val):
        return None if val in ("", None) else int(val)

    def normalize_time(t):
        if not t or str(t).strip() == "":
            return None
        return t if len(t) == 8 else t + ":00"

    # ---------------- INPUT ----------------
    offer_title = data.get("title")
    offer_description = data.get("description")
    offer_type = data.get("offer_type")

    discount_percentage = to_num(data.get("discount_percentage"))
    flat_amount = to_num(data.get("flat_amount"))

    buy_quantity = to_int(data.get("buy_quantity"))
    get_quantity = to_int(data.get("get_quantity"))

    start_date = data.get("start_date")
    end_date = data.get("end_date")

    start_time = normalize_time(data.get("start_time"))
    end_time = normalize_time(data.get("end_time"))

    # ---------------- VALIDATION + DISCOUNT VALUE ----------------
    if offer_type == "Percentage":
        if not discount_percentage or discount_percentage <= 0:
            return jsonify({"error": "Invalid discount percentage"}), 400

        discount_value = discount_percentage
        flat_amount = None
        buy_quantity = None
        get_quantity = None

    elif offer_type == "Flat":
        if not flat_amount or flat_amount <= 0:
            return jsonify({"error": "Invalid flat amount"}), 400

        discount_value = flat_amount
        discount_percentage = None
        buy_quantity = None
        get_quantity = None

    elif offer_type == "BOGO":
        if not buy_quantity or not get_quantity:
            return jsonify({"error": "Invalid BOGO quantities"}), 400

        discount_value = buy_quantity
        discount_percentage = None
        flat_amount = None

    else:
        return jsonify({"error": "Unsupported offer type"}), 400

    # ---------------- UPDATE OFFER DETAILS ----------------
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE offers SET
            offer_title = %s,
            offer_description = %s,
            discount_type = %s,
            discount_value = %s,
            offer_type = %s,
            discount_percentage = %s,
            flat_amount = %s,
            buy_quantity = %s,
            get_quantity = %s,
            start_date = %s,
            end_date = %s,
            start_time = %s,
            end_time = %s,
            updated_at = NOW()
        WHERE product_id = %s
          AND supplier_id = %s
    """, (
        offer_title,
        offer_description,
        offer_type,
        discount_value,
        offer_type,
        discount_percentage,
        flat_amount,
        buy_quantity,
        get_quantity,
        start_date,
        end_date,
        start_time,
        end_time,
        product_id,
        supplier_id
    ))

    if cur.rowcount == 0:
        cur.close()
        conn.close()
        return jsonify({"error": "Offer not found for this product"}), 404

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Offer updated successfully"}), 200



@bp.route("/offers/by-product/<int:product_id>", methods=["POST"])
@cross_origin()
def create_offer_by_product(product_id):
    data = request.get_json()
    supplier_id = data.get("supplier_id")

    if not supplier_id:
        return jsonify({"error": "supplier_id required"}), 400

    # ---------------- HELPERS ----------------
    def to_num(val):
        return None if val in ("", None) else float(val)

    def to_int(val):
        return None if val in ("", None) else int(val)

    def normalize_time(t):
        if not t or str(t).strip() == "":
            return None
        return t if len(t) == 8 else t + ":00"

    # ---------------- INPUT ----------------
    offer_title = data.get("title")
    offer_description = data.get("description")
    offer_type = data.get("offer_type")

    discount_percentage = to_num(data.get("discount_percentage"))
    flat_amount = to_num(data.get("flat_amount"))

    buy_quantity = to_int(data.get("buy_quantity"))
    get_quantity = to_int(data.get("get_quantity"))

    start_date = data.get("start_date")
    end_date = data.get("end_date")

    start_time = normalize_time(data.get("start_time"))
    end_time = normalize_time(data.get("end_time"))

    # ---------------- VALIDATION + DISCOUNT VALUE ----------------
    if offer_type == "Percentage":
        if not discount_percentage or discount_percentage <= 0:
            return jsonify({"error": "Invalid discount percentage"}), 400

        discount_value = discount_percentage
        flat_amount = None
        buy_quantity = None
        get_quantity = None

    elif offer_type == "Flat":
        if not flat_amount or flat_amount <= 0:
            return jsonify({"error": "Invalid flat amount"}), 400

        discount_value = flat_amount
        discount_percentage = None
        buy_quantity = None
        get_quantity = None

    elif offer_type == "BOGO":
        if not buy_quantity or not get_quantity:
            return jsonify({"error": "Invalid BOGO quantities"}), 400

        discount_value = buy_quantity
        discount_percentage = None
        flat_amount = None

    else:
        return jsonify({"error": "Unsupported offer type"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ---------------- CHECK EXISTING ----------------
    cur.execute("""
        SELECT 1 FROM offers
        WHERE product_id = %s
          AND supplier_id = %s
          AND is_active = true
    """, (product_id, supplier_id))

    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Active offer already exists"}), 409

    # ---------------- INSERT ----------------
    cur.execute("""
        INSERT INTO offers (
            supplier_id,
            product_id,
            offer_title,
            offer_description,
            discount_type,
            discount_value,
            offer_type,
            discount_percentage,
            flat_amount,
            buy_quantity,
            get_quantity,
            start_date,
            end_date,
            start_time,
            end_time,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            %s, %s, %s, %s,
            %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            true, NOW(), NOW()
        )
        RETURNING offer_id
    """, (
        supplier_id,
        product_id,
        offer_title,
        offer_description,
        offer_type,
        discount_value,
        offer_type,
        discount_percentage,
        flat_amount,
        buy_quantity,
        get_quantity,
        start_date,
        end_date,
        start_time,
        end_time
    ))

    offer_id = cur.fetchone()["offer_id"]  # ✅ FIXED
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "message": "Offer created successfully",
        "offer_id": offer_id
    }), 201


# @bp.route("/offers/upsert", methods=["POST", "OPTIONS"])
# @cross_origin()
# def upsert_offer():
#     data = request.get_json()

#     product_id = data.get("product_id")
#     offer_type = data.get("offer_type")
#     discount_percentage = data.get("discount_percentage")
#     flat_amount = data.get("flat_amount")
#     buy_quantity = data.get("buy_quantity")
#     get_quantity = data.get("get_quantity")
#     start_date = data.get("start_date")
#     end_date = data.get("end_date")

#     conn = get_db_connection()
#     cur = conn.cursor()

#     # deactivate old offers
#     cur.execute("""
#         UPDATE offers
#         SET is_active = false
#         WHERE product_id = %s
#     """, (product_id,))

#     # insert new offer
#     cur.execute("""
#         INSERT INTO offers (
#             product_id,
#             offer_type,
#             discount_percentage,
#             flat_amount,
#             buy_quantity,
#             get_quantity,
#             start_date,
#             end_date,
#             is_active
#         ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,true)
#     """, (
#         product_id,
#         offer_type,
#         discount_percentage,
#         flat_amount,
#         buy_quantity,
#         get_quantity,
#         start_date,
#         end_date
#     ))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"message": "Offer saved"}), 200


# ======================================================
# APPLY COUPON (CART + CATEGORY + SUPPLIER)
# ======================================================
@bp.route("/coupons/apply", methods=["POST"])
@cross_origin()
def apply_coupon():

    data = request.get_json()

    code = data.get("code")
    cart_total = float(data.get("cart_total", 0))
    restaurant_id = data.get("restaurant_id")
    cart_items = data.get("cart_items", [])

    if not code:
        return jsonify({"error": "Coupon code required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT *
        FROM coupons
        WHERE UPPER(code) = UPPER(%s)
        AND is_active = true
        LIMIT 1
    """, (code,))

    coupon = cur.fetchone()

    if not coupon:
        return jsonify({"error": "Invalid coupon"}), 400

    now = pd.Timestamp.now()

    if now < coupon["start_date"]:
        return jsonify({"error": "Coupon not started"}), 400

    if now > coupon["end_date"]:
        return jsonify({"error": "Coupon expired"}), 400

    discount = 0
    discount_type = coupon["discount_type"]
    discount_value = float(coupon["discount_value"])
    max_discount = float(coupon["max_discount"] or 0)

    # ==================================================
    # CATEGORY COUPON
    # ==================================================
    if coupon["scope_type"] == "CATEGORY":

        # get coupon categories
        cur.execute("""
            SELECT category_id
            FROM coupon_categories
            WHERE coupon_id = %s
        """, (coupon["coupon_id"],))

        rows = cur.fetchall()
        category_ids = [r["category_id"] for r in rows]

        if not category_ids:
            cur.close()
            conn.close()
            return jsonify({"error": "No categories mapped to this coupon"}), 400

        # get product categories from DB
        product_ids = [item["product_id"] for item in cart_items]

        cur.execute("""
            SELECT product_id, category_id
            FROM product_management
            WHERE product_id = ANY(%s)
        """, (product_ids,))

        product_categories = {r["product_id"]: r["category_id"] for r in cur.fetchall()}

        matched_items = []

        for item in cart_items:

            product_id = item["product_id"]
            category_id = product_categories.get(product_id)

            if category_id in category_ids:
                matched_items.append(item)

        if not matched_items:
            cur.close()
            conn.close()

            return jsonify({
                "error": "Coupon not applicable for products in cart"
            }), 400

            # ✅ calculate category subtotal
        category_total = sum(
            float(i["price"]) * int(i["quantity"])
            for i in matched_items
        )

        # ✅ check minimum order for category items
        if category_total < float(coupon["min_order_value"] or 0):
            cur.close()
            conn.close()
            return jsonify({
                "error": f"Minimum order value for this category coupon is {coupon['min_order_value']}"
            }), 400  

        total_discount = 0
        product_discounts = []

        for item in matched_items:

            product_total = float(item["price"]) * int(item["quantity"])

            if discount_type == "PERCENTAGE":
                discount = (product_total * discount_value) / 100
            else:
                discount = discount_value

            if max_discount > 0:
                discount = min(discount, max_discount)

            discount = min(discount, product_total)

            total_discount += discount

            product_discounts.append({
                "product_id": item["product_id"],
                "discount": float(discount)
            })

        cur.close()
        conn.close()

        return jsonify({
            "coupon_id": coupon["coupon_id"],
            "scope_type": "CATEGORY",
            "products": product_discounts,
            "discount": float(total_discount),
            "code": coupon["code"]
        }), 200

    # ==================================================
    # SUPPLIER COUPON
    # ==================================================
    if coupon["scope_type"] == "SUPPLIER":

        matched_items = [
            i for i in cart_items
            if str(i.get("supplier_id")) == str(restaurant_id)
        ]

        if not matched_items:
            cur.close()
            conn.close()

            return jsonify({
                "error": "Coupon not applicable for this supplier"
            }), 400

        total_discount = 0
        product_discounts = []

        for item in matched_items:

            product_total = float(item["price"]) * int(item["quantity"])

            if discount_type == "PERCENTAGE":
                discount = (product_total * discount_value) / 100
            else:
                discount = discount_value

            if max_discount > 0:
                discount = min(discount, max_discount)

            discount = min(discount, product_total)

            total_discount += discount

            product_discounts.append({
                "product_id": item["product_id"],
                "discount": float(discount)
            })

        cur.close()
        conn.close()

        return jsonify({
            "coupon_id": coupon["coupon_id"],
            "scope_type": "SUPPLIER",
            "products": product_discounts,
            "discount": float(total_discount),
            "code": coupon["code"]
        }), 200

    # ==================================================
    # CART COUPON
    # ==================================================
    if cart_total < float(coupon["min_order_value"] or 0):

        cur.close()
        conn.close()

        return jsonify({
            "error": f"Minimum order value is {coupon['min_order_value']}"
        }), 400

    if discount_type == "PERCENTAGE":
        discount = (cart_total * discount_value) / 100
    else:
        discount = discount_value

    if max_discount > 0:
        discount = min(discount, max_discount)

    discount = min(discount, cart_total)

    cur.close()
    conn.close()

    return jsonify({
        "coupon_id": coupon["coupon_id"],
        "scope_type": "CART",
        "discount": float(discount),
        "code": coupon["code"]
    }), 200


# ======================================================
# RECORD COUPON USAGE (UPDATED)
# ======================================================
@bp.route("/coupons/use", methods=["POST"])
@cross_origin()
def use_coupon():

    data = request.get_json()
    coupon_id = data.get("coupon_id")
    restaurant_id = data.get("restaurant_id")

    conn = get_db_connection()
    cur = conn.cursor()

    # increase total usage
    cur.execute("""
        UPDATE coupons
        SET usage_limit_total = usage_limit_total - 1
        WHERE coupon_id = %s
    """, (coupon_id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Coupon usage recorded"}), 200

# ======================================================
# GET ACTIVE COUPONS (UPDATED WITH PRODUCT NAMES)
# ======================================================
@bp.route("/coupons/active", methods=["GET"])
@cross_origin()
def get_active_coupons():

    cart_total = float(request.args.get("cart_total", 0))

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT 
            coupon_id,
            code,
            title,
            discount_type,
            discount_value,
            min_order_value,
            max_discount,
            end_date,
            scope_type
        FROM coupons
        WHERE is_active = true
        AND NOW() BETWEEN start_date AND end_date
        ORDER BY min_order_value ASC
    """)

    coupons = cur.fetchall()

    offers = []

    for c in coupons:

        eligible = cart_total >= float(c["min_order_value"] or 0)

        amount_needed = max(
            0,
            float(c["min_order_value"] or 0) - cart_total
        )

        product_names = []
        category_ids = []

        if c["scope_type"] == "CATEGORY":

            cur.execute("""
                SELECT c.id AS category_id, c.name AS category_name
                FROM coupon_categories cc
                JOIN category c
                ON c.id = cc.category_id
                WHERE cc.coupon_id = %s
            """, (c["coupon_id"],))

            rows = cur.fetchall()

            product_names = [r["category_name"] for r in rows]
            category_ids = [r["category_id"] for r in rows]
        offers.append({
            **c,
            "eligible": eligible,
            "amount_needed": amount_needed,
            "products": product_names,
            "category_ids": category_ids
        })

    cur.close()
    conn.close()

    return jsonify({
        "total_offers": len(offers),
        "offers": offers
    }), 200
@bp.route("/deals", methods=["GET"])
@cross_origin()
def get_deals():
    from datetime import date

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    today = date.today()

    try:
        cur.execute("""
            SELECT 
                o.*,
                p.product_name_english,
                p.product_name_arabic,
                p.price_per_unit,
                p.product_images
            FROM offers o
            LEFT JOIN product_management p 
                ON o.product_id = p.product_id
            WHERE o.is_active = true
              AND o.start_date <= %s
              AND o.end_date >= %s
              AND p.flag = 'A'
            ORDER BY o.is_featured DESC, o.created_at DESC
            LIMIT 20
        """, (today, today))

        rows = cur.fetchall()

        deals = []
        host = request.host_url.rstrip("/")

        for o in rows:

            # ❌ skip invalid price
            if not o.get("price_per_unit"):
                continue

            base = float(o["price_per_unit"])

            if base <= 0:
                continue

            # ---------------- IMAGE ----------------
            image = None
            imgs = o.get("product_images") or []

            if isinstance(imgs, list) and len(imgs) > 0:
                image = f"{host}/api/products/image/{o['product_id']}"
            else:
                image = None

            # ---------------- PRICE ----------------
            new_price = base
            old_price = base
            off = 0
            title = ""

            if o["offer_type"] == "Percentage" and o.get("discount_percentage"):
                off = float(o["discount_percentage"])
                new_price = base - (base * off / 100)
                title = f"{int(off)}% OFF"

            elif o["offer_type"] == "Flat" and o.get("flat_amount"):
                flat = float(o["flat_amount"])
                new_price = base - flat
                off = (flat / base) * 100
                title = f"{int(flat)} OFF"

            elif o.get("buy_quantity") and o.get("get_quantity"):
                title = f"Buy {o['buy_quantity']} Get {o['get_quantity']}"

            elif o.get("free_delivery"):
                title = "Free Delivery"

            else:
                title = o.get("offer_title") or "Special Offer"

            new_price = max(new_price, 0)

            deals.append({
                "id": o["offer_id"],
                "name": o.get("product_name_arabic") or o.get("product_name_english"),
                "deal_title": title,
                "price": round(new_price, 2),
                "old_price": round(old_price, 2),
                "off": int(off),
                "image": image,
                "end_date": str(o.get("end_date")),
                "end_time": str(o.get("end_time") or "23:59:59")
            })

        return jsonify(deals), 200

    except Exception as e:
        print("DEALS ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()