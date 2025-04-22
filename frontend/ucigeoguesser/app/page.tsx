'use client';

import React, { useState, useEffect } from 'react';

const App = () => {

  const [loading, setLoading] = useState<boolean>(true);

  const [imageSrc, setImageSrc] = useState<string>('');
  const [locationData, setLocationData] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:18080/home')
      .then(res => res.json())
      .then(data => {
        const images = data.images;
        const imageKey = Object.keys(images);
        const randomKey = imageKey[Math.floor(Math.random() * imageKey.length)];
        setImageSrc(images[randomKey]['image']);
        setLocationData([images[randomKey]['metadata']['geoData']['longitude'], images[randomKey]['metadata']['geoData']['latitude']])
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setImageSrc('');
        setLocationData([]);
        setLoading(true);
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
        {loading ? <p>Loading Coordinates...</p> : (
          locationData && (
          <h2 className="mb-4 text-slate font-semibold text-3xl">
            Latitude: { locationData[0]}, Longitude: { locationData[1] }
          </h2>
          )
          )
          }
        <p className="mt-4 text-xs text-slate-500 font-medium">
          Refresh to get a new location!
        </p>
      </div>
    </div>
  );
};

export default App;
