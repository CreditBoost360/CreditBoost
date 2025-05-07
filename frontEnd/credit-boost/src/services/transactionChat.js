import apiConfig from "@/config/api.config";

export const transactionChat = {
  // Get credit data uploads for a source
  getCreditDataUploads: async (source) => {
    try {
      const response = await fetch(
        getApiUrl(`/credit-data?source=${source}&status=completed`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch credit data uploads");
      return await response.json();
    } catch (error) {
      console.error("Error fetching credit data uploads:", error);
      throw error;
    }
  },

  // Get categories based on source and uploadId
  getCategories: async (source, uploadId = null) => {
    try {
      let url = getApiUrl(`/chat/categories/${source}`);
      if (uploadId) {
        url += `?uploadId=${uploadId}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: apiConfig.getHeaders(true),
      });

      if (!response.ok) throw new Error("Failed to fetch categories");
      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Get transactions for a category
  getTransactionsByCategory: async (source, category, uploadId) => {
    try {
      const url = getApiUrl(
        `/chat/${source}/transactions/${category}?uploadId=${uploadId}`
      );
      const response = await fetch(url, {
        method: "GET",
        headers: apiConfig.getHeaders(true),
      });

      if (!response.ok)
        throw new Error("Failed to fetch transactions by category");
      return await response.json();
    } catch (error) {
      console.error("Error fetching transactions by category:", error);
      throw error;
    }
  },

  // Send chat message about transactions
  sendChatMessage: async (source, message, selectedDataIds) => {
    try {
      const response = await fetch(getApiUrl(`/chat/${source}/message`), {
        method: "POST",
        headers: apiConfig.getHeaders(true),
        body: JSON.stringify({
          uploadIds: selectedDataIds,
          message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send chat message");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  },

  // Get chat history for a specific source and upload
  getChatHistory: async (source, uploadId) => {
    try {
      const response = await fetch(
        getApiUrl(`/chat/${source}/${uploadId}/history`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch chat history");
      return await response.json();
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  },

  // Get transaction summary
  getTransactionSummary: async (source, uploadId) => {
    try {
      const response = await fetch(
        getApiUrl(`/${source}-transactions/${uploadId}/summary`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch transaction summary");
      return await response.json();
    } catch (error) {
      console.error("Error fetching transaction summary:", error);
      throw error;
    }
  },

  // Generate insights for selected transactions
  generateInsights: async (source, uploadId, selectedTransactions) => {
    try {
      const response = await fetch(
        getApiUrl(`/chat/${source}/${uploadId}/insights`),
        {
          method: "POST",
          headers: apiConfig.getHeaders(true),
          body: JSON.stringify({
            transactions: selectedTransactions,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate insights");
      return await response.json();
    } catch (error) {
      console.error("Error generating insights:", error);
      throw error;
    }
  },

  // Get all transactions with filters
  getTransactions: async (source, uploadId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        uploadId,
      }).toString();

      const response = await fetch(
        getApiUrl(`/${source}-transactions/${uploadId}?${queryParams}`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch transactions");
      return await response.json();
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },
};
