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
// tính điểm theo số ô màu đã xóa, không nhân theo hàng
function addColorScore(clearedCells) {
    score += clearedCells * 10;
    scoreElement.textContent = score;
}
