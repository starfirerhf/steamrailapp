import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const App = () => {
  const [steamId, setSteamId] = useState("");
  const [games, setGames] = useState([]);
  const [error, setError] = useState("");

  const fetchGames = async () => {
    try {
      setError("");
      const response = await axios.get(`${API_URL}/games/${steamId}`);
      setGames(response.data); // Expecting array of game objects
    } catch (err) {
      setError("Failed to fetch games. Ensure your Steam ID is correct.");
    }
  };

  return (
    <div className="container">
      <h1>Steam Game Library</h1>
      <input
        type="text"
        placeholder="Enter Steam ID"
        value={steamId}
        onChange={(e) => setSteamId(e.target.value)}
      />
      <button onClick={fetchGames}>Fetch Games</button>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Game Icon</th>
            <th>Game Name</th>
            <th>Hours Played</th>
            <th>Completed Achievements</th>
            <th>Total Achievements</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.appid}>
              <td>
                <img
                  src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                  alt={game.name}
                  width="50"
                />
              </td>
              <td>{game.name}</td>
              <td>{(game.playtime_forever / 60).toFixed(1)} hrs</td>
              <td>{game.completed_achievements}</td>
              <td>{game.total_achievements}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;



// SUNSETTED TO ADD ICONS AND TABLE STRUCTURE
// import React, { useState } from "react";
// import axios from "axios";

// function App() {
//     const [steamId, setSteamId] = useState("");
//     const [games, setGames] = useState([]);
//     const [error, setError] = useState("");
//     const API_URL = process.env.REACT_APP_API_URL;

//     const fetchGames = async () => {
//         try {
//             setError("");
//             const response = await axios.get(`${API_URL}/games/${steamId}`);
//             setGames(response.data);
//         } catch (err) {
//             setError("Failed to fetch games. Ensure your Steam ID is correct.");
//         }
//     };

//     return (
//         <div style={{ padding: "20px" }}>
//             <h1>Steam Game Library</h1>
//             <input
//                 type="text"
//                 placeholder="Enter Steam ID"
//                 value={steamId}
//                 onChange={(e) => setSteamId(e.target.value)}
//             />
//             <button onClick={fetchGames}>Fetch Games</button>

//             {error && <p style={{ color: "red" }}>{error}</p>}

//             <ul>
//                 {games.map((game, index) => (
//                     <li key={index}>
//                         {game.name} - {game.playtime_hours} hours
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// export default App;



// import React, { useEffect, useState } from "react";

// function App() {
//   const [steamData, setSteamData] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchSteamData();
//   }, []);

//   const fetchSteamData = async () => {
//     try {
//       const response = await fetch("http://backend:8000/steam/{steam_id}/games"); // Ensure this matches your backend route
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       const data = await response.json();
//       setSteamData(data);
//     } catch (error) {
//       console.error("Failed to fetch Steam data:", error);
//       setError(error.message);
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <h1>Steam Library Tracker</h1>
//       {error ? (
//         <p style={styles.error}>Error: {error}</p>
//       ) : (
//         <ul style={styles.list}>
//           {steamData.length > 0 ? (
//             steamData.map((game, index) => (
//               <li key={index} style={styles.listItem}>
//                 <strong>{game.name}</strong> - {game.hours_played} hours
//               </li>
//             ))
//           ) : (
//             <p>Loading Steam data...</p>
//           )}
//         </ul>
//       )}
//     </div>
//   );
// }

// const styles = {
//   container: {
//     textAlign: "center",
//     fontFamily: "Arial, sans-serif",
//     margin: "20px",
//   },
//   list: {
//     listStyleType: "none",
//     padding: 0,
//   },
//   listItem: {
//     background: "#f4f4f4",
//     padding: "10px",
//     margin: "5px",
//     borderRadius: "5px",
//   },
//   error: {
//     color: "red",
//     fontWeight: "bold",
//   },
// };

// export default App;



// import { useState, useEffect } from "react";



// function App() {
//   const [steamID, setSteamID] = useState("");
//   const [games, setGames] = useState([]);

//   const fetchSteamData = async () => {
//     const response = await fetch(`http://backend:8000/api/steam/${steamID}`);
//     const data = await response.json();
//     setGames(data);
//   };

//   useEffect(() => {
//     fetch("http://backend:8000/games/")
//       .then((response) => response.json())
//       .then((data) => setGames(data))
//       .catch((error) => console.error("Error fetching games:", error));
//   }, []);

//   return (
//     <div>
//       <h1>Steam Game Time Tracker</h1>
//       <input 
//         type="text" 
//         value={steamID} 
//         onChange={(e) => setSteamID(e.target.value)} 
//         placeholder="Enter Steam ID" 
//       />
//       <button onClick={fetchSteamData}>Get Games</button>
//       <ul>
//         {games.map((game) => (
//           <li key={game.appid}>
//             {game.name} - {(game.playtime_forever / 60).toFixed(2)} hours
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default App;


// {/* <h1>Game Backlog</h1>
// <ul>
//   {games.map((game) => (
//     <li key={game.id}>
//       {game.name} - {game.playtime} hours
//     </li>
//   ))}
// </ul> */}



// // import logo from './logo.svg';
// import TicTacToe from './TicTacToe';
// import './App.css';

// function App() {
//   return (
//     // <div className="App">
//     //   <header className="App-header">
//     //     <img src={logo} className="App-logo" alt="logo" />
//     //     <p>
//     //       Edit <code>src/App.js</code> and save to reload.
//     //     </p>
//     //     <a
//     //       className="App-link"
//     //       href="https://reactjs.org"
//     //       target="_blank"
//     //       rel="noopener noreferrer"
//     //     >
//     //       Learn React
//     //     </a>
//     //   </header>
//     // </div>
//     <div className="App">
//     <h1>Tic Tac Toe</h1>
//     <TicTacToe />
//   </div>
//   );
// }

// export default App;
