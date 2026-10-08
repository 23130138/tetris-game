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