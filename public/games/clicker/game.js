// ==========================================
// ORANGE CLICKER
// ==========================================

let oranges = 0;
let totalOranges = 0;

let perClick = 1;
let orangesPerSecond = 0;

let upgrades = {
    peel: 0,
    juice: 0,
    tree: 0,
    grandma: 0,
    factory: 0,
    government: 0,
    dimension: 0
};


// ==========================================
// ELEMENTS
// ==========================================

const orangeButton = document.getElementById("orangeButton");
const orangeCount = document.getElementById("orangeCount");
const perSecond = document.getElementById("perSecond");
const perClickDisplay = document.getElementById("perClick");
const perSecondSmall = document.getElementById("perSecondSmall");
const upgradeCount = document.getElementById("upgradeCount");
const clickText = document.getElementById("clickText");


// ==========================================
// UPGRADE DATA
// ==========================================

const upgradeData = {
    peel: {
        cost: 15,
        click: 1,
        passive: 0
    },

    juice: {
        cost: 100,
        click: 0,
        passive: 1
    },

    tree: {
        cost: 500,
        click: 0,
        passive: 5
    },

    grandma: {
        cost: 2500,
        click: 0,
        passive: 25
    },

    factory: {
        cost: 10000,
        click: 0,
        passive: 100
    },

    government: {
        cost: 50000,
        click: 0,
        passive: 500
    },

    dimension: {
        cost: 250000,
        click: 0,
        passive: 2500
    }
};


// ==========================================
// NUMBER FORMAT
// ==========================================

function formatNumber(number) {
    if (number < 1000) {
        return Math.floor(number).toLocaleString();
    }

    if (number < 1000000) {
        return (number / 1000).toFixed(1).replace(".0", "") + "K";
    }

    if (number < 1000000000) {
        return (number / 1000000).toFixed(1).replace(".0", "") + "M";
    }

    if (number < 1000000000000) {
        return (number / 1000000000).toFixed(1).replace(".0", "") + "B";
    }

    return (number / 1000000000000).toFixed(1).replace(".0", "") + "T";
}


// ==========================================
// CALCULATE STATS
// ==========================================

function calculateStats() {

    perClick = 1;

    orangesPerSecond = 0;

    for (const type in upgrades) {

        const data = upgradeData[type];

        perClick += upgrades[type] * data.click;

        orangesPerSecond += upgrades[type] * data.passive;
    }
}


// ==========================================
// UPDATE DISPLAY
// ==========================================

function updateDisplay() {

    calculateStats();

    orangeCount.textContent = formatNumber(oranges);

    perSecond.textContent =
        formatNumber(orangesPerSecond) +
        " oranges / second";

    perClickDisplay.textContent =
        formatNumber(perClick);

    perSecondSmall.textContent =
        formatNumber(orangesPerSecond);

    let totalUpgrades = 0;

    for (const type in upgrades) {
        totalUpgrades += upgrades[type];
    }

    upgradeCount.textContent = totalUpgrades;

    updateShop();
}


// ==========================================
// ORANGE CLICK
// ==========================================

orangeButton.addEventListener("click", function(event) {

    // Give the player oranges
    oranges += perClick;

    // Track total oranges earned
    totalOranges += perClick;

    // Update the number on screen
    updateDisplay();

    // Show popup
    showClickText(perClick, event);
});


// ==========================================
// CLICK POPUP
// ==========================================

function showClickText(amount, event) {

    clickText.textContent =
        "+" + formatNumber(amount) + " 🍊";

    clickText.style.left =
        event.clientX + "px";

    clickText.style.top =
        event.clientY + "px";

    clickText.classList.remove("pop");

    // Force animation restart
    void clickText.offsetWidth;

    clickText.classList.add("pop");
}


// ==========================================
// SHOP
// ==========================================

const buttons = {
    peel: document.getElementById("upgradePeel"),
    juice: document.getElementById("upgradeJuice"),
    tree: document.getElementById("upgradeTree"),
    grandma: document.getElementById("upgradeGrandma"),
    factory: document.getElementById("upgradeFactory"),
    government: document.getElementById("upgradeGovernment"),
    dimension: document.getElementById("upgradeDimension")
};


for (const type in buttons) {

    buttons[type].addEventListener("click", function() {

        const upgrade = upgradeData[type];

        if (oranges < upgrade.cost) {
            return;
        }

        oranges -= upgrade.cost;

        upgrades[type]++;

        updateDisplay();

        saveGame();
    });
}


// ==========================================
// UPDATE SHOP BUTTONS
// ==========================================

function updateShop() {

    for (const type in buttons) {

        const button = buttons[type];

        const upgrade = upgradeData[type];

        button.disabled =
            oranges < upgrade.cost;

        const costText =
            button.querySelector(".upgrade-cost");

        costText.textContent =
            "Cost: " +
            formatNumber(upgrade.cost) +
            " 🍊";
    }
}


// ==========================================
// PASSIVE ORANGES
// ==========================================

// Runs 10 times per second.

setInterval(function() {

    if (orangesPerSecond <= 0) {
        return;
    }

    const amount =
        orangesPerSecond / 10;

    oranges += amount;

    totalOranges += amount;

    updateDisplay();

}, 100);


// ==========================================
// SAVE
// ==========================================

function saveGame() {

    const saveData = {
        oranges: oranges,
        totalOranges: totalOranges,
        upgrades: upgrades,
        lastSave: Date.now()
    };

    localStorage.setItem(
        "orangeClickerSave",
        JSON.stringify(saveData)
    );
}


// ==========================================
// LOAD
// ==========================================

function loadGame() {

    const saved =
        localStorage.getItem("orangeClickerSave");

    if (!saved) {
        updateDisplay();
        return;
    }

    try {

        const data =
            JSON.parse(saved);

        oranges =
            Number(data.oranges) || 0;

        totalOranges =
            Number(data.totalOranges) || 0;

        if (data.upgrades) {

            for (const type in upgrades) {

                upgrades[type] =
                    Number(data.upgrades[type]) || 0;
            }
        }

        calculateStats();

        // Offline production

        if (data.lastSave) {

            const secondsAway =
                (Date.now() - data.lastSave) / 1000;

            // Maximum 8 hours of offline production
            const offlineSeconds =
                Math.min(secondsAway, 60 * 60 * 8);

            const offlineOranges =
                orangesPerSecond *
                offlineSeconds;

            oranges += offlineOranges;

            totalOranges += offlineOranges;
        }

        updateDisplay();

    } catch (error) {

        console.error(
            "Orange Clicker save is corrupted:",
            error
        );

        localStorage.removeItem(
            "orangeClickerSave"
        );

        oranges = 0;
        totalOranges = 0;

        for (const type in upgrades) {
            upgrades[type] = 0;
        }

        updateDisplay();
    }
}


// ==========================================
// AUTO SAVE
// ==========================================

setInterval(function() {
    saveGame();
}, 5000);


// ==========================================
// SAVE WHEN LEAVING
// ==========================================

window.addEventListener(
    "beforeunload",
    saveGame
);


// ==========================================
// START
// ==========================================

loadGame();

console.log("🍊 Orange Clicker loaded!");
