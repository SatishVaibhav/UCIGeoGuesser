import React from 'react';

interface ResultsProps {
  onNextImage: () => void;
  score: number;
}

const Results: React.FC<ResultsProps> = ({ onNextImage, score }) => {
  return (
      <button
        onClick={onNextImage}
        className="bg-gray text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 hover:bg-green-500/30 drop-shadow-[1px_1px_0px_black]"
      >
        Next Image (Score: {score})
      </button>
  );
};

export default Results;