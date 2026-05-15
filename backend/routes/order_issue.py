# from flask import Blueprint, request, jsonify
# from flask_cors import CORS
# from psycopg2.extras import RealDictCursor
# from datetime import datetime
# from psycopg2 import Binary
# import jwt
# import base64

# from db import get_db_connection

# JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# order_issue_bp = Blueprint("order_issue_bp", __name__)
# CORS(order_issue_bp, origins=["http://localhost:3000"])


# # =====================================================
# # AUTH
# # =====================================================
# def get_restaurant_from_token():
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

#         if decoded.get("role", "").upper() != "RESTAURANT":
#             return None, ("Forbidden", 403)

#         return decoded["linked_id"], None

#     except jwt.ExpiredSignatureError:
#         return None, ("Token expired", 401)
#     except jwt.InvalidTokenError:
#         return None, ("Invalid token", 401)


# # =====================================================
# # GET ISSUE (VIEW)
# # =====================================================
# @order_issue_bp.route("/orders/<order_id>/issue", methods=["GET"])
# def get_order_issue(order_id):
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             ir.issue_report_id,
#             ir.issue_type,
#             ir.description,
#             ir.status,
#             ir.reported_at,
#             ir.reviewed_at,
#             ir.resolved_at,
#             sr.company_name_english AS supplier_name
#         FROM order_issue_reports ir
#         JOIN order_header oh ON oh.order_id = ir.order_id
#         JOIN supplier_registration sr ON sr.supplier_id = oh.supplier_id
#         WHERE ir.order_id = %s
#           AND oh.restaurant_id = %s
#     """, (order_id, restaurant_id))

#     issue = cur.fetchone()

#     cur.close()
#     conn.close()

#     return jsonify(issue or {}), 200


# # =====================================================
# # POST ISSUE (SUBMIT)
# # =====================================================
# @order_issue_bp.route("/orders/<order_id>/issue", methods=["POST"])
# def submit_order_issue(order_id):
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     issue_type = request.form.get("issue_type")
#     description = request.form.get("description")
#     image_files = request.files.getlist("images")  # ✅ MULTIPLE

#     if not issue_type or not description:
#         return jsonify({"error": "Missing issue data"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     # Verify order
#     cur.execute("""
#         SELECT supplier_id
#         FROM order_header
#         WHERE order_id = %s
#           AND restaurant_id = %s
#     """, (order_id, restaurant_id))

#     order = cur.fetchone()
#     if not order:
#         cur.close()
#         conn.close()
#         return jsonify({"error": "Order not found"}), 404

#     supplier_id = order["supplier_id"]

#     # Generate Issue Report ID
#     year = datetime.now().strftime("%y")
#     cur.execute("""
#         SELECT COUNT(*) AS count
#         FROM order_issue_reports
#         WHERE issue_report_id LIKE %s
#     """, (f"IR-{year}-%",))

#     count = cur.fetchone()["count"] + 1
#     issue_report_id = f"IR-{year}-{str(count).zfill(4)}"

#     # ✅ Convert images to bytea[]
#     issue_images = []
#     for img in image_files:
#         issue_images.append(Binary(img.read()))

#     # Insert issue
#     cur.execute("""
#         INSERT INTO order_issue_reports (
#             issue_report_id,
#             order_id,
#             restaurant_id,
#             supplier_id,
#             issue_type,
#             description,
#             issue_images,
#             status,
#             reported_at,
#             created_at
#         )
#         VALUES (%s, %s, %s, %s, %s, %s, %s, 'UNDER_REVIEW', NOW(), NOW())
#         RETURNING issue_report_id
#     """, (
#         issue_report_id,
#         order_id,
#         restaurant_id,
#         supplier_id,
#         issue_type,
#         description,
#         issue_images
#     ))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({
#         "issue_report_id": issue_report_id
#     }), 201


# def get_supplier_from_token():
#     auth = request.headers.get("Authorization", "")
#     if not auth.startswith("Bearer "):
#         return None, ("Unauthorized", 401)

#     try:
#         decoded = jwt.decode(
#             auth.replace("Bearer ", ""),
#             JWT_SECRET,
#             algorithms=["HS256"],
#             options={"require": ["role", "linked_id"]}
#         )

#         if decoded["role"].upper() != "SUPPLIER":
#             return None, ("Forbidden", 403)

#         return decoded["linked_id"], None

#     except Exception:
#         return None, ("Invalid token", 401)

# @order_issue_bp.route("/supplier/issues", methods=["GET"])
# def supplier_issues():
#     supplier_id, err = get_supplier_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             ir.issue_report_id,
#             ir.issue_type,
#             ir.description, 
#             ir.status,
#             ir.reported_at,
#             oh.order_id,
#             rr.restaurant_name_english,
#             (
#                 SELECT array_agg(encode(img, 'base64'))
#                 FROM unnest(ir.issue_images) AS img
#             ) AS issue_images
#         FROM order_issue_reports ir
#         JOIN order_header oh ON oh.order_id = ir.order_id
#         JOIN restaurant_registration rr ON rr.restaurant_id = ir.restaurant_id
#         WHERE ir.supplier_id = %s
#         ORDER BY ir.reported_at DESC
#     """, (supplier_id,))


#     rows = cur.fetchall() or []

#     cur.close()
#     conn.close()

#     return jsonify(rows), 200


# @order_issue_bp.route(
#     "/supplier/issues/<issue_report_id>/status",
#     methods=["PATCH"]
# )
# def update_issue_status(issue_report_id):
#     supplier_id, err = get_supplier_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     status = request.json.get("status")

#     if status not in ["ACKNOWLEDGED", "ISSUE_RESOLVED", "REJECTED"]:
#         return jsonify({"error": "Invalid status"}), 400

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         UPDATE order_issue_reports
#         SET
#             status = %s,
#             reviewed_at = CASE
#                 WHEN %s = 'ACKNOWLEDGED' THEN now()
#                 ELSE reviewed_at
#             END,
#             resolved_at = CASE
#                 WHEN %s = 'ISSUE_RESOLVED' THEN now()
#                 ELSE resolved_at
#             END
#         WHERE issue_report_id = %s
#           AND supplier_id = %s
#     """, (status, status, status, issue_report_id, supplier_id))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"status": "updated"}), 200





from flask import Blueprint, request, jsonify
from flask_cors import CORS
from psycopg2.extras import RealDictCursor
from datetime import datetime
from psycopg2 import Binary
import jwt
import base64

from db import get_db_connection

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

order_issue_bp = Blueprint("order_issue_bp", __name__)
CORS(order_issue_bp, origins=["http://localhost:3000"])


# =====================================================
# AUTH (RESTAURANT)
# =====================================================
def get_restaurant_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, ("Unauthorized", 401)

    token = auth.replace("Bearer ", "")

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            options={"require": ["role", "linked_id"]}
        )

        if decoded.get("role", "").upper() != "RESTAURANT":
            return None, ("Forbidden", 403)

        return decoded["linked_id"], None

    except jwt.ExpiredSignatureError:
        return None, ("Token expired", 401)
    except jwt.InvalidTokenError:
        return None, ("Invalid token", 401)


# =====================================================
# AUTH (SUPPLIER)
# =====================================================
def get_supplier_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, ("Unauthorized", 401)

    try:
        decoded = jwt.decode(
            auth.replace("Bearer ", ""),
            JWT_SECRET,
            algorithms=["HS256"],
            options={"require": ["role", "linked_id"]}
        )

        if decoded["role"].upper() != "SUPPLIER":
            return None, ("Forbidden", 403)

        return decoded["linked_id"], None

    except Exception:
        return None, ("Invalid token", 401)


# =====================================================
# GET ISSUE (RESTAURANT VIEW)
# =====================================================
# @order_issue_bp.route("/orders/<order_id>/issue", methods=["GET"])
# def get_order_issue(order_id):
#     restaurant_id, err = get_restaurant_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             ir.issue_report_id,
#             ir.issue_type,
#             ir.description,
#             ir.status,
#             ir.reported_at,
#             ir.reviewed_at,
#             ir.resolved_at,
#             sr.company_name_english AS supplier_name
#         FROM order_issue_reports ir
#         JOIN order_header oh ON oh.order_id = ir.order_id
#         JOIN supplier_registration sr ON sr.supplier_id = oh.supplier_id
#         WHERE ir.order_id = %s
#           AND oh.restaurant_id = %s
#     """, (order_id, restaurant_id))

#     issue = cur.fetchone()

#     cur.close()
#     conn.close()

#     return jsonify(issue or {}), 200

@order_issue_bp.route("/orders/<order_id>/issue", methods=["GET"])
def get_order_issue(order_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            ir.issue_report_id,
            ir.issue_type,
            ir.description,
            ir.status,
            ir.action,
            ir.refund,
            ir.notes,
            ir.reported_at,
            ir.reviewed_at,
            ir.resolved_at,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'product_id', oip.product_id,
                        'product_name', oip.product_name
                    )
                ) FILTER (WHERE oip.product_id IS NOT NULL),
                '[]'
            ) AS damaged_products,

            (
                SELECT array_agg(encode(img, 'base64'))
                FROM unnest(ir.issue_images) AS img
            ) AS issue_images

        FROM order_issue_reports ir
        JOIN order_header oh ON oh.order_id = ir.order_id
        LEFT JOIN order_issue_products oip
            ON oip.issue_report_id = ir.issue_report_id

        WHERE ir.order_id = %s
          AND oh.restaurant_id = %s

        GROUP BY
            ir.issue_report_id,
            ir.issue_type,
            ir.description,
            ir.status,
            ir.action,
            ir.refund,
            ir.notes,
            ir.reported_at,
            ir.reviewed_at,
            ir.resolved_at,
            ir.issue_images
    """, (order_id, restaurant_id))

    issue = cur.fetchone()
    cur.close()
    conn.close()

    return jsonify(issue or {}), 200



# =====================================================
# POST ISSUE (SUBMIT)
# =====================================================
@order_issue_bp.route("/orders/<order_id>/issue", methods=["POST"])
def submit_order_issue(order_id):
    restaurant_id, err = get_restaurant_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    issue_type = request.form.get("issue_type")
    description = request.form.get("description")
    image_files = request.files.getlist("images")

    # ✅ products may be product_id OR product_name
    raw_products = request.form.getlist("products")

    if not issue_type or not description:
        return jsonify({"error": "Missing issue data"}), 400

    if not raw_products:
        return jsonify({"error": "No products selected"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # -------------------------------
    # VERIFY ORDER
    # -------------------------------
    cur.execute("""
        SELECT supplier_id
        FROM order_header
        WHERE order_id = %s
          AND restaurant_id = %s
    """, (order_id, restaurant_id))

    order = cur.fetchone()
    if not order:
        cur.close()
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    supplier_id = order["supplier_id"]

    # -------------------------------
    # GENERATE ISSUE REPORT ID (SAFE)
    # -------------------------------
    year = datetime.now().strftime("%y")

    # 🔒 Lock table to prevent concurrent inserts
    cur.execute("""
        LOCK TABLE order_issue_reports IN EXCLUSIVE MODE
    """)

    cur.execute("""
        SELECT COALESCE(
            MAX(CAST(SUBSTRING(issue_report_id FROM 8) AS INTEGER)),
            0
        ) + 1 AS next_num
        FROM order_issue_reports
        WHERE issue_report_id LIKE %s
    """, (f"IR-{year}-%",))

    next_num = cur.fetchone()["next_num"]
    issue_report_id = f"IR-{year}-{str(next_num).zfill(4)}"



    # -------------------------------
    # CONVERT IMAGES
    # -------------------------------
    issue_images = [Binary(img.read()) for img in image_files]

    # -------------------------------
    # INSERT ISSUE REPORT
    # -------------------------------
    cur.execute("""
        INSERT INTO order_issue_reports (
            issue_report_id,
            order_id,
            restaurant_id,
            supplier_id,
            issue_type,
            description,
            issue_images,
            status,
            reported_at,
            created_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'UNDER_REVIEW', NOW(), NOW())
    """, (
        issue_report_id,
        order_id,
        restaurant_id,
        supplier_id,
        issue_type,
        description,
        issue_images
    ))

    # -------------------------------
    # RESOLVE PRODUCTS SAFELY
    # -------------------------------
    cur.execute("""
        SELECT product_id, product_name_english
        FROM order_items
        WHERE order_id = %s
          AND (
              product_id::text = ANY(%s)
              OR product_name_english = ANY(%s)
          )
    """, (order_id, raw_products, raw_products))

    order_products = cur.fetchall()

    if not order_products:
        cur.close()
        conn.close()
        return jsonify({"error": "Invalid products selected"}), 400

    # -------------------------------
    # SAVE DAMAGED PRODUCTS
    # -------------------------------
    cur.executemany("""
        INSERT INTO order_issue_products (
            issue_report_id,
            product_id,
            product_name
        )
        VALUES (%s, %s, %s)
    """, [
        (
            issue_report_id,
            p["product_id"],
            p["product_name_english"]
        )
        for p in order_products
    ])

    # -------------------------------
    # CREATE SUPPLIER NOTIFICATION
    # -------------------------------
    cur.execute("""
        INSERT INTO supplier_notifications (
            supplier_id,
            type,
            title,
            message,
            reference_id
        )
        VALUES (%s, %s, %s, %s, %s)
    """, (
        supplier_id,
        "ORDER_ISSUE",
        "New Order Issue Reported",
        f"Issue reported for Order {order_id}",
        issue_report_id
    ))


    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"issue_report_id": issue_report_id}), 201


# =====================================================
# SUPPLIER: GET ISSUES
# =====================================================
@order_issue_bp.route("/supplier/issues", methods=["GET"])
def supplier_issues():
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            ir.issue_report_id,
            ir.issue_type,
            ir.description,
            ir.status,
            ir.action,
            ir.refund,
            ir.notes,
            ir.reported_at,
            ir.resolved_at,
            oh.order_id,

            -- ✅ ADD THIS
            rr.restaurant_name_english,
            rr.restaurant_name_arabic,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                            'product_id', oip.product_id,

                            'product_name_english',
                            COALESCE(
                                pm.product_name_english,
                                oip.product_name
                            ),

                            'product_name_arabic',
                            pm.product_name_arabic
                        )
                ) FILTER (WHERE oip.product_id IS NOT NULL),
                '[]'
            ) AS damaged_products,

            (
                SELECT array_agg(encode(img, 'base64'))
                FROM unnest(ir.issue_images) AS img
            ) AS issue_images

        FROM order_issue_reports ir
        JOIN order_header oh ON oh.order_id = ir.order_id
        JOIN restaurant_registration rr 
            ON rr.restaurant_id = ir.restaurant_id
        LEFT JOIN order_issue_products oip
            ON oip.issue_report_id = ir.issue_report_id
        LEFT JOIN product_management pm
            ON pm.product_id = oip.product_id

        WHERE ir.supplier_id = %s

        GROUP BY
            ir.issue_report_id,
            ir.issue_type,
            ir.description,
            ir.status,
            ir.action,
            ir.refund,
            ir.notes,
            ir.reported_at,
            ir.resolved_at,
            oh.order_id,
            rr.restaurant_name_english,
            rr.restaurant_name_arabic,  -- ✅ IMPORTANT
            ir.issue_images

        ORDER BY ir.reported_at DESC
    """, (supplier_id,))

    rows = cur.fetchall() or []

    cur.close()
    conn.close()

    return jsonify(rows), 200


# =====================================================
# SUPPLIER: UPDATE ISSUE STATUS
# =====================================================
@order_issue_bp.route("/supplier/issues/<issue_report_id>/status", methods=["PATCH"])
def update_issue_status(issue_report_id):
    supplier_id, err = get_supplier_from_token()
    if err:
        return jsonify({"error": err[0]}), err[1]

    data = request.json
    status = data.get("status")
    action = data.get("action")
    refund = data.get("refund")
    notes = data.get("notes")

    if status not in ["ACKNOWLEDGED", "ISSUE_RESOLVED", "REJECTED"]:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            ir.order_id,
            ir.restaurant_id
        FROM order_issue_reports ir
        WHERE ir.issue_report_id = %s
        AND ir.supplier_id = %s
    """, (issue_report_id, supplier_id))

    issue_meta = cur.fetchone()
    if not issue_meta:
        return jsonify({"error": "Issue not found"}), 404


    cur.execute("""
        UPDATE order_issue_reports
        SET
            status = %s,
            action = %s,
            refund = %s,
            notes = %s,
            reviewed_at = CASE
                WHEN %s = 'ACKNOWLEDGED' THEN now()
                ELSE reviewed_at
            END,
            resolved_at = CASE
                WHEN %s = 'ISSUE_RESOLVED' THEN now()
                ELSE resolved_at
            END
        WHERE issue_report_id = %s
          AND supplier_id = %s
        RETURNING
            issue_report_id,
            issue_type,
            description,
            status,
            action,
            refund,
            notes,
            resolved_at
    """, (
        status,
        action,
        refund,
        notes,
        status,
        status,
        issue_report_id,
        supplier_id
    ))

    updated_issue = cur.fetchone()
    # 🔔 CREATE RESTAURANT NOTIFICATION (ISSUE UPDATE)
    cur.execute("""
        INSERT INTO restaurant_notifications
        (
            restaurant_id,
            type,
            title,
            message,
            reference_id
        )
        VALUES
        (%s, %s, %s, %s, %s)
    """, (
        issue_meta["restaurant_id"],
        "ORDER_ISSUE_UPDATE",
        "Order Issue Updated",
        f"Issue {issue_report_id} has been {status.replace('_', ' ').lower()}",
        issue_meta["order_id"]
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify(updated_issue), 200


# @order_issue_bp.route(
#     "/supplier/issues/notifications/count",
#     methods=["GET", "OPTIONS"]
# )
# def supplier_issue_notification_count():

#     if request.method == "OPTIONS":
#         return jsonify({"ok": True}), 200

#     supplier_id, err = get_supplier_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT COUNT(*)
#         FROM supplier_notifications
#         WHERE supplier_id = %s
#           AND type = 'ORDER_ISSUE'
#           AND (is_read IS FALSE OR is_read IS NULL)
#     """, (supplier_id,))

#     count = cur.fetchone()[0]

#     cur.close()
#     conn.close()

#     return jsonify({"count": count})


# @order_issue_bp.route(
#     "/supplier/issues/notifications/<int:notification_id>/read",
#     methods=["PUT"]
# )
# def mark_issue_notification_read(notification_id):

#     supplier_id, err = get_supplier_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         UPDATE supplier_notifications
#         SET is_read = TRUE
#         WHERE id = %s
#           AND supplier_id = %s
#           AND type = 'ORDER_ISSUE'
#     """, (notification_id, supplier_id))

#     conn.commit()
#     cur.close()
#     conn.close()

#     return jsonify({"ok": True})


# @order_issue_bp.route("/supplier/notifications", methods=["GET"])
# def supplier_notifications():
#     supplier_id, err = get_supplier_from_token()
#     if err:
#         return jsonify({"error": err[0]}), err[1]

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             id,
#             type,
#             title,
#             message,
#             reference_id,
#             is_read,
#             created_at
#         FROM supplier_notifications
#         WHERE supplier_id = %s
#         ORDER BY created_at DESC
#     """, (supplier_id,))

#     rows = cur.fetchall() or []

#     cur.close()
#     conn.close()

#     return jsonify(rows), 200
