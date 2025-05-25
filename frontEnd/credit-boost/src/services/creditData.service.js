import apiConfig from "@/config/api.config";

// Import getApiUrl function from apiConfig
const { getApiUrl } = apiConfig;

export const creditDataService = {
  getCreditData: async ({
    source = "all",
    status = "all",
    sortBy = "uploadedAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Only add parameters if they have values
      queryParams.append("page", String(page));
      queryParams.append("limit", String(limit));
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);

      if (source !== "all") {
        queryParams.append("source", source);
      }
      if (status !== "all") {
        queryParams.append("status", status);
      }

      const response = await fetch(
        getApiUrl(`/credit-data?${queryParams.toString()}`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch credit data");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return {
        creditData: data.creditData || [],
        pagination: data.pagination,
      };
    } catch (error) {
      console.error("Error fetching credit data:", error);
      throw error;
    }
  },

  getCreditDataById: async (id) => {
    try {
      const response = await fetch(getApiUrl(`/credit-data/${id}`), {
        method: "GET",
        headers: apiConfig.getHeaders(true),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch credit data");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching credit data:", error);
      throw error;
    }
  },

  getCreditDataStats: async () => {
    try {
      const response = await fetch(getApiUrl("/credit-data/stats"), {
        method: "GET",
        headers: apiConfig.getHeaders(true),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch statistics");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching credit data statistics:", error);
      throw error;
    }
  },

  uploadData: async (file, source, onProgress) => {
    console.log("Starting upload:", { fileName: file.name, source });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("source", source);

      const headers = apiConfig.getHeaders(true);
      delete headers["Content-Type"]; // Let browser set correct content type

      console.log("Making upload request...");
      
      // Use XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
        
        // Handle response
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              console.log("Upload response data:", data);
              resolve(data);
            } catch (e) {
              console.error("Error parsing response:", e);
              reject(new Error("Invalid response format"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              const error = new Error(errorData.error || "Upload failed");
              error.status = xhr.status;
              error.details = errorData.details || [];
              reject(error);
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };
        
        // Handle network errors
        xhr.onerror = function() {
          reject(new Error("Network error during upload"));
        };
        
        // Open and send the request
        xhr.open('POST', getApiUrl("/credit-data/upload"), true);
        
        // Set headers
        Object.keys(headers).forEach(key => {
          xhr.setRequestHeader(key, headers[key]);
        });
        
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Upload error:", error);
      error.status = error.status || 500;
      error.details = error.details || [];
      throw error;
    }
  },

  deleteCreditData: async (id) => {
    try {
      const response = await fetch(getApiUrl(`/credit-data/${id}`), {
        method: "DELETE",
        headers: apiConfig.getHeaders(true),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to delete credit data");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error deleting credit data:", error);
      throw error;
    }
  },

  checkStatus: async (fileId) => {
    try {
      console.log("Checking status for fileId:", fileId);
      const response = await fetch(getApiUrl(`/credit-data/status/${fileId}`), {
        method: "GET",
        headers: apiConfig.getHeaders(true),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Status check failed");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data;
    } catch (error) {
      if (!error.status) {
        error.status = 500;
        error.details = error.details || [];
      }
      console.error("Error checking status:", error);
      throw error;
    }
  },

  getHistory: async () => {
    try {
      const response = await fetch(getApiUrl("/credit-data/history"), {
        method: "GET",
        headers: apiConfig.getHeaders(true),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch history");
        error.details = data.details || [];
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      error.status = error.status || 500;
      error.details = error.details || [];
      console.error("Error fetching upload history:", error);
      throw error;
    }
  },

  pollStatus: async (fileId, onStatusChange) => {
    console.log("Starting status polling for fileId:", fileId);
    const pollInterval = 2000; // Reduced from 3000 since processing is simpler now
    const maxAttempts = 10; // Reduced from 60 since we expect faster completion
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          console.log(`Polling attempt ${attempts + 1}`);
          const result = await creditDataService.checkStatus(fileId);
          console.log("Poll result:", result);

          if (onStatusChange) {
            onStatusChange(result);
          }

          if (result.status === "completed") {
            console.log("File upload completed");
            resolve(result);
            return;
          }

          if (result.status === "error") {
            console.error("Upload error:", result.error);
            reject(new Error(result.error || "Upload failed"));
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error("Upload timeout"));
            return;
          }

          setTimeout(poll, pollInterval);
        } catch (error) {
          console.error("Polling error:", error);
          if (attempts >= 3) {
            reject(error);
            return;
          }
          attempts++;
          setTimeout(poll, pollInterval * 2);
        }
      };

      poll();
    });
  },

  uploadAndTrack: async (file, source, onStatusChange, onProgress) => {
    console.log("Starting upload and track process");
    try {
      if (!file || !source) {
        throw new Error("Missing required parameters");
      }

      console.log("Uploading file...");
      const uploadResult = await creditDataService.uploadData(file, source, onProgress);
      console.log("Upload successful:", uploadResult);

      console.log("Starting status tracking...");
      return await creditDataService.pollStatus(
        uploadResult.fileId,
        onStatusChange
      );
    } catch (error) {
      console.error("Upload and track error:", error);
      throw error;
    }
  },

  getMpesaTransactions: async (uploadId) => {
    try {
      const response = await fetch(
        getApiUrl(`/mpesa-transactions/${uploadId}`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch transactions");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data.transactions;
    } catch (error) {
      console.error("Error fetching Mpesa transactions:", error);
      throw error;
    }
  },

  getMpesaTransactionSummary: async (uploadId) => {
    try {
      const response = await fetch(
        getApiUrl(`/mpesa-transactions/${uploadId}/summary`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch summary");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data.summary;
    } catch (error) {
      console.error("Error fetching Mpesa summary:", error);
      throw error;
    }
  },
};
