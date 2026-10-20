const pieceColors = ["#d66b64", "#699dcb", "#75aa71", "#d4b65e"];
let isResolving = false;
let colorTimer = null;

// tìm chuỗi từ bốn ô cùng màu và đánh dấu giao điểm một lần
function findColorMatches() {
    const marked = new Array(width * height).fill(false);
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = boardData[y * width + x];
            if (color === null || color === "block") { continue; }
            for (const direction of directions) {
                const dx = direction[0];
                const dy = direction[1];
                const previousX = x - dx;
                const previousY = y - dy;
                if (previousX >= 0 && previousX < width && previousY >= 0 && previousY < height &&
                    boardData[previousY * width + previousX] === color) { continue; }
                const chain = [];
                let nextX = x;
                let nextY = y;
                while (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height &&
                    boardData[nextY * width + nextX] === color) {
                    chain.push(nextY * width + nextX);
                    nextX += dx;
                    nextY += dy;
                }
                if (chain.length >= 4) {
                    for (const index of chain) { marked[index] = true; }
                }
            }
        }
    }
    const matches = [];
    for (let i = 0; i < marked.length; i++) {
        if (marked[i]) { matches.push(i); }
    }
    return matches;
}

// chỉ dồn cột sau khi ăn màu và giữ thứ tự các ô
function collapseColorColumns() {
    let moved = false;
    for (let x = 0; x < width; x++) {
        let targetY = height - 1;
        for (let y = height - 1; y >= 0; y--) {
            const index = y * width + x;
            if (boardData[index] === null) { continue; }
            if (y !== targetY) {
                boardData[targetY * width + x] = boardData[index];
                boardData[index] = null;
                moved = true;
            }
            targetY--;
        }
    }
    return moved;
}

// dừng rơi trong lúc xử lý màu để không sinh nhiều khối cùng lúc
function resolveColorBoard() {
    clearInterval(timer);
    timer = null;
    currentPiece = null;
    isResolving = true;
    drawBoard();
    resolveColorStep();
}

// làm rõ chuỗi sắp xóa rồi kiểm tra lại sau khi dồn cột
function resolveColorStep() {
    colorTimer = null;
    if (!isPlaying || isGameOver || currentLevel !== 6 || !isResolving) { return; }
    const matches = findColorMatches();
    if (matches.length > 0) {
        for (const index of matches) { cells[index].classList.add("matching"); }
        colorTimer = setTimeout(function() {
            for (const index of matches) { boardData[index] = null; }
            addColorScore(matches.length);
            collapseColorColumns();
            drawBoard();
            colorTimer = setTimeout(resolveColorStep, 150);
        }, 180);
        return;
    }
    isResolving = false;
    createPiece();
    if (isPlaying && !isGameOver) { timer = setInterval(moveDown, 500); }
}
