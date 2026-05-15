from flask import Blueprint, request, jsonify
from flask_cors import CORS
from psycopg2.extras import RealDictCursor
import jwt
import traceback
from db import get_db_connection

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

restaurant_order_bp = Blueprint("restaurant_order_bp", __name__)
CORS(
    restaurant_order_bp,
    origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.2.18:3000"
    ],
    supports_credentials=True
)


# =========================================================
# AUTH
# =========================================================
def get_restaurant_from_token():
    # 🔥 ALLOW PREFLIGHT
    if request.method == "OPTIONS":
        return None, None

    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, ("Unauthorized", 401)

    try:
        decoded = jwt.decode(
            auth.replace("Bearer ", ""),
            JWT_SECRET,
            algorithms=["HS256"],
            options={"require": ["role", "linked_id"]},
        )

        if decoded["role"].upper() != "RESTAURANT":
            return None, ("Forbidden", 403)

        return decoded["linked_id"], None

    except Exception:
        return None, ("Invalid token", 401)


    # try:
    #     decoded = jwt.decode(
    #         auth.replace("Bearer ", ""),
    #         JWT_SECRET,
    #         algorithms=["HS256"],
    #         options={"require": ["role", "linked_id"]},
    #     )

    #     if decoded["role"].upper() != "RESTAURANT":
    #         return None, ("Forbidden", 403)

    #     return decoded["linked_id"], None

    # except Exception:
    #     return None, ("Invalid token", 401)



# @restaurant_order_bp.route("/restaurant/orders", methods=["GET"])
# def restaurant_orders():

#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify([]), 200

#     search = request.args.get("search", "").strip()
#     status = request.args.get("status", "ALL")
#     last30 = request.args.get("last30", "1")

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         query = """
#             SELECT
#                 oh.order_id,
#                 oh.order_date,
#                 oh.total_amount,
#                 oh.status,
#                 oh.is_recurring,
#                 sr.company_name_english,
#                 sr.company_name_arabic,


#                 json_agg(
#                     json_build_object(
#                         'product_name_english', oi.product_name_english,
#                         'product_name_arabic', pm.product_name_arabic,
#                         'quantity', oi.quantity
#                     )
#                 ) AS items

#             FROM order_header oh
#             JOIN order_items oi ON oi.order_id = oh.order_id
#             JOIN product_management pm ON pm.product_id = oi.product_id
#             JOIN supplier_registration sr
#                 ON sr.supplier_id = oh.supplier_id

#             WHERE oh.restaurant_id = %s
#         """

#         params = [restaurant_id]

#         if search:
#             query += """
#               AND (
#                 CAST(oh.order_id AS TEXT) ILIKE %s
#                 OR sr.company_name_english ILIKE %s
#               )
#             """
#             params.extend([f"%{search}%", f"%{search}%"])

#         if status != "ALL":
#             query += " AND oh.status = %s"
#             params.append(status)

#         # if last30 == "1":
#         #     query += " AND oh.order_date >= NOW() - INTERVAL '30 days'"

#         query += """
#             GROUP BY
#                 oh.order_id,
#                 oh.order_date,
#                 oh.total_amount,
#                 oh.status,
#                 oh.is_recurring,
#                 sr.company_name_english,
#                 sr.company_name_arabic
#             ORDER BY oh.order_date DESC
#         """

#         cur.execute(query, params)

#         return jsonify(cur.fetchall() or []), 200

#     finally:
#         cur.close()
#         conn.close()



@restaurant_order_bp.route("/restaurant/orders", methods=["GET"])
def restaurant_orders():

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify([]), 200

    search = request.args.get("search", "").strip()
    status = request.args.get("status", "ALL")
    last30 = request.args.get("last30", "1")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        query = """
            SELECT
                oh.master_order_id,
                oh.order_id,
                oh.order_date,
                oh.total_amount,
                oh.status,
                oh.is_recurring,
                sr.company_name_english,
                sr.company_name_arabic,


                json_agg(
                    json_build_object(
                        'product_name_english', oi.product_name_english,
                        'product_name_arabic', pm.product_name_arabic,
                        'quantity', oi.quantity
                    )
                ) AS items

            FROM order_header oh
            JOIN order_items oi ON oi.order_id = oh.order_id
            JOIN product_management pm ON pm.product_id = oi.product_id
            JOIN supplier_registration sr
                ON sr.supplier_id = oh.supplier_id

            WHERE oh.restaurant_id = %s
        """

        params = [restaurant_id]

        if search:
            query += """
            AND (
                CAST(oh.order_id AS TEXT) ILIKE %s
                OR CAST(oh.master_order_id AS TEXT) ILIKE %s
                OR sr.company_name_english ILIKE %s
                OR sr.company_name_arabic ILIKE %s
            )
            """

            params.extend([
                f"%{search}%",
                f"%{search}%",
                f"%{search}%",
                f"%{search}%"
            ])

        if status != "ALL":
            query += " AND oh.status = %s"
            params.append(status)

        # if last30 == "1":
        #     query += " AND oh.order_date >= NOW() - INTERVAL '30 days'"

        query += """
            GROUP BY
                oh.master_order_id,
                oh.order_id,
                oh.order_date,
                oh.total_amount,
                oh.status,
                oh.is_recurring,
                sr.company_name_english,
                sr.company_name_arabic
            ORDER BY oh.order_date DESC
        """

        cur.execute(query, params)

        rows = cur.fetchall() or []

        master_orders = {}

        for row in rows:

            master_id = (
                row["master_order_id"]
                or row["order_id"]
            )

            if master_id not in master_orders:

                master_orders[master_id] = {
                    "master_order_id": master_id,
                    "order_date": row["order_date"],
                    "split_orders": [],
                    "grand_total": 0
                }

            master_orders[master_id]["split_orders"].append({
                "order_id": row["order_id"],
                "order_date": row["order_date"],
                "total_amount": row["total_amount"],
                "status": row["status"],
                "is_recurring": row["is_recurring"],
                "company_name_english": row["company_name_english"],
                "company_name_arabic": row["company_name_arabic"],
                "items": row["items"]
            })

            master_orders[master_id]["grand_total"] += float(
                row["total_amount"] or 0
            )

        result = list(master_orders.values())

        return jsonify(result), 200

    finally:
        cur.close()
        conn.close()
        
# =========================================================
# GET: SINGLE ORDER DETAILS  ✅ RESTAURANT ADDED
# =========================================================
@restaurant_order_bp.route("/restaurant/orders/<order_id>", methods=["GET"])
def restaurant_order_details(order_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": "Unauthorized"}), 401

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # -------------------------------------------------
        # HEADER + RESTAURANT + SUPPLIER
        # -------------------------------------------------
        cur.execute(
            """
            SELECT
                oh.order_id,
                oh.supplier_id, 
                oh.order_date,
                oh.expected_delivery_date,
                oh.status,
                oh.payment_status,
                oh.total_amount,
                oh.remarks,
                oh.updated_at,

                -- RESTAURANT BASIC
                rr.restaurant_name_english,
                rr.restaurant_name_arabic,
                rr.contact_person_name  AS restaurant_contact_name,
                rr.contact_person_mobile AS restaurant_contact_mobile,
                rr.contact_person_email AS restaurant_contact_email,

                -- RESTAURANT ADDRESS (STORE)
                rs.street   AS restaurant_street,
                rs.zone     AS restaurant_zone,
                rs.building AS restaurant_building,
                rs.shop_no  AS restaurant_shop_no,
                rs.city     AS restaurant_city,
                rs.country  AS restaurant_country,

                -- SUPPLIER BASIC
                sr.company_name_english,
                sr.company_name_arabic,
                sr.contact_person_name  AS supplier_contact,
                sr.contact_person_mobile AS supplier_mobile,
                sr.contact_person_email AS supplier_email,

                -- ✅ SUPPLIER ADDRESS
                sr.address AS supplier_address,
                sr.street  AS supplier_street,
                sr.zone    AS supplier_zone,
                sr.area    AS supplier_area,
                sr.country AS supplier_country

            FROM order_header oh

            JOIN restaurant_registration rr
            ON rr.restaurant_id = oh.restaurant_id

            LEFT JOIN LATERAL (
                SELECT *
                FROM restaurant_store_registration
                WHERE restaurant_id = oh.restaurant_id
                ORDER BY store_id
                LIMIT 1
            ) rs ON true

            JOIN supplier_registration sr
            ON sr.supplier_id = oh.supplier_id

            WHERE oh.order_id = %s
            AND oh.restaurant_id = %s
            """,
            (order_id, restaurant_id),
        )



        header = cur.fetchone()
        if not header:
            return jsonify({"error": "Order not found"}), 404

        # -------------------------------------------------
        # ITEMS
        # -------------------------------------------------
        cur.execute(
            """
            SELECT
                oi.product_id,
                oi.product_name_english,
                pm.product_name_arabic,   -- ✅ ADD THIS
                oi.quantity,
                oi.price_per_unit,
                oi.discount,
                oi.total_amount
            FROM order_items oi
            JOIN product_management pm 
                ON pm.product_id = oi.product_id
            WHERE oi.order_id = %s
            ORDER BY oi.item_id
            """,
            (order_id,),
        )
        items = cur.fetchall() or []

        # -------------------------------------------------
        # TIMELINE
        # -------------------------------------------------
        cur.execute(
            """
            SELECT
                status,
                changed_by_role,
                changed_at
            FROM order_status_history
            WHERE order_id = %s
            ORDER BY changed_at
            """,
            (order_id,),
        )
        timeline = cur.fetchall() or []

        # -------------------------------------------------
        # ENSURE DELIVERED STATUS
        # -------------------------------------------------
        if header["status"] == "DELIVERED":
            if not any(t["status"] == "DELIVERED" for t in timeline):
                timeline.append(
                    {
                        "status": "DELIVERED",
                        "changed_by_role": "SYSTEM",
                        "changed_at": header["updated_at"]
                        or header["order_date"],
                    }
                )

               # -------------------------------------------------
        # DELIVERY DETAILS (FULL B2B VERSION)
        # -------------------------------------------------
        cur.execute("""
        SELECT
            od.delivery_type,
            od.driver_name,
            od.driver_mobile,
            od.vehicle_type,
            od.vehicle_number,
            od.partner_name,
            od.estimated_delivery_time,
            od.created_at,
            od.received_by,
            od.delivered_at,
            od.status,

            -- ✅ DELIVERY ADDRESS (FROM ORDER_ADDRESS)
            oa.address_line,
            oa.city,
            oa.country,
            oa.lat,
            oa.lng

        FROM order_delivery od
        JOIN order_header oh ON oh.order_id = od.order_id

        -- ✅ IMPORTANT JOIN
        JOIN order_address oa
            ON oa.order_id = oh.order_id

        WHERE od.order_id = %s
        ORDER BY od.created_at DESC
        LIMIT 1
    """, (order_id,))

        delivery = cur.fetchone()


        # FORMAT ADDRESS
        if delivery:
            address = f"""
        {delivery['address_line']}
        {delivery['city']} {delivery['country']}
        """

            delivery["delivery_address"] = address

            # ✅ ADD LAT LNG (VERY IMPORTANT)
            delivery["dest_lat"] = delivery["lat"]
            delivery["dest_lng"] = delivery["lng"]


        # -------------------------------------------------
        # RECURRING DETAILS
        # -------------------------------------------------
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
            AND restaurant_id = %s
            LIMIT 1
        """, (order_id, restaurant_id))

        recurring = cur.fetchone()



        return jsonify(
            {
                "header": header,
                "items": items,
                "timeline": timeline,
                "delivery": delivery,
                "recurring": recurring
            }
        ), 200

    except Exception:
        traceback.print_exc()
        return jsonify({"error": "Failed"}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# GET: PENDING MODIFICATION REQUESTS (RESTAURANT)
# =========================================================
@restaurant_order_bp.route("/restaurant/orders/modification-requests", methods=["GET"])
def restaurant_modification_requests():
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                omr.id,
                omr.order_id,
                omr.note,
                omr.original_items,
                omr.modified_items,
                omr.created_at,

                sr.company_name_english AS supplier_name,

                (
                  SELECT COALESCE(SUM(
                    (i->>'quantity')::numeric *
                    (i->>'price_per_unit')::numeric -
                    COALESCE((i->>'discount')::numeric, 0)
                  ), 0)
                  FROM jsonb_array_elements(omr.original_items) i
                ) AS total_before,

                (
                  SELECT COALESCE(SUM(
                    (i->>'quantity')::numeric *
                    (i->>'price_per_unit')::numeric -
                    COALESCE((i->>'discount')::numeric, 0)
                  ), 0)
                  FROM jsonb_array_elements(omr.modified_items) i
                ) AS total_after

            FROM order_modification_requests omr
            JOIN order_header oh
              ON oh.order_id = omr.order_id
            JOIN supplier_registration sr
              ON sr.supplier_id = oh.supplier_id
            WHERE oh.restaurant_id = %s
              AND omr.status = 'PENDING'
            ORDER BY omr.created_at DESC
        """, (restaurant_id,))

        return jsonify(cur.fetchall() or []), 200

    finally:
        cur.close()
        conn.close()




# =========================================================
# PUT: APPROVE / REJECT MODIFICATION (RESTAURANT)
# =========================================================
@restaurant_order_bp.route(
    "/restaurant/orders/modification-requests/<int:req_id>/decision",
    methods=["PUT"]
)
def decide_modification_request(req_id):
    data = request.get_json() or {}
    decision = data.get("decision")  # APPROVED / REJECTED

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    if decision not in ("APPROVED", "REJECTED"):
        return jsonify({"error": "Invalid decision"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # -------------------------------------------------
        # 1️⃣ FETCH MODIFICATION REQUEST
        # -------------------------------------------------
        cur.execute("""
            SELECT
                omr.id,
                omr.order_id,
                omr.modified_items
            FROM order_modification_requests omr
            JOIN order_header oh
              ON oh.order_id = omr.order_id
            WHERE omr.id = %s
              AND oh.restaurant_id = %s
              AND omr.status = 'PENDING'
        """, (req_id, restaurant_id))

        req = cur.fetchone()
        if not req:
            return jsonify({"error": "Request not found"}), 404

        # -------------------------------------------------
        # 2️⃣ 🔒 BLOCK MODIFICATION IF INVOICE EXISTS
        # -------------------------------------------------
        cur.execute("""
            SELECT 1
            FROM invoice_items ii
            JOIN order_items oi ON oi.item_id = ii.order_item_id
            WHERE oi.order_id = %s
            LIMIT 1
        """, (req["order_id"],))

        if cur.fetchone():
            return jsonify({
                "error": "Invoice already generated. Modification not allowed."
            }), 400

        # -------------------------------------------------
        # 3️⃣ APPLY MODIFICATION (ONLY IF APPROVED)
        # -------------------------------------------------
        if decision == "APPROVED":
            # ❗ Safe now (no invoice exists)
            cur.execute(
                "DELETE FROM order_items WHERE order_id = %s",
                (req["order_id"],)
            )

            total = 0
            for i in req["modified_items"]:
                line_total = (
                    i["quantity"] * i["price_per_unit"]
                    - i.get("discount", 0)
                )

                total += line_total

                cur.execute("""
                    INSERT INTO order_items
                    (
                        order_id,
                        product_id,
                        product_name_english,
                        quantity,
                        price_per_unit,
                        discount,
                        total_amount
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                """, (
                    req["order_id"],
                    i["product_id"],
                    i["product_name_english"],
                    i["quantity"],
                    i["price_per_unit"],
                    i.get("discount", 0),
                    line_total
                ))

            # 🔄 Update order total
            cur.execute("""
                UPDATE order_header
                SET total_amount = %s
                WHERE order_id = %s
            """, (total, req["order_id"]))

        # -------------------------------------------------
        # 4️⃣ UPDATE MODIFICATION REQUEST STATUS
        # -------------------------------------------------
        cur.execute("""
            UPDATE order_modification_requests
            SET status = %s
            WHERE id = %s
        """, (decision, req_id))

        conn.commit()

        return jsonify({
            "message": f"Modification {decision.lower()} successfully"
        }), 200

    except Exception:
        conn.rollback()
        traceback.print_exc()
        return jsonify({"error": "Failed"}), 500

    finally:
        cur.close()
        conn.close()





@restaurant_order_bp.route("/dashboard", methods=["GET"])
def restaurant_dashboard():
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # ---------------- TODAY ORDERS ----------------
    cur.execute("""
        SELECT COUNT(*) AS today_orders
        FROM order_header
        WHERE restaurant_id = %s
          AND DATE(order_date) = CURRENT_DATE
    """, (restaurant_id,))
    today_orders = cur.fetchone()["today_orders"]

    # ---------------- TODAY SPENT ----------------
    cur.execute("""
        SELECT COALESCE(SUM(total_amount), 0) AS today_spent
        FROM order_header
        WHERE restaurant_id = %s
          AND DATE(order_date) = CURRENT_DATE
    """, (restaurant_id,))
    today_spent = cur.fetchone()["today_spent"]

    # ---------------- TOTAL ORDERS ----------------
    cur.execute("""
        SELECT COUNT(*) AS total_orders
        FROM order_header
        WHERE restaurant_id = %s
    """, (restaurant_id,))
    total_orders = cur.fetchone()["total_orders"]

    # ---------------- MONTHLY ORDERS ----------------
    cur.execute("""
        SELECT 
            TO_CHAR(order_date, 'Mon') AS month,
            COUNT(*) AS total_orders
        FROM order_header
        WHERE restaurant_id = %s
        GROUP BY DATE_TRUNC('month', order_date), month
        ORDER BY DATE_TRUNC('month', order_date)
    """, (restaurant_id,))
    monthly_orders = cur.fetchall()

    # ---------------- MONTHLY SPEND ----------------
    cur.execute("""
        SELECT 
            TO_CHAR(order_date, 'Mon') AS month,
            COALESCE(SUM(total_amount),0) AS total_spent
        FROM order_header
        WHERE restaurant_id = %s
        GROUP BY DATE_TRUNC('month', order_date), month
        ORDER BY DATE_TRUNC('month', order_date)
    """, (restaurant_id,))
    monthly_spend = cur.fetchall()

    # ---------------- TOP SUPPLIERS ----------------
    cur.execute("""
        SELECT 
            sr.company_name_english AS supplier_name,
            COUNT(DISTINCT oh.order_id) AS total_orders,
            COALESCE(SUM(oh.total_amount), 0) AS total_spent

        FROM order_header oh
        JOIN supplier_registration sr 
            ON oh.supplier_id = sr.supplier_id

        WHERE oh.restaurant_id = %s

        GROUP BY sr.company_name_english

        ORDER BY total_spent DESC
        LIMIT 5
    """, (restaurant_id,))
    supplier_spend = cur.fetchall()

    # ---------------- ORDER STATUS ----------------
    cur.execute("""
        SELECT status, COUNT(*) AS count
        FROM order_header
        WHERE restaurant_id = %s
        GROUP BY status
    """, (restaurant_id,))
    order_status = cur.fetchall()

    # ---------------- RECENT ORDERS ----------------
    cur.execute("""
        SELECT 
            oh.order_id,
            oh.total_amount,
            oh.status,
            sr.company_name_english AS supplier_name
        FROM order_header oh
        JOIN supplier_registration sr 
            ON oh.supplier_id = sr.supplier_id
        WHERE oh.restaurant_id = %s
        ORDER BY oh.order_date DESC
        LIMIT 5
    """, (restaurant_id,))

    recent_orders = cur.fetchall()

    
    cur.execute("""
        SELECT COUNT(*) AS pending_orders
        FROM order_header
        WHERE restaurant_id = %s
        AND status IN ('PLACED','CONFIRMED','PREPARING','OUT_FOR_DELIVERY')
    """, (restaurant_id,))

    pending_orders = cur.fetchone()["pending_orders"]

    cur.close()
    conn.close()

    return jsonify({
        "today_orders": today_orders,
        "today_spent": today_spent,
        "total_orders": total_orders,
        "monthly_orders": monthly_orders,
        "monthly_spend": monthly_spend,
        "supplier_spend": supplier_spend,
        "order_status": order_status,
        "recent_orders": recent_orders,
        "pending_orders": pending_orders
    }), 200


@restaurant_order_bp.route(
    "/restaurant/notifications/count",
    methods=["GET", "OPTIONS"]
)
def restaurant_notification_count():
    # 🔥 Handle CORS preflight
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT COUNT(*) AS count
        FROM restaurant_notifications
        WHERE restaurant_id = %s
          AND (is_read IS FALSE OR is_read IS NULL)
    """, (restaurant_id,))

    count = cur.fetchone()["count"]

    cur.close()
    conn.close()

    return jsonify({ "count": int(count) }), 200



@restaurant_order_bp.route("/restaurant/notifications", methods=["GET"])
def restaurant_notifications():
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT *
        FROM restaurant_notifications
        WHERE restaurant_id = %s
        ORDER BY created_at DESC
    """, (restaurant_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200

@restaurant_order_bp.route("/restaurant/notifications/<int:notification_id>/read", methods=["PUT"])
def mark_restaurant_notification_read(notification_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE restaurant_notifications
        SET is_read = TRUE
        WHERE id = %s
          AND restaurant_id = %s
    """, (notification_id, restaurant_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"ok": True}), 200

@restaurant_order_bp.route(
    "/restaurant/notifications/auto-read",
    methods=["PUT", "OPTIONS"]
)
def auto_read_restaurant_notification():
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    data = request.get_json() or {}
    reference_id = data.get("reference_id")
    notif_type = data.get("type")

    if not reference_id or not notif_type:
        return jsonify({"error": "reference_id and type required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    if reference_id == "ALL":
        cur.execute("""
            UPDATE restaurant_notifications
            SET is_read = TRUE
            WHERE restaurant_id = %s
            AND type = %s
            AND (is_read IS FALSE OR is_read IS NULL)
        """, (restaurant_id, notif_type))
    else:
        cur.execute("""
            UPDATE restaurant_notifications
            SET is_read = TRUE
            WHERE restaurant_id = %s
            AND reference_id = %s
            AND type = %s
            AND (is_read IS FALSE OR is_read IS NULL)
        """, (restaurant_id, str(reference_id), notif_type))


    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"ok": True}), 200

@restaurant_order_bp.route(
    "/restaurant/notifications/read-all",
    methods=["PUT", "OPTIONS"]
)
def mark_all_restaurant_notifications_read():

    # 🔥 handle CORS preflight
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE restaurant_notifications
        SET is_read = TRUE
        WHERE restaurant_id = %s
        AND (is_read IS FALSE OR is_read IS NULL)
    """, (restaurant_id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "All notifications marked as read"}), 200


@restaurant_order_bp.route("/delivery/<order_id>/location", methods=["GET"])
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

        location = cur.fetchone()

        return jsonify(location or {}), 200

    finally:
        cur.close()
        conn.close()


# =========================================================
# EDIT ORDER BY RESTAURANT
# =========================================================
@restaurant_order_bp.route(
    "/restaurant/orders/<order_id>/edit",
    methods=["PUT", "OPTIONS"]
)
def edit_order_by_restaurant(order_id):

    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    data = request.get_json()
    items = data.get("items")

    if not items:
        return jsonify({"error": "No items provided"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT status
            FROM order_header
            WHERE order_id = %s
              AND restaurant_id = %s
            FOR UPDATE
        """, (order_id, restaurant_id))

        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        if order["status"] != "PLACED":
            return jsonify({
                "error": "Order cannot be modified after supplier acceptance"
            }), 400

        cur.execute("DELETE FROM order_items WHERE order_id = %s", (order_id,))

        new_total = 0

        for item in items:
            qty = float(item["quantity"])
            price = float(item["price_per_unit"])
            discount = float(item.get("discount", 0))

            line_total = (qty * price) - discount
            new_total += line_total

            cur.execute("""
                INSERT INTO order_items
                (order_id, product_id, product_name_english,
                 quantity, price_per_unit, discount, total_amount)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (
                order_id,
                item["product_id"],
                item["product_name_english"],
                qty,
                price,
                discount,
                line_total
            ))

        cur.execute("""
            UPDATE order_header
            SET total_amount = %s,
                updated_at = NOW()
            WHERE order_id = %s
        """, (new_total, order_id))

        conn.commit()

        return jsonify({
            "message": "Order updated successfully",
            "new_total": new_total
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# =========================================================
# CANCEL ORDER
# =========================================================
@restaurant_order_bp.route(
    "/restaurant/orders/<order_id>/cancel",
    methods=["PUT", "OPTIONS"]
)
def cancel_order_by_restaurant(order_id):

    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT status, supplier_id
            FROM order_header
            WHERE order_id = %s
              AND restaurant_id = %s
            FOR UPDATE
        """, (order_id, restaurant_id))

        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        if order["status"] != "PLACED":
            return jsonify({
                "error": "Order cannot be cancelled at this stage"
            }), 400

        supplier_id = order["supplier_id"]

        cur.execute("""
            UPDATE order_header
            SET status = 'CANCELLED',
                updated_at = NOW()
            WHERE order_id = %s
        """, (order_id,))

        cur.execute("""
            INSERT INTO order_status_history
            (order_id, status, changed_by_role, changed_by_id)
            VALUES (%s, 'CANCELLED', 'RESTAURANT', %s)
        """, (order_id, restaurant_id))

        cur.execute("""
            INSERT INTO supplier_notifications
            (supplier_id, type, title, message, reference_id)
            VALUES (%s,%s,%s,%s,%s)
        """, (
            supplier_id,
            "ORDER_CANCELLED",
            "Order Cancelled",
            f"Order {order_id} has been cancelled by restaurant.",
            order_id
        ))

        conn.commit()

        return jsonify({"message": "Order cancelled successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# ADD ITEM TO ORDER
# =========================================================
@restaurant_order_bp.route(
    "/restaurant/orders/<order_id>/add-item",
    methods=["POST", "OPTIONS"]
)
def add_item_to_order(order_id):

    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    data = request.get_json() or {}

    product_id = data.get("product_id")
    product_name = data.get("product_name_english")
    quantity = float(data.get("quantity", 1))
    price = float(data.get("price_per_unit", 0))
    discount = float(data.get("discount", 0))

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT status
            FROM order_header
            WHERE order_id = %s
              AND restaurant_id = %s
            FOR UPDATE
        """, (order_id, restaurant_id))

        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        if order["status"] != "PLACED":
            return jsonify({"error": "Order cannot be modified"}), 400

        line_total = (quantity * price) - discount

        cur.execute("""
            INSERT INTO order_items
            (order_id, product_id, product_name_english,
             quantity, price_per_unit, discount, total_amount)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (
            order_id,
            product_id,
            product_name,
            quantity,
            price,
            discount,
            line_total
        ))

        cur.execute("""
            UPDATE order_header
            SET total_amount = total_amount + %s,
                updated_at = NOW()
            WHERE order_id = %s
        """, (line_total, order_id))

        conn.commit()

        return jsonify({"message": "Item added successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# CREATE RECURRING ORDER
# =========================================================
@restaurant_order_bp.route(
    "/restaurant/recurring/create",
    methods=["POST", "OPTIONS"]
)
def create_recurring_order():

    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    data = request.get_json() or {}

    order_id = data.get("order_id")
    frequency = data.get("frequency")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    weekdays = data.get("weekdays", [])

    if not order_id or not frequency or not start_date:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT supplier_id
            FROM order_header
            WHERE order_id = %s
              AND restaurant_id = %s
        """, (order_id, restaurant_id))

        order = cur.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        supplier_id = order["supplier_id"]

        cur.execute("""
            INSERT INTO recurring_orders
            (
                order_id,
                restaurant_id,
                supplier_id,
                frequency,
                start_date,
                next_run_date,
                status,
                weekdays,
                end_date
            )
            VALUES (%s,%s,%s,%s,%s,%s,'ACTIVE',%s,%s)
        """, (
            order_id,
            restaurant_id,
            supplier_id,
            frequency,
            start_date,
            start_date,
            weekdays,
            end_date
        ))

        cur.execute("""
            UPDATE order_header
            SET is_recurring = TRUE
            WHERE order_id = %s
        """, (order_id,))

        conn.commit()

        return jsonify({"message": "Recurring created successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# PAUSE RECURRING
# =========================================================
@restaurant_order_bp.route(
    "/restaurant/recurring/pause/<order_id>",
    methods=["PUT", "OPTIONS"]
)
def pause_recurring_order(order_id):

    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE order_header
            SET is_recurring = FALSE
            WHERE order_id = %s
              AND restaurant_id = %s
        """, (order_id, restaurant_id))

        conn.commit()

        return jsonify({"message": "Recurring paused"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# =========================================================
# MANUAL RUN RECURRING
# =========================================================
@restaurant_order_bp.route(
    "/restaurant/run-recurring-now",
    methods=["POST"]
)
def manual_run_recurring():

    from services.recurring_scheduler import run_recurring_orders
    run_recurring_orders()

    return jsonify({
        "message": "Recurring executed"
    }), 200