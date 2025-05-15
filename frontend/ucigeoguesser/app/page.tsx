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

  useEffect(() => {
    //Finalize guess by pressing space bar
    const KeyPressHandler = (event: KeyboardEvent) => {
      if (event.code === 'Space' && guessCoords && !hasGuessed) {
        setHasGuessed(true);
      }

    //Show next image by pressing enter (can be changed or removed if deemed obsolete)
      else if (event.code === 'Enter' && guessCoords && hasGuessed) {
        loadNewImage();
        setHasGuessed(false);
      }
    };

    window.addEventListener('keydown', KeyPressHandler);
    return () => window.removeEventListener('keydown', KeyPressHandler);
  }, [guessCoords, hasGuessed]);

  const loadNewImage = async () => {
    setLoading(true);
    setGuessCoords(null);
    const db = await openDB('ImageDB', 1);
    const allImages = await db.get('homeData', 'allImages');
    const imageKeys = Object.keys(allImages);
    const randomKey = imageKeys[Math.floor(Math.random() * imageKeys.length)];
    const selected = allImages[randomKey];
    setImageSrc(selected.image);
    setLocationData([
      selected.metadata.geoData.longitude,
      selected.metadata.geoData.latitude,
    ]);
    setLoading(false);
  }

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
          <div className="absolute top-2 left-2 bg-gray-500/30 bg-opacity-90 px-1 py-0 rounded-2xl shadow-xl text-center w-full max-w-xs">
            <h1 className="mb-2 text-white font-extrabold text-4xl drop-shadow-[px_1px_0px_black]">UCI GeoGuesser</h1>
            <div className="text-white">
            {(!guessCoords)? <GameTimer timeLimitInSeconds={timeLimit} onEnd={() => {setHasGuessed(true); setGuessCoords([0, 0])}}></GameTimer> : <GameTimer timeLimitInSeconds={10} onEnd={() => {setHasGuessed(true);}}></GameTimer>}
            </div>
            {hasGuessed && guessCoords &&(
              <Results onNextImage={() => {
                loadNewImage();
                setHasGuessed(false);
              }} 
                score={calculateScore(guessCoords[0], guessCoords[1], 
                  Number(locationData[1]), 
                  Number(locationData[0]))
                }
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