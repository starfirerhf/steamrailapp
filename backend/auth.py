import os
from flask import Flask, redirect, request, session, url_for
from flask_cors import CORS # ✅ Import CORS
import requests

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890")  # Ensure a secure secret key

# ✅ Steam OpenID URLs
STEAM_OPENID_URL = "https://steamcommunity.com/openid"
FRONTEND_URL = "http://localhost:3000"

CORS(app, resources={r"/*": {"origins": FRONTEND_URL}})  # ✅ Allow frontend to communicate with backend
# FRONTEND_URL = os.getenv("FRONTEND_URL")  # ✅ Change this if frontend is hosted elsewhere
# CORS(app, resources={r"/*": {"origins": FRONTEND_URL}})  # ✅ Allow frontend to communicate with backend


@app.route("/")
def index():
    """Homepage with Steam login link"""
    return '<a href="/login">Login with Steam</a>'


@app.route("/login")
def login():
    """Manually construct OpenID authentication request and redirect user to Steam"""
    params = {
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": url_for("auth_callback", _external=True),
        "openid.realm": "http://localhost:5000/",
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
    }
    steam_login_url = f"{STEAM_OPENID_URL}/login?" + "&".join([f"{k}={v}" for k, v in params.items()])
    return redirect(steam_login_url)


@app.route("/auth/callback")
def auth_callback():
    """Handles Steam authentication callback and redirects to frontend"""
    if "openid.identity" not in request.args:
        return "Steam login failed", 400

    # ✅ Extract Steam ID
    steam_id = request.args["openid.identity"].split("/")[-1]
    session["steam_id"] = steam_id  # ✅ Store in session

    # ✅ Redirect back to frontend with Steam ID
    return redirect(f"{FRONTEND_URL}?steam_id={steam_id}")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
