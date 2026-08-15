import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const currentPlatform =
    document.body.dataset.platform;

const gameGrid =
    document.getElementById("gameGrid");

const gamesTitle =
    document.getElementById("gamesTitle");

const filterButtons =
    document.querySelectorAll(".filter");


let platformGames = [];

let currentFilter = "topRated";


// ==========================
// LOAD GAMES
// ==========================

async function loadGames() {

    try {

        gameGrid.innerHTML =
            "<p>Loading games...</p>";


        const snapshot =
            await getDocs(
                collection(db, "games")
            );


        platformGames = [];


        snapshot.forEach(doc => {

            const game = doc.data();


            if (
                game.platforms &&
                game.platforms.includes(
                    currentPlatform
                )
            ) {

                platformGames.push({

                    id: doc.id,

                    ...game

                });

            }

        });


        renderGames();

    }

    catch (error) {

        console.error(
            "Game loading error:",
            error
        );


        gameGrid.innerHTML = `
            <p class="no-games">
                Failed to load games.
            </p>
        `;

    }

}


// ==========================
// RENDER GAMES
// ==========================

function renderGames() {

    let filteredGames =
        [...platformGames];


    // ==========================
    // TOP RATED
    // ==========================

    if (
        currentFilter ===
        "topRated"
    ) {

        filteredGames.sort(
            (a, b) =>
                Number(b.rating || 0) -
                Number(a.rating || 0)
        );

        gamesTitle.textContent =
            `Top Rated ${currentPlatform} Games`;

    }


    // ==========================
    // NEW
    // ==========================

    else if (
        currentFilter ===
        "new"
    ) {

        filteredGames.sort(
            (a, b) =>
                new Date(
                    b.releaseDate || 0
                ) -
                new Date(
                    a.releaseDate || 0
                )
        );

        gamesTitle.textContent =
            `New ${currentPlatform} Games`;

    }


    // ==========================
    // UPCOMING
    // ==========================

    else if (
        currentFilter ===
        "upcoming"
    ) {

        filteredGames =
            filteredGames.filter(
                game =>
                    game.status ===
                    "Upcoming"
            );


        filteredGames.sort(
            (a, b) =>
                new Date(
                    a.releaseDate || 0
                ) -
                new Date(
                    b.releaseDate || 0
                )
        );


        gamesTitle.textContent =
            `Upcoming ${currentPlatform} Games`;

    }


    // ==========================
    // ALL
    // ==========================

    else {

        gamesTitle.textContent =
            `All ${currentPlatform} Games`;

    }


    gameGrid.innerHTML = "";


    // ==========================
    // NO RESULTS
    // ==========================

    if (
        filteredGames.length === 0
    ) {

        gameGrid.innerHTML = `

            <p class="no-games">
                No games found.
            </p>

        `;

        return;

    }


    // ==========================
    // CREATE CARDS
    // ==========================

    filteredGames.forEach(
        game => {

            gameGrid.innerHTML += `

                <div
                    class="game-card"
                    onclick="openGame('${game.id}')"
                >

                    <img
                        class="game-image"
                        src="${
                            game.image ||
                            "images/game.jpg"
                        }"
                        alt="${game.name}"
                        loading="lazy"
                    >

                    <div class="game-card-content">

                        <h3>
                            ${game.name}
                        </h3>

                        <p>
                            🎮 ${currentPlatform}
                        </p>

                        ${
                            game.rating
                            ?
                            `
                            <span class="game-rating">
                                ⭐ ${game.rating}/10
                            </span>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            `;

        }
    );

}


// ==========================
// FILTER BUTTONS
// ==========================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                renderGames();

            }
        );

    }
);


// ==========================
// OPEN GAME
// ==========================

window.openGame =
function(id) {

    window.location.href =
        `game.html?id=${encodeURIComponent(id)}`;

};


// ==========================
// START
// ==========================

loadGames();