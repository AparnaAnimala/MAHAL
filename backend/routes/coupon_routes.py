# from flask import Blueprint, request, jsonify
# from datetime import date
# from db import get_db_connection
# from flask_cors import cross_origin
# from psycopg2.extras import RealDictCursor
# import pandas as pd
# coupon_bp = Blueprint("coupon_bp", __name__)


# # ==========================================================
# # CREATE COUPON (SUPPLIER)
# # ==========================================================
# @coupon_bp.route("/coupons/create", methods=["POST"])
# def create_coupon():

#     data = request.json
#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         INSERT INTO supplier_coupons
#         (supplier_id, code, title, description,
#         discount_type, discount_value,
#         min_order_value, max_discount,
#         start_date, end_date, usage_limit)

#         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
#         RETURNING coupon_id
#     """, (
#         data["supplier_id"],
#         data["code"],
#         data.get("title"),
#         data.get("description"),
#         data["discount_type"],
#         data["discount_value"],
#         data.get("min_order_value",0),
#         data.get("max_discount"),
#         data.get("start_date"),
#         data.get("end_date"),
#         data.get("usage_limit",0)
#     ))

#     conn.commit()

#     return jsonify({"message":"Coupon created"})
    

# # ==========================================================
# # APPLY COUPON (RESTAURANT CART)
# # ==========================================================
# @coupon_bp.route("/coupons/apply", methods=["POST"])
# def apply_coupon():

#     data = request.json
#     code = data.get("code")
#     cart_total = data.get("cart_total")
#     supplier_id = data.get("supplier_id")

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT * FROM supplier_coupons
#         WHERE code=%s
#         AND supplier_id=%s
#         AND is_active=true
#     """, (code, supplier_id))

#     coupon = cur.fetchone()

#     if not coupon:
#         return jsonify({"message": "Invalid coupon"}), 400

#     today = date.today()

#     if coupon["start_date"] and today < coupon["start_date"]:
#         return jsonify({"message": "Coupon not started"}), 400

#     if coupon["end_date"] and today > coupon["end_date"]:
#         return jsonify({"message": "Coupon expired"}), 400

#     if cart_total < coupon["min_order_value"]:
#         return jsonify({
#             "message": f"Minimum order QAR {coupon['min_order_value']}"
#         }), 400

#     if coupon["usage_limit"] and coupon["used_count"] >= coupon["usage_limit"]:
#         return jsonify({"message": "Coupon usage exceeded"}), 400

#     discount = 0

#     if coupon["discount_type"] == "PERCENTAGE":
#         discount = (cart_total * coupon["discount_value"]) / 100

#         if coupon["max_discount"]:
#             discount = min(discount, coupon["max_discount"])

#     elif coupon["discount_type"] == "FLAT":
#         discount = coupon["discount_value"]

#     return jsonify({
#         "coupon_id": coupon["coupon_id"],
#         "discount": float(discount),
#         "code": coupon["code"]
#     })


# # ==========================================================
# # AVAILABLE COUPONS
# # ==========================================================
# @coupon_bp.route("/coupons/supplier/<int:supplier_id>", methods=["GET"])
# def get_supplier_coupons(supplier_id):

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT *
#         FROM supplier_coupons
#         WHERE supplier_id=%s
#         AND is_active=true
#     """, (supplier_id,))

#     coupons = cur.fetchall()

#     return jsonify(coupons)



# # ======================================================
# # APPLY COUPON (UPDATED FOR NEW coupons TABLE)
# # ======================================================
# @coupon_bp.route("/coupons/apply", methods=["POST"])
# @cross_origin()
# def apply_coupon():

#     data = request.get_json()

#     code = data.get("code")
#     cart_total = float(data.get("cart_total", 0))
#     restaurant_id = data.get("restaurant_id")
#     cart_items = data.get("cart_items", [])

#     if not code:
#         return jsonify({"error": "Coupon code required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT *
#         FROM coupons
#         WHERE UPPER(code) = UPPER(%s)
#         AND is_active = true
#         LIMIT 1
#     """, (code,))

#     coupon = cur.fetchone()

#     if not coupon:
#         return jsonify({"error": "Invalid coupon"}), 400

#     now = pd.Timestamp.now()

#     if now < coupon["start_date"]:
#         return jsonify({"error": "Coupon not started"}), 400

#     if now > coupon["end_date"]:
#         return jsonify({"error": "Coupon expired"}), 400

#     discount = 0
#     discount_type = coupon["discount_type"]
#     discount_value = float(coupon["discount_value"])
#     max_discount = float(coupon["max_discount"] or 0)

#     # ==================================================
#     # PRODUCT COUPON
#     # ==================================================
#     if coupon["scope_type"] == "PRODUCT":

#         # get products mapped to this coupon
#         cur.execute("""
#             SELECT product_id
#             FROM coupon_products
#             WHERE coupon_id = %s
#         """, (coupon["coupon_id"],))

#         rows = cur.fetchall()
#         product_ids = [r["product_id"] for r in rows]

#         # find all matching cart items
#         matched_items = [
#             i for i in cart_items if i.get("product_id") in product_ids
#         ]

#         if not matched_items:
#             return jsonify({
#                 "error": "Coupon not applicable for products in cart"
#             }), 400

#         total_discount = 0
#         product_discounts = []

#         for item in matched_items:

#             product_total = float(item["price"]) * int(item["quantity"])

#             if discount_type == "PERCENTAGE":
#                 discount = (product_total * discount_value) / 100

#             elif discount_type == "FLAT":
#                 discount = discount_value

#             if max_discount > 0:
#                 discount = min(discount, max_discount)

#             discount = min(discount, product_total)

#             total_discount += discount

#             product_discounts.append({
#                 "product_id": item["product_id"],
#                 "discount": float(discount)
#             })

#         cur.close()
#         conn.close()

#         return jsonify({
#             "coupon_id": coupon["coupon_id"],
#             "scope_type": "PRODUCT",
#             "products": product_discounts,
#             "discount": float(total_discount),
#             "code": coupon["code"]
#         }), 200

#     # ==================================================
#     # CART COUPON
#     # ==================================================

#     if cart_total < float(coupon["min_order_value"] or 0):
#         return jsonify({
#             "error": f"Minimum order value is {coupon['min_order_value']}"
#         }), 400

#     if discount_type == "PERCENTAGE":
#         discount = (cart_total * discount_value) / 100

#     elif discount_type == "FLAT":
#         discount = discount_value

#     if max_discount > 0:
#         discount = min(discount, max_discount)

#     discount = min(discount, cart_total)

#     cur.close()
#     conn.close()

#     return jsonify({
#         "coupon_id": coupon["coupon_id"],
#         "scope_type": "CART",
#         "discount": float(discount),
#         "code": coupon["code"]
#     }), 200

# # ======================================================
# # RECORD COUPON USAGE (UPDATED)
# # ======================================================
# @coupon_bp.route("/coupons/use", methods=["POST"])
# @cross_origin()
# def use_coupon():

#     data = request.get_json()
#     coupon_id = data.get("coupon_id")
#     restaurant_id = data.get("restaurant_id")

#     conn = get_db_connection()
#     cur = conn.cursor()

#     # increase total usage
#     cur.execute("""
#         UPDATE coupons
#         SET usage_limit_total = usage_limit_total - 1
#         WHERE coupon_id = %s
#     """, (coupon_id,))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"message": "Coupon usage recorded"}), 200

# # ======================================================
# # GET ACTIVE COUPONS (UPDATED WITH PRODUCT NAMES)
# # ======================================================
# @coupon_bp.route("/coupons/active", methods=["GET"])
# @cross_origin()
# def get_active_coupons():

#     cart_total = float(request.args.get("cart_total", 0))

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT 
#             coupon_id,
#             code,
#             title,
#             discount_type,
#             discount_value,
#             min_order_value,
#             max_discount,
#             end_date,
#             scope_type
#         FROM coupons
#         WHERE is_active = true
#         AND NOW() BETWEEN start_date AND end_date
#         ORDER BY min_order_value ASC
#     """)

#     coupons = cur.fetchall()

#     offers = []

#     for c in coupons:

#         eligible = cart_total >= float(c["min_order_value"] or 0)

#         amount_needed = max(
#             0,
#             float(c["min_order_value"] or 0) - cart_total
#         )

#         product_names = []
#         product_ids = []

#         # ======================================
#         # PRODUCT COUPON → fetch product names
#         # ======================================
#         if c["scope_type"] == "PRODUCT":

#             cur.execute("""
#                 SELECT pm.product_id, pm.product_name_english
#                 FROM coupon_products cp
#                 JOIN product_management pm 
#                 ON pm.product_id = cp.product_id
#                 WHERE cp.coupon_id = %s
#             """, (c["coupon_id"],))

#             rows = cur.fetchall()

#             product_names = [r["product_name_english"] for r in rows]
#             product_ids = [r["product_id"] for r in rows]
#         offers.append({
#             **c,
#             "eligible": eligible,
#             "amount_needed": amount_needed,
#             "products": product_names,
#             "product_ids": product_ids
#         })

#     cur.close()
#     conn.close()

#     return jsonify({
#         "total_offers": len(offers),
#         "offers": offers
#     }), 200