const answers = [
    "JUICE",
    "PEELS",
    "RINDS",
    "PULPY",
    "ZESTY",
    "JUICY",
    "GROVE",
    "SWEET",
    "FRUIT",
    "PRESS",
    "SEEDY"
];

const validWords = new Set(answers);

let answer = answers[Math.floor(Math.random() * answers.length)];
let currentGuess = "";
let currentRow = 0;
let gameOver = false;

const board = document.querySelector("#board");
const keyboard = document.querySelector("#keyboard");
const message = document.querySelector("#message");

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

    if (!validWords.has(currentGuess)) {
        showMessage("NOT AN ORANGE WORD!");
        return;
    }

    const result = checkGuess(currentGuess, answer);
    colorRow(result);

    if (currentGuess === answer) {
        showMessage("YOU GOT IT! 🍊");
        gameOver = true;
        return;
    }

    currentRow++;

    if (currentRow >= 6) {
        showMessage(`THE WORD WAS ${answer}`);
        gameOver = true;
        return;
    }

    currentGuess = "";
    updateCurrentRow();
}

function checkGuess(guess, answer) {
    const result = Array(5).fill("wrong");
    const remaining = answer.split("");

    // Correct letters first
    for (let i = 0; i < 5; i++) {
        if (guess[i] === answer[i]) {
            result[i] = "correct";
            remaining[i] = null;
        }
    }

    // Then misplaced letters
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

const orangeMan = document.querySelector("#orange-man");
const thrownOranges = document.querySelectorAll(".thrown-orange");

let orangeManActive = false;

function orangeManChaos() {
    if (gameOver || orangeManActive) return;

    orangeManActive = true;

    orangeMan.style.display = "block";
    orangeMan.style.right = "-180px";

    // Pop the guy onto the screen
    orangeMan.animate(
        [
            { right: "-180px" },
            { right: "20px" }
        ],
        {
            duration: 600,
            easing: "ease-out",
            fill: "forwards"
        }
    );

    // Throw oranges
    thrownOranges.forEach((orange, index) => {
        setTimeout(() => {
            orange.style.display = "block";

            orange.animate(
                [
                    {
                        left: "20px",
                        top: `${45 + index * 30}px`,
                        opacity: 1
                    },
                    {
                        left: "-500px",
                        top: `${20 + index * 80}px`,
                        opacity: 0
                    }
                ],
                {
                    duration: 1000,
                    easing: "linear",
                    fill: "forwards"
                }
            );
        }, 700 + index * 350);
    });

    // Remove him after the chaos
    setTimeout(() => {
        orangeMan.style.display = "none";

        thrownOranges.forEach(orange => {
            orange.style.display = "none";
            orange.getAnimations().forEach(animation => animation.cancel());
        });

        orangeMan.getAnimations().forEach(animation => animation.cancel());

        orangeManActive = false;
    }, 3500);
}

setInterval(() => {
    if (!gameOver && Math.random() < 0.15) {
        orangeManChaos();
    }
}, 10000);
