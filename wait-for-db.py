import psycopg2
import time
import os
import sys

db_url = os.environ.get('DATABASE_URL', 'postgres://postgres:postgres@db:5432/remoteteam')
host = db_url.split('@')[1].split(':')[0]

for i in range(30):
    try:
        conn = psycopg2.connect(
            dbname='remoteteam',
            user='postgres',
            password='postgres',
            host=host,
            port=5432
        )
        conn.close()
        print("Database ready")
        sys.exit(0)
    except Exception as e:
        print(f"Waiting for db... ({i+1}/30): {e}")
        time.sleep(1)
print("Database not ready after 30 seconds")
sys.exit(1)
