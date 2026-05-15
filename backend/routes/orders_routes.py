from flask import Blueprint, request, jsonify
from flask_cors import CORS
from db import get_db_connection
from psycopg2.extras import RealDictCursor
from datetime import datetime
import psycopg2
import os
import json
import traceback
import jwt
from utils.driver_token import generate_driver_token
from middleware.driver_auth import driver_required
import random
import urllib.parse
from services.inventory_alerts import (
    send_low_stock_email,
    send_out_of_stock_email
)
JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# def get_supplier_from_token():
#     auth = request.headers.get("Authorization", "")
#     if not auth.startswith("Bearer "):
#         return None, ("Unauthorized", 401)

#     token = auth.replace("Bearer ", "")

#     try:
#         decoded = jwt.decode(
#             token,
#             JWT_SECRET,
#             algorithms=["HS256"],
#             options={"require": ["role", "linked_id"]}
#         )

#         if decoded.get("role", "").upper() != "SUPPLIER":
#             return None, ("Forbidden", 403)


#         return decoded["linked_id"], None

#     except jwt.ExpiredSignatureError:
#         return None, ("Token expired", 401)

#     except jwt.InvalidTokenError as e:
#         print("JWT ERROR:", e)
#         return None, ("Invalid token", 401)
def get_supplier_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, ("Unauthorized", 401)

    token = auth.replace("Bearer ", "")

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        role = decoded.get("role", "").upper()
        if role != "SUPPLIER":
            return None, ("Forbidden", 403)

        supplier_id = decoded.get("linked_id")

        if not supplier_id:
            print("❌ TOKEN PAYLOAD:", decoded)
            return None, ("Supplier ID missing in token", 401)

        return supplier_id, None

    except jwt.ExpiredSignatureError:
        return None, ("Token expired", 401)

    except Exception as e:
        print("❌ JWT ERROR:", type(e), e)
        return None, ("Invalid token", 401)



def get_restaurant_from_token():
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


# ----------------------------------------------
# Blueprint setup
# ----------------------------------------------
order_bp = Blueprint("order_bp", __name__)
# CORS(order_bp, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
CORS(
    order_bp,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=False
)
restaurant_bp = Blueprint("restaurant_bp", __name__)

# -------------------------------------------------
# Helper: Direct Azure connection for general
# -------------------------------------------------
def get_azure_connection():
    """Connect directly to Azure DB (alifmahal)."""
    try:
        conn = psycopg2.connect(
            host=os.getenv("AZURE_DB_HOST"),
            database=os.getenv("AZURE_DB_NAME"),
            user=os.getenv("AZURE_DB_USER"),
            password=os.getenv("AZURE_DB_PASSWORD"),
            port=os.getenv("AZURE_DB_PORT", "5432"),
            sslmode=os.getenv("AZURE_DB_SSLMODE", "require"),
            cursor_factory=RealDictCursor
        )
        print("✅ Connected directly to Azure DB for general")
        return conn
    except Exception as e:
        print("❌ Azure DB connection failed (general):", e)
        raise e
@order_bp.route("/orders-summary", methods=["GET"])
def supplier_orders_summary():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                DATE(order_date) AS date,
                COUNT(*) AS orders
            FROM order_header
            WHERE supplier_id = %s
            GROUP BY DATE(order_date)
            ORDER BY date;
        """, (supplier_id,))

        return jsonify(cur.fetchall()), 200
    finally:
        cur.close()
        conn.close()

@order_bp.route("/sales-summary", methods=["GET"])
def supplier_sales_summary():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]
   
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                DATE(order_date) AS date,
                SUM(total_amount) AS revenue
            FROM order_header
            WHERE supplier_id = %s
            GROUP BY DATE(order_date)
            ORDER BY date;
        """, (supplier_id,))

        return jsonify(cur.fetchall()), 200
    finally:
        cur.close()
        conn.close()

@order_bp.route("/", methods=["GET"])
def get_orders():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                oh.order_id,
                oh.supplier_id,
                rr.restaurant_name_english,
                rr.restaurant_name_arabic,
                oh.order_date,
                oh.total_amount,
                oh.status,
                oh.payment_status,
                oh.payment_method,
                    -- ✅ ADD THIS BACK
                oh.is_recurring,
                ro.frequency,
                ro.next_run_date,
                ro.status AS recurring_status
            FROM order_header oh
            JOIN restaurant_registration rr
                ON rr.restaurant_id = oh.restaurant_id
                    
            LEFT JOIN recurring_orders ro
                ON ro.order_id = oh.order_id
            WHERE oh.supplier_id = %s
            ORDER BY oh.order_date DESC
        """, (supplier_id,))

        return jsonify(cur.fetchall()), 200
    finally:
        cur.close()
        conn.close()




@order_bp.route("/<order_id>", methods=["GET"])
def get_order_details(order_id):
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]


    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
           SELECT
            oh.order_id,
            oh.restaurant_id,
            oh.supplier_id,
            oh.order_date,
            oh.expected_delivery_date,
            oh.status,
            oh.payment_status,
            oh.total_amount,
            oh.remarks,

            gh.status AS grn_status,

            rr.restaurant_name_english,
            rr.restaurant_name_arabic,

            -- Names
            COALESCE(rs.branch_name, rr.restaurant_name_english) AS branch_name,
            COALESCE(rs.store_name_english, rr.restaurant_name_english) AS store_name_english,
            COALESCE(rs.contact_person_name, rr.contact_person_name) AS contact_person_name,

            -- 🔑 FIXED: phone + email
            COALESCE(
                rs.contact_person_mobile,
                rr.contact_person_mobile::text
            ) AS contact_person_mobile,

            COALESCE(
                rs.email,
                rr.contact_person_email
            ) AS email,

            -- Address
            COALESCE(rs.street, rr.city) AS street,
            COALESCE(rs.zone, '') AS zone,
            COALESCE(rs.building, '') AS building,
            COALESCE(rs.shop_no, '') AS shop_no,
            COALESCE(rs.city, rr.city) AS city,
            COALESCE(rs.country, rr.country) AS country

        FROM order_header oh
        JOIN restaurant_registration rr
        ON rr.restaurant_id = oh.restaurant_id
        LEFT JOIN restaurant_store_registration rs
        ON rs.store_id = oh.store_id
        LEFT JOIN LATERAL (
            SELECT status
            FROM grn_header
            WHERE order_id = oh.order_id
            ORDER BY created_at DESC
            LIMIT 1
        ) gh ON true
        WHERE oh.order_id = %s
        AND oh.supplier_id = %s;

        """, (order_id, supplier_id))



        header = cur.fetchone()

        if not header:
            return jsonify({"error": "Order not found"}), 404

        # ===============================
        # ORDER ITEMS
        # ===============================
        cur.execute("""
            SELECT
                oi.item_id,
                oi.product_id,   -- ✅ FIXED
                oi.product_name_english,
                COALESCE(NULLIF(pm.product_name_arabic, ''), oi.product_name_english) 
                AS product_name_arabic,
                oi.quantity,
                oi.price_per_unit,
                oi.discount,
                oi.total_amount
            FROM order_items oi
            LEFT JOIN product_management pm
                ON pm.product_id = oi.product_id
            WHERE oi.order_id = %s
            ORDER BY oi.item_id
        """, (order_id,))
        items = cur.fetchall()

        # ===============================
        # STATUS TIMELINE
        # ===============================
        cur.execute("""
            SELECT
                status,
                changed_by_role,
                changed_by_id,
                changed_at
            FROM order_status_history
            WHERE order_id = %s
            ORDER BY changed_at ASC
        """, (order_id,))
        timeline = cur.fetchall()
        

        # ===============================
        # MODIFICATION STATUS (LATEST)
        # ===============================
        cur.execute("""
            SELECT status
            FROM order_modification_requests
            WHERE order_id = %s
            ORDER BY created_at DESC
            LIMIT 1
        """, (order_id,))

        mod = cur.fetchone()

        modification_status = mod["status"] if mod else None
        has_pending_modification = modification_status == "PENDING"


                # ===============================
        # ✅ RECURRING (FIXED POSITION)
        # ===============================
        cur.execute("""
            SELECT
                frequency,
                start_date,
                end_date,
                next_run_date,
                status,
                weekdays
            FROM recurring_orders
            WHERE order_id = %s
            LIMIT 1
        """, (order_id,))

        recurring = cur.fetchone()


        return jsonify({
            "header": header,
            "items": items,
            "timeline": timeline,
            "has_pending_modification": has_pending_modification,
            "modification_status": modification_status,
            "recurring": recurring
        }), 200

    finally:
        cur.close()
        conn.close()
@order_bp.route("/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get("status")

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ==================================================
        # 1️⃣ LOCK & FETCH CURRENT STATUS
        # ==================================================
        cur.execute("""
            SELECT status
            FROM order_header
            WHERE order_id = %s
              AND supplier_id = %s
            FOR UPDATE
        """, (order_id, supplier_id))

        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Order not found"}), 404

        old_status = row["status"]
        

        # ==================================================
        # 🚫 BLOCK STATUS CHANGE IF MODIFICATION IS PENDING
        # ==================================================
        cur.execute("""
            SELECT 1
            FROM order_modification_requests
            WHERE order_id = %s
            AND status = 'PENDING'
        """, (order_id,))

        if cur.fetchone():
            return jsonify({
                "error": "Cannot update status while modification request is pending"
            }), 400

        # ==================================================
        # 2️⃣ VALID STATUS TRANSITIONS
        # ==================================================
        allowed_transitions = {
            "PLACED": ["ACCEPTED", "REJECTED"],
            "ACCEPTED": ["PACKED"],
            "PACKED": ["OUT_FOR_DELIVERY"],
            "OUT_FOR_DELIVERY": ["DELIVERED"],
        }

        if old_status not in allowed_transitions:
            return jsonify({"error": "Invalid order state"}), 400

        if new_status not in allowed_transitions[old_status]:
            return jsonify({
                "error": f"Cannot move from {old_status} to {new_status}"
            }), 400

        # ==================================================
        # 3️⃣ UPDATE ORDER STATUS
        # ==================================================
        cur.execute("""
            UPDATE order_header
            SET status = %s,
                updated_at = NOW()
            WHERE order_id = %s
              AND supplier_id = %s
        """, (new_status, order_id, supplier_id))

        # ==================================================
        # 4️⃣ INSERT STATUS HISTORY
        # ==================================================
        cur.execute("""
            INSERT INTO order_status_history
            (order_id, status, changed_by_role, changed_by_id)
            VALUES (%s, %s, 'SUPPLIER', %s)
        """, (order_id, new_status, supplier_id))

        # ==================================================
        # 5️⃣ STOCK DEDUCTION (ONLY ON PLACED → ACCEPTED)
        # ==================================================
        if old_status == "PLACED" and new_status == "ACCEPTED":

            cur.execute("""
                SELECT product_id, quantity
                FROM order_items
                WHERE order_id = %s
            """, (order_id,))
            items = cur.fetchall()

            LOW_STOCK_THRESHOLD = 10

            for item in items:
                cur.execute("""
                    UPDATE product_management
                    SET stock_availability = stock_availability - %s
                    WHERE product_id = %s
                      AND supplier_id = %s
                    RETURNING
                        stock_availability,
                        low_stock_alert_sent,
                        out_of_stock_alert_sent,
                        product_name_english
                """, (
                    item["quantity"],
                    item["product_id"],
                    supplier_id
                ))

                product = cur.fetchone()
                product_name = product["product_name_english"]

                if not product:
                    raise Exception("Product not found")

                new_stock = product["stock_availability"]

                # 🔴 OUT OF STOCK
            if new_stock == 0 and not product["out_of_stock_alert_sent"]:
                send_out_of_stock_email(supplier_id, item["product_id"])

                cur.execute("""
                    INSERT INTO supplier_notifications
                    (supplier_id, type, title, message, reference_id)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    supplier_id,
                    "OUT_OF_STOCK",
                    "Product Out of Stock",
                    f"{product_name} is now out of stock.",
                    str(item["product_id"])
                ))

                cur.execute("""
                    UPDATE product_management
                    SET out_of_stock_alert_sent = TRUE
                    WHERE product_id = %s
                """, (item["product_id"],))

            # 🟠 LOW STOCK
            elif 0 < new_stock <= LOW_STOCK_THRESHOLD and not product["low_stock_alert_sent"]:
                send_low_stock_email(
                    supplier_id,
                    item["product_id"],
                    new_stock
                )

                cur.execute("""
                    INSERT INTO supplier_notifications
                    (supplier_id, type, title, message, reference_id)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    supplier_id,
                    "LOW_STOCK",
                    "Low Stock Alert",
                    f"{product_name} is running low (only {new_stock} left).",
                    str(item["product_id"])
                ))

                cur.execute("""
                    UPDATE product_management
                    SET low_stock_alert_sent = TRUE
                    WHERE product_id = %s
                """, (item["product_id"],))


        conn.commit()
        return jsonify({"message": "Order updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()




@order_bp.route("/<order_id>/reject", methods=["PUT"])
def reject_order(order_id):
    data = request.get_json() or {}
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]


    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # ✅ Update ONLY supplier's order
        cur.execute("""
            UPDATE order_header
            SET status = 'REJECTED'
            WHERE order_id = %s
              AND supplier_id = %s
        """, (order_id, supplier_id))

        if cur.rowcount == 0:
            return jsonify({"error": "Order not found"}), 404

        # ✅ Insert audit trail
        cur.execute("""
            INSERT INTO order_status_history
            (order_id, status, changed_by_role, changed_by_id)
            VALUES (%s, 'REJECTED', %s, %s)
        """, (order_id, "SUPPLIER", supplier_id))

        conn.commit()
        return jsonify({"message": "Order rejected successfully"}), 200

    except Exception:
        conn.rollback()
        traceback.print_exc()
        return jsonify({"error": "Reject failed"}), 500

    finally:
        cur.close()
        conn.close()


@order_bp.route("/dashboard-stats", methods=["GET"], strict_slashes=False)
def get_supplier_dashboard_stats():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ===============================
        # REVENUE (DELIVERED ONLY)
        # ===============================
        cur.execute("""
            SELECT COALESCE(SUM(total_amount), 0) AS revenue
            FROM order_header
            WHERE supplier_id = %s
              AND status = 'DELIVERED'
              AND DATE_TRUNC('month', order_date) = DATE_TRUNC('month', CURRENT_DATE)
        """, (supplier_id,))
        revenue = float(cur.fetchone()["revenue"])

        # ===============================
        # NEW ORDERS (KEEP AS IS ✅)
        # ===============================
        cur.execute("""
            SELECT COUNT(*) AS pending
            FROM order_header
            WHERE supplier_id = %s
              AND status IN ('PLACED','ACCEPTED')
        """, (supplier_id,))
        pending = cur.fetchone()["pending"]

        # ===============================
        # EXPIRING TODAY (KEEP AS IS ✅)
        # ===============================
        cur.execute("""
            SELECT COUNT(*) AS expiring_today
            FROM product_management
            WHERE supplier_id = %s
              AND expiry_date = CURRENT_DATE
              AND flag = 'A'
        """, (supplier_id,))
        expiring_today = cur.fetchone()["expiring_today"]

        # ===============================
        # TOP SELLING (DELIVERED ONLY)
        # ===============================
        cur.execute("""
            SELECT 
                oi.product_id,
                pm.product_name_english,
                SUM(oi.quantity) AS total_sold
            FROM order_items oi
            JOIN order_header oh ON oh.order_id = oi.order_id
            JOIN product_management pm ON pm.product_id = oi.product_id
            WHERE oh.supplier_id = %s
              AND oh.status = 'DELIVERED'
            GROUP BY oi.product_id, pm.product_name_english
            ORDER BY total_sold DESC
            LIMIT 5
        """, (supplier_id,))
        top_selling = cur.fetchall()

        # ===============================
        # SLOW SELLING (SELLABLE ONLY)
        # ===============================
        cur.execute("""
            SELECT 
                pm.product_id,
                pm.product_name_english,
                COALESCE(SUM(oi.quantity), 0) AS total_sold
            FROM product_management pm
            LEFT JOIN order_items oi ON pm.product_id = oi.product_id
            LEFT JOIN order_header oh 
              ON oh.order_id = oi.order_id
             AND oh.status = 'DELIVERED'
            WHERE pm.supplier_id = %s
              AND pm.flag = 'A'
              AND pm.stock_availability > 0
            GROUP BY pm.product_id, pm.product_name_english
            ORDER BY total_sold ASC
            LIMIT 5
        """, (supplier_id,))
        slow_selling = cur.fetchall()

        # ===============================
        # FULFILLMENT RATE (FIXED)
        # ===============================
        cur.execute("""
            SELECT
                COUNT(*) FILTER (WHERE status = 'DELIVERED') AS delivered,
                COUNT(*) FILTER (WHERE status IN ('DELIVERED','REJECTED')) AS decided
            FROM order_header
            WHERE supplier_id = %s
        """, (supplier_id,))
        row = cur.fetchone()

        delivered = row["delivered"] or 0
        decided = row["decided"] or 0
        fulfillment_rate = 0 if decided == 0 else round((delivered / decided) * 100)

        return jsonify({
            "revenue": revenue,
            "pending": pending,
            "expiring_today": expiring_today,

            "topSelling": top_selling,
            "slowSelling": slow_selling,
            "fulfillmentRate": fulfillment_rate,

            # backward compatibility
            "expiringToday": expiring_today
        }), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Dashboard stats failed"}), 500

    finally:
        cur.close()
        conn.close()



@order_bp.route("/<order_id>/modify-request", methods=["POST", "OPTIONS"])
def request_order_modification(order_id):

    # ===============================
    # CORS preflight
    # ===============================
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    # ===============================
    # Auth: supplier only
    # ===============================
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    # ===============================
    # Input
    # ===============================
    data = request.get_json() or {}
    items = data.get("items")
    note = (data.get("note") or "").strip()

    if not items or not isinstance(items, list):
        return jsonify({"error": "No items provided"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # =========================================================
        # 1️⃣ Verify order exists & belongs to supplier
        # =========================================================
        cur.execute("""
            SELECT order_id, status, restaurant_id
            FROM order_header
            WHERE order_id = %s
              AND supplier_id = %s
        """, (order_id, supplier_id))

        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        # ❗ Prevent modification after packing / delivery
        if order["status"] in ("PACKED", "DELIVERED", "COMPLETED"):
            return jsonify({
                "error": "Order cannot be modified at this stage"
            }), 400

        # =========================================================
        # 2️⃣ Prevent multiple pending requests
        # =========================================================
        cur.execute("""
            SELECT 1
            FROM order_modification_requests
            WHERE order_id = %s
              AND status = 'PENDING'
        """, (order_id,))

        if cur.fetchone():
            return jsonify({
                "error": "A modification request is already pending"
            }), 400

        # =========================================================
        # 3️⃣ Fetch original items (AUDIT SNAPSHOT)
        # =========================================================
        cur.execute("""
            SELECT
                item_id,
                product_id,
                product_name_english,
                quantity,
                price_per_unit,
                discount
            FROM order_items
            WHERE order_id = %s
            ORDER BY item_id
        """, (order_id,))

        raw_original_items = cur.fetchall()
        if not raw_original_items:
            return jsonify({"error": "No order items found"}), 400

        # 🔐 Convert Decimal → float (JSON SAFE)
        original_items = []
        for r in raw_original_items:
            original_items.append({
                "item_id": int(r["item_id"]),
                "product_id": int(r["product_id"]),
                "product_name_english": r["product_name_english"],
                "quantity": int(r["quantity"]),
                "price_per_unit": float(r["price_per_unit"]),
                "discount": float(r["discount"])
            })

        # =========================================================
        # 4️⃣ Validate & sanitize modified items
        # =========================================================
        safe_modified_items = []

        for i in items:
            if "item_id" not in i or "product_id" not in i:
                return jsonify({"error": "Missing item_id or product_id"}), 400

            qty = float(i.get("quantity", 0))
            price = float(i.get("price_per_unit", 0))
            discount = float(i.get("discount", 0))

            if qty < 0:
                return jsonify({"error": "Invalid quantity"}), 400
            if price < 0:
                return jsonify({"error": "Invalid price"}), 400
            if discount < 0:
                return jsonify({"error": "Invalid discount"}), 400
            if discount > (qty * price):
                return jsonify({
                    "error": "Discount cannot exceed line total"
                }), 400

            safe_modified_items.append({
                "item_id": int(i["item_id"]),
                "product_id": int(i["product_id"]),
                "product_name_english": i.get("product_name_english"),
                "quantity": int(qty),
                "price_per_unit": float(price),
                "discount": float(discount)
            })

        # =========================================================
        # 5️⃣ Insert modification request (PROPOSAL ONLY)
        # =========================================================
        cur.execute("""
            INSERT INTO order_modification_requests
            (
                order_id,
                supplier_id,
                original_items,
                modified_items,
                note,
                status,
                created_at
            )
            VALUES
            (
                %s,
                %s,
                %s::jsonb,
                %s::jsonb,
                %s,
                'PENDING',
                NOW()
            )
        """, (
            order_id,
            supplier_id,
            json.dumps(original_items),
            json.dumps(safe_modified_items),
            note
        ))


        # 🔔 CREATE RESTAURANT NOTIFICATION
        cur.execute("""
            INSERT INTO restaurant_notifications
            (
                restaurant_id,
                title,
                message,
                type,
                reference_id
            )
            VALUES
            (
                %s,
                %s,
                %s,
                'ORDER_MODIFICATION',
                %s
            )
        """, (
            order["restaurant_id"],
            "Order modification request",
            f"Supplier requested changes for Order {order_id}",
            order_id
        ))


        conn.commit()

        return jsonify({
            "message": "Modification request submitted successfully",
            "status": "PENDING"
        }), 201

    except Exception as e:
        conn.rollback()
        traceback.print_exc()
        return jsonify({
            "error": str(e)
        }), 500

    finally:
        cur.close()
        conn.close()




@order_bp.route("/place", methods=["POST"])
def place_order():
    conn = None
    try:
        data = request.get_json()

        restaurant_id = data["restaurant_id"]
        supplier_id = data["supplier_id"]
        total_amount = data["total_amount"]
        store_id = data.get("store_id")

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ===============================
        # INSERT ORDER HEADER
        # ===============================
        cur.execute("""
            INSERT INTO order_header
            (
                restaurant_id,
                supplier_id,
                store_id,
                order_date,
                status,
                payment_status,
                total_amount
            )
            VALUES (%s, %s, %s, NOW(), 'PLACED', 'PENDING', %s)
            RETURNING order_id
        """, (
            restaurant_id,
            supplier_id,
            store_id,
            total_amount
        ))

        order_id = cur.fetchone()["order_id"]

        conn.commit()

        return jsonify({
            "message": "Order placed successfully",
            "order_id": order_id
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


@order_bp.route("/restaurant/<order_id>", methods=["GET", "OPTIONS"])
def get_restaurant_order_success(order_id):

    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    restaurant_id = get_restaurant_from_token()
    if not restaurant_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                order_id,
                payment_status,
                total_amount
            FROM order_header
            WHERE order_id = %s
              AND restaurant_id = %s
        """, (order_id, restaurant_id))

        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        cur.execute("""
            SELECT payment_method
            FROM order_payments
            WHERE order_id = %s
            ORDER BY payment_date DESC
            LIMIT 1
        """, (order_id,))

        payment = cur.fetchone()

        return jsonify({
            "order_id": order["order_id"],
            "payment_method": payment["payment_method"] if payment else "N/A",
            "total_amount": float(order["total_amount"])
        }), 200

    finally:
        cur.close()
        conn.close()



@order_bp.route("/supplier/notifications/count", methods=["GET"])
def supplier_notification_count():
    try:
        supplier_id, err = get_supplier_from_token()
        if err:
            return jsonify({"error": err[0]}), err[1]

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT COUNT(*) AS count
            FROM supplier_notifications
            WHERE supplier_id = %s
              AND (is_read IS FALSE OR is_read IS NULL)
        """, (supplier_id,))

        row = cur.fetchone()
        count = row["count"]

        cur.close()
        conn.close()

        return jsonify({"count": int(count)}), 200

    except Exception as e:
        print("❌ COUNT API CRASH:", type(e), e)
        return jsonify({"error": "count failed"}), 500





@order_bp.route("/supplier/notifications", methods=["GET"])
def supplier_notifications():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    lang = request.headers.get("Accept-Language", "en")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
      SELECT *
      FROM supplier_notifications
      WHERE supplier_id = %s
      ORDER BY created_at DESC
    """, (supplier_id,))

    rows = cur.fetchall()

    # ✅ TRANSLATION ENGINE
    def translate(r):
        if not lang.startswith("ar"):
            return r   # 👉 keep English as default

        ref = r.get("reference_id")

        translations = {
            "NEW_ORDER": {
                "title": "تم استلام طلب جديد",
                "message": f"لقد استلمت طلبًا جديدًا رقم #{ref}"
            },
            "ORDER_ISSUE": {
                "title": "تم الإبلاغ عن مشكلة",
                "message": f"تم الإبلاغ عن مشكلة في الطلب #{ref}"
            },
            "PAYMENT_RECEIVED": {
                "title": "تم استلام دفعة",
                "message": "تم استلام دفعة جديدة"
            },
            "PROMOTION_INVITE": {
                "title": "دعوة عرض",
                "message": "تمت دعوتك للمشاركة في عرض"
            },
            "PROMOTION_DECISION": {
                "title": "قرار العرض",
                "message": "تم تحديث حالة العرض"
            },
            "LOW_STOCK": {
                "title": "تنبيه انخفاض المخزون",
                "message": "المنتج على وشك النفاد"
            },
            "OUT_OF_STOCK": {
                "title": "نفاد المخزون",
                "message": "المنتج غير متوفر الآن"
            }
        }

        if r["type"] in translations:
            r["title"] = translations[r["type"]]["title"]
            r["message"] = translations[r["type"]]["message"]

        return r

    # ✅ APPLY TRANSLATION
    rows = [translate(r) for r in rows]

    cur.close()
    conn.close()

    return jsonify(rows)


@order_bp.route("/supplier/notifications/<int:notification_id>/read", methods=["PUT"])
def mark_notification_read(notification_id):
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE supplier_notifications
        SET is_read = TRUE
        WHERE id = %s AND supplier_id = %s
    """, (notification_id, supplier_id))

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"ok": True}), 200


@order_bp.route("/supplier/notifications/read-all", methods=["PUT"])
def mark_all_notifications_read():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE supplier_notifications
        SET is_read = TRUE
        WHERE supplier_id = %s
          AND (is_read = FALSE OR is_read IS NULL)
    """, (supplier_id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"success": True}), 200


@order_bp.route("/supplier/notifications/auto-read", methods=["PUT"])
def auto_mark_notification_read():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    data = request.get_json() or {}
    reference_id = data.get("reference_id")
    notif_type = data.get("type")

    if not reference_id or not notif_type:
        return jsonify({"error": "reference_id and type required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE supplier_notifications
        SET is_read = TRUE
        WHERE supplier_id = %s
          AND reference_id = %s
          AND type = %s
          AND (is_read IS FALSE OR is_read IS NULL)
    """, (supplier_id, str(reference_id), notif_type))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"ok": True}), 200


@order_bp.route("/<order_id>/assign-delivery", methods=["PUT"])
def assign_delivery(order_id):

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    data = request.get_json() or {}

    delivery_type = data.get("delivery_type")
    driver_name = data.get("driver_name")
    driver_mobile = data.get("driver_mobile")
    vehicle_type = data.get("vehicle_type")
    vehicle_number = data.get("vehicle_number")
    partner_name = data.get("partner_name")
    estimated_time = data.get("estimated_delivery_time")

    if not delivery_type or not estimated_time:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        # ===============================
        # Verify order
        # ===============================
        cur.execute("""
            SELECT status, restaurant_id
            FROM order_header
            WHERE order_id=%s AND supplier_id=%s
            FOR UPDATE
        """, (order_id, supplier_id))

        order = cur.fetchone()

        if not order:
            return jsonify({"error": "Order not found"}), 404

        if order["status"] != "PACKED":
            return jsonify({"error": "Order must be PACKED"}), 400


        # ===============================
        # Generate driver token + OTP
        # ===============================
        driver_token, expiry = generate_driver_token(order_id, supplier_id)
        otp_code = str(random.randint(1000, 9999))


        # ===============================
        # Save delivery
        # ===============================
        cur.execute("""
            INSERT INTO order_delivery
            (
                order_id,
                supplier_id,
                delivery_type,
                driver_name,
                driver_mobile,
                vehicle_type,
                vehicle_number,
                partner_name,
                estimated_delivery_time,
                driver_token,
                token_expiry,
                otp_code,
                status
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'ASSIGNED')
        """, (
            order_id,
            supplier_id,
            delivery_type,
            driver_name,
            driver_mobile,
            vehicle_type,
            vehicle_number,
            partner_name,
            estimated_time,
            driver_token,
            expiry,
            otp_code
        ))


        # ===============================
        # Update order status
        # ===============================
        cur.execute("""
            UPDATE order_header
            SET status='OUT_FOR_DELIVERY', updated_at=NOW()
            WHERE order_id=%s
        """, (order_id,))


        # ===============================
        # Get restaurant contact
        # ===============================
        cur.execute("""
            SELECT
                contact_person_mobile,
                restaurant_name_english
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (order["restaurant_id"],))

        rest = cur.fetchone()

        restaurant_mobile = str(rest["contact_person_mobile"]).replace("+", "").strip()
        restaurant_name = rest["restaurant_name_english"]

        cur.execute("""
            INSERT INTO restaurant_notifications
            (
                restaurant_id,
                title,
                message,
                type,
                reference_id,
                is_read,
                created_at
            )
            VALUES (%s, %s, %s, %s, %s, FALSE, NOW())
        """, (
            order["restaurant_id"],
            "🚚 Delivery Assigned",
            f"Your order {order_id} is out for delivery",
            "DELIVERY_ASSIGNED",
            str(order_id)
        ))

        conn.commit()

        otp_message = f"""
        🚚 Delivery Assigned

        Order ID: {order_id}

        Your Delivery OTP: {otp_code}

        Please share this OTP with driver
        after receiving goods.

        Restaurant: {restaurant_name}
        """

        # ✅ ENCODE MESSAGE (VERY IMPORTANT)
        encoded_msg = urllib.parse.quote(otp_message)

        otp_link = f"https://wa.me/{restaurant_mobile}?text={encoded_msg}"

        print("RESTAURANT WHATSAPP LINK:")
        print(otp_link)


        return jsonify({
            "message": "Delivery assigned",
            "driver_token": driver_token,
            "restaurant_otp_link": otp_link
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()





@order_bp.route("/driver/location", methods=["PUT"])
@driver_required
def update_driver_location():

    driver = request.driver
    order_id = driver["order_id"]

    data = request.get_json() or {}
    lat = data.get("lat")
    lng = data.get("lng")

    if not lat or not lng:
        return jsonify({"error": "Invalid coordinates"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:

        # --------------------------------------------------
        # UPDATE DELIVERY LOCATION
        # --------------------------------------------------
        # --------------------------------------------------
        # CHECK IF ALREADY DELIVERED  🔥 SAFETY
        # --------------------------------------------------
        cur.execute("""
            SELECT status
            FROM order_header
            WHERE order_id = %s
        """, (order_id,))

        header = cur.fetchone()

        if header and header["status"] == "DELIVERED":
            return jsonify({"message": "Already delivered"}), 200


        # --------------------------------------------------
        # UPDATE DELIVERY LOCATION (DO NOT CHANGE STATUS)
        # --------------------------------------------------
        cur.execute("""
            UPDATE order_delivery
            SET current_lat = %s,
                current_lng = %s,
                location_updated_at = NOW(),
                started_at = COALESCE(started_at, NOW())
            WHERE id = (
                SELECT id FROM order_delivery
                WHERE order_id = %s
                AND status != 'DELIVERED'
                ORDER BY id DESC
                LIMIT 1
            )
        """, (lat, lng, order_id))




        # --------------------------------------------------
        # UPDATE ORDER HEADER STATUS 🔥 IMPORTANT
        # --------------------------------------------------
        cur.execute("""
            UPDATE order_header
            SET status = 'OUT_FOR_DELIVERY',
                updated_at = NOW()
            WHERE order_id = %s
              AND status != 'DELIVERED'
        """, (order_id,))


        # --------------------------------------------------
        # STATUS HISTORY
        # --------------------------------------------------
        cur.execute("""
            INSERT INTO order_status_history
            (order_id, status, changed_by_role)
            VALUES (%s, 'OUT_FOR_DELIVERY', 'DRIVER')
        """, (order_id,))


        conn.commit()

        return jsonify({"message": "Location updated"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


@order_bp.route("/driver/details", methods=["GET"])
@driver_required
def driver_delivery_details():

    driver = request.driver
    order_id = driver["order_id"]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        # =============================
        # CHECK DELIVERY STATUS
        # =============================
        cur.execute("""
            SELECT status
            FROM order_delivery
            WHERE order_id = %s
            ORDER BY id DESC
            LIMIT 1
        """, (order_id,))

        delivery_row = cur.fetchone()

        if delivery_row and delivery_row["status"] == "DELIVERED":
            return jsonify({
                "error": "Delivery already completed"
            }), 403


        # =============================
        # ORDER + ADDRESS (UPDATED 🔥)
        # =============================
        cur.execute("""
            SELECT
                oh.order_id,
                oh.payment_method,
                oh.payment_status,
                oh.total_amount,

                rr.restaurant_name_english,
                rr.contact_person_mobile,

                oa.address_line,
                oa.city,
                oa.country,
                oa.lat,
                oa.lng

            FROM order_header oh
            JOIN restaurant_registration rr
                ON rr.restaurant_id = oh.restaurant_id
            JOIN order_address oa
                ON oa.order_id = oh.order_id
            WHERE oh.order_id = %s
        """, (order_id,))

        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Order not found"}), 404


        # =============================
        # DELIVERY ITEMS
        # =============================
        cur.execute("""
            SELECT
                item_id,
                product_name_english,
                quantity
            FROM order_items
            WHERE order_id = %s
            ORDER BY item_id
        """, (order_id,))

        items = cur.fetchall()


        # =============================
        # ADDRESS FORMAT
        # =============================
        address = f"""
{row['address_line']}
{row['city']} {row['country']}
"""


        # =============================
        # FINAL RESPONSE
        # =============================
        return jsonify({
            "order_id": row["order_id"],
            "restaurant_name": row["restaurant_name_english"],
            "restaurant_phone": row["contact_person_mobile"],
            "delivery_address": address,

            "delivery_lat": row["lat"],   # ✅ NEW
            "delivery_lng": row["lng"],   # ✅ NEW

            "payment_method": row["payment_method"],
            "payment_status": row["payment_status"],
            "total_amount": row["total_amount"],

            "items": items
        }), 200


    finally:
        cur.close()
        conn.close()




@order_bp.route("/driver/complete", methods=["POST"])
@driver_required
def driver_complete_delivery():

    driver = request.driver
    order_id = driver["order_id"]

    data = request.get_json() or {}
    otp = data.get("otp")
    received_by = data.get("received_by")

    if not otp:
        return jsonify({"error": "OTP required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        # =====================================
        # GET DELIVERY
        # =====================================
        cur.execute("""
            SELECT id, otp_code, supplier_id, status
            FROM order_delivery
            WHERE order_id = %s
            ORDER BY id DESC
            LIMIT 1
        """, (order_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Delivery not found"}), 404

        if row["status"] == "DELIVERED":
            return jsonify({"error": "Already delivered"}), 400

        delivery_id = row["id"]

        # =====================================
        # CHECK PAYMENT
        # =====================================
        cur.execute("""
            SELECT payment_method, payment_status
            FROM order_header
            WHERE order_id = %s
        """, (order_id,))
        payment = cur.fetchone()

        if payment["payment_method"] == "COD" and payment["payment_status"] != "PAID":
            return jsonify({"error": "Payment not collected yet"}), 400

        # =====================================
        # OTP VALIDATION
        # =====================================
        if str(row["otp_code"]) != str(otp):
            return jsonify({"error": "Invalid OTP"}), 400

        # =====================================
        # UPDATE DELIVERY
        # =====================================
        cur.execute("""
            UPDATE order_delivery
            SET status = 'DELIVERED',
                delivered_at = NOW(),
                received_by = %s
            WHERE id = %s
        """, (received_by, delivery_id))

        # =====================================
        # UPDATE ORDER
        # =====================================
        cur.execute("""
            UPDATE order_header
            SET status = 'DELIVERED',
                updated_at = NOW()
            WHERE order_id = %s
        """, (order_id,))

        # =====================================
        # HISTORY
        # =====================================
        cur.execute("""
            INSERT INTO order_status_history
            (order_id, status, changed_by_role, changed_by_id)
            VALUES (%s, 'DELIVERED', 'DRIVER', %s)
        """, (order_id, row["supplier_id"]))

        conn.commit()

        return jsonify({"message": "Delivery completed successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()



# ==========================================
# GET DELIVERY DETAILS (SUPPLIER / RESTAURANT)
# ==========================================
@order_bp.route("/delivery/<order_id>", methods=["GET"])
def get_delivery_details(order_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        cur.execute("""
            SELECT
                od.driver_name,
                od.driver_mobile,
                od.vehicle_type,
                od.vehicle_number,
                od.estimated_delivery_time,
                od.status,
                od.started_at,
                od.delivered_at,

                rr.restaurant_name_english,
                rr.contact_person_mobile,

                oa.address_line,
                oa.city,
                oa.country,
                oa.lat,
                oa.lng

            FROM order_delivery od
            JOIN order_header oh ON oh.order_id = od.order_id
            JOIN restaurant_registration rr
                ON rr.restaurant_id = oh.restaurant_id
            JOIN order_address oa
                ON oa.order_id = oh.order_id

            WHERE od.order_id = %s
            ORDER BY od.id DESC
            LIMIT 1
        """, (order_id,))

        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Delivery not found"}), 404

        # =============================
        # CLEAN ADDRESS (IMPORTANT)
        # =============================
        address = f"{row['address_line']}, {row['city']}, {row['country']}"

        # =============================
        # FINAL RESPONSE
        # =============================
        return jsonify({
            "driver_name": row["driver_name"],
            "driver_mobile": row["driver_mobile"],
            "vehicle_type": row["vehicle_type"],
            "vehicle_number": row["vehicle_number"],
            "estimated_delivery_time": row["estimated_delivery_time"],
            "status": row["status"],
            "started_at": row["started_at"],
            "delivered_at": row["delivered_at"],

            "restaurant_name": row["restaurant_name_english"],
            "restaurant_phone": row["contact_person_mobile"],

            "delivery_address": address,

            # ✅ GPS (VERY IMPORTANT)
            "dest_lat": row["lat"],
            "dest_lng": row["lng"]

        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# ==========================================
# GET DRIVER LOCATION
# ==========================================
@order_bp.route("/delivery/<order_id>/location", methods=["GET"])
def get_driver_location(order_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        cur.execute("""
            SELECT
                current_lat,
                current_lng,
                location_updated_at
            FROM order_delivery
            WHERE order_id = %s
            AND current_lat IS NOT NULL
            AND current_lng IS NOT NULL
            ORDER BY location_updated_at DESC
            LIMIT 1
        """, (order_id,))

        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Location not found"}), 404

        return jsonify(row), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
@order_bp.route("/driver/payment", methods=["PUT"])
@driver_required
def driver_update_payment():

    driver = request.driver
    order_id = driver["order_id"]

    data = request.get_json() or {}
    payment_status = data.get("payment_status")

    if payment_status not in ["PAID", "UNPAID"]:
        return jsonify({"error": "Invalid payment status"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:

        # update order payment
        cur.execute("""
            UPDATE order_header
            SET payment_status = %s,
                updated_at = NOW()
            WHERE order_id = %s
        """, (payment_status, order_id))


        # optional history
        cur.execute("""
            INSERT INTO order_status_history
            (order_id, status, changed_by_role)
            VALUES (%s, %s, 'DRIVER')
        """, (order_id, f"PAYMENT_{payment_status}"))


        conn.commit()

        return jsonify({
            "success": True,
            "message": "Payment updated successfully"
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
# ==========================================
# RESEND DRIVER LINK
# ==========================================
@order_bp.route("/driver/resend/<order_id>", methods=["GET"])
def resend_driver_link(order_id):

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:

        cur.execute("""
            SELECT driver_mobile, driver_token
            FROM order_delivery
            WHERE order_id=%s AND supplier_id=%s
            ORDER BY id DESC
            LIMIT 1
        """, (order_id, supplier_id))

        row = cur.fetchone()

        if not row:
            return jsonify({"error": "Driver not found"}), 404

        driver_mobile = str(row["driver_mobile"]).replace("+", "").strip()
        driver_token = row["driver_token"]

        # 👉 IMPORTANT: USE CURRENT NGROK / FRONTEND URL
        frontend_url = "https://anthracotic-rootlike-evelina.ngrok-free.dev"

        driver_link = f"{frontend_url}/driver?token={driver_token}"

        msg = f"""
🚚 Delivery Link

Order ID: {order_id}

Open this link to start delivery:
{driver_link}
"""

        encoded = urllib.parse.quote(msg)

        whatsapp_link = f"https://wa.me/{driver_mobile}?text={encoded}"

        return jsonify({
            "success": True,
            "whatsapp_link": whatsapp_link,
            "driver_link": driver_link
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


@order_bp.route("/<order_id>/skip-today", methods=["PUT"])
def skip_today(order_id):

    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT supplier_id
            FROM order_header
            WHERE order_id = %s
        """, (order_id,))

        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        if order["supplier_id"] != supplier_id:
            return jsonify({"error": "Unauthorized"}), 403

        cur.execute("""
            SELECT next_run_date, frequency
            FROM recurring_orders
            WHERE order_id = %s
        """, (order_id,))

        rec = cur.fetchone()
        if not rec:
            return jsonify({"error": "Not a recurring order"}), 400

        cur.execute("""
            UPDATE recurring_orders
            SET next_run_date =
                CASE
                    WHEN frequency = 'DAILY' THEN next_run_date + INTERVAL '1 day'
                    WHEN frequency = 'WEEKLY' THEN next_run_date + INTERVAL '7 day'
                    WHEN frequency = 'MONTHLY' THEN next_run_date + INTERVAL '1 month'
                    ELSE next_run_date + INTERVAL '1 day'
                END
            WHERE order_id = %s
        """, (order_id,))

        conn.commit()

        return jsonify({
            "message": "Skipped successfully"
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


#sultan routes 

# @order_bp.route("/restaurant/orders", methods=["GET"])
# def get_restaurant_orders():

#     restaurant_id = get_restaurant_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT
#                 oh.order_id,
#                 oh.order_date,
#                 oh.status,
#                 oh.total_amount,
#                 oh.supplier_id,
#                 s.company_name_english AS supplier_name,
#                 oh.is_recurring,

#                 json_agg(
#                     json_build_object(
#                         'product_name', oi.product_name_english,
#                         'quantity', oi.quantity
#                     )
#                 ) AS items

#             FROM order_header oh
#             JOIN order_items oi ON oi.order_id = oh.order_id
#             JOIN supplier_registration s ON s.supplier_id = oh.supplier_id

#             WHERE oh.restaurant_id = %s

#             GROUP BY
#                 oh.order_id,
#                 oh.order_date,
#                 oh.status,
#                 oh.total_amount,
#                 oh.supplier_id,
#                 s.company_name_english,
#                 oh.is_recurring

#             ORDER BY oh.order_date DESC
#         """, (restaurant_id,))

#         return jsonify(cur.fetchall()), 200

#     finally:
#         cur.close()
#         conn.close()


# @order_bp.route("/restaurant/<order_id>/edit", methods=["PUT"])
# def edit_order_by_restaurant(order_id):

#     restaurant_id = get_restaurant_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     data = request.get_json()
#     items = data.get("items")

#     if not items:
#         return jsonify({"error": "No items provided"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT status
#             FROM order_header
#             WHERE order_id = %s
#               AND restaurant_id = %s
#             FOR UPDATE
#         """, (order_id, restaurant_id))

#         order = cur.fetchone()
#         if not order:
#             return jsonify({"error": "Order not found"}), 404

#         if order["status"] != "PLACED":
#             return jsonify({"error": "Order cannot be modified after supplier acceptance"}), 400

#         cur.execute("DELETE FROM order_items WHERE order_id = %s", (order_id,))

#         new_total = 0

#         for item in items:
#             qty = float(item["quantity"])
#             price = float(item["price_per_unit"])
#             discount = float(item.get("discount", 0))

#             line_total = (qty * price) - discount
#             new_total += line_total

#             cur.execute("""
#                 INSERT INTO order_items
#                 (order_id, product_id, product_name_english,
#                  quantity, price_per_unit, discount, total_amount)
#                 VALUES (%s,%s,%s,%s,%s,%s,%s)
#             """, (
#                 order_id,
#                 item["product_id"],
#                 item["product_name_english"],
#                 qty,
#                 price,
#                 discount,
#                 line_total
#             ))

#         cur.execute("""
#             UPDATE order_header
#             SET total_amount = %s,
#                 updated_at = NOW()
#             WHERE order_id = %s
#         """, (new_total, order_id))

#         conn.commit()

#         return jsonify({
#             "message": "Order updated successfully",
#             "new_total": new_total
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()



# @order_bp.route("/restaurant/<order_id>/cancel", methods=["PUT"])
# def cancel_order_by_restaurant(order_id):

#     restaurant_id = get_restaurant_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT status, supplier_id
#             FROM order_header
#             WHERE order_id = %s
#               AND restaurant_id = %s
#             FOR UPDATE
#         """, (order_id, restaurant_id))

#         order = cur.fetchone()
#         if not order:
#             return jsonify({"error": "Order not found"}), 404

#         if order["status"] != "PLACED":
#             return jsonify({"error": "Order cannot be cancelled at this stage"}), 400

#         supplier_id = order["supplier_id"]

#         cur.execute("""
#             UPDATE order_header
#             SET status = 'CANCELLED',
#                 updated_at = NOW()
#             WHERE order_id = %s
#         """, (order_id,))

#         cur.execute("""
#             INSERT INTO order_status_history
#             (order_id, status, changed_by_role, changed_by_id)
#             VALUES (%s, 'CANCELLED', 'RESTAURANT', %s)
#         """, (order_id, restaurant_id))

#         cur.execute("""
#             INSERT INTO supplier_notifications
#             (supplier_id, type, title, message, reference_id)
#             VALUES (%s, %s, %s, %s, %s)
#         """, (
#             supplier_id,
#             "ORDER_CANCELLED",
#             "Order Cancelled",
#             f"Order {order_id} has been cancelled by restaurant.",
#             order_id
#         ))

#         conn.commit()
#         return jsonify({"message": "Order cancelled successfully"}), 200

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()


# @order_bp.route("/restaurant/orders/<order_id>", methods=["GET"])
# def get_restaurant_order_by_id(order_id):

#     restaurant_id = get_restaurant_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # =====================================================
#         # ORDER + SUPPLIER + RESTAURANT DETAILS
#         # =====================================================
#         cur.execute("""
#             SELECT
#                 oh.order_id,
#                 oh.order_date,
#                 oh.status,
#                 oh.total_amount,
#                 oh.payment_status,
#                 oh.is_recurring,
#                 oh.supplier_id,

#                 -- Supplier Info
#                 s.company_name_english AS supplier_name,
#                 s.contact_person_name AS supplier_contact_name,
#                 s.contact_person_mobile AS supplier_mobile,
#                 s.contact_person_email AS supplier_email,
#                 s.street AS supplier_street,
#                 s.zone AS supplier_zone,
#                 s.city AS supplier_city,
#                 s.country AS supplier_country,

#                 -- Restaurant Info
#                 rr.restaurant_name_english AS restaurant_name,
#                 rr.contact_person_name AS restaurant_contact_name,
#                 rr.contact_person_mobile::text AS restaurant_mobile,
#                 rr.contact_person_email AS restaurant_email,
#                 rr.street AS restaurant_street,
#                 rr.zone AS restaurant_zone,
#                 rr.city AS restaurant_city,
#                 rr.country AS restaurant_country

#             FROM order_header oh
#             JOIN supplier_registration s
#                 ON s.supplier_id = oh.supplier_id
#             JOIN restaurant_registration rr
#                 ON rr.restaurant_id = oh.restaurant_id

#             WHERE oh.order_id = %s
#               AND oh.restaurant_id = %s
#         """, (order_id, restaurant_id))

#         header = cur.fetchone()

#         if not header:
#             return jsonify({"error": "Order not found"}), 404

#         # =====================================================
#         # ORDER ITEMS
#         # =====================================================
#         cur.execute("""
#             SELECT
#                 item_id,
#                 product_id,
#                 product_name_english,
#                 quantity,
#                 price_per_unit,
#                 discount,
#                 total_amount
#             FROM order_items
#             WHERE order_id = %s
#             ORDER BY item_id
#         """, (order_id,))

#         items = cur.fetchall()

#         # =====================================================
#         # RECURRING DETAILS
#         # =====================================================
#         recurring_data = None

#         cur.execute("""
#             SELECT
#                 frequency,
#                 start_date,
#                 end_date,
#                 next_run_date,
#                 status,
#                 weekdays
#             FROM recurring_orders
#             WHERE order_id = %s
#               AND restaurant_id = %s
#             LIMIT 1
#         """, (order_id, restaurant_id))

#         recurring = cur.fetchone()

#         if recurring:
#             recurring_data = recurring

#         # =====================================================
#         # FINAL RESPONSE
#         # =====================================================
#         return jsonify({
#             "header": header,
#             "items": items,
#             "recurring": recurring_data
#         }), 200

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()


# @order_bp.route("/restaurant/<order_id>/add-item", methods=["POST", "OPTIONS"])
# def add_item_to_order(order_id):

#     if request.method == "OPTIONS":
#         return jsonify({"ok": True}), 200

#     restaurant_id = get_restaurant_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     data = request.get_json()

#     product_id = data.get("product_id")
#     product_name = data.get("product_name_english")
#     quantity = float(data.get("quantity", 1))
#     price = float(data.get("price_per_unit", 0))
#     discount = float(data.get("discount", 0))

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT status
#             FROM order_header
#             WHERE order_id = %s
#               AND restaurant_id = %s
#             FOR UPDATE
#         """, (order_id, restaurant_id))

#         order = cur.fetchone()
#         if not order:
#             return jsonify({"error": "Order not found"}), 404

#         if order["status"] != "PLACED":
#             return jsonify({"error": "Order cannot be modified"}), 400

#         line_total = (quantity * price) - discount

#         cur.execute("""
#             INSERT INTO order_items
#             (order_id, product_id, product_name_english,
#              quantity, price_per_unit, discount, total_amount)
#             VALUES (%s,%s,%s,%s,%s,%s,%s)
#         """, (
#             order_id,
#             product_id,
#             product_name,
#             quantity,
#             price,
#             discount,
#             line_total
#         ))

#         cur.execute("""
#             UPDATE order_header
#             SET total_amount = total_amount + %s,
#                 updated_at = NOW()
#             WHERE order_id = %s
#         """, (line_total, order_id))

#         conn.commit()

#         return jsonify({"message": "Item added successfully"}), 200

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()



# @order_bp.route("/run-recurring-now", methods=["POST"])
# def manual_run_recurring():
#     from services.recurring_scheduler import run_recurring_orders
#     run_recurring_orders()
#     return jsonify({"message": "Recurring executed"}), 200

# @order_bp.route("/recurring/create", methods=["POST"])
# def create_recurring_order():

#     restaurant_id = get_restaurant_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     data = request.get_json() or {}

#     order_id = data.get("order_id")
#     frequency = data.get("frequency")
#     start_date = data.get("start_date")
#     end_date = data.get("end_date")
#     weekdays = data.get("weekdays", [])

#     if not order_id or not frequency or not start_date:
#         return jsonify({"error": "Missing required fields"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # 1️⃣ Verify order belongs to restaurant
#         cur.execute("""
#             SELECT supplier_id
#             FROM order_header
#             WHERE order_id = %s
#               AND restaurant_id = %s
#         """, (order_id, restaurant_id))

#         order = cur.fetchone()
#         if not order:
#             return jsonify({"error": "Order not found"}), 404

#         supplier_id = order["supplier_id"]

#         # 2️⃣ Insert into recurring_orders
#         cur.execute("""
#             INSERT INTO recurring_orders
#             (
#                 order_id,
#                 restaurant_id,
#                 supplier_id,
#                 frequency,
#                 start_date,
#                 next_run_date,
#                 status,
#                 weekdays,
#                 end_date
#             )
#             VALUES (%s,%s,%s,%s,%s,%s,'ACTIVE',%s,%s)
#         """, (
#             order_id,
#             restaurant_id,
#             supplier_id,
#             frequency,
#             start_date,
#             start_date,  # first run = start_date
#             weekdays,
#             end_date
#         ))

#         # 3️⃣ Update order_header flag
#         cur.execute("""
#             UPDATE order_header
#             SET is_recurring = TRUE
#             WHERE order_id = %s
#         """, (order_id,))

#         conn.commit()

#         return jsonify({"message": "Recurring created successfully"}), 201

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()


# @order_bp.route("/recurring/pause/<order_id>", methods=["PUT"])
# def pause_recurring_order(order_id):

#     restaurant_id = get_restaurant_from_token()
#     if not restaurant_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     conn = get_db_connection()
#     cur = conn.cursor()

#     try:
#         cur.execute("""
#             UPDATE order_header
#             SET is_recurring = FALSE
#             WHERE order_id = %s
#               AND restaurant_id = %s
#         """, (order_id, restaurant_id))

#         conn.commit()
#         return jsonify({"message": "Recurring paused"}), 200

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         conn.close()        