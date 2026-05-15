# routes/supplier_promotions_routes.py

from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
from db import get_db_connection

import jwt
from functools import wraps
from datetime import datetime

supplier_promotions_bp = Blueprint(
    "supplier_promotions_bp",
    __name__,
    url_prefix="/api/supplier/promotions"
)

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"


# ======================================================
# SUPPLIER TOKEN GUARD
# ======================================================

def require_supplier():

    def decorator(fn):

        @wraps(fn)
        def wrapper(*args, **kwargs):

            token = request.headers.get("Authorization", "").replace("Bearer ", "")

            if not token:
                return jsonify({"error": "Token required"}), 401

            try:

                decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

                if decoded.get("role") != "supplier":
                    return jsonify({"error": "Unauthorized"}), 403

                request.supplier = {
                    "supplier_id": decoded["linked_id"],
                    "user_id": decoded["user_id"]
                }

                return fn(*args, **kwargs)

            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401

            except Exception:
                return jsonify({"error": "Invalid token"}), 401

        return wrapper

    return decorator


# ======================================================
# CREATE PROMOTION REQUEST
# ======================================================

@supplier_promotions_bp.route("/request", methods=["POST"])
@require_supplier()
def create_promotion_request():

    data = request.json or {}

    supplier_id = request.supplier["supplier_id"]

    request_type = data.get("request_type")  # PRODUCT / CATEGORY

    product_ids = data.get("product_ids", [])
    category_ids = data.get("category_ids", [])

    priority_tier = data.get("priority_tier")  # GOLD SILVER PLATINUM

    offer_type = data.get("offer_type")  # DISCOUNT / FLAT / BOGO

    offer_value = data.get("offer_value")

    start_date = data.get("start_date")
    end_date = data.get("end_date")

    banner_url = data.get("banner_url")

    supplier_note = data.get("supplier_note")

    if not request_type:
        return jsonify({"error": "request_type required"}), 400

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        request_ids = []

        # MULTI PRODUCT SUPPORT
        if product_ids:

            for product_id in product_ids:

                cur.execute("""
                    INSERT INTO promotion_requests (
                        supplier_id,
                        request_type,
                        product_id,
                        requested_banner_url,
                        supplier_note,
                        status
                    )
                    VALUES (%s,%s,%s,%s,%s,'NEW')
                    RETURNING request_id
                """, (
                    supplier_id,
                    request_type,
                    product_id,
                    banner_url,
                    supplier_note
                ))

                request_ids.append(cur.fetchone()["request_id"])


        # MULTI CATEGORY SUPPORT
        if category_ids:

            for category_id in category_ids:

                cur.execute("""
                    INSERT INTO promotion_requests (
                        supplier_id,
                        request_type,
                        category_id,
                        requested_banner_url,
                        supplier_note,
                        status
                    )
                    VALUES (%s,%s,%s,%s,%s,'NEW')
                    RETURNING request_id
                """, (
                    supplier_id,
                    request_type,
                    category_id,
                    banner_url,
                    supplier_note
                ))

                request_ids.append(cur.fetchone()["request_id"])


        conn.commit()

        return jsonify({
            "message": "Promotion request submitted",
            "request_ids": request_ids
        }), 201

    finally:

        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# GET SUPPLIER REQUESTS
# ======================================================

@supplier_promotions_bp.route("/requests", methods=["GET"])
@require_supplier()
def get_supplier_requests():

    supplier_id = request.supplier["supplier_id"]

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                pr.*,
                pm.product_name_english,
                pm.product_name_arabic
            FROM promotion_requests pr
            LEFT JOIN product_management pm
                ON pr.product_id = pm.product_id
            WHERE pr.supplier_id = %s
            ORDER BY pr.created_at DESC
        """, (supplier_id,))

        requests = cur.fetchall()

        return jsonify(requests)

    finally:

        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# GET SUPPLIER PRODUCTS (FOR MULTI SELECT)
# ======================================================

@supplier_promotions_bp.route("/my-products", methods=["GET"])
@require_supplier()
def get_supplier_products():

    supplier_id = request.supplier["supplier_id"]
    lang = request.args.get("lang", "en") 
    
     # ✅ ADD THIS BLOCK (IMPORTANT)
        

    for p in products:
            if lang == "ar" and p.get("product_name_arabic"):
                p["name"] = p["product_name_arabic"]
            else:
                p["name"] = p["product_name_english"]

            # ✅ ALSO SEND BOTH (important)
            p["name_arabic"] = p.get("product_name_arabic")  # ✅ ADD THIS

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                product_id,
                product_name_english,
                product_name_arabic,
                price_per_unit,
                stock_availability
            FROM product_management
            WHERE supplier_id = %s
            AND flag='A'
            ORDER BY product_name_english
        """, (supplier_id,))

        products = cur.fetchall()

       

        return jsonify(products)

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# GET SUPPLIER CATEGORIES (FOR MULTI SELECT)
# ======================================================

@supplier_promotions_bp.route("/my-categories", methods=["GET"])
@require_supplier()
def get_supplier_categories():

    supplier_id = request.supplier["supplier_id"]

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT DISTINCT
                c.id,
                c.category_name
            FROM category c
            JOIN product_management pm
                ON pm.category_id = c.id
            WHERE pm.supplier_id = %s
        """, (supplier_id,))

        categories = cur.fetchall()

        

        return jsonify(categories)

    finally:

        if cur: cur.close()
        if conn: conn.close()         