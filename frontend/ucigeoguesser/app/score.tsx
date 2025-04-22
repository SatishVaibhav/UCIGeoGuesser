function calculateScore(userLatitude: number, userLongitude: number, correctLatitude: number, correctLongitude: number) {
    const latScore = Math.abs(userLatitude - correctLatitude);
    const longScore = Math.abs(userLongitude - correctLongitude);
    
    const distance = Math.sqrt(latScore**2 + longScore**2);

    const maxScore = 5000; 
    var score = Math.round(maxScore - 1000000/1.4 * distance);
    if (score < 0) {
        score = 0;
    }

    return score;
}

export default calculateScore;