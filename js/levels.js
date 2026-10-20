let currentLevel = 1;
const levelElement = document.querySelector(".level");
const levelButtons = document.querySelectorAll("[data-level]");
const levelGuide = document.querySelector("#level-guide");
const magicCells = [{ x: 3, y: 3 }];
const reverseCell = { x: 6, y: 6 };
let isReversed = false;
let hasTransformed = false;
let lockedPieceCount = 0;
let shiftDirection = -1;
let mirrorPieceCount = 0;
let mirrorRows = [];
let fallDirection = 1;
const levelGuides = ["",
    "Xếp khối để lấp đầy và xóa hàng",
    "Ô xám là vật cản, được xóa cùng hàng đầy",
    "Ô ★ đổi hình  Ô ? đảo trái/phải",
    "Mỗi 3 khối dịch ngang. Mỗi 5 khối soi gương 3 hàng ngẫu nhiên",
    "Rơi ngẫu nhiên hai phía. Xóa 1 hàng đầy giúp dọn 1 hàng sát giữa phía đối diện",
    "Ghép ít nhất 4 ô cùng màu theo ngang, dọc hoặc chéo. Mỗi ô xóa: 10 điểm"];

// cập nhật màn và hướng dẫn đang chọn
function updateLevel() {
    levelElement.textContent = currentLevel;
    levelGuide.textContent = levelGuides[currentLevel];
    for (const button of levelButtons) {
        button.classList.toggle("selected", Number(button.dataset.level) === currentLevel);
        button.setAttribute("aria-pressed", String(Number(button.dataset.level) === currentLevel));
        button.disabled = isPlaying;
    }
}

// chỉ chọn màn khi lượt chơi đã dừng
function selectLevel(level) {
    if (isPlaying) { return; }
    currentLevel = level;
    resetGame();
}

// đặt dữ liệu riêng của màn trước khi sinh khối
function setupLevel() {
    fallDirection = 1;
    board.classList.toggle("two-way", currentLevel === 5);
    mirrorPieceCount = 0;
    clearMirrorWarning();
    lockedPieceCount = 0;
    shiftDirection = -1;
    hasTransformed = false;
    isReversed = false;
    if (currentLevel === 2) {
        boardData[12 * width + 2] = "block";
        boardData[12 * width + 7] = "block";
        boardData[15 * width + 4] = "block";
    }
    for (const cell of cells) {
        cell.classList.remove("magic", "reverse");
    }
    if (currentLevel === 3) {
        for (const position of magicCells) {
            cells[position.y * width + position.x].classList.add("magic");
        }
        cells[reverseCell.y * width + reverseCell.x].classList.add("reverse");
    }
}

// dịch các hàng sau mỗi ba khối và giữ nguyên số ô
function shiftBoardAfterLock() {
    if (currentLevel !== 4) { return; }
    lockedPieceCount++;
    if (lockedPieceCount < 3) { return; }
    lockedPieceCount = 0;
    for (let y = 0; y < height; y++) {
        const row = boardData.slice(y * width, (y + 1) * width);
        for (let x = 0; x < width; x++) {
            const nextX = (x + shiftDirection + width) % width;
            boardData[y * width + nextX] = row[x];
        }
    }
    shiftDirection = -shiftDirection;
}

// xóa vùng báo trước khi lật hoặc kết thúc lượt chơi
function clearMirrorWarning() {
    mirrorRows = [];
    for (const cell of cells) {
        cell.classList.remove("mirror-warning");
    }
}

// chọn tối đa ba hàng có ô, không trùng nhau và không cần liền nhau
function prepareMirrorWarning() {
    clearMirrorWarning();
    const possibleRows = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (boardData[y * width + x] !== null) {
                possibleRows.push(y);
                break;
            }
        }
    }
    while (mirrorRows.length < 3 && possibleRows.length > 0) {
        const index = Math.floor(Math.random() * possibleRows.length);
        const y = possibleRows.splice(index, 1)[0];
        mirrorRows.push(y);
        for (let x = 0; x < width; x++) {
            cells[y * width + x].classList.add("mirror-warning");
        }
    }
}

// lật trái phải từng hàng đã báo trước sau mỗi năm khối
function mirrorBoardAfterLock() {
    if (currentLevel !== 4) { return; }
    mirrorPieceCount++;
    if (mirrorPieceCount === 4) {
        prepareMirrorWarning();
    }
    if (mirrorPieceCount < 5) { return; }
    for (const y of mirrorRows) {
        for (let x = 0; x < width / 2; x++) {
            const left = y * width + x;
            const right = y * width + width - 1 - x;
            const value = boardData[left];
            boardData[left] = boardData[right];
            boardData[right] = value;
        }
    }
    mirrorPieceCount = 0;
    clearMirrorWarning();
}

// kiểm tra khối có chạm dấu kích hoạt hay không
function touchesCell(position) {
    const x = position.x - currentX;
    const y = position.y - currentY;
    return !!currentPiece[y] && currentPiece[y][x] === 1;
}

// đảo điều khiển một lần cho khối đang rơi
function checkReverseCell() {
    if (currentLevel !== 3 || isReversed || !touchesCell(reverseCell)) { return; }
    isReversed = true;
}

// đổi ngẫu nhiên sang hình khác đặt hợp lệ tại vị trí hiện tại
function checkMagicCell() {
    if (currentLevel !== 3 || hasTransformed) { return; }
    let touchingMagic = false;
    for (const position of magicCells) {
        if (touchesCell(position)) { touchingMagic = true; break; }
    }
    if (!touchingMagic) { return; }
    hasTransformed = true;
    const candidates = [];
    for (const name of Object.keys(pieces)) {
        if (name !== currentPieceName && canMove(pieces[name], currentX, currentY)) {
            candidates.push(name);
        }
    }
    if (candidates.length === 0) {
        return;
    }
    currentPieceName = candidates[Math.floor(Math.random() * candidates.length)];
    currentPiece = pieces[currentPieceName];
}

for (const button of levelButtons) {
    button.addEventListener("click", function() {
        selectLevel(Number(button.dataset.level));
    });
}
