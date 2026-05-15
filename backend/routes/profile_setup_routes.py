from flask import Blueprint, jsonify, request, abort
from db import get_db_connection
import traceback
import base64
from psycopg2 import Binary
from deep_translator import GoogleTranslator
import json, io
from flask import send_file
import re
from psycopg2.extras import RealDictCursor
from psycopg2 import errors
import jwt

# ======================================================
# ✅ AUTH LAYER (FIXED — MATCHES YOUR LOGIN BACKEND)
# ======================================================

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"  

def decode_jwt(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        abort(401, "Token expired")
    except jwt.InvalidTokenError:
        abort(401, "Invalid token")

def get_current_user():
    auth = request.headers.get("Authorization")

    if not auth or not auth.startswith("Bearer "):
        abort(401, "Missing or malformed Authorization header")

    token = auth.replace("Bearer ", "").strip()
    payload = decode_jwt(token)

    role = payload.get("role")
    linked_id = payload.get("linked_id")

    if role not in ("supplier", "restaurant"):
        abort(403, "Invalid role for profile routes")

    if not linked_id:
        abort(403, "Missing linked_id in token")

    return {
        "role": role,
        "supplier_id": linked_id if role == "supplier" else None,
        "restaurant_id": linked_id if role == "restaurant" else None,
        "user_id": payload.get("user_id"),
        "username": payload.get("username"),
    }

# ======================================================
# END AUTH FIX — EVERYTHING BELOW IS YOUR ORIGINAL LOGIC
# ======================================================

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp"}

ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf"
}

def build_file_json_from_base64(data, default_name="upload"):
    if not data:
        return None

    if isinstance(data, dict):
        data_url = data.get("data")
        filename = data.get("filename") or default_name
    else:
        data_url = data
        filename = default_name

    if "," in data_url:
        header, content = data_url.split(",", 1)
        mimetype = header.split(";")[0].replace("data:", "")
    else:
        return None

    filename = filename.strip()

    if not filename:
        filename = default_name

    if "." not in filename:
        if "pdf" in mimetype:
            filename += ".pdf"
        elif "png" in mimetype:
            filename += ".png"
        elif "jpeg" in mimetype or "jpg" in mimetype:
            filename += ".jpg"
        elif "webp" in mimetype:
            filename += ".webp"

    return json.dumps({
        "filename": filename,
        "mimetype": mimetype,
        "content": clean_base64(content)
    })

def validate_vat(vat):
    if not vat:
        return None
    return int(clean_number(vat, min_len=15, max_len=15, label="VAT number"))

def validate_cr(cr):
    if not cr:
        return None
    return int(clean_number(cr, min_len=6, max_len=10, label="CR number"))

def validate_computer_card(cc):
    if not cc:
        return None
    return clean_number(cc, min_len=7, max_len=12, label="Computer card number")

def validate_iban(iban):
    if not iban:
        return None
    iban = iban.replace(" ", "").upper()
    if not re.match(r"^[A-Z]{2}[0-9A-Z]{13,32}$", iban):
        raise ValueError("Invalid IBAN format")
    return iban

def validate_swift(swift):
    if not swift:
        return None
    swift = swift.upper()
    if not re.match(r"^[A-Z0-9]{8}([A-Z0-9]{3})?$", swift):
        raise ValueError("Invalid SWIFT code")
    return swift

def clean_text(value):
    if not value:
        return None
    return str(value).strip()

UPLOAD_FIELDS = {
    "upload_cr_company",
    "upload_computer_card_copy",
    "upload_trade_license_copy",
    "upload_vat_certificates_copy",
    "upload_bank_letter",
    "certificates",
    "upload_company_logo",
}

profile_master_bp = Blueprint("profile_master_bp", __name__)

def clean_mobile(phone):
    if not phone:
        return None

    digits = "".join(ch for ch in str(phone) if ch.isdigit())

    if not (7 <= len(digits) <= 15):
        raise ValueError("Invalid mobile number")

    return digits

def clean_date(value):
    if not value:
        return None
    value = str(value).strip()
    if value == "":
        return None
    return value 

def clean_number(value, *, min_len=None, max_len=None, label="Number"):
    if not value:
        return None

    digits = "".join(ch for ch in str(value) if ch.isdigit())

    if min_len and len(digits) < min_len:
        raise ValueError(f"{label} must be at least {min_len} digits")

    if max_len and len(digits) > max_len:
        raise ValueError(f"{label} must be at most {max_len} digits")

    return digits

def translate_to_arabic(text):
    if not text:
        return None
    try:
        translated = GoogleTranslator(source="en", target="ar").translate(text)
        return translated.strip() if translated else None
    except Exception as e:
        print("❌ Translation failed:", e)
        return None   
    
def clean_base64(data_str):
    if not data_str:
        return None

    if "," in data_str:
        data_str = data_str.split(",", 1)[1]

    return data_str.replace("\n", "").replace("\r", "").strip()

def decode_file(data, key):
    value = data.get(key)
    if not value or value == "" or value == "null":
        return None
    try:
        cleaned = clean_base64(value)
        return Binary(base64.b64decode(cleaned))
    except Exception as err:
        print(f"❌ File decode error ({key}):", err)
        return None

def extract_file(blob):
    if not blob:
        return None

    try:
        if isinstance(blob, str):
            blob = blob.strip()
            if not blob or blob.lower() in ["null", "none"]:
                return None

            if not blob.startswith("{"):
                print("⚠️ Not JSON format:", blob[:50])
                return None

            obj = json.loads(blob)

        elif isinstance(blob, (bytes, memoryview)):
            blob = blob.tobytes() if isinstance(blob, memoryview) else blob
            obj = json.loads(blob.decode("utf-8"))

        else:
            return None

        content = obj.get("content")
        mimetype = obj.get("mimetype")

        preview = ""
        if content and mimetype:
            preview = f"data:{mimetype};base64,{content}"

        return {
            "filename": obj.get("filename"),
            "preview": preview
        }

    except Exception as e:
        print("❌ extract_file error:", e)
        return None

# -------------------------------------------------------------------
# ALL YOUR ROUTES BELOW ARE **UNCHANGED**
# -------------------------------------------------------------------

@profile_master_bp.route("/master/<category>", methods=["GET"])
def get_master_values(category):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        query = "SELECT value FROM general_master WHERE category = %s ORDER BY value ASC"
        cur.execute(query, (category,))

        rows = cur.fetchall()
        values = [row["value"] for row in rows]

        return jsonify({"status": True, "data": values})

    except ValueError as ve:
        return jsonify({"status": False, "message": str(ve)}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({"status": False, "message": "Server error"}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/supplier/address/<int:supplier_id>", methods=["GET"])
def supplier_address(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT address, street, zone, area, city, country
        FROM supplier_registration
        WHERE supplier_id = %s
    """, (supplier_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"status": False}), 404

    return jsonify({
        "status": True,
        "address": row["address"],
        "street": row["street"],
        "zone": row["zone"],
        "area": row["area"],
        "city": row["city"],
        "country": row["country"],
    })

@profile_master_bp.route("/restaurant/address/<int:restaurant_id>", methods=["GET"])
def restaurant_address(restaurant_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT address, street, zone, area, city, country
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"status": False}), 404

    return jsonify({
        "status": True,
        "address": row["address"],
        "street": row["street"],
        "zone": row["zone"],
        "area": row["area"],
        "city" : row["city"],
        "country": row["country"],
    })

@profile_master_bp.route('/translate', methods=['POST'])
def translate_text():
    try:
        data = request.get_json() or {}
        text = data.get('text', '') or ''
        if not text.strip():
            return jsonify({'arabic': ''})
        translated = translate_to_arabic(text)
        return jsonify({'arabic': translated})
    except Exception as e:
        return jsonify({'arabic': text})

@profile_master_bp.route("/supplier/register", methods=["POST"])
def supplier_register():
    conn = None
    try:
        data = request.json
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        company_name_english = (data.get("companyName") or "").strip()
        company_name_arabic = (data.get("companyNameArabic") or "").strip()

        if not company_name_arabic:
            company_name_arabic = translate_to_arabic(company_name_english)

        if not company_name_arabic:
            company_name_arabic = None

        print("🇬🇧 English:", company_name_english)
        print("🇸🇦 Arabic:", company_name_arabic)

        query = """
            INSERT INTO supplier_registration (
                company_name_english, company_name_arabic, address, zone, area, street, city, country,
                cr_number, cr_expiry_date, computer_card_number, computer_card_expiry_date,
                signing_authority_name, sponsor_name, trade_license_name, vat_tax_number,
                contact_person_name, contact_person_mobile, contact_person_email,
                bank_name, iban, account_holder_name, swift_code,
                upload_cr_company, upload_computer_card_copy, upload_trade_license_copy,
                upload_vat_certificates_copy, upload_bank_letter, certificates, upload_company_logo,
                category, brand_name, company_email
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING supplier_id;
        """

        cur.execute(query, [
            company_name_english,
            company_name_arabic,
            clean_text(data.get("address")),
            data.get("zone"),
            data.get("area"),
            data.get("street"),
            clean_text(data.get("city")),
            data.get("country"),
            validate_cr(data.get("crNumber")),
            data.get("crExpiry") or None,
            validate_computer_card(data.get("compCardNumber")),
            data.get("compCardExpiry") or None,
            data.get("signingAuthority"),
            data.get("sponsorName"),
            data.get("tradeLicenseName"),
            validate_vat(data.get("vatNumber")),
            data.get("fullName"),
            clean_mobile(data.get("phone")),
            data.get("email"),
            data.get("bankName"),
            validate_iban(data.get("iban")),
            data.get("accountHolder"),
            validate_swift(data.get("swiftCode")),

            build_file_json_from_base64(data.get("crCopy"), "cr_copy.pdf") if data.get("crCopy") else None,
            build_file_json_from_base64(data.get("compCardCopy"), "computer_card.pdf"),
            build_file_json_from_base64(data.get("tradeLicenseCopy"), "trade_license.pdf"),
            build_file_json_from_base64(data.get("vatCertificate"), "vat_certificate.pdf"),
            build_file_json_from_base64(data.get("bankLetter"), "bank_letter.pdf"),
            build_file_json_from_base64(data.get("certificates"), "certificates.pdf"),
            build_file_json_from_base64(data.get("companyLogo"), "company_logo.webp"),

            clean_text(data.get("category")),
            clean_text(data.get("brandName")),
            data.get("org_companyEmail")
        ])

        row = cur.fetchone()
        supplier_id = row["supplier_id"]

        conn.commit()

        return jsonify({"status": True, "supplier_id": supplier_id})
    
    except ValueError as ve:
        return jsonify({"status": False, "message": str(ve)}), 400
    except Exception as e:
        print("❌ Error supplier register:", str(e))
        traceback.print_exc()
        return jsonify({"status": False, "message": str(e)}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/restaurant/register", methods=["POST"])
def restaurant_register():
    conn = None
    try:
        data = request.json
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        def clean_date(v):
            if not v or str(v).strip() == "":
                return None
            return v

        def clean_text_file(v):
            cleaned = clean_base64(v)
            return cleaned if cleaned else None

        company_name_english = (data.get("companyName") or "").strip()
        company_name_arabic = (data.get("companyNameArabic") or "").strip()

        if not company_name_arabic and company_name_english:
            company_name_arabic = translate_to_arabic(company_name_english)

        query = """
            INSERT INTO restaurant_registration (
                restaurant_name_english, restaurant_name_arabic,
                cr_number, cr_expiry_date,
                computer_card_number, computer_card_expiry_date,
                signing_authority_name, sponsor_name, trade_license_name,
                vat_tax_number, contact_person_name,
                contact_person_mobile, contact_person_email,
                bank_name, iban, account_holder_name, swift_code,
                upload_cr_copy, upload_computer_card_copy,
                upload_trade_license_copy, upload_vat_certificate_copy,
                upload_food_safety_certificate, upload_company_logo,
                restaurant_email_address, address, street, zone, city, country, area
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                    %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING restaurant_id;
        """

        values = [
            company_name_english,
            company_name_arabic,
            validate_cr(data.get("crNumber")),
            clean_date(data.get("crExpiry")),
            validate_computer_card(data.get("compCardNumber")),
            clean_date(data.get("compCardExpiry")),
            data.get("signingAuthority"),
            data.get("sponsorName"),
            data.get("tradeLicenseName"),
            validate_vat(data.get("vatNumber")),
            data.get("fullName"),
            clean_mobile(data.get("phone")),
            data.get("email"),
            data.get("bankName"),
            validate_iban(data.get("iban")),
            data.get("accountHolder"),
            validate_swift(data.get("swiftCode")),

            build_file_json_from_base64(data.get("crCopy"), "cr_copy.pdf"),
            build_file_json_from_base64(data.get("compCardCopy"), "computer_card.pdf"),
            build_file_json_from_base64(data.get("tradeLicenseCopy"), "trade_license.pdf"),
            build_file_json_from_base64(data.get("vatCertificate"), "vat_certificate.pdf"),
            build_file_json_from_base64(data.get("foodSafetyCertificate"), "food_safety.pdf"),
            build_file_json_from_base64(data.get("companyLogo"), "company_logo.webp"),

            data.get("org_companyEmail"),
            clean_text(data.get("address")),
            data.get("street"),
            data.get("zone"),
            clean_text(data.get("city")),
            data.get("country"),
            data.get("area"),
        ]

        cur.execute(query, values)

        row = cur.fetchone()
        if not row:
            raise Exception("Insert failed — no restaurant_id returned")

        restaurant_id = row["restaurant_id"]

        conn.commit()

        return jsonify({"status": True, "restaurant_id": restaurant_id})

    except ValueError as ve:
        return jsonify({"status": False, "message": str(ve)}), 400
    except Exception as e:
        print("❌ restaurant error:", e)
        traceback.print_exc()
        return jsonify({"status": False, "message": str(e)}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/supplier/branch", methods=["POST"])
def supplier_branch():
    conn = None
    try:
        data = request.json
        supplier_id = data.get("supplier_id")
        supplier_name = data.get("supplierName")
        company_name = data.get("companyName")
        branches = data.get("branches", [])

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if not supplier_name or not company_name:
            cur.execute("""
                SELECT contact_person_name, company_name_english
                FROM supplier_registration
                WHERE supplier_id = %s
            """, (supplier_id,))
            row = cur.fetchone()
            supplier_name = supplier_name or row["contact_person_name"]
            company_name = company_name or row["company_name_english"]

        query = """
        INSERT INTO supplier_branch_registration (
            supplier_id, supplier_name, company_name,
            branch_name_english, branch_name_arabic,
            branch_manager_name, contact_number, email,
            street, zone, building, office_no,
            city, country, branch_license
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        for b in branches:
            branch_en_raw = (b.get("branchNameEn") or "").strip()
            branch_en_check = branch_en_raw.lower()
            branch_ar = (b.get("branchNameAr") or "").strip()

            if not branch_ar and branch_en_raw:
                branch_ar = translate_to_arabic(branch_en_raw)

            cur.execute("""
                SELECT 1
                FROM supplier_branch_registration
                WHERE supplier_id = %s
                AND lower(branch_name_english) = %s
            """, (supplier_id, branch_en_check))

            if cur.fetchone():
                return jsonify({
                    "status": False,
                    "error": f"Branch '{branch_en_raw}' already exists"
                }), 409

            cur.execute(query, (
                supplier_id,
                supplier_name,
                company_name,
                branch_en_raw,
                branch_ar,
                b.get("branchManager"),
                clean_mobile(b.get("contactNumber")),
                b.get("email"),
                clean_text(b.get("street")),
                clean_text(b.get("zone")),
                clean_text(b.get("building")),
                clean_text(b.get("officeNo")),
                b.get("city"),
                b.get("country"),
                (b.get("branchLicense") or "").upper() or None
            ))

        conn.commit()
        return jsonify({"status": True})

    except errors.UniqueViolation:
        conn.rollback()
        return jsonify({
            "status": False,
            "error": "Branch name already exists for this supplier"
        }), 409

    except Exception as e:
        conn.rollback()
        print("❌ Branch Insert Error:", e)
        return jsonify({"status": False}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/supplier/branch/<int:branch_id>", methods=["PUT"])
def update_supplier_branch(branch_id):
    conn = None
    try:
        data = request.json
        supplier_id = data.get("supplier_id")

        if not supplier_id:
            cur.execute("""
                SELECT supplier_id
                FROM supplier_branch_registration
                WHERE branch_id = %s
            """, (branch_id,))
            supplier_id = cur.fetchone()["supplier_id"]

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT 1
            FROM supplier_branch_registration
            WHERE supplier_id = %s
              AND lower(branch_name_english) = lower(%s)
              AND branch_id <> %s
        """, (
            supplier_id,
            data.get("branchNameEn").strip(),
            branch_id
        ))

        if cur.fetchone():
            return jsonify({
                "status": False,
                "error": "Branch name already exists for this supplier"
            }), 409

        cur.execute("""
            UPDATE supplier_branch_registration SET
                supplier_name = %s,
                company_name =%s,
                branch_name_english = %s,
                branch_name_arabic = %s,
                branch_manager_name = %s,
                contact_number = %s,
                email = %s,
                street = %s,
                zone = %s,
                building = %s,
                office_no = %s,
                city = %s,
                country = %s,
                branch_license = %s,
                updated_at = NOW()
            WHERE branch_id = %s
              AND supplier_id = %s
        """, (
            data.get("supplierName"),
            data.get("companyName"),
            data.get("branchNameEn").strip(),
            data.get("branchNameAr"),
            data.get("branchManager"),
            clean_mobile(data.get("contactNumber")),
            data.get("email"),
            clean_text(data.get("street")),
            clean_text(data.get("zone")),
            clean_text(data.get("building")),
            clean_text(data.get("officeNo")),
            data.get("city"),
            data.get("country"),
            data.get("branchLicense"),
            branch_id,
            supplier_id
        ))

        conn.commit()
        return jsonify({"status": True})

    except Exception as e:
        conn.rollback()
        print("❌ Branch Update Error:", e)
        return jsonify({"status": False}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/restaurant/branch", methods=["POST"])
def restaurant_branch():
    conn = None
    try:
        data = request.json
        restaurant_id = data.get("restaurant_id")
        restaurant_name = data.get("restaurant_name")
        branches = data.get("branches", [])

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT restaurant_name_english
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (restaurant_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({"status": False, "message": "Invalid restaurant_id"}), 400

        restaurant_name = row["restaurant_name_english"]

        query = """
            INSERT INTO restaurant_branch_registration (
                restaurant_id,
                restaurant_name,
                branch_name_english,
                branch_name_arabic,
                branch_manager_name,
                contact_number,
                email,
                street,
                zone,
                building,
                office_number,
                city,
                country
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """

        for b in branches:
            branch_raw = (b.get("branchNameEn") or "").strip()
            branch_check = branch_raw.lower()

            branch_name_arabic = (b.get("branchNameAr") or "").strip()

            if not branch_name_arabic and branch_raw:
                branch_name_arabic = translate_to_arabic(branch_raw)

            cur.execute("""
                SELECT 1
                FROM restaurant_branch_registration
                WHERE restaurant_id = %s
                AND lower(branch_name_english) = %s
            """, (restaurant_id, branch_check))

            if cur.fetchone():
                return jsonify({
                    "status": False,
                    "error": f"Branch '{branch_check}' already exists"
                }), 409

            cur.execute(query, [
                restaurant_id,
                restaurant_name,
                branch_raw,
                branch_name_arabic,
                clean_text(b.get("branchManager")),
                clean_mobile(b.get("contactNumber")),
                clean_text(b.get("email")),
                clean_text(b.get("street")),
                clean_text(b.get("zone")),
                clean_text(b.get("building")),
                int(b.get("officeNo")) if b.get("officeNo") else None,
                clean_text(b.get("city")),
                clean_text(b.get("country")),
            ])

        conn.commit()
        return jsonify({"status": True})

    except ValueError as ve:
        return jsonify({"status": False, "message": str(ve)}), 400
    except Exception as e:
        print("❌ Restaurant Branch Error:", e)
        return jsonify({"status": False, "message": str(e)}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/restaurant/branch/<int:branch_id>", methods=["PUT"])
def update_restaurant_branch(branch_id):
    conn = None
    try:
        data = request.json
        restaurant_id = data.get("restaurant_id")

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT 1
            FROM restaurant_branch_registration
            WHERE restaurant_id = %s
              AND lower(branch_name_english) = lower(%s)
              AND branch_id <> %s
        """, (
            restaurant_id,
            data.get("branchNameEn").strip(),
            branch_id
        ))

        if cur.fetchone():
            return jsonify({
                "status": False,
                "error": "Branch name already exists for this restaurant"
            }), 409
 
        cur.execute("""
            SELECT restaurant_name_english
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (restaurant_id,))
        row = cur.fetchone()
        restaurant_name = row["restaurant_name_english"]

        cur.execute("""
            UPDATE restaurant_branch_registration SET
                restaurant_name = %s,
                branch_name_english = %s,
                branch_name_arabic = %s,
                branch_manager_name = %s,
                contact_number = %s,
                email = %s,
                street = %s,
                zone = %s,
                building = %s,
                office_number = %s,
                city = %s,
                country = %s,
                updated_at = NOW()
            WHERE branch_id = %s
              AND restaurant_id = %s
        """, (
            restaurant_name,
            data.get("branchNameEn").strip(),
            data.get("branchNameAr"),
            data.get("branchManager"),
            clean_mobile(data.get("contactNumber")),
            data.get("email"),
            clean_text(data.get("street")),
            clean_text(data.get("zone")),
            clean_text(data.get("building")),
            int(data.get("officeNo")) if data.get("officeNo") else None,
            data.get("city"),
            data.get("country"),
            branch_id,
            restaurant_id
        ))

        conn.commit()
        return jsonify({"status": True})

    except Exception as e:
        conn.rollback()
        print("❌ Restaurant Branch Update Error:", e)
        return jsonify({"status": False}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/supplier/branch/list/<supplier_id>", methods=["GET"])
def get_supplier_branches(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT branch_name_english 
        FROM supplier_branch_registration 
        WHERE supplier_id = %s
    """, (supplier_id,))

    rows = cur.fetchall()
    branches = [r["branch_name_english"] for r in rows]

    conn.close()
    return jsonify({"status": True, "branches": branches})

@profile_master_bp.route("/supplier/store", methods=["POST"])
def supplier_store():
    conn = None
    try:
        data = request.json
        supplier_id = data.get("supplier_id")
        store = data.get("store")
        store_id = store.get("store_id") 
        supplier_name = data.get("supplierName")
        company_name  = data.get("companyName")
        branch_name   = store.get("branchName")

        if not branch_name:
            branch_name = data.get("branchName")

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        store_name_en_raw = (store.get("storeNameEnglish") or "").strip()
        store_name_ar = (store.get("storeNameArabic") or "").strip()

        if not store_name_ar and store_name_en_raw:
            store_name_ar = translate_to_arabic(store_name_en_raw)

        store_name_check = store_name_en_raw.lower()

        store_email = store.get("storeEmail")

        if not store_email:
            cur.execute("""
                SELECT contact_person_email
                FROM supplier_registration
                WHERE supplier_id = %s
            """, (supplier_id,))
            row = cur.fetchone()
            store_email = row["contact_person_email"]

        if not supplier_name or not company_name:
            cur.execute("""
                SELECT
                    contact_person_name,
                    company_name_english
                FROM supplier_registration
                WHERE supplier_id = %s
            """, (supplier_id,))
            row = cur.fetchone()
            supplier_name = supplier_name or row["contact_person_name"]
            company_name = company_name or row["company_name_english"]

        if not store_id:
            cur.execute("""
                SELECT 1
                FROM supplier_store_registration
                WHERE supplier_id = %s
                  AND lower(store_name_english) = %s
            """, (supplier_id, store_name_check))

            if cur.fetchone():
                return jsonify({
                    "status": False,
                    "error": "Store name already exists"
                }), 409

        if store_id:
            cur.execute("""
                UPDATE supplier_store_registration SET
                    supplier_name = %s,
                    company_name = %s,
                    branch_name =%s,
                    store_name_english = %s,
                    store_name_arabic = %s,
                    contact_person_name = %s,
                    contact_person_mobile = %s,
                    email = %s,
                    street = %s,
                    zone = %s,
                    building = %s,
                    shop_no = %s,
                    operating_hours = %s,
                    store_type = %s,
                    delivery_pickup_availability = %s,
                    city = %s,
                    country = %s,
                    updated_at = NOW()
                WHERE store_id = %s
                  AND supplier_id = %s
            """, (
                supplier_name,
                company_name,
                branch_name,
                store_name_en_raw,
                store_name_ar,
                store.get("contactPersonName"),
                store.get("contactPersonMobile"),
                store_email,
                store.get("street"),
                store.get("zone"),
                store.get("building"),
                store.get("shopNo"),
                store.get("operatingHours"),
                store.get("storeType"),
                store.get("deliveryPickupAvailability"),
                store.get("city"),
                store.get("country"),
                store_id,
                supplier_id
            ))

        else:
            cur.execute("""
                INSERT INTO supplier_store_registration (
                    supplier_id,
                    supplier_name,
                    company_name,
                    branch_name,
                    store_name_english,
                    store_name_arabic,
                    contact_person_name,
                    contact_person_mobile,
                    email,
                    street,
                    zone,
                    building,
                    shop_no,
                    operating_hours,
                    store_type,
                    delivery_pickup_availability,
                    city,
                    country
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                supplier_id,
                supplier_name,
                company_name,
                branch_name,
                store_name_en_raw,
                store_name_ar,
                store.get("contactPersonName"),
                store.get("contactPersonMobile"),
                store.get("storeEmail"),
                store.get("street"),
                store.get("zone"),
                store.get("building"),
                store.get("shopNo"),
                store.get("operatingHours"),
                store.get("storeType"),
                store.get("deliveryPickupAvailability"),
                store.get("city"),
                store.get("country")
            ))

        conn.commit()
        return jsonify({"status": True})

    except Exception as e:
        conn.rollback()
        print("❌ Store error:", e)
        return jsonify({"status": False}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/supplier/store/<int:store_id>", methods=["PUT"])
def update_supplier_store(store_id):
    try:
        data = request.get_json() or {}

        if "store" not in data:
            data["store"] = {}

        data["store"]["store_id"] = store_id

        return supplier_store()

    except Exception as e:
        print("❌ Supplier Store PUT Error:", e)
        traceback.print_exc()
        return jsonify({"status": False, "message": "Store update failed"}), 500

@profile_master_bp.route("/restaurant/branch/list/<restaurant_id>", methods=["GET"])
def get_restaurant_branches(restaurant_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT branch_name_english
        FROM restaurant_branch_registration
        WHERE restaurant_id = %s
        ORDER BY branch_name_english ASC
    """, (restaurant_id,))

    rows = cur.fetchall()

    branches = []
    for r in rows:
        if isinstance(r, dict):
            branches.append(r["branch_name_english"])
        else:
            branches.append(r[0])

    conn.close()
    return jsonify({"status": True, "branches": branches})
@profile_master_bp.route("/restaurant/store", methods=["POST"])
def restaurant_store():
    conn = None
    try:
        data = request.json
        restaurant_id = data.get("restaurant_id")
        store = data.get("store")
        store_id = store.get("store_id")  
        restaurant_name = data.get("restaurantName")
        branch_name = store.get("branchName")

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        store_raw = (store.get("storeNameEnglish") or "").strip()
        store_check = store_raw.lower()

        store_name_arabic = (store.get("storeNameArabic") or "").strip()

        if not store_name_arabic and store_raw:
            store_name_arabic = translate_to_arabic(store_raw)

        if not store_id:
            cur.execute("""
                SELECT 1
                FROM restaurant_store_registration
                WHERE restaurant_id = %s
                  AND lower(store_name_english) = %s
            """, (restaurant_id, store_check))

            if cur.fetchone():
                return jsonify({
                    "status": False,
                    "error": "Store name already exists"
                }), 409

        if store_id:
            cur.execute("""
                UPDATE restaurant_store_registration SET
                    restaurant_name = %s,
                    branch_name = %s,
                    store_name_english = %s,
                    store_name_arabic = %s,
                    contact_person_name = %s,
                    contact_person_mobile = %s,
                    email = %s,
                    street = %s,
                    zone = %s,
                    building = %s,
                    shop_no = %s,
                    operating_hours = %s,
                    city = %s,
                    country = %s,
                    updated_at = NOW()
                WHERE store_id = %s
                  AND restaurant_id = %s
            """, (
                restaurant_name,
                branch_name,
                store_raw,
                store_name_arabic,
                store.get("contactPersonName"),
                clean_mobile(store.get("contactPersonMobile")),
                store.get("storeEmail"),
                clean_text(store.get("street")),
                clean_text(store.get("zone")),
                clean_text(store.get("building")),
                clean_text(store.get("shopNo")),
                clean_text(store.get("operatingHours")),
                clean_text(store.get("city")),
                clean_text(store.get("country")),
                store_id,
                restaurant_id
            ))

        else:
            cur.execute("""
                INSERT INTO restaurant_store_registration (
                    restaurant_id,
                    restaurant_name,
                    branch_name,
                    store_name_english,
                    store_name_arabic,
                    contact_person_name,
                    contact_person_mobile,
                    email,
                    street,
                    zone,
                    building,
                    shop_no,
                    operating_hours,
                    city,
                    country
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                restaurant_id,
                restaurant_name,
                branch_name,
                store_raw,
                store_name_arabic,
                store.get("contactPersonName"),
                clean_mobile(store.get("contactPersonMobile")),
                store.get("storeEmail"),
                clean_text(store.get("street")),
                clean_text(store.get("zone")),
                clean_text(store.get("building")),
                clean_text(store.get("shopNo")),
                clean_text(store.get("operatingHours")),
                clean_text(store.get("city")),
                clean_text(store.get("country"))
            ))

        conn.commit()
        return jsonify({"status": True})

    except Exception as e:
        conn.rollback()
        print("❌ Restaurant Store Error:", e)
        return jsonify({"status": False}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/restaurant/store/<int:store_id>", methods=["PUT"])
def update_restaurant_store(store_id):
    try:
        data = request.get_json() or {}

        if "store" not in data:
            data["store"] = {}

        data["store"]["store_id"] = store_id

        return restaurant_store()

    except Exception as e:
        print("❌ Restaurant Store PUT Error:", e)
        traceback.print_exc()
        return jsonify({"status": False, "message": "Store update failed"}), 500


@profile_master_bp.route("/get/<int:supplier_id>", methods=["GET"])
def get_supplier_details(supplier_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT 
                supplier_id,
                company_name_english,
                company_email,
                contact_person_name,
                contact_person_mobile,
                contact_person_email,
                city, country,
                approval_status,
                upload_trade_license_copy,
                upload_vat_certificates_copy,
                upload_computer_card_copy,
                upload_cr_company
            FROM supplier_registration
            WHERE supplier_id = %s
        """, (supplier_id,))

        row = cur.fetchone()

        if not row:
            return jsonify({"status": False, "message": "Supplier not found"}), 404

        return jsonify({"status": True, "data": row}), 200

    except ValueError as ve:
        return jsonify({"status": False, "message": str(ve)}), 400
    except Exception as e:
        print("❌ get_supplier_details:", e)
        return jsonify({"status": False, "message": str(e)}), 500

def extract_json(blob):
    if not blob:
        return None
    try:
        if isinstance(blob, memoryview):
            blob = blob.tobytes()
        return json.loads(blob)
    except:
        return None

@profile_master_bp.route("/supplier/files/<int:supplier_id>", methods=["GET"])
def get_supplier_uploaded_files(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT 
            upload_cr_company,
            upload_computer_card_copy,
            upload_trade_license_copy,
            upload_vat_certificates_copy,
            upload_company_logo,
            upload_bank_letter,
            certificates
        FROM supplier_registration
        WHERE supplier_id = %s
    """, (supplier_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"status": False}), 404

    return jsonify({
        "status": True,
        "files": {
            "crCopy": extract_file(row["upload_cr_company"]),
            "compCardCopy": extract_file(row["upload_computer_card_copy"]),
            "tradeLicenseCopy": extract_file(row["upload_trade_license_copy"]),
            "vatCertificate": extract_file(row["upload_vat_certificates_copy"]),
            "companyLogo": extract_file(row["upload_company_logo"]),
            "bankLetter": extract_file(row["upload_bank_letter"]),
            "certificates": extract_file(row["certificates"]),
        }
    })

@profile_master_bp.route("/restaurant/files/<int:restaurant_id>", methods=["GET"])
def get_restaurant_uploaded_files(restaurant_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            upload_cr_copy,
            upload_computer_card_copy,
            upload_trade_license_copy,
            upload_vat_certificate_copy,
            upload_food_safety_certificate,
            upload_company_logo
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"status": False}), 404

    return jsonify({
        "status": True,
        "files": {
            "crCopy": extract_file(row["upload_cr_copy"]),
            "compCardCopy": extract_file(row["upload_computer_card_copy"]),
            "tradeLicenseCopy": extract_file(row["upload_trade_license_copy"]),
            "vatCertificate": extract_file(row["upload_vat_certificate_copy"]),
            "foodSafetyCertificate": extract_file(row["upload_food_safety_certificate"]),
            "companyLogo": extract_file(row["upload_company_logo"]),
        }
    })

@profile_master_bp.route("/supplier/basic/<int:supplier_id>", methods=["GET"])
def get_basic_supplier(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT 
            company_name_english,
            company_name_arabic,
            contact_person_name,
            contact_person_email,
            contact_person_mobile,
            city, country
        FROM supplier_registration
        WHERE supplier_id = %s
    """, (supplier_id,))

    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return jsonify({"status": False, "msg": "Not found"}), 404

    company_en = row["company_name_english"]
    company_ar = row["company_name_arabic"]

    if not company_ar and company_en:
        company_ar = translate_to_arabic(company_en)

        if company_ar:
            cur.execute("""
                UPDATE supplier_registration
                SET company_name_arabic = %s,
                    updated_at = NOW()
                WHERE supplier_id = %s
            """, (company_ar, supplier_id))
            conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "status": True,
        "companyName": company_en,
        "companyNameArabic": company_ar,  
        "fullName": row["contact_person_name"],
        "email": row["contact_person_email"],
        "phone": row["contact_person_mobile"],
        "city": row["city"],
        "country": row["country"]
    })

@profile_master_bp.route("/restaurant/basic/<int:restaurant_id>", methods=["GET"])
def get_basic_restaurant(restaurant_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            restaurant_name_english,
            restaurant_name_arabic,
            contact_person_name,
            contact_person_email,
            contact_person_mobile,
            city, country
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return jsonify({"status": False}), 404

    name_en = row["restaurant_name_english"]
    name_ar = row["restaurant_name_arabic"]

    if not name_ar and name_en:
        name_ar = translate_to_arabic(name_en)
        if name_ar:
            cur.execute("""
                UPDATE restaurant_registration
                SET restaurant_name_arabic = %s,
                    updated_at = NOW()
                WHERE restaurant_id = %s
            """, (name_ar, restaurant_id))
            conn.commit()

    cur.close()
    conn.close()

    return jsonify({
        "status": True,
        "companyName": name_en,
        "companyNameArabic": name_ar,
        "fullName": row["contact_person_name"],
        "email": row["contact_person_email"],
        "phone": row["contact_person_mobile"],
        "city": row["city"],
        "country": row["country"]
    })

@profile_master_bp.route("/supplier/update/org/<int:supplier_id>", methods=["PUT"])
def update_supplier_org(supplier_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        UPDATE supplier_registration SET
            cr_number = %s,
            cr_expiry_date = %s,
            computer_card_number = %s,
            computer_card_expiry_date = %s,
            signing_authority_name = %s,
            sponsor_name = %s,
            trade_license_name = %s,
            vat_tax_number = %s,
            category = %s,
            brand_name = %s,
            updated_at = NOW()
        WHERE supplier_id = %s
    """, (
        validate_cr(data.get("crNumber")) if data.get("crNumber") else None,
        data.get("crExpiry"),
        validate_computer_card(data.get("compCardNumber")),
        data.get("compCardExpiry"),
        data.get("signingAuthority"),
        data.get("sponsorName"),
        data.get("tradeLicenseName"),
        validate_vat(data.get("vatNumber")),
        clean_text(data.get("category")),
        clean_text(data.get("brandName")),
        supplier_id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": True})

@profile_master_bp.route("/supplier/update/address/<int:supplier_id>", methods=["PUT"])
def update_supplier_address(supplier_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        UPDATE supplier_registration SET
            address = %s,
            street = %s,
            zone = %s,
            area = %s,
            city = %s,
            country = %s,
            updated_at = NOW()
        WHERE supplier_id = %s
    """, (
        data.get("address"),
        data.get("street"),
        data.get("zone"),
        data.get("area"),
        data.get("city"),
        data.get("country"),
        supplier_id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": True})

@profile_master_bp.route("/supplier/update/bank/<int:supplier_id>", methods=["PUT"])
def update_supplier_bank(supplier_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        UPDATE supplier_registration SET
            bank_name = %s,
            iban = %s,
            account_holder_name = %s,
            swift_code = %s,
            bank_branch = %s,  
            updated_at = NOW()
        WHERE supplier_id = %s
    """, (
        data.get("bankName"),
        data.get("iban"),
        data.get("accountHolder"),
        data.get("swiftCode"),
        data.get("branch"),      
        supplier_id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": True})

@profile_master_bp.route("/supplier/update/files/<int:supplier_id>", methods=["PUT"])
def update_supplier_files_v2(supplier_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        UPDATE supplier_registration SET
            upload_cr_company = COALESCE(%s, upload_cr_company),
            upload_computer_card_copy = COALESCE(%s, upload_computer_card_copy),
            upload_trade_license_copy = COALESCE(%s, upload_trade_license_copy),
            upload_vat_certificates_copy = COALESCE(%s, upload_vat_certificates_copy),
            upload_company_logo = COALESCE(%s, upload_company_logo),
            upload_bank_letter = COALESCE(%s, upload_bank_letter),
            certificates = COALESCE(%s, certificates),
            updated_at = NOW()
        WHERE supplier_id = %s
        RETURNING
            upload_cr_company,
            upload_computer_card_copy,
            upload_trade_license_copy,
            upload_vat_certificates_copy,
            upload_company_logo,
            upload_bank_letter,
            certificates
    """, (
        build_file_json_from_base64(data.get("crCopy"), "cr_copy.pdf") if data.get("crCopy") else None,
        build_file_json_from_base64(data.get("compCardCopy"), "computer_card.pdf"),
        build_file_json_from_base64(data.get("tradeLicenseCopy"), "trade_license.pdf"),
        build_file_json_from_base64(data.get("vatCertificate"), "vat_certificate.pdf"),
        build_file_json_from_base64(data.get("companyLogo"), "company_logo.png"),
        build_file_json_from_base64(data.get("bankLetter"), "bank_letter.pdf"),
        build_file_json_from_base64(data.get("certificates"), "certificates.pdf"),
        supplier_id
    ))

    row = cur.fetchone()  
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "status": True,
        "files": {
            "crCopy": extract_file(row["upload_cr_company"]),
            "compCardCopy": extract_file(row["upload_computer_card_copy"]),
            "tradeLicenseCopy": extract_file(row["upload_trade_license_copy"]),
            "vatCertificate": extract_file(row["upload_vat_certificates_copy"]),
            "companyLogo": extract_file(row["upload_company_logo"]),
            "bankLetter": extract_file(row.get("upload_bank_letter")),
            "certificates": extract_file(row.get("certificates")),
        }
    })

@profile_master_bp.route("/restaurant/update/org/<int:restaurant_id>", methods=["PUT"])
def update_restaurant_org(restaurant_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE restaurant_registration SET
            cr_number = %s,
            cr_expiry_date = %s,
            computer_card_number = %s,
            computer_card_expiry_date = %s,
            signing_authority_name = %s,
            sponsor_name = %s,
            trade_license_name = %s,
            vat_tax_number = %s,
            restaurant_email_address = %s,
            updated_at = NOW()
        WHERE restaurant_id = %s
    """, (
        validate_cr(data.get("crNumber")) if data.get("crNumber") else None,
        data.get("crExpiry"),
        validate_computer_card(data.get("compCardNumber")),
        data.get("compCardExpiry"),
        clean_text(data.get("signingAuthority")),
        clean_text(data.get("sponsorName")),
        clean_text(data.get("tradeLicenseName")),
        validate_vat(data.get("vatNumber")),
        data.get("restaurant_email_address"),
        restaurant_id
    ))

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": True})

@profile_master_bp.route("/restaurant/update/address/<int:restaurant_id>", methods=["PUT"])
def update_restaurant_address(restaurant_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE restaurant_registration SET
            address = %s,
            street = %s,
            zone = %s,
            area = %s,
            city = %s,
            country = %s,
            updated_at = NOW()
        WHERE restaurant_id = %s
    """, (
        data.get("address"),
        data.get("street"),
        data.get("zone"),
        data.get("area"),
        data.get("city"),
        data.get("country"),
        restaurant_id
    ))

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": True})

@profile_master_bp.route("/restaurant/update/bank/<int:restaurant_id>", methods=["PUT"])
def update_restaurant_bank(restaurant_id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        UPDATE restaurant_registration SET
            bank_name = %s,
            iban = %s,
            account_holder_name = %s,
            swift_code = %s,
            bank_branch = %s,
            updated_at = NOW()
        WHERE restaurant_id = %s
    """, (
        data.get("bankName"),
        data.get("iban"),
        data.get("accountHolder"),
        data.get("swiftCode"),
        data.get("branch"), 
        restaurant_id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": True})

@profile_master_bp.route("/restaurant/update/files/<int:restaurant_id>", methods=["PUT"])
def update_restaurant_files_v2(restaurant_id):
    try:
        data = request.json
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
             UPDATE restaurant_registration SET
                upload_cr_copy = COALESCE(%s, upload_cr_copy),
                upload_computer_card_copy = COALESCE(%s, upload_computer_card_copy),
                upload_trade_license_copy = COALESCE(%s, upload_trade_license_copy),
                upload_vat_certificate_copy = COALESCE(%s, upload_vat_certificate_copy),
                upload_food_safety_certificate = COALESCE(%s, upload_food_safety_certificate),
                upload_company_logo = COALESCE(%s, upload_company_logo),
                updated_at = NOW()
            WHERE restaurant_id = %s
            RETURNING
                upload_cr_copy,
                upload_computer_card_copy,
                upload_trade_license_copy,
                upload_vat_certificate_copy,
                upload_food_safety_certificate,
                upload_company_logo
        """, (
            build_file_json_from_base64(data.get("crCopy"), "cr_copy.pdf") if data.get("crCopy") else None,
            build_file_json_from_base64(data.get("compCardCopy"), "computer_card.pdf") if data.get("compCardCopy") else None,
            build_file_json_from_base64(data.get("tradeLicenseCopy"), "trade_license.pdf") if data.get("tradeLicenseCopy") else None,
            build_file_json_from_base64(data.get("vatCertificate"), "vat_certificate.pdf") if data.get("vatCertificate") else None,
            build_file_json_from_base64(data.get("foodSafetyCertificate"), "food_safety.pdf") if data.get("foodSafetyCertificate") else None,
            build_file_json_from_base64(data.get("companyLogo"), "company_logo.png") if data.get("companyLogo") else None,
            restaurant_id
        ))

        row = cur.fetchone()  
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({
            "status": True,
            "files": {
                "crCopy": extract_file(row["upload_cr_copy"]),
                "compCardCopy": extract_file(row["upload_computer_card_copy"]),
                "tradeLicenseCopy": extract_file(row["upload_trade_license_copy"]),
                "vatCertificate": extract_file(row["upload_vat_certificate_copy"]),
                "foodSafetyCertificate": extract_file(row["upload_food_safety_certificate"]),
                "companyLogo": extract_file(row.get("upload_company_logo")),
            }
        })

    except Exception as e:
        print("❌ Restaurant files update error:", e)
        return jsonify({"status": False, "message": str(e)}), 500

@profile_master_bp.route("/supplier/org/<int:supplier_id>", methods=["GET"])
def get_supplier_org(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            cr_number, cr_expiry_date,
            computer_card_number, computer_card_expiry_date,
            signing_authority_name, sponsor_name,
            trade_license_name, vat_tax_number,
            category, brand_name, company_email
        FROM supplier_registration
        WHERE supplier_id = %s
    """, (supplier_id,))

    row = cur.fetchone()

    if row:
        for k in ["cr_expiry_date", "computer_card_expiry_date"]:
            if row.get(k):
                row[k] = row[k].strftime("%Y-%m-%d")

    conn.close()

    return jsonify({"status": True, "data": row})

@profile_master_bp.route("/supplier/bank/<int:supplier_id>", methods=["GET"])
def get_supplier_bank(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT bank_name, iban, account_holder_name, swift_code,
        bank_branch AS branch    
        FROM supplier_registration
        WHERE supplier_id = %s
    """, (supplier_id,))

    row = cur.fetchone()
    conn.close()

    return jsonify({"status": True, "data": row})

@profile_master_bp.route("/supplier/branch/<int:supplier_id>", methods=["GET"])
def get_supplier_branches_full(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            branch_id,  
            branch_name_english AS "branchNameEn",
            branch_name_arabic AS "branchNameAr",
            branch_manager_name AS "branchManager",
            contact_number AS "contactNumber",
            email,
            street,
            zone,
            building,
            office_no AS "officeNo",
            city,
            country,
            branch_license AS "branchLicense"
        FROM supplier_branch_registration
        WHERE supplier_id = %s
        ORDER BY branch_id
    """, (supplier_id,))

    rows = cur.fetchall()
    conn.close()

    return jsonify({"status": True, "branches": rows})

@profile_master_bp.route("/supplier/store/<int:supplier_id>", methods=["GET"])
def get_supplier_store(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            store_id,  
            branch_name,
            store_name_english,
            store_name_arabic,
            contact_person_name,
            contact_person_mobile,
            email,
            street,
            zone,
            building,
            shop_no,
            operating_hours,
            store_type,
            delivery_pickup_availability,
            city,
            country
        FROM supplier_store_registration
        WHERE supplier_id = %s
        ORDER BY store_id DESC
        LIMIT 1
    """, (supplier_id,))

    row = cur.fetchone()
    conn.close()

    return jsonify({"status": True, "data": row})

@profile_master_bp.route("/restaurant/org/<int:restaurant_id>", methods=["GET"])
def get_restaurant_org(restaurant_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            cr_number, cr_expiry_date,
            computer_card_number, computer_card_expiry_date,
            signing_authority_name, sponsor_name,
            trade_license_name, vat_tax_number,
            restaurant_email_address AS company_email
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    row = cur.fetchone()

    if row:
        for k in ["cr_expiry_date", "computer_card_expiry_date"]:
            if row.get(k):
                row[k] = row[k].strftime("%Y-%m-%d")

    conn.close()

    return jsonify({"status": True, "data": row})

@profile_master_bp.route("/restaurant/bank/<int:restaurant_id>", methods=["GET"])
def get_restaurant_bank(restaurant_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT bank_name, iban, account_holder_name, swift_code, bank_branch AS branch
        FROM restaurant_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    row = cur.fetchone()
    conn.close()

    return jsonify({"status": True, "data": row})

@profile_master_bp.route("/restaurant/store/<int:restaurant_id>", methods=["GET"])
def get_restaurant_store(restaurant_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            store_id,  
            branch_name,
            store_name_english,
            store_name_arabic,
            contact_person_name,
            contact_person_mobile,
            email,
            street,
            zone,
            city,
            country,
            building,
            shop_no,
            operating_hours,
            NULL AS store_type,
            NULL AS delivery_pickup_availability
        FROM restaurant_store_registration
        WHERE restaurant_id = %s
        ORDER BY store_id DESC
        LIMIT 1
    """, (restaurant_id,))

    row = cur.fetchone()
    conn.close()

    return jsonify({"status": True, "data": row})

@profile_master_bp.route("/restaurant/branch/<int:restaurant_id>", methods=["GET"])
def get_restaurant_branches_full(restaurant_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            branch_id, 
            branch_name_english AS "branchNameEn",
            branch_name_arabic AS "branchNameAr",
            branch_manager_name AS "branchManager",
            contact_number AS "contactNumber",
            email,
            street,
            zone,
            building,
            office_number AS "officeNo",
            city,
            country
        FROM restaurant_branch_registration
        WHERE restaurant_id = %s
    """, (restaurant_id,))

    rows = cur.fetchall()
    conn.close()

    return jsonify({"status": True, "branches": rows})

@profile_master_bp.route("/basic", methods=["GET"])
def get_basic():
    user = get_current_user()

    if user["role"] == "supplier":
        return get_basic_supplier(user["supplier_id"])

    if user["role"] == "restaurant":
        return get_basic_restaurant(user["restaurant_id"])

    return jsonify({"status": False}), 403

@profile_master_bp.route("/org", methods=["GET"])
def get_org():
    user = get_current_user()

    if user["role"] == "supplier":
        return get_supplier_org(user["supplier_id"])

    if user["role"] == "restaurant":
        return get_restaurant_org(user["restaurant_id"])

    return jsonify({"status": False}), 403

@profile_master_bp.route("/address", methods=["GET"])
def get_address():
    user = get_current_user()

    if user["role"] == "supplier":
        return supplier_address(user["supplier_id"])

    if user["role"] == "restaurant":
        return restaurant_address(user["restaurant_id"])

@profile_master_bp.route("/address", methods=["PUT"])
def save_address():
    user = get_current_user()

    if user["role"] == "supplier":
        return update_supplier_address(user["supplier_id"])

    if user["role"] == "restaurant":
        return update_restaurant_address(user["restaurant_id"])
    
@profile_master_bp.route("/bank", methods=["GET"])
def get_bank():
    user = get_current_user()

    if user["role"] == "supplier":
        return get_supplier_bank(user["supplier_id"])

    if user["role"] == "restaurant":
        return get_restaurant_bank(user["restaurant_id"])

    return jsonify({"status": False}), 403

@profile_master_bp.route("/files", methods=["GET"])
def get_files():
    user = get_current_user()

    if user["role"] == "supplier":
        return get_supplier_uploaded_files(user["supplier_id"])

    if user["role"] == "restaurant":
        return get_restaurant_uploaded_files(user["restaurant_id"])

@profile_master_bp.route("/branch/list", methods=["GET"])
def branch_list():
    user = get_current_user()

    if user["role"] == "supplier":
        return get_supplier_branches(user["supplier_id"])

    if user["role"] == "restaurant":
        return get_restaurant_branches(user["restaurant_id"])
    
@profile_master_bp.route("/store", methods=["POST"])
def save_store():
    user = get_current_user()

    if user["role"] == "supplier":
        return supplier_store()

    if user["role"] == "restaurant":
        return restaurant_store()

    return jsonify({"status": False, "error": "Forbidden"}), 403

@profile_master_bp.route("/<role>/basic/<int:id>", methods=["GET"])
def get_basic_by_role(role, id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    table = "restaurant_registration" if role == "restaurant" else "supplier_registration"
    id_field = "restaurant_id" if role == "restaurant" else "supplier_id"

    cur.execute(f"""
        SELECT 
            contact_person_name AS "fullName",
            { 'restaurant_name_english' if role=='restaurant' else 'company_name_english' } AS "companyName",
            contact_person_email AS "email",
            contact_person_mobile AS "phone",
            city, country
        FROM {table}
        WHERE {id_field} = %s
    """, (id,))

    row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"status": False}), 404

    return jsonify({"status": True, **row})

@profile_master_bp.route("/<role>/org/<int:id>", methods=["GET"])
def get_org_by_role(role, id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    table = "restaurant_registration" if role == "restaurant" else "supplier_registration"
    id_field = "restaurant_id" if role == "restaurant" else "supplier_id"

    cur.execute(f"""
        SELECT 
            cr_number,
            vat_tax_number
        FROM {table}
        WHERE {id_field} = %s
    """, (id,))

    row = cur.fetchone()
    conn.close()

    return jsonify({"status": True, "data": row})

@profile_master_bp.route("/<role>/bank/<int:id>", methods=["GET"])
def get_bank_by_role(role, id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    table = "restaurant_registration" if role == "restaurant" else "supplier_registration"
    id_field = "restaurant_id" if role == "restaurant" else "supplier_id"

    cur.execute(f"""
        SELECT 
            bank_name,
            iban
        FROM {table}
        WHERE {id_field} = %s
    """, (id,))

    row = cur.fetchone()
    conn.close()

    return jsonify({"status": True, "data": row})

@profile_master_bp.route("/supplier/update/basic/<int:supplier_id>", methods=["PUT"])
def update_supplier_basic(supplier_id):
    data = request.json

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        UPDATE supplier_registration SET
            contact_person_name = %s,
            company_name_english = %s,
            contact_person_email = %s,
            contact_person_mobile = %s,
            city = %s,
            country = %s,
            updated_at = NOW()
        WHERE supplier_id = %s
    """, (
        data.get("fullName"),
        data.get("companyName"),
        data.get("email"),
        data.get("phone"),
        data.get("city"),
        data.get("country"),
        supplier_id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": True})

@profile_master_bp.route("/restaurant/update/basic/<int:restaurant_id>", methods=["PUT"])
def update_restaurant_basic(restaurant_id):
    data = request.json

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE restaurant_registration SET
            contact_person_name = %s,
            restaurant_name_english = %s,
            contact_person_email = %s,
            contact_person_mobile = %s,
            city = %s,
            country = %s,
            updated_at = NOW()
        WHERE restaurant_id = %s
    """, (
        data.get("fullName"),
        data.get("companyName"),
        data.get("email"),
        data.get("phone"),
        data.get("city"),
        data.get("country"),
        restaurant_id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": True})
@profile_master_bp.route("/admin/suppliers/pending", methods=["GET"])
def get_pending_suppliers():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT supplier_id, company_name_english, contact_person_email, approval_status
        FROM supplier_registration
        WHERE approval_status = 'PENDING'
        ORDER BY supplier_id DESC
    """)

    rows = cur.fetchall()
    conn.close()

    return jsonify({"status": True, "data": rows})

@profile_master_bp.route("/admin/supplier/approve/<int:supplier_id>", methods=["PUT"])
def approve_supplier(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE supplier_registration
        SET approval_status = 'APPROVED',
            updated_at = NOW()
        WHERE supplier_id = %s
    """, (supplier_id,))

    conn.commit()
    conn.close()

    return jsonify({"status": True})

@profile_master_bp.route("/admin/supplier/reject/<int:supplier_id>", methods=["PUT"])
def reject_supplier(supplier_id):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE supplier_registration
        SET approval_status = 'REJECTED'
        WHERE supplier_id = %s
    """, (supplier_id,))

    conn.commit()
    conn.close()

    return jsonify({"status": True})

@profile_master_bp.route("/supplier/update/files/<int:id>", methods=["PUT"])
def update_supplier_files(id):
    conn = get_db_connection()
    cur = conn.cursor()

    data = request.json

    query = """
    UPDATE supplier_registration SET
        upload_cr_company = %s,
        upload_computer_card_copy = %s,
        upload_trade_license_copy = %s,
        upload_vat_certificates_copy = %s,
        upload_bank_letter = %s,
        certificates = %s,
        upload_company_logo = %s,
        updated_at = NOW()
    WHERE supplier_id = %s
    """

    cur.execute(query, (
        build_file_json_from_base64(data.get("crCopy")),
        build_file_json_from_base64(data.get("compCardCopy")),
        build_file_json_from_base64(data.get("tradeLicenseCopy")),
        build_file_json_from_base64(data.get("vatCertificate")),
        build_file_json_from_base64(data.get("bankLetter")),
        build_file_json_from_base64(data.get("certificates")),
        build_file_json_from_base64(data.get("companyLogo")),
        id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": True})

@profile_master_bp.route("/restaurant/update/files/<int:id>", methods=["PUT"])
def update_restaurant_files(id):
    conn = get_db_connection()
    cur = conn.cursor()

    data = request.json

    query = """
    UPDATE restaurant_registration SET
        upload_cr_copy = %s,
        upload_computer_card_copy = %s,
        upload_trade_license_copy = %s,
        upload_vat_certificate_copy = %s,
        upload_food_safety_certificate = %s,
        upload_company_logo = %s,
        updated_at = NOW()
    WHERE restaurant_id = %s
    """

    cur.execute(query, (
        build_file_json_from_base64(data.get("crCopy")),
        build_file_json_from_base64(data.get("compCardCopy")),
        build_file_json_from_base64(data.get("tradeLicenseCopy")),
        build_file_json_from_base64(data.get("vatCertificate")),
        build_file_json_from_base64(data.get("foodSafetyCertificate")),
        build_file_json_from_base64(data.get("companyLogo")),
        id
    ))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"status": True})

@profile_master_bp.route("/supplier/update/branch/<int:supplier_id>", methods=["PUT", "OPTIONS"])
def update_all_supplier_branches(supplier_id):

    if request.method == "OPTIONS":
        return jsonify({"status": True}), 200

    conn = None
    try:
        data = request.json 

        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            DELETE FROM supplier_branch_registration
            WHERE supplier_id = %s
        """, (supplier_id,))

        for b in data:
            cur.execute("""
                INSERT INTO supplier_branch_registration (
                    supplier_id,
                    branch_name_english,
                    branch_name_arabic,
                    branch_manager_name,
                    contact_number,
                    email,
                    street,
                    zone,
                    building,
                    office_no,
                    city,
                    country,
                    branch_license
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                supplier_id,
                b.get("branchNameEn"),
                b.get("branchNameAr"),
                b.get("branchManager"),
                clean_mobile(b.get("contactNumber")),
                b.get("email"),
                clean_text(b.get("street")),
                clean_text(b.get("zone")),
                clean_text(b.get("building")),
                clean_text(b.get("officeNo")),
                b.get("city"),
                b.get("country"),
                b.get("branchLicense"),
            ))

        conn.commit()
        return jsonify({"status": True})

    except Exception as e:
        if conn:
            conn.rollback()
        print("❌ Supplier Bulk Branch Error:", e)
        return jsonify({"status": False}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/restaurant/update/branch/<int:restaurant_id>", methods=["PUT", "OPTIONS"])
def update_all_restaurant_branches(restaurant_id):

    if request.method == "OPTIONS":
        return jsonify({"status": True}), 200

    conn = None
    try:
        data = request.json

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT restaurant_name_english
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (restaurant_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({"status": False, "message": "Invalid restaurant"}), 400

        restaurant_name = row["restaurant_name_english"]

        cur.execute("""
            DELETE FROM restaurant_branch_registration
            WHERE restaurant_id = %s
        """, (restaurant_id,))

        for b in data:
            cur.execute("""
                INSERT INTO restaurant_branch_registration (
                    restaurant_id,
                    restaurant_name,
                    branch_name_english,
                    branch_name_arabic,
                    branch_manager_name,
                    contact_number,
                    email,
                    street,
                    zone,
                    building,
                    office_number,
                    city,
                    country
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                restaurant_id,
                restaurant_name,
                b.get("branchNameEn"),
                b.get("branchNameAr"),
                b.get("branchManager"),
                clean_mobile(b.get("contactNumber")),
                b.get("email"),
                clean_text(b.get("street")),
                clean_text(b.get("zone")),
                clean_text(b.get("building")),
                int(b.get("officeNo")) if b.get("officeNo") else None,
                b.get("city"),
                b.get("country"),
            ))

        conn.commit()
        return jsonify({"status": True})

    except Exception as e:
        if conn:
            conn.rollback()
        print("❌ Restaurant Bulk Branch Error:", e)
        return jsonify({"status": False}), 500

    finally:
        if conn:
            conn.close()

@profile_master_bp.route("/restaurant/update/store/<int:restaurant_id>", methods=["PUT"])
def update_restaurant_store_bulk(restaurant_id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        data = request.json

        cur.execute("""
            DELETE FROM restaurant_store_registration
            WHERE restaurant_id = %s
        """, (restaurant_id,))

        cur.execute("""
            SELECT restaurant_name_english
            FROM restaurant_registration
            WHERE restaurant_id = %s
        """, (restaurant_id,))
        name = cur.fetchone()["restaurant_name_english"]

        cur.execute("""
            INSERT INTO restaurant_store_registration (
                restaurant_id,
                restaurant_name,
                branch_name,
                store_name_english,
                store_name_arabic,
                contact_person_name,
                contact_person_mobile,
                email,
                street,
                zone,
                building,
                shop_no,
                operating_hours,
                city,
                country
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            restaurant_id,
            name,
            data.get("branchName"),
            data.get("storeNameEnglish"),
            data.get("storeNameArabic"),
            data.get("contactPersonName"),
            data.get("contactPersonMobile"),
            data.get("storeEmail"),
            data.get("street"),
            data.get("zone"),
            data.get("building"),
            data.get("shopNo"),
            data.get("operatingHours"),
            data.get("city"),
            data.get("country")
        ))

        conn.commit()
        return jsonify({"status": True})

    except Exception as e:
        conn.rollback()
        print("❌ Store Bulk Error:", e)
        return jsonify({"status": False}), 500

    finally:
        conn.close()

def get_table_config(role):
    role = role.lower()

    if role == "supplier":
        return {
            "table": "supplier_registration",
            "pk": "supplier_id",
            "name_col": "company_name_english"
        }

    if role == "restaurant":
        return {
            "table": "restaurant_registration",
            "pk": "restaurant_id",
            "name_col": "restaurant_name_english"
        }

    return None

@profile_master_bp.route("/<role>/profile-summary/<int:id>", methods=["GET"])
def profile_summary(role, id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        if role == "supplier":
            cur.execute("""
                SELECT 
                    company_name_english AS name,
                    profile_image,
                    approval_status
                FROM supplier_registration
                WHERE supplier_id = %s
            """, (id,))
        else:
            cur.execute("""
                SELECT 
                    restaurant_name_english AS name,
                    profile_image,
                    approval_status
                FROM restaurant_registration
                WHERE restaurant_id = %s
            """, (id,))

        row = cur.fetchone()
        conn.close()

        if not row:
            return jsonify({"status": False}), 404

        return jsonify({
            "status": True,
            "data": {
                "companyName": row.get("name"),
                "profileImage": extract_file(row["profile_image"]),
                "approval_status": row.get("approval_status") 
            }
        })

    except Exception as e:
        print("❌ PROFILE SUMMARY ERROR:", str(e))
        traceback.print_exc()
        return jsonify({"status": False, "error": str(e)}), 500
    
@profile_master_bp.route("/<role>/profile-image/<int:id>", methods=["PUT"])
def update_profile_image(role, id):
    try:
        data = request.json
        image = build_file_json_from_base64(data.get("image"), "profile.png")

        if not image:
            return jsonify({"status": False, "message": "No image"}), 400

        file_json = image

        conn = get_db_connection()
        cur = conn.cursor()

        if role == "restaurant":
            cur.execute("""
                UPDATE restaurant_registration
                SET profile_image = %s,
                    updated_at = NOW()
                WHERE restaurant_id = %s
            """, (image, id))

        elif role == "supplier":
            cur.execute("""
                UPDATE supplier_registration
                SET profile_image = %s,
                    updated_at = NOW()
                WHERE supplier_id = %s
            """, (file_json, id))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({"status": True})

    except Exception as e:
        print("❌ Profile Image Error:", e)
        return jsonify({"status": False}), 500