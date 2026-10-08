let score = 0;
const scoreElement = document.querySelector(".score");

// cộng điểm
function addScore(clearedLines) {
    score += clearedLines * 100;
    scoreElement.textContent = score;
}

// đặt điểm về 0
function resetScore() {
    score = 0;
    scoreElement.textContent = score;
}