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
        boardData.push(null);
    }
}

createBoard();

const pieces = {
    I: [[1, 1, 1, 1]],

    O: [[1, 1],
        [1, 1]],

    T: [[0, 1, 0],
        [1, 1, 1]],

    L: [[1, 0],
        [1, 0],
        [1, 1]],

    Z: [[1, 1, 0],
        [0, 1, 1]]
};

let currentPiece;
let currentX;
let currentY;

function createPiece() {
    const names = Object.keys(pieces);
    const randomName = names[Math.floor(Math.random() * names.length)];

    currentPiece = pieces[randomName];

    currentX = Math.floor((width - currentPiece[0].length) / 2);
    currentY = 0;

    drawPiece();
}

function drawBoard() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("filled");
    }
}

function drawPiece() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {

            if (currentPiece[y][x] === 1) {
                const index = (currentY + y) * width + currentX + x;

                cells[index].classList.add("filled");
            }
        }
    }
}

function moveDown() {
    currentY++;

    drawBoard();
    drawPiece();
}

createPiece();

const gameInterval = setInterval(moveDown, 500);