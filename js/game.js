let isGameOver = false;
let timer = null;
let isPlaying = false;
const startButton = document.querySelector("#start");
const restartButton = document.querySelector("#restart");
const exitButton = document.querySelector("#exit");

// kiểm tra phép màu rồi vẽ lại khối ở vị trí mới
function renderPiece() {
    checkReverseCell();
    checkMagicCell();
    checkReverseCell();
    drawBoard();
    drawPiece();
}

// di chuyển ngang khi đang chơi
function moveLeft() {
    if (!isPlaying || isGameOver) { return; }
    const direction = isReversed ? 1 : -1;
    if (canMove(currentPiece, currentX + direction, currentY)) {
        currentX += direction;
        renderPiece();
    }
}

function moveRight() {
    if (!isPlaying || isGameOver) { return; }
    const direction = isReversed ? -1 : 1;
    if (canMove(currentPiece, currentX + direction, currentY)) {
        currentX += direction;
        renderPiece();
    }
}

// lưu khối và tính điểm trước khi sinh khối tiếp theo
function moveDown() {
    if (!isPlaying || isGameOver) { return; }
    if (canMove(currentPiece, currentX, currentY + 1)) {
        currentY++;
        renderPiece();
    } else {
        lockPiece();
        addScore(clearLines());
        drawBoard();
        createPiece();
    }
}

// dừng bộ đếm và hiển thị điểm cuối
function endGame() {
    clearInterval(timer);
    timer = null;
    isPlaying = false;
    isGameOver = true;
    drawBoard();
    startButton.disabled = true;
    updateLevel();
}

// xóa lượt cũ và đưa màn đã chọn về trạng thái chờ
function resetGame() {
    clearInterval(timer);
    timer = null;
    isPlaying = false;
    isGameOver = false;
    currentPiece = null;
    for (let i = 0; i < boardData.length; i++) {
        boardData[i] = null;
    }
    resetScore();
    setupLevel();
    drawBoard();
    startButton.disabled = false;
    updateLevel();
}

// bắt đầu một lượt duy nhất ở màn đang chọn
function startGame() {
    if (isPlaying || isGameOver) { return; }
    resetGame();
    isPlaying = true;
    startButton.disabled = true;
    updateLevel();
    createPiece();
    if (isPlaying) {
        timer = setInterval(moveDown, 500);
    }
}

// chơi lại màn đã chọn với điểm bằng không
function restartGame() {
    resetGame();
    startGame();
}

// thoát về trạng thái chờ và làm trống bàn
function exitGame() {
    resetGame();
    for (let i = 0; i < boardData.length; i++) {
        boardData[i] = null;
        cells[i].classList.remove("magic", "reverse");
    }
    drawBoard();
}

// ngăn phím điều khiển làm cuộn trang
 document.addEventListener("keydown", function(event) {
    if (!["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(event.key)) { return; }
    event.preventDefault();
    if (!isPlaying || isGameOver) { return; }
    if (event.key === "ArrowLeft") { moveLeft(); }
    if (event.key === "ArrowRight") { moveRight(); }
    if (event.key === "ArrowDown") { moveDown(); }
    if (event.key === "ArrowUp") { rotatePiece(); }
});

createBoard();
resetGame();
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
exitButton.addEventListener("click", exitGame);
