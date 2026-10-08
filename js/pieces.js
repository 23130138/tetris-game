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
let currentX; // cột
let currentY; // cow

// chọn random 1 khối và đặt ở giữa phía trên
function createPiece() {
    const names = Object.keys(pieces);
    const randomIndex = Math.floor(Math.random() * names.length);
    const randomName = names[randomIndex];

    currentPiece = pieces[randomName];

    // Căn giữa dựa trên chiều rộng của khối
    currentX = Math.floor((width - currentPiece[0].length) / 2);
    currentY = 0;

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
        drawBoard();
        drawPiece();
    }
}