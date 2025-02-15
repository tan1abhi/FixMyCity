// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add this import



const firebaseConfig = {
  apiKey: "AIzaSyA20itk6pL9B5CyRg2qaJb6Ahr1_OgN6wU",
  authDomain: "fixmycity-a7733.firebaseapp.com",
  projectId: "fixmycity-a7733",
  storageBucket: "fixmycity-a7733.appspot.com",
  messagingSenderId: "218560630024",
  appId: "1:218560630024:web:dc331aa9b12b4c6db070bd",
  measurementId: "G-X5GWE2ZCXT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);
const firestore = getFirestore(app);


export { auth, db, googleProvider, storage , firestore};