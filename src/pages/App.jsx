import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Lock, User, Mail, Clock, DoorOpen, DoorClosed } from 'lucide-react';
import HomePage from './HomePage';
import AuthPage from './AuthPage';
import { authService} from '../services/authService';


const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <HomePage user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;