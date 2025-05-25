/* eslint-disable no-useless-catch */
import apiConfig from "@/config/api.config";

// Extract getApiUrl function from apiConfig
const { getApiUrl } = apiConfig;

export const topicService = {
    getTopics: async () => {
        try {
            const response = await fetch(
                getApiUrl('/topics'),
                {
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Failed to fetch topics');
            return await response.json();
        } catch (error) {
            throw error;
        }
    },

    getTopicQuizzes: async (topicId) => {
        try {
            const response = await fetch(
                getApiUrl(`/topics/${topicId}/quizzes`),
                {
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Failed to fetch topic quizzes');
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};