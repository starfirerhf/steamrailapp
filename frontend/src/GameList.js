import GameCard from "./GameCard";

const GameList = ({ games }) => {
  return (
    <div className="max-w-4xl mx-auto mt-6">
      {games.map((game) => (
        <GameCard key={game.appid} game={game} />
      ))}
    </div>
  );
};

export default GameList;
