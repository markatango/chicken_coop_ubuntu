// src/AuthStatus.js

import React from 'react';
import { useAuth } from './AuthContext'; // Import our custom hook

const AuthStatus = () => {
  const { user, signOut } = useAuth(); // Get user and signOut function

  if (!user) {
    // This component might only be rendered if a user exists,
    // but this check is still good practice.
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
      // Optionally display an error message to the user
    }
  };

  return (
    <div>
      <p>Welcome, {user.email}!</p> {/* Display user email */}
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default AuthStatus;
