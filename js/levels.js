let currentLevel = 1;
const levelElement = document.querySelector(".level");
const level1Button = document.querySelector("#level1");

// chọn level 1 khi chưa chơi hoặc đã thua
function selectLevel1() {
    if (isPlaying && !isGameOver) {
        return;
    }
    currentLevel = 1;
    levelElement.textContent = currentLevel;
}

level1Button.addEventListener("click", selectLevel1);

const level2Button = document.querySelector("#level2");

// chọn level 2 , chưa chơi ,thua
function selectLevel2() {
    if (isPlaying && !isGameOver) {
        return;
    }
    currentLevel = 2;
    levelElement.textContent = currentLevel;
}

// thêm ô chặn cho level 2
function setupLevel() {
    if (currentLevel === 2) {
        boardData[12 * width + 2] = "block";
        boardData[12 * width + 7] = "block";
        boardData[15 * width + 4] = "block";
        boardData[15 * width + 5] = "block";
    }
}

level2Button.addEventListener("click", selectLevel2);