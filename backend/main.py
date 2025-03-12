import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

STEAM_API_KEY = os.getenv("STEAM_API_KEY")  # Set this in Docker
FRONTEND_URL = os.getenv("FRONTEND_URL")  # Set this in Docker

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ Convert Steam Username to SteamID64
def get_steam_id(steam_name: str) -> str:
    url = "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/"
    params = {"key": STEAM_API_KEY, "vanityurl": steam_name}

    response = requests.get(url, params=params)

    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid response from Steam API")

    if data.get("response", {}).get("success") == 1 and "steamid" in data["response"]:
        return data["response"]["steamid"]

    raise HTTPException(status_code=404, detail=f"Steam username '{steam_name}' not found or invalid.")


# ✅ Get Steam user name from steam id
@app.get("/steamuser/{steam_id}")
def get_steam_user(steam_id: str):
    """Fetch Steam username for a given Steam ID."""
    url = f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
    params = {"key": STEAM_API_KEY, "steamids": steam_id}

    response = requests.get(url, params=params)
    data = response.json()

    if "response" in data and "players" in data["response"] and len(data["response"]["players"]) > 0:
        return {"personaname": data["response"]["players"][0]["personaname"]}
    
    raise HTTPException(status_code=404, detail="Steam user not found")


# ✅ Fetch Owned Games (Supports Steam ID or Steam Username)
@app.get("/games/{steam_id_or_name}")
def get_games(steam_id_or_name: str):
    """Fetch owned games using Steam ID or Steam Name."""

    if not steam_id_or_name.isnumeric():
        try:
            steam_id_or_name = get_steam_id(steam_id_or_name)
        except HTTPException:
            return []  # Return empty array to prevent frontend crashes

    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
    params = {"key": STEAM_API_KEY, "steamid": steam_id_or_name, "format": "json", "include_appinfo": "true"}

    response = requests.get(url, params=params)

    try:
        data = response.json()
    except ValueError:
        raise HTTPException(status_code=500, detail="Invalid response from Steam API")

    if "response" not in data or "games" not in data["response"]:
        return []

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

# ✅ Fetch Achievements (Supports Steam ID or Steam Username)
@app.get("/achievements/{steam_id_or_name}/{appid}")
def get_achievements(steam_id_or_name: str, appid: str):
    """Fetch user achievements for a specific game using Steam ID or Steam Name."""

    if not steam_id_or_name.isnumeric():
        try:
            steam_id_or_name = get_steam_id(steam_id_or_name)
        except HTTPException:
            raise HTTPException(status_code=404, detail="Invalid Steam username or Steam ID")

    player_url = "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/"
    player_params = {"appid": appid, "key": STEAM_API_KEY, "steamid": steam_id_or_name}
    player_response = requests.get(player_url, params=player_params).json()

    if "playerstats" not in player_response or "achievements" not in player_response["playerstats"]:
        return {"completed": 0, "total": 0, "recent": []}

    player_achievements = player_response["playerstats"]["achievements"]

    schema_url = f"https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/"
    schema_params = {"appid": appid, "key": STEAM_API_KEY}
    schema_response = requests.get(schema_url, params=schema_params).json()

    if "game" not in schema_response or "availableGameStats" not in schema_response["game"]:
        return {"completed": 0, "total": 0, "recent": []}

    schema_achievements = schema_response["game"]["availableGameStats"]["achievements"]

    achievement_dict = {ach["name"]: ach for ach in schema_achievements}

    combined_achievements = []
    for player_ach in player_achievements:
        api_name = player_ach["apiname"]
        unlocked = player_ach["achieved"]

        schema_ach = achievement_dict.get(api_name, {})
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
