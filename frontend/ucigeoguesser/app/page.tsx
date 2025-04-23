'use client';

import React, { useState, useEffect } from 'react';
import { openDB } from 'idb';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import calculateScore from './score';
import TitleScreen from './TitleScreen';

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

L.Marker.prototype.options.icon = defaultIcon;

const App = () => {
  
  /*Use state*/
  const [loading, setLoading] = useState<boolean>(true);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [locationData, setLocationData] = useState<string[]>([]);
  const [guessCoords, setGuessCoords] = useState<[number, number] | null>(null);
  const [showTitleScreen, setShowTitleScreen] = useState<boolean>(true); // NEW
  const [isHovering, setIsHovering] = useState<boolean>(false);
  
  /*Map settings*/
  const mapZoom = 14.5;
  const southWest = L.latLng(33.63996645704226, -117.8553771977022);
  const northEast = L.latLng(33.65229191655349, -117.82417774244097);
  const mapBounds = L.latLngBounds(southWest, northEast);

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

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setGuessCoords([e.latlng.lat, e.latlng.lng]);
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
          <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-1 py-0 rounded-2xl shadow-xl text-center w-full max-w-xs">
            <h1 className="mb-2 text-black font-extrabold text-4xl">UCI GeoGuesser</h1>
            <h2 className="mb-2 text-slate font-semibold text-3xl">

            </h2>
            {guessCoords && (
              <p className="text-sm text-black-700 font-bold">
                Score: {calculateScore(guessCoords[0], guessCoords[1], Number(locationData[1]), Number(locationData[0]))}
              </p>
            )}
          </div>

            {/* Center at aldrich park */}
            
            <div className="absolute bottom-2 right-2 transition-all duration-300 ease-in-out" style={{ height: isHovering ? '500px' : '325px', width: isHovering ? '500px' : '325px' }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
          <MapContainer className="h-full w-full" center={[33.645934402549955, -117.84272074704859]} zoom={mapZoom} minZoom={mapZoom} maxBounds={mapBounds}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapClickHandler />
            {guessCoords && <Marker position={guessCoords} />}
          </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;