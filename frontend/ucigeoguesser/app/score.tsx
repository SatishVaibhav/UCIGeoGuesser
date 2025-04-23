function calculateScore(userLatitude: number, userLongitude: number, correctLatitude: number, correctLongitude: number) {
    const latScore = Math.abs(userLatitude - correctLatitude);
    const longScore = Math.abs(userLongitude - correctLongitude);
    
    const distance = Math.sqrt(latScore**2 + longScore**2);

    const maxScore = 5000; 
    let score = Math.round(maxScore * (Math.E ** (-distance*150)));

    if(score >= 4930){
        score = 5000;
    }

    return score;
}

export default calculateScore;