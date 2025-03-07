import httpx
import os
from fastapi import APIRouter, HTTPException

STEAM_API_KEY = os.getenv("STEAM_API_KEY")  # Load from environment variable
STEAM_BASE_URL = "https://api.steampowered.com"

router = APIRouter()

@router.get("/steam/{steam_id}/games")
# async def get_steam_games(steam_id: str):
async def get_games(steam_id: str):
    """
    Fetches the user's Steam library and time spent in each game.
    """
    if not STEAM_API_KEY:
        raise HTTPException(status_code=500, detail="Steam API key is missing.")

    url = f"{STEAM_BASE_URL}/IPlayerService/GetOwnedGames/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&include_appinfo=true&format=json"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch Steam library.")

    data = response.json()
    games = data.get("response", {}).get("games", [])

    return {"steam_id": steam_id, "games": games}

# @router.get("/steam/{steam_id}")
# async def get_steam_games(steam_id: str):
#     url = f"https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
#     params = {
#         "key": STEAM_API_KEY,
#         "steamid": steam_id,
#         "include_appinfo": "true",
#         "format": "json"
#     }
#     async with httpx.AsyncClient() as client:
#         response = await client.get(url, params=params)
#         if response.status_code == 200:
#             return response.json()["response"]["games"]
#         return {"error": "Failed to fetch games"}
