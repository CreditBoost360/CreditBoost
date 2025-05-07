import apiConfig from "@/config/api.config";

export const communityService = {
    getAllCommunities: async (filter = 'all') => {
        try {
            const response = await fetch(
                getApiUrl(`/communities?filter=${filter}`),
                {
                    method: 'GET',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching communities:', error);
            throw error;
        }
    },
    getCommunityById: async (id) => {
        try {
            const response = await fetch(
                getApiUrl(`/communities/${id}`),
                {
                    method: 'GET',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching communities:', error);
            throw error;
        }
    },

    createCommunity: async (data) => {
        try {
            const response = await fetch(
                getApiUrl('/communities'),
                {
                    method: 'POST',
                    headers: apiConfig.getHeaders(true),
                    body: JSON.stringify(data)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error creating community:', error);
            throw error;
        }
    },

    joinCommunity: async (communityId) => {
        try {
            const response = await fetch(
                getApiUrl(`/communities/${communityId}/join`),
                {
                    method: 'POST',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error joining community:', error);
            throw error;
        }
    },

    getCommunityMessages: async (communityId) => {
        try {
            const response = await fetch(
                getApiUrl(`/communities/${communityId}/messages`),
                {
                    method: 'GET',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    sendMessage: async (communityId, content) => {
        try {
            const response = await fetch(
                getApiUrl(`/communities/${communityId}/messages`),
                {
                    method: 'POST',
                    headers: apiConfig.getHeaders(true),
                    body: JSON.stringify({ content })
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
};