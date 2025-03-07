import React, { useState, useEffect } from "react";

const App = () => {
  const [games, setGames] = useState([]);
  const [expandedGame, setExpandedGame] = useState(null);
  const [achievements, setAchievements] = useState({});

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const steamID = "76561198006785284";
        const response = await fetch(`http://localhost:8000/games/${steamID}`);
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error("Failed to fetch games", error);
      }
    };

    fetchGames();
  }, []);

  const fetchAchievements = async (appid) => {
    if (achievements[appid]) {
      // Already fetched, just toggle visibility
      setExpandedGame(expandedGame === appid ? null : appid);
      return;
    }

    try {
      const steamID = "76561198006785284";
      const response = await fetch(`http://localhost:8000/achievements/${steamID}/${appid}`);
      const data = await response.json();
      setAchievements((prev) => ({ ...prev, [appid]: data }));
      setExpandedGame(appid);
    } catch (error) {
      console.error("Failed to fetch achievements", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Steam Game Library</h1>
      <div className="space-y-4">
        {games.map((game) => (
          <div key={game.appid} className="border rounded-lg p-4 shadow-lg">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => fetchAchievements(game.appid)}
            >
              <div className="flex items-center">
                <img 
                  src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} 
                  alt={game.name} 
                  width="50" 
                  className="mr-4"
                />
                <span className="font-semibold">{game.name}</span>
              </div>
              <span>{(game.playtime_forever / 60).toFixed(1)} hrs</span>
            </div>

            {expandedGame === game.appid && achievements[game.appid] && (
              <div className="mt-4 p-4 border-t">
                <p><strong>Completed:</strong> {achievements[game.appid].completed} / {achievements[game.appid].total}</p>
                {achievements[game.appid].nearby.length > 0 && (
                  <div>
                    <p><strong>Close to Completion:</strong></p>
                    <ul>
                      {achievements[game.appid].nearby.map((ach, index) => (
                        <li key={index}>{ach.name} - {ach.progress}%</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
