from helper.database_init import db
from sqlalchemy.ext.hybrid import hybrid_property

class User(db.Model):
    __tablename__ = "users"

    uuid = db.Column(db.String(36), primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(128), nullable=True)
    google_id = db.Column(db.String(128), unique=True, nullable=True)
    discord_id = db.Column(db.String(128), unique=True, nullable=True)
    image_url = db.Column(db.String(256), nullable=True)

    def __repr__(self):
        return f"<User {self.username}>"
class Session(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.uuid"), nullable=False)
    session_token = db.Column(db.String(128), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    last_active_at = db.Column(db.DateTime, nullable=False)
    expire_time = db.Column(db.DateTime, nullable=False)

    user = db.relationship("User", backref=db.backref("sessions", lazy=True))

    def __repr__(self):
        return f"<Session {self.session_token} for User ID {self.user_id}>"