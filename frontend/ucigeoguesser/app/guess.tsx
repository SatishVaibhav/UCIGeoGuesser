import React from 'react';

interface GuessProps {
  onGuess: () => void;
  guessed: boolean;
}

const Guess: React.FC<GuessProps> = ({ guessed }) => {
  return (
      <button
        className="bg-green-500 text-white font-bold py-1 px-7 
        rounded-xl transition-colors duration-200 
        hover:bg-green-700 drop-shadow-[1px_1px_0px_black]"
      >
        Guess
      </button>
  )};

export default Guess;