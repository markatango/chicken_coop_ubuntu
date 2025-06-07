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
