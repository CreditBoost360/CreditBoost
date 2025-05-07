/* eslint-disable no-useless-catch */
import apiConfig from "@/config/api.config";
import { authService } from "./auth.service";

export const settingsService = {
  // Profile Settings
 // settingsService.js
updateProfile: async (profileData) => {
  try {
      const response = await fetch(getApiUrl('/settings/profile'), {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify(profileData)
      });

      if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update profile');
      }

      return await response.json();
  } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
  }
},

  // Profile Photo
  uploadProfilePhoto: async (file) => {
    try {
        // Validate file before upload
        if (!file) throw new Error('No file provided');
        
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            throw new Error('File must be an image (JPEG, PNG, GIF, or WebP)');
        }
        
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB');
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(getApiUrl("/settings/profile/photo"), {
            method: "POST",
            headers: {
                Authorization: apiConfig.getHeaders(true).Authorization,
            },
            body: formData,
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to upload photo");
            }
            throw new Error(`Upload failed (${response.status})`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in uploadProfilePhoto:", error);
        throw error;
    }
},

  // Security Settings
  updatePassword: async (data) => {
    try {
      const response = await fetch(getApiUrl("/settings/security/password"), {
        method: "PUT",
        headers: apiConfig.getHeaders(true),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in updatePassword:", error);
      throw error;
    }
  },

  // Notification Settings
  updateNotifications: async (data) => {
    try {
      const response = await fetch(getApiUrl("/settings/notifications"), {
        method: "PUT",
        headers: apiConfig.getHeaders(true),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update notifications");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in updateNotifications:", error);
      throw error;
    }
  },

  // Get Current Settings
  getCurrentSettings: async () => {
    try {
      const response = await fetch(getApiUrl("/settings"), {
        headers: apiConfig.getHeaders(true),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch settings");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in getCurrentSettings:", error);
      throw error;
    }
  },
};
