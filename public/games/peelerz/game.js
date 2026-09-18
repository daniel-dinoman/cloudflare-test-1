const fruitButton = document.querySelector("#fruitButton");
const result = document.querySelector("#result");

const craftButton = document.querySelector("#craftButton");
const craftMenu = document.querySelector("#craftMenu");
const closeCraft = document.querySelector("#closeCraft");

const inventoryElement = document.querySelector("#inventory");

const craftSlots = [
    document.querySelector("#slot1"),
    document.querySelector("#slot2"),
    document.querySelector("#slot3")
];

const craftAction = document.querySelector("#craftAction");

let inventory = {};
let selectedItems = [null, null, null];


// ==============================
// ORANGE DROPS
// ==============================

const orangeDrops = [
    {
        name: "Orange Peel",
        chance: 50
    },
    {
        name: "Orange Seed",
        chance: 25
    },
    {
        name: "Orange Juice",
        chance: 20
    },
    {
        name: "Golden Orange Peel",
        chance: 5
    }
];


// ==============================
// CRAFTING RECIPES
// ==============================

const recipes = [
    {
        ingredients: [
            "Orange Peel",
            "Orange Peel"
        ],
        result: "Orange Strip"
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
            "Orange Pebble",
            "Orange Pebble"
        ],
        result: "Orange Atom"
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
            "Orange Seed",
            "Orange Seed",
            "Orange Seed"
        ],
        result: "Orange Tree"
    },

    {
        ingredients: [
            "Golden Orange Peel",
            "Orange Peel"
        ],
        result: "Golden Orange"
    }
];


// ==============================
// RANDOM DROP
// ==============================

function getRandomDrop() {
    const random = Math.random() * 100;

    let total = 0;

    for (const drop of orangeDrops) {
        total += drop.chance;

        if (random < total) {
            return drop.name;
        }
    }

    return orangeDrops[0].name;
}


// ==============================
// PEEL ORANGE
// ==============================

function peelOrange() {
    const item = getRandomDrop();

    addItem(item);

    result.textContent = `YOU GOT: ${item}!`;

    fruitButton.classList.add("peeling");

    setTimeout(() => {
        fruitButton.classList.remove("peeling");
    }, 300);
}


// ==============================
// INVENTORY
// ==============================

function addItem(item) {
    inventory[item] = (inventory[item] || 0) + 1;

    updateInventory();
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
}


function updateInventory() {
    inventoryElement.innerHTML = "";

    const items = Object.keys(inventory);

    if (items.length === 0) {
        const empty = document.createElement("div");

        empty.className = "empty-inventory";
        empty.textContent = "Nothing here yet!";

        inventoryElement.appendChild(empty);

        return;
    }

    for (const item of items) {
        const button = document.createElement("button");

        button.className = "inventory-item";

        button.textContent =
            `${item} ×${inventory[item]}`;

        button.addEventListener("click", () => {
            addToCrafting(item);
        });

        inventoryElement.appendChild(button);
    }
}


// ==============================
// CRAFTING SLOTS
// ==============================

function addToCrafting(item) {

    const emptySlot = selectedItems.indexOf(null);

    if (emptySlot === -1) {
        result.textContent = "ALL 3 SLOTS ARE FULL!";
        return;
    }

    if (!inventory[item]) {
        return;
    }

    selectedItems[emptySlot] = item;

    removeItem(item);

    updateCraftSlots();
}


function updateCraftSlots() {

    for (let i = 0; i < 3; i++) {

        const slot = craftSlots[i];

        slot.textContent = selectedItems[i] || "";

    }
}


// ==============================
// REMOVE FROM CRAFTING SLOT
// ==============================

craftSlots.forEach((slot, index) => {

    slot.addEventListener("click", () => {

        const item = selectedItems[index];

        if (!item) {
            return;
        }

        addItem(item);

        selectedItems[index] = null;

        updateCraftSlots();
    });

});


// ==============================
// FIND RECIPE
// ==============================

function findRecipe() {

    const ingredients = selectedItems
        .filter(item => item !== null)
        .sort();

    if (ingredients.length === 0) {
        return null;
    }

    for (const recipe of recipes) {

        const recipeIngredients = [...recipe.ingredients]
            .sort();

        if (
            ingredients.length === recipeIngredients.length &&
            ingredients.every(
                (item, index) =>
                    item === recipeIngredients[index]
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

    const recipe = findRecipe();

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

craftButton.addEventListener("click", () => {

    craftMenu.classList.add("open");

    updateInventory();
    updateCraftSlots();

});


closeCraft.addEventListener("click", () => {

    craftMenu.classList.remove("open");

});


// ==============================
// CRAFT BUTTON
// ==============================

craftAction.addEventListener("click", craft);


// ==============================
// FRUIT
// ==============================

fruitButton.addEventListener("click", peelOrange);


// ==============================
// START
// ==============================

updateInventory();
updateCraftSlots();
