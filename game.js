// ==================================================
// GameReox - Games + Game Details
// Firebase Firestore
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
    document.body.dataset.platform;

const gameGrid =
    document.getElementById("gameGrid");

const gamesTitle =
    document.getElementById("gamesTitle");

const filterButtons =
    document.querySelectorAll(".filter");


// ==================================================
// GAME ID
// ==================================================

const gameId =
    new URLSearchParams(
        window.location.search
    ).get("id");


// ==================================================
// START
// ==================================================

console.log("GameReox games.js loaded.");


// ==================================================
// IMAGE HELPER
// ==================================================

function getGameImage(game) {

    // Your Firebase field is "image"
    if (
        game &&
        typeof game.image === "string" &&
        game.image.trim() !== ""
    ) {
        return game.image.trim();
    }

    return "./images/placeholder.jpg";
}


// ==================================================
// PLATFORM PAGE
// ==================================================

let platformGames = [];

let currentFilter = "topRated";


if (gameId) {

    console.log(
        "GameReox: Loading game:",
        gameId
    );

    loadGamePage(gameId);

}

else if (gameGrid && currentPlatform) {

    console.log(
        "GameReox: Loading platform:",
        currentPlatform
    );

    loadGames();

}


// ==================================================
// LOAD GAMES
// ==================================================

async function loadGames() {

    try {

        gameGrid.innerHTML = `
            <p class="loading-games">
                Loading games...
            </p>
        `;

        const snapshot =
            await getDocs(
                collection(db, "games")
            );

        platformGames = [];

        snapshot.forEach(gameDoc => {

            const game = {
                id: gameDoc.id,
                ...gameDoc.data()
            };

            const platforms =
                getArray(game.platforms);

            const platform =
                String(currentPlatform)
                    .trim()
                    .toLowerCase();

            if (
                platforms.includes(platform)
            ) {

                platformGames.push(game);

            }

        });

        console.log(
            "GameReox: Games found:",
            platformGames.length
        );

        setupFilters();

        renderGames();

    }

    catch (error) {

        console.error(
            "GameReox: Firebase error:",
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
// RENDER GAMES
// ==================================================

function renderGames() {

    if (!gameGrid) {
        return;
    }

    let games =
        [...platformGames];


    // ==================================================
    // TOP RATED
    // ==================================================

    if (
        currentFilter === "topRated"
    ) {

        games.sort(
            (a, b) =>
                Number(b.rating || 0) -
                Number(a.rating || 0)
        );

        if (gamesTitle) {

            gamesTitle.textContent =
                `Top Rated ${currentPlatform} Games`;

        }

    }


    // ==================================================
    // NEW
    // ==================================================

    else if (
        currentFilter === "new"
    ) {

        games.sort(
            (a, b) =>
                new Date(b.releaseDate || 0) -
                new Date(a.releaseDate || 0)
        );

        if (gamesTitle) {

            gamesTitle.textContent =
                `New ${currentPlatform} Games`;

        }

    }


    // ==================================================
    // UPCOMING
    // ==================================================

    else if (
        currentFilter === "upcoming"
    ) {

        const today =
            new Date();

        today.setHours(
            0,
            0,
            0,
            0
        );

        games =
            games.filter(game => {

                const status =
                    String(
                        game.status || ""
                    )
                    .trim()
                    .toLowerCase();

                if (
                    status === "upcoming"
                ) {

                    return true;

                }

                if (!game.releaseDate) {

                    return false;

                }

                return (
                    new Date(
                        game.releaseDate
                    ) > today
                );

            });

        games.sort(
            (a, b) =>
                new Date(a.releaseDate || 0) -
                new Date(b.releaseDate || 0)
        );

        if (gamesTitle) {

            gamesTitle.textContent =
                `Upcoming ${currentPlatform} Games`;

        }

    }


    // ==================================================
    // ALL
    // ==================================================

    else {

        if (gamesTitle) {

            gamesTitle.textContent =
                `All ${currentPlatform} Games`;

        }

    }


    // ==================================================
    // CLEAR
    // ==================================================

    gameGrid.innerHTML = "";


    // ==================================================
    // NO GAMES
    // ==================================================

    if (!games.length) {

        gameGrid.innerHTML = `
            <p class="no-games">
                No ${escapeHTML(
                    currentPlatform
                )} games found.
            </p>
        `;

        return;

    }


    // ==================================================
    // CARDS
    // ==================================================

    games.forEach(game => {

        const card =
            document.createElement("article");

        card.className =
            "game-card";


        card.onclick = function () {

            window.location.href =
                `game.html?id=${encodeURIComponent(
                    game.id
                )}`;

        };


        // IMPORTANT:
        // Same image field that is working
        // on your games page.

        const imageURL =
            getGameImage(game);


        card.innerHTML = `

            <img
                class="game-image"
                src="${escapeAttribute(imageURL)}"
                alt="${escapeAttribute(
                    game.name || "Game"
                )}"
                loading="lazy"
            >

            <div class="game-card-content">

                <h3>
                    ${escapeHTML(
                        game.name ||
                        "Unknown Game"
                    )}
                </h3>

                <p>
                    🎮 ${escapeHTML(
                        currentPlatform
                    )}
                </p>

                ${
                    game.rating !== undefined &&
                    game.rating !== null &&
                    game.rating !== ""
                    ?
                    `
                    <span class="game-rating">
                        ⭐ ${escapeHTML(
                            game.rating
                        )}/10
                    </span>
                    `
                    :
                    ""
                }

            </div>

        `;


        const image =
            card.querySelector(
                ".game-image"
            );


        if (image) {

            image.onerror =
                function () {

                    console.error(
                        "Card image failed:",
                        imageURL
                    );

                    this.onerror = null;

                    this.src =
                        "./images/placeholder.jpg";

                };

        }


        gameGrid.appendChild(card);

    });

}


// ==================================================
// FILTER BUTTONS
// ==================================================

function setupFilters() {

    filterButtons.forEach(button => {

        button.onclick = function () {

            filterButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            button.classList.add("active");

            currentFilter =
                button.dataset.filter ||
                "topRated";

            renderGames();

        };

    });

}


// ==================================================
// GAME DETAIL PAGE
// ==================================================

async function loadGamePage(id) {

    console.log(
        "GameReox: Loading detail page:",
        id
    );


    const title =
        document.getElementById("gameTitle");


    if (!title) {

        console.error(
            "GameReox: gameTitle not found."
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
            await getDoc(gameRef);


        if (!snapshot.exists()) {

            console.error(
                "Game not found:",
                id
            );

            setText(
                "gameTitle",
                "Game not found."
            );

            return;

        }


        const game = {
            id: snapshot.id,
            ...snapshot.data()
        };


        console.log(
            "GameReox: Game loaded:",
            game
        );


        // ==================================================
        // GAME IMAGE
        // ==================================================

        const image =
            document.getElementById(
                "gameImage"
            );


        if (image) {

            const imageURL =
                getGameImage(game);


            console.log(
                "GameReox DETAIL IMAGE:",
                imageURL
            );


            // Set the EXACT same URL
            // used by the working card.

            image.src =
                imageURL;


            image.alt =
                game.name ||
                "Game";


            image.loading =
                "eager";


            image.onerror =
                function () {

                    console.error(
                        "DETAIL IMAGE FAILED:",
                        imageURL
                    );

                    this.onerror = null;

                    this.src =
                        "./images/placeholder.jpg";

                };

        }

        else {

            console.error(
                "GameReox: #gameImage was NOT found in game.html"
            );

        }


        // ==================================================
        // BASIC INFORMATION
        // ==================================================

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


        // ==================================================
        // GENRES
        // ==================================================

        const genres =
            getArray(
                game.genres
            );


        const genreText =
            genres.length
                ? genres
                    .map(formatValue)
                    .join(" • ")
                : "Not added";


        setText(
            "gameGenre",
            genreText
        );


        setText(
            "infoGenre",
            genreText
        );


        // ==================================================
        // PLATFORMS
        // ==================================================

        const platforms =
            getArray(
                game.platforms
            );


        const platformContainer =
            document.getElementById(
                "gamePlatforms"
            );


        if (platformContainer) {

            platformContainer.innerHTML =
                "";

            platforms.forEach(platform => {

                const span =
                    document.createElement(
                        "span"
                    );

                span.textContent =
                    `🎮 ${formatValue(
                        platform
                    )}`;

                platformContainer.appendChild(
                    span
                );

            });

        }


        // ==================================================
        // GAME DETAILS
        // ==================================================

        const details =
            getArray(
                game.gameDetails
            );


        let players =
            "Not added";


        if (
            details.includes(
                "single player"
            )
        ) {

            players =
                "Single Player";

        }

        else if (
            details.includes(
                "multiplayer"
            )
        ) {

            players =
                "Multiplayer";

        }


        setText(
            "players",
            players
        );


        setText(
            "modes",
            details.length
                ? details
                    .map(formatValue)
                    .join(" • ")
                : "Not added"
        );


        setText(
            "age",
            game.ageRating ||
            "Not added"
        );


        // ==================================================
        // STORE BUTTONS
        // ==================================================

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


        // ==================================================
        // TRAILER
        // ==================================================

        setupTrailer(
            game.youtube
        );


        // ==================================================
        // META DESCRIPTION
        // ==================================================

        const metaDescription =
            document.getElementById(
                "gameMetaDescription"
            );


        if (
            metaDescription &&
            game.description
        ) {

            metaDescription.setAttribute(
                "content",
                game.description
            );

        }


        // ==================================================
        // RELATED GAMES
        // ==================================================

        await loadRelatedGames(
            game
        );


        console.log(
            "GameReox: Detail page completed."
        );

    }

    catch (error) {

        console.error(
            "GameReox: Game page error:",
            error
        );

        setText(
            "gameTitle",
            "Failed to load game."
        );

    }

}


// ==================================================
// RELATED GAMES
// ==================================================

async function loadRelatedGames(
    currentGame
) {

    const container =
        document.getElementById(
            "relatedGames"
        );


    if (!container) {
        return;
    }


    try {

        container.innerHTML = `
            <p class="related-loading">
                Loading games...
            </p>
        `;


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "games"
                )
            );


        const games = [];


        snapshot.forEach(gameDoc => {

            if (
                gameDoc.id ===
                currentGame.id
            ) {
                return;
            }


            games.push({

                id: gameDoc.id,

                ...gameDoc.data()

            });

        });


        const currentPlatforms =
            getArray(
                currentGame.platforms
            );


        const currentGenres =
            getArray(
                currentGame.genres
            );


        const scoredGames =
            games.map(game => {

                const gamePlatforms =
                    getArray(
                        game.platforms
                    );


                const gameGenres =
                    getArray(
                        game.genres
                    );


                const samePlatform =
                    hasCommonValue(
                        currentPlatforms,
                        gamePlatforms
                    );


                const sameGenre =
                    hasCommonValue(
                        currentGenres,
                        gameGenres
                    );


                let score = 0;


                if (
                    samePlatform &&
                    sameGenre
                ) {

                    score += 100;

                }

                else if (
                    samePlatform
                ) {

                    score += 60;

                }

                else if (
                    sameGenre
                ) {

                    score += 40;

                }


                score += Math.min(
                    Number(
                        game.rating || 0
                    ),
                    10
                );


                return {
                    game,
                    score
                };

            });


        scoredGames.sort(
            (a, b) =>
                b.score - a.score
        );


        const related =
            scoredGames
                .slice(0, 5)
                .map(
                    item =>
                        item.game
                );


        renderRelatedGames(
            related
        );

    }

    catch (error) {

        console.error(
            "Related games error:",
            error
        );

        container.innerHTML = `
            <p class="related-loading">
                Unable to load related games.
            </p>
        `;

    }

}


// ==================================================
// RELATED GAME CARDS
// ==================================================

function renderRelatedGames(games) {

    const container =
        document.getElementById(
            "relatedGames"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!games.length) {

        container.innerHTML = `
            <p class="related-loading">
                No related games available yet.
            </p>
        `;

        return;

    }


    games.forEach(game => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "related-game-card";


        card.onclick =
            function () {

                window.location.href =
                    `game.html?id=${encodeURIComponent(
                        game.id
                    )}`;

            };


        const platforms =
            getArray(
                game.platforms
            );


        const genres =
            getArray(
                game.genres
            );


        const platformText =
            platforms.length
                ? formatValue(
                    platforms[0]
                )
                : "Game";


        const genreText =
            genres.length
                ? formatValue(
                    genres[0]
                )
                : "";


        const imageURL =
            getGameImage(game);


        card.innerHTML = `

            <img
                class="related-game-image"
                src="${escapeAttribute(
                    imageURL
                )}"
                alt="${escapeAttribute(
                    game.name ||
                    "Game"
                )}"
                loading="lazy"
            >

            <div class="related-game-content">

                <h3>
                    ${escapeHTML(
                        game.name ||
                        "Unknown Game"
                    )}
                </h3>

                <span class="related-game-platform">
                    ${escapeHTML(
                        platformText
                    )}
                </span>

                ${
                    genreText
                    ?
                    `
                    <span class="related-game-genre">
                        ${escapeHTML(
                            genreText
                        )}
                    </span>
                    `
                    :
                    ""
                }

            </div>

        `;


        const image =
            card.querySelector(
                ".related-game-image"
            );


        if (image) {

            image.onerror =
                function () {

                    console.error(
                        "Related image failed:",
                        imageURL
                    );

                    this.onerror = null;

                    this.src =
                        "./images/placeholder.jpg";

                };

        }


        container.appendChild(card);

    });

}


// ==================================================
// TRAILER
// ==================================================

function setupTrailer(youtube) {

    const section =
        document.getElementById(
            "trailerSection"
        );


    const trailer =
        document.getElementById(
            "gameTrailerTop"
        );


    if (
        !section ||
        !trailer
    ) {
        return;
    }


    const embedURL =
        convertYouTubeURL(
            youtube
        );


    if (embedURL) {

        trailer.src =
            embedURL;

        section.style.display =
            "block";

    }

    else {

        trailer.removeAttribute(
            "src"
        );

        section.style.display =
            "none";

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
            "inline-flex";

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

function convertYouTubeURL(url) {

    if (
        !url ||
        typeof url !== "string"
    ) {
        return "";
    }


    const cleanURL =
        url.trim();


    if (
        !cleanURL.includes(
            "youtube.com"
        ) &&
        !cleanURL.includes(
            "youtu.be"
        )
    ) {

        return `https://www.youtube.com/embed/${encodeURIComponent(
            cleanURL
        )}`;

    }


    try {

        const parsed =
            new URL(cleanURL);


        let videoId =
            "";


        if (
            parsed.hostname.includes(
                "youtu.be"
            )
        ) {

            videoId =
                parsed.pathname
                    .replace(
                        /^\/+/,
                        ""
                    )
                    .split("/")[0];

        }

        else {

            videoId =
                parsed.searchParams.get(
                    "v"
                );

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

        console.warn(
            "Invalid YouTube URL:",
            url
        );

    }


    return "";

}


// ==================================================
// ARRAY HELPER
// ==================================================

function getArray(value) {

    if (
        Array.isArray(value)
    ) {

        return value
            .map(item =>
                String(item)
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);

    }


    if (
        typeof value === "string" &&
        value.trim()
    ) {

        return value
            .split(",")
            .map(item =>
                item
                    .trim()
                    .toLowerCase()
            )
            .filter(Boolean);

    }


    return [];

}


// ==================================================
// COMMON VALUE
// ==================================================

function hasCommonValue(
    first,
    second
) {

    return first.some(
        value =>
            second.includes(value)
    );

}


// ==================================================
// FORMAT VALUE
// ==================================================

function formatValue(value) {

    return String(value)
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


// ==================================================
// SET TEXT
// ==================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(value) {

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

function escapeAttribute(value) {

    return escapeHTML(value);

}