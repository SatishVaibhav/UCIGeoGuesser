'use client';

import React, { useState, useEffect } from 'react';

const App = () => {
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:18080/home')
      .then(res => res.json())
      .then(data => {
        const images = data.images;
        const keys = Object.keys(images);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        setImageSrc(images[randomKey]);
      })
      .catch(err => {
        console.error(err);
        setImageSrc('');
      });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="bg-white bg-opacity-90 px-8 py-10 rounded-2xl shadow-xl text-center w-full max-w-md">
        <h1 className="mb-4 text-black font-extrabold text-4xl">
          UCI GeoGuessr
        </h1>
        <p className="mt-4 text-xs text-slate-500 font-medium">
          Refresh to get a new location!
        </p>
      </div>
    </div>
  );
};

export default App;
