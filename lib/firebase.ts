// firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVad0qcojBUpwySAek4ihN1kcTP0_qEN4",
  authDomain: "nothingbuttrivia-68640.firebaseapp.com",
  projectId: "nothingbuttrivia-68640",
  storageBucket: "nothingbuttrivia-68640.firebasestorage.app",
  messagingSenderId: "648467137933",
  appId: "1:648467137933:web:936a64647cdf31b3d2a9c4",
  measurementId: "G-X6PR0VSKTE"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const firebaseAuth = getAuth(app);
