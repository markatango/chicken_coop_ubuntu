// API service for backend communication
export const apiService = {
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