
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3GhXbC6fsLkcqL65ZOWicCSj6SKdP3lE",
    authDomain: "caderno-de-estudos.firebaseapp.com",
    projectId: "caderno-de-estudos",
    storageBucket: "caderno-de-estudos.firebasestorage.app",
    messagingSenderId: "780290875420",
    appId: "1:780290875420:web:9d01168e5ed3c043543fd9",
    measurementId: "G-2V6YEN36TS"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// console.log("Firebase Initialized");
