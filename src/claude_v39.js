import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Lock, User, Mail, Clock, DoorOpen, DoorClosed, Users, Shield, Settings, Trash2, UserPlus } from 'lucide-react';

// =============================================
// CONSTANTS AND CONFIGURATION
// =============================================

const USER_ROLES = {
  USER: 'user',
  ADMINISTRATOR: 'administrator'
};

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

const validateTimeFormat = (time) => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

// =============================================
// FIREBASE SERVICE
// =============================================

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.mockUsers = new Map([
      ['admin@example.com', {
        uid: 'admin-123',
        email: 'admin@example.com',
        displayName: 'Admin User',
        role: USER_ROLES.ADMINISTRATOR,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lastLogin: new Date().toISOString()
      }],
      ['user@example.com', {
        uid: 'user-456',
        email: 'user@example.com',
        displayName: 'Regular User',
        role: USER_ROLES.USER,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        lastLogin: new Date(Date.now() - 3600000).toISOString()
      }]
    ]);
  }

  async initialize() {
    if (this.isInitialized) return;
    console.log('Firebase initialized (mock mode)');
    this.isInitialized = true;
  }

  async signInWithEmailAndPassword(email, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = this.mockUsers.get(email);
    if (mockUser && password === 'password') {
      return { user: mockUser };
    }
    throw new Error('Invalid credentials');
  }

  async createUserWithEmailAndPassword(email, password) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser = {
      uid: `user-${Date.now()}`,
      email: email,
      displayName: email.split('@')[0],
      role: USER_ROLES.USER,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    this.mockUsers.set(email, newUser);
    return { user: newUser };
  }

  async signOut() {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('User signed out');
  }

  async getUserDocument(uid) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = Array.from(this.mockUsers.values()).find(u => u.uid === uid);
    return user ? { exists: true, data: user } : { exists: false };
  }

  async createUserDocument(uid, userData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = Array.from(this.mockUsers.entries()).find(([_, u]) => u.uid === uid);
    if (user) {
      this.mockUsers.set(user[0], { ...user[1], ...userData });
    }
    console.log('User document created:', userData);
  }

  async updateUserDocument(uid, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = Array.from(this.mockUsers.entries()).find(([_, u]) => u.uid === uid);
    if (user) {
      this.mockUsers.set(user[0], { ...user[1], ...updates });
    }
    console.log('User document updated:', updates);
  }

  async getAllUsers() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return Array.from(this.mockUsers.values()).map(user => ({ id: user.uid, ...user }));
  }

  async deleteUserDocument(uid) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userEntry = Array.from(this.mockUsers.entries()).find(([_, u]) => u.uid === uid);
    if (userEntry) {
      this.mockUsers.delete(userEntry[0]);
    }
    console.log('User document deleted:', uid);
  }

  async addUserDocument(userData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newUser = {
      uid: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.mockUsers.set(userData.email, newUser);
    return { id: newUser.uid };
  }
}

// =============================================
// SERVICES
// =============================================

const firebaseService = new FirebaseService();

const authService = {
  initialize: async () => {
    await firebaseService.initialize();
  },

  login: async (credentials) => {
    try {
      const result = await firebaseService.signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      
      const userDoc = await firebaseService.getUserDocument(result.user.uid);
      
      let userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email.split('@')[0],
        role: USER_ROLES.USER
      };
      
      if (userDoc.exists) {
        userData = { ...userData, ...userDoc.data };
        await firebaseService.updateUserDocument(result.user.uid, {
          lastLogin: new Date().toISOString()
        });
      } else {
        userData.createdAt = new Date().toISOString();
        userData.lastLogin = new Date().toISOString();
        await firebaseService.createUserDocument(result.user.uid, userData);
      }
      
      return { success: true, user: userData };
    } catch (error) {
      throw new Error(error.message || 'Authentication failed');
    }
  },
  
  register: async (userData) => {
    try {
      const result = await firebaseService.createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );
      
      const newUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: userData.username || result.user.email.split('@')[0],
        role: USER_ROLES.USER,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      await firebaseService.createUserDocument(result.user.uid, newUser);
      return { success: true, user: newUser };
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },
  
  logout: async () => {
    await firebaseService.signOut();
  },

  onAuthStateChanged: (callback) => {
    setTimeout(() => callback(null), 100);
    return () => {};
  }
};

const userService = {
  getAllUsers: async () => {
    try {
      return await firebaseService.getAllUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  updateUserRole: async (userId, newRole) => {
    try {
      await firebaseService.updateUserDocument(userId, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },
  
  deleteUser: async (userId) => {
    try {
      await firebaseService.deleteUserDocument(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
  
  createUser: async (userData) => {
    try {
      const newUser = {
        email: userData.email,
        displayName: userData.displayName,
        role: USER_ROLES.USER,
        createdBy: userData.createdBy
      };
      
      const result = await firebaseService.addUserDocument(newUser);
      return { id: result.id, ...newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  syncUserWithAuth: async (authUser) => {
    try {
      const userDoc = await firebaseService.getUserDocument(authUser.uid);
      
      if (!userDoc.exists) {
        const userData = {
          email: authUser.email,
          displayName: authUser.displayName || authUser.email.split('@')[0],
          role: USER_ROLES.USER,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        await firebaseService.createUserDocument(authUser.uid, userData);
        return userData;
      } else {
        await firebaseService.updateUserDocument(authUser.uid, {
          lastLogin: new Date().toISOString()
        });
        return userDoc.data;
      }
    } catch (error) {
      console.error('Error syncing user with auth:', error);
      throw error;
    }
  }
};

const apiService = {
  post: async (endpoint, data) => {
    console.log(`API POST to ${endpoint}:`, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
  
  getMessages: async (before = null, after = null, limit = 50) => {
    console.log(`API GET messages - before: ${before}, after: ${after}, limit: ${limit}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const now = new Date();
    const messages = [];
    
    for (let i = 0; i < limit; i++) {
      const timestamp = new Date(now.getTime() - (i * 60000));
      messages.push({
        _id: `msg_${timestamp.getTime()}_${i}`,
        message: `System message ${i + 1}: Door operation completed successfully`,
        timestamp: timestamp.toISOString(),
        createdAt: timestamp
      });
    }
    
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return {
      success: true,
      messages: messages,
      hasMore: Math.random() > 0.3
    };
  }
};

// =============================================
// HOOKS
// =============================================

const useFormValidation = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const setError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    errors,
    handleInputChange,
    setError,
    clearErrors,
    resetForm,
    setFormData
  };
};

const useSocketData = () => {
  const [socketData, setSocketData] = useState({
    currentTime: '',
    indicators: [false, false, false, false, false],
    doorStatus: 'Unknown'
  });

  useEffect(() => {
    const mockInterval = setInterval(() => {
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
    }, 2000);
    
    return () => clearInterval(mockInterval);
  }, []);

  return socketData;
};

// =============================================
// COMPONENTS
// =============================================

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="text-center">
      <div className={`inline-block animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mb-2`}></div>
      <div className="text-gray-600">{text}</div>
    </div>
  );
};

const FormInput = ({ label, type = 'text', name, value, onChange, error, placeholder, icon: Icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition duration-200 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white',
    success: 'bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white',
    danger: 'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
      {Icon && !loading && <Icon size={16} className="mr-2" />}
      {children}
    </button>
  );
};

const StatusIndicator = ({ active, label }) => (
  <div className="flex flex-col items-center">
    <div 
      className={`w-12 h-12 rounded-full border-4 transition-colors duration-300 ${
        active 
          ? 'bg-red-500 border-red-600 shadow-lg shadow-red-500/30' 
          : 'bg-gray-300 border-gray-400'
      }`}
    />
    <span className="text-xs text-gray-600 mt-2">{label}</span>
  </div>
);

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
    {title && <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>}
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

const UserTable = ({ users, currentUserId, onRoleChange, onDeleteUser }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            User
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Role
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Last Login
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {users.map((userData) => (
          <tr key={userData.id}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {userData.displayName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {userData.email}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <select
                value={userData.role}
                onChange={(e) => onRoleChange(userData.id, e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={userData.id === currentUserId}
              >
                <option value={USER_ROLES.USER}>User</option>
                <option value={USER_ROLES.ADMINISTRATOR}>Administrator</option>
              </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {userData.createdAt ? formatDate(userData.createdAt) : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {userData.lastLogin ? formatDate(userData.lastLogin) : 'Never'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              {userData.id !== currentUserId && (
                <button
                  onClick={() => onDeleteUser(userData.id)}
                  className="text-red-600 hover:text-red-900 flex items-center"
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MessageLog = ({ messages, loading, hasMore, onScroll }) => (
  <div 
    className="border border-gray-300 rounded-lg p-4 h-64 overflow-y-auto bg-gray-50"
    onScroll={onScroll}
  >
    {loading && (
      <div className="text-center text-gray-500 py-2">
        <LoadingSpinner size="sm" text="Loading messages..." />
      </div>
    )}
    
    {messages.length === 0 && !loading ? (
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
    
    {!hasMore && messages.length > 0 && (
      <div className="text-center text-gray-400 text-xs py-2 border-t mt-2">
        End of messages
      </div>
    )}
  </div>
);

// =============================================
// PAGES
// =============================================

const AuthPage = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { formData, errors, handleInputChange, setError, clearErrors } = useFormValidation({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (isSignUp && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      Object.entries(newErrors).forEach(([field, message]) => {
        setError(field, message);
      });
      return false;
    }
    return true;
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
      setError('submit', error.message);
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
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800 font-medium">Demo Credentials:</div>
            <div className="text-xs text-blue-600 mt-1">
              <div>Admin: admin@example.com / password</div>
              <div>User: user@example.com / password</div>
            </div>
            <div className="text-xs text-blue-500 mt-2">
              Firebase Authentication & Firestore Integration Ready
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isSignUp && (
            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              placeholder="Enter your username"
              icon={User}
            />
          )}

          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="Enter your email"
            icon={Mail}
          />

          <div>
            <FormInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="Enter your password"
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              style={{ marginTop: '16px' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {isSignUp && (
            <FormInput
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              icon={Lock}
            />
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            loading={loading}
            className="w-full"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
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

const HomePage = ({ user, onLogout, onNavigateToAdmin }) => {
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [loading, setLoading] = useState({});
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [scrollPosition, setScrollPosition] = useState('bottom');

  const socketData = useSocketData();

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
    if (time && validateTimeFormat(time)) {
      handleApiCall(endpoint, { time });
    }
  }, [handleApiCall]);

  const handleMessageScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    if (isAtTop && scrollPosition !== 'top') {
      setScrollPosition('top');
    } else if (isAtBottom && scrollPosition !== 'bottom') {
      setScrollPosition('bottom');
    } else if (!isAtTop && !isAtBottom) {
      setScrollPosition('middle');
    }
  };

  const indicatorLabels = ['Up', 'Down', 'Up cmd', 'Down cmd', 'Stop cmd'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">
              Rodighiero Chickencoop Control
            </h1>
            {user && (
              <div className="flex items-center space-x-4">
                {user.role === USER_ROLES.ADMINISTRATOR && (
                  <Button
                    variant="purple"
                    onClick={onNavigateToAdmin}
                    icon={Shield}
                  >
                    Admin Panel
                  </Button>
                )}
                <span className="text-gray-600">Welcome, {user.displayName || user.email}</span>
                <Button
                  variant="danger"
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Time Display */}
        <Card title="Chicken Coop Time" className="mb-6">
          <div className="flex items-center justify-center">
            <Clock className="text-blue-600 mr-3" size={32} />
            <div className="text-4xl font-bold text-gray-800">
              {socketData.currentTime || '--:-- --'}
            </div>
          </div>
        </Card>

        {/* Status Indicators */}
        <Card title="Door Status and Control Signals" className="mb-6">
          <div className="flex justify-center space-x-8">
            {socketData.indicators.map((active, index) => (
              <StatusIndicator
                key={index}
                active={active}
                label={indicatorLabels[index]}
              />
            ))}
          </div>
        </Card>

        {/* Control Panel */}
        <Card title="Control Panel">
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
                  <Button
                    variant="danger"
                    onClick={() => handleApiCall('/close')}
                    loading={loading['/close']}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => handleApiCall('/open')}
                    loading={loading['/open']}
                    className="flex-1"
                  >
                    Open
                  </Button>
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
        </Card>

        {/* Message Log */}
        <Card title="System Messages" className="mt-6">
          <MessageLog
            messages={messages}
            loading={messageLoading}
            hasMore={hasMoreMessages}
            onScroll={handleMessageScroll}
          />
          <div className="mt-2 text-xs text-gray-500 text-center">
            Scroll to top for earlier messages • Scroll to bottom for later messages
          </div>
        </Card>
      </main>
    </div>
  );
};

const AdminPage = ({ user, onLogout, onNavigateHome }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  const { formData: newUserData, errors, handleInputChange, setError, clearErrors, resetForm } = useFormValidation({
    email: '',
    displayName: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleCreateUser = async () => {
    const newErrors = {};
    
    if (!newUserData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(newUserData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!newUserData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      Object.entries(newErrors).forEach(([field, message]) => {
        setError(field, message);
      });
      return;
    }
    
    try {
      const createdUser = await userService.createUser({
        ...newUserData,
        createdBy: user.uid
      });
      setUsers(prev => [...prev, createdUser]);
      resetForm();
      setShowCreateUser(false);
    } catch (error) {
      console.error('Error creating user:', error);
      setError('submit', 'Failed to create user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">
              Administration Panel
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="primary"
                onClick={onNavigateHome}
                icon={Settings}
              >
                Control Panel
              </Button>
              <span className="text-gray-600">Welcome, {user.displayName}</span>
              <Button
                variant="danger"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Users className="mr-2" size={24} />
              User Management
            </h2>
            <Button
              variant="success"
              onClick={() => setShowCreateUser(true)}
              icon={UserPlus}
            >
              Add User
            </Button>
          </div>

          {loading ? (
            <div className="py-8">
              <LoadingSpinner text="Loading users..." />
            </div>
          ) : (
            <UserTable
              users={users}
              currentUserId={user.uid}
              onRoleChange={handleRoleChange}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </Card>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateUser}
          onClose={() => {
            setShowCreateUser(false);
            resetForm();
          }}
          title="Create New User"
        >
          <div className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={newUserData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter email address"
            />

            <FormInput
              label="Display Name"
              name="displayName"
              value={newUserData.displayName}
              onChange={handleInputChange}
              error={errors.displayName}
              placeholder="Enter display name"
            />

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateUser(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="purple"
              onClick={handleCreateUser}
            >
              Create User
            </Button>
          </div>
        </Modal>
      </main>
    </div>
  );
};

// =============================================
// MAIN APP
// =============================================

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