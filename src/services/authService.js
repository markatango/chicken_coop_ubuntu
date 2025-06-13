import FirebaseService from "./firebaseService";
import { USER_ROLES } from "../config/userroles";

const firebaseService = new FirebaseService();

const createUserData = (formData) => {
    const newUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: userData.username || result.user.email.split('@')[0],
        role: USER_ROLES.USER,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
    return {user : newUser}
  }

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
      const result = await firebaseService.handleSignUp(
        userData.email,
        userData.password
      );
      // save augmented userdata in firestore also
      const augmentedUser = createUserData( userData )
      const userCollection = collection(db, 'users');
          const docref = await addDoc(userCollection,  augmentedUser)
          .then( ()=>{
            console.log(`added new user to firestore db: ${JSON.stringify(augmentedUser)}`)
          })
          .catch((error) => {
            // Handle Errors here.
            gotError = true;
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Error signing up:", errorCode, errorMessage);
            // Display an error message to the user (e.g., email-already-in-use, weak-password)
          });
          return { success: gotError, user: augmentedUser };

      return { success: true, user: JSON.stringify(result.user) };
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
      // return { success: false, user: JSON.stringify(result.user) };
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

export default authService;