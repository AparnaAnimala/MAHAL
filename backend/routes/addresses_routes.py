from flask import Blueprint, jsonify, request
from db import get_db_connection
import psycopg2.extras

addresses_bp = Blueprint("addresses_bp", __name__)


# ==================================================
# DROPDOWN MASTER DATA
# ==================================================
@addresses_bp.route("/addresses", methods=["GET"])
def get_addresses():

    try:

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        fields = ["address", "street", "zone", "country", "area", "category"]

        data = {}

        for field in fields:

            cur.execute("""
                SELECT value
                FROM general_master
                WHERE category = %s
                ORDER BY value ASC
            """, (field,))

            rows = cur.fetchall()

            data[field] = [
                row["value"]
                for row in rows
                if row.get("value")
            ]

        cur.close()
        conn.close()

        return jsonify(data), 200

    except Exception as e:

        print("❌ ADDRESS DROPDOWN ERROR:", e)

        return jsonify({
            "error": "Server error"
        }), 500


# ==================================================
# SAVE USER ADDRESS
# ==================================================
@addresses_bp.route("/user-addresses", methods=["POST"])
def save_user_address():

    try:

        conn = get_db_connection()

        cur = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        data = request.json

        cur.execute("""

            INSERT INTO user_addresses (

                restaurant_id,

                contact_name,
                phone,
                address_line,

                street,
                zone,
                building,
                unit_no,

                city,
                country,
                zip_code,

                lat,
                lng,

                address_type,
                is_default

            )

            VALUES (

                %s,%s,%s,%s,

                %s,%s,%s,%s,

                %s,%s,%s,

                %s,%s,

                %s,%s

            )

            RETURNING *

        """, (

            1,  # TEMP restaurant_id

            data.get("contact_name"),

            data.get("phone"),

            data.get("address_line"),

            data.get("street"),
            data.get("zone"),
            data.get("building"),
            data.get("unit_no"),

            data.get("city"),
            data.get("country"),

            data.get("zip_code"),

            data.get("lat"),
            data.get("lng"),

            data.get("address_type"),

            data.get("is_default", False)

        ))

        address = cur.fetchone()

        conn.commit()

        cur.close()
        conn.close()

        return jsonify(address), 201

    except Exception as e:

        print("❌ SAVE ADDRESS ERROR:", e)

        return jsonify({
            "error": "Failed to save address"
        }), 500
# ==================================================
# FETCH USER ADDRESSES
# ==================================================
@addresses_bp.route("/user-addresses", methods=["GET"])
def get_user_addresses():

    try:

        conn = get_db_connection()

        cur = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cur.execute("""
            SELECT *
            FROM user_addresses
            WHERE restaurant_id = %s
            ORDER BY is_default DESC, id DESC
        """, (1,))  # TEMP restaurant_id

        addresses = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify(addresses), 200

    except Exception as e:

        print("❌ FETCH ADDRESS ERROR:", e)

        return jsonify({
            "error": "Failed to fetch addresses"
        }), 500
@addresses_bp.route(
    "/user-addresses/<int:id>",
    methods=["DELETE"]
)
def delete_user_address(id):

    try:

        conn = get_db_connection()

        cur = conn.cursor()

        cur.execute("""
            DELETE FROM user_addresses
            WHERE id = %s
        """, (id,))

        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "message": "Address deleted"
        }), 200

    except Exception as e:

        print("DELETE ADDRESS ERROR:", e)

        return jsonify({
            "error": "Delete failed"
        }), 500
@addresses_bp.route(
    "/user-addresses/<int:id>",
    methods=["PUT"]
)
def update_user_address(id):

    try:

        conn = get_db_connection()

        cur = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        data = request.json

        cur.execute("""

            UPDATE user_addresses

            SET

                contact_name = %s,
                phone = %s,
                address_line = %s,

                street = %s,
                zone = %s,
                building = %s,
                unit_no = %s,

                city = %s,
                country = %s,
                zip_code = %s,

                lat = %s,
                lng = %s,

                address_type = %s

            WHERE id = %s

            RETURNING *

        """, (

            data.get("contact_name"),

            data.get("phone"),

            data.get("address_line"),

            data.get("street"),
            data.get("zone"),
            data.get("building"),
            data.get("unit_no"),

            data.get("city"),
            data.get("country"),

            data.get("zip_code"),

            data.get("lat"),
            data.get("lng"),

            data.get("address_type"),

            id

        ))

        updated = cur.fetchone()

        conn.commit()

        cur.close()
        conn.close()

        return jsonify(updated), 200

    except Exception as e:

        print("UPDATE ADDRESS ERROR:", e)

        return jsonify({
            "error": "Update failed"
        }), 500


@addresses_bp.route(
    "/user-addresses/<int:id>/default",
    methods=["PUT"]
)
def set_default_address(id):

    try:

        conn = get_db_connection()

        cur = conn.cursor()

        # ✅ REMOVE OLD DEFAULT
        cur.execute("""
            UPDATE user_addresses
            SET is_default = FALSE
            WHERE restaurant_id = %s
        """, (1,))

        # ✅ SET NEW DEFAULT
        cur.execute("""
            UPDATE user_addresses
            SET is_default = TRUE
            WHERE id = %s
        """, (id,))

        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "message": "Default updated"
        }), 200

    except Exception as e:

        print("DEFAULT ADDRESS ERROR:", e)

        return jsonify({
            "error": "Failed"
        }), 500