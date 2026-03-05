from helper.database_loader import load_database
from flask import Flask, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from config import DB_HOST, DB_USER, DB_PASS, DATABASE, SECRET_KEY
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
from flask_bcrypt import Bcrypt

app = Flask(__name__)

user = DB_USER
password = DB_PASS
host = DB_HOST
database = DATABASE
    
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{user}:{password}@{host}/{database}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["SECRET_KEY"] = SECRET_KEY

from helper.database_init import db
db.init_app(app)
bcrypt = Bcrypt(app)

from routes.auth import auth_bp

app.register_blueprint(auth_bp, url_prefix="/auth") 
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

CORS(app, supports_credentials=True)
if __name__ == "__main__": 
    app.run(debug=True)