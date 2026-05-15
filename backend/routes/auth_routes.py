# # routes/auth_routes.py
# from flask import Blueprint, request, jsonify, current_app
# from psycopg2.extras import RealDictCursor
# import datetime
# import jwt
# import random
# import smtplib
# from email.mime.text import MIMEText

# from db import get_db_connection

# auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

# # ======================================================
# # JWT CONFIG
# # ======================================================
# JWT_SECRET = "MAHAL_SUPER_SECRET_2025"
# JWT_EXP_MIN = 240  # 4 hours


# def create_token(user):
#     payload = {
#         "user_id": user["user_id"],
#         "username": user["username"],
#         "role": user["role"],
#         "linked_id": user["linked_id"],
#         "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=JWT_EXP_MIN),
#     }
#     return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# # ======================================================
# # EMAIL UTIL
# # ======================================================
# def send_otp_email(to_email, otp):
#     msg = MIMEText(
#         f"""
# Your One-Time Password (OTP) is:

# {otp}

# This OTP is valid for 5 minutes.

# If you did not try to login, please ignore this email.
# """
#     )
#     msg["Subject"] = "Your Login OTP"
#     msg["From"] = current_app.config["MAIL_USERNAME"]
#     msg["To"] = to_email

#     with smtplib.SMTP("smtp.gmail.com", 587) as server:
#         server.starttls()
#         server.login(
#             current_app.config["MAIL_USERNAME"],
#             current_app.config["MAIL_PASSWORD"],
#         )
#         server.send_message(msg)


# # ======================================================
# # 1️⃣ SEND OTP (EMAIL MUST EXIST IN USERS TABLE)
# # ======================================================
# @auth_bp.route("/send-otp", methods=["POST"])
# def send_otp():
#     data = request.get_json() or {}
#     email = (data.get("email") or "").lower().strip()

#     if not email:
#         return jsonify({"error": "Email required"}), 400

#     conn = cur = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor(cursor_factory=RealDictCursor)

#         # 🔒 VERIFY USER EXISTS (USERS TABLE ONLY)
#         cur.execute("""
#             SELECT user_id
#             FROM users
#             WHERE LOWER(username) = %s
#               AND status = 'active'
#         """, (email,))
#         user = cur.fetchone()

#         if not user:
#             return jsonify({"error": "Email not registered"}), 404

#         # Generate 6-digit OTP
#         otp = str(random.randint(100000, 999999))
#         expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)

#         # UPSERT OTP
#         cur.execute("""
#             INSERT INTO supplier_email_otp (email, otp_code, expires_at)
#             VALUES (%s, %s, %s)
#             ON CONFLICT (email)
#             DO UPDATE SET
#                 otp_code = EXCLUDED.otp_code,
#                 expires_at = EXCLUDED.expires_at,
#                 created_at = now()
#         """, (email, otp, expires_at))

#         conn.commit()

#         send_otp_email(email, otp)

#         return jsonify({"message": "OTP sent successfully"}), 200

#     except Exception as e:
#         print("❌ send_otp error:", e)
#         return jsonify({"error": "Server error"}), 500

#     finally:
#         if cur: cur.close()
#         if conn: conn.close()


# # ======================================================
# # 2️⃣ VERIFY OTP → ISSUE JWT
# # ======================================================
# @auth_bp.route("/verify-otp", methods=["POST"])
# def verify_otp():
#     data = request.get_json() or {}
#     email = (data.get("email") or "").lower().strip()
#     otp = (data.get("otp") or "").strip()

#     if not email or not otp:
#         return jsonify({"error": "Email & OTP required"}), 400

#     conn = cur = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor(cursor_factory=RealDictCursor)

#         # Verify OTP
#         cur.execute("""
#             SELECT otp_code, expires_at
#             FROM supplier_email_otp
#             WHERE email = %s
#         """, (email,))
#         rec = cur.fetchone()

#         if not rec:
#             return jsonify({"error": "OTP not found"}), 401

#         if rec["otp_code"] != otp:
#             return jsonify({"error": "Invalid OTP"}), 401

#         if rec["expires_at"] < datetime.datetime.utcnow():
#             return jsonify({"error": "OTP expired"}), 401

#         # Fetch USER DATA (FINAL AUTH SOURCE)
#         cur.execute("""
#             SELECT user_id, username, role, linked_id
#             FROM users
#             WHERE LOWER(username) = %s
#               AND status = 'active'
#         """, (email,))
#         user = cur.fetchone()

#         if not user:
#             return jsonify({"error": "User not found"}), 404

#         # Cleanup OTP
#         cur.execute("DELETE FROM supplier_email_otp WHERE email = %s", (email,))
#         conn.commit()

#         token = create_token(user)

#         return jsonify({
#             "message": "Login successful",
#             "token": token,
#             "role": user["role"],
#             "linked_id": user["linked_id"],
#             "user_id": user["user_id"],
#         }), 200

#     except Exception as e:
#         print("❌ verify_otp error:", e)
#         return jsonify({"error": "Server error"}), 500

#     finally:
#         if cur: cur.close()
#         if conn: conn.close()


# # ======================================================
# # TOKEN VERIFICATION (UNCHANGED)
# # ======================================================
# @auth_bp.route("/verify", methods=["GET"])
# def verify():
#     token = request.headers.get("Authorization", "").replace("Bearer ", "")

#     if not token:
#         return jsonify({"valid": False, "error": "No token"}), 401

#     try:
#         decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#         return jsonify({"valid": True, "data": decoded}), 200

#     except jwt.ExpiredSignatureError:
#         return jsonify({"valid": False, "error": "Expired"}), 401
#     except Exception:
#         return jsonify({"valid": False, "error": "Invalid"}), 401




# routes/auth_routes.py
from flask import Blueprint, request, jsonify, current_app
from psycopg2.extras import RealDictCursor
import datetime
import jwt
import random
import smtplib
from email.mime.text import MIMEText

from db import get_db_connection

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

# ======================================================
# JWT CONFIG
# ======================================================
JWT_SECRET = "MAHAL_SUPER_SECRET_2025"
JWT_EXP_MIN = 240  # 4 hours


def create_token(user):
    payload = {
        "user_id": user["user_id"],
        "username": user["username"],
        "role": user["role"],
        "linked_id": user["linked_id"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=JWT_EXP_MIN),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# ======================================================
# EMAIL UTIL
# ======================================================
def send_otp_email(to_email, otp):
    msg = MIMEText(
        f"""
Your One-Time Password (OTP) is:

{otp}

This OTP is valid for 5 minutes.

If you did not try to login, please ignore this email.
"""
    )
    msg["Subject"] = "Your Login OTP"
    msg["From"] = current_app.config["MAIL_USERNAME"]
    msg["To"] = to_email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(
            current_app.config["MAIL_USERNAME"],
            current_app.config["MAIL_PASSWORD"],
        )
        server.send_message(msg)


# ======================================================
# 1️⃣ SEND OTP (EMAIL MUST EXIST IN USERS TABLE)
# ======================================================
@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower().strip()

    if not email:
        return jsonify({"error": "Email required"}), 400

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # 🔒 VERIFY USER EXISTS (USERS TABLE ONLY)
        role = (data.get("role") or "").lower().strip()

        if not role:
            return jsonify({"error": "Role required"}), 400

        cur.execute("""
            SELECT user_id, role
            FROM users
            WHERE LOWER(username) = %s
            AND status = 'active'
        """, (email,))

        user = cur.fetchone()

        if not user:
            return jsonify({"error": "Email not registered"}), 404

        # 🔒 ROLE VALIDATION (CRITICAL FIX)
        if user["role"] != role:
            return jsonify({
                "error": f"This email is registered as {user['role']}. Please use {user['role']} login page."
            }), 403

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)

        # UPSERT OTP
        cur.execute("""
            INSERT INTO supplier_email_otp (email, otp_code, expires_at)
            VALUES (%s, %s, %s)
            ON CONFLICT (email)
            DO UPDATE SET
                otp_code = EXCLUDED.otp_code,
                expires_at = EXCLUDED.expires_at,
                created_at = now()
        """, (email, otp, expires_at))

        conn.commit()

        send_otp_email(email, otp)

        return jsonify({"message": "OTP sent successfully"}), 200

    except Exception as e:
        print("❌ send_otp error:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# 2️⃣ VERIFY OTP → ISSUE JWT
# ======================================================
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json() or {}
    email = (data.get("email") or "").lower().strip()
    otp = (data.get("otp") or "").strip()

    if not email or not otp:
        return jsonify({"error": "Email & OTP required"}), 400

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Verify OTP
        cur.execute("""
            SELECT otp_code, expires_at
            FROM supplier_email_otp
            WHERE email = %s
        """, (email,))
        rec = cur.fetchone()

        if not rec:
            return jsonify({"error": "OTP not found"}), 401

        if rec["otp_code"] != otp:
            return jsonify({"error": "Invalid OTP"}), 401

        if rec["expires_at"] < datetime.datetime.utcnow():
            return jsonify({"error": "OTP expired"}), 401

        # Fetch USER DATA (FINAL AUTH SOURCE)
        role = (data.get("role") or "").lower().strip()

        cur.execute("""
            SELECT user_id, username, role, linked_id
            FROM users
            WHERE LOWER(username) = %s
            AND status = 'active'
        """, (email,))

        user = cur.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # 🔒 AGAIN VALIDATE ROLE
        if user["role"] != role:
            return jsonify({
                "error": f"Access denied. Use {user['role']} login."
            }), 403


        # Cleanup OTP
        cur.execute("DELETE FROM supplier_email_otp WHERE email = %s", (email,))
        conn.commit()

        token = create_token(user)

        return jsonify({
            "message": "Login successful",
            "token": token,
            "role": user["role"],
            "linked_id": user["linked_id"],
            "user_id": user["user_id"],
        }), 200

    except Exception as e:
        print("❌ verify_otp error:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        if cur: cur.close()
        if conn: conn.close()


# ======================================================
# TOKEN VERIFICATION (UNCHANGED)
# ======================================================
@auth_bp.route("/verify", methods=["GET"])
def verify():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not token:
        return jsonify({"valid": False, "error": "No token"}), 401

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return jsonify({"valid": True, "data": decoded}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"valid": False, "error": "Expired"}), 401
    except Exception:
        return jsonify({"valid": False, "error": "Invalid"}), 401