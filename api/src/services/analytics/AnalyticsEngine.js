const { DateTime } = require('luxon');
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const kmeans = require('node-kmeans');
const DecisionTree = require('decision-tree');
const { PCA } = require('ml-pca');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * CreditBoost Advanced Analytics Engine
 * 
 * Provides advanced financial data analysis capabilities:
 * - Pattern recognition in financial transactions
 * - Multi-source data aggregation
 * - Behavioral scoring models
 * - Predictive analytics for credit events
 * - Real-time fraud detection
 */
class AnalyticsEngine {
  constructor(config) {
    this.config = config;
    
    // Initialize TensorFlow models
    this.models = {};
    
    // Initialize data source connectors
    this.dataConnectors = {};
    
    // Cache for processed data
    this.dataCache = new Map();
    
    // Initialize tokenizer for text analysis
    this.tokenizer = new natural.WordTokenizer();
    
    // TF-IDF for transaction description analysis
    this.tfidf = new natural.TfIdf();
    
    // Initialize fraud detection system
    this.fraudDetectionSystem = {
      model: null,
      rules: this.loadFraudRules(),
      anomalyThresholds: {
        transactionAmount: 2.5, // Standard deviations from mean
        frequency: 3.0,         // Standard deviations from mean
        locationDistance: 100,  // KM from typical locations
        timePattern: 0.85       // Similarity score threshold
      }
    };
    
    // Model version tracking
    this.modelVersions = {
      creditScore: '1.0.0',
      behavioralScoring: '1.0.0',
      fraudDetection: '1.0.0',
      predictiveAnalytics: '1.0.0'
    };
    
    // Initialize behavioral categories
    this.behavioralCategories = [
      'consistent_saver',
      'occasional_splurger',
      'paycheck_to_paycheck',
      'credit_dependent',
      'investment_focused',
      'high_risk_taker',
      'budget_conscious',
      'debt_reducer'
    ];
    
    // Transaction categorization scheme
    this.transactionCategories = this.loadTransactionCategories();
  }
  
  /**
   * Initialize the analytics engine
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Load pre-trained models
      await this.loadModels();
      
      // Initialize data connectors
      this.initializeDataConnectors();
      
      // Warm up models
      await this.warmUpModels();
      
      console.log('Analytics Engine initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Analytics Engine:', error);
      throw error;
    }
  }
  
  /**
   * Load pre-trained TensorFlow models
   * @returns {Promise<void>}
   */
  async loadModels() {
    try {
      // Credit score prediction model
      this.models.creditScore = await tf.loadLayersModel(
        `file://${this.config.modelsPath}/credit_score/model.json`
      );
      
      // Fraud detection model
      this.models.fraudDetection = await tf.loadLayersModel(
        `file://${this.config.modelsPath}/fraud_detection/model.json`
      );
      
      // Behavioral scoring model
      this.models.behavioralScoring = await tf.loadLayersModel(
        `file://${this.config.modelsPath}/behavioral_scoring/model.json`
      );
      
      // Predictive analytics model (default payment predictor)
      this.models.predictiveAnalytics = await tf.loadLayersModel(
        `file://${this.config.modelsPath}/predictive_analytics/model.json`
      );
      
      console.log('All models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
      
      // Fallback to default models or create new ones if needed
      console.log('Falling back to baseline statistical models');
      this.initializeBaselineModels();
    }
  }
  
  /**
   * Initialize data connectors for different data sources
   */
  initializeDataConnectors() {
    // M-Pesa connector
    this.dataConnectors.mpesa = {
      name: 'M-Pesa',
      processData: this.processMpesaData.bind(this),
      extractFeatures: this.extractMpesaFeatures.bind(this)
    };
    
    // Bank statement connector
    this.dataConnectors.bankStatement = {
      name: 'Bank Statement',
      processData: this.processBankStatementData.bind(this),
      extractFeatures: this.extractBankStatementFeatures.bind(this)
    };
    
    // Credit card connector
    this.dataConnectors.creditCard = {
      name: 'Credit Card',
      processData: this.processCreditCardData.bind(this),
      extractFeatures: this.extractCreditCardFeatures.bind(this)
    };
    
    // Utility bills connector
    this.dataConnectors.utilityBills = {
      name: 'Utility Bills',
      processData: this.processUtilityBillsData.bind(this),
      extractFeatures: this.extractUtilityBillsFeatures.bind(this)
    };
  }
  
  /**
   * Initialize baseline models when pre-trained models are not available
   */
  initializeBaselineModels() {
    // Implement simple statistical models as fallbacks
    // These will be used until proper trained models are available
    console.log('Initializing baseline statistical models');
  }
  
  /**
   * Warm up models with sample data to ensure they're ready for predictions
   * @returns {Promise<void>}
   */
  async warmUpModels() {
    try {
      // Create sample inputs for each model
      const sampleCreditScoreInput = tf.ones([1, this.config.models.creditScore.inputFeatures]);
      const sampleFraudInput = tf.ones([1, this.config.models.fraudDetection.inputFeatures]);
      const sampleBehavioralInput = tf.ones([1, this.config.models.behavioralScoring.inputFeatures]);
      const samplePredictiveInput = tf.ones([1, this.config.models.predictiveAnalytics.inputFeatures]);
      
      // Warm up each model with a prediction
      if (this.models.creditScore) {
        await this.models.creditScore.predict(sampleCreditScoreInput).data();
      }
      
      if (this.models.fraudDetection) {
        await this.models.fraudDetection.predict(sampleFraudInput).data();
      }
      
      if (this.models.behavioralScoring) {
        await this.models.behavioralScoring.predict(sampleBehavioralInput).data();
      }
      
      if (this.models.predictiveAnalytics) {
        await this.models.predictiveAnalytics.predict(samplePredictiveInput).data();
      }
      
      console.log('Models warmed up successfully');
    } catch (error) {
      console.error('Error warming up models:', error);
    }
  }
  
  /**
   * Load fraud detection rules
   * @returns {Array} Array of fraud detection rules
   */
  loadFraudRules() {
    // Rules based system for fraud detection, complementing the ML model
    return [
      {
        name: 'unusual_amount',
        description: 'Transaction amount significantly higher than user average',
        evaluate: (transaction, userProfile) => {
          const threshold = userProfile.averageTransactionAmount * 5;
          return transaction.amount > threshold && transaction.amount > 10000;
        },
        severity: 'high'
      },
      {
        name: 'frequency_spike',
        description: 'Unusual spike in transaction frequency',
        evaluate: (recentTransactions, userProfile) => {
          const last24Hours = recentTransactions.filter(t => 
            DateTime.fromISO(t.date) > DateTime.now().minus({ hours: 24 })
          );
          return last24Hours.length > userProfile.dailyTransactionFrequency * 3;
        },
        severity: 'medium'
      },
      {
        name: 'geographical_anomaly',
        description: 'Transactions from unusual locations',
        evaluate: (transaction, userProfile) => {
          if (!transaction.location || !userProfile.commonLocations) return false;
          
          // Check if transaction location is far from common locations
          return !userProfile.commonLocations.some(loc => 
            this.calculateDistance(loc, transaction.location) < 100
          );
        },
        severity: 'high'
      },
      {
        name: 'time_pattern_break',
        description: 'Transaction time outside normal pattern',
        evaluate: (transaction, userProfile) => {
          if (!userProfile.transactionTimePatterns) return false;
          
          const hour = DateTime.fromISO(transaction.date).hour;
          return !userProfile.transactionTimePatterns.includes(hour);
        },
        severity: 'low'
      },
      {
        name: 'new_recipient',
        description: 'Transfer to new recipient with high value',
        evaluate: (transaction, userProfile) => {
          if (transaction.type !== 'transfer' || !transaction.recipient) return false;
          
          const isNewRecipient = !userProfile.knownRecipients.includes(transaction.recipient);
          return isNewRecipient && transaction.amount > userProfile.averageTransferAmount * 2;
        },
        severity: 'medium'
      }
    ];
  }
  
  /**
   * Load transaction categories for classification
   * @returns {Object} Transaction categories
   */
  loadTransactionCategories() {
    return {
      income: {
        salary: ['salary', 'payroll', 'wage', 'income'],
        investment: ['dividend', 'interest', 'profit', 'return'],
        benefits: ['pension', 'welfare', 'benefit', 'aid', 'grant'],
        business: ['sales', 'revenue', 'profit', 'client', 'customer']
      },
      expense: {
        housing: ['rent', 'mortgage', 'lease', 'housing'],
        utilities: ['water', 'electricity', 'gas', 'internet', 'phone', 'bill'],
        food: ['grocery', 'restaurant', 'food', 'meal', 'dining'],
        transportation: ['fuel', 'gas', 'transport', 'uber', 'taxi', 'fare', 'toll'],
        healthcare: ['doctor', 'hospital', 'medical', 'pharmacy', 'health'],
        education: ['tuition', 'school', 'college', 'university', 'course'],
        entertainment: ['movie', 'ticket', 'concert', 'subscription', 'game'],
        shopping: ['clothing', 'electronics', 'amazon', 'mall', 'shop', 'store']
      },
      transfer: {
        internal: ['transfer', 'move', 'account to account'],
        external: ['wire', 'send money', 'remittance'],
        loan: ['loan payment', 'credit', 'repayment', 'installment'],
        investment: ['investment', 'stock', 'fund', 'deposit']
      }
    };
  }
  
  /**
   * Process M-Pesa transaction data
   * @param {Array} transactions - Raw M-Pesa transaction data
   * @returns {Object} Processed data
   */
  processMpesaData(transactions) {
    console.log(`Processing ${transactions.length} M-Pesa transactions`);
    
    // Process transaction data
    const processedTransactions = transactions.map(transaction => {
      // Parse transaction date
      const transactionDate = DateTime.fromFormat(
        transaction.date + ' ' + transaction.time, 
        'dd/MM/yyyy HH:mm:ss'
      );
      
      // Determine transaction type
      let type = 'unknown';
      let isIncome = false;
      let isExpense = false;
      
      // Analyze description to categorize transaction
      if (transaction.description.includes('Received from')) {
        type = 'receive';
        isIncome = true;
      } else if (transaction.description.includes('Sent to')) {
        type = 'send';
        isExpense = true;
      } else if (transaction.description.includes('Paid to')) {
        type = 'payment';
        isExpense = true;
      } else if (transaction.description.includes('Withdraw from')) {
        type = 'withdraw';
        isExpense = true;
      } else if (transaction.description.includes('Deposit to')) {
        type = 'deposit';
        isIncome = true;
      } else if (transaction.description.includes('Buy Goods')) {
        type = 'purchase';
        isExpense = true;
      } else if (transaction.description.includes('Paybill')) {
        type = 'bill';
        isExpense = true;
      }
      
      // Extract recipient/sender if available
      let recipient = null;
      let sender = null;
      
      if (type === 'send' || type === 'payment') {
        // Extract recipient from description like "Sent to JOHN DOE - 254722000000"
        const match = transaction.description.match(/Sent to (.*?) - (\d+)/);
        if (match) {
          recipient = {
            name: match[1],
            phoneNumber: match[2]
          };
        }
      } else if (type === 'receive') {
        // Extract sender from description like "Received from JANE DOE - 254722000000"
        const match = transaction.description.match(/Received from (.*?) - (\d+)/);
        if (match) {
          sender = {
            name: match[1],
            phoneNumber: match[2]
          };
        }
      }
      
      // Categorize transaction
      let category = null;
      let subcategory = null;
      
      const description = transaction.description.toLowerCase();
      
      // Attempt to categorize based on transaction description
      for (const [mainCategory, subcategories] of Object.entries(this.transactionCategories)) {
        for (const [subCat, keywords] of Object.entries(subcategories)) {
          if (keywords.some(keyword => description.includes(keyword.toLowerCase()))) {
            category = mainCategory;
            subcategory = subCat;
            break;
          }
        }
        if (category) break;
      }
      
      // If category not found, use defaults based on transaction type
      if (!category) {
        if (isIncome) {
          category = 'income';
          subcategory = 'other';
        } else if (isExpense) {
          category = 'expense';
          subcategory = 'other';
        } else {
          category = 'transfer';
          subcategory = 'other';
        }
      }
      
      // Parse amount from transaction
      let amount = parseFloat(transaction.amount.replace(/[^\d.-]/g, ''));
      
      // Handle Debit/Credit indication
      if (transaction.debitCredit === 'DR' || isExpense) {
        amount = Math.abs(amount) * -1;
      } else {
        amount = Math.abs(amount);
      }
      
      // Return structured transaction
      return {
        id: uuidv4(),
        date: transactionDate.toISO(),
        description: transaction.description,
        amount,
        balance: parseFloat(transaction.balance.replace(/[^\d.-]/g, '')),
        type,
        category,
        subcategory,
        isIncome,
        isExpense,
        recipient,
        sender,
        source: 'mpesa',
        rawData: transaction
      };
    });
    
    return {
      source: 'mpesa',
      totalTransactions: processedTransactions.length,
      transactions: processedTransactions,
      summary: this.summarizeTransactions(processedTransactions)
    };
  }
  
  /**
   * Extract features from M-Pesa data for analysis
   * @param {Object} processedData - Processed M-Pesa data
   * @returns {Object} Extracted features
   */
  extractMpesaFeatures(processedData) {
    const { transactions } = processedData;
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      DateTime.fromISO(a.date) - DateTime.fromISO(b.date)
    );
    
    // Extract time-based features
    const timeFeatures = this.extractTimeFeatures(sortedTransactions);
    
    // Extract amount-based features
    const amountFeatures = this.extractAmountFeatures(sortedTransactions);
    
    // Extract frequency-based features
    const frequencyFeatures = this.extractFrequencyFeatures(sortedTransactions);
    
    // Extract behavioral features
    const behavioralFeatures = this.extractBehavioralFeatures(sortedTransactions);
    
    return {
      timeFeatures,
      amountFeatures,
      frequencyFeatures,
      behavioralFeatures,
      transactionCount: transactions.length,
      periodStartDate: sortedTransactions[0].date,
      periodEndDate: sortedTransactions[sortedTransactions.length - 1].date
    };
  }
  
  /**
   * Process bank statement data
   * @param {Array} transactions - Raw bank statement transactions
   * @returns {Object} Processed data
   */
  processBankStatementData(transactions) {
    console.log(`Processing ${transactions.length} bank statement transactions`);
    
    // Similar to M-Pesa processing but adapted for bank statement format
    // Implementation would be specific to the bank statement format
    
    return {
      source: 'bank_statement',
      totalTransactions: transactions.length,
      transactions: [], // Processed transactions
      summary: {} // Summary statistics
    };
  }
  
  /**
   * Process credit card data
   * @param {Array} transactions - Raw credit card transactions
   * @returns {Object} Processed data
   */
  processCreditCardData(transactions) {
    console.log(`Processing ${transactions.length} credit card transactions`);
    
    // Implementation for credit card data processing
    
    return {
      source: 'credit_card',
      totalTransactions: transactions.length,
      transactions: [], // Processed transactions
      summary: {} // Summary statistics
    };
  }
  
  /**
   * Process utility bills data
   * @param {Array} bills - Raw utility bills
   * @returns {Object} Processed data
   */
  processUtilityBillsData(bills) {
    console.log(`Processing ${bills.length} utility bills`);
    
    // Implementation for utility bill data processing
    
    return {
      source: 'utility_bills',
      totalBills: bills.length,
      bills: [], // Processed bills
      summary: {} // Summary statistics
    };
  }
  
  /**
   * Extract time-based features from transactions
   * @param {Array} transactions - Processed transactions
   * @returns {Object} Time-based features
   */
  extractTimeFeatures(transactions) {
    // Calculate time-based features
    const transactionDates = transactions.map(t => DateTime.fromISO(t.date));
    
    // Determine transaction frequency patterns
    const dayOfWeekCounts = new Array(7).fill(0);
    const hourOfDayCounts = new Array(24).fill(0);
    const dayOfMonthCounts = new Array(31).fill(0);
    
    transactionDates.forEach(date => {
      dayOfWeekCounts[date.weekday - 1]++;
      hourOfDayCounts[date.hour]++;
      dayOfMonthCounts[date.day - 1]++;
    });
    
    // Calculate common days and times
    const mostCommonWeekday = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts)) + 1;
    const mostCommonHour = hourOfDayCounts.indexOf(Math.max(...hourOfDayCounts));
    const mostCommonDayOfMonth = dayOfMonthCounts.indexOf(Math.max(...dayOfMonthCounts)) + 1;
    
    // Calculate time intervals between transactions
    const intervals = [];
    for (let i = 1; i < transactionDates.length; i++) {
      const interval = transactionDates[i].diff(transactionDates[i - 1], 'hours').hours;
      if (interval > 0) {
        intervals.push(interval);
      }
    }
    
    const averageInterval = intervals.length > 0 
      ? intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length 
      : 0;
    
    return {
      dayOfWeekDistribution: dayOfWeekCounts,
      hourOfDayDistribution: hourOfDayCounts,
      dayOfMonthDistribution: dayOfMonthCounts,
      mostCommonWeekday,
      mostCommonHour,
      mostCommonDayOfMonth,
      averageIntervalHours: averageInterval,
      regularityScore: this.calculateRegularityScore(intervals),
      transactionTimePatterns: this.detectTimePatterns(transactionDates)
    };
  }
  
  /**
   * Calculate regularity score from transaction intervals
   * @param {Array} intervals - Time intervals between transactions
   * @returns {number} Regularity score (0-100)
   */
  calculateRegularityScore(intervals) {
    if (intervals.length < 2) return 0;
    
    // Calculate coefficient of variation (lower CV means more regular)
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean === 0 ? 0 : stdDev / mean;
    
    // Convert CV to a 0-100 score (0 = extremely irregular, 100 = perfectly regular)
    // Lower CV means higher regularity
    const score = Math.max(0, Math.min(100, 100 * Math.exp(-2 * cv)));
    
    return Math.round(score);
  }
  
  /**
   * Detect regular time patterns in transactions
   * @param {Array} dates - Array of DateTime objects
   * @returns {Object} Detected patterns
   */
  detectTimePatterns(dates) {
    // Implementation for time pattern detection
    
    return {
      weeklyPattern: this.detectWeeklyPattern(dates),
      monthlyPattern: this.detectMonthlyPattern(dates),
      paydayPattern: this.detectPaydayPattern(dates)
    };
  }
  
  /**
   * Extract amount-based features from transactions
   * @param {Array} transactions - Processed transactions
   * @returns {Object} Amount-based features
   */
  extractAmountFeatures(transactions) {
    // Calculate amount statistics
    const amounts = transactions.map(t => t.amount);
    const incomeAmounts = transactions.filter(t => t.isIncome).map(t => t.amount);
    const expenseAmounts = transactions.filter(t => t.isExpense).map(t => t.amount);
    
    // Calculate basic statistics
    const totalIncome = incomeAmounts.reduce((sum, amount) => sum + amount, 0);
    const totalExpense = expenseAmounts.reduce((sum, amount) => sum + Math.abs(amount), 0);
    const netCashflow = totalIncome - totalExpense;
    
    // Calculate averages
    const averageIncome = incomeAmounts.length > 0 ? totalIncome / incomeAmounts.length : 0;
    const averageExpense = expenseAmounts.length > 0 ? totalExpense / expenseAmounts.length : 0;
    
    // Calculate variability
    const incomeVariability = this.calculateVariability(incomeAmounts);
    const expenseVariability = this.calculateVariability(expenseAmounts);
    
    // Calculate trends
    const incomeTrend = this.calculateTrend(transactions.filter(t => t.isIncome));
    const expenseTrend = this.calculateTrend(transactions.filter(t => t.isExpense));
    
    return {
      totalIncome,
      totalExpense,
      netCashflow,
      averageIncome,
      averageExpense,
      savingsRate: totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0,
      incomeVariability,
      expenseVariability,
      incomeTrend,
      expenseTrend,
      largestIncome: incomeAmounts.length > 0 ? Math.max(...incomeAmounts) : 0,
      largestExpense: expenseAmounts.length > 0 ? Math.max(...expenseAmounts.map(a => Math.abs(a))) : 0,
      incomeFrequency: incomeAmounts.length,
      expenseFrequency: expenseAmounts.length,
      incomeToExpenseRatio: totalExpense > 0 ? totalIncome / totalExpense : 0
    };
  }
  
  /**
   * Calculate variability of a set of values
   * @param {Array} values - Array of numeric values
   * @returns {number} Coefficient of variation
   */
  calculateVariability(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return mean === 0 ? 0 : stdDev / mean;
  }
  
  /**
   * Calculate trend for a series of transactions
   * @param {Array} transactions - List of transactions
   * @returns {Object} Trend information
   */
  calculateTrend(transactions) {
    if (transactions.length < 2) return { slope: 0, direction: 'stable' };
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      DateTime.fromISO(a.date) - DateTime.fromISO(b.date)
    );
    
    // Simple linear regression
    const n = sortedTransactions.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = sortedTransactions.map(t => t.amount);
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Determine trend direction
    let direction = 'stable';
    if (slope > 0.05) {
      direction = 'increasing';
    } else if (slope < -0.05) {
      direction = 'decreasing';
    }
    
    return { slope, direction };
  }
  
  /**
   * Extract frequency-based features from transactions
   * @param {Array} transactions - Processed transactions
   * @returns {Object} Frequency features
   */
  extractFrequencyFeatures(transactions) {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      DateTime.fromISO(a.date) - DateTime.fromISO(b.date)
    );
    
    if (sortedTransactions.length < 2) {
      return {
        dailyFrequency: 0,
        weeklyFrequency: 0,
        monthlyFrequency: 0,
        frequencyStability: 0
      };
    }
    
    // Calculate date range
    const startDate = DateTime.fromISO(sortedTransactions[0].date);
    const endDate = DateTime.fromISO(sortedTransactions[sortedTransactions.length - 1].date);
    const totalDays = endDate.diff(startDate, 'days').days;
    
    if (totalDays < 1) {
      return {
        dailyFrequency: transactions.length,
        weeklyFrequency: transactions.length * 7,
        monthlyFrequency: transactions.length * 30,
        frequencyStability: 0
      };
    }
    
    // Calculate frequencies
    const dailyFrequency = transactions.length / totalDays;
    const weeklyFrequency = dailyFrequency * 7;
    const monthlyFrequency = dailyFrequency * 30;
    
    // Calculate frequency stability
    // Get frequency per day over the period
    const daysWithTransactions = new Set();
    transactions.forEach(transaction => {
      const date = DateTime.fromISO(transaction.date);
      daysWithTransactions.add(date.toFormat('yyyy-MM-dd'));
    });
    
    const frequencyStability = daysWithTransactions.size / totalDays;
    
    return {
      dailyFrequency,
      weeklyFrequency,
      monthlyFrequency,
      daysWithTransactions: daysWithTransactions.size,
      totalDays,
      frequencyStability
    };
  }
  
  /**
   * Extract behavioral features from transactions
   * @param {Array} transactions - Processed transactions
   * @returns {Object} Behavioral features
   */
  extractBehavioralFeatures(transactions) {
    if (transactions.length < 5) {
      return {
        behavioralScore: 0,
        primaryBehavior: 'insufficient_data',
        behaviors: [],
        consistency: 0
      };
    }
    
    // Get date range
    const sortedByDate = [...transactions].sort((a, b) => 
      DateTime.fromISO(a.date) - DateTime.fromISO(b.date)
    );
    
    const startDate = DateTime.fromISO(sortedByDate[0].date);
    const endDate = DateTime.fromISO(sortedByDate[sortedByDate.length - 1].date);
    const totalDays = endDate.diff(startDate, 'days').days;
    
    // Extract features from transaction data
    const amountFeatures = this.extractAmountFeatures(transactions);
    const frequencyFeatures = this.extractFrequencyFeatures(transactions);
    
    // Calculate savings behavior
    const savingsRate = amountFeatures.savingsRate;
    const consistentSavingScore = savingsRate > 15 ? 
      (frequencyFeatures.frequencyStability > 0.5 ? 100 : 50) : 0;
    
    // Calculate spending behavior
    const expenseTrend = amountFeatures.expenseTrend.direction;
    const expenseVariability = amountFeatures.expenseVariability;
    const occasionalSplurgerScore = 
      expenseVariability > 0.5 && amountFeatures.largestExpense > amountFeatures.averageExpense * 3 ? 100 : 0;
    
    // Calculate paycheck-to-paycheck behavior
    const paycheckToPaycheckScore = 
      Math.abs(amountFeatures.savingsRate) < 5 && amountFeatures.incomeToExpenseRatio < 1.1 ? 100 : 0;
    
    // Calculate credit dependency
    // This would require credit card data which we don't have in this implementation
    const creditDependentScore = 0;
    
    // Budget consciousness
    const budgetConsciousScore = 
      expenseVariability < 0.3 && expenseTrend === 'stable' && amountFeatures.savingsRate > 0 ? 100 : 0;
    
    // Calculate behavioral scores
    const behavioralScores = {
      consistent_saver: consistentSavingScore,
      occasional_splurger: occasionalSplurgerScore, 
      paycheck_to_paycheck: paycheckToPaycheckScore,
      credit_dependent: creditDependentScore,
      budget_conscious: budgetConsciousScore
      // Other behaviors would require more specific data
    };
    
    // Find primary behavior (highest score)
    let primaryBehavior = 'undefined';
    let highestScore = -1;
    
    for (const [behavior, score] of Object.entries(behavioralScores)) {
      if (score > highestScore) {
        highestScore = score;
        primaryBehavior = behavior;
      }
    }
    
    // If no strong behavior is detected
    if (highestScore < 50) {
      primaryBehavior = 'mixed';
    }
    
    // Calculate overall consistency
    const consistencyMetrics = [
      frequencyFeatures.frequencyStability,
      1 - amountFeatures.expenseVariability,
      amountFeatures.expenseTrend.direction === 'stable' ? 1 : 0.5
    ];
    
    const consistency = consistencyMetrics.reduce((sum, metric) => sum + metric, 0) / consistencyMetrics.length * 100;
    
    // Format behaviors as sorted array
    const behaviors = Object.entries(behavioralScores)
      .map(([name, score]) => ({ name, score }))
      .filter(b => b.score > 0)
      .sort((a, b) => b.score - a.score);
    
    return {
      behavioralScore: Math.round(highestScore),
      primaryBehavior,
      behaviors,
      consistency: Math.round(consistency)
    };
  }
  
  /**
   * Summarize transactions with key statistics
   * @param {Array} transactions - Processed transactions
   * @returns {Object} Summary statistics
   */
  summarizeTransactions(transactions) {
    // Extract features
    const amountFeatures = this.extractAmountFeatures(transactions);
    const frequencyFeatures = this.extractFrequencyFeatures(transactions);
    const behavioralFeatures = this.extractBehavioralFeatures(transactions);
    
    // Get date range
    const sortedByDate = [...transactions].sort((a, b) => 
      DateTime.fromISO(a.date) - DateTime.fromISO(b.date)
    );
    
    const startDate = DateTime.fromISO(sortedByDate[0].date);
    const endDate = DateTime.fromISO(sortedByDate[sortedByDate.length - 1].date);
    
    // Categorize transactions
    const categoryCounts = {};
    const categoryAmounts = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category;
      
      // Initialize if needed
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
        categoryAmounts[category] = 0;
      }
      
      categoryCounts[category]++;
      categoryAmounts[category] += transaction.isExpense ? 
        Math.abs(transaction.amount) : transaction.amount;
    });
    
    // Format categories as array
    const categories = Object.keys(categoryCounts).map(category => ({
      name: category,
      count: categoryCounts[category],
      amount: categoryAmounts[category],
      percentage: (categoryAmounts[category] / 
        (category === 'income' ? amountFeatures.totalIncome : amountFeatures.totalExpense)) * 100
    }));
    
    return {
      period: {
        start: startDate.toFormat('yyyy-MM-dd'),
        end: endDate.toFormat('yyyy-MM-dd'),
        totalDays: endDate.diff(startDate, 'days').days
      },
      transactions: {
        total: transactions.length,
        dailyAverage: frequencyFeatures.dailyFrequency
      },
      financials: {
        totalIncome: amountFeatures.totalIncome,
        totalExpenses: amountFeatures.totalExpense,
        netCashflow: amountFeatures.netCashflow,
        savingsRate: amountFeatures.savingsRate,
        largestIncome: amountFeatures.largestIncome,
        largestExpense: amountFeatures.largestExpense,
        averageIncome: amountFeatures.averageIncome,
        averageExpense: amountFeatures.averageExpense
      },
      behavior: {
        primaryBehavior: behavioralFeatures.primaryBehavior,
        consistency: behavioralFeatures.consistency,
        expenseTrend: amountFeatures.expenseTrend.direction
      },
      categories
    };
  }
  
  /**
   * Analyze user behavior based on transaction data
   * @param {Array} transactions - Processed transactions
   * @returns {Object} Behavioral analysis
   */
  behavioralScoring(transactions) {
    // Extract behavioral features
    const behavioralFeatures = this.extractBehavioralFeatures(transactions);
    const amountFeatures = this.extractAmountFeatures(transactions);
    const frequencyFeatures = this.extractFrequencyFeatures(transactions);
    
    // Use TensorFlow model if available, otherwise use rule-based approach
    let behavioralScores;
    
    if (this.models.behavioralScoring) {
      // Prepare input features for the model
      const features = [
        amountFeatures.savingsRate / 100,
        amountFeatures.incomeToExpenseRatio > 5 ? 5 : amountFeatures.incomeToExpenseRatio,
        amountFeatures.expenseVariability,
        frequencyFeatures.frequencyStability,
        amountFeatures.incomeTrend.slope,
        amountFeatures.expenseTrend.slope,
        frequencyFeatures.dailyFrequency > 5 ? 5 : frequencyFeatures.dailyFrequency
      ];
      
      // Convert to tensor
      const inputTensor = tf.tensor2d([features]);
      
      // Get prediction
      const prediction = this.models.behavioralScoring.predict(inputTensor);
      const scoresTensor = prediction.dataSync();
      
      // Map scores to behaviors
      behavioralScores = {};
      this.behavioralCategories.forEach((category, index) => {
        behavioralScores[category] = Math.round(scoresTensor[index] * 100);
      });
    } else {
      // Use already calculated behavioral features
      behavioralScores = {};
      behavioralFeatures.behaviors.forEach(behavior => {
        behavioralScores[behavior.name] = behavior.score;
      });
    }
    
    // Calculate financial health score
    const financialHealthScore = this.calculateFinancialHealthScore(transactions);
    
    // Generate behavioral insights
    const insights = this.generateBehavioralInsights(
      behavioralFeatures, 
      amountFeatures, 
      frequencyFeatures,
      financialHealthScore
    );
    
    return {
      primaryBehavior: behavioralFeatures.primaryBehavior,
      behavioralScores,
      consistency: behavioralFeatures.consistency,
      financialHealthScore,
      insights
    };
  }
  
  /**
   * Calculate overall financial health score
   * @param {Array} transactions - Processed transactions
   * @returns {number} Financial health score (0-100)
   */
  calculateFinancialHealthScore(transactions) {
    const amountFeatures = this.extractAmountFeatures(transactions);
    const behavioralFeatures = this.extractBehavioralFeatures(transactions);
    
    // Components of financial health
    const savingsScore = Math.min(100, amountFeatures.savingsRate * 2);
    const stabilityScore = behavioralFeatures.consistency;
    const incomeToExpenseScore = Math.min(100, amountFeatures.incomeToExpenseRatio * 25);
    
    // Weight each component
    const weights = {
      savings: 0.5,
      stability: 0.3,
      incomeToExpense: 0.2
    };
    
    // Calculate weighted score
    const weightedScore = 
      (savingsScore * weights.savings) +
      (stabilityScore * weights.stability) +
      (incomeToExpenseScore * weights.incomeToExpense);
    
    return Math.round(weightedScore);
  }
  
  /**
   * Generate behavioral insights based on analysis
   * @param {Object} behavioralFeatures - Behavioral features
   * @param {Object} amountFeatures - Amount features
   * @param {Object} frequencyFeatures - Frequency features
   * @param {number} financialHealthScore - Financial health score
   * @returns {Array} Array of insights
   */
  generateBehavioralInsights(behavioralFeatures, amountFeatures, frequencyFeatures, financialHealthScore) {
    const insights = [];
    
    // Savings insights
    if (amountFeatures.savingsRate < 0) {
      insights.push({
        type: 'warning',
        category: 'savings',
        message: 'Your expenses exceed your income, which may lead to financial stress over time.',
        action: 'Consider finding ways to reduce expenses or increase income to achieve a positive cash flow.'
      });
    } else if (amountFeatures.savingsRate < 10) {
      insights.push({
        type: 'suggestion',
        category: 'savings',
        message: 'Your savings rate is below the recommended 15-20%.',
        action: 'Try to gradually increase your savings by reducing non-essential expenses.'
      });
    } else if (amountFeatures.savingsRate > 20) {
      insights.push({
        type: 'positive',
        category: 'savings',
        message: 'Great job maintaining a healthy savings rate above 20%.',
        action: 'Consider investing some of your savings for long-term growth.'
      });
    }
    
    // Spending pattern insights
    if (amountFeatures.expenseVariability > 0.5) {
      insights.push({
        type: 'observation',
        category: 'spending',
        message: 'Your spending shows significant variability month to month.',
        action: 'Creating a budget might help stabilize your spending patterns.'
      });
    }
    
    if (amountFeatures.expenseTrend.direction === 'increasing') {
      insights.push({
        type: 'warning',
        category: 'spending',
        message: 'Your expenses show an increasing trend over time.',
        action: 'Review your spending to identify areas where costs are growing.'
      });
    }
    
    // Financial health insights
    if (financialHealthScore < 40) {
      insights.push({
        type: 'warning',
        category: 'financial_health',
        message: 'Your overall financial health score is concerning.',
        action: 'Consider financial counseling or creating a strict budget to improve your situation.'
      });
    } else if (financialHealthScore > 70) {
      insights.push({
        type: 'positive',
        category: 'financial_health',
        message: 'Your financial health is strong compared to your peers.',
        action: 'Keep up the good habits and consider setting more ambitious financial goals.'
      });
    }
    
    // Behavior-specific insights
    if (behavioralFeatures.primaryBehavior === 'paycheck_to_paycheck') {
      insights.push({
        type: 'warning',
        category: 'behavior',
        message: 'Your spending patterns suggest you may be living paycheck to paycheck.',
        action: 'Building an emergency fund can help provide financial security.'
      });
    } else if (behavioralFeatures.primaryBehavior === 'consistent_saver') {
      insights.push({
        type: 'positive',
        category: 'behavior',
        message: 'You show consistent saving behavior, which is excellent for long-term financial health.',
        action: 'Consider diversifying your savings into different investment vehicles.'
      });
    }
    

