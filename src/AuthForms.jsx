// src/AuthForms.js

import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Import our custom hook

const AuthForm = ({ isSignUp = false }) => {
  const { signIn, signUp } = useAuth(); // Get signIn and signUp functions from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true); // Indicate loading

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // If successful, Firebase context will update user state
      // and components using useAuth will re-render automatically.
    } catch (err) {
      // Handle Firebase Auth errors (e.g., 'auth/user-not-found', 'auth/wrong-password')
      setError(err.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
      </button>
    </form>
  );
};

export const SignInForm = () => <AuthForm isSignUp={false} />;
export const SignUpForm = () => <AuthForm isSignUp={true} />;
