import { useEffect, useRef, useState } from "react";

const tracks = [
  "/music_effects/"
];

const usePlaylistPlayer = () => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);  // Track if music is playing
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    // Create a new audio element and set it up
    const audio = new Audio(tracks[trackIndex]);
    audio.volume = 1;
    audioRef.current = audio;

    audio.onended = () => {
      const nextIndex = (trackIndex + 1) % tracks.length;
      setTrackIndex(nextIndex); // Triggers loading the next track
    };

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [trackIndex]);

  return {
    startMusic,      // Function to start the music when triggered by user interaction
    pause: () => audioRef.current?.pause(),
    current: tracks[trackIndex],
    next: () => setTrackIndex((prev) => (prev + 1) % tracks.length),
  };
};

export default usePlaylistPlayer;