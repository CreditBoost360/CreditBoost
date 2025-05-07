/* eslint-disable no-useless-catch */
import apiConfig from "@/config/api.config";

export const topicService = {
    getTopics: async () => {
        console.log(getApiUrl('/topics'));
        
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