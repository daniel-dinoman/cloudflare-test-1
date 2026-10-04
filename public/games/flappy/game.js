const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("high-score");
const gameOverDisplay = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");
const finalHighScoreDisplay = document.getElementById("final-high-score");

const orange = {
    x: 150,
    y: 300,
    radius: 22,
    velocity: 0
};

const gravity = 0.45;
const flapStrength = -8;

const bananaWidth = 70;
const gap = 180;
const speed = 3;

const minBananaDistance = 280;

let bananas = [];
let score = 0;
let gameOver = false;


// ====================
// HIGH SCORE
// ====================

let highScore = Number(localStorage.getItem("flappyOrangeHighScore")) || 0;

highScoreDisplay.textContent = "High Score: " + highScore;


// ====================
// INPUT
// ====================

function flap() {
    if (gameOver) {
        restart();
        return;
    }

    orange.velocity = flapStrength;
}


// Any keyboard input except Escape
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        return;
    }

    event.preventDefault();
    flap();
});


// Mouse input
canvas.addEventListener("mousedown", () => {
    flap();
});


// Touch input
canvas.addEventListener("touchstart", event => {
    event.preventDefault();
    flap();
});


// ====================
// BANANAS
// ====================

function spawnBananas() {

    if (bananas.length > 0) {

        const lastBanana =
            bananas[bananas.length - 1];

        if (
            lastBanana.x >
            canvas.width - minBananaDistance
        ) {
            return;
        }
    }


    const gapY =
        Math.random() *
        (canvas.height - gap - 100) +
        gap / 2 +
        50;


    bananas.push({
        x: canvas.width,
        gapY: gapY,
        passed: false
    });
}


// ====================
// ORANGE
// ====================

function drawOrange() {

    ctx.beginPath();

    ctx.arc(
        orange.x,
        orange.y,
        orange.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#f47c00";
    ctx.fill();


    // Stem
    ctx.beginPath();

    ctx.moveTo(
        orange.x,
        orange.y - orange.radius + 3
    );

    ctx.lineTo(
        orange.x + 3,
        orange.y - orange.radius - 5
    );

    ctx.strokeStyle = "#713b00";
    ctx.lineWidth = 3;
    ctx.stroke();
}


// ====================
// BANANA PIPES
// ====================

function drawBananaPipes() {

    for (const banana of bananas) {

        const topHeight =
            banana.gapY - gap / 2;

        const bottomY =
            banana.gapY + gap / 2;


        // Top pipe
        ctx.fillStyle = "#ffd21f";

        ctx.fillRect(
            banana.x,
            0,
            bananaWidth,
            topHeight
        );


        // Bottom pipe
        ctx.fillRect(
            banana.x,
            bottomY,
            bananaWidth,
            canvas.height - bottomY
        );
    }
}


// ====================
// UPDATE
// ====================

function update() {

    if (gameOver) {
        return;
    }


    // Gravity
    orange.velocity += gravity;
    orange.y += orange.velocity;


    for (const banana of bananas) {

        banana.x -= speed;


        // Score
        if (
            !banana.passed &&
            banana.x + bananaWidth < orange.x
        ) {

            banana.passed = true;
            score++;

            scoreDisplay.textContent = score;


            // New high score
            if (score > highScore) {

                highScore = score;

                localStorage.setItem(
                    "flappyOrangeHighScore",
                    highScore
                );

                highScoreDisplay.textContent =
                    "High Score: " + highScore;
            }
        }


        // Collision boundaries
        const topEnd =
            banana.gapY - gap / 2;

        const bottomStart =
            banana.gapY + gap / 2;


        // Collision
        if (
            orange.x + orange.radius > banana.x &&
            orange.x - orange.radius <
                banana.x + bananaWidth &&
            (
                orange.y - orange.radius < topEnd ||
                orange.y + orange.radius > bottomStart
            )
        ) {
            endGame();
        }
    }


    // Remove old pipes
    bananas = bananas.filter(
        banana => banana.x + bananaWidth > 0
    );


    // Ceiling / floor
    if (
        orange.y - orange.radius < 0 ||
        orange.y + orange.radius > canvas.height
    ) {
        endGame();
    }
}


// ====================
// GAME OVER
// ====================

function endGame() {

    if (gameOver) {
        return;
    }

    gameOver = true;


    finalScoreDisplay.textContent = score;

    finalHighScoreDisplay.textContent =
        highScore;


    gameOverDisplay.style.display = "flex";
}


// ====================
// DRAW
// ====================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Sky
    ctx.fillStyle = "#87ceeb";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawBananaPipes();
    drawOrange();
}


// ====================
// RESTART
// ====================

function restart() {

    orange.y = 300;
    orange.velocity = 0;

    bananas = [];
    score = 0;
    gameOver = false;


    scoreDisplay.textContent = "0";

    gameOverDisplay.style.display = "none";


    spawnBananas();
}


// ====================
// GAME LOOP
// ====================

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}


// Start
spawnBananas();
gameLoop();


// Spawn pipes
setInterval(() => {

    if (!gameOver) {
        spawnBananas();
    }

}, 1000);
