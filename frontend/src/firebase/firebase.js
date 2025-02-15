// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA20itk6pL9B5CyRg2qaJb6Ahr1_OgN6wU",
  authDomain: "fixmycity-a7733.firebaseapp.com",
  projectId: "fixmycity-a7733",
  storageBucket: "fixmycity-a7733.firebasestorage.app",
  messagingSenderId: "218560630024",
  appId: "1:218560630024:web:dc331aa9b12b4c6db070bd",
  measurementId: "G-X5GWE2ZCXT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth();

export { auth, app  };