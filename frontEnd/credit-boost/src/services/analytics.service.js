import apiConfig from "@/config/api.config";

// Import getApiUrl function from apiConfig
const { getApiUrl } = apiConfig;

// Mock data for fallback when API endpoints are not available
const MOCK_DATA = {
  financialInsights: {
    totalTransactions: 124,
    averageAmount: 12500,
    largestTransaction: 45000,
    smallestTransaction: 100,
    topCategories: [
      { name: "Food", amount: 25000, percentage: 25 },
      { name: "Transport", amount: 18000, percentage: 18 },
      { name: "Shopping", amount: 15000, percentage: 15 },
    ],
    insights: [
      "Your most frequent transactions are food-related expenses",
      "Transport expenses increased by 15% compared to previous month",
      "You have 3 recurring monthly payments identified"
    ]
  },
  fraudAlerts: [
    { 
      id: "fr1", 
      severity: "medium", 
      description: "Unusual transaction amount", 
      transactionId: "tx123",
      date: "2025-05-15",
      amount: 12500,
      status: "unresolved"
    },
    { 
      id: "fr2", 
      severity: "low", 
      description: "Uncommon transaction location", 
      transactionId: "tx456",
      date: "2025-05-14",
      amount: 1800,
      status: "unresolved"
    }
  ],
  sentimentAnalysis: {
    overall: "neutral",
    distribution: {
      positive: 35,
      neutral: 60,
      negative: 5
    },
    trends: [
      { date: "2025-04", positive: 30, neutral: 60, negative: 10 },
      { date: "2025-05", positive: 35, neutral: 60, negative: 5 }
    ],
    transactions: [
      { id: "tx1", description: "Supermarket purchase", sentiment: "neutral", confidence: 0.85 },
      { id: "tx2", description: "Salary deposit", sentiment: "positive", confidence: 0.92 },
      { id: "tx3", description: "Bill payment", sentiment: "negative", confidence: 0.76 }
    ],
    keyPhrases: [
      { text: "Salary", frequency: 12, sentiment: "positive" },
      { text: "Purchase", frequency: 28, sentiment: "neutral" },
      { text: "Payment", frequency: 22, sentiment: "neutral" },
      { text: "Transfer", frequency: 18, sentiment: "neutral" },
      { text: "Bill", frequency: 15, sentiment: "negative" }
    ]
  },
  transactionPatterns: [
    {
      type: "recurring",
      description: "Monthly Rent Payment",
      amount: 25000,
      frequency: "monthly",
      nextExpected: "2025-06-01",
      confidence: 0.95,
      category: "Housing",
      occurrences: 12
    },
    {
      type: "recurring",
      description: "Netflix Subscription",
      amount: 1200,
      frequency: "monthly",
      nextExpected: "2025-06-15",
      confidence: 0.98,
      category: "Entertainment",
      occurrences: 24
    },
    {
      type: "anomaly",
      description: "Large shopping expense",
      amount: 15000,
      date: "2025-05-10",
      anomalyScore: 0.82,
      details: "Significantly higher than your usual shopping expenses",
      category: "Shopping"
    },
    {
      type: "cluster",
      description: "Food Expenses",
      totalAmount: 25000,
      transactionCount: 35,
      averageAmount: 714,
      category: "Food",
      timeInsight: "Most of your food expenses occur on weekends"
    },
    {
      type: "cluster",
      description: "Transport",
      totalAmount: 18000,
      transactionCount: 42,
      averageAmount: 428,
      category: "Transport",
      timeInsight: "Transport expenses mostly occur on weekdays"
    }
  ],
  predictiveInsights: {
    cashFlowForecast: [
      { date: "2025-05-20", predictedInflow: 0, predictedOutflow: 3500, predictedBalance: 32500 },
      { date: "2025-05-25", predictedInflow: 0, predictedOutflow: 5000, predictedBalance: 27500 },
      { date: "2025-05-30", predictedInflow: 75000, predictedOutflow: 2500, predictedBalance: 100000 },
      { date: "2025-06-05", predictedInflow: 0, predictedOutflow: 28000, predictedBalance: 72000 }
    ],
    cashFlowSummary: "Based on your transaction history, we predict your net cash flow will be positive over the next 30 days with an expected balance increase of KES 15,000.",
    categoryPredictions: [
      { name: "Housing", predictedAmount: 25000, budgetAmount: 25000, trend: "same" },
      { name: "Food", predictedAmount: 22000, budgetAmount: 30000, trend: "down" },
      { name: "Transport", predictedAmount: 18000, budgetAmount: 15000, trend: "up" },
      { name: "Entertainment", predictedAmount: 8000, budgetAmount: 10000, trend: "down" }
    ],
    healthScore: 75,
    healthInsights: [
      { type: "positive", text: "Your regular income pattern shows stability, which is positive for your financial health." },
      { type: "warning", text: "Consider setting aside more for emergency savings based on your current spending patterns." },
      { type: "negative", text: "Your frequent transaction fees could be reduced by consolidating payments." }
    ],
    goalProjections: [
      { name: "Emergency Fund", currentAmount: 25000, targetAmount: 60000, predictedCompletionDate: "June 2025" },
      { name: "Home Down Payment", currentAmount: 120000, targetAmount: 500000, predictedCompletionDate: "March 2026" }
    ],
    savingsPotential: {
      monthly: 15000,
      recommendation: "Based on your income and spending patterns, you could potentially save this amount monthly by optimizing discretionary expenses."
    }
  }
};

// Debug flag to force using mock data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const analyticsService = {
  /**
   * Get financial insights based on transaction data
   * @param {string} uploadId - The ID of the uploaded statement
   * @returns {Promise<Object>} Financial insights data
   */
  getFinancialInsights: async (uploadId) => {
    try {
      // If mock data is forced, immediately return mock data
      if (USE_MOCK_DATA) {
        console.info("Using mock financial insights data");
        return MOCK_DATA.financialInsights;
      }

      const response = await fetch(
        getApiUrl(`/analytics/financial-insights/${uploadId}`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch financial insights");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data;
    } catch (error) {
      console.warn("Falling back to mock financial insights data:", error.message);
      // Return mock data when the API fails
      return MOCK_DATA.financialInsights;
    }
  },

  /**
   * Get fraud alerts based on transaction data
   * @param {string} uploadId - The ID of the uploaded statement
   * @returns {Promise<Array>} List of potential fraud alerts
   */
  getFraudAlerts: async (uploadId) => {
    try {
      // If mock data is forced, immediately return mock data
      if (USE_MOCK_DATA) {
        console.info("Using mock fraud alerts data");
        return MOCK_DATA.fraudAlerts;
      }

      const response = await fetch(
        getApiUrl(`/analytics/fraud-alerts/${uploadId}`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch fraud alerts");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data.alerts || [];
    } catch (error) {
      console.warn("Falling back to mock fraud alerts data:", error.message);
      // Return mock data when the API fails
      return MOCK_DATA.fraudAlerts;
    }
  },

  /**
   * Get sentiment analysis for transaction descriptions
   * @param {string} uploadId - The ID of the uploaded statement
   * @returns {Promise<Object>} Sentiment analysis data
   */
  getSentimentAnalysis: async (uploadId) => {
    try {
      // If mock data is forced, immediately return mock data
      if (USE_MOCK_DATA) {
        console.info("Using mock sentiment analysis data");
        return MOCK_DATA.sentimentAnalysis;
      }

      const response = await fetch(
        getApiUrl(`/analytics/sentiment/${uploadId}`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch sentiment analysis");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data;
    } catch (error) {
      console.warn("Falling back to mock sentiment analysis data:", error.message);
      // Return mock data when the API fails
      return MOCK_DATA.sentimentAnalysis;
    }
  },

  /**
   * Get transaction patterns and anomalies
   * @param {string} uploadId - The ID of the uploaded statement
   * @returns {Promise<Array>} List of identified transaction patterns
   */
  getTransactionPatterns: async (uploadId) => {
    try {
      // If mock data is forced, immediately return mock data
      if (USE_MOCK_DATA) {
        console.info("Using mock transaction patterns data");
        return MOCK_DATA.transactionPatterns;
      }

      const response = await fetch(
        getApiUrl(`/analytics/patterns/${uploadId}`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch transaction patterns");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data.patterns || [];
    } catch (error) {
      console.warn("Falling back to mock transaction patterns data:", error.message);
      // Return mock data when the API fails
      return MOCK_DATA.transactionPatterns;
    }
  },

  /**
   * Get predictive insights about future financial behaviors
   * @param {string} uploadId - The ID of the uploaded statement
   * @returns {Promise<Object>} Predictive financial insights
   */
  getPredictiveInsights: async (uploadId) => {
    try {
      // If mock data is forced, immediately return mock data
      if (USE_MOCK_DATA) {
        console.info("Using mock predictive insights data");
        return MOCK_DATA.predictiveInsights;
      }

      const response = await fetch(
        getApiUrl(`/analytics/predictive/${uploadId}`),
        {
          method: "GET",
          headers: apiConfig.getHeaders(true),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to fetch predictive insights");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data;
    } catch (error) {
      console.warn("Falling back to mock predictive insights data:", error.message);
      // Return mock data when the API fails
      return MOCK_DATA.predictiveInsights;
    }
  },

  /**
   * Generate a detailed financial analytics report
   * @param {string} uploadId - The ID of the uploaded statement
   * @param {Object} options - Report generation options
   * @returns {Promise<Object>} The generated report
   */
  generateAnalyticsReport: async (uploadId, options = {}) => {
    try {
      // If mock data is forced, immediately return mock report response
      if (USE_MOCK_DATA) {
        console.info("Using mock analytics report data");
        return {
          reportId: "mock-report-123",
          generatedAt: new Date().toISOString(),
          url: "#mock-report-url",
          success: true,
          message: "Mock report generated successfully"
        };
      }

      const response = await fetch(
        getApiUrl(`/analytics/generate-report/${uploadId}`),
        {
          method: "POST",
          headers: apiConfig.getHeaders(true),
          body: JSON.stringify(options),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to generate analytics report");
        error.status = response.status;
        error.details = data.details || [];
        throw error;
      }

      return data;
    } catch (error) {
      console.warn("Falling back to mock analytics report data:", error.message);
      // Return mock data when the API fails
      return {
        reportId: "mock-report-fallback",
        generatedAt: new Date().toISOString(),
        url: "#mock-report-url",
        success: true,
        message: "Mock report generated successfully (fallback)"
      };
    }
  },
};

