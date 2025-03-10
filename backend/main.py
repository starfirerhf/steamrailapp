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

@app.get("/games/{steam_id}")
def get_games(steam_id: str):
    """Fetch owned games."""
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&format=json&include_appinfo=true"
    response = requests.get(url)
    data = response.json()

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

@router.get("/achievements/{steam_id}/{appid}")
def get_achievements(steam_id: str, appid: str):
    # 1️⃣ Fetch player achievements (unlocked status)
    player_url = "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/"
    player_params = {
        "appid": appid,
        "key": STEAM_API_KEY,
        "steamid": steam_id
    }
    player_response = requests.get(player_url, params=player_params).json()

    if "playerstats" not in player_response or "achievements" not in player_response["playerstats"]:
        return {"completed": 0, "total": 0, "recent": []}

    player_achievements = player_response["playerstats"]["achievements"]

    # 2️⃣ Fetch game achievement schema (names & descriptions)
    schema_url = f"https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/"
    schema_params = {"appid": appid, "key": STEAM_API_KEY}
    schema_response = requests.get(schema_url, params=schema_params).json()

    if "game" not in schema_response or "availableGameStats" not in schema_response["game"]:
        return {"completed": 0, "total": 0, "recent": []}

    schema_achievements = schema_response["game"]["availableGameStats"]["achievements"]

    # 3️⃣ Create a lookup dictionary for schema data
    achievement_dict = {ach["name"]: ach for ach in schema_achievements}

    # 4️⃣ Merge schema data with unlocked achievements
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
            "name": schema_ach.get("displayName", api_name),  # Use schema name if available
            "description": schema_ach.get("description", "No description available"),
            "icon": icon_url,  # Now always a full URL
            "achieved": unlocked,
            "unlocktime": player_ach["unlocktime"]
        })

    # 5️⃣ Sort & return the 5 most recently unlocked achievements
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
