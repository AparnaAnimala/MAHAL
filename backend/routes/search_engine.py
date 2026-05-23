from flask import Blueprint, request, jsonify
from db import get_db_connection
from psycopg2.extras import RealDictCursor

search_bp = Blueprint("search_bp", __name__)


# =========================================================
# AUTOCOMPLETE SEARCH
# =========================================================
@search_bp.route("/products/search", methods=["GET"])
def autocomplete_search():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        q = request.args.get("q", "").strip()

        if not q:
            return jsonify([])

        cur.execute(
            """
            SELECT
                product_id AS id,
                product_name_english AS name,
                COALESCE(similarity(product_name_english, %s), 0) AS score
            FROM search_index
            WHERE
                product_name_english ILIKE %s
                OR similarity(product_name_english, %s) > 0.2
            ORDER BY score DESC, relevance_score DESC
            LIMIT 8
            """,
            (q, f"%{q}%", q),
        )

        return jsonify(cur.fetchall())

    except Exception as e:
        print("Autocomplete error:", e)
        return jsonify([])

    finally:
        cur.close()
        conn.close()


# =========================================================
# FULL SEARCH
# =========================================================
@search_bp.route("/products/full-search", methods=["GET"])
def full_search():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        q = request.args.get("q", "").strip()
        category = request.args.get("category")

        if not q:
            return jsonify({"products": []})

        sql = """
        SELECT *,
               COALESCE(similarity(product_name_english, %s),0) AS score
        FROM search_index
        WHERE (
            similarity(product_name_english, %s) > 0.2
            OR product_name_english ILIKE %s
            OR product_description ILIKE %s
        )
        """

        params = [q, q, f"%{q}%", f"%{q}%"]

        if category and category != "All":
            sql += " AND product_category = %s"
            params.append(category)

        sql += " ORDER BY score DESC, relevance_score DESC LIMIT 50"

        cur.execute(sql, params)

        return jsonify({"products": cur.fetchall()})

    except Exception as e:
        print("Full search error:", e)
        return jsonify({"products": []})

    finally:
        cur.close()
        conn.close()


# =========================================================
# LOG SEARCH
# =========================================================
# =========================================================
# LOG SEARCH
# =========================================================
@search_bp.route("/search/log", methods=["POST"])
def log_search():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        data = request.json or {}
        text = data.get("search_text")
        restaurant_id = data.get("restaurant_id")

        if text and restaurant_id:
            cur.execute(
                """
                SELECT search_log_id
                FROM search_log
                WHERE restaurant_id = %s
                  AND LOWER(TRIM(search_text)) = LOWER(TRIM(%s))
                LIMIT 1
                """,
                (restaurant_id, text),
            )

            existing = cur.fetchone()

            if existing:
                cur.execute(
                    """
                    UPDATE search_log
                    SET searched_at = NOW()
                    WHERE search_log_id = %s
                    """,
                    (existing[0],),
                )
            else:
                cur.execute(
                    """
                    INSERT INTO search_log (restaurant_id, search_text)
                    VALUES (%s, %s)
                    """,
                    (restaurant_id, text),
                )

            conn.commit()

        return jsonify({"ok": True})

    except Exception as e:
        print("Log search error:", e)
        return jsonify({"ok": True})

    finally:
        cur.close()
        conn.close()


# =========================================================
# RECENT SEARCHES
# =========================================================
@search_bp.route("/search/recent", methods=["GET"])
def recent_searches():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        restaurant_id = request.args.get("restaurant_id")

        if not restaurant_id:
            return jsonify([])

        cur.execute(
            """
            SELECT search_text
            FROM search_log
            WHERE restaurant_id = %s
            ORDER BY searched_at DESC
            LIMIT 6
            """,
            (restaurant_id,)
        )

        return jsonify(cur.fetchall())

    except Exception as e:
        print("Recent search error:", e)
        return jsonify([])

    finally:
        cur.close()
        conn.close()



# =========================================================
# TRENDING SEARCHES
# =========================================================
@search_bp.route("/search/trending", methods=["GET"])
def trending_searches():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        restaurant_id = request.args.get("restaurant_id")

        if not restaurant_id:
            return jsonify([])

        cur.execute(
            """
            SELECT search_text, COUNT(*) AS freq
            FROM search_log
            WHERE searched_at > NOW() - INTERVAL '7 days'
              AND restaurant_id = %s
            GROUP BY search_text
            ORDER BY freq DESC
            LIMIT 6
            """,
            (restaurant_id,)
        )

        return jsonify(cur.fetchall())

    except Exception as e:
        print("Trending search error:", e)
        return jsonify([])

    finally:
        cur.close()
        conn.close()




# =========================================================
# DELETE RECENT SEARCH
# =========================================================
@search_bp.route("/search/recent/delete", methods=["DELETE", "OPTIONS"])
def delete_recent_search():
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    data = request.get_json() or {}
    search_text = data.get("search_text")
    restaurant_id = data.get("restaurant_id")

    if not search_text:
        return jsonify({"error": "search_text required"}), 400

    if not restaurant_id:
        return jsonify({"error": "restaurant_id required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            DELETE FROM search_log
            WHERE LOWER(TRIM(search_text)) = LOWER(TRIM(%s))
              AND restaurant_id = %s
        """, (search_text, restaurant_id))

        conn.commit()

        return jsonify({"message": "Recent search deleted"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
@search_bp.route("/dashboard/search", methods=["GET"])
def dashboard_search():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        q = request.args.get("q", "").lower().strip()

        if not q:
            return jsonify([])

        cur.execute("""
            SELECT *
            FROM dashboard_search
            WHERE EXISTS (
                SELECT 1
                FROM unnest(keywords) k
                WHERE LOWER(k) LIKE %s
            )
            LIMIT 10
        """, (f"%{q}%",))

        return jsonify(cur.fetchall())

    except Exception as e:
        print("Dashboard search error:", e)
        return jsonify([])

    finally:
        cur.close()
        conn.close()