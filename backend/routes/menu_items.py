from flask import Blueprint, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor

menu_items_bp = Blueprint("menu_items", __name__, url_prefix="/api")


def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="MAHALDATABASE",
        user="postgres",
        password="S@ndeep9392",
        port="5432"
    )

def parse_int(value, field_name):
    try:
        if value in (None, "", "null"):
            raise ValueError
        return int(value)
    except (TypeError, ValueError):
        raise ValueError(f"Invalid {field_name}")

# =====================================================
# CREATE MENU ITEM
# =====================================================
@menu_items_bp.route("/menu-items", methods=["POST"])
def create_menu_item():
    try:
        restaurant_id_raw = request.form.get("restaurant_id")
        name = request.form.get("name")
        category = request.form.get("category")
        price_raw = request.form.get("price")
        portion_size = request.form.get("portion_size")
        description = request.form.get("description")
        status = request.form.get("status", "true").lower() == "true"

        if not all([name, category, price_raw, portion_size]):
            return jsonify({"error": "Missing required fields"}), 400

        try:
            restaurant_id = parse_int(restaurant_id_raw, "restaurant_id")
            price = float(price_raw)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        image_file = request.files.get("image")
        image_bytes = image_file.read() if image_file else None

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO menu_items
            (restaurant_id, name, category, price, portion_size, description, image, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            restaurant_id,
            name,
            category,
            price,
            portion_size,
            description,
            psycopg2.Binary(image_bytes) if image_bytes else None,
            status
        ))

        menu_item_id = cur.fetchone()[0]
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "message": "Menu item created successfully",
            "id": menu_item_id
        }), 201

    except Exception as e:
        print("Menu item insert error:", e)
        return jsonify({"error": "Internal server error"}), 500



# =====================================================
# GET MENU ITEMS (RESTAURANT-WISE)
# =====================================================
@menu_items_bp.route("/menu-items", methods=["GET"])
def get_menu_items():
    restaurant_id = request.args.get("restaurant_id")

    if not restaurant_id:
        return jsonify({"error": "restaurant_id is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            id,
            restaurant_id,
            name,
            category,
            price,
            portion_size,
            description,
            status,
            encode(image, 'base64') AS image
        FROM menu_items
        WHERE restaurant_id = %s
        ORDER BY name
    """, (restaurant_id,))

    rows = cur.fetchall()

    for r in rows:
        if r["image"]:
            r["image"] = f"data:image/png;base64,{r['image']}"
        else:
            r["image"] = "/images/food-placeholder.png"

    cur.close()
    conn.close()

    return jsonify(rows), 200


# =====================================================
# UPDATE MENU ITEM (SECURE)
# =====================================================
@menu_items_bp.route("/menu-items/<int:item_id>", methods=["PUT"])
def update_menu_item(item_id):
    try:
        restaurant_id = parse_int(request.form.get("restaurant_id"), "restaurant_id")
    except ValueError as e:
        return jsonify({"error": str(e)}), 400   

    name = request.form.get("name")
    category = request.form.get("category")
    price = request.form.get("price")
    portion_size = request.form.get("portion_size")
    description = request.form.get("description")
    status = request.form.get("status", "true").lower() == "true"

    if not restaurant_id:
        return jsonify({"error": "restaurant_id is required"}), 400

    image_file = request.files.get("image")
    image_bytes = image_file.read() if image_file else None

    conn = get_db_connection()
    cur = conn.cursor()

    if image_bytes:
        cur.execute("""
            UPDATE menu_items
            SET name=%s,
                category=%s,
                price=%s,
                portion_size=%s,
                description=%s,
                image=%s,
                status=%s
            WHERE id=%s AND restaurant_id=%s
        """, (
            name,
            category,
            float(price),
            portion_size,
            description,
            psycopg2.Binary(image_bytes),
            status,
            item_id,
            restaurant_id
        ))
    else:
        cur.execute("""
            UPDATE menu_items
            SET name=%s,
                category=%s,
                price=%s,
                portion_size=%s,
                description=%s,
                status=%s
            WHERE id=%s AND restaurant_id=%s
        """, (
            name,
            category,
            float(price),
            portion_size,
            description,
            status,
            item_id,
            restaurant_id
        ))

    if cur.rowcount == 0:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Menu item not found or unauthorized"}), 404

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Menu item updated successfully"}), 200