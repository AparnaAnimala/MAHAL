from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor
from db import get_db_connection

category_bp = Blueprint("category_bp", __name__)

# ============================================================
# ✅ GET ALL CATEGORIES
# ============================================================
@category_bp.route('/category', methods=['GET'])
def get_categories_with_images():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT 
                c.id, 
                c.name,
                COUNT(pm.product_id) AS product_count,
                (
                    SELECT pm2.product_id
                    FROM product_management pm2
                    WHERE pm2.category_id = c.id
                      AND COALESCE(pm2.flag, 'A') = 'A'
                    LIMIT 1
                ) AS sample_product_id
            FROM category c
            LEFT JOIN product_management pm 
                ON pm.category_id = c.id
                AND COALESCE(pm.flag, 'A') = 'A'
            WHERE COALESCE(c.flag, 'A') = 'A'
            GROUP BY c.id, c.name
            ORDER BY c.name ASC
        """)

        rows = cur.fetchall()
        host_url = request.host_url.rstrip("/")

        categories = []

        for row in rows:
            image_url = None
            if row["sample_product_id"]:
                image_url = f"{host_url}/api/image/{row['sample_product_id']}/0"

            categories.append({
                "id": row["id"],
                "name": row["name"],
                "product_count": row["product_count"] or 0,
                "image": image_url
            })

        return jsonify(categories), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# ============================================================
# ✅ GET PRODUCTS BY CATEGORY
# ============================================================
@category_bp.route('/category/<string:catname>', methods=['GET'])
def get_products_by_category(catname):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT 
                pm.product_id,
                pm.product_name_english,
                pm.price_per_unit,
                pm.currency
            FROM product_management pm
            JOIN category c ON pm.category_id = c.id
            WHERE LOWER(c.name) = LOWER(%s)
              AND COALESCE(pm.flag, 'A') = 'A'
        """, (catname,))

        products = cur.fetchall()

        return jsonify(products), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()