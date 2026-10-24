// dữ liệu bàn, khối, giaô dien  và trạng thái
const board = document.querySelector(".board");
const width = 10;
const height = 18;
const cells = [];
const boardData = [];
const pieces = {
    I: [[1, 1, 1, 1]],

    O: [[1, 1],
        [1, 1]],

    T: [[0, 1, 0],
        [1, 1, 1]],

    L: [[1, 0],
        [1, 0],
        [1, 1]],

    J: [[0, 1],
        [0, 1],
        [1, 1]],

    Z: [[1, 1, 0],
        [0, 1, 1]]
};

let currentPiece;
let currentPieceName;
let currentPieceColors = [];
let currentX;
let currentY;

let score = 0;
const scoreElement = document.querySelector(".score");

let currentLevel = 1;
let isAutoMode = false;
const autoButton = document.querySelector("#auto");
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

const pieceColors = ["#d66b64", "#699dcb", "#75aa71", "#d4b65e"];
let isResolving = false;
let colorTimer = null;

let isGameOver = false;
let timer = null;
let isPlaying = false;
let isTransitioning = false;
const startButton = document.querySelector("#start");
const restartButton = document.querySelector("#restart");
const exitButton = document.querySelector("#exit");

// tạo  ô  và dữ liệu trống cho bàn chơi
function createBoard() {
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement("div");

        cell.classList.add("cell");
        board.appendChild(cell);

        cells.push(cell);
        // mỗi ô html có một ô dữ liệu tương ứng, null nghĩa là chưa bị chiếm
        boardData.push(null);
    }
}

// vẽ các ô đã nằm lại và xóa hình khối cũ khỏi giao diện
function drawBoard() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("filled");
        cells[i].classList.remove("blocked", "matching");
        // xóa màu riêng để màu của màn sáu không còn khi chuyển màn
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

// check khối có thể đặt ở vị trí mới
function canMove(piece, nextX, nextY) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {

            // bỏ qua khoảng trống trong hình dạng khối
            if (piece[y][x] === 0) {continue;}

            const boardX = nextX + x;
            const boardY = nextY + y;

            if (boardX < 0 || boardX >= width || boardY < 0 || boardY >= height) {
                return false;
            }
            // đường giữa là giới hạn của mỗi nửa bàn ở màn năm
            if (currentLevel === 5) {
                const middle = height / 2;
                if ((fallDirection === 1 && boardY >= middle) ||
                    (fallDirection === -1 && boardY < middle)) {
                    return false;
                }
            }
            const index = boardY * width + boardX;
            // ô đã nằm lại và ô chặn đều không cho khối đi xuyên
            if (boardData[index] !== null) {
                return false;
            }
        }
    }
    return true;
}

// xóa hàng đầy và trả về số hàng để tính điểm
function clearLines() {
    // màn sáu chỉ ăn màu, không xóa hàng đầy
    if (currentLevel === 6) { return 0; }
    if (currentLevel === 5) {
        const middle = height / 2;
        const clearedLines = fallDirection === 1
            ? clearHalfLines(0, middle, 1) : clearHalfLines(middle, height, -1);
        const supportStart = fallDirection === 1 ? middle : 0;
        const supportEnd = fallDirection === 1 ? height : middle;
        const supportRow = fallDirection === 1 ? middle : middle - 1;
        // mỗi hàng đầy giúp dọn một hàng phía đối diện, không cộng điểm hỗ gtro
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
            // xóa hàng đầy và thêm một hàng trống ở đầu bàn
            boardData.splice(y * width, width);
            for (let x = 0; x < width; x++) {
                boardData.unshift(null);
            }
            clearedLines++;
            // kiểm tra lại hàng vừa được kéo xuống để không bỏ sót hàng đầy
            y++;
        }
    }
    return clearedLines;
}

// xóa hàng đầy trong một nửa bàn của level 5
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
        // xét lại vị trí vừa dồn để xóa được nhiều hàng liên tiếp
        y += direction;
    }
    return clearedLines;
}

// dọn một hàng và dồn các hàng còn lại về giữa trong cùng nửa bàn
function removeHalfRow(startRow, endRow, direction, targetRow) {
    for (let row = targetRow; row >= startRow && row < endRow; row -= direction) {
        const sourceRow = row - direction;
        for (let x = 0; x < width; x++) {
            // hàng sát cửa sinh được điền trống, không lấy dữ liệu từ nửa kia
            boardData[row * width + x] = sourceRow >= startRow && sourceRow < endRow
                ? boardData[sourceRow * width + x] : null;
        }
    }
}

// sinh khối ngẫu nhiên và đặt màu, vị trí, hướng rơi phù hợp với màn
function createPiece() {
    const names = Object.keys(pieces);
    const randomIndex = Math.floor(Math.random() * names.length);
    const randomName = names[randomIndex];

    currentPieceName = randomName;
    hasTransformed = false;
    isReversed = false;
    currentPiece = pieces[randomName];
    currentPieceColors = [];
    // màn sáu gán một màu ngẫu nhiên cho từng ô có khối
    if (currentLevel === 6) {
        for (let y = 0; y < currentPiece.length; y++) {
            const row = [];
            for (let x = 0; x < currentPiece[y].length; x++) {
                row.push(currentPiece[y][x] === 1
                    ? pieceColors[Math.floor(Math.random() * pieceColors.length)] : null);
            }
            currentPieceColors.push(row);
        }
    }
    currentX = Math.floor((width - currentPiece[0].length) / 2);
    // màn năm chọn ngẫu nhiên phía sinh, các màn khác luôn rơi xuống
    fallDirection = currentLevel === 5 ? (Math.random() < 0.5 ? 1 : -1) : 1;
    currentY = fallDirection === 1 ? 0 : height - currentPiece.length;

    // thua nếu phía được chọn không còn chỗ đặt khối mới
    if (!canMove(currentPiece, currentX, currentY)) {
        endGame();
        return;
    }
    drawPiece();
}

// vẽ khối đang rơi mà chưa ghi vào dữ liệu bàn
function drawPiece() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x] === 1) {
                const index = (currentY + y) * width + currentX + x;

                if (cells[index]) {
                    cells[index].classList.add("filled");
                    if (currentLevel === 6) {
                        cells[index].style.backgroundColor = currentPieceColors[y][x];
                    }
                }
            }
        }
    }
}

// xoay khối 90 độ và giữ màu đi theo đúng từng ô
function rotatePiece() {
    // không xoay khi chưa chơi, đã thua hoặc đang xử lý ăn màu
    if (!isPlaying || isGameOver || isResolving) { return; }
    const newPiece = [];
    const newColors = [];
    for (let x = 0; x < currentPiece[0].length; x++) {
        const row = [];
        const colorRow = [];
        for (let y = currentPiece.length - 1; y >= 0; y--) {
            // xoay cả hình dạng và ma trận màu theo cùng một công thức
            row.push(currentPiece[y][x]);
            if (currentLevel === 6) { colorRow.push(currentPieceColors[y][x]); }
        }
        newPiece.push(row);
        newColors.push(colorRow);
    }
    // chỉ nhận kết quả xoay nếu vị trí mới vẫn hợp lệ
    if (canMove(newPiece, currentX, currentY)) {
        currentPiece = newPiece;
        if (currentLevel === 6) { currentPieceColors = newColors; }
        renderPiece();
    }
}

// ghi khối đã nằm lại vào dữ liệu bàn
function lockPiece() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x] === 1) {
                const index = (currentY + y) * width + currentX + x;

                // màn sáu lưu màu từng ô, các màn khác dùng màu khối thông thường
                boardData[index] = currentLevel === 6 ? currentPieceColors[y][x] : "red";
            }
        }
    }
}

// cộng 100 điểm cho mỗi hàng đầy đã xóa
function addScore(clearedLines) {
    score += clearedLines * 100;
    scoreElement.textContent = score;
}

// đưa điểm và phần hiển thị điểm về không
function resetScore() {
    score = 0;
    scoreElement.textContent = score;
}

// cộng 10 điểm cho mỗi ô màu đã xóa
function addColorScore(clearedCells) {
    score += clearedCells * 10;
    scoreElement.textContent = score;
}

// cập nhật số màn, hướng dẫn và trạng thái các nút chọn chế độ
function updateLevel() {
    levelElement.textContent = currentLevel;
    levelGuide.textContent = levelGuides[currentLevel];
    autoButton.classList.toggle("selected", isAutoMode);
    autoButton.setAttribute("aria-pressed", String(isAutoMode));
    // khóa chọn màn khi đang chơi hoặc đang chờ tiếp tục màn mới
    autoButton.disabled = isPlaying || isTransitioning;
    for (const button of levelButtons) {
        button.classList.toggle("selected", !isAutoMode && Number(button.dataset.level) === currentLevel);
        button.setAttribute("aria-pressed", String(!isAutoMode && Number(button.dataset.level) === currentLevel));
        button.disabled = isPlaying || isTransitioning;
    }
}

// chọn chơi riêng một màn khi lượt chơi đã dừng
function selectLevel(level) {
    if (isPlaying || isTransitioning) { return; }
    // chọn một màn riêng sẽ thoát chế độ auto
    isAutoMode = false;
    currentLevel = level;
    resetGame();
}

// đặt lại biến riêng và tạo dữ liệu ban đầu của màn đang chọn
function setupLevel() {
    fallDirection = 1;
    board.classList.toggle("two-way", currentLevel === 5);
    // xóa bộ đếm và hiệu ứng riêng để lượt mới không dùng trạng thái cũ
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

// dịch ngang toàn bàn sau mỗi ba khối ở màn bốn
function shiftBoardAfterLock() {
    if (currentLevel !== 4) { return; }
    lockedPieceCount++;
    if (lockedPieceCount < 3) { return; }
    lockedPieceCount = 0;
    for (let y = 0; y < height; y++) {
        // sao chép hàng trước khi dịch để không ghi đè và làm mất ô
        const row = boardData.slice(y * width, (y + 1) * width);
        for (let x = 0; x < width; x++) {
            // ô ra khỏi mép sẽ vòng lại mép đối diện
            const nextX = (x + shiftDirection + width) % width;
            boardData[y * width + nextX] = row[x];
        }
    }
    shiftDirection = -shiftDirection;
}

// xóa dấu báo trước của các hàng sắp soi gương
function clearMirrorWarning() {
    mirrorRows = [];
    for (const cell of cells) {
        cell.classList.remove("mirror-warning");
    }
}

// chọn ngẫu nhiên tối đa ba hàng có ô và đánh dấu báo trước
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
        // lấy ra khỏi danh sách để không chọn trùng một hàng
        const y = possibleRows.splice(index, 1)[0];
        mirrorRows.push(y);
        for (let x = 0; x < width; x++) {
            cells[y * width + x].classList.add("mirror-warning");
        }
    }
}

// soi gương các hàng đã báo trước sau mỗi năm khối ở màn bốn
function mirrorBoardAfterLock() {
    if (currentLevel !== 4) { return; }
    mirrorPieceCount++;
    // báo trước một khối, đến khối thứ năm mới lật
    if (mirrorPieceCount === 4) {
        prepareMirrorWarning();
    }
    if (mirrorPieceCount < 5) { return; }
    for (const y of mirrorRows) {
        for (let x = 0; x < width / 2; x++) {
            const left = y * width + x;
            const right = y * width + width - 1 - x;
            // đổi chỗ hai ô đối xứng, giữ nguyên số ô trong hàng
            const value = boardData[left];
            boardData[left] = boardData[right];
            boardData[right] = value;
        }
    }
    mirrorPieceCount = 0;
    clearMirrorWarning();
}

// kiểm tra một ô của khối đang rơi có chạm vị trí đặc biệt k0
function touchesCell(position) {
    const x = position.x - currentX;
    const y = position.y - currentY;
    return !!currentPiece[y] && currentPiece[y][x] === 1;
}

// đảo điều khiển trái phải một lần cho khối chạm ô hỏi
function checkReverseCell() {
    if (currentLevel !== 3 || isReversed || !touchesCell(reverseCell)) { return; }
    isReversed = true;
}

// đổi hình một lần khi khối chạm ô sao và có hình khác đặt hợp lệ
function checkMagicCell() {
    if (currentLevel !== 3 || hasTransformed) { return; }
    let touchingMagic = false;
    for (const position of magicCells) {
        if (touchesCell(position)) { touchingMagic = true; break; }
    }
    if (!touchingMagic) { return; }
    // mỗi khối chỉ thử đổi hình một lần dù chạm lại ô sao
    hasTransformed = true;
    const candidates = [];
    for (const name of Object.keys(pieces)) {
        // chỉ chọn hình khác và không xuyên tường hoặc chồng khối
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

// chọn chế độ tự chuyển màn và chuẩn bị lượt chơi từ màn một
function selectAutoMode() {
    if (isPlaying || isTransitioning) { return; }
    isAutoMode = true;
    resetGame();
}

// tìm các chuỗi từ bốn ô cùng màu theo ngang, dọc và hai đường chéo
function findColorMatches() {
    const marked = new Array(width * height).fill(false);
    // bốn hướng này đủ để tìm chuỗi ngang, dọc và hai đường chéo
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = boardData[y * width + x];
            if (color === null || color === "block") { continue; }
            for (const direction of directions) {
                const dx = direction[0];
                const dy = direction[1];
                // chỉ duyệt từ đầu chuỗi để tránh tìm lại cùng một chuỗi
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

// dồn ô xuống theo từng cột sau khi ăn màu, giữ nguyên thứ tự
function collapseColorColumns() {
    let moved = false;
    for (let x = 0; x < width; x++) {
        // vị trí nhận ô bắt đầu từ đáy rồi dịch dần lên trên
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

// tạm dừng rơi để xử lý các chuỗi màu sau khi khối nằm lại
function resolveColorBoard() {
    clearInterval(timer);
    timer = null;
    // chưa sinh khối tiếp theo trong lúc đang xóa và dồn màu
    currentPiece = null;
    isResolving = true;
    drawBoard();
    resolveColorStep();
}

// xóa chuỗi màu, dồn cột và kiểm tra ăn liên tiếp đến khi hết chuỗi
function resolveColorStep() {
    colorTimer = null;
    if (!isPlaying || isGameOver || currentLevel !== 6 || !isResolving) { return; }
    const matches = findColorMatches();
    if (matches.length > 0) {
        for (const index of matches) { cells[index].classList.add("matching"); }
        // giữ viền chuỗi một lúc ngắn rồi mới xóa các ô đồng thời
        colorTimer = setTimeout(function() {
            for (const index of matches) { boardData[index] = null; }
            addColorScore(matches.length);
            // chỉ dồn cột khi đã ăn được chuỗi màu
            collapseColorColumns();
            drawBoard();
            colorTimer = setTimeout(resolveColorStep, 150);
        }, 180);
        return;
    }
    // không còn chuỗi thì sinh khối mới và giữ tốc độ rơi 500ms
    isResolving = false;
    createPiece();
    if (isPlaying && !isGameOver) { timer = setInterval(moveDown, 500); }
}

// kiểm tra ô đặc biệt rồi vẽ bàn và khối ở vị trí mới
function renderPiece() {
    checkReverseCell();
    // đổi hình có thể làm khối chạm thêm ô hỏi nên kiểm tra lại sau đó
    checkMagicCell();
    checkReverseCell();
    drawBoard();
    drawPiece();
}

// di chuyển trái hoặc đảo thành phải khi khối chịu hiệu ứng ô hỏi
function moveLeft() {
    if (!isPlaying || isGameOver || isResolving) { return; }
    // hiệu ứng ô hỏi chỉ đổi hướng ngang, không đổi phím xoay và rơi
    const direction = isReversed ? 1 : -1;
    if (canMove(currentPiece, currentX + direction, currentY)) {
        currentX += direction;
        renderPiece();
    }
}

// di chuyển phải hoặc đảo thành trái khi khối chịu hiệu ứng ô hỏi
function moveRight() {
    if (!isPlaying || isGameOver || isResolving) { return; }
    // hiệu ứng ô hỏi đổi phải thành trái cho khối hiện tại
    const direction = isReversed ? -1 : 1;
    if (canMove(currentPiece, currentX + direction, currentY)) {
        currentX += direction;
        renderPiece();
    }
}

// đẩy khối theo hướng rơi hoặc xử lý khi khối nằm lại
function moveDown() {
    if (!isPlaying || isGameOver || isResolving) { return; }
    if (canMove(currentPiece, currentX, currentY + fallDirection)) {
        currentY += fallDirection;
        renderPiece();
    } else {
        lockPiece();
        // màn sáu xử lý ăn màu riêng và chờ ăn liên tiếp xong mới sinh khối
        if (currentLevel === 6) {
            resolveColorBoard();
            return;
        }
        // tính điểm và xử lý luật màn trước khi kiểm tra mốc chuyển màn
        addScore(clearLines());
        shiftBoardAfterLock();
        mirrorBoardAfterLock();
        if (checkAutoLevel()) { return; }
        drawBoard();
        createPiece();
    }
}

// dừng lượt chơi và các bộ đếm khi không còn chỗ sinh khối
function endGame() {
    // dừng cả bộ đếm rơi và bộ đếm hiệu ứng màu
    clearTimeout(colorTimer);
    colorTimer = null;
    isResolving = false;
    clearMirrorWarning();
    clearInterval(timer);
    timer = null;
    isPlaying = false;
    isGameOver = true;
    drawBoard();
    startButton.disabled = true;
    updateLevel();
}

// xóa lượt cũ, đặt lại điểm và chuẩn bị màn chơi ở trạng thái chờ
function resetGame() {
    isTransitioning = false;
    // auto luôn bắt đầu lại từ màn một
    if (isAutoMode) { currentLevel = 1; }
    startButton.textContent = "▶ CHƠI";
    // hủy hiệu ứng đang chờ để không sửa bàn của lượt mới
    clearTimeout(colorTimer);
    colorTimer = null;
    isResolving = false;
    currentPieceColors = [];
    clearInterval(timer);
    timer = null;
    isPlaying = false;
    isGameOver = false;
    currentPiece = null;
    for (let i = 0; i < boardData.length; i++) {
        boardData[i] = null;
    }
    resetScore();
    setupLevel();
    drawBoard();
    startButton.disabled = false;
    updateLevel();
}

// sinh khối đầu tiên và chạy một bộ đếm rơi cho màn hiện tại
function beginLevel() {
    isTransitioning = false;
    isPlaying = true;
    startButton.textContent = "▶ CHƠI";
    startButton.disabled = true;
    updateLevel();
    createPiece();
    // chỉ chạy bộ đếm nếu sinh khối thành công
    if (isPlaying) {
        timer = setInterval(moveDown, 500);
    }
}

// bắt đầu lượt mới hoặc tiếp tục màn vừa chuyển trong auto
function startGame() {
    if (isPlaying || isGameOver) { return; }
    // tiếp tục màn mới giữ điểm, còn lượt chơi mới phải đặt lại dữ liệu
    if (!isTransitioning) { resetGame(); }
    beginLevel();
}

// chuyển lên một màn khi đủ mốc 500 điểm, giữ điểm và dừng ở màn sáu
function checkAutoLevel() {
    if (!isAutoMode || currentLevel >= 6 || score < currentLevel * 500) { return false; }
    clearInterval(timer);
    timer = null;
    clearTimeout(colorTimer);
    colorTimer = null;
    isResolving = false;
    isPlaying = false;
    isTransitioning = true;
    currentPiece = null;
    currentPieceColors = [];
    // mỗi lần chỉ tăng một màn và giữ nguyên tổng điểm kể cả phần vượt mốc
    currentLevel++;
    for (let i = 0; i < boardData.length; i++) {
        boardData[i] = null;
    }
    // bàn mới dùng luật mới và chờ người chơi bấm tiếp tục
    setupLevel();
    drawBoard();
    updateLevel();
    startButton.textContent = "Tiếp tục · Màn " + currentLevel;
    startButton.disabled = false;
    return true;
}

// chơi lại màn đã chọn hoặc quay về màn một trong auto
function restartGame() {
    resetGame();
    startGame();
}

// dừng lượt chơi và làm trống bàn để chờ bấm chơi
function exitGame() {
    resetGame();
    for (let i = 0; i < boardData.length; i++) {
        boardData[i] = null;
        cells[i].classList.remove("magic", "reverse");
    }
    drawBoard();
}

// đọc số màn
function handleLevelClick(event) {
    selectLevel(Number(event.currentTarget.dataset.level));
}

// điều khiển
function handleKeyDown(event) {
    if (!["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(event.key)) { return; }
    // ngăn phím mũi tên làm cuộn trang khi chơi
    event.preventDefault();
    if (!isPlaying || isGameOver || isResolving) { return; }
    if (event.key === "ArrowLeft") { moveLeft(); }
    if (event.key === "ArrowRight") { moveRight(); }
    if (event.key === "ArrowDown") { moveDown(); }
    if (event.key === "ArrowUp") { rotatePiece(); }
}

// tạo bàn một lần sau khi có data
createBoard();
resetGame();

// gắn sự kiện một lần để tránh chạy lặp khi chơi lại hoặc chuyển màn
for (const button of levelButtons) {
    button.addEventListener("click", handleLevelClick);
}
autoButton.addEventListener("click", selectAutoMode);
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
exitButton.addEventListener("click", exitGame);
document.addEventListener("keydown", handleKeyDown);
