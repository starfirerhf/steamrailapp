import React, { useState } from "react";

// Square Component
const Square = ({ value, onClick }) => {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
};

// TicTacToe Component
const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);

  // Check for winner
  const calculateWinner = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return; // Ignore click if the square is already filled or there is a winner

    const newBoard = board.slice();
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
    setWinner(calculateWinner(newBoard));
  };

  const renderSquare = (index) => (
    <Square value={board[index]} onClick={() => handleClick(index)} />
  );

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  return (
    <div className="game">
      <div className="status">
        {winner ? `Winner: ${winner}` : `Next player: ${isXNext ? "X" : "O"}`}
      </div>
      <div className="board">
        {Array.from({ length: 3 }, (_, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {Array.from({ length: 3 }, (_, colIndex) => {
              const index = rowIndex * 3 + colIndex;
              return renderSquare(index);
            })}
          </div>
        ))}
      </div>
      <button className="reset" onClick={resetGame}>Restart Game</button>
    </div>
  );
};

export default TicTacToe;
