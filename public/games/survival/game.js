const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const killCountElement = document.querySelector("#killCount");
const killText = document.querySelector("#killText");
const progressBar = document.querySelector("#progressBar");

const elapsedTimeElement = document.querySelector("#elapsedTime");
const backToGamesButton = document.querySelector("#backToGames");

const upgradeMenu = document.querySelector("#upgradeMenu");
const upgradeButtons = document.querySelectorAll(".upgradeButton");

const gameOver = document.querySelector("#gameOver");
const finalKills = document.querySelector("#finalKills");
const restartButton = document.querySelector("#restartButton");

// ==============================
// CANVAS
// ==============================

function resizeCanvas() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ==============================
// GAME STATE
// ==============================

let running = true;
let gamePaused = false;

let kills = 0;
let killsRequired = 10;

let totalKills = 0;

let bananas = [];

// ==============================
// ELAPSED TIME
// ==============================

let gameStartTime = performance.now();
let pausedTime = 0;
let pauseStartTime = 0;

function updateElapsedTime() {

if (!running) {
    return;
}

let currentTime = performance.now();

let elapsedMilliseconds =
    currentTime -
    gameStartTime -
    pausedTime;

let elapsedSeconds =
    Math.floor(elapsedMilliseconds / 1000);

const minutes =
    Math.floor(elapsedSeconds / 60);

const seconds =
    elapsedSeconds % 60;

elapsedTimeElement.textContent =
    `${minutes}:${String(seconds).padStart(2, "0")}`;

}

// ==============================
// ORANGE
// ==============================

const orange = {
radius: 35
};

// ==============================
// SWORD
// ==============================

const sword = {
angle: 0,

length: 110,
width: 12,

// How forgiving the sword collision is
hitbox: 18

};

// ==============================
// UPGRADES
// ==============================

const upgrades = {
sword: 0,
length: 0,
speed: 0
};

// ==============================
// MOUSE / TOUCH
// ==============================

function updateSwordPosition(x, y) {

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

sword.angle = Math.atan2(
    y - centerY,
    x - centerX
);

}

// Desktop

canvas.addEventListener("mousemove", (event) => {

if (!running || gamePaused) {
    return;
}

updateSwordPosition(
    event.clientX,
    event.clientY
);

});

// Mobile

canvas.addEventListener(
"touchstart",
(event) => {

    if (!running || gamePaused) {
        return;
    }

    const touch = event.touches[0];

    updateSwordPosition(
        touch.clientX,
        touch.clientY
    );

},
{ passive: false }

);

canvas.addEventListener(
"touchmove",
(event) => {

    if (!running || gamePaused) {
        return;
    }

    event.preventDefault();

    const touch = event.touches[0];

    updateSwordPosition(
        touch.clientX,
        touch.clientY
    );

},
{ passive: false }

);

// ==============================
// BANANA
// ==============================

function spawnBanana() {

const margin = 50;

let x;
let y;

const side = Math.floor(Math.random() * 4);

if (side === 0) {
    // Top
    x = Math.random() * canvas.width;
    y = -margin;
}

else if (side === 1) {
    // Right
    x = canvas.width + margin;
    y = Math.random() * canvas.height;
}

else if (side === 2) {
    // Bottom
    x = Math.random() * canvas.width;
    y = canvas.height + margin;
}

else {
    // Left
    x = -margin;
    y = Math.random() * canvas.height;
}


// Banana speed increases slowly
const speed =
    1.5 +
    Math.random() * 1.2 +
    totalKills * 0.003;


bananas.push({
    x: x,
    y: y,

    radius: 17,

    speed: speed,

    rotation: Math.random() * Math.PI * 2,

    rotationSpeed:
        (Math.random() - 0.5) * 0.08
});

}

// ==============================
// BANANA SPAWNING
// ==============================

let spawnTimer = 0;

function handleSpawning() {

spawnTimer++;

// Start with one banana every ~45 frames
const spawnRate =
    Math.max(
        12,
        45 - Math.floor(totalKills / 5)
    );

if (spawnTimer >= spawnRate) {

    spawnTimer = 0;

    spawnBanana();

    // Occasionally spawn another banana
    if (Math.random() < 0.15) {
        spawnBanana();
    }
}

}

// ==============================
// DISTANCE
// ==============================

function distance(x1, y1, x2, y2) {

const dx = x2 - x1;
const dy = y2 - y1;

return Math.sqrt(
    dx * dx +
    dy * dy
);

}

// ==============================
// SWORD COLLISION
// ==============================

function bananaHitBySword(banana) {

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Vector from orange to banana
const dx = banana.x - centerX;
const dy = banana.y - centerY;

const bananaDistance =
    Math.sqrt(dx * dx + dy * dy);


// Banana must be somewhere along the sword
if (
    bananaDistance >
    sword.length + sword.hitbox
) {
    return false;
}


// Don't hit things inside the orange
if (
    bananaDistance <
    orange.radius
) {
    return false;
}


// Angle from orange to banana
const bananaAngle =
    Math.atan2(dy, dx);


// Difference between sword and banana angles
let angleDifference =
    bananaAngle - sword.angle;


// Normalize angle
while (angleDifference > Math.PI) {
    angleDifference -= Math.PI * 2;
}

while (angleDifference < -Math.PI) {
    angleDifference += Math.PI * 2;
}


// Sword gets wider with the sword upgrade
const swordWidth =
    0.12 +
    upgrades.sword * 0.035;


return Math.abs(angleDifference) < swordWidth;

}

// ==============================
// KILL BANANA
// ==============================

function killBanana(index) {

bananas.splice(index, 1);

kills++;
totalKills++;

updateProgress();

// Check for upgrade
if (kills >= killsRequired) {

    openUpgradeMenu();
}

}

// ==============================
// BANANA REACHES ORANGE
// ==============================

function bananaReachedOrange(banana) {

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

return (
    distance(
        banana.x,
        banana.y,
        centerX,
        centerY
    ) <=
    banana.radius +
    orange.radius
);

}

// ==============================
// UPDATE BANANAS
// ==============================

function updateBananas() {

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

for (let i = bananas.length - 1; i >= 0; i--) {

    const banana = bananas[i];

    const dx =
        centerX - banana.x;

    const dy =
        centerY - banana.y;

    const length =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    banana.x +=
        (dx / length) *
        banana.speed;

    banana.y +=
        (dy / length) *
        banana.speed;

    banana.rotation +=
        banana.rotationSpeed;


    // Sword collision
    if (bananaHitBySword(banana)) {

        killBanana(i);

        continue;
    }


    // Orange collision
    if (bananaReachedOrange(banana)) {

        endGame();

        return;
    }
}

}

// ==============================
// PROGRESS
// ==============================

function updateProgress() {

killCountElement.textContent =
    kills;

killText.textContent =
    `${kills} / ${killsRequired}`;

const percentage =
    Math.min(
        100,
        (kills / killsRequired) * 100
    );

progressBar.style.width =
    `${percentage}%`;

}

// ==============================
// UPGRADE MENU
// ==============================

function openUpgradeMenu() {

gamePaused = true;

pauseStartTime = performance.now();

upgradeMenu.classList.add("open");
}

function chooseUpgrade(type) {

if (type === "sword") {

    upgrades.sword++;

}

else if (type === "length") {

    upgrades.length++;

    sword.length += 25;

}

else if (type === "speed") {

    upgrades.speed++;

}


// Add time spent in the upgrade menu to paused time
pausedTime +=
    performance.now() -
    pauseStartTime;


// Reset kills
kills = 0;


// Increase requirement
killsRequired =
    Math.ceil(
        killsRequired * 1.35
    );


updateProgress();


upgradeMenu.classList.remove("open");

gamePaused = false;

}

// Upgrade buttons

upgradeButtons.forEach((button) => {

button.addEventListener(
    "click",
    () => {

        const upgrade =
            button.dataset.upgrade;

        chooseUpgrade(upgrade);

    }
);

});

// ==============================
// BACK TO GAMES
// ==============================

backToGamesButton.addEventListener(
"click",
() => {

    window.location.href =
        "https://orangepeels.club/games";

}

);

// ==============================
// DRAW ORANGE
// ==============================

function drawOrange() {

const x = canvas.width / 2;
const y = canvas.height / 2;


// Orange body

ctx.save();

ctx.beginPath();

ctx.arc(
    x,
    y,
    orange.radius,
    0,
    Math.PI * 2
);

ctx.fillStyle = "#f7931e";
ctx.fill();

ctx.strokeStyle = "#c75b00";
ctx.lineWidth = 4;
ctx.stroke();


// Orange shine

ctx.beginPath();

ctx.arc(
    x - 11,
    y - 12,
    7,
    0,
    Math.PI * 2
);

ctx.fillStyle = "#ffd27a";
ctx.fill();


// Leaf

ctx.beginPath();

ctx.ellipse(
    x + 15,
    y - 28,
    11,
    5,
    -0.5,
    0,
    Math.PI * 2
);

ctx.fillStyle = "#4caf50";
ctx.fill();

ctx.restore();

}

// ==============================
// DRAW SWORD
// ==============================

function drawSword() {

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const swordStart =
    orange.radius - 3;

const swordEnd =
    sword.length;


ctx.save();

ctx.translate(
    centerX,
    centerY
);

ctx.rotate(
    sword.angle
);


// Handle

ctx.fillStyle = "#6b3f20";

ctx.fillRect(
    swordStart - 3,
    -5,
    25,
    10
);


// Guard

ctx.fillStyle = "#777";

ctx.fillRect(
    swordStart - 5,
    -12,
    8,
    24
);


// Blade

ctx.beginPath();

ctx.moveTo(
    swordStart + 15,
    -8
);

ctx.lineTo(
    swordEnd - 12,
    -8
);

ctx.lineTo(
    swordEnd,
    0
);

ctx.lineTo(
    swordEnd - 12,
    8
);

ctx.lineTo(
    swordStart + 15,
    8
);

ctx.closePath();

ctx.fillStyle = "#ddd";
ctx.fill();

ctx.strokeStyle = "#888";
ctx.lineWidth = 2;
ctx.stroke();


ctx.restore();

}

// ==============================
// DRAW BANANA
// ==============================

function drawBanana(banana) {

ctx.save();

ctx.translate(
    banana.x,
    banana.y
);

ctx.rotate(
    banana.rotation
);


// Banana body

ctx.beginPath();

ctx.arc(
    0,
    0,
    banana.radius,
    Math.PI * 0.15,
    Math.PI * 1.45
);

ctx.lineWidth = 13;
ctx.lineCap = "round";

ctx.strokeStyle = "#f5d742";

ctx.stroke();


// Banana outline

ctx.beginPath();

ctx.arc(
    0,
    0,
    banana.radius,
    Math.PI * 0.15,
    Math.PI * 1.45
);

ctx.lineWidth = 4;

ctx.strokeStyle = "#9c7910";

ctx.stroke();


// Stem

ctx.fillStyle = "#70551c";

ctx.fillRect(
    -3,
    -19,
    6,
    7
);


ctx.restore();

}

// ==============================
// DRAW EVERYTHING
// ==============================

function draw() {

ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
);


// Background

ctx.fillStyle = "#151515";

ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
);


// Slight arena circle

ctx.beginPath();

ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    180,
    0,
    Math.PI * 2
);

ctx.strokeStyle =
    "rgba(255,255,255,0.04)";

ctx.lineWidth = 2;

ctx.stroke();


// Bananas

for (const banana of bananas) {
    drawBanana(banana);
}


// Orange

drawOrange();


// Sword

drawSword();

}

// ==============================
// GAME LOOP
// ==============================

function gameLoop() {

if (running && !gamePaused) {

    handleSpawning();

    updateBananas();

    updateElapsedTime();
}

draw();

requestAnimationFrame(
    gameLoop
);

}

// ==============================
// GAME OVER
// ==============================

function endGame() {

if (!running) {
    return;
}

running = false;

finalKills.textContent =
    totalKills;

gameOver.classList.add("open");

}

// ==============================
// RESTART
// ==============================

function restartGame() {

```
running = true;
gamePaused = false;

kills = 0;
killsRequired = 10;
totalKills = 0;

bananas = [];

spawnTimer = 0;


// Reset timer

gameStartTime = performance.now();
pausedTime = 0;
pauseStartTime = 0;

elapsedTimeElement.textContent =
    "0:00";


// Reset upgrades

upgrades.sword = 0;
upgrades.length = 0;
upgrades.speed = 0;


sword.length = 110;


gameOver.classList.remove("open");

upgradeMenu.classList.remove("open");

updateProgress();

}

restartButton.addEventListener(
"click",
restartGame
);

// ==============================
// START
// ==============================

updateProgress();

gameLoop();
