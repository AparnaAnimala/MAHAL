# from flask import Blueprint, request, jsonify, current_app, send_file
# from werkzeug.utils import secure_filename
# from flask_mail import Message
# from datetime import datetime, timedelta
# from psycopg2.extras import RealDictCursor
# import base64
# import json
# import re
# import random
# import io
# import traceback

# from db import get_db_connection
# from app import mail

# supplier_bp = Blueprint("supplier_bp", __name__)

# # -------------------------------------------------
# # CONFIG
# # -------------------------------------------------
# ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp"}

# # Maps Frontend keys to Database columns
# SUPPLIER_FILE_MAP = {
#     "tradeLicense": "upload_trade_license_copy",
#     "vatCertificate": "upload_vat_certificates_copy",
#     "computerCardCopy": "upload_computer_card_copy",
#     "crCopy": "upload_cr_company",
# }

# RESTAURANT_FILE_MAP = {
#     "tradeLicense": "upload_trade_license_copy",
#     "vatCertificate": "upload_vat_certificate_copy",  
#     "foodSafetyCertificate": "upload_food_safety_certificate",
# }

# def allowed_file(filename):
#     if not filename:
#         return False
#     ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
#     return ext in ALLOWED_EXTENSIONS

# EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

# def is_valid_email(email):
#     return email and re.match(EMAIL_REGEX, email)

# def format_phone(phone):
#     """
#     Cleans phone number while preserving the '+' for country codes.
#     Removes spaces, dashes, and brackets.
#     """
#     if not phone:
#         return "" 
#     return re.sub(r"[^\d+]", "", phone)


# # -------------------------------------------------
# # EMAIL HELPERS
# # -------------------------------------------------
# def send_user_email(name, email, role, entity_id, company_name):
#     try:
#         if not is_valid_email(email):
#             return
#         with current_app.app_context():
#             msg = Message(f"Mahal {role} Registration Successful", recipients=[email])
#             msg.body = f"Hello {name},\n\nYour {role.lower()} registration is successful.\n\nID: {entity_id}\nName: {company_name}\nRole: {role}\n\nStatus: Pending Approval\n\nMahal Team"
#             mail.send(msg)
#     except Exception as e:
#         print("❌ user mail error:", e)

# def send_admin_email(role, company_name, contact_name, phone, email, entity_id):
#     try:
#         admin_email = current_app.config.get("ADMIN_EMAIL")
#         if not admin_email: return
#         with current_app.app_context():
#             msg = Message(f"New {role} Registration Pending Approval", recipients=[admin_email])
#             msg.body = f"New {role.lower()} registered.\n\nID: {entity_id}\nName: {company_name}\nContact Person: {contact_name}\nPhone: {phone}\nEmail: {email}\n\nReview in admin panel."
#             mail.send(msg)
#     except Exception as e:
#         print("❌ admin mail error:", e)

# # -------------------------------------------------
# # ROUTES
# # -------------------------------------------------
# @supplier_bp.route("/master/<string:category>", methods=["GET"])
# def get_master_values(category):
#     """
#     Fetch values from general_master by category
#     Example:
#       /api/suppliers/master/country
#       /api/suppliers/master/city
#     """
#     conn = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor(cursor_factory=RealDictCursor)

#         cur.execute(
#             "SELECT value FROM general_master WHERE category = %s ORDER BY value ASC",
#             (category,)
#         )

#         rows = cur.fetchall()
#         values = [row["value"] for row in rows if row.get("value")]

#         return jsonify({
#             "status": True,
#             "data": values
#         }), 200

#     except Exception:
#         traceback.print_exc()
#         return jsonify({
#             "status": False,
#             "message": "Server error"
#         }), 500

#     finally:
#         if conn:
#             conn.close()


# @supplier_bp.route("/register-supplier", methods=["POST"])
# def register_supplier_route():
#     return register_supplier(request.form, request.files)

# @supplier_bp.route("/register-restaurant", methods=["POST"])
# def register_restaurant_route():
#     return register_restaurant(request.form, request.files)

# # -------------------------------------------------
# # SUPPLIER LOGIC
# # -------------------------------------------------
# # -------------------------------------------------
# # REFINED SUPPLIER LOGIC
# # -------------------------------------------------
# def register_supplier(form, files):
#     conn = cur = None
#     try:
#         email = (form.get("email") or "").strip().lower()
#         if not is_valid_email(email):
#             return jsonify({"error": "Invalid email address"}), 400

#         uploads = {}
#         # Ensure we only look for the 4 specific supplier files
#         for frontend_field, db_field in SUPPLIER_FILE_MAP.items():
#             file = files.get(frontend_field)
            
#             if not file or file.filename == '':
#                 return jsonify({"error": f"Document {frontend_field} is required"}), 400
                
#             if not allowed_file(file.filename):
#                 return jsonify({"error": f"Invalid file type for {frontend_field}"}), 400
            
#             # Read file and encode to base64
#             file_data = file.read()
#             uploads[db_field] = json.dumps({
#                 "filename": secure_filename(file.filename),
#                 "mimetype": file.mimetype,
#                 "content": base64.b64encode(file_data).decode('utf-8')
#             })

#         # Final check: do we have all 4 columns?
#         if len(uploads) < 4:
#             return jsonify({"error": "Missing one or more required supplier documents"}), 400

#         data = {
#             "company_name_english": form.get("companyName"),
#             "contact_person_name": form.get("fullName"),
#             "contact_person_mobile": format_phone(form.get("phoneNumber")),
#             "contact_person_email": email,
#             "company_email": email,
#             "country": form.get("country"),
#             "city": form.get("city"),
#             **uploads
#         }

#         conn = get_db_connection()
#         cur = conn.cursor()
#         cur.execute("""
#             INSERT INTO supplier_registration (
#                 company_name_english, contact_person_name, contact_person_mobile,
#                 contact_person_email, company_email, country,city,
#                 upload_trade_license_copy, upload_vat_certificates_copy,
#                 upload_computer_card_copy, upload_cr_company,
#                 approval_status, created_at, updated_at, is_first_login
#             ) VALUES (
#                 %(company_name_english)s, %(contact_person_name)s, %(contact_person_mobile)s,
#                 %(contact_person_email)s, %(company_email)s, %(country)s,%(city)s,
#                 %(upload_trade_license_copy)s, %(upload_vat_certificates_copy)s,
#                 %(upload_computer_card_copy)s, %(upload_cr_company)s,
#                 'Pending', NOW(), NOW(), TRUE
#             ) RETURNING supplier_id
#         """, data)

#         supplier_id = cur.fetchone()["supplier_id"]
#         conn.commit()

#         # Send Notifications
#         send_user_email(data["contact_person_name"], email, "Supplier", supplier_id, data["company_name_english"])
#         send_admin_email("Supplier", data["company_name_english"], data["contact_person_name"], data["contact_person_mobile"], email, supplier_id)

#         return jsonify({"success": True, "supplier_id": supplier_id}), 201

#     except Exception as e:
#         if conn: conn.rollback()
#         print(f"❌ REGISTER SUPPLIER ERROR: {str(e)}")
#         return jsonify({"error": "Database or Server error occurred"}), 500
#     finally:
#         if cur: cur.close()
#         if conn: conn.close()

# # -------------------------------------------------
# # RESTAURANT LOGIC
# # -------------------------------------------------
# def register_restaurant(form, files):
#     conn = cur = None
#     try:
#         email = (form.get("email") or "").strip().lower()
#         if not is_valid_email(email):
#             return jsonify({"error": "Invalid email address"}), 400

#         uploads = {}
#         for frontend_field, db_field in RESTAURANT_FILE_MAP.items():
#             file = files.get(frontend_field)
#             if not file: continue
#             if not allowed_file(file.filename):
#                 return jsonify({"error": f"Invalid file type for {frontend_field}"}), 400
            
#             uploads[db_field] = json.dumps({
#                 "filename": secure_filename(file.filename),
#                 "mimetype": file.mimetype,
#                 "content": base64.b64encode(file.read()).decode()
#             })

#         # Ensure all 3 required files are present
#         missing = [f for f in RESTAURANT_FILE_MAP.values() if f not in uploads]
#         if missing:
#             return jsonify({"error": f"Missing required files: {missing}"}), 400

#         data = {
#             "restaurant_name_english": form.get("companyName"),
#             "contact_person_name": form.get("fullName"),
#             "contact_person_mobile": format_phone(form.get("phoneNumber")), # Preserves +CountryCode
#             "contact_person_email": email,
#             "restaurant_email_address": email,
#             "country": form.get("country"),
#             "city": form.get("city"), 
#             "approval_status": "Pending",
#             **uploads
#         }

#         conn = get_db_connection()
#         cur = conn.cursor()
#         cur.execute("""
#             INSERT INTO restaurant_registration (
#                 restaurant_name_english, contact_person_name, contact_person_mobile,
#                 contact_person_email, restaurant_email_address, country,city,
#                 upload_trade_license_copy, upload_vat_certificate_copy,
#                 upload_food_safety_certificate, approval_status,
#                 created_at, updated_at
#             ) VALUES (
#                 %(restaurant_name_english)s, %(contact_person_name)s, %(contact_person_mobile)s,
#                 %(contact_person_email)s, %(restaurant_email_address)s, %(country)s,%(city)s,
#                 %(upload_trade_license_copy)s, %(upload_vat_certificate_copy)s,
#                 %(upload_food_safety_certificate)s, %(approval_status)s,
#                 NOW(), NOW()
#             ) RETURNING restaurant_id
#         """, data)

#         restaurant_id = cur.fetchone()["restaurant_id"]
#         conn.commit()

#         send_user_email(data["contact_person_name"], email, "Restaurant", restaurant_id, data["restaurant_name_english"])
#         send_admin_email("Restaurant", data["restaurant_name_english"], data["contact_person_name"], data["contact_person_mobile"], email, restaurant_id)

#         return jsonify({"status": "success", "restaurant_id": restaurant_id}), 201
#     except Exception as e:
#         if conn: conn.rollback()
#         print("❌ register_restaurant error:", e)
#         return jsonify({"error": "server error"}), 500
#     finally:
#         if cur: cur.close()
#         if conn: conn.close()

# # -------------------------------------------------
# # OTP SYSTEM (UNCHANGED)
# # -------------------------------------------------
# @supplier_bp.route("/send-otp", methods=["POST"])
# def send_otp():
#     data = request.json or {}
#     email = data.get("email", "").strip().lower()
#     if not email or not re.match(EMAIL_REGEX, email):
#         return jsonify({"error": "valid email required"}), 400

#     otp = f"{random.randint(0, 999999):06d}"
#     exp = datetime.utcnow() + timedelta(minutes=10)

#     conn = cur = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor()
#         cur.execute("DELETE FROM supplier_email_otp WHERE expires_at < NOW()")
#         cur.execute("""
#             INSERT INTO supplier_email_otp (email, otp_code, expires_at)
#             VALUES (%s, %s, %s)
#             ON CONFLICT (email) DO UPDATE SET
#                 otp_code = EXCLUDED.otp_code,
#                 expires_at = EXCLUDED.expires_at
#         """, (email, otp, exp))
#         conn.commit()

#         msg = Message("Mahal OTP Verification", recipients=[email])
#         msg.body = f"Your OTP is {otp}. It expires in 10 minutes."
#         mail.send(msg)
#         return jsonify({"message": "OTP sent"}), 200
#     except Exception as e:
#         if conn: conn.rollback()
#         return jsonify({"error": "server error"}), 500
#     finally:
#         if cur: cur.close()
#         if conn: conn.close()

# @supplier_bp.route("/verify-otp", methods=["POST"])
# def verify_otp():
#     data = request.json or {}
#     email = data.get("email", "").strip().lower()
#     otp = str(data.get("otp", "")).strip()
#     if not email or not otp:
#         return jsonify({"error": "email and otp required"}), 400

#     conn = cur = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor()
#         cur.execute("SELECT otp_code, expires_at FROM supplier_email_otp WHERE email=%s", (email,))
#         row = cur.fetchone()

#         if not row: return jsonify({"error": "otp not found"}), 400
#         if row["expires_at"] < datetime.utcnow():
#             cur.execute("DELETE FROM supplier_email_otp WHERE email=%s", (email,))
#             conn.commit()
#             return jsonify({"error": "otp expired"}), 400
#         if str(row["otp_code"]) != otp:
#             return jsonify({"error": "invalid otp"}), 400

#         cur.execute("DELETE FROM supplier_email_otp WHERE email=%s", (email,))
#         conn.commit()
#         return jsonify({"message": "OTP verified"}), 200
#     except Exception as e:
#         if conn: conn.rollback()
#         return jsonify({"error": "server error"}), 500
#     finally:
#         if cur: cur.close()
#         if conn: conn.close()

# from flask import Blueprint, request, jsonify, current_app, send_file
# from werkzeug.utils import secure_filename
# from flask_mail import Message
# from datetime import datetime, timedelta
# import base64
# import json
# import re
# import random
# import io
# import traceback
# from psycopg2.extras import RealDictCursor

# from db import get_db_connection
# from app import mail

# supplier_bp = Blueprint("supplier_bp", __name__)

# # -------------------------------------------------
# # CONFIG
# # -------------------------------------------------
# ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp"}

# # Maps Frontend keys to Database columns
# SUPPLIER_FILE_MAP = {
#     "tradeLicense": "upload_trade_license_copy",
#     "vatCertificate": "upload_vat_certificates_copy",
#     "computerCardCopy": "upload_computer_card_copy",
#     "crCopy": "upload_cr_company",
# }

# RESTAURANT_FILE_MAP = {
#     "tradeLicense": "upload_trade_license_copy",
#     "vatCertificate": "upload_vat_certificate_copy",  
#     "foodSafetyCertificate": "upload_food_safety_certificate",
# }

# def allowed_file(filename):
#     if not filename:
#         return False
#     ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
#     return ext in ALLOWED_EXTENSIONS

# EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

# def is_valid_email(email):
#     return email and re.match(EMAIL_REGEX, email)

# def format_phone(phone):
#     """
#     Cleans phone number while preserving the '+' for country codes.
#     Removes spaces, dashes, and brackets.
#     """
#     if not phone:
#         return ""
#     return re.sub(r"[^\d+]", "", phone)

# # -------------------------------------------------
# # EMAIL HELPERS
# # -------------------------------------------------
# def send_user_email(name, email, role, entity_id, company_name):
#     try:
#         if not is_valid_email(email):
#             return
#         with current_app.app_context():
#             msg = Message(f"Mahal {role} Registration Successful", recipients=[email])
#             msg.body = f"Hello {name},\n\nYour {role.lower()} registration is successful.\n\nID: {entity_id}\nName: {company_name}\nRole: {role}\n\nStatus: Pending Approval\n\nMahal Team"
#             mail.send(msg)
#     except Exception as e:
#         print("❌ user mail error:", e)

# def send_admin_email(role, company_name, contact_name, phone, email, entity_id):
#     try:
#         admin_email = current_app.config.get("ADMIN_EMAIL")
#         if not admin_email: return
#         with current_app.app_context():
#             msg = Message(f"New {role} Registration Pending Approval", recipients=[admin_email])
#             msg.body = f"New {role.lower()} registered.\n\nID: {entity_id}\nName: {company_name}\nContact Person: {contact_name}\nPhone: {phone}\nEmail: {email}\n\nReview in admin panel."
#             mail.send(msg)
#     except Exception as e:
#         print("❌ admin mail error:", e)

# # -------------------------------------------------
# # ROUTES
# # -------------------------------------------------
# @supplier_bp.route("/register-supplier", methods=["POST"])
# def register_supplier_route():
#     return register_supplier(request.form, request.files)

# @supplier_bp.route("/register-restaurant", methods=["POST"])
# def register_restaurant_route():
#     return register_restaurant(request.form, request.files)

# # -------------------------------------------------
# # SUPPLIER LOGIC
# # -------------------------------------------------
# # -------------------------------------------------
# # REFINED SUPPLIER LOGIC
# # -------------------------------------------------
# def register_supplier(form, files):
#     conn = cur = None
#     try:
#         email = (form.get("email") or "").strip().lower()
#         if not is_valid_email(email):
#             return jsonify({"error": "Invalid email address"}), 400

#         uploads = {}
#         # Ensure we only look for the 4 specific supplier files
#         for frontend_field, db_field in SUPPLIER_FILE_MAP.items():
#             file = files.get(frontend_field)
            
#             if not file or file.filename == '':
#                 return jsonify({"error": f"Document {frontend_field} is required"}), 400
                
#             if not allowed_file(file.filename):
#                 return jsonify({"error": f"Invalid file type for {frontend_field}"}), 400
            
#             # Read file and encode to base64
#             file_data = file.read()
#             uploads[db_field] = json.dumps({
#                 "filename": secure_filename(file.filename),
#                 "mimetype": file.mimetype,
#                 "content": base64.b64encode(file_data).decode('utf-8')
#             })

#         # Final check: do we have all 4 columns?
#         if len(uploads) < 4:
#             return jsonify({"error": "Missing one or more required supplier documents"}), 400

#         data = {
#             "company_name_english": form.get("companyName"),
#             "contact_person_name": form.get("fullName"),
#             "contact_person_mobile": format_phone(form.get("phoneNumber")),
#             "contact_person_email": email,
#             "company_email": email,
#             "country": form.get("country"),
#             "city": form.get("city"),   # ✅ ADD
#             **uploads
#         }

#         conn = get_db_connection()
#         cur = conn.cursor()
#         cur.execute("""
#             INSERT INTO supplier_registration (
#                 company_name_english, contact_person_name, contact_person_mobile,
#                 contact_person_email, company_email, country, city,
#                 upload_trade_license_copy, upload_vat_certificates_copy,
#                 upload_computer_card_copy, upload_cr_company,
#                 approval_status, created_at, updated_at, is_first_login
#             ) VALUES (
#                 %(company_name_english)s, %(contact_person_name)s, %(contact_person_mobile)s,
#                 %(contact_person_email)s, %(company_email)s, %(country)s,  %(city)s,
#                 %(upload_trade_license_copy)s, %(upload_vat_certificates_copy)s,
#                 %(upload_computer_card_copy)s, %(upload_cr_company)s,
#                 'Pending', NOW(), NOW(), TRUE
#             ) RETURNING supplier_id
#         """, data)

#         supplier_id = cur.fetchone()["supplier_id"]
#         conn.commit()

#         # Send Notifications
#         send_user_email(data["contact_person_name"], email, "Supplier", supplier_id, data["company_name_english"])
#         send_admin_email("Supplier", data["company_name_english"], data["contact_person_name"], data["contact_person_mobile"], email, supplier_id)

#         return jsonify({"success": True, "supplier_id": supplier_id}), 201

#     except Exception as e:
#         if conn: conn.rollback()
#         print(f"❌ REGISTER SUPPLIER ERROR: {str(e)}")
#         return jsonify({"error": "Database or Server error occurred"}), 500
#     finally:
#         if cur: cur.close()
#         if conn: conn.close()

# # -------------------------------------------------
# # RESTAURANT LOGIC
# # -------------------------------------------------
# def register_restaurant(form, files):
#     conn = cur = None
#     try:
#         email = (form.get("email") or "").strip().lower()
#         if not is_valid_email(email):
#             return jsonify({"error": "Invalid email address"}), 400

#         uploads = {}
#         for frontend_field, db_field in RESTAURANT_FILE_MAP.items():
#             file = files.get(frontend_field)
#             if not file: continue
#             if not allowed_file(file.filename):
#                 return jsonify({"error": f"Invalid file type for {frontend_field}"}), 400
            
#             uploads[db_field] = json.dumps({
#                 "filename": secure_filename(file.filename),
#                 "mimetype": file.mimetype,
#                 "content": base64.b64encode(file.read()).decode()
#             })

#         # Ensure all 3 required files are present
#         missing = [f for f in RESTAURANT_FILE_MAP.values() if f not in uploads]
#         if missing:
#             return jsonify({"error": f"Missing required files: {missing}"}), 400

#         data = {
#             "restaurant_name_english": form.get("companyName"),
#             "contact_person_name": form.get("fullName"),
#             "contact_person_mobile": format_phone(form.get("phoneNumber")), # Preserves +CountryCode
#             "contact_person_email": email,
#             "restaurant_email_address": email,
#             "country": form.get("country"),
#             "city": form.get("city"),   # ✅ ADD
#             "approval_status": "Pending",
#             **uploads
#         }

#         conn = get_db_connection()
#         cur = conn.cursor()
#         cur.execute("""
#             INSERT INTO restaurant_registration (
#                 restaurant_name_english, contact_person_name, contact_person_mobile,
#                 contact_person_email, restaurant_email_address, country, city,
#                 upload_trade_license_copy, upload_vat_certificate_copy,
#                 upload_food_safety_certificate, approval_status,
#                 created_at, updated_at
#             ) VALUES (
#                 %(restaurant_name_english)s, %(contact_person_name)s, %(contact_person_mobile)s,
#                 %(contact_person_email)s, %(restaurant_email_address)s, %(country)s, %(city)s,
#                 %(upload_trade_license_copy)s, %(upload_vat_certificate_copy)s,
#                 %(upload_food_safety_certificate)s, %(approval_status)s,
#                 NOW(), NOW()
#             ) RETURNING restaurant_id
#         """, data)

#         restaurant_id = cur.fetchone()["restaurant_id"]
#         conn.commit()

#         send_user_email(data["contact_person_name"], email, "Restaurant", restaurant_id, data["restaurant_name_english"])
#         send_admin_email("Restaurant", data["restaurant_name_english"], data["contact_person_name"], data["contact_person_mobile"], email, restaurant_id)

#         return jsonify({"status": "success", "restaurant_id": restaurant_id}), 201
#     except Exception as e:
#         if conn: conn.rollback()
#         print("❌ register_restaurant error:", e)
#         return jsonify({"error": "server error"}), 500
#     finally:
#         if cur: cur.close()
#         if conn: conn.close()

# # -------------------------------------------------
# # OTP SYSTEM (UNCHANGED)
# # -------------------------------------------------
# @supplier_bp.route("/send-otp", methods=["POST"])
# def send_otp():
#     data = request.json or {}
#     email = data.get("email", "").strip().lower()
#     if not email or not re.match(EMAIL_REGEX, email):
#         return jsonify({"error": "valid email required"}), 400

#     otp = f"{random.randint(0, 999999):06d}"
#     exp = datetime.utcnow() + timedelta(minutes=10)

#     conn = cur = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor()
#         cur.execute("DELETE FROM supplier_email_otp WHERE expires_at < NOW()")
#         cur.execute("""
#             INSERT INTO supplier_email_otp (email, otp_code, expires_at)
#             VALUES (%s, %s, %s)
#             ON CONFLICT (email) DO UPDATE SET
#                 otp_code = EXCLUDED.otp_code,
#                 expires_at = EXCLUDED.expires_at
#         """, (email, otp, exp))
#         conn.commit()

#         msg = Message("Mahal OTP Verification", recipients=[email])
#         msg.body = f"Your OTP is {otp}. It expires in 10 minutes."
#         mail.send(msg)
#         return jsonify({"message": "OTP sent"}), 200
#     except Exception as e:
#         if conn: conn.rollback()
#         return jsonify({"error": "server error"}), 500
#     finally:
#         if cur: cur.close()
#         if conn: conn.close()

# @supplier_bp.route("/verify-otp", methods=["POST"])
# def verify_otp():
#     data = request.json or {}
#     email = data.get("email", "").strip().lower()
#     otp = str(data.get("otp", "")).strip()
#     if not email or not otp:
#         return jsonify({"error": "email and otp required"}), 400

#     conn = cur = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor()
#         cur.execute("SELECT otp_code, expires_at FROM supplier_email_otp WHERE email=%s", (email,))
#         row = cur.fetchone()

#         if not row: return jsonify({"error": "otp not found"}), 400
#         if row["expires_at"] < datetime.utcnow():
#             cur.execute("DELETE FROM supplier_email_otp WHERE email=%s", (email,))
#             conn.commit()
#             return jsonify({"error": "otp expired"}), 400
#         if str(row["otp_code"]) != otp:
#             return jsonify({"error": "invalid otp"}), 400

#         cur.execute("DELETE FROM supplier_email_otp WHERE email=%s", (email,))
#         conn.commit()
#         return jsonify({"message": "OTP verified"}), 200
#     except Exception as e:
#         if conn: conn.rollback()
#         return jsonify({"error": "server error"}), 500
#     finally:
#         if cur: cur.close()
#         if conn: conn.close()

# @supplier_bp.route("/master/<string:category>", methods=["GET"])
# def get_master_values(category):
#     """
#     Fetch values from general_master by category
#     Example:
#       /api/suppliers/master/country
#       /api/suppliers/master/city
#     """
#     conn = None
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor(cursor_factory=RealDictCursor)

#         cur.execute(
#             "SELECT value FROM general_master WHERE category = %s ORDER BY value ASC",
#             (category,)
#         )

#         rows = cur.fetchall()
#         values = [row["value"] for row in rows if row.get("value")]

#         return jsonify({
#             "status": True,
#             "data": values
#         }), 200

#     except Exception:
#         traceback.print_exc()
#         return jsonify({
#             "status": False,
#             "message": "Server error"
#         }), 500

#     finally:
#         if conn:
#             conn.close()






from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename
from flask_mail import Message
from datetime import datetime, timedelta
import base64
import json
import re
import random
import io
import traceback
from psycopg2.extras import RealDictCursor

from db import get_db_connection
from app import mail

supplier_bp = Blueprint("supplier_bp", __name__)

# -------------------------------------------------
# CONFIG
# -------------------------------------------------
ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp"}

SUPPLIER_FILE_MAP = {
    "tradeLicense": "upload_trade_license_copy",
    "vatCertificate": "upload_vat_certificates_copy",
    "computerCardCopy": "upload_computer_card_copy",
    "crCopy": "upload_cr_company",
    "upload_company_logo": "upload_company_logo",
}

RESTAURANT_FILE_MAP = {
    "tradeLicense": "upload_trade_license_copy",
    "vatCertificate": "upload_vat_certificate_copy",
    "foodSafetyCertificate": "upload_food_safety_certificate",
    "upload_company_logo": "upload_company_logo",
}

def allowed_file(filename):
    if not filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
    return ext in ALLOWED_EXTENSIONS

def convert_file_to_base64(file):
    if not file or file.filename == "":
        return None

    if not allowed_file(file.filename):
        return None

    file_bytes = file.read()

    encoded = base64.b64encode(file_bytes).decode("utf-8")

    mime = file.mimetype

    return f"data:{mime};base64,{encoded}"



EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

def is_valid_email(email):
    return email and re.match(EMAIL_REGEX, email)

def format_phone(phone):
    """
    Cleans phone number while preserving the '+' for country codes.
    Removes spaces, dashes, and brackets.
    """
    if not phone:
        return ""
    return re.sub(r"[^\d+]", "", phone)

# -------------------------------------------------
# EMAIL HELPERS
# -------------------------------------------------
def send_user_email(name, email, role, entity_id, company_name):
    try:
        if not is_valid_email(email):
            return
        with current_app.app_context():
            msg = Message(f"Mahal {role} Registration Successful", recipients=[email])
            msg.body = f"Hello {name},\n\nYour {role.lower()} registration is successful.\n\nID: {entity_id}\nName: {company_name}\nRole: {role}\n\nStatus: Pending Approval\n\nMahal Team"
            mail.send(msg)
    except Exception as e:
        print("❌ user mail error:", e)

def send_admin_email(role, company_name, contact_name, phone, email, entity_id):
    try:
        admin_email = current_app.config.get("ADMIN_EMAIL")
        if not admin_email: return
        with current_app.app_context():
            msg = Message(f"New {role} Registration Pending Approval", recipients=[admin_email])
            msg.body = f"New {role.lower()} registered.\n\nID: {entity_id}\nName: {company_name}\nContact Person: {contact_name}\nPhone: {phone}\nEmail: {email}\n\nReview in admin panel."
            mail.send(msg)
    except Exception as e:
        print("❌ admin mail error:", e)

# -------------------------------------------------
# ROUTES
# -------------------------------------------------
@supplier_bp.route("/register-supplier", methods=["POST"])
def register_supplier_route():
    return register_supplier(request.form, request.files)

@supplier_bp.route("/register-restaurant", methods=["POST"])
def register_restaurant_route():
    return register_restaurant(request.form, request.files)

# -------------------------------------------------
# SUPPLIER LOGIC
# -------------------------------------------------
# -------------------------------------------------
# REFINED SUPPLIER LOGIC
# -------------------------------------------------
def register_supplier(form, files):
    conn = cur = None
    try:
        email = (form.get("email") or "").strip().lower()
        if not is_valid_email(email):
            return jsonify({"error": "Invalid email address"}), 400

        data = {
            "company_name_english": form.get("companyName"),
            "contact_person_name": form.get("fullName"),
            "contact_person_mobile": format_phone(form.get("phoneNumber")),
            "contact_person_email": email,
            "company_email": email,
            "country": form.get("country"),
            "city": form.get("city"),

            # FILES
            "upload_trade_license_copy":
                convert_file_to_base64(files.get("tradeLicense")),

            "upload_vat_certificates_copy":
                convert_file_to_base64(files.get("vatCertificate")),

            "upload_computer_card_copy":
                convert_file_to_base64(files.get("computerCardCopy")),

            "upload_cr_company":
                convert_file_to_base64(files.get("crCopy")),

            "upload_company_logo":
                convert_file_to_base64(files.get("upload_company_logo")),
        }

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            INSERT INTO supplier_registration (
                company_name_english,
                contact_person_name,
                contact_person_mobile,
                contact_person_email,
                company_email,
                country,
                city,
                upload_trade_license_copy,
                upload_vat_certificates_copy,
                upload_computer_card_copy,
                upload_cr_company,
                upload_company_logo,    
                approval_status,
                created_at,
                updated_at,
                is_first_login
            ) VALUES (
                %(company_name_english)s,
                %(contact_person_name)s,
                %(contact_person_mobile)s,
                %(contact_person_email)s,
                %(company_email)s,
                %(country)s,
                %(city)s,
                %(upload_trade_license_copy)s,
                %(upload_vat_certificates_copy)s,
                %(upload_computer_card_copy)s,
                %(upload_cr_company)s,
                %(upload_company_logo)s,    
                'Pending',
                NOW(),
                NOW(),
                TRUE
            ) RETURNING supplier_id
        """, data)

        supplier_id = cur.fetchone()["supplier_id"]
        conn.commit()

        send_user_email(
            data["contact_person_name"],
            email,
            "Supplier",
            supplier_id,
            data["company_name_english"]
        )

        send_admin_email(
            "Supplier",
            data["company_name_english"],
            data["contact_person_name"],
            data["contact_person_mobile"],
            email,
            supplier_id
        )

        return jsonify({
            "success": True,
            "supplier_id": supplier_id
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        print("❌ REGISTER SUPPLIER ERROR:", e)
        return jsonify({"error": "Database error"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# -------------------------------------------------
# RESTAURANT LOGIC
# -------------------------------------------------
# -------------------------------------------------
# RESTAURANT LOGIC (FILES OPTIONAL)
# -------------------------------------------------
def register_restaurant(form, files):
    conn = cur = None
    try:
        email = (form.get("email") or "").strip().lower()
        if not is_valid_email(email):
            return jsonify({"error": "Invalid email address"}), 400

        data = {
            "restaurant_name_english": form.get("companyName"),
            "contact_person_name": form.get("fullName"),
            "contact_person_mobile": format_phone(form.get("phoneNumber")),
            "contact_person_email": email,
            "country": form.get("country"),
            "city": form.get("city"),
            "approval_status": "Pending",

            # FILES
            "upload_trade_license_copy":
                convert_file_to_base64(files.get("tradeLicense")),

            "upload_vat_certificate_copy":
                convert_file_to_base64(files.get("vatCertificate")),

            "upload_food_safety_certificate":
                convert_file_to_base64(files.get("foodSafetyCertificate")),

            "upload_company_logo":
                convert_file_to_base64(files.get("upload_company_logo")),
        }
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            INSERT INTO restaurant_registration (
                restaurant_name_english,
                contact_person_name,
                contact_person_mobile,
                contact_person_email,
                country,
                city,
                upload_trade_license_copy,
                upload_vat_certificate_copy,
                upload_food_safety_certificate,
                upload_company_logo,
                approval_status,
                created_at,
                updated_at
            ) VALUES (
                %(restaurant_name_english)s,
                %(contact_person_name)s,
                %(contact_person_mobile)s,
                %(contact_person_email)s,
                %(country)s,
                %(city)s,
                %(upload_trade_license_copy)s,
                %(upload_vat_certificate_copy)s,
                %(upload_food_safety_certificate)s,
                %(upload_company_logo)s,
                %(approval_status)s,
                NOW(),
                NOW()
            ) RETURNING restaurant_id
        """, data)

        restaurant_id = cur.fetchone()["restaurant_id"]
        conn.commit()

        send_user_email(
            data["contact_person_name"],
            email,
            "Restaurant",
            restaurant_id,
            data["restaurant_name_english"]
        )

        send_admin_email(
            "Restaurant",
            data["restaurant_name_english"],
            data["contact_person_name"],
            data["contact_person_mobile"],
            email,
            restaurant_id
        )

        return jsonify({
            "status": "success",
            "restaurant_id": restaurant_id
        }), 201

    except Exception as e:
        if conn:
            conn.rollback()
        print("❌ register_restaurant error:", e)
        return jsonify({"error": "server error"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

# -------------------------------------------------
# OTP SYSTEM (UNCHANGED)
# -------------------------------------------------
@supplier_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "valid email required"}), 400

    otp = f"{random.randint(0, 999999):06d}"
    exp = datetime.utcnow() + timedelta(minutes=10)

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM supplier_email_otp WHERE expires_at < NOW()")
        cur.execute("""
            INSERT INTO supplier_email_otp (email, otp_code, expires_at)
            VALUES (%s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET
                otp_code = EXCLUDED.otp_code,
                expires_at = EXCLUDED.expires_at
        """, (email, otp, exp))
        conn.commit()

        msg = Message("Mahal OTP Verification", recipients=[email])
        msg.body = f"Your OTP is {otp}. It expires in 10 minutes."
        mail.send(msg)
        return jsonify({"message": "OTP sent"}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": "server error"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()

@supplier_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    otp = str(data.get("otp", "")).strip()
    if not email or not otp:
        return jsonify({"error": "email and otp required"}), 400

    conn = cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT otp_code, expires_at FROM supplier_email_otp WHERE email=%s", (email,))
        row = cur.fetchone()

        if not row: return jsonify({"error": "otp not found"}), 400
        if row["expires_at"] < datetime.utcnow():
            cur.execute("DELETE FROM supplier_email_otp WHERE email=%s", (email,))
            conn.commit()
            return jsonify({"error": "otp expired"}), 400
        if str(row["otp_code"]) != otp:
            return jsonify({"error": "invalid otp"}), 400

        cur.execute("DELETE FROM supplier_email_otp WHERE email=%s", (email,))
        conn.commit()
        return jsonify({"message": "OTP verified"}), 200
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({"error": "server error"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()


@supplier_bp.route("/master/<string:category>", methods=["GET"])
def get_master_values(category):

    conn = None

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        country = request.args.get("country")

        # CITY WITH COUNTRY FILTER
        if category.lower() == "city" and country:

            cur.execute("""
                SELECT value
                FROM general_master
                WHERE category = %s
                AND unit = %s
                ORDER BY value ASC
            """, ("city", country))

        else:

            cur.execute("""
                SELECT value, unit
                FROM general_master
                WHERE category = %s
                ORDER BY value ASC
            """, (category,))

        rows = cur.fetchall()

        return jsonify(rows), 200

    except Exception as e:
        traceback.print_exc()

        return jsonify({
            "status": False,
            "message": "Server error"
        }), 500

    finally:
        if conn:
            conn.close()

# @supplier_bp.route("/master/<string:category>", methods=["GET"])
# def get_master_values(category):
    """
    Fetch values from general_master by category
    Example:
      /api/suppliers/master/country
      /api/suppliers/master/city
    """
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute(
            "SELECT value FROM general_master WHERE category = %s ORDER BY value ASC",
            (category,)
        )

        rows = cur.fetchall()
        values = [row["value"] for row in rows if row.get("value")]

        return jsonify({
            "status": True,
            "data": values
        }), 200

    except Exception:
        traceback.print_exc()
        return jsonify({
            "status": False,
            "message": "Server error"
        }), 500

    finally:
        if conn:
            conn.close()