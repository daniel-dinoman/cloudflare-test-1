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

// Rotten clue
let rottenClue = null;

// Store the TRUE results of every submitted row
const trueRows = [];

const board = document.querySelector("#board");
const keyboard = document.querySelector("#keyboard");
const message = document.querySelector("#message");
const rottenMessage = document.querySelector("#rotten-message");

// Response text
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

        button.addEventListener("click", () => {
            handleKey(key);
        });

        keyboardRow.appendChild(button);
    }

    keyboard.appendChild(keyboardRow);
}


// Handle keyboard
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


// Update current row
function updateCurrentRow() {

    for (let col = 0; col < 5; col++) {

        const tile = document.querySelector(
            `.tile[data-row="${currentRow}"][data-col="${col}"]`
        );

        tile.textContent = currentGuess[col] || "";
    }
}


// Submit guess
function submitGuess() {

    if (currentGuess.length !== 5) {

        showMessage("NEED 5 LETTERS!");

        return;
    }


    /*
        If there was a rotten clue from the previous guess,
        reveal it BEFORE processing the new guess.
    */

    if (rottenClue) {

        revealRottenClue();

        rottenClue = null;
    }


    reactToGuess(currentGuess);


    // Calculate the REAL result
    const trueResult = checkGuess(currentGuess, answer);

    trueRows[currentRow] = {
        guess: currentGuess,
        result: [...trueResult]
    };


    /*
        Sometimes a clue rots.

        It can only lie about a letter that is NOT actually correct.
        This means a genuinely correct letter will never be made false.
    */

    let displayedResult = [...trueResult];

    if (Math.random() < 0.30) {

        const possibleIndexes = [];

        for (let i = 0; i < 5; i++) {

            if (trueResult[i] !== "correct") {
                possibleIndexes.push(i);
            }
        }


        if (possibleIndexes.length > 0) {

            const index =
                possibleIndexes[
                    Math.floor(Math.random() * possibleIndexes.length)
                ];


            let fakeResult;


            if (trueResult[index] === "wrong") {

                // Wrong letter pretends to be wrong-place
                fakeResult = "wrong-place";

            } else {

                // Wrong-place letter pretends to be correct
                fakeResult = "correct";
            }


            displayedResult[index] = fakeResult;


            rottenClue = {
                row: currentRow,
                col: index,
                trueResult: trueResult[index],
                fakeResult: fakeResult
            };
        }
    }


    colorRow(displayedResult);


    // Correct answer
    if (currentGuess === answer) {

        showMessage("YOU GOT IT! 🍊");

        response.textContent = "orange 👍";

        gameOver = true;

        // If this guess had a rotten clue, reveal it immediately
        if (rottenClue) {

            revealRottenClue();

            rottenClue = null;
        }

        return;
    }


    currentRow++;


    // Ran out of guesses
    if (currentRow >= 6) {

        showMessage(`THE WORD WAS ${answer}`);

        response.textContent = "the orange has won.";

        gameOver = true;

        return;
    }


    currentGuess = "";

    updateCurrentRow();
}


// Check REAL Wordle result
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

        if (result[i] === "correct") {
            continue;
        }

        const index = remaining.indexOf(guess[i]);

        if (index !== -1) {

            result[i] = "wrong-place";

            remaining[index] = null;
        }
    }


    return result;
}


// Color a row
function colorRow(result) {

    for (let col = 0; col < 5; col++) {

        const tile = document.querySelector(
            `.tile[data-row="${currentRow}"][data-col="${col}"]`
        );


        tile.classList.remove(
            "correct",
            "wrong-place",
            "wrong"
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


// Reveal the rotten clue
function revealRottenClue() {

    if (!rottenClue) {
        return;
    }


    const row = rottenClue.row;
    const col = rottenClue.col;


    const tile = document.querySelector(
        `.tile[data-row="${row}"][data-col="${col}"]`
    );


    if (!tile) {
        return;
    }


    // Remove the fake result
    tile.classList.remove(
        "correct",
        "wrong-place",
        "wrong"
    );


    // Put the REAL result back
    tile.classList.add(rottenClue.trueResult);


    // Get the letter from that row
    const guess = trueRows[row].guess;
    const letter = guess[col];


    /*
        Recalculate the keyboard from every REAL result.
        This fixes the keyboard if the rotten clue changed
        how a letter looked.
    */

    rebuildKeyboard();


    rottenMessage.textContent =
        `🍊 ROTTEN CLUE! The ${letter} was lying to you!`;


    setTimeout(() => {

        if (
            rottenMessage.textContent ===
            `🍊 ROTTEN CLUE! The ${letter} was lying to you!`
        ) {
            rottenMessage.textContent = "";
        }

    }, 2500);
}


// Rebuild keyboard using TRUE information
function rebuildKeyboard() {

    const buttons = [...document.querySelectorAll(".key")];

    for (const button of buttons) {

        if (
            button.textContent === "ENTER" ||
            button.textContent === "⌫"
        ) {
            continue;
        }


        button.classList.remove(
            "correct",
            "wrong-place",
            "wrong"
        );
    }


    for (let row = 0; row < trueRows.length; row++) {

        const data = trueRows[row];

        if (!data) {
            continue;
        }


        for (let i = 0; i < 5; i++) {

            const letter = data.guess[i];

            const button = buttons.find(
                btn => btn.textContent === letter
            );


            if (!button) {
                continue;
            }


            const result = data.result[i];


            if (result === "correct") {

                button.classList.remove("wrong-place");
                button.classList.remove("wrong");

                button.classList.add("correct");

            } else if (
                result === "wrong-place" &&
                !button.classList.contains("correct")
            ) {

                button.classList.remove("wrong");

                button.classList.add("wrong-place");

            } else if (
                result === "wrong" &&
                !button.classList.contains("correct") &&
                !button.classList.contains("wrong-place")
            ) {

                button.classList.add("wrong");
            }
        }
    }
}


// Funny reaction
function reactToGuess(guess) {

    let options = reactions[guess];


    if (!options) {
        options = randomReactions;
    }


    const reaction =
        options[
            Math.floor(Math.random() * options.length)
        ];


    response.textContent = reaction;
}


// Temporary message
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
