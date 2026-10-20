const board = document.querySelector(".board");

const width = 10;
const height = 18;

const cells = [];

const boardData = [];

function createBoard() {
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement("div");

        cell.classList.add("cell");
        board.appendChild(cell);

        cells.push(cell);

        boardData.push(null); // ô chua co khoi
    }
}

// vẽ các khối đã lưu trên bàn
function drawBoard() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("filled");
        cells[i].classList.remove("blocked", "matching");
        cells[i].style.backgroundColor = "";

        if (boardData[i] === "block") {
            cells[i].classList.add("blocked");
        } else if (boardData[i] !== null) {
            cells[i].classList.add("filled");
            if (currentLevel === 6) {
                cells[i].style.backgroundColor = boardData[i];
            }
        }
    }
}
// kiểm tra có thể đặt khối ở vị trí mới ko
function canMove(piece, nextX, nextY) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            // bỏ qua ô trống trong hình dạng khối
            if (piece[y][x] === 0) {continue;}

            const boardX = nextX + x;
            const boardY = nextY + y;

            // không cho ô vượt ra ngoài bàn
            if (boardX < 0 || boardX >= width || boardY < 0 || boardY >= height) {
                return false;
            }
            // giữ khối trong nửa bàn tương ứng với hướng rơi
            if (currentLevel === 5) {
                const middle = height / 2;
                if ((fallDirection === 1 && boardY >= middle) ||
                    (fallDirection === -1 && boardY < middle)) {
                    return false;
                }
            }
            const index = boardY * width + boardX;

            // ko cho khối đi vào ô đã bị chiếm
            if (boardData[index] !== null) {
                return false;
            }
        }
    }
    return true;
}
// xóa hàng đầy return số hàng đã xóa
function clearLines() {
    if (currentLevel === 6) { return 0; }
    if (currentLevel === 5) {
        const middle = height / 2;
        const clearedLines = fallDirection === 1
            ? clearHalfLines(0, middle, 1) : clearHalfLines(middle, height, -1);
        const supportStart = fallDirection === 1 ? middle : 0;
        const supportEnd = fallDirection === 1 ? height : middle;
        const supportRow = fallDirection === 1 ? middle : middle - 1;
        for (let i = 0; i < clearedLines; i++) {
            removeHalfRow(supportStart, supportEnd, -fallDirection, supportRow);
        }
        return clearedLines;
    }
    let clearedLines = 0;

    for (let y = height - 1; y >= 0; y--) {
        let isFull = true;
        for (let x = 0; x < width; x++) {
            if (boardData[y * width + x] === null) {
                isFull = false;
                break;
            }
        }

        if (isFull) {
            // xóa hàng đầy
            boardData.splice(y * width, width);
            // thêm hàng trống ở đầu bàn
            for (let x = 0; x < width; x++) {
                boardData.unshift(null);
            }
            clearedLines++;
            y++;
        }
    }
    return clearedLines;
}
// xóa hàng và dồn về giữa trong đúng nửa bàn
function clearHalfLines(startRow, endRow, direction) {
    let clearedLines = 0;
    const firstRow = direction === 1 ? endRow - 1 : startRow;
    for (let y = firstRow; y >= startRow && y < endRow; y -= direction) {
        let isFull = true;
        for (let x = 0; x < width; x++) {
            if (boardData[y * width + x] === null) {
                isFull = false;
                break;
            }
        }
        if (!isFull) { continue; }
        removeHalfRow(startRow, endRow, direction, y);
        clearedLines++;
        y += direction;
    }
    return clearedLines;
}

// dọn một hàng và dồn trong đúng nửa bàn, dùng chung cho xóa hàng và hỗ trợ
function removeHalfRow(startRow, endRow, direction, targetRow) {
    for (let row = targetRow; row >= startRow && row < endRow; row -= direction) {
        const sourceRow = row - direction;
        for (let x = 0; x < width; x++) {
            boardData[row * width + x] = sourceRow >= startRow && sourceRow < endRow
                ? boardData[sourceRow * width + x] : null;
        }
    }
}
