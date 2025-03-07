import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

@app.get("/achievements/{steam_id}/{appid}")
def get_achievements(steam_id: str, appid: str):
    """Fetch achievements for a game only when clicked."""
    url = f"http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid={appid}&key={STEAM_API_KEY}&steamid={steam_id}"
    response = requests.get(url)
    data = response.json()

    if "playerstats" not in data or not data["playerstats"].get("success", False):
        return {"completed": "N/A", "total": "N/A", "nearby": []}

    achievements = data["playerstats"].get("achievements", [])
    
    total = len(achievements)
    completed = sum(1 for ach in achievements if ach.get("achieved", 0) == 1)
    
    # Find achievements close to completion (e.g., progress >= 80%)
    nearby_achievements = [
        {
            "name": ach.get("name", "Unknown"),
            "progress": ach.get("percent", 0)
        }
        for ach in achievements if ach.get("percent", 0) >= 80 and ach.get("achieved", 0) == 0
    ]

    return {"completed": completed, "total": total, "nearby": nearby_achievements}
