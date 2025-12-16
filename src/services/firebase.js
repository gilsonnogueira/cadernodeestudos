import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD4m05WnzUzYyqq_moT5m1LhBp2_yENUK8",
    authDomain: "cadernodeestudos-68f9b.firebaseapp.com",
    projectId: "cadernodeestudos-68f9b",
    storageBucket: "cadernodeestudos-68f9b.firebasestorage.app",
    messagingSenderId: "377202559516",
    appId: "1:377202559516:web:57697ba160020a85b56dd9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
