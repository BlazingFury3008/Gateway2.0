from app import app, db
from helper.database_loader import load_database

with app.app_context():
    load_database()
    db.create_all()