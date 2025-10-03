'use client';

import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { icon } from 'leaflet';

import calculateScore from './score';
import TitleScreen from './TitleScreen';
import Results from './results';
import Guess from './guess';
import GameTimer from './GameTimer';

// Set a default icon for markers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const answerIcon = L.icon({
  iconUrl: 'https://www.rawshorts.com/freeicons/wp-content/uploads/2017/01/brown_webpict50_1484337223-1.png',
  iconRetinaUrl: 'https://www.rawshorts.com/freeicons/wp-content/uploads/2017/01/brown_webpict50_1484337223-1.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [41, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [30, 30],
});

L.Marker.prototype.options.icon = defaultIcon;

const App = () => {
  
  /*Use state*/
  const [loading, setLoading] = useState<boolean>(true);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [locationData, setLocationData] = useState<string[]>([]);
  const [guessCoords, setGuessCoords] = useState<[number, number] | null>(null);
  const [showTitleScreen, setShowTitleScreen] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hasGuessed, setHasGuessed] = useState<boolean>(false);
  
  /*Map settings*/
  const mapZoom = 14.5;
  const southWest = L.latLng(33.637349505993626, -117.86376123182546);
  const northEast = L.latLng(33.657544515897925, -117.82132053505912);
  const mapBounds = L.latLngBounds(southWest, northEast);

  /*Timer*/
  const timeLimit = 30; //seconds

  /*Round States and Constants*/
  const maxRounds = 5;
  const [currRound, setCurrRound] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const loadData = async () => {
    const nextRound = currRound + 1;
    if(nextRound > maxRounds){
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

  useEffect(() => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) return;
    loadData();
  }, []);

  useEffect(() => {
    //Finalize guess by pressing space bar
    const KeyPressHandler = (event: KeyboardEvent) => {
      if (event.code === 'Space' && guessCoords && !hasGuessed) {
        setHasGuessed(true);
      } else if (event.code === 'Enter' && guessCoords && hasGuessed) {
        const roundScore = calculateScore(guessCoords[0], guessCoords[1], Number(locationData[1]), Number(locationData[0]));
        setFinalScore(prev => prev + roundScore);
        setHasGuessed(false);
        loadData();
      }
    };

    window.addEventListener('keydown', KeyPressHandler);
    return () => window.removeEventListener('keydown', KeyPressHandler);
  }, [guessCoords, hasGuessed, locationData]);

  const MapClickHandler = ({ hasGuessed }: 
    {hasGuessed: boolean;}) => {
    useMapEvents({
      click(e) {
        if (!hasGuessed) {
          setGuessCoords([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
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
          <div className="absolute top-2 left-2 bg-gray-500/30 bg-opacity-90 px-2 py-1 rounded-2xl shadow-xl text-center w-full max-w-xs">
            <div className="flex justify-between items-center">
              <h1 className="text-white font-extrabold text-4xl drop-shadow-[px_1px_0px_black]">
                UCI GeoGuesser
              </h1>
              <div className="text-white text-lg">
                <div className="text-white">
                  <span className="font-bold">Round: </span>
                  <span> {currRound}/{maxRounds} </span>
                </div>
                {gameOver && (
                  <div className="font-bold">Final Score: {finalScore}</div>
                )}
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
                    }
                  }}
                />
              ) : null}
            </div>
            {hasGuessed && guessCoords && !gameOver && (
              <Results
                onNextImage={() => {
                  const roundScore = calculateScore(guessCoords[0], guessCoords[1], Number(locationData[1]), Number(locationData[0]));
                  setFinalScore(prev => prev + roundScore);
                  setHasGuessed(false);
                  loadData();
                }}
                score={calculateScore(guessCoords[0], guessCoords[1], Number(locationData[1]), Number(locationData[0]))}
              />
            )}
          </div>
              
          <div className="absolute bottom-2 right-2 transition-all duration-300 ease-in-out" style={{ height: isHovering ? '500px' : '325px', width: isHovering ? '500px' : '325px' }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <MapContainer className="h-full w-full"
              center={[33.645934402549955, -117.84272074704859]}
              zoom={mapZoom}
              minZoom={mapZoom}
              maxBounds={mapBounds}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <MapClickHandler hasGuessed={hasGuessed} />
              {guessCoords && <Marker position={guessCoords} />}
              {hasGuessed && locationData && (
                <Marker position={[Number(locationData[1]), Number(locationData[0])]} icon={answerIcon} />
              )}
            </MapContainer>
            {guessCoords && (
            <div style={{
              position: 'absolute', 
              bottom: '10%', 
              left: '47%', 
              transform: 'translateX(-25%)', 
              fontSize: 22,
              zIndex: 400,
              }}>
                <Guess onGuess={() => setHasGuessed(true)} hasGuessed={hasGuessed}/>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;