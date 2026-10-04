const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const gameOverDisplay = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");

const orange = {
    x: 150,
    y: 300,
    radius: 22,
    velocity: 0
};

const gravity = 0.45;
const flapStrength = -8;

const bananaWidth = 90;
const gap = 180;
const speed = 3;

let bananas = [];
let score = 0;
let gameOver = false;


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
    const gapY = Math.random() * 300 + 100;

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
// BANANAS
// ====================

function drawBanana(x, y, upsideDown) {
    ctx.save();

    ctx.translate(
        x + bananaWidth / 2,
        y
    );

    if (upsideDown) {
        ctx.rotate(Math.PI);
    }

    // Banana body
    ctx.beginPath();

    ctx.arc(
        0,
        0,
        35,
        Math.PI * 0.15,
        Math.PI * 0.85
    );

    ctx.lineWidth = 25;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffd21f";
    ctx.stroke();


    // Banana outline
    ctx.beginPath();

    ctx.arc(
        0,
        0,
        35,
        Math.PI * 0.15,
        Math.PI * 0.85
    );

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#8c6500";
    ctx.stroke();


    // Stem
    ctx.fillStyle = "#594000";

    ctx.fillRect(
        -7,
        -43,
        14,
        10
    );

    ctx.restore();
}


function drawBananaPipes() {
    for (const banana of bananas) {

        // Top banana
        drawBanana(
            banana.x,
            banana.gapY - gap / 2,
            true
        );

        // Bottom banana
        drawBanana(
            banana.x,
            banana.gapY + gap / 2,
            false
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

        // Move banana
        banana.x -= speed;


        // Score
        if (
            !banana.passed &&
            banana.x + bananaWidth < orange.x
        ) {
            banana.passed = true;
            score++;

            scoreDisplay.textContent = score;
        }


        // Collision boundaries
        const topEnd =
            banana.gapY - gap / 2;

        const bottomStart =
            banana.gapY + gap / 2;


        // Collision with banana
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


    // Remove bananas that left the screen
    bananas = bananas.filter(
        banana => banana.x + bananaWidth > 0
    );


    // Ceiling / ground collision
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


    // Reset HTML UI
    scoreDisplay.textContent = "0";
    finalScoreDisplay.textContent = "0";
    gameOverDisplay.style.display = "none";


    // Spawn first bananas
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


// ====================
// START GAME
// ====================

spawnBananas();
gameLoop();


// Spawn bananas every 1.8 seconds
setInterval(() => {

    if (!gameOver) {
        spawnBananas();
    }

}, 1800);
