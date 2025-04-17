'use client';

// import Image from "next/image";
import React, { useState, useEffect } from 'react';
// import tailwindcss from '@tailwindcss/postcss';

const App = () => {
  const [msg, setMsg] = useState('Testing..');

  useEffect(() => {
    fetch('http://localhost:18080/home')
      .then(res => res.text())
      .then(text => setMsg(text))
      .catch(err => setMsg('Error; server didn\'t connect: ' + err));
  }, []);

  return(
      <div> 
        <h1>Server Info</h1>
        <p>
          {msg}
        </p>
      </div>
  );
}

export default App;