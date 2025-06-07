import { USER_ROLES } from "../config/userroles";
import FirebaseService from "./firebaseService_mock";

const firebaseService = new FirebaseService();

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

export default userService;