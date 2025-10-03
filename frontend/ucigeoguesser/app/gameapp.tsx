// components/GameApp.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { openDB } from 'idb';
import 'leaflet/dist/leaflet.css';


import calculateScore from '../app/score';        // adjust if needed
import TitleScreen from './TitleScreen';
import Results from './results';
import Guess from './guess';
import GameTimer from './GameTimer';

// answer icon is only used by parent to know where to tell iframe to show answer (kept here if needed)
const answerIconUrl = 'https://www.rawshorts.com/freeicons/wp-content/uploads/2017/01/brown_webpict50_1484337223-1.png';

// NOTE: We do not import react-leaflet at all here.

export default function GameApp() {
  /*Use state*/
  const [loading, setLoading] = useState<boolean>(true);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [locationData, setLocationData] = useState<string[]>([]);
  const [guessCoords, setGuessCoords] = useState<[number, number] | null>(null);
  const [showTitleScreen, setShowTitleScreen] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hasGuessed, setHasGuessed] = useState<boolean>(false);

  /*Map iframe ref*/
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const mapOrigin = typeof window !== 'undefined' ? window.location.origin : '*';

  /*Round / timer*/
  const mapZoom = 14.5;
  const southWest = [33.637349505993626, -117.86376123182546];
  const northEast = [33.657544515897925, -117.82132053505912];

  const timeLimit = 10; //seconds
  const maxRounds = 5;
  const [currRound, setCurrRound] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  /* loadData (same as before) */
  const loadData = async () => {
    const nextRound = currRound + 1;
    if (nextRound > maxRounds) {
      setGameOver(true);
      return;
    }
    setCurrRound(nextRound);
    setHasGuessed(false);
    setGuessCoords(null);
    setLoading(true);

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
        const res = await fetch('https://ucigeoguesser.onrender.com/home');
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

    // clear iframe map markers for new round
    sendToMap({ type: 'clear', center: [33.645934402549955, -117.84272074704859], zoom: mapZoom });
  };

  useEffect(() => {
    // run only on client
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Keyboard handlers (Space to lock/confirm guess, Enter to accept and go to next) */
  useEffect(() => {
    const KeyPressHandler = (event: KeyboardEvent) => {
      if (event.code === 'Space' && guessCoords && !hasGuessed) {
        // lock the guess on both parent and iframe, and instruct iframe to show answer
        setHasGuessed(true);
        // show answer on iframe and lock clicks
        const answerLat = Number(locationData[1]);
        const answerLng = Number(locationData[0]);
        sendToMap({ type: 'lockAndShowAnswer', lat: answerLat, lng: answerLng });
      } else if (event.code === 'Enter' && guessCoords && hasGuessed) {
        const roundScore = calculateScore(
          guessCoords[0],
          guessCoords[1],
          Number(locationData[1]),
          Number(locationData[0])
        );
        setFinalScore(prev => prev + roundScore);
        setHasGuessed(false);
        // clear map and load next
        sendToMap({ type: 'clear' });
        loadData();
      }
    };

    window.addEventListener('keydown', KeyPressHandler);
    return () => window.removeEventListener('keydown', KeyPressHandler);
  }, [guessCoords, hasGuessed, locationData]);

  /* Message from iframe (map) -> parent */
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      const msg = ev.data || {};
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case 'mapReady':
          // optional: when map ready, you could center or set state
          break;

        case 'guess':
          // msg.lat, msg.lng (numbers)
          if (typeof msg.lat === 'number' && typeof msg.lng === 'number') {
            setGuessCoords([msg.lat, msg.lng]);
          }
          break;

        default:
          break;
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  /* helper to send message to iframe safely */
  const sendToMap = (msg: any) => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      win.postMessage(msg, '*'); // '*' is ok for dev; restrict origin in prod
    }
  };

  /* If user clicks "Next" in your Results component, ensure map is cleared */
  const handleNextImageFromResults = () => {
    const roundScore = guessCoords
      ? calculateScore(guessCoords[0], guessCoords[1], Number(locationData[1]), Number(locationData[0]))
      : 0;
    setFinalScore(prev => prev + roundScore);
    setHasGuessed(false);
    sendToMap({ type: 'clear' });
    loadData();
  };

  if (showTitleScreen) {
    return <TitleScreen onStart={() => setShowTitleScreen(false)} />;
  }

  return (
    <div
      className="min-h-screen w-full relative transition-opacity duration-500"
      style={{
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f172a',
      }}
    >
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="min-h-screen flex flex-col items-center justify-center">
          {/* Top HUD */}
          <div className="absolute top-2 left-2 bg-gray-500/30 bg-opacity-90 px-2 py-1 rounded-2xl shadow-xl text-center w-full max-w-xs">
            <div className="flex justify-between items-center">
              <h1 className="text-white font-extrabold text-4xl drop-shadow-[px_1px_0px_black]">UCI GeoGuesser</h1>
              <div className="text-white text-lg">
                <div className="text-white">
                  <span className="font-bold">Round: </span>
                  <span> {currRound}/{maxRounds} </span>
                </div>
                {gameOver && <div className="font-bold">Final Score: {finalScore}</div>}
              </div>
            </div>

            <div className="mt-2 text-white">
              {!gameOver && !hasGuessed ? (
                <GameTimer
                  timeLimitInSeconds={timeLimit}
                  onEnd={() => {
                    setHasGuessed(true);
                
                    if (!guessCoords) {
                      setGuessCoords([0, 0]);
                      // lock and show answer if timed out
                      const answerLat = Number(locationData[1]);
                      const answerLng = Number(locationData[0]);
                      sendToMap({ type: 'lockAndShowAnswer', lat: answerLat, lng: answerLng });
                    }
                    else {
                        const answerLat = Number(locationData[1]);
                        const answerLng = Number(locationData[0]);
                        sendToMap({type: 'lockAndShowAnswer', lat: answerLat, lng: answerLng})
                    }
                    
                  }}
                />
              ) : null }
            </div>

            {hasGuessed && guessCoords && !gameOver && (
              <Results
                onNextImage={() => handleNextImageFromResults()}
                score={calculateScore(
                  guessCoords[0],
                  guessCoords[1],
                  Number(locationData[1]),
                  Number(locationData[0])
                )}
              />
            )}
          </div>

          {/* iframe map in corner */}
          <div
            className="absolute bottom-2 right-2 transition-all duration-300 ease-in-out"
            style={{ height: isHovering ? '500px' : '325px', width: isHovering ? '500px' : '325px' }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <iframe
              ref={iframeRef}
              src="/geoguess-map.html"
              style={{ height: '100%', width: '100%', border: 0, borderRadius: 8 }}
              title="GeoGuesser Map"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
            {guessCoords && (
              <div
                style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '47%',
                    transform: 'translateX(-25%)',
                    fontSize: 22,
                    zIndex: 400,
                }}
              >
                <Guess onGuess={() => {
                    setHasGuessed(true);
                    const answerLat = Number(locationData[1]);
                    const answerLng = Number(locationData[0]);
                    sendToMap({ type: 'lockAndShowAnswer', lat: answerLat, lng: answerLng });
                }} hasGuessed={hasGuessed} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
