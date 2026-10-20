// 1 là ô khối, 0 là khoảng trống
const pieces = {
    I: [[1, 1, 1, 1]],

    O: [[1, 1],
        [1, 1]],

    T: [[0, 1, 0],
        [1, 1, 1]],

    L: [[1, 0],
        [1, 0],
        [1, 1]],

    J: [
        [0, 1],
        [0, 1],
        [1, 1]
    ],

    Z: [[1, 1, 0],
        [0, 1, 1]]
};

let currentPiece;
let currentPieceName;
let currentX; // cột
let currentY; // cow

// tạo khối mới
function createPiece() {
    const names = Object.keys(pieces);
    const randomIndex = Math.floor(Math.random() * names.length);
    const randomName = names[randomIndex];

    currentPieceName = randomName;
    hasTransformed = false;
    isReversed = false;
    currentPiece = pieces[randomName];
    currentX = Math.floor((width - currentPiece[0].length) / 2);
    currentY = 0;

    // kết thúc nếu ko còn chỗ đặt khối ms
    if (!canMove(currentPiece, currentX, currentY)) {
        endGame();
        return;
    }
    drawPiece();
}

// Vẽ các ô thuộc khối đang rơi lên bàn.
function drawPiece() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x] === 1) {
                // Đổi  hàng/cột thành vị trí trong  cells.
                const index = (currentY + y) * width + currentX + x;

                if (cells[index]) {
                    cells[index].classList.add("filled");
                }
            }
        }
    }
}

// Xoay khối 90 độ
function rotatePiece() {
    if (!isPlaying || isGameOver) { return; }
    const newPiece = [];
    for (let x = 0; x < currentPiece[0].length; x++) {
        const row = [];
        for (let y = currentPiece.length - 1; y >= 0; y--) {
            row.push(currentPiece[y][x]);
        }
        newPiece.push(row);
    }
    // chỉ đổi hình dạng khi có đủ chỗ để xoay
    if (canMove(newPiece, currentX, currentY)) {
        currentPiece = newPiece;
        renderPiece();
    }
}

function lockPiece() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x] === 1) {
                const index = (currentY + y) * width + currentX + x;

                boardData[index] = "red";
            }
        }
    }
}