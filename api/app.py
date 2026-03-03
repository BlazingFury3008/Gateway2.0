from helper.database_loader import load_database
from flask import Flask, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from config import DB_HOST, DB_USER, DB_PASS, DATABASE


app = Flask(__name__)

user = DB_USER
password = DB_PASS
host = DB_HOST
database = DATABASE
    
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{user}:{password}@{host}/{database}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from helper.database_init import db
db.init_app(app)

from helper.models import User

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    load_database()
    print("Connected")