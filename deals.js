
console.log("🔥🔥🔥 NEW GAMEREOX DEALS.JS IS RUNNING 🔥🔥🔥");
// ==================================================
// GAMEREOX — DEALS SYSTEM
// Firebase Firestore
//
// Collections:
//     deals
//
// HTML:
//     #storeSaleGrid
//     #dealGrid
//
// ==================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==================================================
// PAGE CHECK
// ==================================================

console.log("GAMEREOX DEALS: deals.js loaded.");
console.log("CURRENT PAGE:", window.location.href);


// ==================================================
// ELEMENTS
// ==================================================

const storeSaleGrid =
    document.getElementById("storeSaleGrid");

const dealGrid =
    document.getElementById("dealGrid");


// ==================================================
// FIREBASE COLLECTION
// ==================================================

const dealsCollection =
    collection(db, "deals");


// ==================================================
// START
// ==================================================

loadDeals();


// ==================================================
// LOAD DEALS
// ==================================================

async function loadDeals() {

    console.log(
        "GAMEREOX DEALS: Loading deals from Firebase..."
    );


    // ------------------------------------------
    // HTML CHECK
    // ------------------------------------------

    if (!storeSaleGrid) {

        console.warn(
            "GAMEREOX DEALS: #storeSaleGrid was not found in the HTML."
        );

    }


    if (!dealGrid) {

        console.warn(
            "GAMEREOX DEALS: #dealGrid was not found in the HTML."
        );

    }


    try {

        const snapshot =
            await getDocs(
                dealsCollection
            );


        console.log(
            "GAMEREOX DEALS: Loaded",
            snapshot.size,
            "deals from Firebase."
        );


        const deals = [];


        snapshot.forEach(
            dealDoc => {

                const data =
                    dealDoc.data();


                deals.push({

                    id:
                        dealDoc.id,

                    ...data

                });

            }
        );


        // ------------------------------------------
        // FILTER ACTIVE DEALS
        // ------------------------------------------

        const activeDeals =
            deals.filter(
                deal =>
                    isDealActive(
                        deal
                    )
            );


        console.log(
            "GAMEREOX DEALS: Active deals:",
            activeDeals.length
        );


        // ------------------------------------------
        // STORE SALES
        // ------------------------------------------

        renderStoreSales(
            activeDeals
        );


        // ------------------------------------------
        // GAME DEALS
        // ------------------------------------------

        renderGameDeals(
            activeDeals
        );

    }

    catch (error) {

        console.error(
            "GAMEREOX DEALS: Firebase error:",
            error
        );


        if (storeSaleGrid) {

            storeSaleGrid.innerHTML = `
                <p class="loading">
                    Failed to load store sales.
                </p>
            `;

        }


        if (dealGrid) {

            dealGrid.innerHTML = `
                <p class="loading">
                    Failed to load game deals.
                </p>
            `;

        }

    }

}


// ==================================================
// CHECK DEAL ACTIVE
// ==================================================

function isDealActive(
    deal
) {

    // ------------------------------------------
    // If active field exists
    // ------------------------------------------

    if (
        deal.active !== undefined
    ) {

        return (
            deal.active === true ||
            deal.active === "true"
        );

    }


    // ------------------------------------------
    // START DATE
    // ------------------------------------------

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    // ------------------------------------------
    // START
    // ------------------------------------------

    if (
        deal.startDate
    ) {

        const start =
            parseDate(
                deal.startDate
            );


        if (
            start &&
            today < start
        ) {

            return false;

        }

    }


    // ------------------------------------------
    // END
    // ------------------------------------------

    if (
        deal.endDate
    ) {

        const end =
            parseDate(
                deal.endDate
            );


        if (
            end
        ) {

            end.setHours(
                23,
                59,
                59,
                999
            );


            if (
                today > end
            ) {

                return false;

            }

        }

    }


    return true;

}


// ==================================================
// DATE PARSER
// ==================================================

function parseDate(
    value
) {

    if (!value) {
        return null;
    }


    // Firebase Timestamp

    if (
        typeof value.toDate ===
        "function"
    ) {

        return value.toDate();

    }


    const text =
        String(value);


    // YYYY-MM-DD

    const parts =
        text.split("-");


    if (
        parts.length === 3
    ) {

        const date =
            new Date(
                Number(parts[0]),
                Number(parts[1]) - 1,
                Number(parts[2])
            );


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            return date;

        }

    }


    const normalDate =
        new Date(
            value
        );


    if (
        Number.isNaN(
            normalDate.getTime()
        )
    ) {

        return null;

    }


    return normalDate;

}


// ==================================================
// RENDER STORE SALES
// ==================================================

function renderStoreSales(
    deals
) {

    if (!storeSaleGrid) {

        console.warn(
            "GAMEREOX DEALS: #storeSaleGrid does not exist."
        );

        return;

    }


    storeSaleGrid.innerHTML =
        "";


    // ------------------------------------------
    // STORE SALES
    // ------------------------------------------

    const storeSales =
        deals.filter(
            deal => {

                const type =
                    String(
                        deal.type ||
                        deal.dealType ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    type === "store" ||
                    type === "storesale" ||
                    type === "store sale" ||
                    type === "sale"
                );

            }
        );


    // ------------------------------------------
    // IF NONE
    // ------------------------------------------

    if (
        !storeSales.length
    ) {

        storeSaleGrid.innerHTML = `
            <p class="loading">
                No active store sales.
            </p>
        `;

        return;

    }


    // ------------------------------------------
    // CARDS
    // ------------------------------------------

    storeSales.forEach(
        deal => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "store-sale-card";


            const image =
                getImage(
                    deal
                );


            const title =
                deal.title ||
                deal.name ||
                "Store Sale";


            const store =
                deal.store ||
                deal.platform ||
                "Gaming Store";


            const description =
                deal.description ||
                deal.summary ||
                "";


            const link =
                deal.url ||
                deal.link ||
                deal.storeUrl ||
                "";


            card.innerHTML = `

                <div class="store-sale-image-wrap">

                    <img
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(title)}"
                        class="store-sale-image"
                        loading="lazy"
                    >

                </div>


                <div class="store-sale-content">

                    <span class="deal-store">
                        ${escapeHTML(store)}
                    </span>


                    <h3>
                        ${escapeHTML(title)}
                    </h3>


                    ${
                        description
                        ?
                        `
                        <p>
                            ${escapeHTML(description)}
                        </p>
                        `
                        :
                        ""
                    }


                    ${
                        link
                        ?
                        `
                        <a
                            class="deal-button"
                            href="${escapeAttribute(link)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Sale →
                        </a>
                        `
                        :
                        ""
                    }

                </div>

            `;


            setupImageFallback(
                card
            );


            storeSaleGrid.appendChild(
                card
            );

        }
    );

}


// ==================================================
// RENDER GAME DEALS
// ==================================================

function renderGameDeals(
    deals
) {

    if (!dealGrid) {

        console.warn(
            "GAMEREOX DEALS: #dealGrid does not exist."
        );

        return;

    }


    dealGrid.innerHTML =
        "";


    // ------------------------------------------
    // GAME DEALS
    // ------------------------------------------

    const gameDeals =
        deals.filter(
            deal => {

                const type =
                    String(
                        deal.type ||
                        deal.dealType ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    type === "game" ||
                    type === "game deal" ||
                    type === "deal"
                );

            }
        );


    // ------------------------------------------
    // IF NONE
    // ------------------------------------------

    if (
        !gameDeals.length
    ) {

        dealGrid.innerHTML = `
            <p class="loading">
                No active game deals.
            </p>
        `;

        return;

    }


    // ------------------------------------------
    // CARDS
    // ------------------------------------------

    gameDeals.forEach(
        deal => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "deal-card";


            const image =
                getImage(
                    deal
                );


            const title =
                deal.title ||
                deal.name ||
                "Game Deal";


            const store =
                deal.store ||
                deal.platform ||
                "";


            const originalPrice =
                deal.originalPrice ||
                deal.oldPrice ||
                "";


            const salePrice =
                deal.salePrice ||
                deal.discountPrice ||
                deal.price ||
                "";


            const discount =
                deal.discount ||
                "";


            const link =
                deal.url ||
                deal.link ||
                deal.storeUrl ||
                "";


            card.innerHTML = `

                <div class="deal-image-wrap">

                    <img
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(title)}"
                        class="deal-image"
                        loading="lazy"
                    >

                    ${
                        discount
                        ?
                        `
                        <span class="deal-discount">
                            ${escapeHTML(discount)}
                        </span>
                        `
                        :
                        ""
                    }

                </div>


                <div class="deal-content">

                    <h3>
                        ${escapeHTML(title)}
                    </h3>


                    ${
                        store
                        ?
                        `
                        <p class="deal-store">
                            ${escapeHTML(store)}
                        </p>
                        `
                        :
                        ""
                    }


                    <div class="deal-price">

                        ${
                            originalPrice
                            ?
                            `
                            <span class="deal-old-price">
                                ${escapeHTML(originalPrice)}
                            </span>
                            `
                            :
                            ""
                        }


                        ${
                            salePrice
                            ?
                            `
                            <strong>
                                ${escapeHTML(salePrice)}
                            </strong>
                            `
                            :
                            ""
                        }

                    </div>


                    ${
                        link
                        ?
                        `
                        <a
                            class="deal-button"
                            href="${escapeAttribute(link)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Deal →
                        </a>
                        `
                        :
                        ""
                    }

                </div>

            `;


            setupImageFallback(
                card
            );


            dealGrid.appendChild(
                card
            );

        }
    );

}


// ==================================================
// IMAGE
// ==================================================

function getImage(
    deal
) {

    return (
        deal.image ||
        deal.imageUrl ||
        deal.cover ||
        deal.thumbnail ||
        "./images/placeholder.jpg"
    );

}


// ==================================================
// IMAGE FALLBACK
// ==================================================

function setupImageFallback(
    card
) {

    const image =
        card.querySelector(
            "img"
        );


    if (!image) {
        return;
    }


    image.onerror =
        function () {

            this.onerror =
                null;

            this.src =
                "./images/placeholder.jpg";

        };

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

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