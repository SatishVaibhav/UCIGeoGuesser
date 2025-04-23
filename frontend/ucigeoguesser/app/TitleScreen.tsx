import React from 'react';

interface TitleScreenProps {
  onStart: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-yellow-300 to-blue-950 text-white text-center p-4">
      <h1 className="text-5xl font-extrabold mb-6 drop-shadow-xl">UCI GeoGuesser</h1>
      <p className="text-lg mb-8 max-w-md">
        Test your knowledge of UCI's geography! Click anywhere on the map to guess the location of a random image.
      </p>
      <button
        onClick={onStart}
        className="bg-black text-white-900 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-blue-100 transition"
      >
        Start Game
      </button>
    </div>
  );
};

export default TitleScreen;