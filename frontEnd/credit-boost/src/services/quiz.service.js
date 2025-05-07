/* eslint-disable no-useless-catch */

import apiConfig from "@/config/api.config";

export const quizService = {
  getQuizzes: async () => {
    try {
      const response = await fetch(getApiUrl("/quizzes"), {
        headers: apiConfig.getHeaders(true),
      });
      if (!response.ok) throw new Error("Failed to fetch quizzes");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getQuizById: async (quizId) => {
    try {
      const response = await fetch(getApiUrl(`/quizzes/${quizId}`), {
        headers: apiConfig.getHeaders(true),
      });
      if (!response.ok) throw new Error("Failed to fetch quiz");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  submitQuizAnswers: async (quizId, data) => {
    try {
      const sanitizedData = {
        answers: data.answers || {},
        attemptId: data.attemptId,
        timeSpent: Number(data.timeSpent) || 0,
        isTimeout: Boolean(data.isTimeout)
      };

      const response = await fetch(
        getApiUrl(`/quizzes/${quizId}/submit`),
        {
          method: 'POST',
          headers: apiConfig.getHeaders(true),
          body: JSON.stringify(sanitizedData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit answers');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in submitQuizAnswers:', error);
      throw error;
    }
  },
  

  // getUserProgress: async () => {
  //     try {
  //         const response = await fetch(
  //             getApiUrl('/quizzes/progress'),
  //             {
  //                 headers: apiConfig.getHeaders(true)
  //             }
  //         );
  //         if (!response.ok) throw new Error('Failed to fetch progress');
  //         return await response.json();
  //     } catch (error) {
  //         throw error;
  //     }
  // },

  getUserProgress: async (quizId, userId) => {
    try {
      const response = await fetch(getApiUrl(`/quizzes/${quizId}/progress`), {
        headers: apiConfig.getHeaders(true),
        data: JSON.stringify({ userId: userId }),
      });
      if (!response.ok) throw new Error("Failed to fetch progress");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  startQuiz: async (quizId, user) => {
    try {
      const response = await fetch(getApiUrl(`/quizzes/${quizId}/start`), {
        method: "POST",
        headers: apiConfig.getHeaders(true),
        data: JSON.stringify({userId: user?.id})
      });
      if (!response.ok) throw new Error("Failed to start quiz");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};
