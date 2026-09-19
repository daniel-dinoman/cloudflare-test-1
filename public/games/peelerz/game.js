const fruitButton = document.querySelector("#fruitButton");
const result = document.querySelector("#result");

const craftButton = document.querySelector("#craftButton");
const craftMenu = document.querySelector("#craftMenu");
const closeCraft = document.querySelector("#closeCraft");

const inventoryElement = document.querySelector("#inventory");

const previousFruit = document.querySelector("#previousFruit");
const nextFruit = document.querySelector("#nextFruit");
const fruitName = document.querySelector("#fruitName");

const craftSlots = [
    document.querySelector("#slot1"),
    document.querySelector("#slot2"),
    document.querySelector("#slot3")
];

const craftAction = document.querySelector("#craftAction");

let inventory = {};
let selectedItems = [null, null, null];


// ==============================
// SAVE DATA
// ==============================

const SAVE_KEY = "peelerzSave";

function saveGame() {

    const saveData = {
        inventory: inventory,
        currentFruitIndex: currentFruitIndex
    };

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(saveData)
    );
}

function loadGame() {

    const savedData = localStorage.getItem(SAVE_KEY);

    if (!savedData) {
        return;
    }

    try {

        const data = JSON.parse(savedData);

        if (
            data.inventory &&
            typeof data.inventory === "object"
        ) {
            inventory = data.inventory;
        }

        if (
            typeof data.currentFruitIndex === "number" &&
            data.currentFruitIndex >= 0 &&
            data.currentFruitIndex < fruits.length
        ) {
            currentFruitIndex = data.currentFruitIndex;
        }

    } catch (error) {

        console.error(
            "Failed to load Peelerz save:",
            error
        );

    }
}


// ==============================
// FRUITS
// ==============================

const fruits = [
    "orange",
    "potato",
    "banana"
];

let currentFruitIndex = 0;


// ==============================
// ORANGE DROPS
// ==============================

const orangeDrops = [

    {
        name: "Orange Peel",
        chance: 40
    },

    {
        name: "Orange Seed",
        chance: 20
    },

    {
        name: "Orange Juice",
        chance: 20
    },

    {
        name: "Golden Orange Peel",
        chance: 5
    },

    {
        name: "EVIL Orange Peel",
        chance: 15
    }

];


// ==============================
// POTATO DROPS
// ==============================

const potatoDrops = [

    {
        name: "Potato Peel",
        chance: 45
    },

    {
        name: "Potato",
        chance: 30
    },

    {
        name: "Potato Sprout",
        chance: 15
    },

    {
        name: "Golden Potato Peel",
        chance: 5
    },

    {
        name: "EVIL Potato Peel",
        chance: 5
    }

];


// ==============================
// BANANA DROPS
// ==============================

const bananaDrops = [

    {
        name: "Banana Peel",
        chance: 45
    },

    {
        name: "Banana",
        chance: 30
    },

    {
        name: "Banana Seed",
        chance: 15
    },

    {
        name: "Golden Banana Peel",
        chance: 5
    },

    {
        name: "EVIL Banana Peel",
        chance: 5
    }

];


// ==============================
// CRAFTING RECIPES
// ==============================

const recipes = [

    // ==========================
    // ORANGE
    // ==========================

    {
        ingredients: [
            "Orange Peel",
            "Orange Peel"
        ],
        result: "Orange Strip"
    },

    {
        ingredients: [
            "EVIL Orange Peel",
            "EVIL Orange Peel"
        ],
        result: "EVIL Orange Strip"
    },

    {
        ingredients: [
            "Orange Peel",
            "Golden Orange Peel",
            "Orange Peel"
        ],
        result: "Orange Peel Fusion"
    },

    {
        ingredients: [
            "EVIL Orange Peel",
            "Golden Orange Peel",
            "EVIL Orange Peel"
        ],
        result: "EVIL Orange Peel Fusion"
    },

    {
        ingredients: [
            "Orange Strip",
            "Orange Strip"
        ],
        result: "Orange Pebble"
    },

    {
        ingredients: [
            "Orange Atom",
            "Orange Pebble"
        ],
        result: "Orange Air"
    },

    {
        ingredients: [
            "EVIL Orange Atom",
            "EVIL Orange Pebble"
        ],
        result: "EVIL Orange Air"
    },

    {
        ingredients: [
            "EVIL Orange Strip",
            "EVIL Orange Strip"
        ],
        result: "EVIL Orange Pebble"
    },

    {
        ingredients: [
            "Orange Pebble",
            "Orange Pebble"
        ],
        result: "Orange Atom"
    },

    {
        ingredients: [
            "EVIL Orange Pebble",
            "EVIL Orange Pebble"
        ],
        result: "EVIL Orange Atom"
    },

    {
        ingredients: [
            "Orange Atom",
            "Orange Atom"
        ],
        result: "Orange Nothing"
    },

    {
        ingredients: [
            "EVIL Orange Atom",
            "EVIL Orange Atom"
        ],
        result: "EVIL Orange Nothing"
    },

    {
        ingredients: [
            "Orange Peel",
            "Orange Seed"
        ],
        result: "Orange Sprout"
    },

    {
        ingredients: [
            "Orange Juice",
            "Orange Peel"
        ],
        result: "Orange Soda"
    },

    {
        ingredients: [
            "Orange Juice",
            "Golden Orange Peel"
        ],
        result: "Golden Orange Soda"
    },

    {
        ingredients: [
            "Orange Soda",
            "Golden Orange Soda"
        ],
        result: "SUPER Orange Soda"
    },

    {
        ingredients: [
            "Orange Seed",
            "Orange Seed"
        ],
        result: "Orange Plant"
    },

    {
        ingredients: [
            "Orange Plant",
            "Orange Plant"
        ],
        result: "Orange Tree"
    },

    {
        ingredients: [
            "Golden Orange Peel",
            "Orange Peel"
        ],
        result: "Golden Orange"
    },


    // ==========================
    // POTATO
    // ==========================

    {
        ingredients: [
            "Potato Peel",
            "Potato Peel"
        ],
        result: "Potato Strip"
    },

    {
        ingredients: [
            "Potato",
            "Potato Peel"
        ],
        result: "Mashed Potato"
    },

    {
        ingredients: [
            "Potato",
            "Potato",
            "Potato"
        ],
        result: "Potato Mountain"
    },

    {
        ingredients: [
            "Potato Sprout",
            "Potato Sprout"
        ],
        result: "Potato Plant"
    },

    {
        ingredients: [
            "Potato Plant",
            "Potato Plant"
        ],
        result: "Potato Farm"
    },

    {
        ingredients: [
            "Golden Potato Peel",
            "Potato Peel"
        ],
        result: "Golden Potato"
    },

    {
        ingredients: [
            "EVIL Potato Peel",
            "EVIL Potato Peel"
        ],
        result: "EVIL Potato Strip"
    },


    // ==========================
    // BANANA
    // ==========================

    {
        ingredients: [
            "Banana Peel",
            "Banana Peel"
        ],
        result: "Banana Strip"
    },

    {
        ingredients: [
            "Banana",
            "Banana Peel"
        ],
        result: "Banana Mash"
    },

    {
        ingredients: [
            "Banana Seed",
            "Banana Seed"
        ],
        result: "Banana Plant"
    },

    {
        ingredients: [
            "Banana Plant",
            "Banana Plant"
        ],
        result: "Banana Tree"
    },

    {
        ingredients: [
            "Golden Banana Peel",
            "Banana Peel"
        ],
        result: "Golden Banana"
    },

    {
        ingredients: [
            "EVIL Banana Peel",
            "EVIL Banana Peel"
        ],
        result: "EVIL Banana Strip"
    },


    // ==========================
    // CROSS-FRUIT RECIPES
    // ==========================

    {
        ingredients: [
            "Orange Peel",
            "Banana Peel"
        ],
        result: "Orange Banana"
    },

    {
        ingredients: [
            "Orange Peel",
            "Potato Peel"
        ],
        result: "Orange Potato"
    },

    {
        ingredients: [
            "Banana Peel",
            "Potato Peel"
        ],
        result: "Banana Potato"
    },

    {
        ingredients: [
            "Orange Juice",
            "Banana"
        ],
        result: "Orange Banana Juice"
    },

    {
        ingredients: [
            "Potato",
            "Orange Peel",
            "Banana Peel"
        ],
        result: "FRUIT POTATO"
    }

];


// ==============================
// CURRENT FRUIT
// ==============================

function getCurrentFruit() {

    return fruits[currentFruitIndex];

}


// ==============================
// GET CURRENT DROPS
// ==============================

function getCurrentDrops() {

    const fruit = getCurrentFruit();

    if (fruit === "orange") {
        return orangeDrops;
    }

    if (fruit === "potato") {
        return potatoDrops;
    }

    if (fruit === "banana") {
        return bananaDrops;
    }

}


// ==============================
// RANDOM DROP
// ==============================

function getRandomDrop() {

    const drops = getCurrentDrops();

    const random =
        Math.random() * 100;

    let total = 0;

    for (const drop of drops) {

        total += drop.chance;

        if (random < total) {

            return drop.name;

        }

    }

    return drops[0].name;

}


// ==============================
// PEEL FRUIT
// ==============================

function peelFruit() {

    const item = getRandomDrop();

    addItem(item);

    result.textContent =
        `YOU GOT: ${item}!`;

    fruitButton.classList.add("peeling");

    setTimeout(() => {

        fruitButton.classList.remove("peeling");

    }, 300);

}


// ==============================
// UPDATE FRUIT
// ==============================

function updateFruit() {

    const fruit = getCurrentFruit();

    fruitName.textContent =
        fruit.toUpperCase();

    fruitButton.setAttribute(
        "aria-label",
        `Peel ${fruit}`
    );


    // Remove old fruit

    fruitButton.innerHTML = "";


    // ==========================
    // ORANGE
    // ==========================

    if (fruit === "orange") {

        const orange =
            document.createElement("div");

        orange.className = "orange";

        const leaf =
            document.createElement("div");

        leaf.className = "orange-leaf";

        orange.appendChild(leaf);

        fruitButton.appendChild(orange);

    }


    // ==========================
    // POTATO
    // ==========================

    if (fruit === "potato") {

        const potato =
            document.createElement("div");

        potato.className = "potato";

        fruitButton.appendChild(potato);

    }


    // ==========================
    // BANANA
    // ==========================

    if (fruit === "banana") {

        const banana =
            document.createElement("div");

        banana.className = "banana";

        fruitButton.appendChild(banana);

    }

}


// ==============================
// PREVIOUS FRUIT
// ==============================

previousFruit.addEventListener(
    "click",
    () => {

        currentFruitIndex--;

        if (currentFruitIndex < 0) {

            currentFruitIndex =
                fruits.length - 1;

        }

        updateFruit();

        result.textContent =
            `NOW PEELING: ${getCurrentFruit().toUpperCase()}`;

        saveGame();

    }
);


// ==============================
// NEXT FRUIT
// ==============================

nextFruit.addEventListener(
    "click",
    () => {

        currentFruitIndex++;

        if (
            currentFruitIndex >=
            fruits.length
        ) {

            currentFruitIndex = 0;

        }

        updateFruit();

        result.textContent =
            `NOW PEELING: ${getCurrentFruit().toUpperCase()}`;

        saveGame();

    }
);


// ==============================
// INVENTORY
// ==============================

function addItem(item) {

    inventory[item] =
        (inventory[item] || 0) + 1;

    updateInventory();

    saveGame();

}


function removeItem(item) {

    if (!inventory[item]) {
        return;
    }

    inventory[item]--;

    if (inventory[item] <= 0) {

        delete inventory[item];

    }

    updateInventory();

    saveGame();

}


function updateInventory() {

    inventoryElement.innerHTML = "";

    const items =
        Object.keys(inventory);

    if (items.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-inventory";

        empty.textContent =
            "Nothing here yet!";

        inventoryElement.appendChild(empty);

        return;

    }


    for (const item of items) {

        const button =
            document.createElement("button");

        button.className =
            "inventory-item";

        button.textContent =
            `${item} ×${inventory[item]}`;

        button.addEventListener(
            "click",
            () => {

                addToCrafting(item);

            }
        );

        inventoryElement.appendChild(button);

    }

}


// ==============================
// CRAFTING SLOTS
// ==============================

function addToCrafting(item) {

    const emptySlot =
        selectedItems.indexOf(null);

    if (emptySlot === -1) {

        result.textContent =
            "ALL 3 SLOTS ARE FULL!";

        return;

    }

    if (!inventory[item]) {
        return;
    }

    selectedItems[emptySlot] =
        item;

    removeItem(item);

    updateCraftSlots();

}


// ==============================
// UPDATE CRAFT SLOTS
// ==============================

function updateCraftSlots() {

    for (let i = 0; i < 3; i++) {

        const slot =
            craftSlots[i];

        slot.textContent =
            selectedItems[i] || "";

    }

}


// ==============================
// REMOVE FROM CRAFTING SLOT
// ==============================

craftSlots.forEach(
    (slot, index) => {

        slot.addEventListener(
            "click",
            () => {

                const item =
                    selectedItems[index];

                if (!item) {
                    return;
                }

                addItem(item);

                selectedItems[index] =
                    null;

                updateCraftSlots();

            }
        );

    }
);


// ==============================
// FIND RECIPE
// ==============================

function findRecipe() {

    const ingredients =
        selectedItems
            .filter(
                item => item !== null
            )
            .sort();

    if (ingredients.length === 0) {

        return null;

    }

    for (const recipe of recipes) {

        const recipeIngredients =
            [...recipe.ingredients]
                .sort();

        if (
            ingredients.length ===
            recipeIngredients.length &&

            ingredients.every(
                (item, index) =>
                    item ===
                    recipeIngredients[index]
            )
        ) {

            return recipe;

        }

    }

    return null;

}


// ==============================
// CRAFT
// ==============================

function craft() {

    const recipe =
        findRecipe();

    if (!recipe) {

        result.textContent =
            "THAT DOESN'T MAKE ANYTHING!";

        return;

    }

    addItem(recipe.result);

    selectedItems = [
        null,
        null,
        null
    ];

    updateCraftSlots();

    result.textContent =
        `CRAFTED: ${recipe.result}!`;

}


// ==============================
// CRAFTING MENU
// ==============================

craftButton.addEventListener(
    "click",
    () => {

        craftMenu.classList.add("open");

        updateInventory();
        updateCraftSlots();

    }
);


closeCraft.addEventListener(
    "click",
    () => {

        craftMenu.classList.remove("open");

    }
);


// ==============================
// CRAFT BUTTON
// ==============================

craftAction.addEventListener(
    "click",
    craft
);


// ==============================
// FRUIT BUTTON
// ==============================

fruitButton.addEventListener(
    "click",
    peelFruit
);


// ==============================
// AUTOSAVE
// ==============================

setInterval(
    () => {

        saveGame();

    },
    5000
);


// ==============================
// SAVE WHEN LEAVING
// ==============================

window.addEventListener(
    "beforeunload",
    () => {

        saveGame();

    }
);


// ==============================
// START
// ==============================

loadGame();

updateInventory();
updateCraftSlots();
updateFruit();
