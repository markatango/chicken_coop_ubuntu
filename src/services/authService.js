// authService.js
import firebaseService from './firebaseService';
import { USER_ROLES } from '../config/userroles';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.unsubscribe = null;
  }

  /**
   * Initialize the auth service
   * @param {boolean} useEmulator - Whether to use Firebase emulators for development
   */
  async initialize(useEmulator = false) {
    try {
      await firebaseService.initialize(useEmulator);
      console.log('Auth service initialized successfully');
    } catch (error) {
      console.error('Auth service initialization error:', error);
      throw error;
    }
  }

  /**
   * Sign in user with email and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User data with Firestore profile
   */
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Sign in with Firebase Auth
      const userCredential = await firebaseService.signInWithEmailAndPassword(email, password);
      const authUser = userCredential.user;

      // Get or create user document in Firestore
      let userData = await this.syncUserWithFirestore(authUser);

      // Update last login
      await firebaseService.updateUserDocument(authUser.uid, {
        lastLogin: new Date().toISOString(),
        lastLoginTimestamp: new Date()
      });

      // Update local user data
      userData.lastLogin = new Date().toISOString();
      
      console.log('User logged in successfully:', userData.email);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user with email and password
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.username - User display name
   * @returns {Promise<Object>} New user data
   */
  async register(userData) {
    try {
      const { email, password, username } = userData;
      
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Create user with Firebase Auth
      const userCredential = await firebaseService.createUserWithEmailAndPassword(email, password);
      const authUser = userCredential.user;

      // Update auth profile with display name
      if (username) {
        await firebaseService.updateUserProfile({
          displayName: username
        });
      }

      // Create user document in Firestore
      const newUserData = {
        uid: authUser.uid,
        email: authUser.email,
        displayName: username || authUser.displayName || email.split('@')[0],
        role: USER_ROLES.USER, // Default role
        emailVerified: authUser.emailVerified,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        lastLoginTimestamp: new Date(),
        isActive: true
      };

      await firebaseService.createUserDocument(authUser.uid, newUserData);

      console.log('User registered successfully:', newUserData.email);
      return { success: true, user: newUserData };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async logout() {
    try {
      await firebaseService.signOut();
      this.currentUser = null;
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google
   * @returns {Promise<Object>} User data
   */
  async signInWithGoogle() {
    try {
      const userCredential = await firebaseService.signInWithGoogle();
      const authUser = userCredential.user;

      // Sync with Firestore
      const userData = await this.syncUserWithFirestore(authUser);

      console.log('Google sign-in successful:', userData.email);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Facebook
   * @returns {Promise<Object>} User data
   */
  async signInWithFacebook() {
    try {
      const userCredential = await firebaseService.signInWithFacebook();
      const authUser = userCredential.user;

      // Sync with Firestore
      const userData = await this.syncUserWithFirestore(authUser);

      console.log('Facebook sign-in successful:', userData.email);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Facebook sign-in error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   */
  async sendPasswordResetEmail(email) {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      await firebaseService.sendPasswordResetEmail(email);
      console.log('Password reset email sent to:', email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(updates) {
    try {
      const authUser = firebaseService.getCurrentUser();
      if (!authUser) {
        throw new Error('No authenticated user');
      }

      // Update Firebase Auth profile if display name is being updated
      if (updates.displayName) {
        await firebaseService.updateUserProfile({
          displayName: updates.displayName
        });
      }

      // Update Firestore document
      await firebaseService.updateUserDocument(authUser.uid, updates);

      // Get updated user data
      const userDoc = await firebaseService.getUserDocument(authUser.uid);
      const updatedUser = { uid: authUser.uid, ...userDoc.data };

      this.currentUser = updatedUser;
      console.log('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} Current user data or null
   */
  getCurrentUser() {
    const authUser = firebaseService.getCurrentUser();
    return authUser ? { ...authUser, ...this.currentUser } : null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!firebaseService.getCurrentUser();
  }

  /**
   * Check if current user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Role check result
   */
  hasRole(role) {
    return this.currentUser?.role === role;
  }

  /**
   * Check if current user is admin
   * @returns {boolean} Admin status
   */
  isAdmin() {
    return this.hasRole(USER_ROLES.ADMINISTRATOR);
  }

  /**
   * Set up auth state listener
   * @param {Function} callback - Callback function for auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    this.unsubscribe = firebaseService.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        try {
          // Get user data from Firestore
          const userDoc = await firebaseService.getUserDocument(authUser.uid);
          
          if (userDoc.exists) {
            const userData = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              ...userDoc.data
            };
            
            this.currentUser = userData;
            callback(userData);
          } else {
            // User exists in Auth but not in Firestore, sync them
            const syncedUser = await this.syncUserWithFirestore(authUser);
            callback(syncedUser);
          }
        } catch (error) {
          console.error('Error getting user data:', error);
          callback(null);
        }
      } else {
        this.currentUser = null;
        callback(null);
      }
    });

    return this.unsubscribe;
  }

  /**
   * Stop listening to auth state changes
   */
  unsubscribeAuthStateChange() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Sync Firebase Auth user with Firestore document
   * @param {Object} authUser - Firebase Auth user
   * @returns {Promise<Object>} Synced user data
   */
  async syncUserWithFirestore(authUser) {
    try {
      const userDoc = await firebaseService.getUserDocument(authUser.uid);
      
      if (!userDoc.exists) {
        // Create new user document
        const newUserData = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName || authUser.email.split('@')[0],
          role: USER_ROLES.USER,
          emailVerified: authUser.emailVerified,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          lastLoginTimestamp: new Date(),
          isActive: true,
          photoURL: authUser.photoURL || null,
          phoneNumber: authUser.phoneNumber || null
        };
        
        await firebaseService.createUserDocument(authUser.uid, newUserData);
        this.currentUser = newUserData;
        return newUserData;
      } else {
        // Update existing user document with any new auth data
        const updates = {
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          lastLogin: new Date().toISOString(),
          lastLoginTimestamp: new Date()
        };

        // Update display name if it's different
        if (authUser.displayName && authUser.displayName !== userDoc.data.displayName) {
          updates.displayName = authUser.displayName;
        }

        // Update photo URL if it's different
        if (authUser.photoURL && authUser.photoURL !== userDoc.data.photoURL) {
          updates.photoURL = authUser.photoURL;
        }

        await firebaseService.updateUserDocument(authUser.uid, updates);
        
        const updatedUserData = {
          uid: authUser.uid,
          ...userDoc.data,
          ...updates
        };
        
        this.currentUser = updatedUserData;
        return updatedUserData;
      }
    } catch (error) {
      console.error('Error syncing user with Firestore:', error);
      throw error;
    }
  }

  /**
   * Refresh current user data from Firestore
   * @returns {Promise<Object>} Updated user data
   */
  async refreshUserData() {
    try {
      const authUser = firebaseService.getCurrentUser();
      if (!authUser) {
        throw new Error('No authenticated user');
      }

      const userDoc = await firebaseService.getUserDocument(authUser.uid);
      if (userDoc.exists) {
        const userData = {
          uid: authUser.uid,
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          ...userDoc.data
        };
        
        this.currentUser = userData;
        return userData;
      } else {
        throw new Error('User document not found');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  }

  /**
   * Check if Firebase services are ready
   * @returns {boolean} Ready status
   */
  isReady() {
    return firebaseService.isReady();
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
