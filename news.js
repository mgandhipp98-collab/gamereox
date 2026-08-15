import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const id = localStorage.getItem("selectedNews");

const container = document.getElementById("articleContainer");


async function loadArticle(){

    try{

        if(!id){

            container.innerHTML = `
                <h2>News not found</h2>
            `;

            return;
        }


        const docRef = doc(db, "news", id);

        const snapshot = await getDoc(docRef);


        if(snapshot.exists()){

            const article = snapshot.data();


            container.innerHTML = `

                <div class="article-hero">

                    <img
                        class="article-image"
                        src="${article.image || 'images/news.jpg'}"
                        alt="${article.title || 'Gaming News'}"
                    >


                    <div class="hero-overlay">

                        <span>
                            ${article.category || "Gaming"}
                        </span>


                        <h1>
                            ${article.title || "Gaming News"}
                        </h1>


                        <div class="meta">

                            ${article.publishDate || ""}

                            ${article.author ? ` | ${article.author}` : ""}

                        </div>

                    </div>

                </div>



                <div class="article-content">


                    <h3>
                        ${article.relatedGame || "Gaming"}
                    </h3>


                    <p class="short">
                        ${article.summary || ""}
                    </p>


                    <hr>


                    <p class="full">
                        ${article.fullArticle || ""}
                    </p>



                    ${
                        article.youtube
                        ?
                        `

                        <div class="youtube-player">

                            <iframe
                                src="${article.youtube.replace(
                                    "watch?v=",
                                    "embed/"
                                )}"
                                title="YouTube video player"
                                allowfullscreen>
                            </iframe>

                        </div>

                        `
                        :
                        ""
                    }


                </div>

            `;


        }else{

            container.innerHTML = `
                <h2>News not found</h2>
            `;

        }


    }catch(error){

        console.error(
            "Article loading error:",
            error
        );

        container.innerHTML = `
            <h2>Error loading article</h2>
        `;

    }

}


loadArticle();