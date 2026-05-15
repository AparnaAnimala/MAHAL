# from flask import Blueprint, request, jsonify
# from db import get_db_connection
# import base64

# cart_bp = Blueprint("cart_bp", __name__)

# # ==========================================
# # GET OR CREATE ACTIVE CART
# # ==========================================
# def get_or_create_cart(restaurant_id, cur):
#     cur.execute("""
#         SELECT cart_id
#         FROM cart_header
#         WHERE restaurant_id = %s
#           AND status = 'ACTIVE'
#     """, (restaurant_id,))

#     row = cur.fetchone()
#     if row:
#         return row["cart_id"]

#     cur.execute("""
#         INSERT INTO cart_header (restaurant_id, status)
#         VALUES (%s, 'ACTIVE')
#         RETURNING cart_id
#     """, (restaurant_id,))

#     return cur.fetchone()["cart_id"]


# # ==========================================
# # GET CART ITEMS (WITH IMAGE BASE64)
# # ==========================================
# @cart_bp.route("/cart/<int:restaurant_id>", methods=["GET"])
# def get_cart(restaurant_id):
#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT
#             ci.cart_item_id,
#             pm.product_name_english AS name,
#             ci.price_per_unit AS price,
#             ci.quantity,
#             pm.product_images[1] AS image
#         FROM cart_items ci
#         JOIN cart_header ch ON ch.cart_id = ci.cart_id
#         JOIN product_management pm ON pm.product_id = ci.product_id
#         WHERE ch.restaurant_id = %s
#           AND ch.status = 'ACTIVE'
#         ORDER BY ci.cart_item_id DESC
#     """, (restaurant_id,))

#     rows = cur.fetchall()
#     cur.close()
#     conn.close()

#     data = []
#     for r in rows:
#         image = None
#         if r["image"]:
#             image = (
#                 "data:image/jpeg;base64,"
#                 + base64.b64encode(r["image"]).decode("utf-8")
#             )

#         data.append({
#             "cart_item_id": r["cart_item_id"],
#             "name": r["name"],
#             "price": float(r["price"]),
#             "quantity": r["quantity"],
#             "image": image
#         })

#     return jsonify(data), 200


# # ==========================================
# # ADD TO CART
# # ==========================================
# @cart_bp.route("/cart/add", methods=["POST"])
# def add_to_cart():
#     data = request.json
#     required = ["restaurant_id", "product_id", "quantity", "price"]

#     for f in required:
#         if f not in data or data[f] is None:
#             return jsonify({"error": f"{f} is required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor()

#     # 🔹 Get supplier_id from product
#     cur.execute("""
#         SELECT supplier_id
#         FROM product_management
#         WHERE product_id = %s
#     """, (data["product_id"],))

#     product = cur.fetchone()
#     if not product:
#         cur.close()
#         conn.close()
#         return jsonify({"error": "Product not found"}), 400

#     supplier_id = product["supplier_id"]

#     # 🔹 Get or create active cart
#     cart_id = get_or_create_cart(data["restaurant_id"], cur)

#     # 🔹 Check if item already exists
#     cur.execute("""
#         SELECT cart_item_id
#         FROM cart_items
#         WHERE cart_id = %s
#           AND product_id = %s
#           AND supplier_id = %s
#     """, (cart_id, data["product_id"], supplier_id))

#     item = cur.fetchone()

#     if item:
#         cur.execute("""
#             UPDATE cart_items
#             SET quantity = quantity + %s
#             WHERE cart_item_id = %s
#         """, (data["quantity"], item["cart_item_id"]))
#     else:
#         cur.execute("""
#             INSERT INTO cart_items (
#                 cart_id,
#                 product_id,
#                 supplier_id,
#                 quantity,
#                 price_per_unit
#             )
#             VALUES (%s, %s, %s, %s, %s)
#         """, (
#             cart_id,
#             data["product_id"],
#             supplier_id,
#             data["quantity"],
#             data["price"]
#         ))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"message": "Added to cart"}), 201


# # ==========================================
# # UPDATE CART ITEM QUANTITY
# # ==========================================
# @cart_bp.route("/cart/update", methods=["PUT"])
# def update_cart():
#     data = request.json

#     if "cart_item_id" not in data or "quantity" not in data:
#         return jsonify({"error": "cart_item_id and quantity required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         UPDATE cart_items
#         SET quantity = %s
#         WHERE cart_item_id = %s
#     """, (data["quantity"], data["cart_item_id"]))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"message": "Cart updated"}), 200


# # ==========================================
# # REMOVE CART ITEM
# # ==========================================
# @cart_bp.route("/cart/remove/<int:cart_item_id>", methods=["DELETE"])
# def remove_cart(cart_item_id):
#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         DELETE FROM cart_items
#         WHERE cart_item_id = %s
#     """, (cart_item_id,))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"message": "Item removed"}), 200












from flask import Blueprint, request, jsonify
from db import get_db_connection
from psycopg2.extras import RealDictCursor
import base64
import jwt

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

cart_bp = Blueprint("cart_bp", __name__)

# =====================================================
# JWT → RESTAURANT CONTEXT
# =====================================================
def get_restaurant_id_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    token = auth.replace("Bearer ", "")
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if decoded.get("role") != "restaurant":
            return None
        return decoded.get("linked_id")
    except Exception:
        return None


# =====================================================
# GET OR CREATE ACTIVE CART
# =====================================================
def get_or_create_cart(restaurant_id, cur):
    cur.execute("""
        SELECT cart_id
        FROM cart_header
        WHERE restaurant_id = %s
          AND status = 'ACTIVE'
        FOR UPDATE
    """, (restaurant_id,))
    row = cur.fetchone()

    if row:
        return row["cart_id"]

    cur.execute("""
        INSERT INTO cart_header (restaurant_id, status)
        VALUES (%s, 'ACTIVE')
        RETURNING cart_id
    """, (restaurant_id,))
    return cur.fetchone()["cart_id"]


# =====================================================
# GET CART (USED BY Cart.jsx)
# =====================================================
@cart_bp.route("/cart/me", methods=["GET"])
def get_my_cart():
    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"items": [], "subtotal": 0, "discount": 0}), 200

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ================= CART ITEMS =================
    cur.execute("""
        SELECT
            ci.cart_item_id,
            ci.product_id,
            pm.product_name_english AS name,
            ci.price_per_unit AS final_price,
            pm.price_per_unit AS original_price,
            pm.category_id,
            ci.quantity,
            pm.product_images[1] AS image,

            o.offer_type,
            o.discount_percentage,
            o.flat_amount,
            o.buy_quantity,
            o.get_quantity

        FROM cart_items ci
        JOIN cart_header ch ON ch.cart_id = ci.cart_id
        JOIN product_management pm ON pm.product_id = ci.product_id

        LEFT JOIN offers o
            ON pm.product_id = o.product_id
            AND o.is_active = true
            AND CURRENT_DATE BETWEEN o.start_date AND o.end_date

        WHERE ch.restaurant_id = %s
        AND ch.status = 'ACTIVE'

        ORDER BY ci.cart_item_id DESC
    """, (restaurant_id,))

    rows = cur.fetchall()

    data = []
    for r in rows:
        image = None
        if r["image"]:
            image = "data:image/jpeg;base64," + base64.b64encode(r["image"]).decode()

        offer_label = None

        if r["offer_type"] == "Percentage":
            offer_label = f"{r['discount_percentage']}% OFF"

        elif r["offer_type"] == "Flat":
            offer_label = f"QAR {r['flat_amount']} OFF"

        elif r["offer_type"] == "BOGO":
            offer_label = f"BUY {r['buy_quantity']} GET {r['get_quantity']}"

        data.append({
            "cart_item_id": r["cart_item_id"],
            "product_id": r["product_id"],
            "name": r["name"],
            "price": float(r["original_price"]),
            "final_price": float(r["final_price"]),
            "quantity": r["quantity"],
            "category_id": r["category_id"],
            "offer_label": offer_label,
            "image": image
        })

    # ================= SUBTOTAL =================
    cur.execute("""
        SELECT COALESCE(SUM(ci.quantity * ci.price_per_unit), 0) AS subtotal
        FROM cart_items ci
        JOIN cart_header ch ON ch.cart_id = ci.cart_id
        WHERE ch.restaurant_id = %s
          AND ch.status = 'ACTIVE'
    """, (restaurant_id,))

    subtotal = cur.fetchone()["subtotal"]

    # ================= DISCOUNT (OFFERS) =================
    cur.execute("""
        SELECT COALESCE(SUM(
            CASE
                WHEN o.offer_type = 'Percentage'
                    THEN (o.discount_value / 100) * %s
                WHEN o.offer_type = 'Flat'
                    THEN o.discount_value
                ELSE 0
            END
        ), 0) AS discount
        FROM offers o
        WHERE o.is_active = true
          AND o.start_date <= CURRENT_DATE
          AND o.end_date >= CURRENT_DATE
    """, (subtotal,))

    discount = cur.fetchone()["discount"]

    cur.close()
    conn.close()

    return jsonify({
        "items": data,
        "subtotal": float(subtotal),
        # "discount": float(discount)
    }), 200



@cart_bp.route("/cart/add", methods=["POST"])
def add_to_cart():
    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}

    product_id = data.get("product_id")
    qty = int(data.get("quantity", 1))
    price = float(data.get("price", 0))

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ================= PRODUCT + SUPPLIER =================
        cur.execute("""
            SELECT supplier_id, price_per_unit
            FROM product_management
            WHERE product_id = %s
        """, (product_id,))
        product = cur.fetchone()

        if not product:
            return jsonify({"error": "Product not found"}), 404

        supplier_id = product["supplier_id"]
        base_price = float(product["price_per_unit"])

        # ================= ACTIVE OFFER =================
        cur.execute("""
            SELECT *
            FROM offers
            WHERE product_id = %s
              AND is_active = true
              AND CURRENT_DATE BETWEEN start_date AND end_date
            LIMIT 1
        """, (product_id,))
        offer = cur.fetchone()

        final_price = base_price
        offer_label = None

        if offer:
            if offer["offer_type"] == "Percentage":
                pct = float(offer.get("discount_percentage") or 0)
                final_price = base_price - (base_price * pct / 100)
                offer_label = f"{pct}% OFF"

            elif offer["offer_type"] == "Flat":
                flat = float(offer.get("flat_amount") or 0)
                final_price = max(base_price - flat, 0)
                offer_label = f"QAR {flat} OFF"

            elif offer["offer_type"] == "BOGO":
                offer_label = f"BUY {offer['buy_quantity']} GET {offer['get_quantity']}"

        cart_id = get_or_create_cart(restaurant_id, cur)

        # ================= EXISTING ITEM =================
        cur.execute("""
            SELECT cart_item_id
            FROM cart_items
            WHERE cart_id = %s
              AND product_id = %s
              AND supplier_id = %s
        """, (cart_id, product_id, supplier_id))

        item = cur.fetchone()

        if item:
            cur.execute("""
                UPDATE cart_items
                SET quantity = quantity + %s
                WHERE cart_item_id = %s
            """, (qty, item["cart_item_id"]))
        else:
            cur.execute("""
                INSERT INTO cart_items (
                    cart_id,
                    product_id,
                    supplier_id,
                    quantity,
                    price_per_unit
                )
                VALUES (%s, %s, %s, %s, %s)
            """, (
                cart_id,
                product_id,
                supplier_id,
                qty,
                final_price   # ✅ STORE FINAL PRICE
            ))

        conn.commit()

        return jsonify({
            "message": "Added to cart",
            "final_price": final_price,
            "offer_label": offer_label
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# =====================================================
# UPDATE QUANTITY ( + / - buttons )
# =====================================================
@cart_bp.route("/cart/update", methods=["PUT"])
def update_cart():
    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    if "cart_item_id" not in data or "quantity" not in data:
        return jsonify({"error": "cart_item_id and quantity required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE cart_items ci
        SET quantity = %s
        FROM cart_header ch
        WHERE ci.cart_item_id = %s
          AND ci.cart_id = ch.cart_id
          AND ch.restaurant_id = %s
          AND ch.status = 'ACTIVE'
    """, (data["quantity"], data["cart_item_id"], restaurant_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Cart updated"}), 200


# =====================================================
# REMOVE ITEM
# =====================================================
@cart_bp.route("/cart/remove/<int:cart_item_id>", methods=["DELETE"])
def remove_cart(cart_item_id):
    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM cart_items ci
        USING cart_header ch
        WHERE ci.cart_item_id = %s
          AND ci.cart_id = ch.cart_id
          AND ch.restaurant_id = %s
          AND ch.status = 'ACTIVE'
    """, (cart_item_id, restaurant_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Item removed"}), 200


# =====================================================
# CART COUNT
# =====================================================
@cart_bp.route("/cart/count", methods=["GET"])
def cart_count():
    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"count": 0}), 200

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT COALESCE(SUM(ci.quantity), 0) AS count
        FROM cart_items ci
        JOIN cart_header ch ON ch.cart_id = ci.cart_id
        WHERE ch.restaurant_id = %s
          AND ch.status = 'ACTIVE'
    """, (restaurant_id,))

    count = cur.fetchone()["count"]
    cur.close()
    conn.close()

    return jsonify({"count": count}), 200

@cart_bp.route("/cart/clear", methods=["POST"])
def clear_cart():

    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE cart_header
            SET status = 'COMPLETED'
            WHERE restaurant_id = %s AND status = 'ACTIVE'
        """, (restaurant_id,))

        cur.execute("""
            INSERT INTO cart_header (restaurant_id, status)
            VALUES (%s, 'ACTIVE')
        """, (restaurant_id,))

        conn.commit()

        return jsonify({"success": True})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()