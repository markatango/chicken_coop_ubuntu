// =============================================
// FIREBASE SERVICE
// =============================================

// =============================================
// Live Mode
// =============================================

// Replace the FirebaseService class with:
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// =============================================
// Mock Mode
// =============================================



import { USER_ROLES } from '../config/userroles';
import { firebaseConfig } from '../firebaseConfig';

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

export default FirebaseService;