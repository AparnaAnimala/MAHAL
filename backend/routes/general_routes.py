# routes/general_routes.py
from flask import Blueprint, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor
# from db import get_connection

general_bp = Blueprint("general_bp", __name__, url_prefix="/api/v1")

# ------------------------------
# DB Connection
# ------------------------------
def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="MAHALDATABASE",
        user="postgres",
        password="S@ndeep9392",
        port="5432"
    )

# ------------------------------
# GET all categories
# ------------------------------
@general_bp.route("/categories", methods=["GET"])
def get_categories():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT category FROM general_master ORDER BY category;")
        categories = [row[0] for row in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify(categories)
    except Exception as e:
        print("Error fetching categories:", e)
        return jsonify({"error": str(e)}), 500

# ------------------------------
# GET records by category
# ------------------------------
@general_bp.route("/records", methods=["GET"])
def get_records_by_category():
    category = request.args.get("category")
    if not category:
        return jsonify({"error": "Missing category parameter"}), 400

    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM general_master WHERE category = %s;", (category,))
        records = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(records)
    except Exception as e:
        print("Error fetching records:", e)
        return jsonify({"error": str(e)}), 500

# ------------------------------
# POST new record
# ------------------------------
@general_bp.route("/records", methods=["POST"])
def create_record():
    data = request.json
    category = data.get("category")
    value = data.get("value")

    if not category or not value:
        return jsonify({"error": "Both category and value are required"}), 400

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO general_master (category, value) VALUES (%s, %s) RETURNING id;",
            (category, value)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Record added", "id": new_id}), 201
    except Exception as e:
        print("Error creating record:", e)
        return jsonify({"error": str(e)}), 500

# ------------------------------
# DELETE record by id
# ------------------------------
@general_bp.route("/records/<int:record_id>", methods=["DELETE"])
def delete_record(record_id):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM general_master WHERE id = %s;", (record_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": f"Record {record_id} deleted"}), 200
    except Exception as e:
        print("Error deleting record:", e)
        return jsonify({"error": str(e)}), 500