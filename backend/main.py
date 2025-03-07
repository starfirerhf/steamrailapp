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


# def get_achievements(steam_id, appid):
#     """Fetch achievements for a specific game and return completed & total count."""
#     url = f"http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid={appid}&key={STEAM_API_KEY}&steamid={steam_id}"
#     response = requests.get(url)
#     data = response.json()

#     # If no achievements are available, return None
#     if "playerstats" not in data or "achievements" not in data["playerstats"]:
#         return 0, 0
    
#     achievements = data["playerstats"].get("achievements",[])

#     if not achievements:
#         return 0, 0 # Handle cases where there are no achievements

#     total_achievements = len(achievements)
#     completed_achievements = sum(1 for ach in achievements if ach.get("achieved", 0) == 1)

#     return completed_achievements, total_achievements


def get_achievements(steam_id, appid):
    """Fetch achievements for a game, ensuring we handle missing or private data properly."""
    url = f"http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid={appid}&key={STEAM_API_KEY}&steamid={steam_id}"
    response = requests.get(url)
    
    if response.status_code != 200:
        return None, None  # Steam API error

    data = response.json()

    # If "playerstats" is missing or contains "success": False, achievements are unavailable
    if "playerstats" not in data or data["playerstats"].get("success") == False:
        return None, None

    achievements = data["playerstats"].get("achievements", [])

    # If the game has no achievements, return None
    if not achievements:
        return None, None

    total_achievements = len(achievements)
    completed_achievements = sum(1 for ach in achievements if ach.get("achieved", 0) == 1)

    return completed_achievements, total_achievements


@app.get("/games/{steam_id}")
def get_games(steam_id: str):
    """Fetch owned games and add achievement data."""
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&format=json&include_appinfo=true"
    response = requests.get(url)
    data = response.json()

    if "response" not in data or "games" not in data["response"]:
        return []
    
    games = data["response"]["games"]

    sorted_games = sorted(
        games, key=lambda x: x.get("playtime_forever", 0), reverse=True
    )

    game_data = []

    for game in sorted_games:
        appid = game["appid"]
        completed, total = get_achievements(steam_id, appid)

        game_data.append({
            "appid": appid,
            "name": game.get("name", "Unknown Game"),
            "playtime_forever": game.get("playtime_forever", 0),
            "img_icon_url": game.get("img_icon_url", ""),
            "completed_achievements": completed if completed is not None else "N/A",
            "total_achievements": total if total is not None else "N/A",
        })

    return game_data


def get_steam_games(steam_id: str):
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&format=json&include_appinfo=true"

    response = requests.get(url)
    data = response.json()

    if response.status_code != 200:
        return {"error": "Failed to fetch data from Steam API"}

    if "response" not in data or "games" not in data["response"]:
        return []    

    games = data["response"]["games"]    
    # games = data.get("response", {}).get("games", [])

    sorted_games = sorted(games, key=lambda g: g.get("playtime_forever", 0), reverse=True)

    return [
        {
            "appid": game["appid"],
            "name": game.get("name", "Unknown Game"),
            "playtime_forever": game.get("playtime_forever", 0),
            "img_icon_url": game.get("img_icon_url", ""),
        }
        for game in sorted_games
    ]
    # return [{"name": game["name"], "playtime_hours": game["playtime_forever"] // 60} for game in sorted_games]


@app.get("/test-api-key")
def test_api_key():
    return {"STEAM_API_KEY": STEAM_API_KEY}



# from fastapi import FastAPI, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.ext.asyncio import AsyncSession

# from database import get_db
# from steam_api import router as steam_router

# from models import Game

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Change to your frontend URL in production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(steam_router, prefix="/api", tags=["steam"])
# @app.get("/")
# async def root():
#     return {"message": "Welcome to the Steam Library Tracker API"}

# @app.get("/health")
# async def health_check():
#     return {"status": "OK"}

# # @app.get("/api/steam-data")
# # def get_steam_data():
# #     return {"game": "Counter-Strike", "hours_played": 120.5}

# # @app.get("/games/")
# # async def get_games(db: AsyncSession = Depends(get_db)):
# #     result = await db.execute("SELECT * FROM games")
# #     games = result.fetchall()
# #     return [{"id": row.id, "name": row.name, "playtime": row.playtime} for row in games]

# # app = FastAPI()

# # @app.get("/")
# # def read_root():
# #         return {"message": "Hello from FastAPI!"}
