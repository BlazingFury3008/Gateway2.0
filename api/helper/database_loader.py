import pymysql
from config import DB_HOST, DB_USER, DB_PASS, DATABASE


def load_database():
    connection = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        autocommit=True,
    )

    try:
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DATABASE}`")
            cursor.execute(f"SHOW DATABASES")
            
            for database in cursor.fetchall():
                print(database)
    finally:
        connection.close()


def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DATABASE,
        cursorclass=pymysql.cursors.DictCursor,
    )
    
