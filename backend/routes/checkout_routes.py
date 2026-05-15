# from flask import Blueprint, request, jsonify
# from db import get_db_connection
# from datetime import datetime
# import uuid

# checkout_bp = Blueprint("checkout_bp", __name__)

# # =====================================================
# # CHECKOUT API – PLACE ORDER (MULTI-SUPPLIER SAFE)
# # =====================================================
# @checkout_bp.route("/checkout", methods=["POST"])
# def checkout():

#     data = request.json
#     print("CHECKOUT DATA:", data)

#     # -----------------------------
#     # 1️⃣ Validate input
#     # -----------------------------
#     required_fields = ["restaurant_id", "name", "phone", "address"]
#     for field in required_fields:
#         if not data.get(field):
#             return jsonify({"error": f"{field} is required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor()

#     try:
#         # -----------------------------
#         # 2️⃣ Get ACTIVE cart
#         # -----------------------------
#         cur.execute("""
#             SELECT cart_id
#             FROM cart_header
#             WHERE restaurant_id = %s
#               AND status = 'ACTIVE'
#         """, (data["restaurant_id"],))

#         cart = cur.fetchone()
#         if not cart:
#             return jsonify({"error": "No active cart found"}), 400

#         cart_id = cart["cart_id"]

#         # -----------------------------
#         # 3️⃣ Fetch cart items grouped by supplier
#         # -----------------------------
#         cur.execute("""
#             SELECT
#                 ci.supplier_id,
#                 ci.product_id,
#                 ci.quantity,
#                 ci.price_per_unit,
#                 pm.product_name_english
#             FROM cart_items ci
#             JOIN product_management pm
#               ON pm.product_id = ci.product_id
#             WHERE ci.cart_id = %s
#             ORDER BY ci.supplier_id
#         """, (cart_id,))

#         rows = cur.fetchall()
#         if not rows:
#             return jsonify({"error": "Cart is empty"}), 400

#         # -----------------------------
#         # 4️⃣ Group items by supplier_id
#         # -----------------------------
#         items_by_supplier = {}
#         for r in rows:
#             supplier_id = r["supplier_id"]
#             items_by_supplier.setdefault(supplier_id, []).append(r)

#         orders_created = []

#         # -----------------------------
#         # 5️⃣ Create ONE ORDER per supplier
#         # -----------------------------
#         for supplier_id, items in items_by_supplier.items():

#             order_id = f"ORD{uuid.uuid4().hex[:10]}"

#             total_amount = sum(
#                 i["quantity"] * i["price_per_unit"]
#                 for i in items
#             )

#             # -----------------------------
#             # 5️⃣.1 Create order_header
#             # -----------------------------
#             cur.execute("""
#                 INSERT INTO order_header (
#                     order_id,
#                     restaurant_id,
#                     supplier_id,
#                     order_date,
#                     status,
#                     payment_status,
#                     total_amount
#                 )
#                 VALUES (%s,%s,%s,%s,'PLACED','UNPAID',%s)
#             """, (
#                 order_id,
#                 data["restaurant_id"],
#                 supplier_id,
#                 datetime.now(),
#                 total_amount
#             ))

#             # -----------------------------
#             # 5️⃣.2 Insert order_items (ONLY this supplier)
#             # -----------------------------
#             for i in items:
#                 line_total = i["quantity"] * i["price_per_unit"]

#                 cur.execute("""
#                     INSERT INTO order_items (
#                         order_id,
#                         product_id,
#                         product_name_english,
#                         quantity,
#                         price_per_unit,
#                         discount,
#                         total_amount
#                     )
#                     VALUES (%s,%s,%s,%s,%s,0,%s)
#                 """, (
#                     order_id,
#                     i["product_id"],
#                     i["product_name_english"],
#                     i["quantity"],
#                     i["price_per_unit"],
#                     line_total
#                 ))

#             # -----------------------------
#             # 5️⃣.3 Save delivery address (per order)
#             # -----------------------------
#             cur.execute("""
#                 INSERT INTO order_address (
#                     order_id,
#                     address_for,
#                     contact_name,
#                     phone,
#                     email,
#                     address_line,
#                     city,
#                     country,
#                     zip_code
#                 )
#                 VALUES (
#                     %s,
#                     'RESTAURANT_DELIVERY',
#                     %s,
#                     %s,
#                     %s,
#                     %s,
#                     %s,
#                     %s,
#                     %s
#                 )
#             """, (
#                 order_id,
#                 data["name"],
#                 data["phone"],
#                 data.get("email"),
#                 data["address"],
#                 data.get("city"),
#                 data.get("country"),
#                 data.get("zip")
#             ))

#             # -----------------------------
#             # 5️⃣.4 Order charges
#             # -----------------------------
#             cur.execute("""
#                 INSERT INTO order_charges (order_id, charge_type, amount)
#                 VALUES (%s,'SUBTOTAL',%s)
#             """, (order_id, total_amount))

#             orders_created.append({
#                 "order_id": order_id,
#                 "supplier_id": supplier_id,
#                 "total_amount": float(total_amount)
#             })

#         # -----------------------------
#         # 6️⃣ Mark cart as COMPLETED
#         # -----------------------------
#         cur.execute("""
#             UPDATE cart_header
#             SET status = 'COMPLETED',
#                 updated_at = now()
#             WHERE cart_id = %s
#         """, (cart_id,))

#         # -----------------------------
#         # 7️⃣ Create NEW ACTIVE cart
#         # -----------------------------
#         cur.execute("""
#             INSERT INTO cart_header (restaurant_id, status)
#             VALUES (%s,'ACTIVE')
#         """, (data["restaurant_id"],))

#         conn.commit()

#         return jsonify({
#             "success": True,
#             "message": "Order placed successfully",
#             "orders": orders_created
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         print("CHECKOUT ERROR:", str(e))
#         return jsonify({
#             "error": "Checkout failed",
#             "details": str(e)
#         }), 500

#     finally:
#         cur.close()
#         conn.close()












# from flask import Blueprint, request, jsonify
# from db import get_db_connection
# from psycopg2.extras import RealDictCursor
# from datetime import datetime
# import time
# import jwt

# JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# checkout_bp = Blueprint("checkout_bp", __name__)

# # =====================================================
# # JWT → RESTAURANT CONTEXT
# # =====================================================
# def get_restaurant_id_from_token():
#     auth = request.headers.get("Authorization", "")
#     if not auth.startswith("Bearer "):
#         return None

#     try:
#         token = auth.replace("Bearer ", "")
#         decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#         if decoded.get("role") != "restaurant":
#             return None
#         return decoded.get("linked_id")
#     except Exception:
#         return None


# # =====================================================
# # CHECKOUT – MULTI SUPPLIER (FINAL FIX)
# # =====================================================
# @checkout_bp.route("/checkout", methods=["POST"])
# def checkout():
#     data = request.get_json() or {}

#     restaurant_id = get_restaurant_id_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     for field in ("name", "phone", "address"):
#         if not data.get(field):
#             return jsonify({"error": f"{field} is required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # =================================================
#         # 1️⃣ LOCK ACTIVE CART
#         # =================================================
#         cur.execute("""
#             SELECT cart_id
#             FROM cart_header
#             WHERE restaurant_id = %s
#               AND status = 'ACTIVE'
#             FOR UPDATE
#         """, (restaurant_id,))
#         cart = cur.fetchone()

#         if not cart:
#             return jsonify({"error": "No active cart found"}), 400

#         cart_id = cart["cart_id"]

#         # =================================================
#         # 2️⃣ GET SUPPLIERS
#         # =================================================
#         cur.execute("""
#             SELECT DISTINCT supplier_id
#             FROM cart_items
#             WHERE cart_id = %s
#         """, (cart_id,))
#         suppliers = cur.fetchall()

#         if not suppliers:
#             return jsonify({"error": "Cart is empty"}), 400

#         created_orders = []

#         # =================================================
#         # 3️⃣ CREATE ORDERS
#         # =================================================
#         for s in suppliers:
#             supplier_id = s["supplier_id"]
#             order_id = f"ORD{int(time.time()*1000)}{supplier_id}"

#             cur.execute("""
#                 SELECT COALESCE(SUM(quantity * price_per_unit), 0) AS subtotal
#                 FROM cart_items
#                 WHERE cart_id = %s AND supplier_id = %s
#             """, (cart_id, supplier_id))
#             subtotal = cur.fetchone()["subtotal"]

#             if subtotal <= 0:
#                 continue

#             # ORDER HEADER
#             cur.execute("""
#                 INSERT INTO order_header (
#                     order_id,
#                     restaurant_id,
#                     supplier_id,
#                     order_date,
#                     status,
#                     payment_status,
#                     total_amount,
#                     remarks
#                 )
#                 VALUES (%s,%s,%s,%s,'PLACED','UNPAID',%s,%s)
#             """, (
#                 order_id,
#                 restaurant_id,
#                 supplier_id,
#                 datetime.now(),
#                 subtotal,
#                 data.get("note")
#             ))

#             # after order_header insert
#             cur.execute("""
#             INSERT INTO supplier_notifications
#             (supplier_id, type, title, message, reference_id)
#             VALUES (%s, 'NEW_ORDER', 'New Order Received',
#                     'A new order has been placed', %s)
#             """, (supplier_id, order_id))


#             # ORDER ITEMS
#             cur.execute("""
#                 INSERT INTO order_items (
#                     order_id,
#                     product_id,
#                     product_name_english,
#                     quantity,
#                     price_per_unit,
#                     discount,
#                     total_amount
#                 )
#                 SELECT
#                     %s,
#                     ci.product_id,
#                     pm.product_name_english,
#                     ci.quantity,
#                     ci.price_per_unit,
#                     0,
#                     ci.quantity * ci.price_per_unit
#                 FROM cart_items ci
#                 JOIN product_management pm ON pm.product_id = ci.product_id
#                 WHERE ci.cart_id = %s AND ci.supplier_id = %s
#             """, (order_id, cart_id, supplier_id))

#             # ORDER ADDRESS
#             cur.execute("""
#                 INSERT INTO order_address (
#                     order_id,
#                     address_for,
#                     contact_name,
#                     phone,
#                     email,
#                     address_line,
#                     street,
#                     zone,
#                     building,
#                     unit_no,
#                     city,
#                     country,
#                     zip_code
#                 )
#                 VALUES (%s,'RESTAURANT_DELIVERY',%s,%s,%s,%s,%s,%s,NULL,NULL,%s,%s,%s)
#             """, (
#                 order_id,
#                 data["name"],
#                 data["phone"],
#                 data.get("email"),
#                 data["address"],
#                 data.get("state"),
#                 data.get("note"),
#                 data.get("city"),
#                 data.get("country"),
#                 data.get("zip")
#             ))

#             created_orders.append({
#                 "order_id": order_id,
#                 "supplier_id": supplier_id,
#                 "amount": float(subtotal)
#             })

#         # =================================================
#         # 🔥 CRITICAL FIX
#         # ARCHIVE OLD COMPLETED CARTS FIRST
#         # =================================================
#         cur.execute("""
#             UPDATE cart_header
#             SET status = 'ARCHIVED'
#             WHERE restaurant_id = %s
#               AND status = 'COMPLETED'
#         """, (restaurant_id,))

#         # =================================================
#         # 4️⃣ COMPLETE CURRENT CART
#         # =================================================
#         cur.execute("""
#             UPDATE cart_header
#             SET status = 'COMPLETED', updated_at = now()
#             WHERE cart_id = %s
#         """, (cart_id,))

#         # =================================================
#         # 5️⃣ CREATE NEW ACTIVE CART
#         # =================================================
#         cur.execute("""
#             INSERT INTO cart_header (restaurant_id, status)
#             VALUES (%s, 'ACTIVE')
#         """, (restaurant_id,))

#         conn.commit()

#         return jsonify({
#             "success": True,
#             "orders_created": created_orders
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         print("❌ CHECKOUT ERROR:", str(e))
#         return jsonify({"error": "Checkout failed", "details": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()























# from flask import Blueprint, request, jsonify
# from db import get_db_connection
# from psycopg2.extras import RealDictCursor
# from datetime import datetime
# import time
# import jwt

# JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# checkout_bp = Blueprint("checkout_bp", __name__)

# # =====================================================
# # JWT → RESTAURANT CONTEXT
# # =====================================================
# def get_restaurant_id_from_token():
#     auth = request.headers.get("Authorization", "")
#     if not auth.startswith("Bearer "):
#         return None

#     try:
#         token = auth.replace("Bearer ", "")
#         decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#         if decoded.get("role") != "restaurant":
#             return None
#         return decoded.get("linked_id")
#     except Exception:
#         return None


# # =====================================================
# # CHECKOUT – MULTI SUPPLIER + NOTIFICATIONS
# # =====================================================
# @checkout_bp.route("/checkout", methods=["POST"])
# def checkout():
#     data = request.get_json() or {}

#     restaurant_id = get_restaurant_id_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     # Required fields
#     for field in ("name", "phone", "address"):
#         if not data.get(field):
#             return jsonify({"error": f"{field} is required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # =================================================
#         # 1️⃣ LOCK ACTIVE CART
#         # =================================================
#         cur.execute("""
#             SELECT cart_id
#             FROM cart_header
#             WHERE restaurant_id = %s
#               AND status = 'ACTIVE'
#             FOR UPDATE
#         """, (restaurant_id,))
#         cart = cur.fetchone()

#         if not cart:
#             return jsonify({"error": "No active cart found"}), 400

#         cart_id = cart["cart_id"]

#         # =================================================
#         # 2️⃣ GET SUPPLIERS FROM CART
#         # =================================================
#         cur.execute("""
#             SELECT DISTINCT supplier_id
#             FROM cart_items
#             WHERE cart_id = %s
#         """, (cart_id,))
#         suppliers = cur.fetchall()

#         if not suppliers:
#             return jsonify({"error": "Cart is empty"}), 400

#         created_orders = []

#         # =================================================
#         # 3️⃣ CREATE ORDERS PER SUPPLIER
#         # =================================================
#         for s in suppliers:
#             supplier_id = s["supplier_id"]

#             # Custom order id (your existing pattern)
#             order_id = f"ORD{int(time.time() * 1000)}{supplier_id}"

#             # Calculate subtotal
#             cur.execute("""
#                 SELECT COALESCE(SUM(quantity * price_per_unit), 0) AS subtotal
#                 FROM cart_items
#                 WHERE cart_id = %s
#                   AND supplier_id = %s
#             """, (cart_id, supplier_id))
#             subtotal = cur.fetchone()["subtotal"]

#             if subtotal <= 0:
#                 continue

#             # -------------------------------------------------
#             # ORDER HEADER
#             # -------------------------------------------------
#             cur.execute("""
#                 INSERT INTO order_header (
#                     order_id,
#                     restaurant_id,
#                     supplier_id,
#                     order_date,
#                     status,
#                     payment_status,
#                     total_amount,
#                     remarks
#                 )
#                 VALUES (%s,%s,%s,%s,'PLACED','UNPAID',%s,%s)
#             """, (
#                 order_id,
#                 restaurant_id,
#                 supplier_id,
#                 datetime.now(),
#                 subtotal,
#                 data.get("note")
#             ))

#             # -------------------------------------------------
#             # 🔔 SUPPLIER NOTIFICATION (CRITICAL)
#             # -------------------------------------------------
#             cur.execute("""
#                 INSERT INTO supplier_notifications
#                 (
#                     supplier_id,
#                     type,
#                     title,
#                     message,
#                     reference_id
#                 )
#                 VALUES
#                 (
#                     %s,
#                     'NEW_ORDER',
#                     'New Order Received',
#                     %s,
#                     %s
#                 )
#             """, (
#                 supplier_id,
#                 f"You have received a new order #{order_id}",
#                 order_id
#             ))

#             # -------------------------------------------------
#             # ORDER ITEMS
#             # -------------------------------------------------
#             cur.execute("""
#                 INSERT INTO order_items (
#                     order_id,
#                     product_id,
#                     product_name_english,
#                     quantity,
#                     price_per_unit,
#                     discount,
#                     total_amount
#                 )
#                 SELECT
#                     %s,
#                     ci.product_id,
#                     pm.product_name_english,
#                     ci.quantity,
#                     ci.price_per_unit,
#                     0,
#                     ci.quantity * ci.price_per_unit
#                 FROM cart_items ci
#                 JOIN product_management pm
#                   ON pm.product_id = ci.product_id
#                 WHERE ci.cart_id = %s
#                   AND ci.supplier_id = %s
#             """, (order_id, cart_id, supplier_id))

#             # -------------------------------------------------
#             # ORDER ADDRESS
#             # -------------------------------------------------
#             cur.execute("""
#                 INSERT INTO order_address (
#                     order_id,
#                     address_for,
#                     contact_name,
#                     phone,
#                     email,
#                     address_line,
#                     street,
#                     zone,
#                     building,
#                     unit_no,
#                     city,
#                     country,
#                     zip_code
#                 )
#                 VALUES (
#                     %s,
#                     'RESTAURANT_DELIVERY',
#                     %s,%s,%s,
#                     %s,%s,%s,
#                     NULL,NULL,
#                     %s,%s,%s
#                 )
#             """, (
#                 order_id,
#                 data["name"],
#                 data["phone"],
#                 data.get("email"),
#                 data["address"],
#                 data.get("state"),
#                 data.get("note"),
#                 data.get("city"),
#                 data.get("country"),
#                 data.get("zip")
#             ))

#             created_orders.append({
#                 "order_id": order_id,
#                 "supplier_id": supplier_id,
#                 "amount": float(subtotal)
#             })

#         # =================================================
#         # 4️⃣ ARCHIVE OLD COMPLETED CARTS
#         # =================================================
#         cur.execute("""
#             UPDATE cart_header
#             SET status = 'ARCHIVED'
#             WHERE restaurant_id = %s
#               AND status = 'COMPLETED'
#         """, (restaurant_id,))

#         # =================================================
#         # 5️⃣ COMPLETE CURRENT CART
#         # =================================================
#         cur.execute("""
#             UPDATE cart_header
#             SET status = 'COMPLETED',
#                 updated_at = NOW()
#             WHERE cart_id = %s
#         """, (cart_id,))

#         # =================================================
#         # 6️⃣ CREATE NEW ACTIVE CART
#         # =================================================
#         cur.execute("""
#             INSERT INTO cart_header (restaurant_id, status)
#             VALUES (%s, 'ACTIVE')
#         """, (restaurant_id,))

#         conn.commit()

#         return jsonify({
#             "success": True,
#             "orders_created": created_orders
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         print("❌ CHECKOUT ERROR:", str(e))
#         return jsonify({
#             "error": "Checkout failed",
#             "details": str(e)
#         }), 500

#     finally:
#         cur.close()
#         conn.close()

from flask import Blueprint, request, jsonify
from db import get_db_connection
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import time
import jwt

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

checkout_bp = Blueprint("checkout_bp", __name__)


# =====================================================
# JWT → RESTAURANT CONTEXT
# =====================================================
def get_restaurant_id_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    try:
        token = auth.replace("Bearer ", "")
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if decoded.get("role") != "restaurant":
            return None
        return decoded.get("linked_id")
    except Exception:
        return None


# # =====================================================
# # CHECKOUT
# # =====================================================
# @checkout_bp.route("/checkout", methods=["POST"])
# def checkout():

#     data = request.get_json() or {}
#     payment_method = data.get("payment_method", "COD")

#     restaurant_id = get_restaurant_id_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     # for field in ("name", "phone", "address"):
#     #     if not data.get(field):
#     #         return jsonify({"error": f"{field} is required"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # ================= CREDIT LOCK =================
#         cur.execute("""
#             SELECT credit_limit, credit_used, credit_days, is_credit_blocked
#             FROM restaurant_registration
#             WHERE restaurant_id = %s
#             FOR UPDATE
#         """, (restaurant_id,))
#         credit_info = cur.fetchone()

#         if payment_method == "CREDIT" and credit_info["is_credit_blocked"]:
#             return jsonify({"error": "Credit account is blocked"}), 400

#         # ================= CART LOCK =================
#         cur.execute("""
#             SELECT cart_id
#             FROM cart_header
#             WHERE restaurant_id = %s
#               AND status = 'ACTIVE'
#             FOR UPDATE
#         """, (restaurant_id,))
#         cart = cur.fetchone()

#         if not cart:
#             return jsonify({"error": "No active cart found"}), 400

#         cart_id = cart["cart_id"]

#         # ================= SUPPLIERS =================
#         cur.execute("""
#             SELECT DISTINCT supplier_id
#             FROM cart_items
#             WHERE cart_id = %s
#         """, (cart_id,))
#         suppliers = cur.fetchall()

#         if not suppliers:
#             return jsonify({"error": "Cart is empty"}), 400

#         created_orders = []

#         # =================================================
#         # 🔁 LOOP SUPPLIERS
#         # =================================================
#         for s in suppliers:

#             supplier_id = s["supplier_id"]
#             order_id = f"ORD{int(time.time() * 1000)}{supplier_id}"

#             # subtotal
#             cur.execute("""
#                 SELECT COALESCE(SUM(quantity * price_per_unit), 0) AS subtotal
#                 FROM cart_items
#                 WHERE cart_id = %s AND supplier_id = %s
#             """, (cart_id, supplier_id))

#             subtotal = float(cur.fetchone()["subtotal"] or 0)

#             if subtotal <= 0:
#                 continue

#             order_time = datetime.now()

#             # ================= CREDIT =================
#             credit_due_date = None
#             credit_status = None
#             payment_status = "UNPAID"

#             remaining_credit = 0
#             limit_val = float(credit_info["credit_limit"] or 0)
#             used_val = float(credit_info["credit_used"] or 0)
#             credit_days = int(credit_info["credit_days"] or 0)

#             if payment_method == "CREDIT":

#                 available_credit = limit_val - used_val

#                 if subtotal > available_credit:
#                     return jsonify({
#                         "error": f"Credit limit exceeded. Available: {available_credit}"
#                     }), 400

#                 cur.execute("""
#                     UPDATE restaurant_registration
#                     SET credit_used = credit_used + %s
#                     WHERE restaurant_id = %s
#                 """, (subtotal, restaurant_id))

#                 remaining_credit = available_credit - subtotal
#                 credit_due_date = order_time.date() + timedelta(days=credit_days)
#                 credit_status = "PENDING"

#             # ================= PAYMENT =================
#             if payment_method == "CREDIT":
#                 restaurant_paid_amount = 0
#                 restaurant_due_amount = subtotal
#                 restaurant_payment_status = "UNPAID"

#                 supplier_paid_amount = 0
#                 supplier_due_amount = subtotal
#                 supplier_payment_status = "UNPAID"
#             else:
#                 restaurant_paid_amount = subtotal
#                 restaurant_due_amount = 0
#                 restaurant_payment_status = "PAID"

#                 supplier_paid_amount = 0
#                 supplier_due_amount = subtotal
#                 supplier_payment_status = "UNPAID"

#             # ================= ORDER HEADER =================
#             cur.execute("""
#                 INSERT INTO order_header (
#                     order_id, restaurant_id, supplier_id, order_date,
#                     status, payment_status, total_amount, remarks,
#                     payment_method, credit_due_date, credit_status,
#                     restaurant_paid_amount, restaurant_due_amount, restaurant_payment_status,
#                     supplier_paid_amount, supplier_due_amount, supplier_payment_status
#                 )
#                 VALUES (%s,%s,%s,%s,
#                         'PLACED',%s,%s,%s,
#                         %s,%s,%s,
#                         %s,%s,%s,
#                         %s,%s,%s)
#             """, (
#                 order_id,
#                 restaurant_id,
#                 supplier_id,
#                 order_time,
#                 payment_status,
#                 subtotal,
#                 data.get("note"),
#                 payment_method,
#                 credit_due_date,
#                 credit_status,
#                 restaurant_paid_amount,
#                 restaurant_due_amount,
#                 restaurant_payment_status,
#                 supplier_paid_amount,
#                 supplier_due_amount,
#                 supplier_payment_status
#             ))

#             # cur.execute("""
#             #     INSERT INTO order_header (
#             #         order_id, restaurant_id, supplier_id, order_date,
#             #         status, payment_status, total_amount, remarks,
#             #         payment_method
#             #     )
#             #     VALUES (%s,%s,%s,%s,
#             #             'PLACED','UNPAID',%s,%s,
#             #             %s)
#             # """, (
#             #     order_id,
#             #     restaurant_id,
#             #     supplier_id,
#             #     order_time,
#             #     subtotal,
#             #     data.get("note"),
#             #     payment_method
#             # ))

#             # ================= SUPPLIER NOTIFICATION =================
#             cur.execute("""
#                 INSERT INTO supplier_notifications
#                 (supplier_id, type, title, message, reference_id)
#                 VALUES (%s,'NEW_ORDER','New Order Received',%s,%s)
#             """, (
#                 supplier_id,
#                 f"You have received a new order #{order_id}",
#                 order_id
#             ))

#             # ================= ORDER ITEMS =================
#             cur.execute("""
#                 INSERT INTO order_items (
#                     order_id, product_id, product_name_english,
#                     quantity, price_per_unit, discount, total_amount
#                 )
#                 SELECT
#                     %s,
#                     ci.product_id,
#                     pm.product_name_english,
#                     ci.quantity,
#                     ci.price_per_unit,
#                     0,
#                     ci.quantity * ci.price_per_unit
#                 FROM cart_items ci
#                 JOIN product_management pm
#                   ON pm.product_id = ci.product_id
#                 WHERE ci.cart_id = %s AND ci.supplier_id = %s
#             """, (order_id, cart_id, supplier_id))

#             # =================================================
#             # 📍 ORDER ADDRESS (UPDATED WITH LAT/LNG)
#             # =================================================
#             cur.execute("""
#                 INSERT INTO order_address (
#                     order_id, address_for, contact_name, phone, email,
#                     address_line, street, zone,
#                     building, unit_no,
#                     city, country, zip_code,
#                     lat, lng
#                 )
#                 VALUES (
#                     %s,'RESTAURANT_DELIVERY',
#                     %s,%s,%s,
#                     %s,%s,%s,
#                     NULL,NULL,
#                     %s,%s,%s,
#                     %s,%s
#                 )
#             """, (
#                 order_id,
#                 data["name"],
#                 data["phone"],
#                 data.get("email"),
#                 data["address"],
#                 data.get("state"),
#                 data.get("note"),
#                 data.get("city"),
#                 data.get("country"),
#                 data.get("zip"),
#                 data.get("lat"),   # ✅ NEW
#                 data.get("lng")    # ✅ NEW
#             ))

#             cur.execute("""
#                 SELECT company_name_english,
#                     company_name_arabic
#                 FROM supplier_registration
#                 WHERE supplier_id = %s
#             """, (supplier_id,))

#             supplier = cur.fetchone()

#             created_orders.append({

#                 "order_id": order_id,

#                 "supplier_id": supplier_id,

#                 "supplier_name_english":
#                     supplier["company_name_english"],

#                 "supplier_name_arabic":
#                     supplier["company_name_arabic"],

#                 "amount": subtotal,

#                 "payment_method": payment_method

#             })


#        # ================= ARCHIVE =================
#         cur.execute("""
#             UPDATE cart_header
#             SET status = 'ARCHIVED'
#             WHERE restaurant_id = %s AND status = 'COMPLETED'
#         """, (restaurant_id,))

#         conn.commit()

#         return jsonify({
#             "success": True,
#             "orders_created": created_orders
#         }), 200

#         # # ================= COMPLETE CART =================
#         # cur.execute("""
#         #     UPDATE cart_header
#         #     SET status = 'COMPLETED', updated_at = NOW()
#         #     WHERE cart_id = %s
#         # """, (cart_id,))

#         # # ================= NEW CART =================
#         # cur.execute("""
#         #     INSERT INTO cart_header (restaurant_id, status)
#         #     VALUES (%s, 'ACTIVE')
#         # """, (restaurant_id,))

#         # conn.commit()

#         # return jsonify({
#         #     "success": True,
#         #     "orders_created": created_orders
#         # }), 200

#     except Exception as e:
#         conn.rollback()
#         print("❌ CHECKOUT ERROR:", str(e))
#         return jsonify({
#             "error": "Checkout failed",
#             "details": str(e)
#         }), 500

#     finally:
#         cur.close()
#         conn.close()



# =====================================================
# CHECKOUT
# =====================================================
@checkout_bp.route("/checkout", methods=["POST"])
def checkout():

    data = request.get_json() or {}
    payment_method = data.get("payment_method", "COD")

    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    # for field in ("name", "phone", "address"):
    #     if not data.get(field):
    #         return jsonify({"error": f"{field} is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ================= CREDIT LOCK =================
        cur.execute("""
            SELECT credit_limit, credit_used, credit_days, is_credit_blocked
            FROM restaurant_registration
            WHERE restaurant_id = %s
            FOR UPDATE
        """, (restaurant_id,))
        credit_info = cur.fetchone()

        if payment_method == "CREDIT" and credit_info["is_credit_blocked"]:
            return jsonify({"error": "Credit account is blocked"}), 400

        # ================= CART LOCK =================
        cur.execute("""
            SELECT cart_id
            FROM cart_header
            WHERE restaurant_id = %s
              AND status = 'ACTIVE'
            FOR UPDATE
        """, (restaurant_id,))
        cart = cur.fetchone()

        if not cart:
            return jsonify({"error": "No active cart found"}), 400

        cart_id = cart["cart_id"]

        # ================= SUPPLIERS =================
        cur.execute("""
            SELECT DISTINCT supplier_id
            FROM cart_items
            WHERE cart_id = %s
        """, (cart_id,))
        suppliers = cur.fetchall()

        if not suppliers:
            return jsonify({"error": "Cart is empty"}), 400

        created_orders = []

        # ============================================
        # MASTER REFERENCE ORDER
        # ============================================
        master_order_id = (
            "MH-" +
            datetime.now().strftime("%Y%m%d-%H%M%S")
        )

        # =================================================
        # 🔁 LOOP SUPPLIERS
        # =================================================
        for s in suppliers:

            supplier_id = s["supplier_id"]
            order_id = f"ORD{int(time.time() * 1000)}{supplier_id}"

            # subtotal
            cur.execute("""
                SELECT COALESCE(SUM(quantity * price_per_unit), 0) AS subtotal
                FROM cart_items
                WHERE cart_id = %s AND supplier_id = %s
            """, (cart_id, supplier_id))

            subtotal = float(cur.fetchone()["subtotal"] or 0)

            if subtotal <= 0:
                continue

            order_time = datetime.now()

            # ================= CREDIT =================
            credit_due_date = None
            credit_status = None
            payment_status = "UNPAID"

            remaining_credit = 0
            limit_val = float(credit_info["credit_limit"] or 0)
            used_val = float(credit_info["credit_used"] or 0)
            credit_days = int(credit_info["credit_days"] or 0)

            if payment_method == "CREDIT":

                available_credit = limit_val - used_val

                if subtotal > available_credit:
                    return jsonify({
                        "error": f"Credit limit exceeded. Available: {available_credit}"
                    }), 400

                cur.execute("""
                    UPDATE restaurant_registration
                    SET credit_used = credit_used + %s
                    WHERE restaurant_id = %s
                """, (subtotal, restaurant_id))

                remaining_credit = available_credit - subtotal
                credit_due_date = order_time.date() + timedelta(days=credit_days)
                credit_status = "PENDING"

            # ================= PAYMENT =================
            if payment_method == "CREDIT":
                restaurant_paid_amount = 0
                restaurant_due_amount = subtotal
                restaurant_payment_status = "UNPAID"

                supplier_paid_amount = 0
                supplier_due_amount = subtotal
                supplier_payment_status = "UNPAID"
            else:
                restaurant_paid_amount = subtotal
                restaurant_due_amount = 0
                restaurant_payment_status = "PAID"

                supplier_paid_amount = 0
                supplier_due_amount = subtotal
                supplier_payment_status = "UNPAID"

            # ================= ORDER HEADER =================
            cur.execute("""
                INSERT INTO order_header (
                    order_id, master_order_id, restaurant_id, supplier_id, order_date,
                    status, payment_status, total_amount, remarks,
                    payment_method, credit_due_date, credit_status, delivery_instructions,
                    restaurant_paid_amount, restaurant_due_amount, restaurant_payment_status,
                    supplier_paid_amount, supplier_due_amount, supplier_payment_status
                )
                VALUES (

                %s, %s, %s, %s, %s,

                'PLACED',

                %s,
                %s,
                %s,

                %s,
                %s,
                %s,
                %s,

                %s,
                %s,
                %s,

                %s,
                %s,
                %s

            )
            """, 
           (
            order_id,
            master_order_id,
            restaurant_id,
            supplier_id,
            order_time,

            payment_status,
            subtotal,
            data.get("note"),

            payment_method,
            credit_due_date,
            credit_status,
            data.get("delivery_instructions"),

            restaurant_paid_amount,
            restaurant_due_amount,
            restaurant_payment_status,

            supplier_paid_amount,
            supplier_due_amount,
            supplier_payment_status
        ))

            # cur.execute("""
            #     INSERT INTO order_header (
            #         order_id, restaurant_id, supplier_id, order_date,
            #         status, payment_status, total_amount, remarks,
            #         payment_method
            #     )
            #     VALUES (%s,%s,%s,%s,
            #             'PLACED','UNPAID',%s,%s,
            #             %s)
            # """, (
            #     order_id,
            #     restaurant_id,
            #     supplier_id,
            #     order_time,
            #     subtotal,
            #     data.get("note"),
            #     payment_method
            # ))

            # ================= SUPPLIER NOTIFICATION =================
            cur.execute("""
                INSERT INTO supplier_notifications
                (supplier_id, type, title, message, reference_id)
                VALUES (%s,'NEW_ORDER','New Order Received',%s,%s)
            """, (
                supplier_id,
                f"You have received a new order #{order_id}",
                order_id
            ))

            # ================= ORDER ITEMS =================
            cur.execute("""
                INSERT INTO order_items (
                    order_id, product_id, product_name_english,
                    quantity, price_per_unit, discount, total_amount
                )
                SELECT
                    %s,
                    ci.product_id,
                    pm.product_name_english,
                    ci.quantity,
                    ci.price_per_unit,
                    0,
                    ci.quantity * ci.price_per_unit
                FROM cart_items ci
                JOIN product_management pm
                  ON pm.product_id = ci.product_id
                WHERE ci.cart_id = %s AND ci.supplier_id = %s
            """, (order_id, cart_id, supplier_id))

            # =================================================
            # 📍 ORDER ADDRESS (UPDATED WITH LAT/LNG)
            # =================================================
            cur.execute("""
                INSERT INTO order_address (
                    order_id, address_for, contact_name, phone, email,
                    address_line, street, zone,
                    building, unit_no,
                    city, country, zip_code,
                    lat, lng
                )
                VALUES (
                    %s,'RESTAURANT_DELIVERY',
                    %s,%s,%s,
                    %s,%s,%s,
                    NULL,NULL,
                    %s,%s,%s,
                    %s,%s
                )
            """, (
                order_id,
                data["name"],
                data["phone"],
                data.get("email"),
                data["address"],
                data.get("state"),
                data.get("note"),
                data.get("city"),
                data.get("country"),
                data.get("zip"),
                data.get("lat"),   # ✅ NEW
                data.get("lng")    # ✅ NEW
            ))

            cur.execute("""
                SELECT company_name_english,
                    company_name_arabic
                FROM supplier_registration
                WHERE supplier_id = %s
            """, (supplier_id,))

            supplier = cur.fetchone()

            created_orders.append({

                "master_order_id": master_order_id,

                "order_id": order_id,

                "supplier_id": supplier_id,

                "supplier_name_english":
                    supplier["company_name_english"],

                "supplier_name_arabic":
                    supplier["company_name_arabic"],

                "amount": subtotal,

                "payment_method": payment_method

            })


       # ================= ARCHIVE =================
        cur.execute("""
            UPDATE cart_header
            SET status = 'ARCHIVED'
            WHERE restaurant_id = %s AND status = 'COMPLETED'
        """, (restaurant_id,))

        conn.commit()

        return jsonify({
            "success": True,
            "master_order_id": master_order_id,
            "orders_created": created_orders
        }), 200

        # # ================= COMPLETE CART =================
        # cur.execute("""
        #     UPDATE cart_header
        #     SET status = 'COMPLETED', updated_at = NOW()
        #     WHERE cart_id = %s
        # """, (cart_id,))

        # # ================= NEW CART =================
        # cur.execute("""
        #     INSERT INTO cart_header (restaurant_id, status)
        #     VALUES (%s, 'ACTIVE')
        # """, (restaurant_id,))

        # conn.commit()

        # return jsonify({
        #     "success": True,
        #     "orders_created": created_orders
        # }), 200

    except Exception as e:
        conn.rollback()
        print("❌ CHECKOUT ERROR:", str(e))
        return jsonify({
            "error": "Checkout failed",
            "details": str(e)
        }), 500

    finally:
        cur.close()
        conn.close()


# =====================================================
# CREDIT INFO
# =====================================================
@checkout_bp.route("/restaurant/credit-info", methods=["GET"])
def credit_info():

    restaurant_id = get_restaurant_id_from_token()

    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT credit_limit, credit_used, credit_days
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    rest = cur.fetchone()

    if not rest:
        return jsonify({}), 404

    credit_limit = float(rest["credit_limit"] or 0)
    credit_used = float(rest["credit_used"] or 0)
    credit_days = int(rest["credit_days"] or 0)

    cur.execute("""
        SELECT MIN(credit_due_date) AS next_due_date
        FROM order_header
        WHERE restaurant_id = %s
          AND payment_method = 'CREDIT'
          AND payment_status = 'UNPAID'
    """, (restaurant_id,))

    next_due = cur.fetchone()["next_due_date"]

    cur.execute("""
        SELECT COALESCE(SUM(restaurant_due_amount),0) AS overdue_amount
        FROM order_header
        WHERE restaurant_id = %s
        AND payment_method = 'CREDIT'
        AND restaurant_due_amount > 0
        AND credit_due_date < CURRENT_DATE
    """, (restaurant_id,))

    overdue = float(cur.fetchone()["overdue_amount"] or 0)

    cur.close()
    conn.close()

    return jsonify({
        "credit_limit": credit_limit,
        "credit_used": credit_used,
        "credit_available": credit_limit - credit_used,
        "credit_days": credit_days,
        "next_due_date": next_due,
        "overdue_amount": overdue
    })


# =====================================================
# PROFILE
# =====================================================
@checkout_bp.route("/restaurant/profile", methods=["GET"])
def restaurant_profile():

    restaurant_id = get_restaurant_id_from_token()

    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT contact_person_name, contact_person_mobile
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    data = cur.fetchone()

    cur.close()
    conn.close()

    if not data:
        return jsonify({"error": "Not found"}), 404

    return jsonify({
        "name": data["contact_person_name"],
        "phone": data["contact_person_mobile"]
    })

@checkout_bp.route("/address/save", methods=["POST"])
def save_address():
    data = request.json
    restaurant_id = get_restaurant_id_from_token()

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)  # ✅ FIX

    try:
        cur.execute("""
            INSERT INTO user_addresses
            (restaurant_id, name, phone, address, city, state, pincode)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            RETURNING id
        """, (
            restaurant_id,
            data["name"],
            data["phone"],
            data["address"],
            data["city"],
            data["state"],
            data["pincode"]
        ))

        row = cur.fetchone()

        new_id = row["id"] if row else None   # ✅ FIX

        conn.commit()

        return jsonify({
            "success": True,
            "id": new_id
        })

    except Exception as e:
        conn.rollback()
        print("❌ ADDRESS SAVE ERROR:", str(e))
        return jsonify({
            "error": "Address save failed",
            "details": str(e)
        }), 500

    finally:
        cur.close()
        conn.close()
   

# ✅ NEW LINE
@checkout_bp.route("/address/update/<int:id>", methods=["PUT"])
def update_address(id):
    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE user_addresses
        SET name=%s, phone=%s, address=%s
        WHERE id=%s
    """, (data["name"], data["phone"], data["address"], id))

    conn.commit()
    return jsonify({"success": True})
@checkout_bp.route("/address/delete/<int:id>", methods=["DELETE"])
def delete_address(id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM user_addresses WHERE id=%s", (id,))
    conn.commit()

    return jsonify({"success": True})



@checkout_bp.route("/location/address", methods=["GET", "POST", "OPTIONS"])
def get_location_address():

    if request.method == "OPTIONS":
        return "", 200

    if request.method == "POST":
        data = request.json
        return jsonify({
            "success": True,
            "received": data
        })

    return jsonify({
        "message": "Location endpoint working"
    }), 200
    
@checkout_bp.route("/location/save", methods=["POST", "OPTIONS"])
def save_location():

    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json()

    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not latitude or not longitude:
        return jsonify({"error": "Missing coordinates"}), 400

    print("📍 Location saved:", latitude, longitude)

    return jsonify({
        "success": True,
        "message": "Location received"
    }), 200
    
@checkout_bp.route("/location/address/default/<int:id>", methods=["GET"])
def get_default_address(id):
    return jsonify({
        "id": id,
        "address": "Default Address Placeholder"
    }), 200
    
@checkout_bp.route("/notifications/count", methods=["GET", "OPTIONS"])
def notifications_count():

    if request.method == "OPTIONS":
        return "", 200

    restaurant_id = get_restaurant_id_from_token()
    if not restaurant_id:
        return jsonify({"count": 0}), 200

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT COUNT(*) AS count
            FROM supplier_notifications
            WHERE supplier_id = %s
        """, (restaurant_id,))

        result = cur.fetchone()
        return jsonify({"count": result["count"]}), 200

    except Exception as e:
        print("❌ NOTIFICATION ERROR:", str(e))
        return jsonify({"count": 0}), 200

    finally:
        cur.close()
        conn.close()