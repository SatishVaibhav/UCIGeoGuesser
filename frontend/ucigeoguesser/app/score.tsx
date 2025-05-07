function calculateScore(userLatitude: number, userLongitude: number, correctLatitude: number, correctLongitude: number) {
    const latScore = Math.abs(userLatitude - correctLatitude);
    const longScore = Math.abs(userLongitude - correctLongitude);
    const distance = Math.sqrt(latScore**2 + longScore**2);
    const maxScore = 5000; 
    
    let score: number;
    
    if (distance <= 0.00398543) {
        score = Math.round(-maxScore * Math.E ** ((distance - 0.005) * 650) + 5200);
    }

    else {
        score = Math.round(maxScore * Math.E ** (-658 * (distance - 0.003)))
    }

    if(score >= 4950){
        score = 5000;
    }

    return score;
}

export default calculateScore;