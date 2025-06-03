import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Lock, User, Mail, Clock, DoorOpen, DoorClosed } from 'lucide-react';

// Mock authentication functions (replace with actual implementation)
const authService = {
  login: async (credentials) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (credentials.username === 'admin' && credentials.password === 'password') {
      const user = { id: 1, username: 'admin', email: 'admin@example.com' };
      return { success: true, user };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = { id: Date.now(), ...userData };
    return { success: true, user };
  },
  
  logout: () => {
    // Clear user data - in real app, clear tokens/session
  },
  
  getCurrentUser: () => {
    // In real app, check for valid token/session
    return null; // Start logged out for demo
  },
  
  socialLogin: async (provider) => {
    // Simulate social login
    await new Promise(resolve => setTimeout(resolve, 1500));
    const user = { id: Date.now(), username: `${provider}_user`, email: `user@${provider}.com` };
    return { success: true, user };
  }
};

// API service for backend communication
const apiService = {
  post: async (endpoint, data) => {
    console.log(`API POST to ${endpoint}:`, data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
  
  getMessages: async (before = null, after = null, limit = 50) => {
    console.log(`API GET messages - before: ${before}, after: ${after}, limit: ${limit}`);
    // Simulate API call to MongoDB
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock message data
    const now = new Date();
    const messages = [];
    
    for (let i = 0; i < limit; i++) {
      const timestamp = new Date(now.getTime() - (i * 60000)); // Messages every minute
      messages.push({
        _id: `msg_${timestamp.getTime()}_${i}`,
        message: `System message ${i + 1}: Door operation completed successfully`,
        timestamp: timestamp.toISOString(),
        createdAt: timestamp
      });
    }
    
    // Sort by timestamp (increasing order)
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return {
      success: true,
      messages: messages,
      hasMore: Math.random() > 0.3 // Simulate sometimes having more messages
    };
  }
};

const AuthPage = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await authService.register(formData);
      } else {
        result = await authService.login(formData);
      }
      onLogin(result.user);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    try {
      const result = await authService.socialLogin(provider);
      onLogin(result.user);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Sign up to control your chicken coop' : 'Sign in to your account'}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your username"
              />
            </div>
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Facebook
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ user, onLogout }) => {
  const [socketData, setSocketData] = useState({
    currentTime: '',
    indicators: [false, false, false, false, false],
    doorStatus: 'Unknown'
  });
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [loading, setLoading] = useState({});
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [scrollPosition, setScrollPosition] = useState('bottom');

  // Load initial messages
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setMessageLoading(true);
        const response = await apiService.getMessages();
        if (response.success) {
          setMessages(response.messages);
          setHasMoreMessages(response.hasMore);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setMessageLoading(false);
      }
    };
    
    loadInitialMessages();
  }, []);

  // Load earlier messages (when scrolled to top)
  const loadEarlierMessages = async () => {
    if (!hasMoreMessages || messageLoading) return;
    
    try {
      setMessageLoading(true);
      const oldestMessage = messages[0];
      const response = await apiService.getMessages(oldestMessage?.timestamp, null, 25);
      
      if (response.success && response.messages.length > 0) {
        setMessages(prev => [...response.messages, ...prev]);
        setHasMoreMessages(response.hasMore);
      }
    } catch (error) {
      console.error('Error loading earlier messages:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  // Load later messages (when scrolled to bottom)
  const loadLaterMessages = async () => {
    if (!hasMoreMessages || messageLoading) return;
    
    try {
      setMessageLoading(true);
      const newestMessage = messages[messages.length - 1];
      const response = await apiService.getMessages(null, newestMessage?.timestamp, 25);
      
      if (response.success && response.messages.length > 0) {
        setMessages(prev => [...prev, ...response.messages]);
        setHasMoreMessages(response.hasMore);
      }
    } catch (error) {
      console.error('Error loading later messages:', error);
    } finally {
      setMessageLoading(false);
    }
  };

  // Handle scroll events
  const handleMessageScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    if (isAtTop && scrollPosition !== 'top') {
      setScrollPosition('top');
      loadEarlierMessages();
    } else if (isAtBottom && scrollPosition !== 'bottom') {
      setScrollPosition('bottom');
      loadLaterMessages();
    } else if (!isAtTop && !isAtBottom) {
      setScrollPosition('middle');
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Keep only the most recent 50 messages
  useEffect(() => {
    if (messages.length > 50) {
      setMessages(prev => prev.slice(-50));
    }
  }, [messages]);
  useEffect(() => {
    let ws = null;
    
    const connectWebSocket = () => {
      // Replace 'ws://localhost:3001' with your actual WebSocket server URL
      try {
        ws = new WebSocket('ws://localhost:3001');
        
        ws.onopen = () => {
          console.log('WebSocket connected');
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle different message types from backend
            if (data.type === 'time') {
              setSocketData(prev => ({ ...prev, currentTime: data.value }));
            } else if (data.type === 'indicators') {
              setSocketData(prev => ({ ...prev, indicators: data.value }));
            } else if (data.type === 'doorStatus') {
              setSocketData(prev => ({ ...prev, doorStatus: data.value }));
            } else if (data.type === 'fullUpdate') {
              // Handle complete state update
              setSocketData(prev => ({
                ...prev,
                currentTime: data.currentTime || prev.currentTime,
                indicators: data.indicators || prev.indicators,
                doorStatus: data.doorStatus || prev.doorStatus
              }));
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.log('WebSocket not available, using mock data');
      }
    };
    
    // Start connection
    connectWebSocket();
    
    // Mock data for demonstration when WebSocket is not available
    const mockInterval = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        
        setSocketData(prev => ({
          ...prev,
          currentTime: timeString,
          indicators: [
            Math.random() > 0.5,
            Math.random() > 0.5,
            Math.random() > 0.5,
            Math.random() > 0.5,
            Math.random() > 0.5
          ],
          doorStatus: Math.random() > 0.5 ? 'Open' : 'Closed'
        }));
      }
    }, 2000);
    
    return () => {
      if (ws) {
        ws.close();
      }
      clearInterval(mockInterval);
    };
  }, []);

  const handleApiCall = useCallback(async (endpoint, data = null) => {
    setLoading(prev => ({ ...prev, [endpoint]: true }));
    try {
      await apiService.post(endpoint, data);
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  }, []);

  const handleTimeSubmit = useCallback((endpoint, time) => {
    if (time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      handleApiCall(endpoint, { time });
    }
  }, [handleApiCall]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">
              Rodighiero Chickencoop Control
            </h1>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.username}</span>
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Time Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Chicken Coop Time</h2>
          <div className="flex items-center justify-center">
            <Clock className="text-blue-600 mr-3" size={32} />
            <div className="text-4xl font-bold text-gray-800">
              {socketData.currentTime || '--:-- --'}
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Door Status and Control Signals</h2>
          <div className="flex justify-center space-x-8">
            {socketData.indicators.map((active, index) => {
              const labels = ['Up', 'Down', 'Up cmd', 'Down cmd', 'Stop cmd'];
              return (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-full border-4 transition-colors duration-300 ${
                      active 
                        ? 'bg-red-500 border-red-600 shadow-lg shadow-red-500/30' 
                        : 'bg-gray-300 border-gray-400'
                    }`}
                  />
                  <span className="text-xs text-gray-600 mt-2">{labels[index]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Control Panel</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Door Status and Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Door Status
                </label>
                <div className="flex items-center space-x-3">
                  {socketData.doorStatus === 'Open' ? (
                    <DoorOpen className="text-green-600" size={24} />
                  ) : (
                    <DoorClosed className="text-red-600" size={24} />
                  )}
                  <input
                    type="text"
                    value={socketData.doorStatus}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-medium"
                    maxLength={20}
                  />
                </div>
              </div>

              {user && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApiCall('/close')}
                    disabled={loading['/close']}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    {loading['/close'] ? 'Closing...' : 'Close'}
                  </button>
                  <button
                    onClick={() => handleApiCall('/open')}
                    disabled={loading['/open']}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    {loading['/open'] ? 'Opening...' : 'Open'}
                  </button>
                </div>
              )}
            </div>

            {/* Time Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Open Time
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  onBlur={() => handleTimeSubmit('/setopentime', openTime)}
                  disabled={!user || loading['/setopentime']}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-800'
                  } ${loading['/setopentime'] ? 'opacity-50' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Close Time
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  onBlur={() => handleTimeSubmit('/setclosetime', closeTime)}
                  disabled={!user || loading['/setclosetime']}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-800'
                  } ${loading['/setclosetime'] ? 'opacity-50' : ''}`}
                />
              </div>

              {!user && (
                <p className="text-sm text-gray-500 italic">
                  Sign in to control door timing
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">System Messages</h2>
          <div 
            className="border border-gray-300 rounded-lg p-4 h-64 overflow-y-auto bg-gray-50"
            onScroll={handleMessageScroll}
          >
            {messageLoading && (
              <div className="text-center text-gray-500 py-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading messages...</span>
              </div>
            )}
            
            {messages.length === 0 && !messageLoading ? (
              <div className="text-center text-gray-500 py-8">
                No messages available
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div key={msg._id || index} className="text-sm">
                    <span className="text-gray-500 font-mono text-xs">
                      [{formatTimestamp(msg.timestamp)}]
                    </span>
                    <span className="ml-2 text-gray-800">
                      {msg.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {!hasMoreMessages && messages.length > 0 && (
              <div className="text-center text-gray-400 text-xs py-2 border-t mt-2">
                End of messages
              </div>
            )}
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            Scroll to top for earlier messages • Scroll to bottom for later messages
          </div>
        </div>
      </main>
    </div>
  );
};

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