let isGameOver = false;
let timer = null;

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
    if (isGameOver) {
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
createPiece();

if (!isGameOver) {
    timer = setInterval(moveDown, 500);
}