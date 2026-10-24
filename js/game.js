let isGameOver = false;
let timer = null;
let isPlaying = false;
let isTransitioning = false;
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
    if (!isPlaying || isGameOver || isResolving) { return; }
    const direction = isReversed ? 1 : -1;
    if (canMove(currentPiece, currentX + direction, currentY)) {
        currentX += direction;
        renderPiece();
    }
}

function moveRight() {
    if (!isPlaying || isGameOver || isResolving) { return; }
    const direction = isReversed ? -1 : 1;
    if (canMove(currentPiece, currentX + direction, currentY)) {
        currentX += direction;
        renderPiece();
    }
}

// lưu khối và tính điểm trước khi sinh khối tiếp theo
function moveDown() {
    if (!isPlaying || isGameOver || isResolving) { return; }
    if (canMove(currentPiece, currentX, currentY + fallDirection)) {
        currentY += fallDirection;
        renderPiece();
    } else {
        lockPiece();
        if (currentLevel === 6) {
            resolveColorBoard();
            return;
        }
        addScore(clearLines());
        shiftBoardAfterLock();
        mirrorBoardAfterLock();
        if (checkAutoLevel()) { return; }
        drawBoard();
        createPiece();
    }
}

// dừng bộ đếm và hiển thị điểm cuối
function endGame() {
    clearTimeout(colorTimer);
    colorTimer = null;
    isResolving = false;
    clearMirrorWarning();
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
    isTransitioning = false;
    if (isAutoMode) { currentLevel = 1; }
    startButton.textContent = "▶ CHƠI";
    clearTimeout(colorTimer);
    colorTimer = null;
    isResolving = false;
    currentPieceColors = [];
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

// chạy màn hiện tại, dùng chung cho bắt đầu và tiếp tục
function beginLevel() {
    isTransitioning = false;
    isPlaying = true;
    startButton.textContent = "▶ CHƠI";
    startButton.disabled = true;
    updateLevel();
    createPiece();
    if (isPlaying) {
        timer = setInterval(moveDown, 500);
    }
}

// bắt đầu lượt mới hoặc tiếp tục màn vừa chuyển mà không xóa điểm
function startGame() {
    if (isPlaying || isGameOver) { return; }
    if (!isTransitioning) { resetGame(); }
    beginLevel();
}

// chỉ tăng một màn mỗi lần, giữ tổng điểm và dừng ở màn sáu
function checkAutoLevel() {
    if (!isAutoMode || currentLevel >= 6 || score < currentLevel * 500) { return false; }
    clearInterval(timer);
    timer = null;
    clearTimeout(colorTimer);
    colorTimer = null;
    isResolving = false;
    isPlaying = false;
    isTransitioning = true;
    currentPiece = null;
    currentPieceColors = [];
    currentLevel++;
    for (let i = 0; i < boardData.length; i++) {
        boardData[i] = null;
    }
    setupLevel();
    drawBoard();
    updateLevel();
    startButton.textContent = "Tiếp tục · Màn " + currentLevel;
    startButton.disabled = false;
    return true;
}

// chơi lại từ màn đầu trong auto hoặc màn đang chọn khi chơi riêng
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
    if (!isPlaying || isGameOver || isResolving) { return; }
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
