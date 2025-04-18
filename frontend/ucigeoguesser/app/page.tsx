'use client';

// import Image from "next/image";
import React, { useState, useEffect } from 'react';

const App = () => {
  const [msg, setMsg] = useState<string>('Testing..');

  useEffect(() => {
    fetch('http://localhost:18080/home')
      .then(res => res.json())
      .then(text => {
        const images = text.images;
        const imagesKeys = Object.keys(images);
        const randomKey = imagesKeys[Math.floor(Math.random() * imagesKeys.length)]
        console.log(randomKey);
        console.log(images[randomKey]);
        setMsg(images[randomKey]);
      })
      .catch(err => setMsg('Error; server didn\'t connect: ' + err));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-cyan-100 to-teal-300">
      <div className="bg-white px-8 py-10 rounded-2xl shadow-xl text-center w-full max-w-md">
        <h1 className="mb-4 text-black font-extrabold text-4xl">
          UCI GeoGuessr
          </h1>
        <div className="text-xl text-slate-800 font-semibold py-6 border-y border-slate-200 mb-4">
          {msg}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Refresh for a new location!
        </p>
      </div>
    </div>
  );
}

export default App;