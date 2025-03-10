import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter, HTTPException

app = FastAPI()
router = APIRouter()

STEAM_API_KEY = os.getenv("STEAM_API_KEY")  # Set this in Docker

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Function: Convert Steam Username to SteamID64
def get_steam_id(steam_name: str) -> str:
    url = "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/"
    params = {"key": STEAM_API_KEY, "vanityurl": steam_name}

    print(f"🔍 Fetching SteamID64 for username: {steam_name}")  # Debugging

    response = requests.get(url, params=params)
    
    try:
        data = response.json()
        print(f"📡 Steam API Response: {data}")  # Debugging
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid response from Steam API")

    # ✅ Correctly check for `success: 1` and extract SteamID
    if data.get("response", {}).get("success") == 1 and "steamid" in data["response"]:
        steam_id = data["response"]["steamid"]
        print(f"✅ Resolved {steam_name} to SteamID64: {steam_id}")
        return steam_id
    
    # ❌ If not found, return a 404 error with details
    error_message = f"Steam username '{steam_name}' not found or invalid."
    print(f"❌ {error_message}")
    raise HTTPException(status_code=404, detail=error_message)


# ✅ Modify Games Endpoint to Support Steam Name
@app.get("/games/{steam_id_or_name}")
def get_games(steam_id_or_name: str):
    """Fetch owned games using SteamID or Steam Name."""

    # 🔹 Convert Steam name to SteamID if needed
    if not steam_id_or_name.isnumeric():
        try:
            steam_id_or_name = get_steam_id(steam_id_or_name)
            print(f"✅ Resolved Steam username to SteamID64: {steam_id_or_name}")
        except HTTPException:
            print(f"❌ Invalid Steam username: {steam_id_or_name}")
            return []  # ✅ Return an empty array to prevent frontend crashes

    # 🔹 Fetch games using resolved SteamID
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
    params = {"key": STEAM_API_KEY, "steamid": steam_id_or_name, "format": "json", "include_appinfo": "true"}

    response = requests.get(url, params=params)
    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid response from Steam API")

    if "response" not in data or "games" not in data["response"]:
        print(f"❌ No games found for Steam ID: {steam_id_or_name}")
        return []  # ✅ Always return an array to prevent crashes

    games = data["response"]["games"]
    sorted_games = sorted(games, key=lambda x: x.get("playtime_forever", 0), reverse=True)

    return [
        {
            "appid": game["appid"],
            "name": game.get("name", "Unknown Game"),
            "playtime_forever": game.get("playtime_forever", 0),
            "img_icon_url": game.get("img_icon_url", ""),
        }
        for game in sorted_games
    ]


# ✅ Modify Achievements Endpoint to Support Steam Name
@router.get("/achievements/{steam_id_or_name}/{appid}")
def get_achievements(steam_id_or_name: str, appid: str):
    """Fetch achievements using SteamID or Steam Name."""

    # 🔹 If input is a Steam Name (not numeric), resolve to SteamID
    if not steam_id_or_name.isnumeric():
        try:
            steam_id_or_name = get_steam_id(steam_id_or_name)
            print(f"✅ Resolved Steam username to SteamID64: {steam_id_or_name}")
        except HTTPException:
            raise HTTPException(status_code=404, detail="Invalid Steam username or Steam ID")

    # 🔹 Fetch player achievements using resolved SteamID
    player_url = "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/"
    player_params = {"appid": appid, "key": STEAM_API_KEY, "steamid": steam_id_or_name}
    player_response = requests.get(player_url, params=player_params).json()

    if "playerstats" not in player_response or "achievements" not in player_response["playerstats"]:
        return {"completed": 0, "total": 0, "recent": []}

    player_achievements = player_response["playerstats"]["achievements"]

    # 🔹 Fetch game achievement schema
    schema_url = "https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/"
    schema_params = {"appid": appid, "key": STEAM_API_KEY}
    schema_response = requests.get(schema_url, params=schema_params).json()

    if "game" not in schema_response or "availableGameStats" not in schema_response["game"]:
        return {"completed": 0, "total": 0, "recent": []}

    schema_achievements = schema_response["game"]["availableGameStats"]["achievements"]

    # 🔹 Create a lookup dictionary for schema data
    achievement_dict = {ach["name"]: ach for ach in schema_achievements}

    # 🔹 Merge schema data with unlocked achievements
    combined_achievements = []
    for player_ach in player_achievements:
        api_name = player_ach["apiname"]
        unlocked = player_ach["achieved"]

        schema_ach = achievement_dict.get(api_name, {})

        # Ensure the icon URL is fully formed
        icon_url = schema_ach.get("icon", "")
        if icon_url and not icon_url.startswith("http"):
            icon_url = f"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/{appid}/{icon_url}"

        combined_achievements.append({
            "name": schema_ach.get("displayName", api_name),
            "description": schema_ach.get("description", "No description available"),
            "icon": icon_url,
            "achieved": unlocked,
            "unlocktime": player_ach["unlocktime"]
        })

    # 🔹 Sort & return the 5 most recently unlocked achievements
    recent_achievements = sorted(
        [ach for ach in combined_achievements if ach["achieved"] == 1],
        key=lambda x: x["unlocktime"],
        reverse=True
    )[:5]

    return {
        "completed": sum(1 for ach in combined_achievements if ach["achieved"] == 1),
        "total": len(combined_achievements),
        "recent": recent_achievements
    }


app.include_router(router)
