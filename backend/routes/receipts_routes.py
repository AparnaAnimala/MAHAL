# from flask import Blueprint, request, jsonify
# from db import get_db_connection
# from psycopg2.extras import RealDictCursor

# receipts_bp = Blueprint("receipts_bp", __name__)

# # --------------------------------------------------
# # Sanitize payload
# # --------------------------------------------------
# def sanitize(payload):
#     return {k: (None if isinstance(v, str) and v.strip() == "" else v) for k, v in payload.items()}


# # --------------------------------------------------
# # PAYMENT OPTIONS
# # --------------------------------------------------
# @receipts_bp.route("/api/payment-options", methods=["GET"])
# def get_payment_options():
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT value FROM general_master
#         WHERE category = 'payment_mode'
#         ORDER BY value ASC
#     """)
#     payment_modes = [row["value"] for row in cur.fetchall()]

#     cur.execute("""
#         SELECT value FROM general_master
#         WHERE category = 'payment_status'
#         ORDER BY value ASC
#     """)
#     payment_statuses = [row["value"] for row in cur.fetchall()]

#     cur.close()
#     conn.close()

#     return jsonify({
#         "payment_modes": payment_modes,
#         "payment_statuses": payment_statuses
#     })


# # --------------------------------------------------
# # GET ALL INVOICES
# # --------------------------------------------------
# @receipts_bp.route("/api/invoices", methods=["GET"])
# def get_invoices():
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             invoice_no,
#             invoice_date,
#             supplier_id,
#             branch_name_english,
#             store_name_english,
#             restaurant_id,
#             restaurant_branch_name_english,
#             restaurant_store_name_english,
#             grand_total
#         FROM invoice_header
#         ORDER BY invoice_no DESC
#     """)

#     data = cur.fetchall()
#     cur.close()
#     conn.close()
#     return jsonify(data)


# # --------------------------------------------------
# # GET SINGLE INVOICE
# # --------------------------------------------------
# @receipts_bp.route("/api/invoices/<invoice_no>", methods=["GET"])
# def get_invoice_by_no(invoice_no):
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT
#             invoice_no,
#             invoice_date,
#             supplier_id,
#             branch_name_english,
#             store_name_english,
#             restaurant_id,
#             restaurant_branch_name_english,
#             restaurant_store_name_english,
#             grand_total
#         FROM invoice_header
#         WHERE invoice_no = %s
#     """, (invoice_no,))

#     row = cur.fetchone()

#     cur.close()
#     conn.close()

#     if not row:
#         return jsonify({"error": "Invoice not found"}), 404

#     return jsonify(row)


# # --------------------------------------------------
# # GET RECEIPT
# # --------------------------------------------------
# @receipts_bp.route("/api/receipts/<invoice_no>", methods=["GET"])
# def get_receipt(invoice_no):
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT *
#         FROM receipts
#         WHERE invoice_no = %s
#     """, (invoice_no,))

#     data = cur.fetchall()

#     cur.close()
#     conn.close()

#     return jsonify(data)


# # --------------------------------------------------
# # CREATE RECEIPT
# # --------------------------------------------------
# @receipts_bp.route("/api/receipts", methods=["POST"])
# def create_receipt():
#     payload = sanitize(request.json)

#     invoice_no = payload.get("invoice_no")

#     # 1️⃣ Fetch invoice grand_total
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("""
#         SELECT grand_total
#         FROM invoice_header
#         WHERE invoice_no = %s
#     """, (invoice_no,))

#     invoice_row = cur.fetchone()

#     if not invoice_row:
#         cur.close()
#         conn.close()
#         return jsonify({"error": "Invalid invoice_no"}), 400

#     grand_total = invoice_row["grand_total"]

#     # 2️⃣ Insert receipt with proper grand_total
#     payload["grand_total"] = grand_total

#     cur.execute("""
#         INSERT INTO receipts (
#             invoice_no, restaurant_id, restaurant_branch_name_english,
#             restaurant_store_name_english, supplier_id, branch_name_english,
#             store_name_english, amount_received, payment_mode, reference_number,
#             remarks, payment_status, grand_total
#         )
#         VALUES (
#             %(invoice_no)s, %(restaurant_id)s, %(restaurant_branch_name_english)s,
#             %(restaurant_store_name_english)s, %(supplier_id)s, %(branch_name_english)s,
#             %(store_name_english)s, %(amount_received)s, %(payment_mode)s,
#             %(reference_number)s, %(remarks)s, %(payment_status)s,
#             %(grand_total)s
#         )
#         RETURNING *
#     """, payload)

#     new_row = cur.fetchone()
#     conn.commit()

#     cur.close()
#     conn.close()

#     return jsonify(new_row), 201


# # --------------------------------------------------
# # UPDATE RECEIPT
# # --------------------------------------------------
# @receipts_bp.route("/api/receipts/<int:receipt_id>", methods=["PUT"])
# def update_receipt(receipt_id):
#     payload = sanitize(request.json)

#     set_clause = ", ".join([f"{key} = %({key})s" for key in payload.keys()])

#     query = f"""
#         UPDATE receipts
#         SET {set_clause}, updated_at = CURRENT_TIMESTAMP
#         WHERE receipt_id = %s
#         RETURNING *
#     """

#     payload["receipt_id"] = receipt_id

#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute(query, payload)
#     updated = cur.fetchone()
#     conn.commit()

#     cur.close()
#     conn.close()

#     return jsonify(updated)


# # --------------------------------------------------
# # DELETE RECEIPT
# # --------------------------------------------------
# @receipts_bp.route("/api/receipts/<int:receipt_id>", methods=["DELETE"])
# def delete_receipt(receipt_id):
#     conn = get_db_connection()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     cur.execute("DELETE FROM receipts WHERE receipt_id = %s RETURNING receipt_id", (receipt_id,))
#     deleted = cur.fetchone()
#     conn.commit()

#     cur.close()
#     conn.close()

#     return jsonify({"deleted": deleted})




from flask import Blueprint, request, jsonify
from db import get_db_connection
from psycopg2.extras import RealDictCursor

receipts_bp = Blueprint("receipts_bp", __name__)

# --------------------------------------------------
# Sanitize payload
# --------------------------------------------------
def sanitize(payload):
    return {k: (None if isinstance(v, str) and v.strip() == "" else v) for k, v in payload.items()}


# --------------------------------------------------
# PAYMENT OPTIONS
# --------------------------------------------------
@receipts_bp.route("/api/payment-options", methods=["GET"])
def get_payment_options():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT value FROM general_master
        WHERE category = 'payment_mode'
        ORDER BY value ASC
    """)
    payment_modes = [row["value"] for row in cur.fetchall()]

    cur.execute("""
        SELECT value FROM general_master
        WHERE category = 'payment_status'
        ORDER BY value ASC
    """)
    payment_statuses = [row["value"] for row in cur.fetchall()]

    cur.close()
    conn.close()

    return jsonify({
        "payment_modes": payment_modes,
        "payment_statuses": payment_statuses
    })


# --------------------------------------------------
# GET ALL INVOICES
# --------------------------------------------------
@receipts_bp.route("/api/invoices", methods=["GET"])
def get_invoices():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            invoice_no,
            invoice_date,
            supplier_id,
            branch_name_english,
            store_name_english,
            restaurant_id,
            restaurant_branch_name_english,
            restaurant_store_name_english,
            grand_total
        FROM invoice_header
        ORDER BY invoice_no DESC
    """)

    data = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(data)


# --------------------------------------------------
# GET SINGLE INVOICE
# --------------------------------------------------
@receipts_bp.route("/api/invoices/<invoice_no>", methods=["GET"])
def get_invoice_by_no(invoice_no):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            invoice_no,
            invoice_date,
            supplier_id,
            branch_name_english,
            store_name_english,
            restaurant_id,
            restaurant_branch_name_english,
            restaurant_store_name_english,
            grand_total
        FROM invoice_header
        WHERE invoice_no = %s
    """, (invoice_no,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Invoice not found"}), 404

    return jsonify(row)


# --------------------------------------------------
# GET RECEIPT
# --------------------------------------------------
@receipts_bp.route("/api/receipts/<invoice_no>", methods=["GET"])
def get_receipt(invoice_no):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Receipt
    cur.execute("""
        SELECT *
        FROM receipts
        WHERE invoice_no = %s
    """, (invoice_no,))
    receipt = cur.fetchone()

    if not receipt:
        cur.close()
        conn.close()
        return jsonify({"error": "Receipt not found"}), 404

    # Get invoice_id
    cur.execute("""
        SELECT invoice_id
        FROM invoice_header
        WHERE invoice_number = %s
    """, (invoice_no,))
    inv = cur.fetchone()

    # Get items
    if inv:
        cur.execute("""
            SELECT
                ii.quantity,
                ii.price_per_unit AS unit_price,
                ii.discount,
                ii.total_amount AS line_total,

                ii.product_name_english AS product_english,
                ii.product_name_english AS product_arabic

            FROM invoice_items ii
            WHERE ii.invoice_id = %s
        """, (inv["invoice_id"],))

        items = cur.fetchall()
    else:
        items = []

    cur.close()
    conn.close()

    return jsonify({
        "receipt": receipt,
        "items": items
    })


# --------------------------------------------------
# CREATE RECEIPT
# --------------------------------------------------
@receipts_bp.route("/api/receipts", methods=["POST"])
def create_receipt():
    payload = sanitize(request.json)

    invoice_no = payload.get("invoice_no")

    # 1️⃣ Fetch invoice grand_total
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT grand_total
        FROM invoice_header
        WHERE invoice_no = %s
    """, (invoice_no,))

    invoice_row = cur.fetchone()

    if not invoice_row:
        cur.close()
        conn.close()
        return jsonify({"error": "Invalid invoice_no"}), 400

    grand_total = invoice_row["grand_total"]

    # 2️⃣ Insert receipt with proper grand_total
    payload["grand_total"] = grand_total

    cur.execute("""
        INSERT INTO receipts (
            invoice_no, restaurant_id, restaurant_branch_name_english,
            restaurant_store_name_english, supplier_id, branch_name_english,
            store_name_english, amount_received, payment_mode, reference_number,
            remarks, payment_status, grand_total
        )
        VALUES (
            %(invoice_no)s, %(restaurant_id)s, %(restaurant_branch_name_english)s,
            %(restaurant_store_name_english)s, %(supplier_id)s, %(branch_name_english)s,
            %(store_name_english)s, %(amount_received)s, %(payment_mode)s,
            %(reference_number)s, %(remarks)s, %(payment_status)s,
            %(grand_total)s
        )
        RETURNING *
    """, payload)

    new_row = cur.fetchone()
    conn.commit()

    cur.close()
    conn.close()

    return jsonify(new_row), 201


# --------------------------------------------------
# UPDATE RECEIPT
# --------------------------------------------------
@receipts_bp.route("/api/receipts/<int:receipt_id>", methods=["PUT"])
def update_receipt(receipt_id):
    payload = sanitize(request.json)

    set_clause = ", ".join([f"{key} = %({key})s" for key in payload.keys()])

    query = f"""
        UPDATE receipts
        SET {set_clause}, updated_at = CURRENT_TIMESTAMP
        WHERE receipt_id = %s
        RETURNING *
    """

    payload["receipt_id"] = receipt_id

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(query, payload)
    updated = cur.fetchone()
    conn.commit()

    cur.close()
    conn.close()

    return jsonify(updated)


# --------------------------------------------------
# DELETE RECEIPT
# --------------------------------------------------
@receipts_bp.route("/api/receipts/<int:receipt_id>", methods=["DELETE"])
def delete_receipt(receipt_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("DELETE FROM receipts WHERE receipt_id = %s RETURNING receipt_id", (receipt_id,))
    deleted = cur.fetchone()
    conn.commit()

    cur.close()
    conn.close()

    return jsonify({"deleted": deleted})