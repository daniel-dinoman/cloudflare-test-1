```javascript
// ==========================================
// ORANGE CLICKER
// ==========================================

// ---------- GAME DATA ----------

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

let lastSaveTime = Date.now();


// ---------- UPGRADE DATA ----------

const upgradeData = {
    peel: {
        cost: 15,
        clickPower: 1
    },

    juice: {
        cost: 100,
        perSecond: 1
    },

    tree: {
        cost: 500,
        perSecond: 5
    },

    grandma: {
        cost: 2500,
        perSecond: 25
    },

    factory: {
        cost: 10000,
        perSecond: 100
    },

    government: {
        cost: 50000,
        perSecond: 500
    },

    dimension: {
        cost: 250000,
        perSecond: 2500
    }
};


// ---------- ELEMENTS ----------

const orangeButton = document.getElementById("orangeButton");
const orangeCount = document.getElementById("orangeCount");
const perSecond = document.getElementById("perSecond");
const perClickDisplay = document.getElementById("perClick");
const perSecondSmall = document.getElementById("perSecondSmall");
const upgradeCount = document.getElementById("upgradeCount");
const clickText = document.getElementById("clickText");


// ---------- FORMATTING ----------

function formatNumber(number) {
    if (number < 1000) {
        return Math.floor(number).toLocaleString();
    }

    if (number < 1000000) {
        return (number / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }

    if (number < 1000000000) {
        return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }

    if (number < 1000000000000) {
        return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }

    if (number < 1000000000000000) {
        return (number / 1000000000000).toFixed(1).replace(/\.0$/, "") + "T";
    }

    return number.toExponential(2);
}


// ---------- CALCULATE STATS ----------

function calculateStats() {
    // Every Fancy Peeling Gloves adds +1 orange per click.
    perClick = 1 + upgrades.peel * upgradeData.peel.clickPower;

    // Passive production.
    orangesPerSecond =
        upgrades.juice * upgradeData.juice.perSecond +
        upgrades.tree * upgradeData.tree.perSecond +
        upgrades.grandma * upgradeData.grandma.perSecond +
        upgrades.factory * upgradeData.factory.perSecond +
        upgrades.government * upgradeData.government.perSecond +
        upgrades.dimension * upgradeData.dimension.perSecond;
}


// ---------- UPDATE DISPLAY ----------

function updateDisplay() {
    calculateStats();

    orangeCount.textContent = formatNumber(oranges);
    perSecond.textContent =
        formatNumber(orangesPerSecond) + " oranges / second";

    perClickDisplay.textContent = formatNumber(perClick);
    perSecondSmall.textContent = formatNumber(orangesPerSecond);

    const totalUpgrades =
        upgrades.peel +
        upgrades.juice +
        upgrades.tree +
        upgrades.grandma +
        upgrades.factory +
        upgrades.government +
        upgrades.dimension;

    upgradeCount.textContent = totalUpgrades;

    updateUpgradeButtons();
}

// ---------- CLICK ORANGE ----------

orangeButton.addEventListener("click", function(event) {
    oranges += perClick;
    totalOranges += perClick;

    showClickText(perClick, event);

    updateDisplay();
});


// ---------- CLICK POPUP ----------

function showClickText(amount, event) {
    clickText.textContent = "+" + formatNumber(amount) + " 🍊";

    const rect = orangeButton.getBoundingClientRect();

    clickText.style.left =
        (event.clientX - 25) + "px";

    clickText.style.top =
        (event.clientY - 20) + "px";

    // Restart animation
    clickText.classList.remove("pop");

    void clickText.offsetWidth;

    clickText.classList.add("pop");
}

function eventIsInsideOrange(event) {
    return (
        event &&
        typeof event.clientX === "number" &&
        typeof event.clientY === "number"
    );
}


// ---------- BUY UPGRADE ----------

function buyUpgrade(type) {
    const data = upgradeData[type];

    if (!data) {
        return;
    }

    if (oranges < data.cost) {
        return;
    }

    oranges -= data.cost;
    upgrades[type]++;

    calculateStats();
    updateDisplay();
    saveGame();
}


// ---------- UPGRADE BUTTONS ----------

const upgradeButtons = {
    peel: document.getElementById("upgradePeel"),
    juice: document.getElementById("upgradeJuice"),
    tree: document.getElementById("upgradeTree"),
    grandma: document.getElementById("upgradeGrandma"),
    factory: document.getElementById("upgradeFactory"),
    government: document.getElementById("upgradeGovernment"),
    dimension: document.getElementById("upgradeDimension")
};


// Attach click events.

for (const type in upgradeButtons) {
    upgradeButtons[type].addEventListener("click", function() {
        buyUpgrade(type);
    });
}


// ---------- UPDATE SHOP ----------

function updateUpgradeButtons() {
    for (const type in upgradeButtons) {
        const button = upgradeButtons[type];
        const data = upgradeData[type];

        button.disabled = oranges < data.cost;

        const costElement = button.querySelector(".upgrade-cost");

        if (costElement) {
            costElement.textContent =
                "Cost: " + formatNumber(data.cost) + " 🍊";
        }
    }
}


// ---------- PASSIVE PRODUCTION ----------

// Run 10 times per second for smoother production.

setInterval(function() {
    if (orangesPerSecond <= 0) {
        return;
    }

    const amount = orangesPerSecond / 10;

    oranges += amount;
    totalOranges += amount;

    updateDisplay();
}, 100);


// ---------- SAVING ----------

function saveGame() {
    const saveData = {
        oranges: oranges,
        totalOranges: totalOranges,
        upgrades: upgrades,
        lastSaveTime: Date.now()
    };

    localStorage.setItem(
        "orangeClickerSave",
        JSON.stringify(saveData)
    );

    lastSaveTime = Date.now();
}


// ---------- LOADING ----------

function loadGame() {
    const saved = localStorage.getItem("orangeClickerSave");

    if (!saved) {
        updateDisplay();
        return;
    }

    try {
        const data = JSON.parse(saved);

        oranges = Number(data.oranges) || 0;
        totalOranges = Number(data.totalOranges) || 0;

        if (data.upgrades) {
            for (const type in upgrades) {
                upgrades[type] = Number(data.upgrades[type]) || 0;
            }
        }

        // Calculate offline production.

        if (data.lastSaveTime) {
            const secondsAway =
                Math.max(0, (Date.now() - data.lastSaveTime) / 1000);

            calculateStats();

            // Don't allow ridiculous offline gains
            // from leaving the game open for months.
            const offlineSeconds = Math.min(secondsAway, 60 * 60 * 8);

            const offlineOranges =
                orangesPerSecond * offlineSeconds;

            if (offlineOranges > 0) {
                oranges += offlineOranges;
                totalOranges += offlineOranges;

                console.log(
                    "Welcome back! You earned " +
                    formatNumber(offlineOranges) +
                    " oranges while away."
                );
            }
        }

        updateDisplay();

    } catch (error) {
        console.error("Could not load Orange Clicker save:", error);

        // If the save is corrupted, start fresh.
        localStorage.removeItem("orangeClickerSave");

        oranges = 0;
        totalOranges = 0;

        for (const type in upgrades) {
            upgrades[type] = 0;
        }

        updateDisplay();
    }
}


// ---------- AUTO SAVE ----------

// Save every 5 seconds.

setInterval(function() {
    saveGame();
}, 5000);


// Save when leaving the page.

window.addEventListener("beforeunload", function() {
    saveGame();
});


// ---------- START GAME ----------

loadGame();

console.log("🍊 Orange Clicker loaded!");
```
