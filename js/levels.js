let currentLevel = 1;
const levelElement = document.querySelector(".level");
const levelButtons = document.querySelectorAll("[data-level]");
const levelGuide = document.querySelector("#level-guide");
const magicCells = [{ x: 3, y: 3 }];
const reverseCell = { x: 6, y: 6 };
let isReversed = false;
let hasTransformed = false;
const levelGuides = [
    "",
    "Xếp khối để lấp đầy và xóa hàng",
    "Ô xám là vật cản, được xóa cùng hàng đầy",
    "Ô ★ đổi hình tối đa một lần mỗi khối. Ô ? đảo trái/phải đến khi khối nằm lại"
];

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
