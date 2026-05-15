# import os
# import psycopg2
# from psycopg2.extras import RealDictCursor
# from dotenv import load_dotenv

# # Load environment variables from .env file
# load_dotenv()

# def get_db_connection(use_azure=False):
#     """
#     Connect to PostgreSQL database.

#     Parameters:
#     - use_azure=True  → connect to Azure PostgreSQL
#     - use_azure=False → connect to local PostgreSQL

#     Returns:
#     - psycopg2 connection object
#     """
#     try:
#         if use_azure:
#             host = os.getenv("AZURE_DB_HOST")
#             database = os.getenv("AZURE_DB_NAME")
#             user = os.getenv("AZURE_DB_USER")
#             password = os.getenv("AZURE_DB_PASSWORD")
#             port = os.getenv("AZURE_DB_PORT", "5432")
#             sslmode = os.getenv("AZURE_DB_SSLMODE", "require")  # Azure requires SSL
#         else:
#             host = os.getenv("DB_HOST", "localhost")
#             database = os.getenv("DB_NAME", "MAHALDATABASE")
#             user = os.getenv("DB_USER", "postgres")
#             password = os.getenv("DB_PASS", "S@ndeep9392")
#             port = os.getenv("DB_PORT", "5432")
#             sslmode = "disable"  # Local DB usually does not use SSL

#         # Connect with RealDictCursor for easy dict results
#         conn = psycopg2.connect(
#             host=host,
#             database=database,
#             user=user,
#             password=password,
#             port=port,
#             sslmode=sslmode,
#             cursor_factory=RealDictCursor
#         )
#         print(f"✅ Connected successfully to {'Azure' if use_azure else 'Local'} DB!")
#         return conn

#     except psycopg2.Error as e:
#         print(f"❌ Database connection failed: {e.pgcode} - {e.pgerror}")
#         raise e
#     except Exception as e:
#         print(f"❌ Unexpected error: {e}")
#         raise e

# # ✅ Automatically use Azure or local DB based on .env
# use_azure = os.getenv("USE_AZURE_DB", "False").lower() in ("true", "1", "yes")
# conn = get_db_connection(use_azure=use_azure)




















# db.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load .env values
load_dotenv()

# =====================================================
#  ONLY LOCAL DATABASE IS ENABLED
#  Azure DB section is fully commented.
# =====================================================

def get_db_connection():
    """
    Safe Local PostgreSQL connection.
    No Azure.
    No global connections.
    No leaks.
    """
    try:
        host = os.getenv("DB_HOST", "localhost")
        database = os.getenv("DB_NAME", "MAHALDATABASE")
        user = os.getenv("DB_USER", "postgres")
        password = os.getenv("DB_PASS", "S@ndeep9392")
        port = os.getenv("DB_PORT", "5432")

        conn = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port,
            sslmode="disable",          # LOCAL ONLY
            cursor_factory=RealDictCursor
        )

        print("✅ Local DB connection OK")
        return conn

    except Exception as e:
        print("❌ Local DB connection FAILED:", e)
        raise e


# =====================================================
# ❌ COMMENTED: Azure Connection (Not Used Now)
# =====================================================
"""
def get_azure_connection():
    try:
        host = os.getenv("AZURE_DB_HOST")
        database = os.getenv("AZURE_DB_NAME")
        user = os.getenv("AZURE_DB_USER")
        password = os.getenv("AZURE_DB_PASSWORD")
        port = os.getenv("AZURE_DB_PORT", "5432")

        conn = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port,
            sslmode="require",
            cursor_factory=RealDictCursor,
        )

        print("🌐 Azure DB Connected")
        return conn

    except Exception as e:
        print("❌ Azure DB FAILED:", e)
        raise e
"""
# =====================================================

# ❗ IMPORTANT:
# DO NOT open a DB connection here.
# Connections should be created INSIDE routes and closed in finally blocks.