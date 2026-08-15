// ==================================================
// GAMEREOX HOME PAGE
// Firebase Homepage Loader
// ==================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==================================================
// HELPERS
// ==================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function getToday() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


function getLimit(value, fallback = 6) {

    const number =
        parseInt(value, 10);

    if (
        Number.isNaN(number) ||
        number < 1
    ) {
        return fallback;
    }

    return Math.min(number, 50);

}


function getDateValue(value) {

    if (!value) {
        return 0;
    }

    if (
        typeof value === "object" &&
        typeof value.toDate === "function"
    ) {

        return value.toDate().getTime();

    }

    const date =
        new Date(value);

    return Number.isNaN(date.getTime())
        ? 0
        : date.getTime();

}


// ==================================================
// DEFAULT HOMEPAGE SETTINGS
// ==================================================

const defaultSettings = {

    heroTitle:
        "Gaming updates.\nPlayable games.",

    heroDescription:
        "Gaming news, playable web games, upcoming releases and deals.",

    newsTitle:
        "Latest Gaming News",

    dealsTitle:
        "Today's Deals",

    upcomingTitle:
        "Upcoming Games",

    platformTitle:
        "Browse by Platform",

    showNews:
        true,

    showDeals:
        true,

    showUpcoming:
        true,

    showPlatforms:
        true,

    newsLimit:
        6,

    dealsLimit:
        6,

    upcomingLimit:
        6,

    gamesLimit:
        6

};


// ==================================================
// LOAD HOMEPAGE
// ==================================================

async function loadHomepage() {

    try {

        const homepageRef =
            doc(
                db,
                "settings",
                "homepage"
            );


        const snapshot =
            await getDoc(
                homepageRef
            );


        const settings =
            snapshot.exists()
                ? {
                    ...defaultSettings,
                    ...snapshot.data()
                }
                : defaultSettings;


        applySettings(settings);


        const tasks = [

            settings.showNews
                ? loadHomeNews(settings.newsLimit)
                : Promise.resolve(
                    hideSection("newsSection")
                ),

            loadHomeGames(settings.gamesLimit),

            settings.showUpcoming
                ? loadHomeUpcoming(settings.upcomingLimit)
                : Promise.resolve(
                    hideSection("upcomingSection")
                ),

            settings.showDeals
                ? loadHomeDeals(settings.dealsLimit)
                : Promise.resolve(
                    hideSection("dealsSection")
                )

        ];


        if (!settings.showPlatforms) {

            hideSection("platformSection");

        }


        await Promise.all(tasks);

    }

    catch (error) {

        console.error(
            "Homepage loading error:",
            error
        );

    }

}


// ==================================================
// APPLY HOMEPAGE SETTINGS
// ==================================================

function applySettings(settings) {

    setText(
        "heroTitle",
        settings.heroTitle ||
        defaultSettings.heroTitle
    );

    setText(
        "heroDescription",
        settings.heroDescription ||
        defaultSettings.heroDescription
    );

    setText(
        "newsTitle",
        settings.newsTitle ||
        defaultSettings.newsTitle
    );

    setText(
        "dealsTitle",
        settings.dealsTitle ||
        defaultSettings.dealsTitle
    );

    setText(
        "upcomingTitle",
        settings.upcomingTitle ||
        defaultSettings.upcomingTitle
    );

    setText(
        "platformTitle",
        settings.platformTitle ||
        defaultSettings.platformTitle
    );

}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.innerHTML =
        escapeHTML(value)
            .replaceAll(
                "\n",
                "<br>"
            );

}


function hideSection(id) {

    const element =
        document.getElementById(id);

    if (element) {

        element.style.display =
            "none";

    }

}


// ==================================================
// LOAD GAMING NEWS
// ==================================================

async function loadHomeNews(limit) {

    const featured =
        document.getElementById(
            "featuredNews"
        );

    const moreNews =
        document.getElementById(
            "moreNews"
        );


    if (!featured) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "news"
                )
            );


        let news =
            snapshot.docs.map(
                newsDoc => ({

                    id:
                        newsDoc.id,

                    ...newsDoc.data()

                })
            );


        news.sort(
            (a, b) =>
                getDateValue(
                    b.publishDate ||
                    b.date
                ) -
                getDateValue(
                    a.publishDate ||
                    a.date
                )
        );


        news =
            news.slice(
                0,
                getLimit(limit)
            );


        if (!news.length) {

            featured.innerHTML = `
                <p class="loading">
                    No gaming news available.
                </p>
            `;

            if (moreNews) {
                moreNews.innerHTML = "";
            }

            return;

        }


        const first =
            news[0];


        featured.innerHTML = `

            <a
                class="news-card"
                href="news.html?id=${encodeURIComponent(first.id)}"
            >

                <div class="news-image">

                    <img
                        src="${escapeHTML(
                            first.image ||
                            "images/news.jpg"
                        )}"
                        alt="${escapeHTML(
                            first.title ||
                            "Gaming News"
                        )}"
                    >

                    <span class="news-tag">
                        LATEST
                    </span>

                </div>


                <div class="news-content">

                    <div class="news-date">
                        ${escapeHTML(
                            first.publishDate ||
                            first.date ||
                            ""
                        )}
                    </div>

                    <h3>
                        ${escapeHTML(
                            first.title ||
                            "Gaming News"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            first.description ||
                            first.summary ||
                            "Read the latest gaming update."
                        )}
                    </p>

                </div>

            </a>

        `;


        if (!moreNews) {
            return;
        }


        moreNews.innerHTML = "";


        news
            .slice(1)
            .forEach(item => {

                const card =
                    document.createElement("a");


                card.className =
                    "news-card-sm";


                card.href =
                    `news.html?id=${encodeURIComponent(
                        item.id
                    )}`;


                card.innerHTML = `

                    <div class="news-image-sm">

                        <img
                            src="${escapeHTML(
                                item.image ||
                                "images/news.jpg"
                            )}"
                            alt="${escapeHTML(
                                item.title ||
                                "Gaming News"
                            )}"
                            loading="lazy"
                        >

                    </div>


                    <div class="small-news-content">

                        <h4>
                            ${escapeHTML(
                                item.title ||
                                "Gaming News"
                            )}
                        </h4>

                        <div class="news-meta-sm">
                            ${escapeHTML(
                                item.publishDate ||
                                item.date ||
                                ""
                            )}
                        </div>

                    </div>

                `;


                moreNews.appendChild(card);

            });

    }

    catch (error) {

        console.error(
            "Home news error:",
            error
        );


        featured.innerHTML = `
            <p class="loading">
                Unable to load gaming news.
            </p>
        `;

    }

}


// ==================================================
// PLAYABLE WEB GAMES
// ==================================================

async function loadHomeGames(limit) {

    const container =
        document.getElementById(
            "homeGames"
        );


    if (!container) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "games"
                )
            );


        let games =
            snapshot.docs.map(
                gameDoc => ({

                    id:
                        gameDoc.id,

                    ...gameDoc.data()

                })
            );


        games =
            games.filter(game => {

                return Boolean(
                    game.playUrl ||
                    game.webGameUrl ||
                    game.gameUrl ||
                    game.playLink
                );

            });


        games =
            games.slice(
                0,
                getLimit(limit)
            );


        if (!games.length) {

            container.innerHTML = `
                <p class="loading">
                    No playable web games available yet.
                </p>
            `;

            return;

        }


        container.innerHTML = "";


        games.forEach(game => {

            const playUrl =
                game.playUrl ||
                game.webGameUrl ||
                game.gameUrl ||
                game.playLink;


            const card =
                document.createElement("article");


            card.className =
                "web-game-card";


            card.innerHTML = `

                <div class="web-game-image">

                    <img
                        src="${escapeHTML(
                            game.image ||
                            game.cover ||
                            "images/game.jpg"
                        )}"
                        alt="${escapeHTML(
                            game.name ||
                            "Web Game"
                        )}"
                        loading="lazy"
                    >

                    <span class="play-label">
                        PLAY NOW
                    </span>

                </div>


                <div class="web-game-content">

                    <h3>
                        ${escapeHTML(
                            game.name ||
                            "Untitled Game"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            game.description ||
                            "Play this game directly in your browser."
                        )}
                    </p>

                    <a
                        href="${escapeHTML(playUrl)}"
                        class="play-button"
                    >
                        Play Game →
                    </a>

                </div>

            `;


            container.appendChild(card);

        });

    }

    catch (error) {

        console.error(
            "Home games error:",
            error
        );


        container.innerHTML = `
            <p class="loading">
                Unable to load games.
            </p>
        `;

    }

}


// ==================================================
// UPCOMING GAMES
// ==================================================

async function loadHomeUpcoming(limit) {

    const container =
        document.getElementById(
            "homeUpcoming"
        );


    if (!container) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "upcoming"
                )
            );


        const today =
            getToday();


        let games =
            snapshot.docs.map(
                gameDoc => ({

                    id:
                        gameDoc.id,

                    ...gameDoc.data()

                })
            );


        games =
            games.filter(game => {

                if (!game.releaseDate) {
                    return true;
                }

                return (
                    game.releaseDate >
                    today
                );

            });


        games.sort(
            (a, b) =>
                getDateValue(
                    a.releaseDate
                ) -
                getDateValue(
                    b.releaseDate
                )
        );


        games =
            games.slice(
                0,
                getLimit(limit)
            );


        if (!games.length) {

            container.innerHTML = `
                <p class="loading">
                    No upcoming games right now.
                </p>
            `;

            return;

        }


        container.innerHTML = "";


        games.forEach(game => {

            const card =
                document.createElement("a");


            card.className =
                "upcoming-card";


            card.href =
                `upcoming.html?id=${encodeURIComponent(
                    game.id
                )}`;


            card.innerHTML = `

                <div class="upcoming-image">

                    <img
                        src="${escapeHTML(
                            game.image ||
                            "images/game.jpg"
                        )}"
                        alt="${escapeHTML(
                            game.name ||
                            "Upcoming Game"
                        )}"
                        loading="lazy"
                    >

                </div>


                <div class="upcoming-content">

                    <span class="release-label">
                        RELEASE
                    </span>

                    <h3>
                        ${escapeHTML(
                            game.name ||
                            "Upcoming Game"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            game.releaseDate ||
                            "Release date TBA"
                        )}
                    </p>

                </div>

            `;


            container.appendChild(card);

        });

    }

    catch (error) {

        console.error(
            "Upcoming games error:",
            error
        );


        container.innerHTML = `
            <p class="loading">
                Unable to load upcoming games.
            </p>
        `;

    }

}


// ==================================================
// DEALS
// ==================================================

async function loadHomeDeals(limit) {

    const container =
        document.getElementById(
            "homeDeals"
        );


    if (!container) {
        return;
    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "deals"
                )
            );


        const today =
            getToday();


        let deals =
            snapshot.docs.map(
                dealDoc => ({

                    id:
                        dealDoc.id,

                    ...dealDoc.data()

                })
            );


        deals =
            deals.filter(deal => {

                if (!deal.endDate) {
                    return true;
                }

                return (
                    deal.endDate >=
                    today
                );

            });


        deals.sort(
            (a, b) =>
                Number(
                    b.discountPercent ||
                    0
                ) -
                Number(
                    a.discountPercent ||
                    0
                )
        );


        deals =
            deals.slice(
                0,
                getLimit(limit)
            );


        if (!deals.length) {

            container.innerHTML = `
                <p class="loading">
                    No active deals right now.
                </p>
            `;

            return;

        }


        container.innerHTML = "";


        deals.forEach(deal => {

            const card =
                document.createElement("a");


            card.className =
                "deal-card";


            card.href =
                `deals.html?id=${encodeURIComponent(
                    deal.id
                )}`;


            const discount =
                Number(
                    deal.discountPercent ||
                    0
                );


            card.innerHTML = `

                <div class="deal-image">

                    <img
                        src="${escapeHTML(
                            deal.image ||
                            "images/game.jpg"
                        )}"
                        alt="${escapeHTML(
                            deal.gameName ||
                            "Gaming Deal"
                        )}"
                        loading="lazy"
                    >

                    ${
                        discount > 0
                            ? `
                                <span class="discount-badge">
                                    -${discount}%
                                </span>
                              `
                            : ""
                    }

                </div>


                <div class="deal-content">

                    <h3>
                        ${escapeHTML(
                            deal.gameName ||
                            deal.saleName ||
                            "Gaming Deal"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            deal.description ||
                            deal.gameDescription ||
                            deal.shortDescription ||
                            "Check out this gaming offer."
                        )}
                    </p>

                    <span class="deal-link">
                        View Deal →
                    </span>

                </div>

            `;


            container.appendChild(card);

        });

    }

    catch (error) {

        console.error(
            "Home deals error:",
            error
        );


        container.innerHTML = `
            <p class="loading">
                Unable to load deals.
            </p>
        `;

    }

}


// ==================================================
// START HOMEPAGE
// ==================================================

loadHomepage();