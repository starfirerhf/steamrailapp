import React, { useState } from "react";

const API_URL = "http://localhost:8000"; // Change this if your backend is hosted elsewhere

const App = () => {
  const [steamId, setSteamId] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedGame, setExpandedGame] = useState(null);
  const [achievements, setAchievements] = useState({});

  // Fetch user's game library
  const fetchGames = async () => {
    if (!steamId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/games/${steamId}`);
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error("Failed to fetch games", error);
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
      setAchievements((prev) => ({ ...prev, [appid]: data }));
      setExpandedGame(appid);
    } catch (error) {
      console.error("Failed to fetch achievements", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-6">🎮 Steam Game Tracker</h1>

      {/* Input for Steam ID */}
      <div className="flex justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter Steam ID"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          className="p-2 rounded-lg text-black"
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
                  <p><span className="font-bold">Completed:</span> {achievements[game.appid].completed} / {achievements[game.appid].total}</p>
                  {achievements[game.appid].nearby.length > 0 && (
                    <div>
                      <p className="font-bold">Close to Completion:</p>
                      <ul className="list-disc ml-5">
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
    </div>
  );
};

export default App;



// import React, { useState } from "react";
// import { Box, Button, Input, VStack, Text, Image, Flex, Spinner } from "@chakra-ui/react";
// import { Collapse } from "@chakra-ui/transition";

// const API_URL = "http://localhost:8000"; // Change this if your backend is hosted elsewhere

// const App = () => {
//   const [steamId, setSteamId] = useState("");
//   const [games, setGames] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [expandedGame, setExpandedGame] = useState(null);
//   const [achievements, setAchievements] = useState({});

//   // Fetch user's game library
//   const fetchGames = async () => {
//     if (!steamId) return;
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/games/${steamId}`);
//       const data = await response.json();
//       setGames(data);
//     } catch (error) {
//       console.error("Failed to fetch games", error);
//     }
//     setLoading(false);
//   };

//   // Fetch achievements only when the game is clicked
//   const fetchAchievements = async (appid) => {
//     if (achievements[appid]) {
//       setExpandedGame(expandedGame === appid ? null : appid);
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/achievements/${steamId}/${appid}`);
//       const data = await response.json();
//       setAchievements((prev) => ({ ...prev, [appid]: data }));
//       setExpandedGame(appid);
//     } catch (error) {
//       console.error("Failed to fetch achievements", error);
//     }
//   };

//   return (
//     <Box bg="gray.800" color="white" minH="100vh" p={6}>
//       {/* Header */}
//       <Text fontSize="3xl" fontWeight="bold" textAlign="center" mb={6}>
//         🎮 Steam Game Tracker
//       </Text>

//       {/* Input for Steam ID */}
//       <Flex justify="center" gap={4} mb={6}>
//         <Input
//           placeholder="Enter Steam ID"
//           value={steamId}
//           onChange={(e) => setSteamId(e.target.value)}
//           bg="white"
//           color="black"
//           maxW="300px"
//           borderRadius="md"
//         />
//         <Button colorScheme="blue" onClick={fetchGames}>
//           Fetch Games
//         </Button>
//       </Flex>

//       {/* Loading Indicator */}
//       {loading && (
//         <Flex justify="center" mb={6}>
//           <Spinner size="xl" />
//         </Flex>
//       )}

//       {/* Game List */}
//       <VStack spacing={4} maxW="800px" mx="auto">
//         {games.map((game) => (
//           <Box key={game.appid} bg="gray.900" p={4} borderRadius="lg" boxShadow="lg" w="100%">
//             {/* Game Header (Click to Expand) */}
//             <Flex align="center" justify="space-between" cursor="pointer" onClick={() => fetchAchievements(game.appid)}>
//               <Flex align="center">
//                 <Image
//                   src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
//                   alt={game.name}
//                   boxSize="50px"
//                   borderRadius="md"
//                   mr={4}
//                 />
//                 <Box>
//                   <Text fontSize="xl" fontWeight="bold">
//                     {game.name}
//                   </Text>
//                   <Text fontSize="sm" color="gray.400">
//                     {(game.playtime_forever / 60).toFixed(1)} hrs played
//                   </Text>
//                 </Box>
//               </Flex>
//               <Text fontSize="xl">{expandedGame === game.appid ? "▲" : "▼"}</Text>
//             </Flex>

//             {/* Expanded Achievement Details */}
//             <Collapse in={expandedGame === game.appid} animateOpacity>
//               <Box mt={3} borderTop="1px solid" borderColor="gray.700" pt={3}>
//                 <Text fontWeight="bold">
//                   Completed: {achievements[game.appid]?.completed} / {achievements[game.appid]?.total}
//                 </Text>
//                 {achievements[game.appid]?.nearby?.length > 0 && (
//                   <Box mt={2}>
//                     <Text fontWeight="bold">Close to Completion:</Text>
//                     <VStack align="start" spacing={1} mt={1}>
//                       {achievements[game.appid]?.nearby.map((ach, index) => (
//                         <Text key={index} fontSize="sm">
//                           {ach.name} - {ach.progress}%
//                         </Text>
//                       ))}
//                     </VStack>
//                   </Box>
//                 )}
//               </Box>
//             </Collapse>
//           </Box>
//         ))}
//       </VStack>
//     </Box>
//   );
// };

// export default App;


// import React, { useState } from "react";

// const API_URL = "http://localhost:8000"; // Change this if your backend is hosted elsewhere

// const App = () => {
//   const [steamId, setSteamId] = useState("");
//   const [games, setGames] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [expandedGame, setExpandedGame] = useState(null);
//   const [achievements, setAchievements] = useState({});

//   // Fetch user's game library
//   const fetchGames = async () => {
//     if (!steamId) return;
//     setLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/games/${steamId}`);
//       const data = await response.json();
//       setGames(data);
//     } catch (error) {
//       console.error("Failed to fetch games", error);
//     }
//     setLoading(false);
//   };

//   // Fetch achievements only when the game is clicked
//   const fetchAchievements = async (appid) => {
//     if (achievements[appid]) {
//       setExpandedGame(expandedGame === appid ? null : appid);
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/achievements/${steamId}/${appid}`);
//       const data = await response.json();
//       setAchievements((prev) => ({ ...prev, [appid]: data }));
//       setExpandedGame(appid);
//     } catch (error) {
//       console.error("Failed to fetch achievements", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-800 text-white p-6">
//       {/* Header */}
//       <h1 className="text-3xl font-bold text-center mb-6">🎮 Steam Game Tracker</h1>

//       {/* Input for Steam ID */}
//       <div className="flex justify-center gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Enter Steam ID"
//           value={steamId}
//           onChange={(e) => setSteamId(e.target.value)}
//           className="p-2 rounded-lg text-black"
//         />
//         <button
//           onClick={fetchGames}
//           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
//         >
//           Fetch Games
//         </button>
//       </div>

//       {/* Loading Indicator */}
//       {loading && <p className="text-center text-lg">Loading games...</p>}
//       <div className="bg-blue-500 text-white p-4">Hello, Tailwind!</div>
//       {/* Game List */}
//       <div className="max-w-4xl mx-auto mt-6 px-4">
//         {games.map((game) => (
//           <div key={game.appid} className="bg-gray-900 p-4 rounded-lg shadow-md">
//             {/* Game Header (Click to Expand) */}
//             <div
//               className="flex justify-between items-center cursor-pointer"
//               onClick={() => fetchAchievements(game.appid)}
//             >
//               <div className="flex items-center">
//                 <img
//                   src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
//                   alt={game.name}
//                   className="w-16 h-16 mr-4 rounded-md"
//                 />
//                 <div>
//                   <h3 className="text-xl font-semibold">{game.name}</h3>
//                   <p className="text-sm text-gray-400">{(game.playtime_forever / 60).toFixed(1)} hours played</p>
//                 </div>
//               </div>
//               <span className="text-xl">{expandedGame === game.appid ? "▲" : "▼"}</span>
//             </div>

//             {/* Expanded Achievement Details */}
//             {expandedGame === game.appid && achievements[game.appid] && (
//               <div className="mt-3 border-t border-gray-700 pt-3">
//                 <p><span className="font-bold">Completed:</span> {achievements[game.appid].completed} / {achievements[game.appid].total}</p>
//                 {achievements[game.appid].nearby.length > 0 && (
//                   <div>
//                     <p className="font-bold">Close to Completion:</p>
//                     <ul className="list-disc ml-5">
//                       {achievements[game.appid].nearby.map((ach, index) => (
//                         <li key={index}>{ach.name} - {ach.progress}%</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default App;
