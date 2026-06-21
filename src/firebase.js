// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  
  apiKey: "AIzaSyBi1E_RIk0UrN6_fG7GTkzCztOgjavRdv8", 
  authDomain: "school-database-b5981.firebaseapp.com",
  projectId: "school-database-b5981",
  storageBucket: "school-database-b5981.appspot.com",
  messagingSenderId: "105403881102",
  appId: "1:105403881102:web:644846c867207c416f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Add this import at the top if you don't have it
// import { initializeApp } from "firebase/app";

// Add this to the absolute bottom of firebase.js
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
export const secondaryAuth = getAuth(secondaryApp);