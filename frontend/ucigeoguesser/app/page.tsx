'use client';

// import Image from "next/image";
import React, { useState, useEffect } from 'react';
// import tailwindcss from '@tailwindcss/postcss';

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

  return(
      <div> 
        <h1 className=''>Server Info</h1>
        <p>
          {msg}
        </p>
      </div>
  );
}

export default App;