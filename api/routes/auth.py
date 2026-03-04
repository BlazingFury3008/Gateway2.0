from flask import blueprints, redirect, request, jsonify, url_for, session
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.contrib.discord import make_discord_blueprint, discord

auth_bp = blueprints.Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Here you would typically check the username and password against your database
    if username == "admin" and password == "password":
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Here you would typically save the new user to your database
    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/logout", methods=["POST"])
def logout():
    # Here you would typically handle the logout logic, such as invalidating the user's session
    return jsonify({"message": "Logout successful"}), 200


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    # Here you would typically handle the token refresh logic
    return jsonify({"message": "Token refreshed successfully"}), 200

# ----
# Discord Login Handling
# ----
from config import DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET

discord_bp  = make_discord_blueprint(
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
        json = request.json()
    except Exception:
        json = None

    if json is not None:
        print(json)
    
    if not discord.authorized:
        return redirect(url_for("auth.discord.login", prompt="consent"))

    resp = discord.get("/api/users/@me")
    if not resp.ok:
        return jsonify({"message": "Failed to fetch user info from Discord"}), 500

    user_info = resp.json()
    print(user_info)
    # Here you would typically log the user in or create a new account based on the Discord info
    
    return jsonify({"message": "Discord login successful", "user_info": user_info}), 200

# ----
# Google Login Handling
# ----

from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

google_bp = make_google_blueprint(
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    scope=["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile", "openid"],
    redirect_to="auth.google_login",
)

auth_bp.register_blueprint(google_bp, url_prefix="/google")
@auth_bp.route("/login/google")
def google_login():
    if not google.authorized:
        return redirect(url_for("auth.google.login", prompt="consent"))
    resp = google.get("/oauth2/v2/userinfo")
    if not resp.ok:
        return jsonify({"message": "Failed to fetch user info from Google"}), 500
    user_info = resp.json()
    print(user_info)
    # Here you would typically log the user in or create a new account based on the Google
    # info
    return jsonify({"message": "Google login successful", "user_info": user_info}), 200


@auth_bp.route("/logout_token", methods=["POST"])
def logout_discord():
    # Remove Discord OAuth token
    session.pop("discord_oauth_token", None)

    # Clear entire session if you want
    session.clear()

    return jsonify({"message": "Logged out successfully"}), 200