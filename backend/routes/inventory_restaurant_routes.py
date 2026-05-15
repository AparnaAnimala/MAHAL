# from flask import Blueprint, request, jsonify
# from psycopg2.extras import RealDictCursor
# from flask_mail import Message
# from db import get_db_connection
# from app import mail


# restaurant_inventory_bp = Blueprint(
#     "restaurant_inventory_bp",
#     __name__
# )

# LOW_STOCK_LIMIT = 10


# # ======================================================
# # EMAIL HELPERS
# # ======================================================

# def get_restaurant_notification_email(cur, restaurant_id, store_id=None):
#     """
#     Priority:
#     1. Store email
#     2. Restaurant contact email
#     """
#     if store_id:
#         cur.execute("""
#             SELECT email, store_name_english
#             FROM restaurant_store_registration
#             WHERE store_id = %s
#         """, (store_id,))
#         store = cur.fetchone()
#         if store and store["email"]:
#             return store["email"], store["store_name_english"]

#     cur.execute("""
#         SELECT contact_person_email, restaurant_name_english
#         FROM restaurant_registration
#         WHERE restaurant_id = %s
#     """, (restaurant_id,))
#     restaurant = cur.fetchone()
#     if restaurant and restaurant["contact_person_email"]:
#         return restaurant["contact_person_email"], restaurant["restaurant_name_english"]

#     return None, None


# def send_restaurant_low_stock_email(cur, restaurant_id, product_id, qty, store_id=None):
#     email, location = get_restaurant_notification_email(cur, restaurant_id, store_id)
#     if not email:
#         return

#     cur.execute("""
#         SELECT product_name_english
#         FROM product_management
#         WHERE product_id = %s
#     """, (product_id,))
#     product = cur.fetchone()
#     if not product:
#         return

#     msg = Message(
#         subject="⚠️ Low Stock Alert",
#         recipients=[email],
#         body=f"""
# LOW STOCK ALERT

# Location : {location}
# Product  : {product["product_name_english"]}
# Stock    : {qty}

# Please reorder to avoid stock-out.

# — Mahal Inventory System
# """
#     )
#     mail.send(msg)


# def send_restaurant_out_of_stock_email(cur, restaurant_id, product_id, store_id=None):
#     email, location = get_restaurant_notification_email(cur, restaurant_id, store_id)
#     if not email:
#         return

#     cur.execute("""
#         SELECT product_name_english
#         FROM product_management
#         WHERE product_id = %s
#     """, (product_id,))
#     product = cur.fetchone()
#     if not product:
#         return

#     msg = Message(
#         subject="🚨 OUT OF STOCK ALERT",
#         recipients=[email],
#         body=f"""
# OUT OF STOCK ALERT

# Location : {location}
# Product  : {product["product_name_english"]}

# ⚠️ This product is completely OUT OF STOCK.
# Immediate action required.

# — Mahal Inventory System
# """
#     )
#     mail.send(msg)


# # ======================================================
# # POST GRN → INVENTORY (LEDGER + STOCK)
# # ======================================================

# @restaurant_inventory_bp.route(
#     "/restaurant/post-grn/<int:grn_id>",
#     methods=["POST"]
# )
# def post_grn_to_restaurant_inventory(grn_id):
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # Validate GRN
#         cur.execute("""
#             SELECT restaurant_id
#             FROM grn_header
#             WHERE grn_id = %s AND status = 'CONFIRMED'
#         """, (grn_id,))
#         grn = cur.fetchone()

#         if not grn:
#             return jsonify({"error": "GRN not confirmed"}), 400

#         restaurant_id = grn["restaurant_id"]
#         store_id = None  # set if you have store-wise GRN

#         # Fetch GRN items
#         cur.execute("""
#             SELECT product_id,
#                    received_quantity - COALESCE(rejected_quantity,0) AS qty
#             FROM grn_items
#             WHERE grn_id = %s
#         """, (grn_id,))
#         items = cur.fetchall()

#         for item in items:
#             qty = float(item["qty"])
#             if qty <= 0:
#                 continue

#             product_id = item["product_id"]

#             # 1️⃣ INVENTORY LEDGER
#             cur.execute("""
#                 INSERT INTO inventory_ledger
#                 (restaurant_id, product_id, movement_type,
#                  quantity, reference_type, reference_id)
#                 VALUES (%s, %s, 'GRN_IN', %s, 'GRN', %s)
#             """, (restaurant_id, product_id, qty, grn_id))

#             # 2️⃣ INVENTORY STOCK
#             cur.execute("""
#                 INSERT INTO inventory_stock
#                 (restaurant_id, store_id, product_id, batch_no, available_qty)
#                 VALUES (%s, %s, %s, 'DEFAULT', %s)
#                 ON CONFLICT (restaurant_id, store_id, product_id, batch_no)
#                 DO UPDATE SET
#                     available_qty = inventory_stock.available_qty + EXCLUDED.available_qty,
#                     last_updated = NOW(),
#                     low_stock_notified = false,
#                     out_of_stock_notified = false
#             """, (restaurant_id, store_id or 1, product_id, qty))

#             # 3️⃣ CHECK STOCK LEVEL
#             cur.execute("""
#                 SELECT available_qty, low_stock_notified, out_of_stock_notified
#                 FROM inventory_stock
#                 WHERE restaurant_id = %s AND product_id = %s
#             """, (restaurant_id, product_id))
#             stock = cur.fetchone()

#             if stock:
#                 if stock["available_qty"] <= 0 and not stock["out_of_stock_notified"]:
#                     send_restaurant_out_of_stock_email(
#                         cur, restaurant_id, product_id, store_id
#                     )
#                     cur.execute("""
#                         UPDATE inventory_stock
#                         SET out_of_stock_notified = true
#                         WHERE restaurant_id = %s AND product_id = %s
#                     """, (restaurant_id, product_id))

#                 elif stock["available_qty"] <= LOW_STOCK_LIMIT and not stock["low_stock_notified"]:
#                     send_restaurant_low_stock_email(
#                         cur, restaurant_id, product_id, stock["available_qty"], store_id
#                     )
#                     cur.execute("""
#                         UPDATE inventory_stock
#                         SET low_stock_notified = true
#                         WHERE restaurant_id = %s AND product_id = %s
#                     """, (restaurant_id, product_id))

#         conn.commit()
#         return jsonify({"message": "Inventory updated & alerts sent"}), 200

#     except Exception as e:
#         conn.rollback()
#         print("INVENTORY ERROR:", e)
#         return jsonify({"error": "Failed to update inventory"}), 500

#     finally:
#         cur.close()
#         conn.close()


# # ======================================================
# # GET RESTAURANT INVENTORY (UI)
# # ======================================================

# @restaurant_inventory_bp.route("/restaurant/stock")
# def get_restaurant_stock():
#     restaurant_id = request.args.get("restaurant_id")

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#     s.product_id,
#     pm.product_name_english AS product_name,
#     SUM(s.available_qty) AS available_qty,
#     encode(pm.product_images[1], 'base64') AS product_image
# FROM inventory_stock s
# JOIN product_management pm
#   ON pm.product_id = s.product_id
# WHERE s.restaurant_id = %s
# GROUP BY
#     s.product_id,
#     pm.product_name_english,
#     pm.product_images
# ORDER BY pm.product_name_english;

#             """, (restaurant_id,))

#     rows = cur.fetchall()
#     cur.close()
#     conn.close()

#     return jsonify(rows)
 






from flask import Blueprint, request, jsonify
from psycopg2.extras import RealDictCursor
from flask_mail import Message
from db import get_db_connection
from app import mail
from decimal import Decimal

restaurant_inventory_bp = Blueprint(
    "restaurant_inventory_bp",
    __name__
)

LOW_STOCK_LIMIT = 10
DEFAULT_STORE_ID = 1


# ======================================================
# EMAIL HELPERS
# ======================================================

def get_restaurant_notification_email(cur, restaurant_id, store_id=None):
    if store_id:
        cur.execute("""
            SELECT email, store_name_english
            FROM restaurant_store_registration
            WHERE store_id = %s
        """, (store_id,))
        store = cur.fetchone()
        if store and store["email"]:
            return store["email"], store["store_name_english"]

    cur.execute("""
        SELECT contact_person_email, restaurant_name_english
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))
    restaurant = cur.fetchone()
    if restaurant and restaurant["contact_person_email"]:
        return restaurant["contact_person_email"], restaurant["restaurant_name_english"]

    return None, None


def send_restaurant_low_stock_email(cur, restaurant_id, product_id, qty, store_id):
    email, location = get_restaurant_notification_email(cur, restaurant_id, store_id)
    if not email:
        return

    cur.execute("""
        SELECT product_name_english
        FROM product_management
        WHERE product_id = %s
    """, (product_id,))
    product = cur.fetchone()
    if not product:
        return

    msg = Message(
        subject="⚠️ Low Stock Alert",
        recipients=[email],
        body=f"""
LOW STOCK ALERT

Location : {location}
Product  : {product["product_name_english"]}
Stock    : {qty}

Please reorder to avoid stock-out.

— Mahal Inventory System
"""
    )
    mail.send(msg)


def send_restaurant_out_of_stock_email(cur, restaurant_id, product_id, store_id):
    email, location = get_restaurant_notification_email(cur, restaurant_id, store_id)
    if not email:
        return

    cur.execute("""
        SELECT product_name_english
        FROM product_management
        WHERE product_id = %s
    """, (product_id,))
    product = cur.fetchone()
    if not product:
        return

    msg = Message(
        subject="🚨 OUT OF STOCK ALERT",
        recipients=[email],
        body=f"""
OUT OF STOCK ALERT

Location : {location}
Product  : {product["product_name_english"]}

Immediate action required.

— Mahal Inventory System
"""
    )
    mail.send(msg)

def create_restaurant_notification(cur, restaurant_id, n_type, title, message, ref_id=None):
    cur.execute("""
        INSERT INTO restaurant_notifications
        (restaurant_id, type, title, message, reference_id)
        VALUES (%s, %s, %s, %s, %s)
    """, (restaurant_id, n_type, title, message, ref_id))

# ======================================================
# POST GRN → INVENTORY
# ======================================================

@restaurant_inventory_bp.route(
    "/restaurant/post-grn/<int:grn_id>",
    methods=["POST"]
)
def post_grn_to_restaurant_inventory(grn_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT restaurant_id
            FROM grn_header
            WHERE grn_id = %s AND status = 'CONFIRMED'
        """, (grn_id,))
        grn = cur.fetchone()

        if not grn:
            return jsonify({"error": "GRN not confirmed"}), 400

        restaurant_id = grn["restaurant_id"]
        store_id = DEFAULT_STORE_ID

        cur.execute("""
            SELECT product_id,
                   received_quantity - COALESCE(rejected_quantity, 0) AS qty
            FROM grn_items
            WHERE grn_id = %s
        """, (grn_id,))
        items = cur.fetchall()

        for item in items:
            qty = float(item["qty"])
            if qty <= 0:
                continue

            product_id = item["product_id"]

            # ✅ FETCH PRODUCT NAME ONCE (FIX)
            cur.execute("""
                SELECT product_name_english
                FROM product_management
                WHERE product_id = %s
            """, (product_id,))
            product = cur.fetchone()
            product_name = product["product_name_english"] if product else "Unknown Product"

            # Ledger
            cur.execute("""
                INSERT INTO inventory_ledger
                (restaurant_id, product_id, movement_type,
                 quantity, reference_type, reference_id)
                VALUES (%s, %s, 'GRN_IN', %s, 'GRN', %s)
            """, (restaurant_id, product_id, qty, grn_id))

            # Stock upsert
            cur.execute("""
                INSERT INTO inventory_stock
                (restaurant_id, store_id, product_id, batch_no, available_qty)
                VALUES (%s, %s, %s, 'DEFAULT', %s)
                ON CONFLICT (restaurant_id, store_id, product_id, batch_no)
                DO UPDATE SET
                    available_qty = inventory_stock.available_qty + EXCLUDED.available_qty,
                    last_updated = NOW()
            """, (restaurant_id, store_id, product_id, qty))

            # 🔥 AGGREGATED STOCK CHECK
            cur.execute("""
                SELECT
                    SUM(available_qty) AS total_qty,
                    BOOL_OR(low_stock_notified) AS low_notified,
                    BOOL_OR(out_of_stock_notified) AS out_notified
                FROM inventory_stock
                WHERE restaurant_id = %s AND product_id = %s
            """, (restaurant_id, product_id))
            stock = cur.fetchone()

            total_qty = stock["total_qty"] or 0

            # 🚨 OUT OF STOCK
            if total_qty <= 0 and not stock["out_notified"]:
                send_restaurant_out_of_stock_email(
                    cur, restaurant_id, product_id, store_id
                )

                cur.execute("""
                    UPDATE inventory_stock
                    SET out_of_stock_notified = TRUE
                    WHERE restaurant_id = %s AND product_id = %s
                """, (restaurant_id, product_id))

                create_restaurant_notification(
                    cur,
                    restaurant_id,
                    "OUT_OF_STOCK",
                    "Out of stock alert",
                    f"{product_name} is out of stock",
                    str(product_id)
                )

            # ⚠️ LOW STOCK
            elif total_qty <= LOW_STOCK_LIMIT and not stock["low_notified"]:
                send_restaurant_low_stock_email(
                    cur, restaurant_id, product_id, total_qty, store_id
                )

                cur.execute("""
                    UPDATE inventory_stock
                    SET low_stock_notified = TRUE
                    WHERE restaurant_id = %s AND product_id = %s
                """, (restaurant_id, product_id))

                create_restaurant_notification(
                    cur,
                    restaurant_id,
                    "LOW_STOCK",
                    "Low stock alert",
                    f"{product_name} is running low (Qty: {total_qty})",
                    str(product_id)
                )

        conn.commit()
        return jsonify({"message": "Inventory updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        print("INVENTORY ERROR:", e)
        return jsonify({"error": "Failed to update inventory"}), 500

    finally:
        cur.close()
        conn.close()


# ======================================================
# GET RESTAURANT INVENTORY (UI)
# ======================================================

# @restaurant_inventory_bp.route("/restaurant/stock")
# def get_restaurant_stock():
#     restaurant_id = request.args.get("restaurant_id")

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             s.product_id,
#             pm.product_name_english AS product_name,
#             SUM(s.available_qty) AS available_qty,
#             encode(pm.product_images[1], 'base64') AS product_image
#         FROM inventory_stock s
#         JOIN product_management pm
#           ON pm.product_id = s.product_id
#         WHERE s.restaurant_id = %s
#         GROUP BY s.product_id, pm.product_name_english, pm.product_images
#         ORDER BY pm.product_name_english
#     """, (restaurant_id,))

#     rows = cur.fetchall()
#     cur.close()
#     conn.close()

#     return jsonify(rows)


@restaurant_inventory_bp.route("/restaurant/stock")
def get_restaurant_stock():
    restaurant_id = request.args.get("restaurant_id")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            pm.product_id,
            pm.product_name_english AS product_name_english,
            pm.product_name_arabic AS product_name_arabic,
            COALESCE(SUM(s.available_qty), 0) AS available_qty,
            MAX(encode(pm.product_images[1], 'base64')) AS product_image,
            pm.price_per_unit AS price   -- ✅ FIXED
        FROM inventory_stock s
        JOIN product_management pm
          ON pm.product_id = s.product_id
        WHERE s.restaurant_id = %s
        GROUP BY
            pm.product_id,
            pm.product_name_english,
            pm.price_per_unit
        ORDER BY pm.product_name_english
    """, (restaurant_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows)




@restaurant_inventory_bp.route("/issue-to-kitchen", methods=["POST"])
def issue_to_kitchen():
    data = request.json
    restaurant_id = data["restaurant_id"]
    items = data["items"]
    remarks = data.get("remarks")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        for item in items:
            product_id = item.get("product_id")
            qty = Decimal(str(item.get("quantity", 0)))

            if not product_id or qty <= 0:
                continue

            # 1️⃣ Check available stock
            cur.execute("""
                SELECT COALESCE(SUM(available_qty), 0) AS total_qty
                FROM inventory_stock
                WHERE restaurant_id = %s AND product_id = %s
            """, (restaurant_id, product_id))

            total_qty = cur.fetchone()["total_qty"]

            if total_qty < qty:
                return jsonify({
                    "error": "Insufficient stock",
                    "product_id": product_id,
                    "available": total_qty
                }), 400

            # 2️⃣ Ledger entry
            cur.execute("""
                INSERT INTO inventory_ledger
                (restaurant_id, product_id, movement_type,
                 quantity, reference_type, remarks)
                VALUES (%s, %s, 'KITCHEN_ISSUE', %s, 'KITCHEN', %s)
            """, (restaurant_id, product_id, qty, remarks))

            # 3️⃣ FIFO deduction
            cur.execute("""
                SELECT *
                FROM inventory_stock
                WHERE restaurant_id = %s
                  AND product_id = %s
                  AND available_qty > 0
                ORDER BY expiry_date NULLS LAST, last_updated
            """, (restaurant_id, product_id))

            remaining = Decimal(qty)
            for batch in cur.fetchall():
                if remaining <= 0:
                    break

                available = Decimal(batch["available_qty"])
                deduct = min(available, remaining)

                cur.execute("""
                    UPDATE inventory_stock
                    SET available_qty = available_qty - %s
                    WHERE restaurant_id = %s
                    AND store_id = %s
                    AND product_id = %s
                    AND batch_no = %s
                """, (
                    deduct,
                    batch["restaurant_id"],
                    batch["store_id"],
                    batch["product_id"],
                    batch["batch_no"]
                ))

                remaining -= deduct


        conn.commit()
        return jsonify({"message": "Issued to kitchen successfully"}), 200

    except Exception as e:
        conn.rollback()
        print("ISSUE ERROR:", e)
        return jsonify({"error": "Failed to issue to kitchen"}), 500

    finally:
        cur.close()
        conn.close()
