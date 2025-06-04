export const authService = {
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
  