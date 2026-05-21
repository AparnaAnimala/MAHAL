# from flask import Blueprint, request, jsonify, send_from_directory, current_app
# from flask_cors import CORS
# from psycopg2 import pool, Binary
# from psycopg2.extras import RealDictCursor
# import base64
# import os
# import time, pickle
# import pandas as pd
# import zipfile
# from io import BytesIO
# from deep_translator import GoogleTranslator
# import requests
# from werkzeug.utils import secure_filename
# from flask import request
# import jwt
# import psycopg2

# JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

# from flask import current_app
# from flask_mail import Message
# from db import get_db_connection
# from app import mail
# from psycopg2.extras import RealDictCursor

# from services.inventory_alerts import (
#     send_low_stock_email,
#     send_out_of_stock_email
# )



# product_bp = Blueprint('product_bp', __name__)
# CORS(
#     product_bp,
#     resources={r"/*": {"origins": "*"}},
#     supports_credentials=False
# )


# # ---------------- DB POOL ----------------
# DB_CONFIG = {
#     "host": os.getenv("DB_HOST", "localhost"),
#     "database": os.getenv("DB_NAME", "MAHALDATABASE"),
#     "user": os.getenv("DB_USER", "postgres"),
#     "password": os.getenv("DB_PASSWORD", "madhu"),
# }

# _db_pool = pool.SimpleConnectionPool(1, 20, **DB_CONFIG)

# def get_conn():
#     return _db_pool.getconn()

# def release_conn(conn):
#     try:
#         _db_pool.putconn(conn)
#     except Exception:
#         pass

# # ---------------- Paths & Template ----------------
# BASE_DIR = os.path.dirname(__file__)
# PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))
# TEMPLATE_DIR = os.path.join(PROJECT_ROOT, 'templates')
# UPLOAD_DIR = os.path.join(PROJECT_ROOT, 'uploads')  # temporary excel storage
# os.makedirs(TEMPLATE_DIR, exist_ok=True)
# os.makedirs(UPLOAD_DIR, exist_ok=True)
# TEMPLATE_FILE = os.path.join(TEMPLATE_DIR, 'ProductUploadTemplate.xlsx')

# # ---------------- Helpers ----------------
# def parse_date(value):
#     if pd.isnull(value):
#         return None
#     try:
#         return pd.to_datetime(value).date()
#     except Exception:
#         return None

# def normalize_columns(df):
#     df = df.copy()
#     df.columns = [str(c).strip().lower().replace(' ', '_') for c in df.columns]
#     return df

# def translate_to_arabic(text) -> str:
#     if text is None:
#         return ''
#     text = str(text).strip()
#     if not text:
#         return ''
#     try:
#         return GoogleTranslator(source='en', target='ar').translate(text)
#     except Exception:
#         try:
#             resp = requests.post(
#                 'https://libretranslate.com/translate',
#                 data={"q": text, "source": "en", "target": "ar", "format": "text"},
#                 timeout=8
#             )
#             if resp.status_code == 200:
#                 return resp.json().get('translatedText', text)
#         except Exception:
#             pass
#     return text

# def make_unique_filename(orig_name: str) -> str:
#     safe = secure_filename(orig_name)
#     ts = int(time.time() * 1000)
#     return f"{ts}_{safe}"

# # def image_to_bytes(file_storage):
# #     if not file_storage:
# #         return None
# #     file_bytes = file_storage.read()
# #     file_storage.seek(0)
# #     return Binary(file_bytes)

# def images_to_bytes_array(file_list):
#     """ Convert list of FileStorage to raw list of bytes (bytea[] for PostgreSQL) """
#     if not file_list:
#         return None
#     binaries = []
#     for f in file_list:
#         binaries.append(f.read())
#         f.seek(0)
#     return binaries   # return list → stored as bytea[]

# def extract_zip_to_dict(zip_file):
#     """
#     Extract ZIP images into dictionary:
#     { "filename.jpg": b'filebytes' }
#     """
#     images = {}
#     try:
#         with zipfile.ZipFile(zip_file) as z:
#             for name in z.namelist():
#                 # ignore folders in ZIP
#                 clean_name = os.path.basename(name)

#                 if clean_name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
#                     images[clean_name] = z.read(name)

#         return images
#     except Exception as e:
#         print("ZIP Extract Error:", e)
#         return {}


# def ensure_template_exists():
#     if os.path.exists(TEMPLATE_FILE):
#         return
#     columns = [
#         'product_name_english', 'category_id', 'sub_category_id', 'unit_of_measure',
#         'currency', 'price_per_unit', 'minimum_order_quantity', 'stock_availability',
#         'product_images', 'expiry_date', 'shelf_life', 'expiry_time', 'description'
#     ]
#     df = pd.DataFrame(columns=columns)
#     df.to_excel(TEMPLATE_FILE, index=False)

# # Ensure template on import
# ensure_template_exists()

# # ---------------- Bulk Excel Upload ----------------#
# @product_bp.route('/upload', methods=['POST'])
# def upload_products():
#     """Bulk Excel upload with ZIP images support"""
#     try:
#         # -----------------------------
#         # 1️⃣ Excel validation
#         # -----------------------------
#         if 'file' not in request.files:
#             return jsonify({'error': 'Excel file missing'}), 400

#         excel_file = request.files['file']

#         if excel_file.filename == '':
#             return jsonify({'error': 'Excel file is empty'}), 400

#         supplier_id = request.form.get("supplier_id")
#         branch_id = request.form.get("branch_id")
#         store_id = request.form.get("store_id")

#         if not supplier_id:
#             return jsonify({'error': 'supplier_id required'}), 400

#         # -----------------------------
#         # 2️⃣ Handle ZIP file
#         # -----------------------------
#         images_zip = request.files.get("images_zip")   # <-- ZIP File

#         uploaded_images = {}

#         if images_zip:
#             uploaded_images = extract_zip_to_dict(images_zip)

#         # -----------------------------
#         # 3️⃣ Save excel temporarily
#         # -----------------------------
#         temp_path = os.path.join(UPLOAD_DIR, make_unique_filename(excel_file.filename))
#         excel_file.save(temp_path)

#         # -----------------------------
#         # 4️⃣ Read Excel
#         # -----------------------------
#         try:
#             df = pd.read_excel(temp_path, engine="openpyxl")
#         except Exception as e:
#             return jsonify({'error': f"Invalid Excel format: {str(e)}"}), 400
#         finally:
#             try:
#                 os.remove(temp_path)
#             except:
#                 pass

#         if df.empty:
#             return jsonify({'error': 'Excel file contains no data'}), 400

#         df = normalize_columns(df)

#         required = ['product_name_english', 'price_per_unit', 'stock_availability']
#         missing = [c for c in required if c not in df.columns]
#         if missing:
#             return jsonify({'error': f"Missing column(s): {', '.join(missing)}"}), 400

#         # -----------------------------
#         # 5️⃣ DB Connection
#         # -----------------------------
#         conn = get_conn()
#         cur = conn.cursor()

#         # Fetch supplier-related names
#         company_name_english = ''
#         branch_name_english = ''
#         store_name_english = ''

#         cur.execute("SELECT company_name_english FROM supplier_registration WHERE supplier_id=%s",
#                     (supplier_id,))
#         row = cur.fetchone()
#         if row:
#             company_name_english = row[0]

#         if branch_id:
#             cur.execute("SELECT branch_name_english FROM supplier_branch_registration WHERE branch_id=%s",
#                         (branch_id,))
#             row = cur.fetchone()
#             if row:
#                 branch_name_english = row[0]

#         if store_id:
#             cur.execute("SELECT store_name_english FROM supplier_store_registration WHERE store_id=%s",
#                         (store_id,))
#             row = cur.fetchone()
#             if row:
#                 store_name_english = row[0]

#         # -----------------------------
#         # 6️⃣ Process Each Product Row
#         # -----------------------------
#         imported = 0
#         errors = []

#         for idx, row in df.iterrows():
#             try:
#                 r = row.to_dict()

#                 product_english = str(r.get("product_name_english") or "").strip()
#                 product_arabic = translate_to_arabic(product_english) if product_english else ""
#                 description = r.get("description") or ""

#                 # -----------------------------
#                 # 🔥 Image Mapping
#                 # -----------------------------
#                 img_val = []

#                 excel_img_field = r.get("product_images")

#                 if pd.isna(excel_img_field):
#                     excel_img_field = ""
#                 else:
#                     excel_img_field = str(excel_img_field).strip()

#                 image_names = [
#                     x.strip() for x in excel_img_field.split(",") if x.strip()
#                 ]

#                 for name in image_names:
#                     if name in uploaded_images:
#                         img_val.append(uploaded_images[name])

#                 # -----------------------------
#                 # DB Insert
#                 # -----------------------------
#                 cur.execute("""
#                     INSERT INTO product_management (
#                         supplier_id, company_name_english, branch_name_english, store_name_english,
#                         product_name_english, product_name_arabic,
#                         category_id, sub_category_id,
#                         unit_of_measure, currency, price_per_unit,
#                         minimum_order_quantity, stock_availability,
#                         product_images, expiry_date, shelf_life, expiry_time,
#                         description, product_status, flag
#                     )
#                     VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'pending approval','A')
#                 """,
#                 (
#                     supplier_id,
#                     company_name_english, branch_name_english, store_name_english,
#                     product_english, product_arabic,
#                     r.get("category_id") or '',
#                     r.get("sub_category_id") or '',
#                     r.get("unit_of_measure") or '',
#                     r.get("currency") or 'QAR ',
#                     int(r.get("price_per_unit")) if pd.notnull(r.get("price_per_unit")) else None,
#                     int(r.get("minimum_order_quantity")) if pd.notnull(r.get("minimum_order_quantity")) else None,
#                     int(r.get("stock_availability")) if pd.notnull(r.get("stock_availability")) else None,
#                     img_val,
#                     parse_date(r.get("expiry_date")),
#                     r.get("shelf_life"),
#                     r.get("expiry_time"),
#                     description
#                 ))

#                 imported += 1

#             except Exception as e:
#                 conn.rollback()
#                 errors.append({"row": idx + 2, "error": str(e)})

#         conn.commit()
#         cur.close()
#         release_conn(conn)

#         return jsonify({
#             "message": "Bulk upload completed",
#             "imported": imported,
#             "errors": errors
#         }), 200

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# # ---------------- Translate ----------------
# @product_bp.route('/translate', methods=['POST'])
# def translate_text():
#     try:
#         data = request.get_json() or {}
#         text = data.get('text', '') or ''
#         if not text.strip():
#             return jsonify({'arabic': ''})
#         translated = translate_to_arabic(text)
#         return jsonify({'arabic': translated})
#     except Exception as e:
#         return jsonify({'arabic': text})

# # ---------------- Dropdowns ----------------
# @product_bp.route('/companies', methods=['GET'])
# def get_companies():
#     conn = get_conn()
#     try:
#         cur = conn.cursor(cursor_factory=RealDictCursor)
#         cur.execute('SELECT supplier_id, company_name_english AS company_name FROM supplier_registration;')
#         companies = cur.fetchall()
#         cur.close()
#         return jsonify(companies), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         release_conn(conn)

# @product_bp.route('/branches', methods=['GET'])
# def get_branches():
#     supplier_id = request.args.get('supplier_id')
#     conn = get_conn()
#     try:
#         cur = conn.cursor(cursor_factory=RealDictCursor)
#         cur.execute('SELECT branch_id, branch_name_english FROM supplier_branch_registration WHERE supplier_id = %s;', (supplier_id,))
#         branches = cur.fetchall()
#         cur.close()
#         return jsonify(branches), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         release_conn(conn)

# @product_bp.route('/stores', methods=['GET'])
# def get_stores():
#     supplier_id = request.args.get('supplier_id')
#     conn = get_conn()
#     try:
#         cur = conn.cursor(cursor_factory=RealDictCursor)
#         cur.execute('SELECT store_id, store_name_english FROM supplier_store_registration WHERE supplier_id = %s;', (supplier_id,))
#         stores = cur.fetchall()
#         cur.close()
#         return jsonify(stores), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         release_conn(conn)

# @product_bp.route('/categories', methods=['GET'])
# def get_categories():
#     conn = get_conn()
#     try:
#         cur = conn.cursor()
#         cur.execute("SELECT id, name FROM category WHERE flag = 'A'")
#         rows = cur.fetchall()
#         cur.close()
#         return jsonify([{'id': r[0], 'name': r[1]} for r in rows]), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         release_conn(conn)

# @product_bp.route('/subcategories', methods=['GET'])
# def get_subcategories():
#     category_id = request.args.get('category_id')
#     conn = get_conn()
#     try:
#         cur = conn.cursor()
#         cur.execute('SELECT id, name FROM sub_category WHERE category_id = %s AND flag = '"'A'"'', (category_id,))
#         rows = cur.fetchall()
#         cur.close()
#         return jsonify([{'id': r[0], 'name': r[1]} for r in rows]), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         release_conn(conn)

# @product_bp.route('/template', methods=['GET'])
# def download_template():
#     ensure_template_exists()
#     return send_from_directory(TEMPLATE_DIR, os.path.basename(TEMPLATE_FILE), as_attachment=True)

# # ---------------- CREATE / ADD PRODUCT ----------------
# @product_bp.route('/', methods=['POST'])
# def add_product():
#     data = request.form
#     # file = request.files.get('product_images')
#     # image_bytes = image_to_bytes(file) if file else None
#     files = request.files.getlist('product_images')  # <-- get multiple files
#     images_bytes = images_to_bytes_array(files)

#     supplier_id = data.get('supplier_id')
#     product_name_english = (data.get('product_name_english') or '').strip()
#     product_name_arabic = (data.get('product_name_arabic') or '').strip()

#     if not product_name_arabic and product_name_english:
#         product_name_arabic = translate_to_arabic(product_name_english)

#     conn = get_conn()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         company_name_english = None
#         if supplier_id:
#             cur.execute(
#                 'SELECT company_name_english FROM supplier_registration WHERE supplier_id = %s',
#                 (supplier_id,))
#             row = cur.fetchone()
#             company_name_english = row['company_name_english'] if row else None

#         branch_name_english = ''
#         store_name_english = ''
#         branch_id = data.get('branch_id')
#         store_id = data.get('store_id')

#         if branch_id:
#             cur.execute(
#                 'SELECT branch_name_english FROM supplier_branch_registration WHERE branch_id = %s',
#                 (branch_id,))
#             br = cur.fetchone()
#             branch_name_english = br['branch_name_english'] if br else ''

#         if store_id:
#             cur.execute(
#                 'SELECT store_name_english FROM supplier_store_registration WHERE store_id = %s',
#                 (store_id,))
#             st = cur.fetchone()
#             store_name_english = st['store_name_english'] if st else ''

#         # Numeric conversions
#         try:
#             price_per_unit = float(data.get('price_per_unit')) \
#                 if data.get('price_per_unit') not in (None, '') else None
#         except Exception:
#             price_per_unit = None

#         cur.execute('''
#             INSERT INTO product_management (
#                 supplier_id, company_name_english, branch_name_english, store_name_english,
#                 product_name_english, product_name_arabic, category_id, sub_category_id,
#                 unit_of_measure, price_per_unit, currency, minimum_order_quantity,
#                 stock_availability, product_images,
#                 expiry_date, shelf_life, expiry_time,
#                 description, product_status, flag
#             )
#             VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'pending approval','A')
#             RETURNING product_id
#         ''', (
#             supplier_id,
#             company_name_english,
#             branch_name_english,
#             store_name_english,
#             product_name_english,
#             product_name_arabic,
#             data.get('category_id'),
#             data.get('sub_category_id'),
#             data.get('unit_of_measure'),
#             price_per_unit,
#             data.get('currency', 'QAR '),
#             data.get('minimum_order_quantity'),
#             data.get('stock_availability'),
#             images_bytes,
#             data.get('expiry_date'),
#             data.get('shelf_life'),
#             data.get('expiry_time'),
#             data.get('description')
#         ))
#         new_id = cur.fetchone()['product_id']

#         conn.commit()

#         return jsonify({'message': 'Product added successfully', 'product_id': new_id}), 201

#     except Exception as e:
#         conn.rollback()
#         return jsonify({'error': str(e)}), 500

#     finally:
#         cur.close()
#         release_conn(conn)

# # ---------------- READ / LIST PRODUCTS ----------------
# @product_bp.route('/', methods=['GET'])
# def get_products():
#     search = request.args.get('search', '')
#     conn = get_conn()
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     try:
#         query = "SELECT * FROM product_management WHERE flag = 'A'"
#         params = []

#         if search:
#             query += " AND (product_name_english ILIKE %s OR category_id::text ILIKE %s)"
#             params = [f"%{search}%", f"%{search}%"]

#         query += " ORDER BY product_id ASC"
#         cur.execute(query, params)
#         rows = cur.fetchall()

#         products = []
#         for p in rows:
#             # images list
#             img_urls = []
#             if p.get("product_images"):
#                 try:
#                     img_list = p["product_images"]  # bytea[]
#                     for idx in range(len(img_list)):
#                         img_urls.append(f"/product/image/{p['product_id']}/{idx}")
#                 except Exception:
#                     img_urls = []

#             # format expiry
#             expiry = None
#             if p.get("expiry_date"):
#                 expiry = p["expiry_date"].strftime("%Y-%m-%d")

#             # build perfect object for React
#             products.append({
#                 "product_id": p["product_id"],
#                 "supplier_id": p["supplier_id"],
#                 "company_name_english": p["company_name_english"],
#                 "branch_name_english": p["branch_name_english"],
#                 "store_name_english": p["store_name_english"],

#                 "product_name_english": p["product_name_english"],
#                 "product_name_arabic": p.get("product_name_arabic"),

#                 "category_id": p.get("category_id"),
#                 "sub_category_id": p.get("sub_category_id"),

#                 "unit_of_measure": p.get("unit_of_measure"),
#                 "currency": p.get("currency") or "QAR ",
#                 "price_per_unit": p.get("price_per_unit"),
#                 "minimum_order_quantity": p.get("minimum_order_quantity"),
#                 "stock_availability": p.get("stock_availability"),

#                 "expiry_date": expiry,
#                 "shelf_life": p.get("shelf_life"),
#                 "expiry_time": p.get("expiry_time"),

#                 "description": p.get("description"),
#                 "images": img_urls
#             })

#         return jsonify(products), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         release_conn(conn)


# @product_bp.route('/product/image/<int:product_id>/<int:index>')
# def get_single_image(product_id, index):
#     conn = get_conn()
#     cur = conn.cursor()
#     cur.execute("SELECT product_images FROM product_management WHERE product_id = %s", (product_id,))
#     row = cur.fetchone()
#     cur.close()
#     release_conn(conn)

#     if not row or not row[0]:
#         return "", 404

#     images = row[0]  # <-- Already bytea array (list of bytes)

#     if index >= len(images):
#         return "", 404

#     image_bytes = images[index]

#     return current_app.response_class(image_bytes, mimetype="image/jpeg")

# # ---------------- UPDATE ----------------
# @product_bp.route('/<int:product_id>', methods=['PUT'])
# def update_product(product_id):
#     data = request.form
#     # file = request.files.get('product_images')
#     files = request.files.getlist('product_images')
#     images_bytes = images_to_bytes_array(files)
#     supplier_id = data.get('supplier_id') or None

#     conn = get_conn()
#     cur = conn.cursor(cursor_factory=RealDictCursor)
#     try:
#         # cur.execute('SELECT product_images FROM product_management WHERE product_id = %s', (product_id,))
#         # old_row = cur.fetchone()
#         # old_image = old_row['product_images'] if old_row else None

#         # image_bytes = image_to_bytes(file) if file else old_image
        
#         product_name_english = (data.get('product_name_english') or '').strip()
#         product_name_arabic = (data.get('product_name_arabic') or '').strip()
#         if not product_name_arabic and product_name_english:
#             product_name_arabic = translate_to_arabic(product_name_english)

#         company_name_english = None
#         if supplier_id:
#             cur.execute('SELECT company_name_english FROM supplier_registration WHERE supplier_id = %s', (supplier_id,))
#             r = cur.fetchone()
#             company_name_english = r['company_name_english'] if r else None

#         branch_name_english = ''
#         store_name_english = ''
#         branch_id = data.get('branch_id')
#         store_id = data.get('store_id')
#         if branch_id:
#             cur.execute('SELECT branch_name_english FROM supplier_branch_registration WHERE branch_id = %s', (branch_id,))
#             br = cur.fetchone()
#             branch_name_english = br['branch_name_english'] if br else ''
#         if store_id:
#             cur.execute('SELECT store_name_english FROM supplier_store_registration WHERE store_id = %s', (store_id,))
#             st = cur.fetchone()
#             store_name_english = st['store_name_english'] if st else ''

#         price_per_unit = float(data.get('price_per_unit')) if data.get('price_per_unit') not in (None, '') else None
#         # discount_percent = int(data.get('discount_percent')) if data.get('discount_percent') and str(data.get('discount_percent')).isdigit() else None

#         cur.execute('''
#             UPDATE product_management
#             SET supplier_id = %s, company_name_english = %s, branch_name_english = %s, store_name_english = %s,
#                 product_name_english = %s, product_name_arabic = %s, category_id = %s, sub_category_id = %s,
#                 unit_of_measure = %s, price_per_unit = %s, currency = %s, minimum_order_quantity = %s,
#                 stock_availability = %s, product_images = %s,
#                 expiry_date = %s, shelf_life = %s, expiry_time = %s,
#                 description = %s, updated_at = NOW()
#             WHERE product_id = %s
#         ''', (
#             supplier_id, company_name_english, branch_name_english, store_name_english,
#             product_name_english, product_name_arabic, data.get('category_id'), data.get('sub_category_id'),
#             data.get('unit_of_measure'), price_per_unit, data.get('currency', 'QAR '),
#             data.get('minimum_order_quantity'), data.get('stock_availability'), images_bytes,
#             data.get('expiry_date'), data.get('shelf_life'), data.get('expiry_time'),
#             data.get('description'), product_id
#         ))

#         conn.commit()
#         return jsonify({'message': 'Product updated successfully'}), 200

#     except Exception as e:
#         conn.rollback()
#         return jsonify({'error': str(e)}), 500

#     finally:
#         cur.close()
#         release_conn(conn)

# # ---------------- DELETE ----------------
# @product_bp.route('/<int:product_id>', methods=['DELETE'])
# def delete_product(product_id):
#     conn = get_conn()
#     cur = conn.cursor()
#     try:
#         cur.execute('DELETE FROM product_management WHERE product_id = %s', (product_id,))
#         conn.commit()
#         return jsonify({'message': 'Product deleted'}), 200
#     except Exception as e:
#         conn.rollback()
#         return jsonify({'error': str(e)}), 500
#     finally:
#         cur.close()
#         release_conn(conn)

# # # ===============================
# # # LOW STOCK EMAIL HELPER
# # # ===============================
# # def send_low_stock_email(supplier_id, product_id, stock):
# #     try:
# #         conn = get_db_connection()
# #         cur = conn.cursor(cursor_factory=RealDictCursor)

# #         cur.execute("""
# #             SELECT contact_person_email, company_name_english
# #             FROM supplier_registration
# #             WHERE supplier_id = %s
# #         """, (supplier_id,))
# #         supplier = cur.fetchone()

# #         cur.execute("""
# #             SELECT product_name_english
# #             FROM product_management
# #             WHERE product_id = %s
# #         """, (product_id,))
# #         product = cur.fetchone()

# #         cur.close()
# #         conn.close()

# #         if not supplier or not supplier["contact_person_email"]:
# #             return

# #         msg = Message(
# #             subject="⚠️ Low Stock Alert",
# #             recipients=[supplier["contact_person_email"]],
# #             body=f"""
# # LOW STOCK ALERT

# # Company: {supplier["company_name_english"]}
# # Product: {product["product_name_english"]}
# # Remaining Stock: {stock}

# # Please restock soon.
# # — Mahal Inventory System
# # """
# #         )

# #         mail.send(msg)   # ✅ NO app_context needed

# #     except Exception as e:
# #         print("❌ Low stock email failed:", e)


# # # ===============================
# # # OUT OF STOCK EMAIL HELPER
# # # ===============================
# # def send_out_of_stock_email(supplier_id, product_id):
# #     try:
# #         conn = get_db_connection()
# #         cur = conn.cursor(cursor_factory=RealDictCursor)

# #         cur.execute("""
# #             SELECT contact_person_email, company_name_english
# #             FROM supplier_registration
# #             WHERE supplier_id = %s
# #         """, (supplier_id,))
# #         supplier = cur.fetchone()

# #         cur.execute("""
# #             SELECT product_name_english
# #             FROM product_management
# #             WHERE product_id = %s
# #         """, (product_id,))
# #         product = cur.fetchone()

# #         cur.close()
# #         conn.close()

# #         if not supplier or not supplier["contact_person_email"]:
# #             return

# #         msg = Message(
# #             subject="🚨 OUT OF STOCK ALERT",
# #             recipients=[supplier["contact_person_email"]],
# #             body=f"""
# # OUT OF STOCK ALERT

# # Company: {supplier["company_name_english"]}
# # Product: {product["product_name_english"]}

# # ⚠️ This product is COMPLETELY OUT OF STOCK.
# # Immediate restocking is required.

# # — Mahal Inventory System
# # """
# #         )

# #         mail.send(msg)

# #     except Exception as e:
# #         print("❌ Out of stock email failed:", e)


# # @product_bp.route("/update-stock", methods=["POST"])
# # def update_stock():
# #     token = request.headers.get("Authorization", "").replace("Bearer ", "")

# #     if not token:
# #         return jsonify({"error": "Unauthorized"}), 401

# #     try:
# #         decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
# #         supplier_id = decoded["linked_id"]  # ✅ TRUSTED
# #         role = decoded["role"]

# #         if role != "supplier":
# #             return jsonify({"error": "Forbidden"}), 403

# #     except Exception:
# #         return jsonify({"error": "Invalid token"}), 401 

# #     data = request.get_json()
# #     product_id = data.get("product_id") 
# #     new_stock = data.get("stock")

# #     conn = get_conn()
# #     cur = conn.cursor(cursor_factory=RealDictCursor)

# #     try:
# #         # FETCH OLD STOCK
# #         cur.execute(
# #             """
# #             SELECT stock_availability
# #             FROM product_management
# #             WHERE product_id = %s
# #               AND supplier_id = %s
# #             """,
# #             (product_id, supplier_id)
# #         )

# #         row = cur.fetchone()
# #         if not row:
# #             return jsonify({"error": "Product not owned by supplier"}), 403

# #         old_stock = row["stock_availability"]

# #         # UPDATE STOCK
# #         cur.execute(
# #             "UPDATE product_management SET stock_availability = %s WHERE product_id = %s",
# #             (new_stock, product_id)
# #         )

# #         conn.commit()

# #         # 🔔 LOW STOCK EMAIL ALERT (NEW)
# #         LOW_STOCK_THRESHOLD = 10
# #         if new_stock <= LOW_STOCK_THRESHOLD and old_stock > LOW_STOCK_THRESHOLD:
# #             send_low_stock_email(supplier_id, product_id, new_stock)

# #         return jsonify({"message": "Stock updated"}), 200

# #     except Exception as e:
# #         conn.rollback()
# #         return jsonify({"error": str(e)}), 500

# #     finally:
# #         cur.close()
# #         release_conn(conn)
# @product_bp.route('/inventory', methods=['GET'])
# def get_inventory():
#     supplier_id = request.args.get('supplier_id')
#     flag = request.args.get('flag', 'A')

#     if not supplier_id:
#         return jsonify({"error": "supplier_id is required"}), 400

#     conn = get_conn()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT
#                 product_id,
#                 product_name_english,
#                 product_name_arabic,
#                 price_per_unit,
#                 stock_availability,
#                 minimum_order_quantity,
#                 currency,
#                 unit_of_measure,
#                 expiry_date,
#                 expiry_time,
#                 product_images
#             FROM product_management
#             WHERE supplier_id = %s
#               AND flag = %s
#             ORDER BY product_id
#         """, (supplier_id, flag))

#         rows = cur.fetchall()

#         for row in rows:
#             raw_images = row.get("product_images") or []
#             encoded_images = []

#             for img in raw_images:
#                 if img:
#                     encoded_images.append(
#                         "data:image/jpeg;base64," +
#                         base64.b64encode(bytes(img)).decode("utf-8")
#                     )

#             # ✅ frontend expects this
#             row["product_images"] = encoded_images

#         return jsonify(rows), 200

#     except Exception as e:
#         print("INVENTORY ERROR:", repr(e))
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         release_conn(conn)


# # @product_bp.route("/update-image/<int:product_id>", methods=["POST"])
# # def update_product_image(product_id):
# #     token = request.headers.get("Authorization", "").replace("Bearer ", "")

# #     if not token:
# #         return jsonify({"error": "Unauthorized"}), 401

# #     try:
# #         decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
# #         supplier_id = decoded["linked_id"]
# #         role = decoded["role"]

# #         if role != "supplier":
# #             return jsonify({"error": "Forbidden"}), 403
# #     except Exception:
# #         return jsonify({"error": "Invalid token"}), 401

# #     if "image" not in request.files:
# #         return jsonify({"error": "No image uploaded"}), 400

# #     image_file = request.files["image"]
# #     image_bytes = image_file.read()

# #     conn = get_conn()
# #     cur = conn.cursor()

# #     try:
# #         # ownership check
# #         cur.execute("""
# #             SELECT 1 FROM product_management
# #             WHERE product_id = %s AND supplier_id = %s
# #         """, (product_id, supplier_id))

# #         if not cur.fetchone():
# #             return jsonify({"error": "Product not owned by supplier"}), 403

# #         # update image (bytea[])
# #         cur.execute("""
# #             UPDATE product_management
# #             SET product_images = ARRAY[%s]
# #             WHERE product_id = %s
# #         """, (psycopg2.Binary(image_bytes), product_id))

# #         conn.commit()

# #         return jsonify({"message": "Image updated successfully"}), 200

# #     except Exception as e:
# #         conn.rollback()
# #         return jsonify({"error": str(e)}), 500

# #     finally:
# #         cur.close()
# #         release_conn(conn)



# @product_bp.route("/update-inventory", methods=["PUT"])
# def update_inventory():
#     token = request.headers.get("Authorization", "").replace("Bearer ", "")

#     if not token:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#         supplier_id = decoded["linked_id"]
#         role = decoded["role"]

#         if role != "supplier":
#             return jsonify({"error": "Forbidden"}), 403

#     except Exception:
#         return jsonify({"error": "Invalid token"}), 401

#     data = request.get_json()

#     product_id = data.get("product_id")
#     stock = data.get("stock")
#     price = data.get("price_per_unit")
#     expiry_date = data.get("expiry_date")
#     expiry_time = data.get("expiry_time")
#     min_qty = data.get("minimum_order_quantity")
#     currency = data.get("currency")
#     uom = data.get("unit_of_measure")


#     if not product_id:
#         return jsonify({"error": "product_id required"}), 400

#     conn = get_conn()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         # 🔍 Fetch current stock + alert flags
#         cur.execute("""
#             SELECT
#                 stock_availability,
#                 low_stock_alert_sent,
#                 out_of_stock_alert_sent
#             FROM product_management
#             WHERE product_id = %s
#               AND supplier_id = %s
#         """, (product_id, supplier_id))

#         row = cur.fetchone()
#         if not row:
#             return jsonify({"error": "Product not owned by supplier"}), 403

#         old_stock = row["stock_availability"]
#         low_sent = row["low_stock_alert_sent"]
#         out_sent = row["out_of_stock_alert_sent"]
#         # 🧠 If frontend didn't send stock, use DB stock
#         effective_stock = stock if stock is not None else old_stock

#         # 🔄 Update inventory fields
#         cur.execute("""
#             UPDATE product_management
#             SET
#                 stock_availability = COALESCE(%s, stock_availability),
#                 price_per_unit = COALESCE(%s, price_per_unit),
#                 minimum_order_quantity = COALESCE(%s, minimum_order_quantity),
#                 currency = COALESCE(%s, currency),
#                 unit_of_measure = COALESCE(%s, unit_of_measure),
#                 expiry_date = COALESCE(%s, expiry_date),
#                 expiry_time = COALESCE(%s, expiry_time)
#             WHERE product_id = %s
#         """, (
#             stock,
#             price,
#             min_qty,
#             currency,
#             uom,
#             expiry_date,
#             expiry_time,
#             product_id
#         ))

#         conn.commit()

#         LOW_STOCK_THRESHOLD = 10

#         # 🔴 OUT OF STOCK — send ONCE
#         if effective_stock == 0 and not out_sent:
#             send_out_of_stock_email(supplier_id, product_id)
#             cur.execute("""
#                 UPDATE product_management
#                 SET out_of_stock_alert_sent = TRUE
#                 WHERE product_id = %s
#             """, (product_id,))
#             conn.commit()

#         # 🟠 LOW STOCK — send ONCE (even if already 10)
#         elif 0 < effective_stock <= LOW_STOCK_THRESHOLD and not low_sent:
#             send_low_stock_email(supplier_id, product_id, stock)
#             cur.execute("""
#                 UPDATE product_management
#                 SET low_stock_alert_sent = TRUE
#                 WHERE product_id = %s
#             """, (product_id,))
#             conn.commit()

#         # 🟢 RESET FLAGS WHEN STOCK IS HEALTHY AGAIN
#         elif effective_stock > LOW_STOCK_THRESHOLD:
#             cur.execute("""
#                 UPDATE product_management
#                 SET
#                     low_stock_alert_sent = FALSE,
#                     out_of_stock_alert_sent = FALSE
#                 WHERE product_id = %s
#             """, (product_id,))
#             conn.commit()

#         return jsonify({"message": "Inventory updated successfully"}), 200

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         release_conn(conn)

# # @product_bp.route("/update-inventory", methods=["PUT"])
# # def update_inventory():

# #     DEV_MODE = True

# #     # DEV MODE supplier
# #     supplier_id = 38

# #     data = request.get_json()

# #     try:
# #         product_id = int(data["product_id"])
# #         stock = int(data["stock"])
# #         price = float(data["price_per_unit"])
# #         name_en = data["product_name_english"]
# #         name_ar = data["product_name_arabic"]

# #     except (KeyError, ValueError, TypeError):
# #         return jsonify({"error": "Invalid or missing fields"}), 400

# #     conn = get_conn()
# #     cur = conn.cursor()

# #     try:
# #         cur.execute("""
# #             UPDATE product_management
# #             SET
# #                 product_name_english = %s,
# #                 product_name_arabic  = %s,
# #                 stock_availability   = %s,
# #                 price_per_unit       = %s
# #             WHERE product_id = %s
# #               AND supplier_id = %s
# #         """, (
# #             name_en,
# #             name_ar,
# #             stock,
# #             price,
# #             product_id,
# #             supplier_id
# #         ))

# #         conn.commit()

# #         return jsonify({"message": "Product updated"}), 200

# #     except Exception as e:
# #         conn.rollback()
# #         return jsonify({"error": str(e)}), 500

# #     finally:
# #         cur.close()
# #         release_conn(conn)

# @product_bp.route("/upload-images/<int:product_id>", methods=["POST"])
# def upload_product_images(product_id):
#     token = request.headers.get("Authorization", "").replace("Bearer ", "")
#     if not token:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#         supplier_id = decoded["linked_id"]
#         role = decoded["role"]
#         if role != "supplier":
#             return jsonify({"error": "Forbidden"}), 403
#     except Exception:
#         return jsonify({"error": "Invalid token"}), 401

#     images = request.files.getlist("images")
#     if not images:
#         return jsonify({"error": "No images uploaded"}), 400

#     conn = get_conn()
#     cur = conn.cursor()

#     try:
#         # Ownership + existing images
#         cur.execute("""
#             SELECT product_images
#             FROM product_management
#             WHERE product_id = %s AND supplier_id = %s
#         """, (product_id, supplier_id))

#         row = cur.fetchone()
#         if not row:
#             return jsonify({"error": "Product not owned by supplier"}), 403

#         existing_images = row[0]

#         # ✅ NORMALIZE TO ARRAY
#         if existing_images is None:
#             existing_images = []
#         elif not isinstance(existing_images, list):
#             existing_images = [existing_images]

#         new_images = [psycopg2.Binary(img.read()) for img in images]

#         cur.execute("""
#             UPDATE product_management
#             SET product_images = %s
#             WHERE product_id = %s
#         """, (existing_images + new_images, product_id))

#         conn.commit()
#         return jsonify({"message": f"{len(new_images)} image(s) uploaded"}), 200

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         release_conn(conn)


# @product_bp.route("/base64", methods=["POST"])
# def add_product_base64():
#     conn = None
#     cur = None

#     try:
#         data = request.get_json() or {}

#         supplier_id = data.get("supplier_id")
#         if not supplier_id:
#             return jsonify({"error": "supplier_id required"}), 400

#         # 🔥 Decode base64 images
#         images = data.get("images", [])
#         image_bytes = []

#         for img in images:
#             if img and img.get("base64"):
#                 image_bytes.append(base64.b64decode(img["base64"]))

#         # 🔢 Safe numeric conversion
#         price = data.get("price_per_unit")
#         price = float(price) if price not in (None, "", "null") else None

#         product_name_english = (data.get("product_name_english") or "").strip()
#         product_name_arabic = (data.get("product_name_arabic") or "").strip()

#         if not product_name_arabic and product_name_english:
#             product_name_arabic = translate_to_arabic(product_name_english)

#         conn = get_conn()
#         cur = conn.cursor(cursor_factory=RealDictCursor)

#         # ✅ FETCH COMPANY NAME (IMPORTANT FIX)
#         cur.execute(
#             "SELECT company_name_english FROM supplier_registration WHERE supplier_id=%s",
#             (supplier_id,)
#         )
#         row = cur.fetchone()
#         company_name_english = row["company_name_english"] if row else ""

#         # optional (safe defaults)
#         branch_name_english = ""
#         store_name_english = ""

#         cur.execute("""
#             INSERT INTO product_management (
#                 supplier_id,
#                 company_name_english,
#                 branch_name_english,
#                 store_name_english,
#                 product_name_english,
#                 product_name_arabic,
#                 category_id,
#                 sub_category_id,
#                 unit_of_measure,
#                 currency,
#                 price_per_unit,
#                 minimum_order_quantity,
#                 stock_availability,
#                 product_images,
#                 expiry_date,
#                 expiry_time,
#                 shelf_life,
#                 description,
#                 product_status,
#                 flag
#             )
#             VALUES (
#                 %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
#                 %s,%s,%s,%s,%s,%s,%s,%s,'Pending Approval','A'
#             )
#             RETURNING product_id
#         """, (
#             supplier_id,
#             company_name_english,      # ✅ FIXED
#             branch_name_english,
#             store_name_english,
#             product_name_english,
#             product_name_arabic,
#             data.get("category_id"),
#             data.get("sub_category_id"),
#             data.get("unit_of_measure"),
#             data.get("currency", "QAR "),
#             price,
#             data.get("minimum_order_quantity"),
#             data.get("stock_availability"),
#             image_bytes,
#             data.get("expiry_date"),
#             data.get("expiry_time"),
#             data.get("shelf_life"),
#             data.get("description")
#         ))

#         pid = cur.fetchone()["product_id"]
#         conn.commit()

#         return jsonify({
#             "message": "Product added successfully",
#             "product_id": pid
#         }), 201

#     except Exception as e:
#         print("🔥 BASE64 ERROR:", e)
#         if conn:
#             conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if cur:
#             cur.close()
#         if conn:
#             release_conn(conn)

# @product_bp.route("/<int:product_id>/delete", methods=["DELETE"])
# def soft_delete_product(product_id):
#     token = request.headers.get("Authorization", "").replace("Bearer ", "")
#     decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#     supplier_id = decoded["linked_id"]

#     conn = get_conn()
#     cur = conn.cursor()

#     try:
#         cur.execute("""
#             UPDATE product_management
#             SET flag = 'D', updated_at = NOW()
#             WHERE product_id = %s
#               AND supplier_id = %s
#               AND flag = 'A'
#         """, (product_id, supplier_id))

#         if cur.rowcount == 0:
#             return jsonify({"error": "Product not found or already deleted"}), 404

#         conn.commit()
#         return jsonify({"message": "Product removed from inventory"}), 200

#     finally:
#         cur.close()
#         release_conn(conn)

# @product_bp.route("/<int:product_id>/restore", methods=["PUT"])
# def restore_product(product_id):
#     token = request.headers.get("Authorization", "").replace("Bearer ", "")

#     if not token:
#         return jsonify({"error": "Unauthorized"}), 401

#     try:
#         decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
#         supplier_id = decoded["linked_id"]
#         role = decoded["role"]

#         if role != "supplier":
#             return jsonify({"error": "Forbidden"}), 403

#     except jwt.ExpiredSignatureError:
#         return jsonify({"error": "Token expired"}), 401
#     except jwt.InvalidTokenError:
#         return jsonify({"error": "Invalid token"}), 401

#     conn = get_conn()
#     cur = conn.cursor()

#     try:
#         cur.execute("""
#             UPDATE product_management
#             SET flag = 'A', updated_at = NOW()
#             WHERE product_id = %s
#               AND supplier_id = %s
#               AND flag = 'D'
#         """, (product_id, supplier_id))

#         if cur.rowcount == 0:
#             return jsonify({
#                 "error": "Product not found or already active"
#             }), 404

#         conn.commit()
#         return jsonify({
#             "message": "Product restored successfully"
#         }), 200

#     except Exception as e:
#         conn.rollback()
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
        # release_conn(conn)













from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_cors import CORS
from psycopg2 import pool, Binary
from psycopg2.extras import RealDictCursor
import base64
import os
import time, pickle
import pandas as pd
import zipfile
from io import BytesIO
from deep_translator import GoogleTranslator
import requests
from werkzeug.utils import secure_filename
from flask import request
import jwt
import datetime
import psycopg2

JWT_SECRET = "MAHAL_SUPER_SECRET_2025"

from flask import current_app
from flask_mail import Message
from db import get_db_connection
from app import mail
from psycopg2.extras import RealDictCursor

from services.inventory_alerts import (
    send_low_stock_email,
    send_out_of_stock_email
)



product_bp = Blueprint('product_bp', __name__)
CORS(
    product_bp,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=False
)


# ---------------- DB POOL ----------------
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "database": os.getenv("DB_NAME", "MAHALDATABASE"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "S@ndeep9392"),
}

_db_pool = pool.SimpleConnectionPool(1, 20, **DB_CONFIG)

def get_conn():
    return _db_pool.getconn()

def release_conn(conn):
    try:
        _db_pool.putconn(conn)
    except Exception:
        pass

# ---------------- Paths & Template ----------------
BASE_DIR = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))
TEMPLATE_DIR = os.path.join(PROJECT_ROOT, 'templates')
UPLOAD_DIR = os.path.join(PROJECT_ROOT, 'uploads')  # temporary excel storage
os.makedirs(TEMPLATE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
TEMPLATE_FILE = os.path.join(TEMPLATE_DIR, 'ProductUploadTemplate.xlsx')

# ---------------- Helpers ----------------
def parse_date(value):
    if pd.isnull(value):
        return None
    try:
        return pd.to_datetime(value).date()
    except Exception:
        return None

def normalize_columns(df):
    df = df.copy()
    df.columns = [str(c).strip().lower().replace(' ', '_') for c in df.columns]
    return df

def translate_to_arabic(text) -> str:
    if text is None:
        return ''
    text = str(text).strip()
    if not text:
        return ''
    try:
        return GoogleTranslator(source='en', target='ar').translate(text)
    except Exception:
        try:
            resp = requests.post(
                'https://libretranslate.com/translate',
                data={"q": text, "source": "en", "target": "ar", "format": "text"},
                timeout=8
            )
            if resp.status_code == 200:
                return resp.json().get('translatedText', text)
        except Exception:
            pass
    return text

def make_unique_filename(orig_name: str) -> str:
    safe = secure_filename(orig_name)
    ts = int(time.time() * 1000)
    return f"{ts}_{safe}"

# def image_to_bytes(file_storage):
#     if not file_storage:
#         return None
#     file_bytes = file_storage.read()
#     file_storage.seek(0)
#     return Binary(file_bytes)

def images_to_bytes_array(file_list):
    """ Convert list of FileStorage to raw list of bytes (bytea[] for PostgreSQL) """
    if not file_list:
        return None
    binaries = []
    for f in file_list:
        binaries.append(f.read())
        f.seek(0)
    return binaries   # return list → stored as bytea[]

def extract_zip_to_dict(zip_file):
    """
    Extract ZIP images into dictionary:
    { "filename.jpg": b'filebytes' }
    """
    images = {}
    try:
        with zipfile.ZipFile(zip_file) as z:
            for name in z.namelist():
                # ignore folders in ZIP
                clean_name = os.path.basename(name)

                if clean_name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                    images[clean_name] = z.read(name)

        return images
    except Exception as e:
        print("ZIP Extract Error:", e)
        return {}


def ensure_template_exists():
    columns = [
        'product_name_english',
        'category_name',
        'sub_category_name',
        'unit_of_measure',
        'country_of_origin',
        'currency',
        'price_per_unit',
        'minimum_order_quantity',
        'stock_availability',
        'product_images',
        'expiry_date',
        'shelf_life',
        'expiry_time',
        'description'
    ]
    df = pd.DataFrame(columns=columns)
    df.to_excel(TEMPLATE_FILE, index=False)


# Ensure template on import
ensure_template_exists()



def normalize_time(t):
    """
    Accepts:
    - None
    - ""
    - "HH:MM"
    - "HH:MM:SS"

    Returns:
    - None or "HH:MM:SS"
    """
    if not t or str(t).strip() == "":
        return None

    t = str(t).strip()
    return t if len(t) == 8 else f"{t}:00"


def normalize_date(d):
    """
    Accepts:
    - None
    - ""
    - "YYYY-MM-DD"
    """
    if not d or str(d).strip() == "":
        return None
    return d


# def serialize_row(row):
#     """
#     Convert date / time / datetime objects to JSON-safe strings
#     """
#     for k, v in row.items():
#         if hasattr(v, "isoformat"):
#             row[k] = v.isoformat()
#     return row

def serialize_row(obj):
    if isinstance(obj, dict):
        return {k: serialize_row(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_row(v) for v in obj]
    elif isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    elif isinstance(obj, datetime.time):
        return obj.strftime("%H:%M:%S")
    else:
        return obj

@product_bp.route('/upload', methods=['POST'])
def upload_products():
    """Bulk Excel upload with ZIP images + AUTO-CREATE category/sub-category"""
    try:
        # -----------------------------
        # 1️⃣ Excel validation
        # -----------------------------
        if 'file' not in request.files:
            return jsonify({'error': 'Excel file missing'}), 400

        excel_file = request.files['file']
        if excel_file.filename == '':
            return jsonify({'error': 'Excel file is empty'}), 400

        supplier_id = request.form.get("supplier_id")
        branch_id = request.form.get("branch_id")
        store_id = request.form.get("store_id")

        if not supplier_id:
            return jsonify({'error': 'supplier_id required'}), 400

        # -----------------------------
        # 2️⃣ Handle ZIP images
        # -----------------------------
        images_zip = request.files.get("images_zip")
        uploaded_images = extract_zip_to_dict(images_zip) if images_zip else {}

        # -----------------------------
        # 3️⃣ Save Excel temporarily
        # -----------------------------
        temp_path = os.path.join(UPLOAD_DIR, make_unique_filename(excel_file.filename))
        excel_file.save(temp_path)

        try:
            df = pd.read_excel(temp_path, engine="openpyxl")
        finally:
            try:
                os.remove(temp_path)
            except:
                pass

        if df.empty:
            return jsonify({'error': 'Excel file contains no data'}), 400

        df = normalize_columns(df)

        required = [
            'product_name_english',
            'category_name',
            'sub_category_name',
            'price_per_unit',
            'stock_availability'
        ]
        missing = [c for c in required if c not in df.columns]
        if missing:
            return jsonify({'error': f"Missing column(s): {', '.join(missing)}"}), 400

        # -----------------------------
        # 4️⃣ DB Connection
        # -----------------------------
        conn = get_conn()
        cur = conn.cursor()

        # Supplier details
        cur.execute(
            "SELECT company_name_english FROM supplier_registration WHERE supplier_id=%s",
            (supplier_id,)
        )
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'Invalid supplier_id'}), 400
        company_name_english = row[0]

        branch_name_english = ''
        store_name_english = ''

        if branch_id:
            cur.execute(
                "SELECT branch_name_english FROM supplier_branch_registration WHERE branch_id=%s",
                (branch_id,)
            )
            r = cur.fetchone()
            branch_name_english = r[0] if r else ''

        if store_id:
            cur.execute(
                "SELECT store_name_english FROM supplier_store_registration WHERE store_id=%s",
                (store_id,)
            )
            r = cur.fetchone()
            store_name_english = r[0] if r else ''

        # -----------------------------
        # 5️⃣ Helpers
        # -----------------------------
        def clean(val):
            if not val or str(val).strip() == "":
                return None
            return " ".join(str(val).strip().lower().split())

        # -----------------------------
        # 6️⃣ Process Rows
        # -----------------------------
        imported = 0
        errors = []

        for idx, row in df.iterrows():
            try:
                r = row.to_dict()

                product_name = str(r.get("product_name_english") or "").strip()
                if not product_name:
                    raise Exception("product_name_english is required")

                product_arabic = translate_to_arabic(product_name)
                description = r.get("description") or ""

                # ===== CATEGORY AUTO-CREATE =====
                cat_raw = r.get("category_name")
                cat_clean = clean(cat_raw)

                if not cat_clean:
                    raise Exception("category_name is required")

                cur.execute(
                    "SELECT id FROM category WHERE LOWER(TRIM(name)) = %s",
                    (cat_clean,)
                )
                row_cat = cur.fetchone()

                if row_cat:
                    category_id = row_cat[0]
                else:
                    cur.execute(
                        "INSERT INTO category (name, flag) VALUES (%s, 'A') RETURNING id",
                        (cat_raw.strip(),)
                    )
                    category_id = cur.fetchone()[0]

                # ===== SUB-CATEGORY AUTO-CREATE =====
                subcat_raw = r.get("sub_category_name")
                subcat_clean = clean(subcat_raw)
                sub_category_id = None

                if subcat_clean:
                    cur.execute(
                        """
                        SELECT id FROM sub_category
                        WHERE category_id = %s
                          AND LOWER(TRIM(name)) = %s
                        """,
                        (category_id, subcat_clean)
                    )
                    row_sub = cur.fetchone()

                    if row_sub:
                        sub_category_id = row_sub[0]
                    else:
                        cur.execute(
                            """
                            INSERT INTO sub_category (category_id, name, flag)
                            VALUES (%s, %s, 'A')
                            RETURNING id
                            """,
                            (category_id, subcat_raw.strip())
                        )
                        sub_category_id = cur.fetchone()[0]

                # ===== IMAGE MAPPING =====
                img_val = []
                excel_img_field = r.get("product_images") or ""
                image_names = [x.strip() for x in str(excel_img_field).split(",") if x.strip()]

                for name in image_names:
                    if name not in uploaded_images:
                        raise Exception(f"Image not found in ZIP: {name}")
                    img_val.append(uploaded_images[name])

                # ===== INSERT PRODUCT =====
                cur.execute("""
                    INSERT INTO product_management (
                        supplier_id,
                        company_name_english,
                        branch_name_english,
                        store_name_english,
                        product_name_english,
                        product_name_arabic,
                        category_id,
                        sub_category_id,
                        country_of_origin,
                        unit_of_measure,
                        currency,
                        price_per_unit,
                        minimum_order_quantity,
                        stock_availability,
                        product_images,
                        expiry_date,
                        shelf_life,
                        expiry_time,
                        description,
                        product_status,
                        flag
                    )
                    VALUES (
                        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                        'pending approval','A'
                    )
                """, (
                    supplier_id,
                    company_name_english,
                    branch_name_english,
                    store_name_english,
                    product_name,
                    product_arabic,
                    category_id,
                    sub_category_id,
                    r.get("country_of_origin") or "",
                    r.get("unit_of_measure"),
                    r.get("currency") or "QAR ",
                    int(r.get("price_per_unit")) if pd.notnull(r.get("price_per_unit")) else None,
                    int(r.get("minimum_order_quantity")) if pd.notnull(r.get("minimum_order_quantity")) else None,
                    int(r.get("stock_availability")) if pd.notnull(r.get("stock_availability")) else None,
                    img_val,
                    parse_date(r.get("expiry_date")),
                    r.get("shelf_life"),
                    r.get("expiry_time"),
                    description
                ))

                imported += 1

            except Exception as e:
                conn.rollback()
                errors.append({"row": idx + 2, "error": str(e)})

        conn.commit()
        cur.close()
        release_conn(conn)

        return jsonify({
            "message": "Bulk upload completed",
            "imported": imported,
            "errors": errors
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------------- Translate ----------------
@product_bp.route('/translate', methods=['POST'])
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

@product_bp.route('/companies', methods=['GET'])
def get_companies():
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("""
            SELECT 
                supplier_id, 
                company_name_english,
                company_name_arabic
            FROM supplier_registration;
        """)

        companies = cur.fetchall()
        cur.close()
        return jsonify(companies), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        release_conn(conn)

@product_bp.route('/branches', methods=['GET'])
def get_branches():
    supplier_id = request.args.get('supplier_id')
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute('SELECT branch_id, branch_name_english FROM supplier_branch_registration WHERE supplier_id = %s;', (supplier_id,))
        branches = cur.fetchall()
        cur.close()
        return jsonify(branches), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        release_conn(conn)

@product_bp.route('/stores', methods=['GET'])
def get_stores():
    supplier_id = request.args.get('supplier_id')
    conn = get_conn()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute('SELECT store_id, store_name_english FROM supplier_store_registration WHERE supplier_id = %s;', (supplier_id,))
        stores = cur.fetchall()
        cur.close()
        return jsonify(stores), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        release_conn(conn)

@product_bp.route('/categories', methods=['GET'])
def get_categories():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM category WHERE flag = 'A'")
        rows = cur.fetchall()
        cur.close()
        return jsonify([{'id': r[0], 'name': r[1]} for r in rows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        release_conn(conn)

@product_bp.route('/subcategories', methods=['GET'])
def get_subcategories():
    category_id = request.args.get('category_id')
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name FROM sub_category WHERE category_id = %s AND flag = 'A'",
            (category_id,)
        )
        rows = cur.fetchall()
        cur.close()
        return jsonify([{'id': r[0], 'name': r[1]} for r in rows]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        release_conn(conn)

@product_bp.route('/template', methods=['GET'])
def download_template():
    ensure_template_exists()
    return send_from_directory(TEMPLATE_DIR, os.path.basename(TEMPLATE_FILE), as_attachment=True)




# ---------------- CREATE / ADD PRODUCT ----------------
@product_bp.route('/', methods=['POST'])
def add_product():
    data = request.form

    # ✅ MULTIPLE IMAGES
    files = request.files.getlist('product_images')
    images_bytes = images_to_bytes_array(files)

    # ================= FIX 1: SUPPLIER ID =================
    supplier_id = data.get('supplier_id')

    if not supplier_id or str(supplier_id).strip() == "":
        return jsonify({"error": "supplier_id is required"}), 400

    supplier_id = int(supplier_id)

    product_name_english = (data.get('product_name_english') or '').strip()
    product_name_arabic = (data.get('product_name_arabic') or '').strip()

    if not product_name_english:
        return jsonify({"error": "product_name_english is required"}), 400

    if not product_name_arabic:
        product_name_arabic = translate_to_arabic(product_name_english)

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ================= FIX 2: COMPANY NAME (NOT NULL SAFE) =================
        cur.execute(
            'SELECT company_name_english FROM supplier_registration WHERE supplier_id = %s',
            (supplier_id,)
        )
        row = cur.fetchone()

        if not row or not row.get("company_name_english"):
            return jsonify({"error": "Invalid supplier_id"}), 400

        company_name_english = row["company_name_english"]

        # ---------------- Branch / Store ----------------
        branch_name_english = ''
        store_name_english = ''

        branch_id = data.get('branch_id')
        store_id = data.get('store_id')
        country_of_origin = data.get("country_of_origin") or ""

        if branch_id:
            cur.execute(
                'SELECT branch_name_english FROM supplier_branch_registration WHERE branch_id = %s',
                (branch_id,)
            )
            br = cur.fetchone()
            branch_name_english = br['branch_name_english'] if br else ''

        if store_id:
            cur.execute(
                'SELECT store_name_english FROM supplier_store_registration WHERE store_id = %s',
                (store_id,)
            )
            st = cur.fetchone()
            store_name_english = st['store_name_english'] if st else ''

        # ---------------- Numeric Safe Cast ----------------
        try:
            price_per_unit = float(data.get('price_per_unit')) \
                if data.get('price_per_unit') not in (None, '') else None
        except Exception:
            price_per_unit = None

        # ---------------- INSERT ----------------
        cur.execute('''
            INSERT INTO product_management (
                supplier_id,
                company_name_english,
                branch_name_english,
                store_name_english,
                product_name_english,
                product_name_arabic,
                category_id,
                sub_category_id,
                unit_of_measure,
                price_per_unit,
                currency,
                minimum_order_quantity,
                stock_availability,
                product_images,
                expiry_date,
                shelf_life,
                expiry_time,
                description,
                country_of_origin,
                product_status,
                flag
            )
            VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                'pending approval','A'
            )
            RETURNING product_id
        ''', (
            supplier_id,
            company_name_english,
            branch_name_english,
            store_name_english,
            product_name_english,
            product_name_arabic,
            data.get('category_id'),
            data.get('sub_category_id'),
            data.get('unit_of_measure'),
            price_per_unit,
            data.get('currency', 'QAR '),
            data.get('minimum_order_quantity'),
            data.get('stock_availability'),
            images_bytes,
            data.get('expiry_date'),
            data.get('shelf_life'),
            data.get('expiry_time'),
            data.get('description'),
            country_of_origin
        ))

        new_id = cur.fetchone()['product_id']
        conn.commit()

        return jsonify({
            "message": "Product added successfully",
            "product_id": new_id
        }), 201

    except Exception as e:
        conn.rollback()
        print("❌ ADD PRODUCT ERROR:", repr(e))
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        release_conn(conn)


# ---------------- READ / LIST PRODUCTS ----------------
@product_bp.route('/', methods=['GET'])
def get_products():
    search = request.args.get('search', '')
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        query = "SELECT * FROM product_management WHERE flag = 'A'"
        params = []

        if search:
            query += " AND (product_name_english ILIKE %s OR category_id::text ILIKE %s)"
            params = [f"%{search}%", f"%{search}%"]

        query += " ORDER BY product_id ASC"
        cur.execute(query, params)
        rows = cur.fetchall()

        products = []
        for p in rows:
            # images list
            img_urls = []
            if p.get("product_images"):
                try:
                    img_list = p["product_images"]  # bytea[]
                    for idx in range(len(img_list)):
                        img_urls.append(f"/product/image/{p['product_id']}/{idx}")
                except Exception:
                    img_urls = []

            # format expiry
            expiry = None
            if p.get("expiry_date"):
                expiry = p["expiry_date"].strftime("%Y-%m-%d")

            # build perfect object for React
            products.append({
                "product_id": p["product_id"],
                "supplier_id": p["supplier_id"],
                "company_name_english": p["company_name_english"],
                "branch_name_english": p["branch_name_english"],
                "store_name_english": p["store_name_english"],

                "product_name_english": p["product_name_english"],
                "product_name_arabic": p.get("product_name_arabic"),

                "category_id": p.get("category_id"),
                "sub_category_id": p.get("sub_category_id"),

                "unit_of_measure": p.get("unit_of_measure"),
                "currency": p.get("currency") or "QAR ",
                "price_per_unit": p.get("price_per_unit"),
                "minimum_order_quantity": p.get("minimum_order_quantity"),
                "stock_availability": p.get("stock_availability"),

                "expiry_date": expiry,
                "shelf_life": p.get("shelf_life"),
                "expiry_time": p.get("expiry_time"),

                "description": p.get("description"),
                "country_of_origin": p.get("country_of_origin"),
                "images": img_urls
            })

        return jsonify(products), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        release_conn(conn)


@product_bp.route('/product/image/<int:product_id>/<int:index>')
def get_single_image(product_id, index):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT product_images FROM product_management WHERE product_id = %s", (product_id,))
    row = cur.fetchone()
    cur.close()
    release_conn(conn)

    if not row or not row[0]:
        return "", 404

    images = row[0]  # <-- Already bytea array (list of bytes)

    if index >= len(images):
        return "", 404

    image_bytes = images[index]

    return current_app.response_class(image_bytes, mimetype="image/jpeg")

# ---------------- UPDATE ----------------
@product_bp.route('/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.form
    # file = request.files.get('product_images')
    files = request.files.getlist('product_images')
    images_bytes = images_to_bytes_array(files)
    supplier_id = data.get('supplier_id') or None

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # cur.execute('SELECT product_images FROM product_management WHERE product_id = %s', (product_id,))
        # old_row = cur.fetchone()
        # old_image = old_row['product_images'] if old_row else None

        # image_bytes = image_to_bytes(file) if file else old_image
        
        product_name_english = (data.get('product_name_english') or '').strip()
        product_name_arabic = (data.get('product_name_arabic') or '').strip()
        if not product_name_arabic and product_name_english:
            product_name_arabic = translate_to_arabic(product_name_english)

        company_name_english = None
        if supplier_id:
            cur.execute('SELECT company_name_english FROM supplier_registration WHERE supplier_id = %s', (supplier_id,))
            r = cur.fetchone()
            company_name_english = r['company_name_english'] if r else None

        branch_name_english = ''
        store_name_english = ''
        branch_id = data.get('branch_id')
        store_id = data.get('store_id')
        country_of_origin = data.get("country_of_origin") or ""

        if branch_id:
            cur.execute('SELECT branch_name_english FROM supplier_branch_registration WHERE branch_id = %s', (branch_id,))
            br = cur.fetchone()
            branch_name_english = br['branch_name_english'] if br else ''
        if store_id:
            cur.execute('SELECT store_name_english FROM supplier_store_registration WHERE store_id = %s', (store_id,))
            st = cur.fetchone()
            store_name_english = st['store_name_english'] if st else ''

        price_per_unit = float(data.get('price_per_unit')) if data.get('price_per_unit') not in (None, '') else None
        # discount_percent = int(data.get('discount_percent')) if data.get('discount_percent') and str(data.get('discount_percent')).isdigit() else None

        cur.execute('''
            UPDATE product_management
            SET supplier_id = %s, company_name_english = %s, branch_name_english = %s, store_name_english = %s,
                product_name_english = %s, product_name_arabic = %s, category_id = %s, sub_category_id = %s,
                unit_of_measure = %s, price_per_unit = %s, currency = %s, minimum_order_quantity = %s,
                stock_availability = %s, product_images = %s,
                expiry_date = %s, shelf_life = %s, expiry_time = %s,
                description = %s, country_of_origin = %s, updated_at = NOW()
            WHERE product_id = %s
        ''', (
            supplier_id, company_name_english, branch_name_english, store_name_english,
            product_name_english, product_name_arabic, data.get('category_id'), data.get('sub_category_id'),
            data.get('unit_of_measure'), price_per_unit, data.get('currency', 'QAR '),
            data.get('minimum_order_quantity'), data.get('stock_availability'), images_bytes,
            data.get('expiry_date'), data.get('shelf_life'), data.get('expiry_time'),
            data.get('description'), country_of_origin, product_id
        ))

        conn.commit()
        return jsonify({'message': 'Product updated successfully'}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        cur.close()
        release_conn(conn)

# ---------------- DELETE ----------------
@product_bp.route('/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute('DELETE FROM product_management WHERE product_id = %s', (product_id,))
        conn.commit()
        return jsonify({'message': 'Product deleted'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        release_conn(conn)




# @product_bp.route('/inventory', methods=['GET'])
# def get_inventory():
#     supplier_id = request.args.get('supplier_id')
#     flag = request.args.get('flag', 'A')

#     if not supplier_id:
#         return jsonify({"error": "supplier_id is required"}), 400

#     conn = get_conn()
#     cur = conn.cursor(cursor_factory=RealDictCursor)

#     try:
#         cur.execute("""
#             SELECT
#                 pm.product_id,
#                 pm.product_name_english,
#                 pm.product_name_arabic,
#                 pm.price_per_unit,
#                 pm.stock_availability,
#                 pm.minimum_order_quantity,
#                 pm.currency,
#                 pm.country_of_origin,
#                 pm.unit_of_measure,
#                 pm.expiry_date,
#                 pm.expiry_time,
#                 pm.product_images,

#                 -- 🔥 FULL OFFER OBJECT
#                 o.offer_id,
#                 o.offer_title,
#                 o.offer_description,
#                 o.offer_type,
#                 o.discount_percentage,
#                 o.flat_amount,
#                 o.buy_quantity,
#                 o.get_quantity,
#                 o.start_date,
#                 o.end_date,
#                 o.start_time,
#                 o.end_time,
#                 o.is_active,

#                 CASE
#                     WHEN o.offer_id IS NULL THEN NULL
#                     WHEN o.is_active = false THEN 'INACTIVE'
#                     WHEN CURRENT_DATE BETWEEN o.start_date AND o.end_date
#                      AND (
#                         o.start_time IS NULL
#                         OR o.end_time IS NULL
#                         OR CURRENT_TIME BETWEEN o.start_time AND o.end_time
#                      )
#                     THEN 'ACTIVE'
#                     WHEN CURRENT_DATE < o.start_date
#                     THEN 'UPCOMING'
#                     ELSE 'EXPIRED'
#                 END AS offer_status

#             FROM product_management pm

#             LEFT JOIN offers o
#               ON o.product_id = pm.product_id
#              AND o.is_active = TRUE
#              AND CURRENT_DATE BETWEEN o.start_date AND o.end_date
#              AND (
#                   o.start_time IS NULL OR
#                   CURRENT_TIME BETWEEN o.start_time AND o.end_time
#              )

#             WHERE pm.supplier_id = %s
#               AND pm.flag = %s

#             ORDER BY pm.product_id
#         """, (supplier_id, flag))

#         rows = cur.fetchall()
#         safe_rows = []

#         for row in rows:
#             # 🔁 IMAGE ENCODING
#             raw_images = row.get("product_images") or []
#             encoded_images = []

#             for img in raw_images:
#                 if img:
#                     encoded_images.append(
#                         "data:image/jpeg;base64," +
#                         base64.b64encode(bytes(img)).decode("utf-8")
#                     )

#             row["product_images"] = encoded_images

#             # raw_images = row.get("product_images") or []
#             # image_urls = []

#             # for idx, img in enumerate(raw_images):
#             #     image_urls.append(
#             #         f"http://192.168.2.22:5000/product/image/{row['product_id']}/{idx}"
#             #     )

#             # row["product_images"] = image_urls

#             # 🔥 THIS IS THE FIX
#             safe_rows.append(serialize_row(dict(row)))

#         return jsonify(safe_rows), 200


#     except Exception as e:
#         print("INVENTORY ERROR:", repr(e))
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cur.close()
#         release_conn(conn)


@product_bp.route('/inventory', methods=['GET'])
def get_inventory():
    supplier_id = request.args.get('supplier_id')
    flag = request.args.get('flag', 'A')

    if not supplier_id:
        return jsonify({"error": "supplier_id is required"}), 400

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                pm.product_id,
                pm.supplier_id,
                pm.category_id,
                pm.product_name_english,
                pm.product_name_arabic,
                pm.price_per_unit,
                pm.primary_image,
                pm.stock_availability,
                pm.minimum_order_quantity,
                pm.currency,
                pm.country_of_origin,
                pm.unit_of_measure,
                pm.expiry_date,
                pm.expiry_time,
                pm.product_images,
                pm.delivery_time_minutes,

                -- Offer table
                o.offer_id,
                o.offer_type,
                o.discount_percentage,
                o.flat_amount,
                o.start_date AS offer_start_date,
                o.end_date AS offer_end_date,
                o.start_time,
                o.end_time,

                -- Promotions table
                p.id AS promotion_id,
                p.offer_type AS promo_type,
                p.offer_value,
                p.start_date AS promo_start_date,
                p.end_date AS promo_end_date

            FROM product_management pm

            LEFT JOIN offers o
                ON o.product_id = pm.product_id
                AND o.is_active = TRUE
                AND CURRENT_DATE BETWEEN o.start_date AND o.end_date

            LEFT JOIN LATERAL (
                SELECT *
                FROM promotions p
                WHERE p.status IN ('ACTIVE','APPROVED')
                AND CURRENT_DATE BETWEEN p.start_date AND p.end_date
                    
                AND EXISTS (
                    SELECT 1
                    FROM promotion_suppliers ps
                    WHERE ps.promotion_id = p.id
                    AND ps.supplier_id = pm.supplier_id
                    AND ps.status = 'ACCEPTED'
                )

                -- Supplier match
                AND (
                    p.supplier_ids IS NULL
                    OR EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements_text(p.supplier_ids) s
                        WHERE s::int = pm.supplier_id
                    )
                )

                -- Target match
                AND (
                    (p.target_type = 'PRODUCT'
                        AND EXISTS (
                            SELECT 1
                            FROM jsonb_array_elements_text(p.target_ids) elem
                            WHERE elem::int = pm.product_id
                        )
                    )

                    OR

                    (p.target_type = 'CATEGORY'
                        AND EXISTS (
                            SELECT 1
                            FROM jsonb_array_elements_text(p.target_ids) elem
                            WHERE elem::int = pm.category_id
                        )
                    )

                    OR

                    (p.target_type = 'FESTIVAL'
                        AND EXISTS (
                            SELECT 1
                            FROM jsonb_array_elements_text(p.target_ids) elem
                            WHERE elem::int = pm.product_id
                        )
                    )
                )

                ORDER BY
                    CASE p.priority_level
                        WHEN 'HIGH' THEN 1
                        WHEN 'MEDIUM' THEN 2
                        WHEN 'LOW' THEN 3
                        ELSE 4
                    END
                LIMIT 1
            ) p ON TRUE

            WHERE pm.supplier_id = %s
            AND pm.flag = %s

            ORDER BY pm.product_id
        """, (supplier_id, flag))
                
        rows = cur.fetchall()
        safe_rows = []

        for row in rows:

            offer_obj = None

            # 🔴 If normal offer exists → priority 1
            if row["offer_id"]:
                offer_obj = {
                    "offer_status": "ACTIVE",
                    "offer_type": row["offer_type"],
                    "discount_percentage": row["discount_percentage"],
                    "flat_amount": row["flat_amount"],
                    "start_date": row["offer_start_date"],
                    "end_date": row["offer_end_date"],
                    "start_time": row["start_time"],
                    "end_time": row["end_time"],
                    "country_of_origin": row.get("country_of_origin"),
                }

            # 🟢 Else if promotion exists
            # elif row["promotion_id"]:
            elif row.get("promotion_id"):
                offer_obj = {
                    "offer_status": "ACTIVE",
                    "offer_type": "Percentage" if row["promo_type"] == "PERCENTAGE" else "Flat",
                    # "discount_percentage": row["offer_value"] if row["promo_type"] == "PERCENTAGE" else None,
                    # "flat_amount": row["offer_value"] if row["promo_type"] == "FLAT" else None,
                    "discount_percentage": float(row["offer_value"]) if row["promo_type"] == "PERCENTAGE" and row["offer_value"] is not None else None,
                    "flat_amount": float(row["offer_value"]) if row["promo_type"] == "FLAT" and row["offer_value"] is not None else None,
                    "start_date": row["promo_start_date"],
                    "end_date": row["promo_end_date"],
                    "start_time": None,
                    "end_time": None,
                    "country_of_origin": row.get("country_of_origin"),
                }

            if not row.get("offer_id") and not row.get("promotion_id"):
                print("❌ No offer or promotion applied for product:", row["product_id"])

            # 🔁 IMAGE ENCODING
            raw_images = row.get("product_images") or []
            encoded_images = []

            for img in raw_images:
                if img:
                    encoded_images.append(
                        "data:image/jpeg;base64," +
                        base64.b64encode(bytes(img)).decode("utf-8")
                    )

            row["product_images"] = encoded_images
            row["offer"] = offer_obj

            # 🔥 THIS IS THE FIX
            safe_rows.append(serialize_row(dict(row)))

        return jsonify(safe_rows), 200

    except Exception as e:
        print("INVENTORY ERROR:", repr(e))
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        release_conn(conn)

@product_bp.route("/update-inventory", methods=["PUT"])
def update_inventory():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        supplier_id = decoded["linked_id"]
        role = decoded["role"]

        if role != "supplier":
            return jsonify({"error": "Forbidden"}), 403

    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    data = request.get_json() or {}


    name_en = data.get("product_name_english")
    name_ar = data.get("product_name_arabic")

    # 🔥 AUTO TRANSLATE (CRITICAL FIX)
    if name_en and (not name_ar or str(name_ar).strip() == ""):
        name_ar = translate_to_arabic(name_en)
    product_id = data.get("product_id")
    stock = data.get("stock")
    price = data.get("price_per_unit")
    min_qty = data.get("minimum_order_quantity")
    currency = data.get("currency")
    uom = data.get("unit_of_measure")
    delivery_time_minutes = data.get("delivery_time_minutes")
    primary_image = data.get("primary_image")

    # 🔥 NORMALIZED
    expiry_date = normalize_date(data.get("expiry_date"))
    expiry_time = normalize_time(data.get("expiry_time"))

    if not product_id:
        return jsonify({"error": "product_id required"}), 400

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # 🔍 Fetch current stock + alert flags
        cur.execute("""
            SELECT
                stock_availability,
                low_stock_alert_sent,
                out_of_stock_alert_sent,
                product_name_english
            FROM product_management
            WHERE product_id = %s
              AND supplier_id = %s
        """, (product_id, supplier_id))

        row = cur.fetchone()
        product_name = row["product_name_english"]

        if not row:
            return jsonify({"error": "Product not owned by supplier"}), 403

        old_stock = row["stock_availability"]
        low_sent = row["low_stock_alert_sent"]
        out_sent = row["out_of_stock_alert_sent"]

        effective_stock = stock if stock is not None else old_stock

        # 🔄 UPDATE
        cur.execute("""
            UPDATE product_management
            SET
                product_name_english = COALESCE(%s, product_name_english),
                product_name_arabic = COALESCE(%s, product_name_arabic),
                stock_availability = COALESCE(%s, stock_availability),
                price_per_unit = COALESCE(%s, price_per_unit),
                minimum_order_quantity = COALESCE(%s, minimum_order_quantity),
                currency = COALESCE(%s, currency),
                unit_of_measure = COALESCE(%s, unit_of_measure),
                delivery_time_minutes = COALESCE(%s, delivery_time_minutes),
                country_of_origin = COALESCE(%s, country_of_origin),
                primary_image = COALESCE(%s, primary_image),
                expiry_date = COALESCE(%s, expiry_date),
                expiry_time = %s
            WHERE product_id = %s
        """, (
            name_en,
            name_ar,
            stock,
            price,
            min_qty,
            currency,
            uom,
            delivery_time_minutes,
            data.get("country_of_origin"),

            primary_image,
            expiry_date,
            expiry_time,
            product_id
        ))

        conn.commit()

        LOW_STOCK_THRESHOLD = 10

        # 🔴 OUT OF STOCK
        if effective_stock == 0 and not out_sent:
            send_out_of_stock_email(supplier_id, product_id)

            cur.execute("""
                INSERT INTO supplier_notifications
                (supplier_id, type, title, message, reference_id)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                supplier_id,
                "OUT_OF_STOCK",
                "Product Out of Stock",
                f"{product_name} is now out of stock.",
                str(product_id)
            ))

            cur.execute("""
                UPDATE product_management
                SET out_of_stock_alert_sent = TRUE
                WHERE product_id = %s
            """, (product_id,))
            conn.commit()

        # 🟠 LOW STOCK
        elif 0 < effective_stock <= LOW_STOCK_THRESHOLD and not low_sent:
            send_low_stock_email(supplier_id, product_id, effective_stock)

            cur.execute("""
                INSERT INTO supplier_notifications
                (supplier_id, type, title, message, reference_id)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                supplier_id,
                "LOW_STOCK",
                "Low Stock Alert",
                f"{product_name} is running low (only {effective_stock} left).",
                str(product_id)
            ))

            cur.execute("""
                UPDATE product_management
                SET low_stock_alert_sent = TRUE
                WHERE product_id = %s
            """, (product_id,))
            conn.commit()


        # 🟢 RESET FLAGS
        elif effective_stock > LOW_STOCK_THRESHOLD:
            cur.execute("""
                UPDATE product_management
                SET
                    low_stock_alert_sent = FALSE,
                    out_of_stock_alert_sent = FALSE
                WHERE product_id = %s
            """, (product_id,))
            conn.commit()

        return jsonify({"message": "Inventory updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        release_conn(conn)


@product_bp.route("/upload-images/<int:product_id>", methods=["POST"])
def upload_product_images(product_id):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        supplier_id = decoded["linked_id"]
        role = decoded["role"]
        if role != "supplier":
            return jsonify({"error": "Forbidden"}), 403
    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    images = request.files.getlist("images")
    if not images:
        return jsonify({"error": "No images uploaded"}), 400

    conn = get_conn()
    cur = conn.cursor()

    try:
        # Ownership + existing images
        cur.execute("""
            SELECT product_images
            FROM product_management
            WHERE product_id = %s AND supplier_id = %s
        """, (product_id, supplier_id))

        row = cur.fetchone()
        if not row:
            return jsonify({"error": "Product not owned by supplier"}), 403

        existing_images = row[0]

        # ✅ NORMALIZE TO ARRAY
        if existing_images is None:
            existing_images = []
        elif not isinstance(existing_images, list):
            existing_images = [existing_images]

        new_images = [psycopg2.Binary(img.read()) for img in images]

        cur.execute("""
            UPDATE product_management
            SET product_images = %s
            WHERE product_id = %s
        """, (existing_images + new_images, product_id))

        conn.commit()
        return jsonify({"message": f"{len(new_images)} image(s) uploaded"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        release_conn(conn)


@product_bp.route("/base64", methods=["POST"])
def add_product_base64():
    conn = None
    cur = None

    try:
        data = request.get_json() or {}

        supplier_id = data.get("supplier_id")
        if not supplier_id:
            return jsonify({"error": "supplier_id required"}), 400

        # 🔥 Decode base64 images
        images = data.get("images", [])
        image_bytes = []

        for img in images:
            if img and img.get("base64"):
                image_bytes.append(base64.b64decode(img["base64"]))

        # 🔢 Safe numeric conversion
        price = data.get("price_per_unit")
        price = float(price) if price not in (None, "", "null") else None

        product_name_english = (data.get("product_name_english") or "").strip()
        product_name_arabic = (data.get("product_name_arabic") or "").strip()

        if not product_name_arabic and product_name_english:
            product_name_arabic = translate_to_arabic(product_name_english)

        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # ✅ FETCH COMPANY NAME (IMPORTANT FIX)
        cur.execute(
            "SELECT company_name_english FROM supplier_registration WHERE supplier_id=%s",
            (supplier_id,)
        )
        row = cur.fetchone()
        company_name_english = row["company_name_english"] if row else ""

        # optional (safe defaults)
        branch_name_english = ""
        store_name_english = ""

        cur.execute("""
            INSERT INTO product_management (
                supplier_id,
                company_name_english,
                branch_name_english,
                store_name_english,
                product_name_english,
                product_name_arabic,
                category_id,
                sub_category_id,
                unit_of_measure,
                currency,
                price_per_unit,
                minimum_order_quantity,
                stock_availability,
                product_images,
                expiry_date,
                expiry_time,
                shelf_life,
                description,
                country_of_origin,
                product_status,
                flag
            )
            VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,%s,'Pending Approval','A'
            )
            RETURNING product_id
        """, (
            supplier_id,
            company_name_english,      # ✅ FIXED
            branch_name_english,
            store_name_english,
            product_name_english,
            product_name_arabic,
            data.get("category_id"),
            data.get("sub_category_id"),
            data.get("unit_of_measure"),
            data.get("currency", "QAR "),
            price,
            data.get("minimum_order_quantity"),
            data.get("stock_availability"),
            image_bytes,
            data.get("expiry_date"),
            data.get("expiry_time"),
            data.get("shelf_life"),
            data.get("description"),
            data.get("country_of_origin")
        ))

        pid = cur.fetchone()["product_id"]
        conn.commit()

        return jsonify({
            "message": "Product added successfully",
            "product_id": pid
        }), 201

    except Exception as e:
        print("🔥 BASE64 ERROR:", e)
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            release_conn(conn)

@product_bp.route("/<int:product_id>/delete", methods=["DELETE"])
def soft_delete_product(product_id):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    supplier_id = decoded["linked_id"]

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE product_management
            SET flag = 'D', updated_at = NOW()
            WHERE product_id = %s
              AND supplier_id = %s
              AND flag = 'A'
        """, (product_id, supplier_id))

        if cur.rowcount == 0:
            return jsonify({"error": "Product not found or already deleted"}), 404

        conn.commit()
        return jsonify({"message": "Product removed from inventory"}), 200

    finally:
        cur.close()
        release_conn(conn)

@product_bp.route("/<int:product_id>/restore", methods=["PUT"])
def restore_product(product_id):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not token:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        supplier_id = decoded["linked_id"]
        role = decoded["role"]

        if role != "supplier":
            return jsonify({"error": "Forbidden"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE product_management
            SET flag = 'A', updated_at = NOW()
            WHERE product_id = %s
              AND supplier_id = %s
              AND flag = 'D'
        """, (product_id, supplier_id))

        if cur.rowcount == 0:
            return jsonify({
                "error": "Product not found or already active"
            }), 404

        conn.commit()
        return jsonify({
            "message": "Product restored successfully"
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        release_conn(conn)

      # ---------------- READ SINGLE PRODUCT ----------------
@product_bp.route('/<int:product_id>', methods=['GET'])
def get_single_product(product_id):
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT *
            FROM product_management
            WHERE product_id = %s AND flag = 'A'
        """, (product_id,))

        p = cur.fetchone()
        if not p:
            return jsonify({"error": "Product not found"}), 404

        # image urls prepare
        img_urls = []
        if p.get("product_images"):
            for idx in range(len(p["product_images"])):
                img_urls.append(f"/product/image/{product_id}/{idx}")

        expiry = None
        if p.get("expiry_date"):
            expiry = p["expiry_date"].strftime("%Y-%m-%d")

        product = {
            "product_id": p["product_id"],
            "product_name_english": p["product_name_english"],
            "product_name_arabic": p.get("product_name_arabic"),
            "price_per_unit": p.get("price_per_unit"),
            "currency": p.get("currency"),
            "country_of_origin": p.get("country_of_origin"),
            "description": p.get("description"),
            "unit_of_measure": p.get("unit_of_measure"),
            "stock_availability": p.get("stock_availability"),
            "images": img_urls,
            "expiry_date": expiry,
        }

        return jsonify(product), 200

    finally:
        cur.close()
        release_conn(conn)
        
        
@product_bp.route('/featured-grid', methods=['GET'])
def get_featured_grid():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cur.execute("""
            SELECT
                product_id,
                product_name_english,
                price_per_unit,
                currency,
                product_images
            FROM product_management
            WHERE COALESCE(flag, 'A') = 'A'
        """)

        rows = cur.fetchall()

        import random
        random.shuffle(rows)

        rows = rows[:12]

        # ✅ DYNAMIC HOST (VERY IMPORTANT)
        from flask import request
        host_url = request.host_url.rstrip("/")

        def build_product(p):
            image_url = None

            img_array = p.get("product_images") or []
            if isinstance(img_array, (list, tuple)) and len(img_array) > 0:
                # 🔥 FIXED ENDPOINT
                image_url = f"{host_url}/api/image/{p['product_id']}/0"

            return {
                "id": p["product_id"],
                "name": p["product_name_english"],
                "price": p.get("price_per_unit"),
                "currency": p.get("currency") or "QAR ",
                "image": image_url
            }

        sections = [
            {
                "title": "🔥 Trending Products",
                "items": [build_product(p) for p in rows[0:4]]
            },
            {
                "title": "🛒 Recommended For You",
                "items": [build_product(p) for p in rows[4:8]]
            },
            {
                "title": "⚡ Best Deals Right Now",
                "items": [build_product(p) for p in rows[8:12]]
            }
        ]

        print("✅ FEATURED GRID OUTPUT:", sections)

        return jsonify(sections), 200

    except Exception as e:
        print("❌ FEATURED GRID ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        release_conn(conn)