// src/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore if you plan to use it

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your project's API key
  authDomain: "chickencoop-6cfba.firebaseapp.com", // Your project's auth domain
  projectId: "chickencoop-6cfba", // Your project ID
  storageBucket: "chickencoop-6cfba.appspot.com", // Your project's storage bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your sender ID
  appId: "YOUR_APP_ID", // Replace with your app ID
  measurementId: "YOUR_MEASUREMENT_ID" // Optional: Replace with your measurement ID if using Analytics
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
