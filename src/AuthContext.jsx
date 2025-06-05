// src/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from './firebaseConfig'; // Import the auth instance

// Create the context
const AuthContext = createContext(undefined);

// Custom hook to easily access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // State to track initial loading

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update the user state
      setLoading(false); // Set loading to false once the initial state is determined
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs only once on mount

  // --- Authentication Functions ---

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Firebase handles state change and persistence.
      // The onAuthStateChanged listener above will automatically update the user state.
    } catch (error) {
      console.error("Error signing in:", error.message);
      throw error; // Re-throw to allow components to handle errors
    }
  };

  const signUp = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Firebase handles state change and persistence.
      // The onAuthStateChanged listener above will automatically update the user state.
    } catch (error) {
      console.error("Error signing up:", error.message);
      throw error; // Re-throw to allow components to handle errors
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      // Firebase handles state change. The onAuthStateChanged listener above will set user to null.
    } catch (error) {
      console.error("Error signing out:", error.message);
      throw error; // Re-throw to allow components to handle errors
    }
  };

  // Provide the context value
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut: signOutUser, // Use the renamed signOutUser function
  };

  // While loading, you might render a loading spinner or null
  if (loading) {
      return <div>Loading authentication...</div>; // Or a better loading component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
