const answers = [
    "APPLE",
    "HOUSE",
    "HORSE",
    "CRANE",
    "SLATE",
    "STARE",
    "PLANT",
    "WATER",
    "WORLD",
    "BREAD",
    "SHEEP",
    "MOUSE",
    "LIGHT",
    "STONE",
    "CLOUD"
];

let answer = answers[Math.floor(Math.random() * answers.length)];

let currentGuess = "";
let currentRow = 0;
let gameOver = false;

const board = document.querySelector("#board");
const keyboard = document.querySelector("#keyboard");
const message = document.querySelector("#message");

// Create response text
const response = document.createElement("div");
response.id = "response";
response.textContent = "";
document.querySelector(".game").appendChild(response);

// Funny reactions
const reactions = {
    HORSE: [
        "why did you guess horse",
        "this isn't horsle",
        "bro thinks this is HORSLE",
        "neigh"
    ],

    APPLE: [
        "WRONG FRUIT.",
        "that's an apple",
        "get that thing out of here",
        "🍎 detected. unacceptable."
    ],

    ORANGE: [
        "that's literally me",
        "ORANGE.",
        "bro guessed the game's name",
        "okay genius"
    ],

    HOUSE: [
        "nice house",
        "why are we talking about houses",
        "cool house bro"
    ],

    SHEEP: [
        "🐑",
        "why sheep",
        "baa"
    ],

    MOUSE: [
        "🐭",
        "mouse detected",
        "squeak"
    ]
};

const randomReactions = [
    "interesting.",
    "okay.",
    "sure bro",
    "why.",
    "alright then",
    "I don't know what to say to that",
    "that's certainly a word",
    "noted.",
    "fascinating.",
    "you really typed that",
    "okay buddy",
    "hmm.",
    "moving on...",
    "what",
    "👍",
    "orange"
];

const keys = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["ENTER","Z","X","C","V","B","N","M","BACK"]
];

// Create board
for (let row = 0; row < 6; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    for (let col = 0; col < 5; col++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset.row = row;
        tile.dataset.col = col;
        rowDiv.appendChild(tile);
    }

    board.appendChild(rowDiv);
}

// Create keyboard
for (const row of keys) {
    const keyboardRow = document.createElement("div");
    keyboardRow.className = "keyboard-row";

    for (const key of row) {
        const button = document.createElement("button");
        button.className = "key";
        button.textContent = key;

        if (key === "ENTER") {
            button.classList.add("wide");
        }

        if (key === "BACK") {
            button.textContent = "⌫";
            button.classList.add("wide");
        }

        button.addEventListener("click", () => handleKey(key));

        keyboardRow.appendChild(button);
    }

    keyboard.appendChild(keyboardRow);
    }

function handleKey(key) {
    if (gameOver) return;

    if (key === "BACK") {
        currentGuess = currentGuess.slice(0, -1);
        updateCurrentRow();
        return;
    }

    if (key === "ENTER") {
        submitGuess();
        return;
    }

    if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        currentGuess += key;
        updateCurrentRow();
    }
}

function updateCurrentRow() {
    for (let col = 0; col < 5; col++) {
        const tile = document.querySelector(
            `.tile[data-row="${currentRow}"][data-col="${col}"]`
        );

        tile.textContent = currentGuess[col] || "";
    }
}

function submitGuess() {
    if (currentGuess.length !== 5) {
        showMessage("NEED 5 LETTERS!");
        return;
    }

    // React to the guess
    reactToGuess(currentGuess);

    const result = checkGuess(currentGuess, answer);
    colorRow(result);

    if (currentGuess === answer) {
        showMessage("YOU GOT IT! 🍊");
        response.textContent = "orange 👍";
        gameOver = true;
        return;
    }

    currentRow++;

    if (currentRow >= 6) {
        showMessage(`THE WORD WAS ${answer}`);
        response.textContent = "the orange has won.";
        gameOver = true;
        return;
    }

    currentGuess = "";
    updateCurrentRow();
}

function checkGuess(guess, answer) {
    const result = Array(5).fill("wrong");
    const remaining = answer.split("");

    // Correct letters
    for (let i = 0; i < 5; i++) {
        if (guess[i] === answer[i]) {
            result[i] = "correct";
            remaining[i] = null;
        }
    }

    // Wrong position
    for (let i = 0; i < 5; i++) {
        if (result[i] === "correct") continue;

        const index = remaining.indexOf(guess[i]);

        if (index !== -1) {
            result[i] = "wrong-place";
            remaining[index] = null;
        }
    }

    return result;
}

function colorRow(result) {
    for (let col = 0; col < 5; col++) {
        const tile = document.querySelector(
            `.tile[data-row="${currentRow}"][data-col="${col}"]`
        );

        tile.classList.add(result[col]);

        const letter = currentGuess[col];

        const button = [...document.querySelectorAll(".key")]
            .find(btn => btn.textContent === letter);

        if (button) {
            if (result[col] === "correct") {
                button.classList.remove("wrong-place");
                button.classList.add("correct");
            } else if (
                result[col] === "wrong-place" &&
                !button.classList.contains("correct")
            ) {
                button.classList.add("wrong-place");
            } else if (
                result[col] === "wrong" &&
                !button.classList.contains("correct") &&
                !button.classList.contains("wrong-place")
            ) {
                button.classList.add("wrong");
            }
        }
    }
}

function reactToGuess(guess) {
    let options = reactions[guess];

    if (!options) {
        options = randomReactions;
    }

    const reaction =
        options[Math.floor(Math.random() * options.length)];

    response.textContent = reaction;
}

function showMessage(text) {
    message.textContent = text;

    setTimeout(() => {
        if (message.textContent === text) {
            message.textContent = "";
        }
    }, 2000);
}

// Physical keyboard
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleKey("ENTER");
        return;
    }

    if (event.key === "Backspace") {
        handleKey("BACK");
        return;
    }

    const key = event.key.toUpperCase();

    if (/^[A-Z]$/.test(key)) {
        handleKey(key);
    }
});
