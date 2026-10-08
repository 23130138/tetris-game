const board = document.querySelector(".board");

const width = 10;
const height = 20;

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

// Xóa  khối cũ trước khi vẽ ở vi gtri mới.
function drawBoard() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("filled");
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
            const index = boardY * width + boardX;

            // ko cho khối đi vào ô đã bị chiếm
            if (boardData[index] !== null) {
                return false;
            }
        }
    }
    return true;
}