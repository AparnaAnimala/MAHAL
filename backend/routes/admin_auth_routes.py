from flask import Blueprint, request, jsonify, current_app, g
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta, timezone
import jwt
import random
import smtplib
from email.mime.text import MIMEText

from routes.admin_audit import log_admin_action
from db import get_db_connection
from routes.admin_guard import require_admin


admin_auth_bp = Blueprint(
    "admin_auth_bp", __name__, url_prefix="/api/admin/auth"
)

# ======================================================
# CONFIG
# ======================================================
ADMIN_JWT_EXP_MIN = 1800        # 3 hours
OTP_EXP_MIN = 5               # minutes
OTP_RATE_LIMIT_SEC = 60       # seconds


# ======================================================
# TIME (UTC — AWARE)
# ======================================================
def now_utc():
    return datetime.now(timezone.utc)


def create_admin_token(admin):
    jwt_secret = current_app.config.get(
        "ADMIN_JWT_SECRET", "MAHAL_ADMIN_SECRET_2025"
    )

    payload = {
        "admin_id": admin["admin_id"],
        "exp": now_utc() + timedelta(minutes=ADMIN_JWT_EXP_MIN),
    }

    token = jwt.encode(payload, jwt_secret, algorithm="HS256")

    if isinstance(token, bytes):
        token = token.decode("utf-8")

    return token.strip().strip('"')


# ======================================================
# EMAIL
# ======================================================
def send_admin_otp_email(to_email, otp):
    msg = MIMEText(
        f"""
Your Admin One-Time Password (OTP) is:

{otp}

This OTP is valid for {OTP_EXP_MIN} minutes.

If this wasn't you, contact system security immediately.
"""
    )
    msg["Subject"] = "Admin Login OTP"
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
# SEND OTP
# ======================================================
@admin_auth_bp.route("/send-otp", methods=["POST"])
def send_admin_otp():
    email = (request.json or {}).get("email", "").lower().strip()

    if not email:
        return jsonify({"error": "Email required"}), 400

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT au.admin_id
            FROM admin_users au
            WHERE LOWER(au.email) = %s
              AND au.is_active = true
        """, (email,))
        admin = cur.fetchone()

        if not admin:
            return jsonify({"error": "Admin account not found or inactive"}), 401

        cur.execute("""
            SELECT created_at
            FROM admin_email_otp
            WHERE email = %s
        """, (email,))
        prev = cur.fetchone()

        if prev:
            elapsed = (now_utc() - prev["created_at"]).total_seconds()
            if elapsed < OTP_RATE_LIMIT_SEC:
                return jsonify({"error": "Please wait before requesting another OTP"}), 429

        otp = str(random.randint(100000, 999999))
        expires_at = now_utc() + timedelta(minutes=OTP_EXP_MIN)

        cur.execute("""
            INSERT INTO admin_email_otp (email, otp_code, expires_at, created_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (email)
            DO UPDATE SET
                otp_code = EXCLUDED.otp_code,
                expires_at = EXCLUDED.expires_at,
                created_at = EXCLUDED.created_at
        """, (email, otp, expires_at, now_utc()))

        conn.commit()
        send_admin_otp_email(email, otp)

        return jsonify({"message": "OTP sent"}), 200

    except Exception as e:
        print("❌ admin send_otp error:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ======================================================
# VERIFY OTP → ISSUE TOKEN + SESSION
# ======================================================
@admin_auth_bp.route("/verify-otp", methods=["POST"])
def verify_admin_otp():
    data = request.json or {}
    email = (data.get("email") or "").lower().strip()
    otp = (data.get("otp") or "").strip()

    if not email or not otp:
        return jsonify({"error": "Email & OTP required"}), 400

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Pre-fetch admin_id (used for failed audits)
        cur.execute("""
            SELECT admin_id
            FROM admin_users
            WHERE LOWER(email) = %s
        """, (email,))
        admin_row = cur.fetchone()
        admin_id = admin_row["admin_id"] if admin_row else None

        cur.execute("""
            SELECT otp_code, expires_at
            FROM admin_email_otp
            WHERE email = %s
        """, (email,))
        rec = cur.fetchone()

        if not rec or rec["otp_code"] != otp:
            log_admin_action(
                admin_id=admin_id,
                action="ADMIN_LOGIN_FAILED",
                entity_type="admin",
                entity_id=admin_id,
                old_value={"email": email},
                new_value={"reason": "INVALID_OTP"},
                ip_address=request.remote_addr
            )
            return jsonify({"error": "Invalid OTP"}), 401

        if rec["expires_at"] < now_utc():
            cur.execute(
                "DELETE FROM admin_email_otp WHERE email = %s",
                (email,)
            )
            conn.commit()

            log_admin_action(
                admin_id=admin_id,
                action="ADMIN_LOGIN_FAILED",
                entity_type="admin",
                entity_id=admin_id,
                old_value={"email": email},
                new_value={"reason": "OTP_EXPIRED"},
                ip_address=request.remote_addr
            )
            return jsonify({"error": "OTP expired"}), 401

        cur.execute("""
            SELECT au.admin_id, ar.role_name
            FROM admin_users au
            JOIN admin_roles ar ON ar.role_id = au.role_id
            WHERE LOWER(au.email) = %s
              AND au.is_active = true
        """, (email,))
        admin = cur.fetchone()

        if not admin:
            return jsonify({"error": "Unauthorized"}), 403

        # 🔐 ROTATE OLD SESSIONS
        cur.execute(
            "DELETE FROM admin_sessions WHERE admin_id = %s",
            (admin["admin_id"],)
        )

        token = create_admin_token(admin)
        expires_at = now_utc() + timedelta(minutes=ADMIN_JWT_EXP_MIN)

        cur.execute("""
            INSERT INTO admin_sessions
            (admin_id, token, expires_at, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            admin["admin_id"],
            token,
            expires_at,
            request.remote_addr,
            request.headers.get("User-Agent")
        ))

        cur.execute(
            "DELETE FROM admin_email_otp WHERE email = %s",
            (email,)
        )

        cur.execute("""
            UPDATE admin_users
            SET last_login_at = %s
            WHERE admin_id = %s
        """, (now_utc(), admin["admin_id"]))

        conn.commit()

        log_admin_action(
            admin_id=admin["admin_id"],
            action="ADMIN_LOGIN",
            entity_type="admin",
            entity_id=admin["admin_id"],
            ip_address=request.remote_addr
        )

# LOAD PERMISSIONS HERE (before returning)
        cur.execute("""
            SELECT p.permission_code
            FROM admin_role_permissions rp
            JOIN admin_permissions p 
                ON p.permission_id = rp.permission_id
            WHERE rp.role_id = (
                SELECT role_id FROM admin_users WHERE admin_id = %s
            )
        """, (admin["admin_id"],))

        perm_rows = cur.fetchall()
        permissions = [r["permission_code"] for r in perm_rows]

        return jsonify({
            "message": "Admin login successful",
            "admin_token": token,
            "admin_id": admin["admin_id"],
            "admin_role": admin["role_name"],   # <-- CONSISTENT KEY
            "admin_permissions": permissions
        }), 200



    except Exception as e:
        print("❌ admin verify_otp error:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# ======================================================
# LOGOUT
# ======================================================
@admin_auth_bp.route("/logout", methods=["POST"])
@require_admin()
def admin_logout():
    token = (
        request.headers.get("Authorization", "")
        .replace("Bearer ", "")
        .strip()
    )

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        log_admin_action(
            admin_id=g.admin["admin_id"],
            action="ADMIN_LOGOUT",
            entity_type="admin",
            entity_id=g.admin["admin_id"],
            ip_address=request.remote_addr
        )

        cur.execute(
            "DELETE FROM admin_sessions WHERE token = %s",
            (token,)
        )
        conn.commit()

        return jsonify({"message": "Logged out successfully"}), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
@admin_auth_bp.route("/me", methods=["GET"])
@require_admin()
def get_current_admin():
    return jsonify({
        "admin_id": g.admin["admin_id"],
        "role": g.admin["role"],
        "permissions": g.admin["permissions"],
    }), 200