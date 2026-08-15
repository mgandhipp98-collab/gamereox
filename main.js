import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {


// ==================================================
// SIDEBAR
// ==================================================

const menuBtn =
    document.getElementById("menuBtn");

const closeBtn =
    document.getElementById("closeBtn");

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");


// Open Sidebar
function openSidebar() {

    if (sidebar) {
        sidebar.classList.add("active");
    }

    if (overlay) {
        overlay.style.display = "block";
    }

}


// Close Sidebar
function closeSidebar() {

    if (sidebar) {
        sidebar.classList.remove("active");
    }

    if (overlay) {
        overlay.style.display = "none";
    }

}


if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        openSidebar
    );

}


if (closeBtn) {

    closeBtn.addEventListener(
        "click",
        closeSidebar
    );

}


if (overlay) {

    overlay.addEventListener(
        "click",
        closeSidebar
    );

}


// ==================================================
// SEARCH ELEMENTS
// ==================================================

const searchBtn =
    document.getElementById("searchBtn");

const searchOverlay =
    document.getElementById("searchOverlay");

const closeSearch =
    document.getElementById("closeSearch");

const searchInput =
    document.getElementById("searchInput");

const searchResults =
    document.getElementById("searchResults");


// ==================================================
// OPEN SEARCH
// ==================================================

function openSearch() {

    if (!searchOverlay) {
        return;
    }

    searchOverlay.style.display = "block";

    setTimeout(() => {

        if (searchInput) {
            searchInput.focus();
        }

    }, 100);

}


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        openSearch
    );

}


// ==================================================
// CLOSE SEARCH
// ==================================================

function closeSearchBox() {

    if (!searchOverlay) {
        return;
    }

    searchOverlay.style.display = "none";

    if (searchInput) {
        searchInput.value = "";
    }

    if (searchResults) {
        searchResults.innerHTML = "";
    }

}


if (closeSearch) {

    closeSearch.addEventListener(
        "click",
        closeSearchBox
    );

}


// ==================================================
// ESCAPE KEY
// ==================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeSearchBox();
            closeSidebar();

        }

    }
);


// ==================================================
// GLOBAL SEARCH
// ==================================================

if (searchInput && searchResults) {

    let searchRequest = 0;


    searchInput.addEventListener(
        "input",
        async () => {

            const text =
                searchInput.value
                .trim()
                .toLowerCase();


            searchResults.innerHTML = "";


            if (text === "") {
                return;
            }


            const requestId =
                ++searchRequest;


            searchResults.innerHTML = `
                <div class="search-loading">
                    Searching...
                </div>
            `;


            try {

                // ==================================================
                // LOAD NEWS + GAMES
                // ==================================================

                const [
                    newsSnapshot,
                    gamesSnapshot
                ] = await Promise.all([

                    getDocs(
                        collection(
                            db,
                            "news"
                        )
                    ),

                    getDocs(
                        collection(
                            db,
                            "games"
                        )
                    )

                ]);


                // Ignore old search request
                if (
                    requestId !== searchRequest
                ) {
                    return;
                }


                const results = [];


                // ==================================================
                // SEARCH NEWS
                // ==================================================

                newsSnapshot.forEach(
                    (docSnapshot) => {

                        const news =
                            docSnapshot.data();


                        const title =
                            String(
                                news.title || ""
                            )
                            .toLowerCase();


                        const category =
                            String(
                                news.category || ""
                            )
                            .toLowerCase();


                        const summary =
                            String(
                                news.summary || ""
                            )
                            .toLowerCase();


                        const relatedGame =
                            String(
                                news.relatedGame || ""
                            )
                            .toLowerCase();


                        if (
                            title.includes(text) ||
                            category.includes(text) ||
                            summary.includes(text) ||
                            relatedGame.includes(text)
                        ) {

                            results.push({

                                type: "news",

                                id:
                                    docSnapshot.id,

                                title:
                                    news.title ||
                                    "Untitled News",

                                image:
                                    news.image ||
                                    "./images/news.jpg",

                                category:
                                    news.category ||
                                    "Gaming News",

                                date:
                                    news.publishDate ||
                                    ""

                            });

                        }

                    }
                );


                // ==================================================
                // SEARCH GAMES
                // ==================================================

                gamesSnapshot.forEach(
                    (docSnapshot) => {

                        const game =
                            docSnapshot.data();


                        const name =
                            String(
                                game.name || ""
                            )
                            .toLowerCase();


                        const description =
                            String(
                                game.description || ""
                            )
                            .toLowerCase();


                        const developer =
                            String(
                                game.developer || ""
                            )
                            .toLowerCase();


                        const publisher =
                            String(
                                game.publisher || ""
                            )
                            .toLowerCase();


                        const genres =
                            Array.isArray(
                                game.genres
                            )
                            ? game.genres
                                .join(" ")
                                .toLowerCase()
                            : String(
                                game.genres || ""
                            ).toLowerCase();


                        const platforms =
                            Array.isArray(
                                game.platforms
                            )
                            ? game.platforms
                                .join(" ")
                                .toLowerCase()
                            : String(
                                game.platforms || ""
                            ).toLowerCase();


                        if (
                            name.includes(text) ||
                            description.includes(text) ||
                            developer.includes(text) ||
                            publisher.includes(text) ||
                            genres.includes(text) ||
                            platforms.includes(text)
                        ) {

                            results.push({

                                type: "game",

                                id:
                                    docSnapshot.id,

                                title:
                                    game.name ||
                                    "Unknown Game",

                                image:
                                    game.image ||
                                    "./images/placeholder.jpg",

                                category:
                                    "Game",

                                date:
                                    game.releaseDate ||
                                    ""

                            });

                        }

                    }
                );


                // ==================================================
                // NO RESULTS
                // ==================================================

                if (!results.length) {

                    searchResults.innerHTML = `

                        <div class="search-no-results">

                            <p>
                                No results found
                            </p>

                        </div>

                    `;

                    return;

                }


                // ==================================================
                // RENDER RESULTS
                // ==================================================

                searchResults.innerHTML = "";


                results.forEach(
                    (result) => {

                        const item =
                            document.createElement(
                                "div"
                            );


                        item.className =
                            "search-item";


                        item.innerHTML = `

                            <img
                                class="search-news-image"
                                src="${escapeAttribute(
                                    result.image
                                )}"
                                alt="${escapeAttribute(
                                    result.title
                                )}"
                            >

                            <div class="search-news-content">

                                <h3>
                                    ${escapeHTML(
                                        result.title
                                    )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                                        result.category
                                    )}

                                    ${
                                        result.date
                                        ? " • " +
                                          escapeHTML(
                                              result.date
                                          )
                                        : ""
                                    }

                                </p>

                            </div>

                        `;


                        // ==================================================
                        // RESULT CLICK
                        // ==================================================

                        item.addEventListener(
                            "click",
                            () => {

                                // ------------------------------
                                // GAME RESULT
                                // ------------------------------

                                if (
                                    result.type === "game"
                                ) {

                                    window.location.href =
                                        `game.html?id=${encodeURIComponent(
                                            result.id
                                        )}`;

                                    return;

                                }


                                // ------------------------------
                                // NEWS RESULT
                                // ------------------------------

                                if (
                                    result.type === "news"
                                ) {

                                    localStorage.setItem(
                                        "selectedNews",
                                        result.id
                                    );


                                    window.location.href =
                                        "news.html";

                                }

                            }
                        );


                        searchResults.appendChild(
                            item
                        );

                    }
                );


            }

            catch (error) {

                console.error(
                    "Global search error:",
                    error
                );


                searchResults.innerHTML = `

                    <div class="search-no-results">

                        <p>
                            Unable to search.
                        </p>

                    </div>

                `;

            }

        }
    );

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


});