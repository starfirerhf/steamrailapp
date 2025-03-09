import { useState } from "react";

const GameCard = ({ game }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-lg transition-transform transform hover:scale-105 mb-4">
      {/* Header */}
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <img 
            src={game.icon} 
            alt={game.name} 
            className="w-16 h-16 mr-4 rounded-md"
          />
          <div>
            <h3 className="text-xl font-semibold">{game.name}</h3>
            <p className="text-sm text-gray-400">{game.playtime} hours played</p>
          </div>
        </div>
        <span className="text-xl">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="mt-3 border-t border-gray-700 pt-3 animate-fadeIn">
          <p className="font-bold text-lg">Achievements:</p>
          <p>{game.completed_achievements} / {game.total_achievements}</p>
          {/* Add "Nearby" Achievements Here */}
        </div>
      )}
    </div>
  );
};

export default GameCard;
