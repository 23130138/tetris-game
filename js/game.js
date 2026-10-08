// di chuyển khối sang trái nếu chưa cham
function moveLeft() {
    if (currentX > 0) {
        currentX--;
        // Xóa  cũ rồi vẽ ở vị trí mới
        drawBoard();
        drawPiece();
    }
}

// di chuyển khối sang phải nếu chưa chạm
function moveRight() {
    if (currentX + currentPiece[0].length < width) {
        currentX++;
        drawBoard();
        drawPiece();
    }
}

// Di chuyển khối xuống một hàng nếu chưa chạm đáy.
function moveDown() {
    if (currentY + currentPiece.length < height) {
        currentY++;
        drawBoard();
        drawPiece();
    }
}

// điều khiển
document.addEventListener("keydown", function(event) {
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

setInterval(moveDown, 500);