// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore if you plan to use it


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: window._env_.REACT_APP_APIKEY,
  authDomain: window._env_.REACT_APP_AUTHDOMAIN,
  projectId: window._env_.REACT_APP_PROJECTID,
  storageBucket: window._env_.REACT_APP_STORAGEBUCKET,
  messagingSenderId: window._env_.REACT_APP_MESSAGINGSENDINGID,
  appId: window._env_.REACT_APP_APPID,
  measurementId: window._env_.REACT_APP_MEASUREMENTID
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
