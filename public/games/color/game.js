const grid = document.getElementById("grid");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");

const targetColorDisplay = document.getElementById("targetColor");
const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");

const gameOverScreen = document.getElementById("gameOver");
const finalScoreDisplay = document.getElementById("finalScore");
const newHighScoreDisplay = document.getElementById("newHighScore");

const restartButton = document.getElementById("restartButton");

const intermissionDisplay = document.getElementById("intermission");
const intermissionTimerDisplay =
    document.getElementById("intermissionTimer");


// --------------------------------------------------
// COLORS
// --------------------------------------------------

const colors = [
    {
        name: "red",
        value: "#e74c3c"
    },

    {
        name: "blue",
        value: "#3498db"
    },

    {
        name: "green",
        value: "#2ecc71"
    },

    {
        name: "yellow",
        value: "#f1c40f"
    },

    {
        name: "purple",
        value: "#9b59b6"
    }
];


// --------------------------------------------------
// GAME STATE
// --------------------------------------------------

let tiles = [];

let playerPosition = 0;

let targetColor = null;

let score = 0;

let highScore =
    Number(localStorage.getItem("orangeColorRushHighScore")) || 0;

let roundTimer = null;
let intermissionTimer = null;

let gameRunning = false;

let timeLeft = 10;
let intermissionTimeLeft = 7;


// --------------------------------------------------
// HIGH SCORE
// --------------------------------------------------

highScoreDisplay.textContent = highScore;


// --------------------------------------------------
// CREATE GRID
// --------------------------------------------------

function createGrid() {

    grid.innerHTML = "";

    tiles = [];

    for (let i = 0; i < 64; i++) {

        const tile = document.createElement("div");

        tile.className = "tile";

        const randomColor =
            colors[Math.floor(Math.random() * colors.length)];

        tile.dataset.color = randomColor.name;

        tile.style.backgroundColor = randomColor.value;

        grid.appendChild(tile);

        tiles.push(tile);
    }
}


// --------------------------------------------------
// RANDOM TARGET
// --------------------------------------------------

function chooseTargetColor() {

    targetColor =
        colors[Math.floor(Math.random() * colors.length)];

    targetColorDisplay.style.backgroundColor =
        targetColor.value;
}


// --------------------------------------------------
// PLAYER
// --------------------------------------------------

function updatePlayer() {

    tiles.forEach(tile => {
        tile.classList.remove("player");
    });

    tiles[playerPosition].classList.add("player");
}


// --------------------------------------------------
// MOVE PLAYER
// --------------------------------------------------

function movePlayer(direction) {

    if (!gameRunning) {
        return;
    }

    const row = Math.floor(playerPosition / 8);
    const column = playerPosition % 8;

    let newRow = row;
    let newColumn = column;

    switch (direction) {

        case "up":
            newRow--;
            break;

        case "down":
            newRow++;
            break;

        case "left":
            newColumn--;
            break;

        case "right":
            newColumn++;
            break;
    }

    // Don't allow the player to leave the grid.

    if (
        newRow < 0 ||
        newRow > 7 ||
        newColumn < 0 ||
        newColumn > 7
    ) {
        return;
    }

    playerPosition =
        newRow * 8 + newColumn;

    updatePlayer();
}


// --------------------------------------------------
// KEYBOARD
// --------------------------------------------------

document.addEventListener("keydown", event => {

    if (!gameRunning) {
        return;
    }

    switch (event.key.toLowerCase()) {

        case "w":
        case "arrowup":
            event.preventDefault();
            movePlayer("up");
            break;

        case "s":
        case "arrowdown":
            event.preventDefault();
            movePlayer("down");
            break;

        case "a":
        case "arrowleft":
            event.preventDefault();
            movePlayer("left");
            break;

        case "d":
        case "arrowright":
            event.preventDefault();
            movePlayer("right");
            break;
    }
});


// --------------------------------------------------
// START ROUND
// --------------------------------------------------

function startRound() {

    gameRunning = true;

    intermissionDisplay.classList.add("hidden");

    createGrid();

    chooseTargetColor();

    // Start the player somewhere random.

    playerPosition =
        Math.floor(Math.random() * 64);

    updatePlayer();

    timeLeft = 10;

    timerDisplay.textContent = timeLeft;

    statusDisplay.textContent =
        "Get to the target color!";

    clearInterval(roundTimer);

    roundTimer = setInterval(() => {

        timeLeft--;

        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {

            clearInterval(roundTimer);

            finishRound();
        }

    }, 1000);
}


// --------------------------------------------------
// FINISH ROUND
// --------------------------------------------------

function finishRound() {

    gameRunning = false;

    const currentTile =
        tiles[playerPosition];

    if (
        currentTile.dataset.color ===
        targetColor.name
    ) {

        // Correct!

        score++;

        scoreDisplay.textContent = score;

        statusDisplay.textContent =
            "Correct!";

        startIntermission();

    } else {

        // Wrong tile.

        gameOver();

    }
}


// --------------------------------------------------
// INTERMISSION
// --------------------------------------------------

function startIntermission() {

    intermissionDisplay.classList.remove("hidden");

    intermissionTimeLeft = 7;

    intermissionTimerDisplay.textContent =
        intermissionTimeLeft;

    clearInterval(intermissionTimer);

    intermissionTimer = setInterval(() => {

        intermissionTimeLeft--;

        intermissionTimerDisplay.textContent =
            intermissionTimeLeft;

        if (intermissionTimeLeft <= 0) {

            clearInterval(intermissionTimer);

            startRound();
        }

    }, 1000);
}


// --------------------------------------------------
// GAME OVER
// --------------------------------------------------

function gameOver() {

    gameRunning = false;

    clearInterval(roundTimer);
    clearInterval(intermissionTimer);

    finalScoreDisplay.textContent = score;

    gameOverScreen.classList.remove("hidden");

    intermissionDisplay.classList.add("hidden");

    timerDisplay.textContent = "0";

    statusDisplay.textContent =
        "You missed the color!";

    let becameHighScore = false;

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "orangeColorRushHighScore",
            highScore
        );

        highScoreDisplay.textContent =
            highScore;

        becameHighScore = true;
    }

    if (becameHighScore) {

        newHighScoreDisplay.classList.remove("hidden");

    } else {

        newHighScoreDisplay.classList.add("hidden");
    }
}


// --------------------------------------------------
// RESTART
// --------------------------------------------------

restartButton.addEventListener("click", () => {

    gameOverScreen.classList.add("hidden");

    score = 0;

    scoreDisplay.textContent = score;

    startRound();
});


// --------------------------------------------------
// START GAME
// --------------------------------------------------

startRound();
