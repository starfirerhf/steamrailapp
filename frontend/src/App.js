import React, { useState, useEffect } from "react";

const AUTH_URL = "http://localhost:5000"; // Backend for authentication
const API_URL = "http://localhost:8000"; // Backend for authentication

const App = () => {
  const [steamId, setSteamId] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedGame, setExpandedGame] = useState(null);
  const [achievements, setAchievements] = useState({});
  const [authenticated, setAuthenticated] = useState(false);

  // ✅ Extract Steam ID from URL if redirected from Steam login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const steamIdFromUrl = params.get("steam_id");

    if (steamIdFromUrl) {
      setSteamId(steamIdFromUrl);
      setAuthenticated(true);
      window.history.replaceState({}, document.title, "/"); // ✅ Clean up URL
    }
  }, []);

  // Fetch user's game library
  const fetchGames = async () => {
    if (!steamId) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/games/${steamId}`);
      console.log(`📡 Fetching games for Steam ID: ${steamId}`);

      if (!response.ok) {
        throw new Error(`❌ API Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      console.log("✅ API Response:", data);

      if (!Array.isArray(data)) {
        console.error("❌ Expected an array but got:", data);
        setGames([]);
        return;
      }

      setGames(data);
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setGames([]);
    }

    setLoading(false);
  };

  // Fetch achievements only when the game is clicked
  const fetchAchievements = async (appid) => {
    if (achievements[appid]) {
      setExpandedGame(expandedGame === appid ? null : appid);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/achievements/${steamId}/${appid}`);
      const data = await response.json();
      console.log("✅ Full Achievements Response:", data);

      if (!Array.isArray(data.recent) || data.recent.length === 0) {
        console.warn("⚠ No recently unlocked achievements found for this game");
        return;
      }

      setAchievements((prev) => ({
        ...prev,
        [appid]: { ...data, recent: data.recent },
      }));

      setExpandedGame(appid);
    } catch (error) {
      console.error("❌ Failed to fetch achievements", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-6">🎮 Steam Game Tracker</h1>

      {/* ✅ Steam Login Button */}
      {!authenticated ? (
        <div className="flex justify-center mb-6">
          <a href={`${AUTH_URL}/login`}>
            <img
              src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_02.png"
              alt="Sign in through Steam"
              className="w-48 hover:opacity-80 transition-opacity duration-300"
            />
          </a>
        </div>
      ) : (
        <p className="text-center text-lg mb-4">
          ✅ Logged in as: <strong>{steamId}</strong>
        </p>
      )}

      {/* Input for Steam ID (Disabled if logged in) */}
      <div className="flex justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter Steam ID"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          className="p-2 rounded-lg text-black"
          disabled={authenticated} // ✅ Disable input if logged in
        />
        <button
          onClick={fetchGames}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Fetch Games
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && <p className="text-center text-lg">Loading games...</p>}

      {/* Game List */}
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <div key={game.appid} className="bg-gray-900 p-4 rounded-lg shadow-md">
              {/* Game Header (Click to Expand) */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => fetchAchievements(game.appid)}
              >
                <div className="flex items-center">
                  <img
                    src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                    alt={game.name}
                    className="w-16 h-16 mr-4 rounded-md"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{game.name}</h3>
                    <p className="text-sm text-gray-400">{(game.playtime_forever / 60).toFixed(1)} hrs</p>
                  </div>
                </div>
                <span className="text-xl">{expandedGame === game.appid ? "▲" : "▼"}</span>
              </div>

              {/* Expanded Achievement Details */}
              {expandedGame === game.appid && achievements[game.appid] && (
                <div className="mt-3 border-t border-gray-700 pt-3">
                  
                  {/* ✅ Updated text for Achievements Completed */}
                  <p className="font-bold">
                    Achievements Completed: {achievements[game.appid].completed ?? "N/A"} / {achievements[game.appid].total ?? "N/A"}
                  </p>

                  {/* ✅ Add "Most Recent Achievements" Title */}
                  {achievements[game.appid].recent && achievements[game.appid].recent.length > 0 && (
                    <p className="font-bold mt-2">🏆 Most Recent Achievements:</p>
                  )}

                  {/* ✅ Display 5 Most Recently Unlocked Achievements */}
                  {achievements[game.appid].recent.length > 0 ? (
                    <div className="flex flex-col space-y-4 mt-3">
                      {achievements[game.appid].recent.map((ach, index) => (
                        <div key={index} className="bg-gray-800 p-3 rounded-lg shadow-md flex items-center space-x-4">
                          
                          {/* ✅ Achievement Icon */}
                          <img
                            src={ach.icon}
                            alt={ach.name}
                            className="w-16 h-16 rounded-md"
                            onError={(e) => {
                              console.error(`❌ Image failed to load: ${e.target.src}`);
                              e.target.src = "https://via.placeholder.com/64?text=?";
                            }}
                          />

                          {/* ✅ Achievement Info */}
                          <div className="text-left">
                            <p className="text-sm font-bold">{ach.name}</p>
                            <p className="text-xs text-gray-300">{ach.description || "No description available."}</p>
                            <p className="text-xs text-gray-400">
                              Unlocked on {new Date(ach.unlocktime * 1000).toLocaleDateString()}
                            </p>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No recently unlocked achievements.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
