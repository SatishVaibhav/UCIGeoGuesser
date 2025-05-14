import { useEffect, useRef, useState } from "react";

// timeLimitInSeconds is a integer in seconds
// onEnd (function) does not need to be passed in as args
function GameTimer({timeLimitInSeconds, onEnd}) {

    /* Time Settings */
    // UseRef are used to prevent re-rendering in the useEffect (setInterval specifically) function I learn this the hard way...
    const initialTime = useRef(Date.now());
    const currentTime = useRef(initialTime);

    const [timeLeft, setTimeLeft] = useState(timeLimitInSeconds);
    const timeIntervalRef = useRef();


    // Updates the timer every second and clears when negative
    useEffect(() => {
        if (!timeOver(initialTime.current, currentTime.current, timeLimitInSeconds)) {
            timeIntervalRef.current = setInterval(() => {
                currentTime.current = Date.now();
                const timeRemaining = Math.ceil(timeLeftInSeconds(initialTime.current, currentTime.current, timeLimitInSeconds));
                setTimeLeft(timeRemaining);
                // Stops the timer from going below zero
                if (timeRemaining <= 0) {
                    clearInterval(timeIntervalRef.current);
                }
            }, 1000); // Updates every 1 second (1000ms)  

           
        }
        

        return (() => {
            clearInterval(timeIntervalRef.current);
        });

       
        
    }, [timeLimitInSeconds])

    if (timeLeft <= 0) {
        onEnd?.(); // If onEnd isnt passed in this syntax allows it to be no-op (doesnt do anything)
        return null;
    }
    else {
        return (
            <h1>{formatTime(timeLeft)}</h1>
        );
    }
    
   
}

// Checks if time is over and returns true/false
function timeOver(startTime, currentTime, timeLimitInSeconds) {
    return (timeLeftInSeconds(startTime, currentTime, timeLimitInSeconds)) <= 0 ? true : false;
}

// Current time in seconds and returns a double (number in js)
function timeLeftInSeconds(startTime, currentTime, timeLimitInSeconds) {
    return (timeLimitInSeconds  - (currentTime - startTime)/1000);
}

// Format time in Minute, Seconds format
function formatTime(time) {
    const minutes = Math.floor(time/60);
    const seconds = Math.floor(time % 60);
    if (seconds < 10) {
        return minutes + ':0' + seconds;
    }
    return minutes + ':' + seconds;

}

export default GameTimer;