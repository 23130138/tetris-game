let isGameOver = false;
let timer = null;
let isPlaying = false;
const startButton = document.querySelector("#start");
const restartButton = document.querySelector("#restart");
const exitButton = document.querySelector("#exit");

// di chuyển sang trái
function moveLeft() {
    if (canMove(currentPiece, currentX - 1, currentY)) {
        currentX--;
        drawBoard();
        drawPiece();
    }
}

// di chuyển sang phải
function moveRight() {
    if (canMove(currentPiece, currentX + 1, currentY)) {
        currentX++;
        drawBoard();
        drawPiece();
    }
}

// di chuyển xuống
function moveDown() {
    if (!isPlaying || isGameOver) {
        return;
    }
    if (canMove(currentPiece, currentX, currentY + 1)) {
        currentY++;
        drawBoard();
        drawPiece();
    } else {
        lockPiece();
        const clearedLines = clearLines();
        addScore(clearedLines);
        drawBoard();
        createPiece();
    }
}
// play
function startGame() {
    if (isPlaying || isGameOver) {
        return;
    }
    isPlaying = true;
    setupLevel();
    drawBoard();
    createPiece();
    if (!isGameOver) {
        timer = setInterval(moveDown, 500);
    }
}

// restart
function restartGame() {
    clearInterval(timer);
    timer = null;
    isPlaying = false;
    isGameOver = false;

    for (let i = 0; i < boardData.length; i++) {
        boardData[i] = null;
    }
    resetScore();
    drawBoard();
    startGame();
}
// thoát lượt chơi
function exitGame() {
    clearInterval(timer);
    timer = null;
    isPlaying = false;
    isGameOver = false;
    for (let i = 0; i < boardData.length; i++) {
        boardData[i] = null;
    }
    resetScore();
    drawBoard();
}

// điều khiển
document.addEventListener("keydown", function(event) {
    if (isGameOver) {
        return;
    }
    if (event.key === "ArrowLeft") {
        moveLeft();
    }
    if (event.key === "ArrowRight") {
        moveRight();
    }
    if (event.key === "ArrowDown") {
        moveDown();
    }
    if (event.key === "ArrowUp") {
        rotatePiece();
    }
});

createBoard();

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
exitButton.addEventListener("click", exitGame);