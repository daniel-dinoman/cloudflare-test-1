const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const killCountElement = document.querySelector("#killCount");
const killText = document.querySelector("#killText");
const progressBar = document.querySelector("#progressBar");
const waveText = document.querySelector("#waveText");

const elapsedTimeElement = document.querySelector("#elapsedTime");
const backToGamesButton = document.querySelector("#backToGames");

const upgradeMenu = document.querySelector("#upgradeMenu");
let upgradeButtons = document.querySelectorAll(".upgradeButton");

const gameOver = document.querySelector("#gameOver");
const finalKills = document.querySelector("#finalKills");
const restartButton = document.querySelector("#restartButton");

const healthElement = document.querySelector("#health");


// CANVAS
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// GAME STATE
let running = true;
let gamePaused = false;

let kills = 0;
let totalKills = 0;

let bananas = [];


// WAVES
const waves = [
    { banana: 10 },
    { banana: 15 },
    { banana: 20 },
    { banana: 25 },
    { banana: 30 },

    { banana: 25, fastBanana: 5 },
    { banana: 30, fastBanana: 10 },
    { banana: 35, fastBanana: 10 },

    { banana: 30, strongBanana: 5 },
    { banana: 35, strongBanana: 10 },
    { banana: 40, fastBanana: 10, strongBanana: 5 },

    { banana: 40, fastBanana: 15, strongBanana: 10 },
    { banana: 45, strongBanana: 15 },
    { banana: 50, fastBanana: 15, strongBanana: 15 },

    { banana: 50, fastBanana: 20, strongBanana: 15 },
    { banana: 55, fastBanana: 20, strongBanana: 20 },

    { banana: 60, fastBanana: 20, strongBanana: 20 },
    { banana: 65, fastBanana: 25, strongBanana: 20 },

    { banana: 70, fastBanana: 25, strongBanana: 25 },

    { banana: 80, fastBanana: 30, strongBanana: 30 }
];

const MAX_WAVES = waves.length;

let currentWave = 1;

let waveEnemiesTotal = 0;
let waveEnemiesRemaining = 0;

let waveStarted = false;
let waveSpawningFinished = false;

let waveSpawnQueue = [];


// ELAPSED TIME
let gameStartTime = performance.now();
let pausedTime = 0;
let pauseStartTime = 0;

function updateElapsedTime() {
    if (!running) return;

    const currentTime = performance.now();

    const elapsedMilliseconds =
        currentTime - gameStartTime - pausedTime;

    const elapsedSeconds =
        Math.floor(elapsedMilliseconds / 1000);

    const minutes =
        Math.floor(elapsedSeconds / 60);

    const seconds =
        elapsedSeconds % 60;

    elapsedTimeElement.textContent =
        `${minutes}:${String(seconds).padStart(2, "0")}`;
}


// ORANGE
const orange = {
    radius: 35
};


// SWORD
const sword = {
    angle: 0,
    length: 110,
    width: 12,
    hitbox: 18,

    damage: 1 / 15,

    attackCooldown: 0.01,

    attackTimer: 0
};


// UPGRADES
const upgrades = {
    sword: 0,
    length: 0,
    attackSpeed: 0,
    health: 0
};


// HEALTH
let orangeHealth = 5;
const MAX_ORANGE_HEALTH = 5;

function updateHealthDisplay() {
    let hearts = "";

    for (let i = 0; i < MAX_ORANGE_HEALTH; i++) {
        if (i < orangeHealth) {
            hearts += "❤️";
        } else {
            hearts += "🖤";
        }
    }

    healthElement.textContent = hearts;
}


// MOUSE / TOUCH
function updateSwordPosition(x, y) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    sword.angle = Math.atan2(
        y - centerY,
        x - centerX
    );
}

canvas.addEventListener("mousemove", event => {
    if (!running || gamePaused) return;

    updateSwordPosition(
        event.clientX,
        event.clientY
    );
});

canvas.addEventListener(
    "touchstart",
    event => {
        if (!running || gamePaused) return;

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
    event => {
        if (!running || gamePaused) return;

        event.preventDefault();

        const touch = event.touches[0];

        updateSwordPosition(
            touch.clientX,
            touch.clientY
        );
    },
    { passive: false }
);


// BANANA
function spawnBanana() {
    
    const margin = 50;

    let x;
    let y;

    const side = Math.floor(Math.random() * 4);

    if (side === 0) {
        x = Math.random() * canvas.width;
        y = -margin;
    }
    else if (side === 1) {
        x = canvas.width + margin;
        y = Math.random() * canvas.height;
    }
    else if (side === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height + margin;
    }
    else {
        x = -margin;
        y = Math.random() * canvas.height;
    }

    const speed =
        1.5 +
        Math.random() * 1.2 +
        currentWave * 0.08 +
        totalKills * 0.003;

    bananas.push({
        x: x,
        y: y,

        radius: 17,

        speed: speed,

        rotation: Math.random() * Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) * 0.08,

        // HP
        hp: 0.01,
        maxHp: 0.01,
        type: "banana"
    });
}

function spawnFastBanana() {
    const margin = 50;

    let x;
    let y;

    const side = Math.floor(Math.random() * 4);

    if (side === 0) {
        x = Math.random() * canvas.width;
        y = -margin;
    }
    else if (side === 1) {
        x = canvas.width + margin;
        y = Math.random() * canvas.height;
    }
    else if (side === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height + margin;
    }
    else {
        x = -margin;
        y = Math.random() * canvas.height;
    }

    const speed =
        3.5 +
        Math.random() * 1.5 +
        currentWave * 0.1;

    bananas.push({
        x: x,
        y: y,

        radius: 15,

        speed: speed,

        rotation: Math.random() * Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) * 0.12,

        hp: 0.1,
        maxHp: 0.1,

        type: "fastBanana"
    });
}


// ENEMY SPAWNING
function spawnEnemy(type) {
    if (type === "banana") {
        spawnBanana();
    }
    else if (type === "fastBanana") {
        spawnFastBanana();
    }

    // Future enemy types:
    //
    // else if (type === "strongBanana") {
    //     spawnStrongBanana();
    // }
}


// START WAVE
function startWave() {
    const waveData = waves[currentWave - 1];

    waveSpawnQueue = [];

    // Convert the wave table into a queue
    for (const enemyType in waveData) {
        const amount = waveData[enemyType];

        for (let i = 0; i < amount; i++) {
            waveSpawnQueue.push(enemyType);
        }
    }

    // Shuffle the queue
    for (
        let i = waveSpawnQueue.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(Math.random() * (i + 1));

        [
            waveSpawnQueue[i],
            waveSpawnQueue[j]
        ] = [
            waveSpawnQueue[j],
            waveSpawnQueue[i]
        ];
    }

    waveEnemiesTotal = waveSpawnQueue.length;
    waveEnemiesRemaining = waveSpawnQueue.length;

    kills = 0;

    waveStarted = true;
    waveSpawningFinished = false;

    spawnTimer = 0;

    // Reset sword attack timer
    sword.attackTimer = 0;

    updateProgress();
}


// BANANA SPAWNING
let spawnTimer = 0;

function handleSpawning() {
    if (waveSpawnQueue.length <= 0) {
        waveSpawningFinished = true;
        return;
    }

    spawnTimer++;

    const spawnRate =
        Math.max(10, 35 - currentWave);

    if (spawnTimer >= spawnRate) {
        spawnTimer = 0;

        const enemyType =
            waveSpawnQueue.shift();

        spawnEnemy(enemyType);

        waveEnemiesRemaining--;

        if (waveSpawnQueue.length <= 0) {
            waveSpawningFinished = true;
        }
    }
}


// DISTANCE
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(
        dx * dx + dy * dy
    );
}


// CHECK SWORD COLLISION
function bananaHitBySword(banana) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const dx =
        banana.x - centerX;

    const dy =
        banana.y - centerY;

    const bananaDistance =
        Math.sqrt(
            dx * dx + dy * dy
        );

    if (
        bananaDistance >
        sword.length + sword.hitbox
    ) {
        return false;
    }

    if (
        bananaDistance <
        orange.radius
    ) {
        return false;
    }

    const bananaAngle =
        Math.atan2(dy, dx);

    let angleDifference =
        bananaAngle - sword.angle;

    while (
        angleDifference > Math.PI
    ) {
        angleDifference -= Math.PI * 2;
    }

    while (
        angleDifference < -Math.PI
    ) {
        angleDifference += Math.PI * 2;
    }

    // Sword width stays slightly upgradeable
    const swordWidth =
        0.12 +
        upgrades.sword * 0.035;

    return (
        Math.abs(angleDifference) <
        swordWidth
    );
}


// DAMAGE BANANA
function damageBanana(banana) {
    banana.hp -= sword.damage;

    if (banana.hp <= 0) {
        return true;
    }

    return false;
}


// KILL BANANA
function killBanana(index) {
    bananas.splice(index, 1);

    kills++;
    totalKills++;

    updateProgress();
}


// WAVE COMPLETE
function completeWave() {
    if (gamePaused) return;

    if (currentWave >= MAX_WAVES) {
        winGame();
        return;
    }

    openUpgradeMenu();
}


// BANANA REACHES ORANGE
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


// DAMAGE ORANGE
function damageOrange() {
    orangeHealth--;

    updateHealthDisplay();

    if (orangeHealth <= 0) {
        endGame();
    }
}


// UPDATE BANANAS
function updateBananas(deltaTime) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Sword attack cooldown
    sword.attackTimer += deltaTime;

    const canAttack =
        sword.attackTimer >=
        sword.attackCooldown;

        if (canAttack) {
            sword.attackTimer -= sword.attackCooldown;
        }

    for (
        let i = bananas.length - 1;
        i >= 0;
        i--
    ) {
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

        if (length > 0) {
            banana.x +=
                (dx / length) *
                banana.speed;

            banana.y +=
                (dy / length) *
                banana.speed;
        }

        banana.rotation +=
            banana.rotationSpeed;

        // Sword damage
        if (
            canAttack &&
            bananaHitBySword(banana)
        ) {
            const killed =
                damageBanana(banana);

            if (killed) {
                killBanana(i);
                continue;
            }
        }

        // Banana reaches orange
        if (bananaReachedOrange(banana)) {
            bananas.splice(i, 1);

            // Count it as cleared for wave progress
            kills++;
            totalKills++;

            updateProgress();

            damageOrange();

            if (!running) {
                return;
            }
        }
    }

    // Check if the entire wave is finished
    if (
        waveSpawningFinished &&
        bananas.length === 0 &&
        kills >= waveEnemiesTotal
    ) {
        completeWave();
    }
}


// PROGRESS
function updateProgress() {
    killCountElement.textContent = kills;

    killText.textContent =
        `${kills} / ${waveEnemiesTotal}`;

    waveText.textContent =
        `WAVE ${currentWave} / ${MAX_WAVES}`;

    const percentage =
        Math.min(
            100,
            (kills / waveEnemiesTotal) * 100
        );

    progressBar.style.width =
        `${percentage}%`;
}


// UPGRADE MENU
function openUpgradeMenu() {
    gamePaused = true;

    pauseStartTime =
        performance.now();

    upgradeMenu.classList.add("open");
}


// CHOOSE UPGRADE
function chooseUpgrade(type) {

    // SHARPER SWORD
    if (type === "sword") {
        upgrades.sword++;

        sword.damage += 1 / 15;
    }

    // LONGER SWORD
    else if (type === "length") {
        upgrades.length++;

        sword.length += 25;
    }

    // FASTER ATTACKS
    else if (type === "attackSpeed") {
        upgrades.attackSpeed++;
    
        sword.attackCooldown = Math.max(
            0.002,
            sword.attackCooldown - 0.001
        );
    }

    // MORE HEALTH
    else if (type === "health") {
        if (
            orangeHealth <
            MAX_ORANGE_HEALTH
        ) {
            orangeHealth++;

            upgrades.health++;

            updateHealthDisplay();
        }
    }

    // Resume game
    pausedTime +=
        performance.now() -
        pauseStartTime;

    currentWave++;

    startWave();

    upgradeMenu.classList.remove("open");

    gamePaused = false;
}



// BACK TO GAMES
backToGamesButton.addEventListener(
    "click",
    () => {
        window.location.href =
            "https://orangepeels.club/games";
    }
);


// DRAW ORANGE
function drawOrange() {
    const x = canvas.width / 2;
    const y = canvas.height / 2;

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

    // Highlight
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


// DRAW SWORD
function drawSword() {
    const centerX =
        canvas.width / 2;

    const centerY =
        canvas.height / 2;

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


// DRAW BANANA
function drawBanana(banana) {
    ctx.save();

    const isFast = banana.type === "fastBanana";
    ctx.strokeStyle = isFast ? "#ff9d00" : "#f5d742";
    ctx.strokeStyle = isFast ? "#a85c00" : "#9c7910";
    
    ctx.translate(
        banana.x,
        banana.y
    );

    ctx.rotate(
        banana.rotation
    );

    // Banana outline
    ctx.beginPath();

    ctx.moveTo(-16, 7);

    ctx.bezierCurveTo(
        -4, 13,
        12, 12,
        22, 2
    );

    ctx.bezierCurveTo(
        28, -4,
        29, -9,
        27, -14
    );

    ctx.lineWidth = 18;
    ctx.lineCap = "round";

    ctx.strokeStyle = "#9c7910";
    ctx.stroke();

    // Yellow body
    ctx.beginPath();

    ctx.moveTo(-16, 7);

    ctx.bezierCurveTo(
        -4, 13,
        12, 12,
        22, 2
    );

    ctx.bezierCurveTo(
        28, -4,
        29, -9,
        27, -14
    );

    ctx.lineWidth = 13;
    ctx.lineCap = "round";

    ctx.strokeStyle = "#f5d742";
    ctx.stroke();

    // Stem
    ctx.beginPath();

    ctx.moveTo(
        27,
        -14
    );

    ctx.lineTo(
        31,
        -19
    );

    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    ctx.strokeStyle = "#70551c";
    ctx.stroke();

    // Highlight
    ctx.beginPath();

    ctx.moveTo(
        -8,
        6
    );

    ctx.bezierCurveTo(
        1, 9,
        11, 8,
        18, 2
    );

    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    ctx.strokeStyle = "#ffe875";
    ctx.stroke();

    ctx.restore();
}


// DRAW BANANA HP BAR
function drawBananaHealth(banana) {
    const barWidth = 34;
    const barHeight = 5;

    const x =
        banana.x -
        barWidth / 2;

    const y =
        banana.y -
        30;

    // Background
    ctx.fillStyle =
        "rgba(0, 0, 0, 0.7)";

    ctx.fillRect(
        x,
        y,
        barWidth,
        barHeight
    );

    // HP
    const hpPercentage =
        Math.max(
            0,
            banana.hp /
            banana.maxHp
        );

    ctx.fillStyle = "#4caf50";

    ctx.fillRect(
        x,
        y,
        barWidth *
        hpPercentage,
        barHeight
    );

    // Border
    ctx.strokeStyle =
        "rgba(255,255,255,0.5)";

    ctx.lineWidth = 1;

    ctx.strokeRect(
        x,
        y,
        barWidth,
        barHeight
    );
}


// DRAW EVERYTHING
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

    // Center circle
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
        drawBananaHealth(banana);
        drawBanana(banana);
    }

    // Orange
    drawOrange();

    // Sword
    drawSword();
}


// GAME LOOP
let lastFrameTime =
    performance.now();

function gameLoop(currentTime) {
    const deltaTime =
        (currentTime -
            lastFrameTime) /
        1000;

    lastFrameTime =
        currentTime;

    if (
        running &&
        !gamePaused
    ) {
        handleSpawning();

        updateBananas(
            deltaTime
        );

        updateElapsedTime();
    }

    draw();

    requestAnimationFrame(
        gameLoop
    );
}


// GAME OVER
function endGame() {
    if (!running) return;

    running = false;

    finalKills.textContent =
        totalKills;

    gameOver.classList.add(
        "open"
    );
}


// VICTORY
function winGame() {
    if (!running) return;

    running = false;

    finalKills.textContent =
        totalKills;

    gameOver.classList.add(
        "open"
    );

    const title =
        gameOver.querySelector(
            "h1"
        );

    title.textContent =
        "🏆 YOU SURVIVED!";
}


// RESTART
function restartGame() {
    running = true;

    gamePaused = false;

    kills = 0;

    totalKills = 0;

    orangeHealth =
        MAX_ORANGE_HEALTH;

    currentWave = 1;

    bananas = [];

    spawnTimer = 0;

    waveStarted = false;

    waveSpawningFinished =
        false;

    waveSpawnQueue = [];

    gameStartTime =
        performance.now();

    pausedTime = 0;

    pauseStartTime = 0;

    lastFrameTime =
        performance.now();

    elapsedTimeElement.textContent =
        "0:00";

    // Reset upgrades
    upgrades.sword = 0;
    upgrades.length = 0;
    upgrades.attackSpeed = 0;
    upgrades.health = 0;

    // Reset sword
    sword.length = 110;

    sword.damage = 1;

    sword.attackCooldown =
        0.4;

    sword.attackTimer = 0;

    const title =
        gameOver.querySelector(
            "h1"
        );

    title.textContent =
        "🍌 GAME OVER";

    gameOver.classList.remove(
        "open"
    );

    upgradeMenu.classList.remove(
        "open"
    );

    updateHealthDisplay();

    startWave();
}


restartButton.addEventListener(
    "click",
    restartGame
);


// START
startWave();

updateProgress();

updateHealthDisplay();

requestAnimationFrame(
    gameLoop
);
