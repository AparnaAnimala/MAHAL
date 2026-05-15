from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from db import get_db_connection
import jwt
import os

JWT_SECRET = os.getenv("JWT_SECRET", "MAHAL_SUPER_SECRET_2025")

order_details_bp = Blueprint("order_details_bp", __name__)

# -------------------------------------------------
# JWT helper
# -------------------------------------------------
def get_user_from_token():
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return None

    token = auth.split(" ")[1]
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None


# -------------------------------------------------
# ORDER DETAILS (ROLE SAFE + LINKED_ID SAFE)
# -------------------------------------------------
@order_details_bp.route("/api/v1/orders/<order_id>", methods=["GET"])
def get_order_details(order_id):
    user = get_user_from_token()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    role = user.get("role")
    linked_id = user.get("linked_id")  # 🔥 THIS IS THE KEY FIX

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # -------------------------------------------------
    # FETCH ORDER
    # -------------------------------------------------
    cur.execute("""
        SELECT 
            oh.order_id,
            oh.order_date,
            oh.expected_delivery_date,
            oh.status,
            oh.payment_status,
            oh.total_amount,
            oh.remarks,
            oh.restaurant_id,
            oh.supplier_id,

            r.store_name_english,
            r.street, r.zone, r.building, r.shop_no,
            r.contact_person_name,
            r.contact_person_mobile
        FROM order_header oh
        JOIN restaurant_registration r
          ON r.restaurant_id = oh.restaurant_id
        WHERE oh.order_id = %s
    """, (order_id,))

    order = cur.fetchone()

    if not order:
        cur.close()
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    # -------------------------------------------------
    # 🔐 ROLE-BASED ACCESS CONTROL (FIXED)
    # -------------------------------------------------
    if role == "restaurant" and order["restaurant_id"] != linked_id:
        cur.close()
        conn.close()
        return jsonify({"error": "Forbidden"}), 403

    if role == "supplier" and order["supplier_id"] != linked_id:
        cur.close()
        conn.close()
        return jsonify({"error": "Forbidden"}), 403

    # -------------------------------------------------
    # ITEMS
    # -------------------------------------------------
    cur.execute("""
        SELECT
            oi.product_name_english,
            pm.product_name_arabic,
            oi.quantity,
            oi.price_per_unit,
            oi.discount,
            oi.total_amount
        FROM order_items oi
        LEFT JOIN product_management pm
            ON pm.product_id = oi.product_id
        WHERE oi.order_id = %s
        ORDER BY oi.created_at
    """, (order_id,))

    items = cur.fetchall()

    pricing = {
        "subtotal": sum(i["price_per_unit"] * i["quantity"] for i in items),
        "discount": sum(i["discount"] for i in items),
        "grand_total": order["total_amount"]
    }

    cur.close()
    conn.close()

    return jsonify({
        "order": order,
        "items": items,
        "pricing": pricing,
        "status_history": []
    })
