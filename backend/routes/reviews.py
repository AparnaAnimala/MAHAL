from flask import Blueprint, request, jsonify
from flask_cors import CORS
import jwt
from psycopg2.extras import RealDictCursor
from db import get_db_connection
from routes.auth_routes import JWT_SECRET

reviews_bp = Blueprint("reviews_bp", __name__)
CORS(reviews_bp)

# ===============================
# TOKEN HELPER
# ===============================
def get_user_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        token = auth.replace("Bearer ", "")
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None


# ===============================
# SUBMIT REVIEW WITH IMAGE (BINARY)
# ===============================
@reviews_bp.route("/reviews", methods=["POST", "OPTIONS"])
def submit_review():

    # ✅ Handle OPTIONS Preflight
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    user = get_user_from_token()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    if user["role"] != "restaurant":
        return jsonify({"error": "Only restaurant can review"}), 403

    # ✅ multipart/form-data fields
    product_id = request.form.get("product_id")
    product_name = request.form.get("product_name")
    order_id = request.form.get("order_id")
    rating = request.form.get("rating")
    review_text = request.form.get("review_text", "")

    # ✅ Uploaded file
    image_file = request.files.get("review_image")

    if not product_id:
        return jsonify({"error": "product_id required"}), 400
    if not order_id:
        return jsonify({"error": "order_id required"}), 400
    if not rating:
        return jsonify({"error": "rating required"}), 400

    restaurant_id = user["linked_id"]

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ✅ Fetch supplier_id from order_header
        cur.execute("""
            SELECT supplier_id
            FROM order_header
            WHERE order_id = %s
              AND restaurant_id = %s
        """, (order_id, restaurant_id))

        order_row = cur.fetchone()

        if not order_row:
            return jsonify({"error": "Order not found"}), 404

        supplier_id = order_row["supplier_id"]

        # ✅ Convert uploaded image into binary
        image_data = None
        image_name = None

        if image_file:
            image_data = image_file.read()
            image_name = image_file.filename

        # ✅ Insert review into DB
        cur.execute("""
            INSERT INTO product_reviews
            (product_id, supplier_id, restaurant_id, order_id,
             rating, review_text, product_name,
             review_image, review_image_name)

            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)

            ON CONFLICT (order_id, product_id) DO NOTHING
            RETURNING review_id
        """, (
            int(product_id),
            int(supplier_id),
            int(restaurant_id),
            str(order_id),
            int(rating),
            review_text,
            product_name,
            image_data,
            image_name
        ))

        if not cur.fetchone():
            conn.rollback()
            return jsonify({"error": "Review already submitted"}), 409

        conn.commit()
        return jsonify({"message": "Review submitted successfully"}), 200

    except Exception as e:
        print("❌ submit_review ERROR:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ===============================
# GET RESTAURANT REVIEWS
# ===============================
@reviews_bp.route("/reviews/restaurant", methods=["GET"])
def restaurant_reviews():

    user = get_user_from_token()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    restaurant_id = user["linked_id"]

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            pr.review_id,
            pr.rating,
            pr.review_text,
            pr.created_at,
            pr.order_id,
            pr.product_name
        FROM product_reviews pr
        WHERE pr.restaurant_id = %s
        ORDER BY pr.created_at DESC
    """, (restaurant_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200


# ===============================
# GET REVIEW IMAGE (FIXED)
# ===============================
@reviews_bp.route("/reviews/image/<int:review_id>", methods=["GET"])
def get_review_image(review_id):

    conn = get_db_connection()

    # ✅ Use RealDictCursor so row is a dictionary
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT review_image, review_image_name
        FROM product_reviews
        WHERE review_id = %s
    """, (review_id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    # ✅ No image case
    if not row or not row["review_image"]:
        return jsonify({"error": "No image found"}), 404

    # ✅ Extract image properly
    image_bytes = row["review_image"]
    filename = row["review_image_name"] or "review.jpg"

    # psycopg2 BYTEA returns memoryview sometimes
    if isinstance(image_bytes, memoryview):
        image_bytes = image_bytes.tobytes()

    return (
        image_bytes,
        200,
        {
            "Content-Type": "image/jpeg",
            "Content-Disposition": f"inline; filename={filename}",
        },
    )


# ===============================
# GET REVIEWS FOR A PRODUCT
# ===============================
@reviews_bp.route("/reviews/product/<int:product_id>", methods=["GET"])
def get_product_reviews(product_id):

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            review_id,
            rating,
            review_text,
            created_at,
            restaurant_id
        FROM product_reviews
        WHERE product_id = %s
        ORDER BY created_at DESC
    """, (product_id,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(rows), 200
@reviews_bp.route("/reviews/all", methods=["GET"])
def get_all_reviews():

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            review_id,
            product_name,
            rating,
            review_text,
            created_at
        FROM product_reviews
        ORDER BY created_at DESC
        LIMIT 20
    """)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(rows), 200
@reviews_bp.route("/reviews/image/<int:review_id>", methods=["GET"])
def get_review_image_by_id(review_id):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT review_image, review_image_name
        FROM product_reviews
        WHERE review_id = %s
    """, (review_id,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row or not row[0]:
        return jsonify({"error": "Image not found"}), 404

    image_data = row[0]
    image_name = row[1] or "review.jpg"

    return send_file(
        io.BytesIO(image_data),
        mimetype="image/jpeg",
        download_name=image_name
    )