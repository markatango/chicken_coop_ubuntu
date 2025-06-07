// =============================================
// MAIN APP
// =============================================
import HomePage from './pages/homepage';
import AdminPage from './pages/adminpage';
import AuthPage from './pages/authpage';
import authService from './services/authService';
import { useState, useEffect } from 'react';
import LoadingSpinner from './components/loadingspinner';


const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await authService.initialize();
        
        const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
          if (authUser) {
            try {
              const userData = await userService.syncUserWithAuth(authUser);
              setUser({ ...authUser, ...userData });
            } catch (error) {
              console.error('Error syncing user:', error);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setCurrentPage('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigateToAdmin = () => {
    if (user && user.role === USER_ROLES.ADMINISTRATOR) {
      setCurrentPage('admin');
    }
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Initializing Firebase..." />
          <div className="text-sm text-gray-500 mt-2">Setting up authentication and database</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (currentPage === 'admin' && user.role === USER_ROLES.ADMINISTRATOR) {
    return (
      <AdminPage 
        user={user} 
        onLogout={handleLogout}
        onNavigateHome={handleNavigateToHome}
      />
    );
  }

  return (
    <HomePage 
      user={user} 
      onLogout={handleLogout}
      onNavigateToAdmin={handleNavigateToAdmin}
    />
  );
};

export default App;