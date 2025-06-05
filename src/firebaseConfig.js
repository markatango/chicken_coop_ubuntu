// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore if you plan to use it

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkphFjuA9qJWV9p8wSRdbi_oTyTaVmh84",
  authDomain: "chickencoop-6cfba.firebaseapp.com",
  projectId: "chickencoop-6cfba",
  storageBucket: "chickencoop-6cfba.firebasestorage.app",
  messagingSenderId: "534064913642",
  appId: "1:534064913642:web:b66600c7234bb7e0944b93",
  measurementId: "G-ZRV70B09GB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // Export Firestore instance if needed

// Optional: You can set the authentication persistence here,
// but the default is typically sufficient (Auth.Persistence.LOCAL)
// import { indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence, setPersistence } from 'firebase/auth';
// setPersistence(auth, indexedDBLocalPersistence); // Example: use IndexedDB for persistence
