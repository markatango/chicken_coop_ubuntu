  
// firebaseService.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

import { firebaseConfig } from '../firebaseConfig';

// User roles constants
export const USER_ROLES = {
  USER: 'user',
  ADMINISTRATOR: 'administrator'
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.isInitialized = false;
    this.isEmulatorConnected = false;
  }

  /**
   * Initialize Firebase services
   * @param {boolean} useEmulator - Whether to use Firebase emulators for development
   */
  async initialize(useEmulator = false) {
    try {
      if (this.isInitialized) {
        console.log('Firebase already initialized');
        return;
      }

      // Initialize Firebase app
      this.app = initializeApp(firebaseConfig);
      
      // Initialize Auth
      this.auth = getAuth(this.app);
      
      // Initialize Firestore
      this.db = getFirestore(this.app);

      // Connect to emulators if in development
      if (useEmulator && !this.isEmulatorConnected) {
        try {
          connectAuthEmulator(this.auth, 'http://localhost:9099');
          connectFirestoreEmulator(this.db, 'localhost', 8080);
          this.isEmulatorConnected = true;
          console.log('Connected to Firebase emulators');
        } catch (error) {
          console.warn('Failed to connect to emulators:', error.message);
        }
      }

      this.isInitialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase');
    }
  }

  // =============================================
  // AUTHENTICATION METHODS
  // =============================================

  /**
   * Sign in user with email and password
   */
  async signInWithEmailAndPassword(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Create new user with email and password
   */
  async createUserWithEmailAndPassword(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Sign up error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      await signOut(this.auth);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      
      await updateProfile(user, updates);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Google sign in
   */
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(this.auth, provider);
      return userCredential;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Facebook sign in
   */
  async signInWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      
      const userCredential = await signInWithPopup(this.auth, provider);
      return userCredential;
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Auth state observer
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.auth?.currentUser || null;
  }

  // =============================================
  // FIRESTORE METHODS
  // =============================================

  /**
   * Get user document from Firestore
   */
  async getUserDocument(uid) {
    try {
      const userDocRef = doc(this.db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return {
          exists: true,
          data: userDoc.data(),
          id: userDoc.id
        };
      } else {
        return { exists: false };
      }
    } catch (error) {
      console.error('Get user document error:', error);
      throw new Error('Failed to get user document');
    }
  }

  /**
   * Create user document in Firestore
   */
  async createUserDocument(uid, userData) {
    try {
      const userDocRef = doc(this.db, 'users', uid);
      const dataWithTimestamp = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userDocRef, dataWithTimestamp);
      console.log('User document created successfully');
      return dataWithTimestamp;
    } catch (error) {
      console.error('Create user document error:', error);
      throw new Error('Failed to create user document');
    }
  }

  /**
   * Update user document in Firestore
   */
  async updateUserDocument(uid, updates) {
    try {
      const userDocRef = doc(this.db, 'users', uid);
      const dataWithTimestamp = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, dataWithTimestamp);
      console.log('User document updated successfully');
      return dataWithTimestamp;
    } catch (error) {
      console.error('Update user document error:', error);
      throw new Error('Failed to update user document');
    }
  }

  /**
   * Delete user document from Firestore
   */
  async deleteUserDocument(uid) {
    try {
      const userDocRef = doc(this.db, 'users', uid);
      await deleteDoc(userDocRef);
      console.log('User document deleted successfully');
    } catch (error) {
      console.error('Delete user document error:', error);
      throw new Error('Failed to delete user document');
    }
  }

  /**
   * Get all users from Firestore
   */
  async getAllUsers(limitCount = 100) {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      throw new Error('Failed to get users');
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role) {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(
        usersRef,
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Get users by role error:', error);
      throw new Error('Failed to get users by role');
    }
  }

  /**
   * Create a new user document (for admin use)
   */
  async addUserDocument(userData) {
    try {
      const usersRef = collection(this.db, 'users');
      const dataWithTimestamp = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(usersRef, dataWithTimestamp);
      console.log('User document added successfully');
      return { id: docRef.id, ...dataWithTimestamp };
    } catch (error) {
      console.error('Add user document error:', error);
      throw new Error('Failed to add user document');
    }
  }

  /**
   * Batch update multiple users
   */
  async batchUpdateUsers(updates) {
    try {
      const batch = writeBatch(this.db);
      
      updates.forEach(({ uid, data }) => {
        const userDocRef = doc(this.db, 'users', uid);
        batch.update(userDocRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('Batch update completed successfully');
    } catch (error) {
      console.error('Batch update error:', error);
      throw new Error('Failed to batch update users');
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Handle authentication errors
   */
  handleAuthError(error) {
    const errorCode = error.code;
    let errorMessage = 'An authentication error occurred';

    switch (errorCode) {
      case 'auth/user-not-found':
        errorMessage = 'No user found with this email address';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'Email address is already registered';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'User account has been disabled';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        break;
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Sign-in was cancelled';
        break;
      default:
        errorMessage = error.message || 'Authentication failed';
    }

    return new Error(errorMessage);
  }

  /**
   * Check if Firebase is initialized
   */
  isReady() {
    return this.isInitialized && this.auth && this.db;
  }

  /**
   * Get Firebase app instance
   */
  getApp() {
    return this.app;
  }

  /**
   * Get Auth instance
   */
  getAuth() {
    return this.auth;
  }

  /**
   * Get Firestore instance
   */
  getFirestore() {
    return this.db;
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
