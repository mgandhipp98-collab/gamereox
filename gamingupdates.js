import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


console.log("Gaming Updates JS Loaded");
console.log(db);


const featuredContainer =
    document.getElementById("featuredContainer");

const newsContainer =
    document.getElementById("newsContainer");


async function loadNews() {
    
    try {
        
        const q = query(
            collection(db, "news"),
            where("status", "==", "Published"),
            orderBy("publishDate", "desc")
        );
        
        
        const snapshot = await getDocs(q);
        
        
        featuredContainer.innerHTML = "";
        newsContainer.innerHTML = "";
        
        
        snapshot.forEach((doc) => {
            
            const item = doc.data();
            
            const id = doc.id;
            
            
            /* ==========================
               FEATURED NEWS
            ========================== */
            
            if (item.featured) {
                
                featuredContainer.innerHTML += `

                    <div
                        class="featured-card"
                        onclick="openNews('${id}')"
                    >

                        <img
                            src="${item.image || 'images/news.jpg'}"
                            alt="${item.title || 'Gaming News'}"
                        >


                        <div class="featured-content">

                            <span>
                                ${item.category || ""}
                            </span>


                            <h3>
                                ${item.title || ""}
                            </h3>


                            <p>
                                ${item.summary || ""}
                            </p>


                            <small>
                                📅 ${item.publishDate || ""}
                                |
                                👤 ${item.author || ""}
                            </small>

                        </div>

                    </div>

                `;
            }
            
            
            /* ==========================
               LATEST NEWS
            ========================== */
            
            newsContainer.innerHTML += `

                <div
                    class="news-card"
                    onclick="openNews('${id}')"
                >

                    <img
                        src="${item.image || 'images/news.jpg'}"
                        alt="${item.title || 'Gaming News'}"
                    >


                    <div class="news-card-content">

                        <h3>
                            ${item.title || ""}
                        </h3>


                        <div class="news-date">
                            ${item.publishDate || ""}
                        </div>

                    </div>

                </div>

            `;
            
        });
        
        
        console.log(
            "Gaming news loaded:",
            snapshot.size
        );
        
    }
    
    catch (error) {
        
        console.error(
            "News loading error:",
            error.message
        );
        
        console.error(error);
        
    }
    
}


/* ==========================
   OPEN NEWS
========================== */

window.openNews = function(id) {
    
    localStorage.setItem(
        "selectedNews",
        id
    );
    
    window.location.href = "news.html";
    
};


/* ==========================
   LOAD NEWS
========================== */

loadNews();