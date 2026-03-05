import oauthlib

from flask import (
    blueprints,
    redirect,
    request,
    jsonify,
    url_for,
    session,
    make_response,
)
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.contrib.discord import make_discord_blueprint, discord
from urllib.parse import urlencode, urlparse
import uuid
from datetime import datetime, timedelta

from helper.models import User, Session
from helper.database_init import db
from config import SECRET_KEY
import bcrypt

auth_bp = blueprints.Blueprint("auth", __name__)


@auth_bp.route("/me", methods=["GET"])
def get_user_info():
    session_token = request.cookies.get("session_token")
    if not session_token:
        return jsonify({"message": "Missing session token"}), 401

    session_record = Session.query.filter_by(session_token=session_token).first()
    if not session_record:
        return jsonify({"message": "Invalid session token"}), 401

    if session_record.expire_time < datetime.utcnow():
        return jsonify({"message": "Session token expired"}), 401

    user = User.query.filter_by(uuid=session_record.user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    # optional: refresh expiry / last_active
    session_resp = create_update_session(user)

    return jsonify(session_resp), 200


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No User Exists"}), 404

    # If user has no password set (e.g. OAuth-only account), avoid crashing bcrypt
    if not user.password_hash:
        return jsonify({"error": "This account has no password set"}), 400

    if not bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8")):
        return jsonify({"error": "Invalid credentials"}), 401

    session_data = create_update_session(user)  # should include session_token and user info

    resp = make_response(jsonify(session_data), 200)
    resp.set_cookie(
        "session_token",
        session_data["session_token"],
        httponly=True,
        secure=True,      # must be True on HTTPS
        samesite="None",  # use None if frontend+backend are on different domains
        path="/",
        max_age=60 * 60 * 24 * 7,  # example: 7 days
    )
    return resp


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    # Check if email exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    hashed_pwd = bcrypt.hashpw(
        password=password.encode("utf-8"),
        salt=bcrypt.gensalt(14),
    )
    # Create user
    user = User(
        uuid=str(uuid.uuid4()),
        username=username,
        email=email,
        password_hash=hashed_pwd
    )

    db.session.add(user)
    db.session.commit()

    # Create session
    session_data = create_update_session(user)

    resp = make_response(jsonify(session_data), 201)

    resp.set_cookie(
        "session_token",
        session_data["session_token"],
        httponly=True,
        secure=True,       # required for SameSite=None
        samesite="None",   # needed if frontend/backend are different origins
        path="/",
        max_age=60 * 60 * 24 * 7,  # 7 days
    )

    return resp


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    # Here you would typically handle the token refresh logic
    return jsonify({"message": "Token refreshed successfully"}), 200


# ----
# Discord Login Handling
# ----
from config import (
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    FRONTEND_URL,
    BACKEND_URL,
)

discord_bp = make_discord_blueprint(
    client_id=DISCORD_CLIENT_ID,
    client_secret=DISCORD_CLIENT_SECRET,
    scope=["identify", "email"],
    redirect_to="auth.discord_login",
    prompt="consent",
)

auth_bp.register_blueprint(discord_bp, url_prefix="/discord")


@auth_bp.route("/login/discord")
def discord_login():
    try:
        redirect_uri = request.args.get("redirect", FRONTEND_URL)
        create_user = request.args.get("create_user", "false").lower() == "true"

        print(redirect_uri)
        if not discord.authorized:
            return redirect(url_for("auth.discord.login", prompt="consent"))
        resp = discord.get("/api/users/@me")
        if not resp.ok:
            return jsonify({"message": "Failed to fetch user info from Discord"}), 500

        user_info = resp.json()

        user = User.query.filter_by(discord_id=user_info["id"]).first()

        if not user and create_user:
            user = User(
                uuid=str(uuid.uuid4()),
                username=user_info.get("username"),
                discord_id=user_info["id"],
                image_url=f'https://cdn.discordapp.com/avatars/{user_info["id"]}/{user_info["avatar"]}.png',
            )
            db.session.add(user)
            db.session.commit()
            session_data = create_update_session(user)

            r = redirect(redirect_uri)
            r.set_cookie(
                "session_token",
                session_data["session_token"],
                httponly=True,
                secure=True,
                samesite="Lax",
            )

            return r
        elif not user and not create_user:
            return redirect(
                redirect_uri + "?error=account_not_found&accountType=discord"
            )
        elif user:
            user = User.query.filter_by(discord_id=user_info["id"]).first()
            session_data = create_update_session(user)
            r = redirect(redirect_uri)
            r.set_cookie(
                "session_token",
                session_data["session_token"],
                httponly=True,
                secure=True,
                samesite="Lax",
            )

            return r

    except oauthlib.oauth2.rfc6749.errors.TokenExpiredError as e:
        # Clear token then restart OAuth flow cleanly
        session.pop("discord_oauth_token", None)

        params = {}
        if redirect_uri:
            params["redirect"] = redirect_uri
        if create_user:
            params["create_user"] = "true"

        login_url = url_for("auth.discord.login", prompt="consent", _external=True)
        if params:
            login_url = f"{login_url}?{urlencode(params)}"

        return redirect(login_url)


# ----
# Google Login Handling
# ----

from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

google_bp = make_google_blueprint(
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    scope=[
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
    redirect_to="auth.google_login",
)

auth_bp.register_blueprint(google_bp, url_prefix="/google")


@auth_bp.route("/login/google")
def google_login():
    try:
        redirect_uri = request.args.get("redirect", FRONTEND_URL)
        create_user = request.args.get("create_user", "false").lower() == "true"

        print(redirect_uri)
        if not google.authorized:
            return redirect(url_for("auth.google.login", prompt="consent"))

        resp = google.get("/oauth2/v2/userinfo")
        if not resp.ok:
            return jsonify({"message": "Failed to fetch user info from Google"}), 500

        user_info = resp.json()

        user = User.query.filter_by(google_id=user_info["id"]).first()

        if not user and create_user:
            user = User(
                uuid=str(uuid.uuid4()),
                username=user_info.get("name") or user_info.get("email"),
                google_id=user_info["id"],
                image_url=user_info.get("picture"),
            )
            db.session.add(user)
            db.session.commit()

            session_data = create_update_session(user)

            r = redirect(redirect_uri)
            r.set_cookie(
                "session_token",
                session_data["session_token"],
                httponly=True,
                secure=True,
                samesite="Lax",
            )
            return r

        elif not user and not create_user:
            return redirect(
                redirect_uri + "?error=account_not_found&accountType=google"
            )

        elif user:
            session_data = create_update_session(user)

            r = redirect(redirect_uri)
            r.set_cookie(
                "session_token",
                session_data["session_token"],
                httponly=True,
                secure=True,
                samesite="Lax",
            )
            return r

    except oauthlib.oauth2.rfc6749.errors.TokenExpiredError:
        # Clear token then restart OAuth flow cleanly
        session.pop("google_oauth_token", None)

        params = {}
        if redirect_uri:
            params["redirect"] = redirect_uri
        if create_user:
            params["create_user"] = "true"

        login_url = url_for("auth.google.login", prompt="consent", _external=True)
        if params:
            login_url = f"{login_url}?{urlencode(params)}"

        return redirect(login_url)


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session_token = request.cookies.get("session_token")

    # Always respond with cookie cleared (even if token missing),
    # so the browser drops it.
    response = make_response(jsonify({"message": "Logged out successfully"}), 200)

    # If you set a specific domain/path when creating the cookie,
    # you MUST match them here too.
    cookie_kwargs = {
        "path": "/",  # must match creation
        "secure": True,  # match creation (True if HTTPS)
        "httponly": True,
        "samesite": "None",  # match creation (None for cross-site)
    }

    # 1) Remove server-side session record (best effort)
    if session_token:
        session_record = Session.query.filter_by(session_token=session_token).first()
        if session_record:
            db.session.delete(session_record)
            db.session.commit()

    # 2) Remove cookie from browser
    response.delete_cookie("session_token", **cookie_kwargs)

    return response


def create_update_session(user):
    session_record = Session.query.filter_by(user_id=user.uuid).first()

    if not session_record:
        session_token = str(uuid.uuid4())
        session_record = Session(
            user_id=user.uuid,
            session_token=session_token,
            created_at=datetime.utcnow(),
            last_active_at=datetime.utcnow(),
            expire_time=datetime.utcnow() + timedelta(days=7),
        )
    else:
        session_record.last_active_at = (datetime.utcnow(),)
        session_record.expire_time = datetime.utcnow() + timedelta(days=7)

    db.session.add(session_record)
    db.session.commit()

    return {
        "session_token": session_record.session_token,
        "user": {
            "uuid": user.uuid,
            "username": user.username,
            "email": user.email,
            "image_url": user.image_url,
        },
    }


def is_allowed_redirect(url: str) -> bool:
    # Example: allow only your frontend origin(s)
    if not url:
        return False
    parsed = urlparse(url)
    return parsed.scheme in ("http", "https") and parsed.netloc in {
        "localhost:3000",
        "your-frontend.com",
    }
