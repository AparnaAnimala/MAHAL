from flask import Blueprint, request, jsonify
from datetime import date
from db import get_db_connection
from psycopg2.extras import RealDictCursor
import json
from helpers import build_file_json_from_base64
import base64
from functools import wraps
from flask import request, jsonify, g
from routes.auth_routes import JWT_SECRET
import jwt

def jwt_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):

        if request.method == "OPTIONS":
            return "", 200

        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token missing"}), 401

        try:
            token = auth_header.replace("Bearer ", "").strip()

            decoded = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=["HS256"]
            )
            
            g.user_id = decoded["user_id"]
            g.role = decoded["role"]
            g.linked_id = decoded["linked_id"]

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return wrapper

admin_promotions = Blueprint("admin_promotions", __name__)

def process_festival_images(images):
    result = []
    for img in images:
        file_json = build_file_json_from_base64(img, "festival_banner")
        result.append(file_json)
    return result

@admin_promotions.route("/master/<category>", methods=["GET"])
def get_master_values(category):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT DISTINCT value
        FROM general_master
        WHERE LOWER(category) = LOWER(%s)
        ORDER BY value ASC
    """, (category,))

    rows = cur.fetchall()
    values = [row["value"] for row in rows]

    conn.close()

    return jsonify({
        "status": True,
        "data": values
    })

@admin_promotions.route("/master/location", methods=["GET"])
def get_locations():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT category, value
        FROM general_master
        WHERE LOWER(category) IN ('city','country')
    """)

    rows = cur.fetchall()

    cities = []
    countries = []

    for row in rows:
        if row["category"].lower() == "city":
            cities.append(row["value"])
        if row["category"].lower() == "country":
            countries.append(row["value"])

    conn.close()

    return jsonify({
        "cities": list(set(cities)),
        "countries": list(set(countries))
    })

@admin_promotions.route("/admin/suppliers", methods=["GET"])
def get_suppliers():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT supplier_id, company_name_english
        FROM supplier_registration
        WHERE approval_status = 'Approved'
        ORDER BY company_name_english ASC
    """)

    suppliers = cur.fetchall()
    conn.close()

    return jsonify({
        "status": True,
        "data": suppliers
    })

@admin_promotions.route("/admin/supplier/<int:supplier_id>/products", methods=["GET"])
def get_supplier_products(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # cur.execute("""
    #     SELECT product_id, product_name_english
    #     FROM product_management
    #     WHERE supplier_id = %s
    #     AND LOWER(product_status) = 'approved'
    #     ORDER BY product_name_english ASC
    # """, (supplier_id,))

    cur.execute("""
        SELECT product_id, product_name_english
        FROM product_management
        WHERE supplier_id = %s
        ORDER BY product_name_english ASC
    """, (supplier_id,))

    products = cur.fetchall()
    conn.close()

    return jsonify({
        "status": True,
        "data": products
    })

@admin_promotions.route("/admin/products/search")
def search_products():
    keyword = request.args.get("q")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # cur.execute("""
    #     SELECT product_id, product_name_english, supplier_id
    #     FROM product_management
    #     WHERE LOWER(product_name_english) LIKE LOWER(%s)
    #     AND LOWER(product_status) = 'approved'
    #     AND LOWER(product_status) IN ('approved', 'pending approval')
    #     ORDER BY product_name_english ASC
    # """, (f"%{keyword}%",))

    cur.execute("""
        SELECT 
            pm.product_id,
            pm.product_name_english,
            pm.supplier_id,
            sr.company_name_english
        FROM product_management pm
        JOIN supplier_registration sr
            ON sr.supplier_id = pm.supplier_id
        WHERE LOWER(pm.product_name_english) LIKE LOWER(%s)
        ORDER BY pm.product_name_english ASC
    """, (f"%{keyword}%",))

    results = cur.fetchall()
    conn.close()

    return jsonify({
        "status": True,
        "data": results
    })

@admin_promotions.route("/admin/categories/search")
def search_categories():

    keyword = request.args.get("q")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT 
            c.id AS category_id,
            c.name AS category_name,
            COUNT(DISTINCT pm.supplier_id) AS supplier_count,
            json_agg(DISTINCT sr.company_name_english) AS suppliers,
            json_agg(DISTINCT sr.supplier_id) AS supplier_ids
        FROM category c
        JOIN product_management pm 
            ON pm.category_id = c.id
        JOIN supplier_registration sr
            ON sr.supplier_id = pm.supplier_id
        WHERE LOWER(c.name) LIKE LOWER(%s)
        GROUP BY c.id, c.name
        ORDER BY c.name ASC
    """, (f"%{keyword}%",))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "status": True,
        "data": rows
    })

@admin_promotions.route("/admin/subcategories/<int:category_id>")
def get_subcategories(category_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT id, name
        FROM sub_category
        WHERE category_id = %s
        ORDER BY name ASC
    """, (category_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({
        "status": True,
        "data": rows
    })

@admin_promotions.route("/admin/subcategory/<int:sub_id>/products")
def get_products_by_subcategory(sub_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT 
            pm.product_id,
            pm.product_name_english,
            pm.supplier_id,
            pm.category_id,
            pm.sub_category_id,
            sr.company_name_english,
            c.name AS category_name,
            sc.name AS subcategory_name
        FROM product_management pm
        JOIN supplier_registration sr
            ON sr.supplier_id = pm.supplier_id
        JOIN category c
            ON c.id = pm.category_id
        JOIN sub_category sc
            ON sc.id = pm.sub_category_id
        WHERE pm.sub_category_id = %s
        ORDER BY pm.product_name_english ASC
    """, (sub_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify({
        "status": True,
        "data": rows
    })

@admin_promotions.route("/admin/promotions/mahal", methods=["POST"])
def create_mahal_promotion():
    data = request.json
    conn = get_db_connection()

    try:
        cur = conn.cursor()

        banner = None
        if data.get("banner_image"):
            banner = build_file_json_from_base64(
                data.get("banner_image"),
                "promotion_banner"
            )

        # 🔥 Process festival images properly
        meta = data.get("meta", {})

        if data["target_type"] == "FESTIVAL":
            homepage = process_festival_images(
                meta.get("homepage_banners", [])
            )
            category = process_festival_images(
                meta.get("category_banners", [])
            )

            meta["homepage_banners"] = homepage
            meta["category_banners"] = category

        # base64_string = row["banner_image"]["content"]
        # mimetype = row["banner_image"]["mimetype"]

        # image_url = f"data:{mimetype};base64,{base64_string}"

        cur.execute("""
            INSERT INTO promotions (
                owner_type,
                supplier_id,
                target_type,
                target_id,
                priority_level,
                bid_amount,
                banner_image,
                meta,
                status,
                location_scope,
                location_values,
                start_date,
                end_date,
                target_ids,
                supplier_ids,
                title,
                description,
                headline,
                offer_type,
                offer_value
            )
            VALUES (
                %s,      -- owner_type
                NULL,    -- supplier_id
                %s,      -- target_type
                NULL,    -- target_id
                %s,      -- priority_level
                0,       -- bid_amount
                %s,      -- banner_image
                %s,      -- meta
                'INVITED',
                %s,      -- location_scope
                %s,      -- location_values
                %s,      -- start_date
                %s,      -- end_date
                %s,      -- target_ids
                %s,      -- supplier_ids
                %s,      -- title
                %s,      -- description
                %s,      -- headline
                %s,      -- offer_type
                %s       -- offer_value
            )
            RETURNING id
        """, (
            "MAHAL",
            data["target_type"],
            data["priority_level"],
            banner,
            json.dumps(meta),
            data.get("location_scope"),
            json.dumps(data.get("location_values")) if data.get("location_values") else None,
            data["start_date"],
            data["end_date"],
            json.dumps(data.get("target_ids")) if data.get("target_ids") else None,
            json.dumps(data.get("supplier_ids")) if data.get("supplier_ids") else None,
            data.get("title"),
            data.get("description"),
            data.get("headline"),
            data.get("offer_type"),
            data.get("offer_value")
        ))
        # VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,0,%s,%s,%s,%s,%s,%s,'ACTIVE')

        # promo_id = cur.fetchone()[0]

        result = cur.fetchone()

        if not result:
            raise Exception("Insert failed - no ID returned")

        promo_id = result["id"]

        for supplier_id in data.get("supplier_ids", []):

            cur.execute("""
                INSERT INTO promotion_suppliers (
                    promotion_id,
                    supplier_id,
                    status
                )
                VALUES (%s, %s, 'INVITED')
            """, (promo_id, supplier_id))

            cur.execute("""
                INSERT INTO notifications (
                    user_type,
                    user_id,
                    title,
                    message,
                    type,
                    reference_id,
                    is_read
                )
                VALUES (
                    'SUPPLIER',
                    %s,
                    'Promotion Invitation',
                    -- 'Admin invited you for promotion',
                    %s,
                    'PROMOTION_INVITE',
                    -- NULL,
                    %s,
                    FALSE
                )
            """, (
                supplier_id,
                # f"Admin invited you for {data['target_type']} promotion",
                f"""
            You are invited to participate in a {data['target_type']} campaign.

            Title: {data['title']}
            Offer: {data['offer_type']} - {data['offer_value']}
            Start Date: {data['start_date']}
            End Date: {data['end_date']}

            Please review and respond.
            """,
                promo_id
            ))

        conn.commit()
        return jsonify({"status": True})

    except Exception as e:
        conn.rollback()
        print("❌ PROMOTION ERROR:", e)
        print("📦 PAYLOAD:", data)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

@admin_promotions.route("/supplier/promotions/<int:promo_id>/accept", methods=["POST"])
@jwt_required
def accept_invitation(promo_id):

    supplier_id = g.linked_id
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Check current status
    cur.execute("""
        SELECT status
        FROM promotion_suppliers
        WHERE promotion_id = %s
        AND supplier_id = %s
    """, (promo_id, supplier_id))
    #  AND supplier_ids::jsonb @> %s::jsonb

    row = cur.fetchone()

    if not row:
        return jsonify({"error": "Invitation not found"}), 404

    if row["status"] == "ACCEPTED":
        return jsonify({
            "message": "Already accepted",
            "status": "ACCEPTED"
        }), 200

    if row["status"] == "REJECTED":
        return jsonify({
            "message": "Already rejected. Cannot accept.",
            "status": "REJECTED"
        }), 200

    # Update to accepted
    cur.execute("""
        UPDATE promotion_suppliers
        SET status = 'ACCEPTED'
        WHERE promotion_id = %s
        AND supplier_id = %s
    """, (promo_id, supplier_id))

    # Optional: make promotion ACTIVE
    cur.execute("""
        UPDATE promotions
        SET status = 'ACTIVE'
        WHERE id = %s
    """, (promo_id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Promotion Accepted"})

@admin_promotions.route("/supplier/promotions/<int:promo_id>/reject", methods=["POST"])
@jwt_required
def reject_invitation(promo_id):

    supplier_id = g.linked_id
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT status
        FROM promotion_suppliers
        WHERE promotion_id = %s
        AND supplier_id = %s
    """, (promo_id, supplier_id))

    row = cur.fetchone()

    if not row:
        return jsonify({"error": "Invitation not found"}), 404

    if row["status"] == "ACCEPTED":
        return jsonify({
            "message": "Already accepted",
            "status": "ACCEPTED"
        }), 200

    if row["status"] == "REJECTED":
        return jsonify({
            "message": "Already rejected. Cannot accept.",
            "status": "REJECTED"
        }), 200

    cur.execute("""
        UPDATE promotion_suppliers
        SET status = 'REJECTED'
        WHERE promotion_id = %s
        AND supplier_id = %s
    """, (promo_id, supplier_id))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Promotion Rejected"})

@admin_promotions.route("/promotions/<int:promo_id>", methods=["GET"])
@jwt_required
def get_single_promotion_supplier(promo_id):

    supplier_id = g.linked_id

    if isinstance(supplier_id, list):
        supplier_id = supplier_id[0]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # cur.execute("""
    #     SELECT *
    #     FROM promotions
    #     WHERE id = %s
    #     AND supplier_ids::jsonb @> %s::jsonb
    # """, (promo_id, json.dumps([supplier_id])))

    cur.execute("""
        SELECT p.*, ps.status AS supplier_status
        FROM promotions p
        JOIN promotion_suppliers ps
            ON ps.promotion_id = p.id
        WHERE p.id = %s
        AND ps.supplier_id = %s
    """, (promo_id, supplier_id))

    row = cur.fetchone()

    if not row:
        return jsonify({"error": "Promotion not found"}), 404

    # Convert JSON safely
    if isinstance(row.get("supplier_ids"), str):
        row["supplier_ids"] = json.loads(row["supplier_ids"])

    if isinstance(row.get("target_ids"), str):
        row["target_ids"] = json.loads(row["target_ids"])

    if isinstance(row.get("location_values"), str):
        row["location_values"] = json.loads(row["location_values"])

    # Banner convert
    if row.get("banner_image"):
        content = row["banner_image"]["content"]
        mimetype = row["banner_image"]["mimetype"]
        row["image_url"] = f"data:{mimetype};base64,{content}"
    else:
        row["image_url"] = None

    cur.close()
    conn.close()

    return jsonify(row)

@admin_promotions.route("/promotions", methods=["GET"])
def get_active_promotions():

    city = request.args.get("city")
    country = request.args.get("country")
    today = date.today()

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    # WHERE status = 'ACTIVE'

    if city:
        cur.execute("""
            SELECT *
            FROM promotions
            WHERE status IN ('ACTIVE','APPROVED')
            AND start_date <= %s
            AND end_date >= %s
            AND (
                -- NEW SYSTEM
                EXISTS (
                    SELECT 1
                    FROM promotion_suppliers ps
                    WHERE ps.promotion_id = promotions.id
                    AND ps.status = 'ACCEPTED'
                )

                -- OLD SYSTEM
                OR (
                    NOT EXISTS (
                        SELECT 1
                        FROM promotion_suppliers ps2
                        WHERE ps2.promotion_id = promotions.id
                    )
                    AND promotions.status IN ('ACTIVE','APPROVED')
                )
            )
            AND (
                location_scope = 'ALL'
                OR (
                    location_scope = 'CITY'
                    AND location_values @> %s::jsonb
                )
            )
            ORDER BY created_at DESC
        """, (today, today, json.dumps([city])))
    elif country:
        cur.execute("""
            SELECT *
            FROM promotions
            WHERE status IN ('ACTIVE','APPROVED')
            AND start_date <= %s
            AND end_date >= %s
            AND (
                -- NEW SYSTEM
                EXISTS (
                    SELECT 1
                    FROM promotion_suppliers ps
                    WHERE ps.promotion_id = promotions.id
                    AND ps.status = 'ACCEPTED'
                )

                -- OLD SYSTEM
                OR (
                    NOT EXISTS (
                        SELECT 1
                        FROM promotion_suppliers ps2
                        WHERE ps2.promotion_id = promotions.id
                    )
                    AND promotions.status IN ('ACTIVE','APPROVED')
                )
            )
            AND (
                location_scope = 'ALL'
                OR (
                    location_scope = 'COUNTRY'
                    AND location_values @> %s::jsonb
                )
            )
            ORDER BY created_at DESC
        """, (today, today, json.dumps([country])))
    else:
        cur.execute("""
            SELECT *
            FROM promotions
            WHERE status IN ('ACTIVE','APPROVED')
            AND start_date <= %s
            AND end_date >= %s
            AND (
                -- NEW SYSTEM
                EXISTS (
                    SELECT 1
                    FROM promotion_suppliers ps
                    WHERE ps.promotion_id = promotions.id
                    AND ps.status = 'ACCEPTED'
                )

                -- OLD SYSTEM
                OR (
                    NOT EXISTS (
                        SELECT 1
                        FROM promotion_suppliers ps2
                        WHERE ps2.promotion_id = promotions.id
                    )
                    AND promotions.status IN ('ACTIVE','APPROVED')
                )
            )
            ORDER BY created_at DESC
        """, (today, today))

    rows = cur.fetchall()

    result = []

    for row in rows:
        print("DEBUG BANNER TYPE:", type(row.get("banner_image")))

        row["title"] = row.get("title") or ""
        row["headline"] = row.get("headline") or ""
        row["description"] = row.get("description") or ""

        if row["banner_image"]:
            content = row["banner_image"]["content"]
            mimetype = row["banner_image"]["mimetype"]
            row["image_url"] = f"data:{mimetype};base64,{content}"
        else:
            row["image_url"] = None

        # if row.get("banner_image"):

        #     banner = row["banner_image"]

        #     if isinstance(banner, str):
        #         banner = json.loads(banner)

        #     content = banner.get("content")
        #     mimetype = banner.get("mimetype", "image/jpeg")

        #     row["image_url"] = f"data:{mimetype};base64,{content}"

        # else:
        #     row["image_url"] = None

        row["meta"] = row.get("meta") or {}

        if row["target_type"] == "FESTIVAL":
            meta = row.get("meta") or {}

            row["homepage_banners"] = meta.get("homepage_banners", [])
            row["category_banners"] = meta.get("category_banners", [])
        else:
            row["homepage_banners"] = []
            row["category_banners"] = []

        # if row["target_type"] == "FESTIVAL":

        #     meta = row.get("meta") or {}

        #     if isinstance(meta, str):
        #         meta = json.loads(meta)

        #     homepage = []
        #     for img in meta.get("homepage_banners", []):
        #         content = img.get("content")
        #         mimetype = img.get("mimetype", "image/jpeg")
        #         homepage.append(f"data:{mimetype};base64,{content}")

        #     category = []
        #     for img in meta.get("category_banners", []):
        #         content = img.get("content")
        #         mimetype = img.get("mimetype", "image/jpeg")
        #         category.append(f"data:{mimetype};base64,{content}")

        #     row["homepage_banners"] = homepage
        #     row["category_banners"] = category

        result.append(row)

    cur.close()
    conn.close()

    return jsonify(result)

@admin_promotions.route("/promotions/<int:promo_id>/products")
def get_promo_products(promo_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # 🔥 Get promotion
    cur.execute("""
        SELECT target_type, target_ids, supplier_ids, 
               offer_type, offer_value
        FROM promotions
        WHERE id = %s
    """, (promo_id,))

    promo = cur.fetchone()

    if not promo:
        return jsonify([])

    # Check if supplier logged in
    auth_header = request.headers.get("Authorization")

    supplier_view = False
    supplier_id = None

    if auth_header:
        try:
            token = auth_header.replace("Bearer ", "").strip()
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            supplier_id = decoded.get("linked_id")
            supplier_view = True
        except:
            supplier_view = False

    if supplier_view:
        # Show only that supplier's products (even if INVITED)
        cur.execute("""
            SELECT supplier_id
            FROM promotion_suppliers
            WHERE promotion_id = %s
            AND supplier_id = %s
        """, (promo_id, supplier_id))

        accepted_suppliers = [supplier_id]

    else:
        # Public view → show only ACCEPTED suppliers
        cur.execute("""
            SELECT supplier_id
            FROM promotion_suppliers
            WHERE promotion_id = %s
            AND status = 'ACCEPTED'
        """, (promo_id,))

        accepted_suppliers = [r["supplier_id"] for r in cur.fetchall()]

    if not accepted_suppliers:
        return jsonify([])
    
    # cur.execute("""
    #     SELECT supplier_id
    #     FROM promotion_suppliers
    #     WHERE promotion_id = %s
    #     AND status = 'ACCEPTED'
    # """, (promo_id,))

    # accepted_suppliers = [r["supplier_id"] for r in cur.fetchall()]

    # if not accepted_suppliers:
    #     return jsonify([])

    target_type = promo["target_type"]
    target_ids = promo["target_ids"]
    # supplier_ids = promo["supplier_ids"]

    if isinstance(target_ids, str):
        target_ids = json.loads(target_ids)

    # if isinstance(supplier_ids, str):
    #     supplier_ids = json.loads(supplier_ids)

    discount_type = promo.get("offer_type")
    discount_value = float(promo.get("offer_value") or 0)

    # 🔥 PRODUCT OFFER
    # if target_type == "PRODUCT":
    if target_type in ("PRODUCT", "FESTIVAL"):
        cur.execute("""
            SELECT *
            FROM product_management
            WHERE product_id = ANY(%s)
            AND supplier_id = ANY(%s)
        """, (target_ids, accepted_suppliers))

    # 🔥 CATEGORY OFFER
    # elif target_type == "CATEGORY":
    #     cur.execute("""
    #         SELECT *
    #         FROM product_management
    #         WHERE category_id = ANY(%s)
    #         AND supplier_id = ANY(%s)
    #     """, (target_ids, supplier_ids))

    elif target_type == "CATEGORY":

        apply_all = False

        if promo.get("meta"):
            meta = promo.get("meta")
            if isinstance(meta, str):
                meta = json.loads(meta)
            apply_all = meta.get("apply_all_products", False)

        if apply_all:
            cur.execute("""
                SELECT *
                FROM product_management
                WHERE category_id = ANY(%s)
                AND supplier_id = ANY(%s)
            """, (target_ids, accepted_suppliers))
        else:
            cur.execute("""
                SELECT *
                FROM product_management
                WHERE category_id = ANY(%s)
                AND supplier_id = ANY(%s)
            """, (target_ids, accepted_suppliers))

    else:
        return jsonify([])

    products = cur.fetchall()

    result = []

    for p in products:

        original_price = float(p.get("price_per_unit", 0))
        discounted_price = original_price

        if discount_type == "PERCENTAGE":
            discounted_price = original_price - (
                original_price * discount_value / 100
            )

        elif discount_type == "FLAT":
            discounted_price = original_price - discount_value
        
        print("DEBUG PRODUCT IMAGES:", p.get("product_images"))

        # convert images
        images = []
        if p.get("product_images"):
            for img in p["product_images"]:
                if img:
                    base64_str = base64.b64encode(img).decode("utf-8")
                    images.append(f"data:image/jpeg;base64,{base64_str}")

        # detect language (default = en)
        lang = request.args.get("lang", "en")

        name_en = p.get("product_name_english")
        name_ar = p.get("product_name_arabic")

        result.append({
            "id": p["product_id"],

            # ✅ KEEP existing behavior
            "name": name_ar if lang == "ar" and name_ar else name_en,

            # ✅ ADD (optional - useful for frontend)
            "name_en": name_en,
            "name_ar": name_ar,

            "supplier_id": p["supplier_id"],
            "category": str(p["category_id"]),
            "original_price": original_price,
            "discounted_price": round(discounted_price, 2),
            "price_numeric": original_price,
            "images": images,
            "offer_applied": True,
            "offer_type": discount_type,
            "offer_value": discount_value
        })

    cur.close()
    conn.close()

    return jsonify(result)

@admin_promotions.route("/supplier/products", methods=["GET"])
@jwt_required
def get_supplier_products_self():

    supplier_id = g.linked_id

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT product_id, 
        product_name_english,
        product_name_arabic
        FROM product_management
        WHERE supplier_id = %s
        ORDER BY product_name_english ASC
    """, (supplier_id,))

    products = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(products)

@admin_promotions.route("/supplier/categories", methods=["GET"])
@jwt_required
def get_supplier_categories():

    supplier_id = g.linked_id

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT DISTINCT
            c.id AS category_id,
            c.name AS category_name,
            COUNT(pm.product_id) AS product_count
        FROM category c
        JOIN product_management pm
            ON pm.category_id = c.id
        WHERE pm.supplier_id = %s
        GROUP BY c.id, c.name
        ORDER BY c.name ASC
    """, (supplier_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)

@admin_promotions.route("/supplier/category/<int:category_id>/products")
@jwt_required
def get_supplier_category_products(category_id):

    supplier_id = g.linked_id

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT product_id, product_name_english, product_name_arabic, category_id
        FROM product_management
        WHERE supplier_id = %s
        AND category_id = %s
        ORDER BY product_name_english ASC
    """, (supplier_id, category_id))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)

# SUPPLIER REQUESTS (PENDING)
@admin_promotions.route("/admin/promotions/supplier/requests", methods=["GET"])
def supplier_requests():

    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT id,
                supplier_ids,
                target_type,
                target_ids,
                priority_level,
                bid_amount,
                meta,
                created_at
            FROM promotions
            WHERE owner_type = 'SUPPLIER'
            AND status = 'PENDING'
            ORDER BY created_at DESC
        """)

        rows = cur.fetchall()
        return jsonify(rows)

    except Exception as e:
        conn.rollback()
        print("❌ PROMOTION ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# APPROVE SUPPLIER PROMOTION
@admin_promotions.route("/admin/promotions/supplier/<int:promo_id>/approve", methods=["POST"])
def approve_supplier_promotion(promo_id):
    data = request.json
    conn = get_db_connection()

    try:
        cur = conn.cursor()

        cur.execute("""
            UPDATE promotions
            SET priority_level = %s,
                bid_amount = %s,
                status = 'ACTIVE'
            WHERE id = %s
              AND owner_type = 'SUPPLIER'
        """, (
            data["priority_level"],
            data["bid_amount"],
            promo_id
        ))

        if cur.rowcount == 0:
            return jsonify({"error": "Promotion not found"}), 404

        conn.commit()
        return jsonify({"message": "Supplier promotion approved"})

    except Exception as e:
        conn.rollback()
        print("❌ PROMOTION ERROR:", e)
        print("📦 PAYLOAD:", data)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

@admin_promotions.route("/admin/promotion/invite", methods=["POST"])
def invite_supplier():
    data = request.json
    supplier_ids = data.get("supplier_ids")
    target_type = data.get("target_type")  # PRODUCT / CATEGORY
    target_ids = data.get("target_ids")

    conn = get_db_connection()
    cur = conn.cursor()

    for supplier_id in supplier_ids:
        cur.execute("""
            INSERT INTO notifications (
                user_type,
                user_id,
                title,
                message,
                type,
                reference_id,
                is_read
            )
            VALUES (
                'SUPPLIER',
                %s,
                'Promotion Opportunity',
                %s,
                'PROMOTION_INVITE',
                NULL,
                FALSE
            )
        """, (
            supplier_id,
            f"Admin invited you for {target_type} promotion"
        ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Invite sent"})

@admin_promotions.route("/supplier/promotions", methods=["GET"])
@jwt_required
def get_supplier_promotions():

    supplier_id = g.linked_id

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            p.id AS promo_id,
            p.title,
            p.offer_type,
            p.offer_value,
            p.start_date,
            p.end_date,
            ps.status AS supplier_status
        FROM promotions p
        JOIN promotion_suppliers ps
            ON ps.promotion_id = p.id
        WHERE ps.supplier_id = %s
        ORDER BY p.created_at DESC
    """, (supplier_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)

@admin_promotions.route("/supplier/promotions/request", methods=["POST"])
@jwt_required
def supplier_request():

    data = request.json
    supplier_id = g.linked_id

    conn = get_db_connection()
    cur = conn.cursor()

    meta_data = {
        "product_count": len(data["target_ids"]),
        "apply_all_products": data.get("apply_all_products", False)
    }

    cur.execute("""
        INSERT INTO promotions (
            owner_type,
            supplier_ids,
            target_type,
            target_ids,
            priority_level,
            bid_amount,
            start_date,
            end_date,
            status,
            meta,
            title,
            headline,
            description,
            offer_type,
            offer_value,
            location_scope,
            location_values,
            banner_image,
            created_at
        )
        VALUES (
            'SUPPLIER',
            %s,%s,%s,%s,%s,%s,%s,
            'PENDING',
            %s,%s,%s,%s,%s,%s,%s,%s,%s,
            NOW()
        )
        RETURNING id
    """, (
        json.dumps([supplier_id]),
        data["target_type"],
        json.dumps(data["target_ids"]),
        data["priority_level"],
        data["bid_amount"],
        data["start_date"],
        data["end_date"],
        json.dumps(meta_data),
        data.get("title"),
        data.get("headline"),
        data.get("description"),
        data.get("offer_type"),
        data.get("offer_value"),
        data.get("location_scope"),
        json.dumps(data.get("location_values")) if data.get("location_values") else None,
        build_file_json_from_base64(data.get("banner_image"), "supplier_banner") if data.get("banner_image") else None
    ))

    result = cur.fetchone()
    

    if not result:
        conn.rollback()
        return jsonify({"error": "Insert failed"}), 500

    promo_id = result["id"]

    # 🔔 Notify Admin
    cur.execute("""
        INSERT INTO notifications (
            user_type,
            user_id,
            title,
            message,
            type,
            reference_id,
            is_read
        )
        VALUES (
            'ADMIN',
            1,
            'New Promotion Request',
            'Supplier requested paid promotion',
            'PROMOTION_REQUEST',
            %s,
            FALSE
        )
    """, (promo_id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Request Created"})

@admin_promotions.route("/admin/promotions/supplier/<int:id>/decision", methods=["POST"])
def decision(id):

    data = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    status = "ACTIVE" if data["action"] == "APPROVE" else "REJECTED"

    # 🔥 UPDATE + RETURN ALL REQUIRED FIELDS
    cur.execute("""
        UPDATE promotions
        SET priority_level=%s,
            bid_amount=%s,
            status=%s,
            decision_reason=%s
        WHERE id=%s
        RETURNING supplier_ids, target_type, target_ids
    """, (
        data["priority_level"],
        data["bid_amount"],
        status,
        data.get("decision_reason"),
        id
    ))

    row = cur.fetchone()

    if not row:
        return jsonify({"error": "Promotion not found"}), 404

    supplier_list = row["supplier_ids"]
    target_type = row["target_type"]
    target_ids = row["target_ids"]

    # JSON safe conversion
    if isinstance(supplier_list, str):
        supplier_list = json.loads(supplier_list)

    if isinstance(target_ids, str):
        target_ids = json.loads(target_ids)

    supplier_id = supplier_list[0] if supplier_list else None

    # 🔥 FETCH ITEM NAMES SAFELY
    items = []

    if target_type == "PRODUCT":
        cur.execute("""
            SELECT product_name_english
            FROM product_management
            WHERE product_id = ANY(%s)
        """, (target_ids,))
        items = [r["product_name_english"] for r in cur.fetchall()]

    elif target_type == "CATEGORY":
        cur.execute("""
            SELECT name
            FROM category
            WHERE id = ANY(%s)
        """, (target_ids,))
        items = [r["name"] for r in cur.fetchall()]

    elif target_type == "FESTIVAL":
        items = ["Festival Campaign"]

    # 🔥 ALWAYS CREATE MESSAGE (No crash possible)
    item_list = ", ".join(items) if items else "N/A"

    message = f"""
Promotion Type: {target_type}

Items:
{item_list}

Status: {status}

Reason:
{data.get('decision_reason') or 'No reason specified'}
"""

    # 🔥 INSERT NOTIFICATION
    if supplier_id:
        cur.execute("""
            INSERT INTO notifications (
                user_type,
                user_id,
                title,
                message,
                type,
                reference_id,
                is_read
            )
            VALUES (
                'SUPPLIER',
                %s,
                'Promotion Decision',
                %s,
                'PROMOTION_DECISION',
                %s,
                FALSE
            )
        """, (
            supplier_id,
            message,
            id
        ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Decision updated"})

@admin_promotions.route("/supplier/notifications", methods=["GET"])
@jwt_required
def get_supplier_notifications():

    supplier_id = g.linked_id

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT *
        FROM notifications
        WHERE user_type = 'SUPPLIER'
        AND user_id = %s
        ORDER BY created_at DESC
    """, (supplier_id,))

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)

@admin_promotions.route("/supplier/notifications/<int:id>/read", methods=["PUT"])
def mark_notification_read(id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = %s
    """, (id,))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Updated"})

@admin_promotions.route("/admin/notifications", methods=["GET"])
def get_admin_notifications():

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT *
        FROM notifications
        WHERE user_type = 'ADMIN'
        ORDER BY created_at DESC
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows)

@admin_promotions.route("/admin/promotions/supplier/<int:id>", methods=["GET"])
def get_supplier_promotion_details(id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Get promotion first
    cur.execute("""
        SELECT *
        FROM promotions
        WHERE id = %s
        AND owner_type = 'SUPPLIER'
    """, (id,))

    row = cur.fetchone()

    if not row:
        return jsonify({"error": "Not found"}), 404

    # 🔥 Convert supplier_ids safely
    supplier_ids = row.get("supplier_ids")

    if isinstance(supplier_ids, str):
        supplier_ids = json.loads(supplier_ids)

    supplier_id = supplier_ids[0] if supplier_ids else None

    # 🔥 Fetch company name separately (SAFE METHOD)
    if supplier_id:
        cur.execute("""
            SELECT company_name_english
            FROM supplier_registration
            WHERE supplier_id = %s
        """, (supplier_id,))

        supplier = cur.fetchone()
        row["company_name_english"] = (
            supplier["company_name_english"]
            if supplier else None
        )
    else:
        row["company_name_english"] = None

    # Convert JSON fields
    if isinstance(row.get("target_ids"), str):
        row["target_ids"] = json.loads(row["target_ids"])

    if isinstance(row.get("location_values"), str):
        row["location_values"] = json.loads(row["location_values"])

    # 🔥 Banner convert properly
    if row.get("banner_image"):
        content = row["banner_image"]["content"]
        mimetype = row["banner_image"]["mimetype"]
        row["image_url"] = f"data:{mimetype};base64,{content}"
    else:
        row["image_url"] = None

    cur.close()
    conn.close()

    return jsonify(row)

@admin_promotions.route("/admin/products/by-ids")
def get_products_by_ids():

    ids = request.args.get("ids")

    if not ids:
        return jsonify([])

    # 🔥 convert to integer list
    ids = [int(x) for x in ids.split(",")]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT product_id, product_name_english, product_name_arabic
        FROM product_management
        WHERE product_id = ANY(%s)
    """, (ids,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows)