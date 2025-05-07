// chatHistory.service.js
import apiConfig from "@/config/api.config";

export const chatHistoryService = {
  // Save chat history
  saveHistory: async (source, selectedDataIds, messages, title = '') => {
    try {
      const response = await fetch(getApiUrl(`/chat/${source}/history`), {
        method: 'POST',
        headers: apiConfig.getHeaders(true),
        body: JSON.stringify({
          title: title || `Chat ${new Date().toLocaleDateString()}`,
          uploadIds: selectedDataIds,
          messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to save chat history');
      return await response.json();
    } catch (error) {
      console.error('Error saving chat history:', error);
      throw error;
    }
  },

  // Get chat histories
  getHistories: async (source, page = 1, limit = 10) => {
    try {
      const response = await fetch(
        getApiUrl(`/chat/${source}/histories?page=${page}&limit=${limit}`),
        {
          method: 'GET',
          headers: apiConfig.getHeaders(true),
        }
      );

      if (!response.ok) throw new Error('Failed to fetch chat histories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat histories:', error);
      throw error;
    }
  },

  // Get specific chat history
  getHistory: async (source, historyId) => {
    try {
      const response = await fetch(
        getApiUrl(`/chat/${source}/history/${historyId}`),
        {
          method: 'GET',
          headers: apiConfig.getHeaders(true),
        }
      );

      if (!response.ok) throw new Error('Failed to fetch chat history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  // Delete chat history
  deleteHistory: async (source, historyId) => {
    try {
      const response = await fetch(
        getApiUrl(`/chat/${source}/history/${historyId}`),
        {
          method: 'DELETE',
          headers: apiConfig.getHeaders(true),
        }
      );

      if (!response.ok) throw new Error('Failed to delete chat history');
      return await response.json();
    } catch (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }
  },

  // Share chat history
  shareHistory: async (source, historyId) => {
    try {
      const response = await fetch(
        getApiUrl(`/chat/${source}/history/${historyId}/share`),
        {
          method: 'POST',
          headers: apiConfig.getHeaders(true),
        }
      );

      if (!response.ok) throw new Error('Failed to share chat history');
      return await response.json();
    } catch (error) {
      console.error('Error sharing chat history:', error);
      throw error;
    }
  },

  // Get shared chat history
  getSharedHistory: async (shareToken) => {
    try {
      const response = await fetch(
        getApiUrl(`/chat/shared/${shareToken}`),
        {
          method: 'GET',
          headers: apiConfig.getHeaders(false), // No auth required for shared chats
        }
      );

      if (!response.ok) throw new Error('Failed to fetch shared chat history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching shared chat history:', error);
      throw error;
    }
  }
};