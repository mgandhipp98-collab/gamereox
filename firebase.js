import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";


import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const firebaseConfig = {

    apiKey: "AIzaSyC-n8qwLQGGTqqKC-Cgb9eYwIe6H8NDzos",

    authDomain:
        "gamereox-36268.firebaseapp.com",

    projectId:
        "gamereox-36268",

    storageBucket:
        "gamereox-36268.firebasestorage.app",

    messagingSenderId:
        "564954281912",

    appId:
        "1:564954281912:web:c4a0a9f48b0e63ebe4414d"

};


const app =
    initializeApp(
        firebaseConfig
    );


export const db =
    getFirestore(app);


export const auth =
    getAuth(app);