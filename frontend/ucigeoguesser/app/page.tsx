'use client';

import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [locationData, setLocationData] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  
    const loadData = async () => {
      const db = await openDB('ImageDB', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('homeData')) {
            db.createObjectStore('homeData');
          }
        },
      });
  
      let allImages = await db.get('homeData', 'allImages');
  
      if (!allImages) {
        try {
          const res = await fetch('http://localhost:18080/home');
          const data = await res.json();
          allImages = data.images;
          await db.put('homeData', allImages, 'allImages');
        } catch (err) {
          console.error(err);
          setImageSrc('');
          setLocationData([]);
          setLoading(true);
          return;
        }
      }
  
      const imageKeys = Object.keys(allImages);
      const randomKey = imageKeys[Math.floor(Math.random() * imageKeys.length)];
      const selected = allImages[randomKey];
      setImageSrc(selected.image);
      setLocationData([
        selected.metadata.geoData.longitude,
        selected.metadata.geoData.latitude,
      ]);
      setLoading(false);
    };
  
    loadData();
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
            Latitude: { locationData[1]}, Longitude: { locationData[0] }
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
