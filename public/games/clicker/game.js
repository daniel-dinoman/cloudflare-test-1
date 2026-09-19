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

// Cookie Clicker-style scaling.
//
// Every purchase multiplies the next cost by 1.15.

const COST_MULTIPLIER = 1.15;

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
        return (number / 1000)
            .toFixed(1)
            .replace(".0", "") + "K";
    }

    if (number < 1000000000) {
        return (number / 1000000)
            .toFixed(1)
            .replace(".0", "") + "M";
    }

    if (number < 1000000000000) {
        return (number / 1000000000)
            .toFixed(1)
            .replace(".0", "") + "B";
    }

    if (number < 1000000000000000) {
        return (number / 1000000000000)
            .toFixed(1)
            .replace(".0", "") + "T";
    }

    return number.toExponential(2);
}


// ==========================================
// GET CURRENT UPGRADE COST
// ==========================================

function getUpgradeCost(type) {

    const upgrade = upgradeData[type];

    const amountOwned = upgrades[type];

    return Math.floor(
        upgrade.cost *
        Math.pow(COST_MULTIPLIER, amountOwned)
    );
}


// ==========================================
// CALCULATE STATS
// ==========================================

function calculateStats() {

    perClick = 1;

    orangesPerSecond = 0;

    for (const type in upgrades) {

        const data = upgradeData[type];

        perClick +=
            upgrades[type] *
            data.click;

        orangesPerSecond +=
            upgrades[type] *
            data.passive;
    }
}


// ==========================================
// UPDATE DISPLAY
// ==========================================

function updateDisplay() {

    calculateStats();

    orangeCount.textContent =
        formatNumber(oranges);

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

    upgradeCount.textContent =
        totalUpgrades;

    updateShop();
}


// ==========================================
// CLICK ORANGE
// ==========================================

orangeButton.addEventListener("click", function(event) {

    oranges += perClick;

    totalOranges += perClick;

    updateDisplay();

    showClickText(
        perClick,
        event
    );
});


// ==========================================
// CLICK POPUP
// ==========================================

function showClickText(amount, event) {

    clickText.textContent =
        "+" +
        formatNumber(amount) +
        " 🍊";

    clickText.style.left =
        event.clientX + "px";

    clickText.style.top =
        event.clientY + "px";

    clickText.classList.remove("pop");

    void clickText.offsetWidth;

    clickText.classList.add("pop");
}


// ==========================================
// SHOP BUTTONS
// ==========================================

const buttons = {

    peel:
        document.getElementById("upgradePeel"),

    juice:
        document.getElementById("upgradeJuice"),

    tree:
        document.getElementById("upgradeTree"),

    grandma:
        document.getElementById("upgradeGrandma"),

    factory:
        document.getElementById("upgradeFactory"),

    government:
        document.getElementById("upgradeGovernment"),

    dimension:
        document.getElementById("upgradeDimension")
};


// ==========================================
// BUY UPGRADES
// ==========================================

for (const type in buttons) {

    buttons[type].addEventListener(
        "click",
        function() {

            const cost =
                getUpgradeCost(type);

            // Not enough oranges
            if (oranges < cost) {
                return;
            }

            // Pay for upgrade
            oranges -= cost;

            // Increase amount owned
            upgrades[type]++;

            // Update everything
            updateDisplay();

            // Save immediately
            saveGame();
        }
    );
}


// ==========================================
// UPDATE SHOP
// ==========================================

function updateShop() {

    for (const type in buttons) {

        const button =
            buttons[type];

        const cost =
            getUpgradeCost(type);

        // Disable if too expensive
        button.disabled =
            oranges < cost;

        // Update displayed cost
        const costText =
            button.querySelector(
                ".upgrade-cost"
            );

        costText.textContent =
            "Cost: " +
            formatNumber(cost) +
            " 🍊";
    }
}


// ==========================================
// PASSIVE PRODUCTION
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
// SAVE GAME
// ==========================================

function saveGame() {

    const saveData = {

        oranges:
            oranges,

        totalOranges:
            totalOranges,

        upgrades:
            upgrades,

        lastSave:
            Date.now()
    };

    localStorage.setItem(
        "orangeClickerSave",
        JSON.stringify(saveData)
    );
}


// ==========================================
// LOAD GAME
// ==========================================

function loadGame() {

    const saved =
        localStorage.getItem(
            "orangeClickerSave"
        );

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
                    Number(
                        data.upgrades[type]
                    ) || 0;
            }
        }

        // Calculate production before
        // calculating offline earnings.

        calculateStats();

        // ======================================
        // OFFLINE PRODUCTION
        // ======================================

        if (data.lastSave) {

            const secondsAway =
                (Date.now() -
                    data.lastSave) / 1000;

            // Maximum 8 hours offline
            const offlineSeconds =
                Math.min(
                    secondsAway,
                    60 * 60 * 8
                );

            const offlineOranges =
                orangesPerSecond *
                offlineSeconds;

            oranges +=
                offlineOranges;

            totalOranges +=
                offlineOranges;
        }

        updateDisplay();

    } catch (error) {

        console.error(
            "Could not load save:",
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

// Save every 5 seconds.

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
// START GAME
// ==========================================

loadGame();

console.log(
    "🍊 Orange Clicker loaded!"
);
