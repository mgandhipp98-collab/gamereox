// ==================================================
// GameReox - Games System
// Firebase Firestore
// Pagination + Automatic New/Upcoming + Game Details
// ==================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==================================================
// PAGE ELEMENTS
// ==================================================

const currentPlatform =
    document.body.dataset.platform || "";

const gameGrid =
    document.getElementById("gameGrid");

const gamesTitle =
    document.getElementById("gamesTitle");

const pagination =
    document.getElementById("pagination");

const filterButtons =
    document.querySelectorAll(".filter");


// ==================================================
// GAME DETAIL DETECTION
// ==================================================

const gameId =
    new URLSearchParams(
        window.location.search
    ).get("id");


console.log(
    "GameReox games.js loaded."
);


// ==================================================
// VARIABLES
// ==================================================

let allGames = [];

let currentFilter =
    "topRated";

let currentPage =
    1;

const gamesPerPage =
    20;


// ==================================================
// NEW GAME PERIOD
// ==================================================

const NEW_GAME_DAYS = 30;


// ==================================================
// GAME DETAIL PAGE URL
// ==================================================
//
// IMPORTANT:
// Change this ONLY if your game.html is
// located somewhere else.
//
// Example:
// ./game.html
//
// ==================================================

const GAME_PAGE =
    "./game.html";


// ==================================================
// START
// ==================================================

if (gameId) {

    console.log(
        "GameReox: Loading game:",
        gameId
    );

    loadGamePage(
        gameId
    );

}

else if (gameGrid) {

    console.log(
        "GameReox: Loading games page."
    );

    loadGames();

}

else {

    console.log(
        "GameReox: No games page detected."
    );

}


// ==================================================
// LOAD GAMES
// ==================================================

async function loadGames() {

    if (!gameGrid) {
        return;
    }


    gameGrid.innerHTML = `
        <p class="loading-games">
            Loading games...
        </p>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "games"
                )
            );


        allGames = [];


        snapshot.forEach(
            gameDoc => {

                const game =
                    gameDoc.data();


                // ----------------------------------
                // PLATFORM FILTERING
                // ----------------------------------

                if (
                    currentPlatform
                ) {

                    const platforms =
                        Array.isArray(
                            game.platforms
                        )
                            ? game.platforms
                            : [];


                    const matches =
                        platforms.some(
                            platform => {

                                return (
                                    String(
                                        platform
                                    )
                                    .trim()
                                    .toLowerCase()

                                    ===

                                    String(
                                        currentPlatform
                                    )
                                    .trim()
                                    .toLowerCase()
                                );

                            }
                        );


                    if (!matches) {
                        return;
                    }

                }


                allGames.push({

                    id:
                        gameDoc.id,

                    ...game

                });

            }
        );


        console.log(
            "GameReox: Games found:",
            allGames.length
        );


        currentPage = 1;

        renderGames();

    }

    catch (error) {

        console.error(
            "GameReox Firebase error:",
            error
        );


        gameGrid.innerHTML = `
            <p class="no-games">
                Failed to load games.
            </p>
        `;

    }

}


// ==================================================
// PARSE LOCAL DATE
// ==================================================

function parseLocalDate(
    value
) {

    if (!value) {

        return new Date(
            "invalid"
        );

    }


    const parts =
        String(value).split("-");


    if (
        parts.length !== 3
    ) {

        return new Date(
            "invalid"
        );

    }


    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

}


// ==================================================
// GET GAME STATUS AUTOMATICALLY
// ==================================================

function getGameStatus(
    game
) {

    if (
        !game.releaseDate
    ) {

        return "released";

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const releaseDate =
        parseLocalDate(
            game.releaseDate
        );


    if (
        Number.isNaN(
            releaseDate.getTime()
        )
    ) {

        return "released";

    }


    releaseDate.setHours(
        0,
        0,
        0,
        0
    );


    // ----------------------------------
    // UPCOMING
    // ----------------------------------

    if (
        releaseDate > today
    ) {

        return "upcoming";

    }


    // ----------------------------------
    // NEW
    // ----------------------------------

    const newUntil =
        new Date(
            releaseDate
        );


    newUntil.setDate(
        newUntil.getDate() +
        NEW_GAME_DAYS
    );


    newUntil.setHours(
        23,
        59,
        59,
        999
    );


    if (
        today <= newUntil
    ) {

        return "new";

    }


    // ----------------------------------
    // RELEASED
    // ----------------------------------

    return "released";

}


// ==================================================
// FILTER
// ==================================================

function getFilteredGames() {

    let games =
        [...allGames];


    // ----------------------------------
    // TOP RATED
    // ----------------------------------

    if (
        currentFilter ===
        "topRated"
    ) {

        games.sort(
            (a, b) => {

                return (
                    Number(
                        b.rating || 0
                    )

                    -

                    Number(
                        a.rating || 0
                    )
                );

            }
        );

    }


    // ----------------------------------
    // NEW
    // ----------------------------------

    else if (
        currentFilter ===
        "new"
    ) {

        games =
            games.filter(
                game => {

                    return (
                        getGameStatus(
                            game
                        ) === "new"
                    );

                }
            );


        games.sort(
            (a, b) => {

                return (
                    parseLocalDate(
                        b.releaseDate
                    )

                    -

                    parseLocalDate(
                        a.releaseDate
                    )
                );

            }
        );

    }


    // ----------------------------------
    // UPCOMING
    // ----------------------------------

    else if (
        currentFilter ===
        "upcoming"
    ) {

        games =
            games.filter(
                game => {

                    return (
                        getGameStatus(
                            game
                        ) === "upcoming"
                    );

                }
            );


        games.sort(
            (a, b) => {

                return (
                    parseLocalDate(
                        a.releaseDate
                    )

                    -

                    parseLocalDate(
                        b.releaseDate
                    )
                );

            }
        );

    }


    // ----------------------------------
    // ALL
    // ----------------------------------

    else {

        games.sort(
            (a, b) => {

                return String(
                    a.name || ""
                )
                .localeCompare(
                    String(
                        b.name || ""
                    )
                );

            }
        );

    }


    return games;

}


// ==================================================
// OPEN GAME PAGE
// ==================================================

function openGamePage(
    id
) {

    if (!id) {

        console.error(
            "GameReox: Missing game ID."
        );

        return;

    }


    const encodedId =
        encodeURIComponent(
            String(id)
        );


    // ----------------------------------
    // Build URL safely
    // ----------------------------------

    const gameURL =
        new URL(
            GAME_PAGE,
            window.location.href
        );


    gameURL.searchParams.set(
        "id",
        String(id)
    );


    console.log(
        "GameReox: Opening game:",
        id
    );


    console.log(
        "GameReox: Game URL:",
        gameURL.href
    );


    window.location.assign(
        gameURL.href
    );

}


// ==================================================
// RENDER GAMES
// ==================================================

function renderGames() {

    if (!gameGrid) {
        return;
    }


    const filteredGames =
        getFilteredGames();


    // ----------------------------------
    // TITLE
    // ----------------------------------

    if (gamesTitle) {

        const platformText =
            currentPlatform
                ? ` ${currentPlatform}`
                : "";


        if (
            currentFilter ===
            "topRated"
        ) {

            gamesTitle.textContent =
                `Top Rated${platformText} Games`;

        }

        else if (
            currentFilter ===
            "new"
        ) {

            gamesTitle.textContent =
                `New${platformText} Games`;

        }

        else if (
            currentFilter ===
            "upcoming"
        ) {

            gamesTitle.textContent =
                `Upcoming${platformText} Games`;

        }

        else {

            gamesTitle.textContent =
                `All${platformText} Games`;

        }

    }


    // ----------------------------------
    // NO GAMES
    // ----------------------------------

    if (
        !filteredGames.length
    ) {

        gameGrid.innerHTML = `
            <p class="no-games">
                No games found.
            </p>
        `;


        renderPagination(
            0
        );


        return;

    }


    // ----------------------------------
    // PAGINATION
    // ----------------------------------

    const totalPages =
        Math.ceil(
            filteredGames.length /
            gamesPerPage
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (
            currentPage - 1
        ) *
        gamesPerPage;


    const end =
        start +
        gamesPerPage;


    const pageGames =
        filteredGames.slice(
            start,
            end
        );


    // ----------------------------------
    // CLEAR
    // ----------------------------------

    gameGrid.innerHTML =
        "";


    // ----------------------------------
    // CARDS
    // ----------------------------------

    pageGames.forEach(
        game => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "game-card";


            // ==================================
            // CARD CLICK
            // ==================================

            card.addEventListener(
                "click",
                function () {

                    openGamePage(
                        game.id
                    );

                }
            );


            // ==================================
            // IMAGE
            // ==================================

            const image =
                game.image ||
                game.imageUrl ||
                game.cover ||
                game.coverImage ||
                game.thumbnail ||
                "./images/placeholder.jpg";


            // ==================================
            // NAME
            // ==================================

            const name =
                game.name ||
                "Unknown Game";


            // ==================================
            // STATUS
            // ==================================

            const gameStatus =
                getGameStatus(
                    game
                );


            let statusHTML =
                "";


            if (
                gameStatus ===
                "new"
            ) {

                statusHTML = `
                    <span class="game-status new">
                        NEW
                    </span>
                `;

            }

            else if (
                gameStatus ===
                "upcoming"
            ) {

                statusHTML = `
                    <span class="game-status upcoming">
                        UPCOMING
                    </span>
                `;

            }


            // ==================================
            // CARD HTML
            // ==================================

            card.innerHTML = `

                <div class="game-image-wrap">

                    <img
                        class="game-image"
                        src="${escapeAttribute(
                            image
                        )}"
                        alt="${escapeAttribute(
                            name
                        )}"
                        loading="lazy"
                    >

                    ${statusHTML}

                </div>


                <div class="game-card-content">

                    <h3>
                        ${escapeHTML(
                            name
                        )}
                    </h3>


                    <p>
                        🎮 ${
                            currentPlatform
                                ?
                                escapeHTML(
                                    currentPlatform
                                )
                                :
                                getFirstPlatform(
                                    game.platforms
                                )
                        }
                    </p>


                    ${
                        game.rating !==
                        undefined &&
                        game.rating !==
                        null &&
                        game.rating !== ""
                            ?

                        `
                        <span class="game-rating">
                            ⭐ ${
                                escapeHTML(
                                    game.rating
                                )
                            }/10
                        </span>
                        `

                        :

                        ""
                    }

                </div>

            `;


            // ==================================
            // IMAGE FALLBACK
            // ==================================

            const imageElement =
                card.querySelector(
                    ".game-image"
                );


            if (
                imageElement
            ) {

                imageElement.onerror =
                    function () {

                        this.onerror =
                            null;

                        this.src =
                            "./images/placeholder.jpg";

                    };

            }


            gameGrid.appendChild(
                card
            );

        }
    );


    // ----------------------------------
    // PAGINATION
    // ----------------------------------

    renderPagination(
        totalPages
    );

}


// ==================================================
// PAGINATION
// ==================================================

function renderPagination(
    totalPages
) {

    if (!pagination) {
        return;
    }


    pagination.innerHTML =
        "";


    if (
        totalPages <= 1
    ) {

        return;

    }


    // ----------------------------------
    // PREVIOUS
    // ----------------------------------

    const previous =
        document.createElement(
            "button"
        );


    previous.textContent =
        "← Previous";


    previous.className =
        "page-btn";


    previous.disabled =
        currentPage === 1;


    previous.onclick =
        () => {

            if (
                currentPage > 1
            ) {

                currentPage--;

                renderGames();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        };


    pagination.appendChild(
        previous
    );


    // ----------------------------------
    // PAGE NUMBERS
    // ----------------------------------

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.textContent =
            i;


        button.className =
            "page-btn";


        if (
            i === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.onclick =
            () => {

                currentPage =
                    i;

                renderGames();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            };


        pagination.appendChild(
            button
        );

    }


    // ----------------------------------
    // NEXT
    // ----------------------------------

    const next =
        document.createElement(
            "button"
        );


    next.textContent =
        "Next →";


    next.className =
        "page-btn";


    next.disabled =
        currentPage ===
        totalPages;


    next.onclick =
        () => {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderGames();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        };


    pagination.appendChild(
        next
    );

}


// ==================================================
// FILTER BUTTONS
// ==================================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                currentPage =
                    1;


                renderGames();

            }
        );

    }
);


// ==================================================
// FIRST PLATFORM
// ==================================================

function getFirstPlatform(
    platforms
) {

    if (
        !Array.isArray(
            platforms
        ) ||
        !platforms.length
    ) {

        return "Game";

    }


    return escapeHTML(
        platforms[0]
    );

}


// ==================================================
// GAME DETAIL PAGE
// ==================================================

async function loadGamePage(
    id
) {

    const title =
        document.getElementById(
            "gameTitle"
        );


    if (!title) {

        console.error(
            "GameReox: gameTitle element not found."
        );

        return;

    }


    try {

        const gameRef =
            doc(
                db,
                "games",
                id
            );


        const snapshot =
            await getDoc(
                gameRef
            );


        if (
            !snapshot.exists()
        ) {

            setText(
                "gameTitle",
                "Game not found."
            );

            return;

        }


        const game =
            snapshot.data();


        console.log(
            "GameReox: Game loaded:",
            game
        );


        // ----------------------------------
        // BASIC
        // ----------------------------------

        setText(
            "gameTitle",
            game.name ||
            "Game"
        );


        setText(
            "gameRating",
            game.rating
                ? `⭐ ${game.rating}/10`
                : "Rating not added"
        );


        setText(
            "gameDescription",
            game.description ||
            "No description available."
        );


        setText(
            "developer",
            game.developer ||
            "Not added"
        );


        setText(
            "publisher",
            game.publisher ||
            "Not added"
        );


        setText(
            "gameRelease",
            game.releaseDate
                ? `📅 Release: ${game.releaseDate}`
                : "📅 Release date not added"
        );


        setText(
            "size",
            game.gameSize ||
            "Not added"
        );


        // ----------------------------------
        // IMAGE
        // ----------------------------------

        const gameImage =
            document.getElementById(
                "gameImage"
            );


        if (gameImage) {

            const image =
                game.image ||
                game.imageUrl ||
                game.cover ||
                game.coverImage ||
                game.thumbnail ||
                "./images/placeholder.jpg";


            gameImage.src =
                image;


            gameImage.alt =
                game.name ||
                "Game";


            gameImage.onerror =
                function () {

                    this.onerror =
                        null;

                    this.src =
                        "./images/placeholder.jpg";

                };

        }


        // ----------------------------------
        // GENRES
        // ----------------------------------

        const genres =
            Array.isArray(
                game.genres
            )
                ? game.genres
                : [];


        const genreText =
            genres.length
                ? genres.join(" • ")
                : "Not added";


        setText(
            "gameGenre",
            genreText
        );


        setText(
            "infoGenre",
            genreText
        );


        // ----------------------------------
        // PLATFORMS
        // ----------------------------------

        const platformContainer =
            document.getElementById(
                "gamePlatforms"
            );


        if (
            platformContainer
        ) {

            platformContainer.innerHTML =
                "";


            if (
                Array.isArray(
                    game.platforms
                )
            ) {

                game.platforms.forEach(
                    platform => {

                        const span =
                            document.createElement(
                                "span"
                            );


                        span.textContent =
                            `🎮 ${platform}`;


                        platformContainer.appendChild(
                            span
                        );

                    }
                );

            }

        }


        // ----------------------------------
        // DETAILS
        // ----------------------------------

        const details =
            Array.isArray(
                game.gameDetails
            )
                ? game.gameDetails
                : [];


        setText(
            "players",
            details.includes(
                "Single Player"
            )
                ? "Single Player"
                : details.includes(
                    "Multiplayer"
                )
                    ? "Multiplayer"
                    : "Not added"
        );


        setText(
            "modes",
            details.length
                ? details.join(" • ")
                : "Not added"
        );


        setText(
            "age",
            game.ageRating ||
            "Not added"
        );


        // ----------------------------------
        // STORES
        // ----------------------------------

        setupStoreButton(
            "xboxStore",
            game.stores?.xbox
        );


        setupStoreButton(
            "playstationStore",
            game.stores?.playstation
        );


        setupStoreButton(
            "steamStore",
            game.stores?.steam
        );


        setupStoreButton(
            "epicStore",
            game.stores?.epic
        );


        setupStoreButton(
            "gogStore",
            game.stores?.gog
        );


        setupStoreButton(
            "googlePlay",
            game.stores?.googlePlay
        );


        setupStoreButton(
            "appStore",
            game.stores?.appStore
        );


        setupStoreButton(
            "officialWebsite",
            game.stores?.official
        );


        // ----------------------------------
        // TRAILER
        // ----------------------------------

        const trailer =
            document.getElementById(
                "gameTrailerTop"
            );


        if (
            trailer &&
            game.youtube
        ) {

            trailer.src =
                convertYouTubeURL(
                    game.youtube
                );

        }

    }

    catch (error) {

        console.error(
            "Game page error:",
            error
        );


        setText(
            "gameTitle",
            "Failed to load game."
        );

    }

}


// ==================================================
// STORE BUTTON
// ==================================================

function setupStoreButton(
    id,
    link
) {

    const button =
        document.getElementById(
            id
        );


    if (!button) {
        return;
    }


    if (
        typeof link === "string" &&
        link.trim()
    ) {

        button.href =
            link.trim();

        button.style.display =
            "flex";

    }

    else {

        button.removeAttribute(
            "href"
        );

        button.style.display =
            "none";

    }

}


// ==================================================
// YOUTUBE
// ==================================================

function convertYouTubeURL(
    url
) {

    if (!url) {
        return "";
    }


    if (
        !url.includes(
            "youtube.com"
        ) &&
        !url.includes(
            "youtu.be"
        )
    ) {

        return `https://www.youtube.com/embed/${encodeURIComponent(
            url
        )}`;

    }


    try {

        const parsed =
            new URL(url);


        let videoId =
            parsed.searchParams.get(
                "v"
            );


        if (
            !videoId &&
            parsed.hostname.includes(
                "youtu.be"
            )
        ) {

            videoId =
                parsed.pathname
                    .substring(1)
                    .split("/")[0];

        }


        if (
            !videoId &&
            parsed.pathname.includes(
                "/embed/"
            )
        ) {

            videoId =
                parsed.pathname
                    .split("/embed/")[1]
                    .split("/")[0];

        }


        if (
            !videoId &&
            parsed.pathname.includes(
                "/shorts/"
            )
        ) {

            videoId =
                parsed.pathname
                    .split("/shorts/")[1]
                    .split("/")[0];

        }


        if (videoId) {

            return `https://www.youtube.com/embed/${videoId}`;

        }

    }

    catch (error) {

        console.error(
            "Invalid YouTube URL:",
            error
        );

    }


    return "";

}


// ==================================================
// SET TEXT
// ==================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ==================================================
// ESCAPE ATTRIBUTE
// ==================================================

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}