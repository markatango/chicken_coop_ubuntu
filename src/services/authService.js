import FirebaseService from "./firebase";

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

export default authService;