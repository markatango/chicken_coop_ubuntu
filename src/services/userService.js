// userService.js
import firebaseService from './firebaseService';
import { USER_ROLES } from '../config/userroles';

class UserService {
  /**
   * Get all users from Firestore
   * @param {number} limitCount - Maximum number of users to retrieve
   * @returns {Promise<Array>} Array of user objects
   */
  async getAllUsers(limitCount = 100) {
    try {
      const users = await firebaseService.getAllUsers(limitCount);
      
      // Convert timestamps to readable dates
      const processedUsers = users.map(user => ({
        ...user,
        createdAt: user.createdAt?.toDate?.() || user.createdAt,
        updatedAt: user.updatedAt?.toDate?.() || user.updatedAt,
        lastLogin: user.lastLogin || null,
        lastLoginTimestamp: user.lastLoginTimestamp?.toDate?.() || user.lastLoginTimestamp
      }));

      console.log(`Retrieved ${processedUsers.length} users`);
      return processedUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  /**
   * Get users by role
   * @param {string} role - User role (USER_ROLES.USER or USER_ROLES.ADMINISTRATOR)
   * @returns {Promise<Array>} Array of users with specified role
   */
  async getUsersByRole(role) {
    try {
      if (!Object.values(USER_ROLES).includes(role)) {
        throw new Error('Invalid role specified');
      }

      const users = await firebaseService.getUsersByRole(role);
      
      const processedUsers = users.map(user => ({
        ...user,
        createdAt: user.createdAt?.toDate?.() || user.createdAt,
        updatedAt: user.updatedAt?.toDate?.() || user.updatedAt,
        lastLogin: user.lastLogin || null,
        lastLoginTimestamp: user.lastLoginTimestamp?.toDate?.() || user.lastLoginTimestamp
      }));

      console.log(`Retrieved ${processedUsers.length} users with role: ${role}`);
      return processedUsers;
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw new Error(`Failed to retrieve users with role: ${role}`);
    }
  }

  /**
   * Get a specific user by ID
   * @param {string} uid - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUserById(uid) {
    try {
      if (!uid) {
        throw new Error('User ID is required');
      }

      const userDoc = await firebaseService.getUserDocument(uid);
      
      if (userDoc.exists) {
        const user = {
          id: uid,
          ...userDoc.data,
          createdAt: userDoc.data.createdAt?.toDate?.() || userDoc.data.createdAt,
          updatedAt: userDoc.data.updatedAt?.toDate?.() || userDoc.data.updatedAt,
          lastLoginTimestamp: userDoc.data.lastLoginTimestamp?.toDate?.() || userDoc.data.lastLoginTimestamp
        };
        
        console.log('Retrieved user:', user.email);
        return user;
      } else {
        console.log('User not found:', uid);
        return null;
      }
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Update user role
   * @param {string} uid - User ID
   * @param {string} newRole - New role (USER_ROLES.USER or USER_ROLES.ADMINISTRATOR)
   * @param {string} updatedBy - ID of user making the update
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserRole(uid, newRole, updatedBy = null) {
    try {
      if (!uid || !newRole) {
        throw new Error('User ID and new role are required');
      }

      if (!Object.values(USER_ROLES).includes(newRole)) {
        throw new Error('Invalid role specified');
      }

      // Check if user exists
      const userDoc = await firebaseService.getUserDocument(uid);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      // Prepare update data
      const updates = {
        role: newRole,
        roleUpdatedBy: updatedBy,
        roleUpdatedAt: new Date().toISOString()
      };

      // Update user document
      await firebaseService.updateUserDocument(uid, updates);

      // Get updated user data
      const updatedUserDoc = await firebaseService.getUserDocument(uid);
      const updatedUser = {
        id: uid,
        ...updatedUserDoc.data,
        createdAt: updatedUserDoc.data.createdAt?.toDate?.() || updatedUserDoc.data.createdAt,
        updatedAt: updatedUserDoc.data.updatedAt?.toDate?.() || updatedUserDoc.data.updatedAt
      };

      console.log(`Updated user role: ${userDoc.data.email} -> ${newRole}`);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Update user profile information
   * @param {string} uid - User ID
   * @param {Object} updates - Profile updates
   * @param {string} updatedBy - ID of user making the update
   * @returns {Promise<Object>} Updated user data
   */
  async updateUserProfile(uid, updates, updatedBy = null) {
    try {
      if (!uid) {
        throw new Error('User ID is required');
      }

      // Check if user exists
      const userDoc = await firebaseService.getUserDocument(uid);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      // Prepare update data
      const updateData = {
        ...updates,
        profileUpdatedBy: updatedBy,
        profileUpdatedAt: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Update user document
      await firebaseService.updateUserDocument(uid, updateData);

      // Get updated user data
      const updatedUserDoc = await firebaseService.getUserDocument(uid);
      const updatedUser = {
        id: uid,
        ...updatedUserDoc.data,
        createdAt: updatedUserDoc.data.createdAt?.toDate?.() || updatedUserDoc.data.createdAt,
        updatedAt: updatedUserDoc.data.updatedAt?.toDate?.() || updatedUserDoc.data.updatedAt
      };

      console.log(`Updated user profile: ${userDoc.data.email}`);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Delete user (Firestore document only - Auth user must be deleted via Admin SDK)
   * @param {string} uid - User ID
   * @param {string} deletedBy - ID of user performing the deletion
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(uid, deletedBy = null) {
    try {
      if (!uid) {
        throw new Error('User ID is required');
      }

      // Check if user exists
      const userDoc = await firebaseService.getUserDocument(uid);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      // Store deletion info before deleting (optional - you might want to keep an audit log)
      const deletionData = {
        deletedUserId: uid,
        deletedUserEmail: userDoc.data.email,
        deletedBy: deletedBy,
        deletedAt: new Date().toISOString(),
        originalData: userDoc.data
      };

      // You could save this to a separate 'deleted_users' collection for audit purposes
      // await firebaseService.addUserDocument(deletionData, 'deleted_users');

      // Delete user document from Firestore
      await firebaseService.deleteUserDocument(uid);

      console.log(`Deleted user: ${userDoc.data.email}`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Create a new user document (for admin use - does not create Auth user)
   * @param {Object} userData - User data
   * @param {string} createdBy - ID of user creating this user
   * @returns {Promise<Object>} Created user data
   */
  async createUserDocument(userData, createdBy = null) {
    try {
      const {
        email,
        displayName,
        role = USER_ROLES.USER,
        isActive = true,
        ...otherData
      } = userData;

      if (!email || !displayName) {
        throw new Error('Email and display name are required');
      }

      if (!Object.values(USER_ROLES).includes(role)) {
        throw new Error('Invalid role specified');
      }

      // Prepare user document data
      const newUserData = {
        email,
        displayName,
        role,
        isActive,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        createdBy,
        lastLogin: null,
        ...otherData
      };

      // Create user document in Firestore
      const result = await firebaseService.addUserDocument(newUserData);
      
      const createdUser = {
        id: result.id,
        ...newUserData,
        createdAt: result.createdAt?.toDate?.() || newUserData.createdAt
      };

      console.log(`Created user document: ${email}`);
      return createdUser;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  /**
   * Deactivate/activate user account
   * @param {string} uid - User ID
   * @param {boolean} isActive - Active status
   * @param {string} updatedBy - ID of user making the update
   * @returns {Promise<Object>} Updated user data
   */
  async setUserActiveStatus(uid, isActive, updatedBy = null) {
    try {
      if (!uid || typeof isActive !== 'boolean') {
        throw new Error('User ID and active status are required');
      }

      const updates = {
        isActive,
        statusUpdatedBy: updatedBy,
        statusUpdatedAt: new Date().toISOString()
      };

      await firebaseService.updateUserDocument(uid, updates);

      // Get updated user data
      const updatedUserDoc = await firebaseService.getUserDocument(uid);
      const updatedUser = {
        id: uid,
        ...updatedUserDoc.data,
        createdAt: updatedUserDoc.data.createdAt?.toDate?.() || updatedUserDoc.data.createdAt,
        updatedAt: updatedUserDoc.data.updatedAt?.toDate?.() || updatedUserDoc.data.updatedAt
      };

      console.log(`Updated user active status: ${updatedUser.email} -> ${isActive ? 'active' : 'inactive'}`);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user active status:', error);
      throw error;
    }
  }

  /**
   * Batch update multiple users
   * @param {Array} userUpdates - Array of user update objects
   * @param {string} updatedBy - ID of user performing the updates
   * @returns {Promise<boolean>} Success status
   */
  async batchUpdateUsers(userUpdates, updatedBy = null) {
    try {
      if (!Array.isArray(userUpdates) || userUpdates.length === 0) {
        throw new Error('User updates array is required');
      }

      // Prepare batch updates
      const batchUpdates = userUpdates.map(({ uid, data }) => ({
        uid,
        data: {
          ...data,
          batchUpdatedBy: updatedBy,
          batchUpdatedAt: new Date().toISOString()
        }
      }));

      // Execute batch update
      await firebaseService.batchUpdateUsers(batchUpdates);

      console.log(`Batch updated ${userUpdates.length} users`);
      return true;
    } catch (error) {
      console.error('Error batch updating users:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStatistics() {
    try {
      // Get all users
      const allUsers = await this.getAllUsers();
      
      // Calculate statistics
      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(user => user.isActive !== false).length,
        inactiveUsers: allUsers.filter(user => user.isActive === false).length,
        administrators: allUsers.filter(user => user.role === USER_ROLES.ADMINISTRATOR).length,
        regularUsers: allUsers.filter(user => user.role === USER_ROLES.USER).length,
        verifiedUsers: allUsers.filter(user => user.emailVerified === true).length,
        unverifiedUsers: allUsers.filter(user => user.emailVerified !== true).length,
        usersCreatedToday: allUsers.filter(user => {
          const createdDate = new Date(user.createdAt);
          const today = new Date();
          return createdDate.toDateString() === today.toDateString();
        }).length,
        usersCreatedThisWeek: allUsers.filter(user => {
          const createdDate = new Date(user.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return createdDate >= weekAgo;
        }).length,
        usersCreatedThisMonth: allUsers.filter(user => {
          const createdDate = new Date(user.createdAt);
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return createdDate >= monthAgo;
        }).length
      };

      console.log('Generated user statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  /**
   * Search users by email or display name
   * @param {string} searchTerm - Search term
   * @param {number} limitCount - Maximum results to return
   * @returns {Promise<Array>} Array of matching users
   */
  async searchUsers(searchTerm, limitCount = 50) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        throw new Error('Search term must be at least 2 characters');
      }

      // Get all users (in a real implementation, you'd want server-side search)
      const allUsers = await this.getAllUsers();
      
      // Filter users based on search term
      const searchTermLower = searchTerm.toLowerCase();
      const matchingUsers = allUsers.filter(user => 
        user.email?.toLowerCase().includes(searchTermLower) ||
        user.displayName?.toLowerCase().includes(searchTermLower)
      ).slice(0, limitCount);

      console.log(`Found ${matchingUsers.length} users matching: ${searchTerm}`);
      return matchingUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Sync user data with Firebase Auth user
   * @param {Object} authUser - Firebase Auth user object
   * @returns {Promise<Object>} Synced user data
   */
  async syncUserWithAuth(authUser) {
    try {
      if (!authUser || !authUser.uid) {
        throw new Error('Valid auth user is required');
      }

      const userDoc = await firebaseService.getUserDocument(authUser.uid);
      
      if (!userDoc.exists) {
        // Create new user document
        const newUserData = {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName || authUser.email?.split('@')[0] || 'User',
          role: USER_ROLES.USER,
          emailVerified: authUser.emailVerified,
          photoURL: authUser.photoURL,
          phoneNumber: authUser.phoneNumber,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          syncedFromAuth: true
        };
        
        await firebaseService.createUserDocument(authUser.uid, newUserData);
        console.log('Created new user document from auth:', authUser.email);
        return newUserData;
      } else {
        // Update existing user document with current auth data
        const updates = {
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          lastLogin: new Date().toISOString(),
          lastSyncedFromAuth: new Date().toISOString()
        };

        // Update display name if it's different and not empty
        if (authUser.displayName && authUser.displayName !== userDoc.data.displayName) {
          updates.displayName = authUser.displayName;
        }

        // Update photo URL if it's different
        if (authUser.photoURL !== userDoc.data.photoURL) {
          updates.photoURL = authUser.photoURL;
        }

        // Update phone number if it's different
        if (authUser.phoneNumber !== userDoc.data.phoneNumber) {
          updates.phoneNumber = authUser.phoneNumber;
        }

        await firebaseService.updateUserDocument(authUser.uid, updates);
        
        const syncedUserData = {
          uid: authUser.uid,
          ...userDoc.data,
          ...updates
        };
        
        console.log('Synced existing user with auth:', authUser.email);
        return syncedUserData;
      }
    } catch (error) {
      console.error('Error syncing user with auth:', error);
      throw error;
    }
  }

  /**
   * Validate user permissions for an action
   * @param {string} uid - User ID performing the action
   * @param {string} targetUid - Target user ID (for user management actions)
   * @param {string} action - Action being performed
   * @returns {Promise<boolean>} Permission check result
   */
  async validateUserPermissions(uid, targetUid = null, action = 'read') {
    try {
      if (!uid) {
        return false;
      }

      const user = await this.getUserById(uid);
      if (!user || !user.isActive) {
        return false;
      }

      // Admin users have all permissions
      if (user.role === USER_ROLES.ADMINISTRATOR) {
        return true;
      }

      // Users can manage their own data
      if (targetUid === uid) {
        return ['read', 'update'].includes(action);
      }

      // Regular users cannot manage other users
      if (targetUid && targetUid !== uid) {
        return false;
      }

      // For non-user-specific actions, check role
      switch (action) {
        case 'read':
          return true; // All authenticated users can read
        case 'create':
        case 'update':
        case 'delete':
        case 'admin':
          return user.role === USER_ROLES.ADMINISTRATOR;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error validating user permissions:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const userService = new UserService();
export default userService;
