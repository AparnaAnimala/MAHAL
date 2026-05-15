from flask import Blueprint, request, jsonify, g
from psycopg2.extras import RealDictCursor
from datetime import datetime
from routes.admin_guard import require_admin
from routes.admin_audit import log_admin_action
from db import get_db_connection
from psycopg2.errors import UniqueViolation


admin_promotions_bp = Blueprint(
    "admin_promotions_bp",
    __name__,
    url_prefix="/api/admin/promotions"
)
# ============================================
# VALID GRID POSITIONS (NEW)
# ============================================

VALID_GRID_POSITIONS = [


    "LEFT_SLIDER_1",
    "LEFT_SLIDER_2",
    "LEFT_SLIDER_3",

    "RIGHT_SLIDER_1",
    "RIGHT_SLIDER_2",
    "RIGHT_SLIDER_3"
]

# =====================================================
# GET SUPPLIER PROMOTION REQUESTS (ADMIN VIEW)
# =====================================================

@admin_promotions_bp.route("/requests", methods=["GET"])
@require_admin(permission="VIEW_PROMOTIONS")
def get_promotion_requests():

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                pr.*,
                pm.product_name_english,
                sr.company_name_english
            FROM promotion_requests pr
            LEFT JOIN product_management pm
                ON pm.product_id = pr.product_id
            LEFT JOIN supplier_registration sr
                ON sr.supplier_id = pr.supplier_id
            ORDER BY pr.created_at DESC
        """)

        rows = cur.fetchall()

        return jsonify(rows)

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# APPROVE REQUEST
# =====================================================

@admin_promotions_bp.route("/requests/<int:request_id>/approve", methods=["PUT"])
@require_admin(permission="MANAGE_PROMOTIONS")
def approve_request(request_id):

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE promotion_requests
            SET status='APPROVED',
                updated_at=NOW(),
                created_by_admin=%s
            WHERE request_id=%s
        """, (g.admin["admin_id"], request_id))

        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="PROMOTION_REQUEST_APPROVED",
            entity_type="promotion_request",
            entity_id=request_id
        )

        return jsonify({"message": "Request approved"})

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# REJECT REQUEST
# =====================================================

@admin_promotions_bp.route("/requests/<int:request_id>/reject", methods=["PUT"])
@require_admin(permission="MANAGE_PROMOTIONS")
def reject_request(request_id):

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE promotion_requests
            SET status='REJECTED',
                updated_at=NOW(),
                created_by_admin=%s
            WHERE request_id=%s
        """, (g.admin["admin_id"], request_id))

        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="PROMOTION_REQUEST_REJECTED",
            entity_type="promotion_request",
            entity_id=request_id
        )

        return jsonify({"message": "Request rejected"})

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# CREATE PROMOTION (ADMIN DIRECT OR FROM REQUEST)
# =====================================================

@admin_promotions_bp.route("/create", methods=["POST"])
@require_admin(permission="MANAGE_PROMOTIONS")
def create_promotion():

    data = request.json or {}

    supplier_id = data.get("supplier_id")
    product_id = data.get("product_id")
    category_id = data.get("category_id")

    promotion_type = data.get("promotion_type")  # MAHAL / PAID
    city = data.get("city")

    priority = data.get("priority", 1)

    start_date = data.get("start_date")
    end_date = data.get("end_date")

    request_id = data.get("request_id")

    if not supplier_id:
        return jsonify({"error": "supplier_id required"}), 400

    conn = cur = None

    try:

        conn = get_db_connection()
        conn.autocommit = False

        # CRITICAL: strongest isolation for promotion creation
        conn.set_session(isolation_level="SERIALIZABLE")

        cur = conn.cursor(cursor_factory=RealDictCursor)


# ============================================
# DUPLICATE PROTECTION
# ============================================

        cur.execute("""
            SELECT promotion_id
            FROM paid_promotions
            WHERE supplier_id = %s
            AND city = %s
            AND promotion_type = %s
            AND status IN ('ACTIVE','PAUSED')
            AND tstzrange(start_date, end_date) && tstzrange(%s::timestamptz, %s::timestamptz)
            FOR UPDATE
        """, (
            supplier_id,
            city,
            promotion_type,
            start_date,
            end_date
        ))

        existing = cur.fetchone()

        if existing:

            conn.commit()

            return jsonify({
                "message": "Using existing campaign",
                "promotion_id": existing["promotion_id"],
                "existing": True
            }), 200




# ============================================
# PRIORITY LIMIT
# Platinum max 3 per city
# Gold max 5 per city
# ============================================

        if priority >= 10:

            cur.execute("""
                SELECT COUNT(*) AS total
                FROM paid_promotions
                WHERE city=%s
                AND priority>=10
                AND status='ACTIVE'
                AND NOW() BETWEEN start_date AND end_date
            """, (city,))

            platinum_count = int(cur.fetchone()["total"])

            if platinum_count >= 3:

                conn.rollback()

                return jsonify({
                    "error": "PLATINUM_LIMIT",
                    "message": "Max Platinum promotions reached"
                }), 409


        elif priority >= 5:

            cur.execute("""
                SELECT COUNT(*) AS total
                FROM paid_promotions
                WHERE city=%s
                AND priority>=5
                AND priority<10
                AND status='ACTIVE'
                AND NOW() BETWEEN start_date AND end_date
            """, (city,))

            gold_count = int(cur.fetchone()["total"])

            if gold_count >= 5:

                conn.rollback()

                return jsonify({
                    "error": "GOLD_LIMIT",
                    "message": "Max Gold promotions reached"
                }), 409




        cur.execute("""
            INSERT INTO paid_promotions (
                promotion_type,
                supplier_id,
                city,
                priority,
                start_date,
                end_date,
                status,
                created_by_admin
            )
            VALUES (%s,%s,%s,%s,%s,%s,'ACTIVE',%s)
            RETURNING promotion_id
        """, (
            promotion_type,
            supplier_id,
            city,
            priority,
            start_date,
            end_date,
            g.admin["admin_id"]
        ))

        promotion_row = cur.fetchone()
        promotion_id = promotion_row["promotion_id"]

        # ==================================================
        # INSERT PROMOTION PRODUCTS (STRICT VALIDATION)
        # ==================================================

        product_ids = data.get("product_ids", [])

        if not product_ids:
            conn.rollback()
            return jsonify({"error": "PRODUCTS_REQUIRED"}), 400

        for pid in product_ids:
            cur.execute("""
                INSERT INTO promotion_products (promotion_id, product_id)
                VALUES (%s,%s)
                ON CONFLICT DO NOTHING
            """, (promotion_id, pid))

        if request_id:

            cur.execute("""
                UPDATE promotion_requests
                SET status='CONVERTED'
                WHERE request_id=%s
            """, (request_id,))

        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="PROMOTION_CREATED",
            entity_type="promotion",
            entity_id=promotion_id,
            new_value=data
        )

        return jsonify({
            "message": "Promotion created",
            "promotion_id": promotion_id
        })

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# EDIT PROMOTION
# =====================================================

@admin_promotions_bp.route("/<int:promotion_id>", methods=["PUT"])
@require_admin(permission="MANAGE_PROMOTIONS")
def edit_promotion(promotion_id):

    data = request.json

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

# LOCK promotion row first
        cur.execute("""
            SELECT status
            FROM paid_promotions
            WHERE promotion_id=%s
            FOR UPDATE
        """, (promotion_id,))

        existing = cur.fetchone()

        if not existing:
            conn.rollback()
            return jsonify({"error":"NOT_FOUND"}),404



        # NOW update safely
        cur.execute("""
            UPDATE paid_promotions
            SET
                city=%s,
                priority=%s,
                start_date=%s,
                end_date=%s,
                updated_at=NOW()
            WHERE promotion_id=%s
        """, (
            data.get("city"),
            data.get("priority"),
            data.get("start_date"),
            data.get("end_date"),
            promotion_id
        ))

        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="PROMOTION_UPDATED",
            entity_type="promotion",
            entity_id=promotion_id,
            new_value=data
        )

        return jsonify({"message": "Promotion updated"})

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# UPDATE STATUS (PAUSE / RESUME / STOP)
# =====================================================
@admin_promotions_bp.route("/<int:promotion_id>/status", methods=["PUT"])
@require_admin(permission="MANAGE_PROMOTIONS")
def update_status(promotion_id):
    

    data = request.json or {}
    status = data.get("status")

    if not status:
        return jsonify({"error": "status required"}), 400

    allowed_transitions = [
        "ACTIVE",
        "PAUSED",
        "EXPIRED",
        "REPLACED",
        "DELETED"
    ]

    if status not in allowed_transitions:
        return jsonify({"error": "INVALID_STATUS"}), 400

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor()

# LOCK promotion first
        cur.execute("""
        SELECT promotion_id
        FROM paid_promotions
        WHERE promotion_id=%s
        FOR UPDATE
        """, (promotion_id,))

        if not cur.fetchone():
            conn.rollback()
            return jsonify({"error":"NOT_FOUND"}),404


        # UPDATE safely
        cur.execute("""
        UPDATE paid_promotions
        SET status=%s,
            updated_at=NOW()
        WHERE promotion_id=%s
        """, (status, promotion_id))


        # CRITICAL: release grid slot if promotion not ACTIVE
        if status in ("EXPIRED", "REPLACED", "DELETED"):
            cur.execute("""
                UPDATE promotion_banners
                SET is_active = false
                WHERE promotion_id = %s
            """, (promotion_id,))


        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="PROMOTION_STATUS_CHANGED",
            entity_type="promotion",
            entity_id=promotion_id,
            new_value={"status": status}
        )

        return jsonify({"message": "Status updated"})

    finally:
        if cur: cur.close()
        if conn: conn.close()



# =====================================================
# ADD BANNER
# =====================================================

@admin_promotions_bp.route("/<int:promotion_id>/banner", methods=["POST"])
@require_admin(permission="MANAGE_PROMOTIONS")
def add_banner(promotion_id):

    data = request.json or {}

    grid_position = data.get("grid_position")
    replace_existing = data.get("replace_existing", False)

    # ============================================
    # VALIDATION (NEW)
    # ============================================

    if not grid_position:
        return jsonify({"error": "GRID_POSITION_REQUIRED"}), 400

    if grid_position not in VALID_GRID_POSITIONS:
        return jsonify({"error": "INVALID_GRID_POSITION"}), 400

    conn = cur = None

    try:
        conn = get_db_connection()
        conn.autocommit = False
        conn.set_session(isolation_level="SERIALIZABLE")
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ============================================
        # 1️⃣ LOCK PROMOTION + GET CITY
        # ============================================

        cur.execute("""
            SELECT promotion_id, status, start_date, end_date, city
            FROM paid_promotions
            WHERE promotion_id=%s
            FOR UPDATE
        """, (promotion_id,))

        promotion = cur.fetchone()

        if not promotion:
            conn.rollback()
            return jsonify({"error": "PROMOTION_NOT_FOUND"}), 404

        if promotion["status"] != "ACTIVE":
            conn.rollback()
            return jsonify({"error": "PROMOTION_NOT_ACTIVE"}), 409

        if datetime.utcnow() > promotion["end_date"]:
            conn.rollback()
            return jsonify({"error": "PROMOTION_ALREADY_EXPIRED"}), 409

        city = promotion["city"]

        # ============================================
        # 2️⃣ LOCK GRID SLOT FOR THAT CITY ONLY
        # ============================================

        cur.execute("""
            SELECT banner_id, promotion_id
            FROM promotion_banners
            WHERE city=%s
            AND grid_position=%s
            AND is_active=true
            FOR UPDATE
        """, (city, grid_position))

        existing = cur.fetchone()

        if existing:

            if existing["promotion_id"] == promotion_id:
                conn.commit()
                return jsonify({"message": "Grid already assigned"}), 200

            if not replace_existing:
                conn.rollback()
                return jsonify({
                    "error": "GRID_OCCUPIED",
                    "message": f"Grid already occupied in {city}"
                }), 409

            # replace logic
            cur.execute("""
                UPDATE paid_promotions
                SET status='REPLACED', updated_at=NOW()
                WHERE promotion_id=%s
            """, (existing["promotion_id"],))

            cur.execute("""
                UPDATE promotion_banners
                SET is_active=false
                WHERE promotion_id=%s
            """, (existing["promotion_id"],))

        # ============================================
        # 3️⃣ INSERT BANNER
        # ============================================

        cur.execute("""
            INSERT INTO promotion_banners (
                promotion_id,
                city,
                original_image_url,
                processed_image_url,
                banner_title,
                banner_subtitle,
                grid_position,
                priority,
                is_active
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,true)
            ON CONFLICT (city, grid_position)
            WHERE is_active = true
            DO NOTHING
            RETURNING banner_id
        """, (
            promotion_id,
            city,
            data.get("original_image_url"),
            data.get("processed_image_url"),
            data.get("banner_title"),
            data.get("banner_subtitle"),
            grid_position,
            data.get("priority", 1)
        ))

        result = cur.fetchone()

        if not result:
            conn.rollback()
            return jsonify({
                "error": "GRID_OCCUPIED",
                "message": f"Grid already occupied in {city}"
            }), 409

        conn.commit()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="PROMOTION_BANNER_ADDED",
            entity_type="promotion_banner",
            entity_id=result["banner_id"]
        )

        return jsonify({"banner_id": result["banner_id"]})

    finally:
        if cur: cur.close()
        if conn: conn.close()

# =====================================================
# LIST ALL PROMOTIONS (FOR DASHBOARD TABLE)
# =====================================================

@admin_promotions_bp.route("/list", methods=["GET"])
@require_admin(permission="VIEW_PROMOTIONS")
def list_promotions():

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

# ============================================
# AUTO EXPIRE PROMOTIONS
# ============================================

        # disable banner first
        cur.execute("""
            UPDATE promotion_banners pb
            SET is_active = false
            WHERE pb.is_active = true
            AND pb.promotion_id IN (
                SELECT promotion_id
                FROM paid_promotions
                WHERE end_date < NOW()
                AND status = 'ACTIVE'
            )
        """)

        # then expire promotion
        cur.execute("""
            UPDATE paid_promotions
            SET status = 'EXPIRED',
                updated_at = NOW()
            WHERE status = 'ACTIVE'
            AND end_date < NOW()
        """)


        conn.commit()


        # ============================================
        # FETCH PROMOTIONS
        # ============================================

        cur.execute("""
            SELECT
                p.*,
                pm.product_name_english,
                sr.company_name_english
            FROM paid_promotions p

            LEFT JOIN product_management pm
                ON pm.product_id = p.product_id
            LEFT JOIN supplier_registration sr
                ON sr.supplier_id = p.supplier_id
            ORDER BY p.created_at DESC
        """)

        rows = cur.fetchall()

        return jsonify(rows)

    finally:
        if cur: cur.close()
        if conn: conn.close()
# =====================================================
# GET SUPPLIERS FOR DROPDOWN
# =====================================================
# =====================================================
# GET SUPPLIERS
# =====================================================

@admin_promotions_bp.route("/suppliers", methods=["GET"])
@require_admin(permission="VIEW_PROMOTIONS")
def get_suppliers():

    conn = cur = None

    try:

        conn = get_db_connection()

        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                supplier_id,
                company_name_english
            FROM supplier_registration
            WHERE approval_status='Approved'
            ORDER BY company_name_english
        """)

        rows = cur.fetchall()

        return jsonify(rows)

    finally:

        if cur: cur.close()

        if conn: conn.close()


# =====================================================
# GET PRODUCTS BY SUPPLIER
# =====================================================

@admin_promotions_bp.route("/supplier/<int:supplier_id>/products", methods=["GET"])
@require_admin(permission="VIEW_PROMOTIONS")
def get_products_by_supplier(supplier_id):

    conn = cur = None

    try:

        conn = get_db_connection()

        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                product_id,
                product_name_english,
                category_id,
                sub_category_id
            FROM product_management
            WHERE supplier_id=%s
            AND flag='A'
            ORDER BY product_name_english
        """, (supplier_id,))

        rows = cur.fetchall()

        return jsonify(rows)

    finally:

        if cur: cur.close()

        if conn: conn.close()


# =====================================================
# GET CATEGORIES (FIXED)
# =====================================================

@admin_promotions_bp.route("/categories", methods=["GET"])
@require_admin(permission="VIEW_PROMOTIONS")
def get_categories():

    conn = cur = None

    try:

        conn = get_db_connection()

        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                id,
                name
            FROM category
            WHERE flag='A'
            ORDER BY name
        """)

        rows = cur.fetchall()

        return jsonify(rows)

    finally:

        if cur: cur.close()

        if conn: conn.close()


# =====================================================
# GET SUBCATEGORIES (FIXED)
# =====================================================

@admin_promotions_bp.route("/subcategories/<int:category_id>", methods=["GET"])
@require_admin(permission="VIEW_PROMOTIONS")
def get_subcategories(category_id):

    conn = cur = None

    try:

        conn = get_db_connection()

        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                id,
                name
            FROM sub_category
            WHERE category_id=%s
            AND flag='A'
            ORDER BY name
        """, (category_id,))

        rows = cur.fetchall()

        return jsonify(rows)

    finally:

        if cur: cur.close()

        if conn: conn.close()
# =====================================================
# GET GRID BANNERS (PUBLIC API - NO ADMIN REQUIRED)
# =====================================================
@admin_promotions_bp.route("/grid/<string:city>/<string:grid_position>", methods=["GET"])
def get_grid_banners(city, grid_position):

    # ✅ NEW VALIDATION
    if grid_position not in VALID_GRID_POSITIONS:
        return jsonify({"error": "INVALID_GRID_POSITION"}), 400

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                pb.banner_id,
                pb.processed_image_url,
                pb.banner_title,
                pb.banner_subtitle,
                pb.priority,
                p.promotion_id,
                p.supplier_id,
                sr.company_name_english
            FROM promotion_banners pb
            JOIN paid_promotions p
                ON p.promotion_id = pb.promotion_id
            JOIN supplier_registration sr
                ON sr.supplier_id = p.supplier_id
            WHERE 
                (%s = 'default' OR pb.city = %s)
                AND pb.grid_position = %s
                AND pb.is_active = true
                AND p.status = 'ACTIVE'
                AND NOW() BETWEEN p.start_date AND p.end_date
            ORDER BY pb.priority DESC
            LIMIT 1
        """, (city, city, grid_position))

        return jsonify(cur.fetchall())

    finally:
        if cur: cur.close()
        if conn: conn.close()

@admin_promotions_bp.route("/grid-status", methods=["GET"])
@require_admin(permission="VIEW_PROMOTIONS")
def grid_status():

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # AUTO EXPIRE
        cur.execute("""
            UPDATE promotion_banners
            SET is_active = false
            WHERE is_active = true
            AND promotion_id IN (
                SELECT promotion_id
                FROM paid_promotions
                WHERE status='ACTIVE'
                AND end_date < NOW()
            )
        """)

        cur.execute("""
            UPDATE paid_promotions
            SET status='EXPIRED',
                updated_at=NOW()
            WHERE status='ACTIVE'
            AND end_date < NOW()
        """)

        conn.commit()

        # ✅ FILTER ONLY VALID POSITIONS
        cur.execute("""
            SELECT 
                pb.grid_position,
                sr.company_name_english,
                p.end_date,
                p.promotion_id
            FROM promotion_banners pb
            JOIN paid_promotions p ON p.promotion_id = pb.promotion_id
            JOIN supplier_registration sr ON sr.supplier_id = p.supplier_id
            WHERE pb.is_active = true
            AND pb.grid_position = ANY(%s)
            AND p.status='ACTIVE'
            AND NOW() BETWEEN p.start_date AND p.end_date
            FOR SHARE
        """, (VALID_GRID_POSITIONS,))

        return jsonify(cur.fetchall())

    finally:
        if cur: cur.close()
        if conn: conn.close()

@admin_promotions_bp.route("/grid-history/<grid_position>", methods=["GET"])
@require_admin(permission="VIEW_PROMOTIONS")
def grid_history(grid_position):

    # ✅ NEW VALIDATION
    if grid_position not in VALID_GRID_POSITIONS:
        return jsonify({"error": "INVALID_GRID_POSITION"}), 400

    conn = cur = None

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                sr.company_name_english,
                p.start_date,
                p.end_date,
                p.status
            FROM promotion_banners pb
            JOIN paid_promotions p ON p.promotion_id = pb.promotion_id
            JOIN supplier_registration sr ON sr.supplier_id = p.supplier_id
            WHERE pb.grid_position=%s
            ORDER BY p.start_date DESC
        """,(grid_position,))

        return jsonify(cur.fetchall())

    finally:
        if cur: cur.close()
        if conn: conn.close()
# =====================================================
# GET PRODUCTS BY PROMOTION (PUBLIC - CITY VALIDATED)
# =====================================================

@admin_promotions_bp.route("/promotion-products/<int:promotion_id>", methods=["GET"])
def get_products_by_promotion(promotion_id):

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ✅ VALIDATE PROMOTION EXISTS + ACTIVE
        cur.execute("""
    SELECT promotion_id
    FROM paid_promotions
    WHERE promotion_id=%s
""", (promotion_id,))

        if not cur.fetchone():
            return jsonify([])

        # ✅ FETCH PRODUCTS
        cur.execute("""
            SELECT
                pm.product_id,
                pm.product_name_english,
                pm.supplier_id,
                pm.company_name_english,
                pm.unit_of_measure,
                pm.price_per_unit,
                pm.currency,
                pm.stock_availability,
                pm.description,
                pm.product_images,
                c.name AS category_name,
                sc.name AS subcategory_name
            FROM promotion_products pp
            JOIN product_management pm
                ON pm.product_id = pp.product_id
            LEFT JOIN category c
                ON pm.category_id = c.id
            LEFT JOIN sub_category sc
                ON pm.sub_category_id = sc.id
            WHERE pp.promotion_id=%s
            AND pm.flag='A'
            ORDER BY pm.product_id DESC
        """, (promotion_id,))

        rows = cur.fetchall()

        host_url = request.host_url.rstrip("/")
        products = []

        for row in rows:

            price_val = float(row.get("price_per_unit") or 0)

            img_array = row.get("product_images") or []
            if not isinstance(img_array, (list, tuple)):
                img_array = []

            images = [
                f"{host_url}/api/image/{row['product_id']}/{i}"
                for i, img in enumerate(img_array)
                if img
            ]

            products.append({
                "id": row["product_id"],
                "name": row["product_name_english"],
                "supplier_id": row["supplier_id"],
                "supplier_name": row["company_name_english"],
                "images": images,
                "img1": images[0] if images else None,
                "image": images[0] if images else None,   # 🔥 ADD THIS
                "price_numeric": price_val,
                "price": price_val,
                "stock": row.get("stock_availability") or 0,
                "category": row.get("category_name"),
                "subcategory": row.get("subcategory_name"),
                "description": row.get("description"),
            })

        return jsonify(products)

    finally:
        if cur: cur.close()
        if conn: conn.close()