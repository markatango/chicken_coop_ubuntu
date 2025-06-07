// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore if you plan to use it
import { process_env } from '../env-config-process-local';

const { 
  REACT_APP_APIKEY,
  REACT_APP_AUTHDOMAIN,
  REACT_APP_PROJECTID,
  REACT_APP_STORAGEBUCKET,
  REACT_APP_MESSAGINGSENDINGID ,
  REACT_APP_APPID,
  REACT_APP_MEASUREMENTID,
} = process_env;


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: REACT_APP_APIKEY,
  authDomain: REACT_APP_AUTHDOMAIN,
  projectId: REACT_APP_PROJECTID,
  storageBucket: REACT_APP_STORAGEBUCKET,
  messagingSenderId: REACT_APP_MESSAGINGSENDINGID,
  appId: REACT_APP_APPID,
  measurementId: REACT_APP_MEASUREMENTID
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
