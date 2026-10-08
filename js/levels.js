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