import jwt
from flask import Blueprint, request, jsonify, Response
from psycopg2.extras import RealDictCursor
from db import get_db_connection

support_bp = Blueprint(
    "support_bp",
    __name__,
    url_prefix="/api/support"
)

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# =====================================================
# TOKEN DECODE
# =====================================================

def decode_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None


# =====================================================
# PRIORITY DECISION
# =====================================================

def decide_priority(text):
    text = text.lower()

    high_keywords = [
        "payment", "refund", "money", "failed",
        "invoice", "fraud", "urgent", "asap"
    ]

    for word in high_keywords:
        if word in text:
            return "high"

    return "normal"


# =====================================================
# GET SUPPORT CATEGORIES
# =====================================================

@support_bp.route("/categories", methods=["GET"])
def get_categories():

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    user = decode_token(auth.split(" ")[1])
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT category_id, name
            FROM support_categories
            WHERE active = TRUE
            AND role_scope IN (%s, 'both')
            ORDER BY name
        """, (user["role"],))

        return jsonify({
            "success": True,
            "categories": cur.fetchall()
        })

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# CREATE TICKET
# =====================================================

@support_bp.route("/ticket", methods=["POST"])
def create_ticket():

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    user = decode_token(auth.split(" ")[1])
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    if user["role"] not in ["supplier", "restaurant"]:
        return jsonify({"error": "Invalid role"}), 403

    subject = request.form.get("subject")
    message = request.form.get("message")
    file = request.files.get("attachment")

    if not subject or not message:
        return jsonify({"error": "Subject and message required"}), 400

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # CATEGORY
        cur.execute("""
            SELECT category_id
            FROM support_categories
            WHERE name=%s
        """, (subject,))
        cat = cur.fetchone()

        if not cat:
            return jsonify({"error": "Invalid category"}), 400

        category_id = cat["category_id"]

        # PRIORITY
        priority = decide_priority(subject + " " + message)

        # CREATE TICKET
        cur.execute("""
            INSERT INTO support_tickets
            (
                source_role,
                source_id,
                user_id,
                subject,
                category_id,
                priority,
                original_priority,
                status
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,'open')
            RETURNING ticket_id
        """, (
            user["role"],
            user["linked_id"],
            user["user_id"],
            subject,
            category_id,
            priority,
            priority
        ))

        ticket_id = cur.fetchone()["ticket_id"]

        # MESSAGE
        cur.execute("""
            INSERT INTO support_messages
            (
                ticket_id,
                sender_role,
                sender_id,
                message
            )
            VALUES (%s,%s,%s,%s)
            RETURNING message_id
        """, (
            ticket_id,
            user["role"],
            user["user_id"],
            message
        ))

        message_id = cur.fetchone()["message_id"]

        # ATTACHMENT (BYTEA STORAGE)
        if file:
            file_data = file.read()

            cur.execute("""
                INSERT INTO support_attachments
                (
                    ticket_id,
                    message_id,
                    uploaded_by_role,
                    file_name,
                    file_type,
                    file_size,
                    file_data
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (
                ticket_id,
                message_id,
                user["role"],
                file.filename,
                file.content_type,
                len(file_data),
                file_data
            ))

        conn.commit()

        return jsonify({
            "success": True,
            "ticket_id": ticket_id,
            "priority": priority
        })

    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# MY TICKETS (TENANT SAFE)
# =====================================================

@support_bp.route("/my-tickets", methods=["GET"])
def my_tickets():

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    user = decode_token(auth.split(" ")[1])
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT
                ticket_id,
                subject,
                original_priority,
                status,
                created_at,
                closed_at
            FROM support_tickets
            WHERE source_role=%s
            AND source_id=%s
            ORDER BY created_at DESC
        """, (user["role"], user["linked_id"]))

        return jsonify({
            "success": True,
            "tickets": cur.fetchall()
        })

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# GET TICKET DETAILS
# =====================================================

@support_bp.route("/ticket/<int:ticket_id>", methods=["GET"])
def get_ticket_details(ticket_id):

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    user = decode_token(auth.split(" ")[1])
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ownership check
        cur.execute("""
            SELECT *
            FROM support_tickets
            WHERE ticket_id=%s
            AND source_role=%s
            AND source_id=%s
        """, (ticket_id, user["role"], user["linked_id"]))

        ticket = cur.fetchone()
        if not ticket:
            return jsonify({"error": "Not found"}), 404

        # messages
        cur.execute("""
            SELECT *
            FROM support_messages
            WHERE ticket_id=%s
            ORDER BY created_at ASC
        """, (ticket_id,))
        messages = cur.fetchall()

        # attachments
        cur.execute("""
            SELECT attachment_id, file_name, file_type, file_size
            FROM support_attachments
            WHERE ticket_id=%s
        """, (ticket_id,))
        attachments = cur.fetchall()

        return jsonify({
            "ticket": ticket,
            "messages": messages,
            "attachments": attachments
        })

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# USER REPLY
# =====================================================

@support_bp.route("/ticket/<int:ticket_id>/reply", methods=["POST"])
def reply_ticket(ticket_id):

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    user = decode_token(auth.split(" ")[1])
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    message = request.form.get("message")
    file = request.files.get("attachment")

    if not message:
        return jsonify({"error": "message required"}), 400

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ownership check
        cur.execute("""
            SELECT 1
            FROM support_tickets
            WHERE ticket_id=%s
            AND source_role=%s
            AND source_id=%s
        """, (ticket_id, user["role"], user["linked_id"]))

        if not cur.fetchone():
            return jsonify({"error": "Not allowed"}), 403

        # insert message
        cur.execute("""
            INSERT INTO support_messages
            (ticket_id, sender_role, sender_id, message)
            VALUES (%s,%s,%s,%s)
            RETURNING message_id
        """, (
            ticket_id,
            user["role"],
            user["user_id"],
            message
        ))

        message_id = cur.fetchone()["message_id"]

        # attachment
        if file:
            file_data = file.read()

            cur.execute("""
                INSERT INTO support_attachments
                (
                    ticket_id,
                    message_id,
                    uploaded_by_role,
                    file_name,
                    file_type,
                    file_size,
                    file_data
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (
                ticket_id,
                message_id,
                user["role"],
                file.filename,
                file.content_type,
                len(file_data),
                file_data
            ))

        conn.commit()

        return jsonify({"success": True})

    finally:
        if cur: cur.close()
        if conn: conn.close()


# =====================================================
# DOWNLOAD ATTACHMENT
# =====================================================

@support_bp.route("/attachment/<int:attachment_id>", methods=["GET"])
def download_attachment(attachment_id):

    auth = request.headers.get("Authorization", "")

    if not auth.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    user = decode_token(auth.split(" ")[1])
    if not user:
        return jsonify({"error": "Invalid token"}), 401

    conn = cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT sa.*
            FROM support_attachments sa
            JOIN support_tickets st ON st.ticket_id = sa.ticket_id
            WHERE sa.attachment_id=%s
            AND st.source_role=%s
            AND st.source_id=%s
        """, (attachment_id, user["role"], user["linked_id"]))

        file = cur.fetchone()

        if not file:
            return jsonify({"error": "Not found"}), 404

        # 🔥 DEBUG (remove later)
        print("FILE DEBUG:", file["file_name"], file["file_type"])

        data = file.get("file_data")

        # ❌ CRITICAL FIX — handle empty data
        if not data:
            return jsonify({"error": "File data missing"}), 500

        # 🔥 CRITICAL FIX — convert memoryview → bytes
        if isinstance(data, memoryview):
            data = data.tobytes()

        return Response(
            data,
            mimetype=file.get("file_type") or "application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename={file['file_name']}",
                "Cache-Control": "no-cache"
            }
        )

    except Exception as e:
        if conn: conn.rollback()
        print("ATTACHMENT ERROR:", str(e))  # 🔥 DEBUG
        return jsonify({"error": "Attachment failed"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()