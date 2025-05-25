import { CreditData, TransactionRecord } from '../../types';

// Fraud detection related interfaces
export interface FraudDetectionResult {
    isFraudulent: boolean;
    riskScore: number;  // 0-100 scale where 100 is highest risk
    detectionDetails: FraudDetectionDetails;
    timestamp: Date;
}

export interface FraudDetectionDetails {
    patternAnalysis: PatternAnalysisResult;
    scoreFluctuation: ScoreFluctuationResult;
    anomalyDetection: AnomalyDetectionResult;
    recommendations: string[];
}

interface PatternAnalysisResult {
    suspiciousPatterns: boolean;
    confidence: number;  // 0-1 scale
    detectedPatterns: string[];
}

interface ScoreFluctuationResult {
    significantFluctuation: boolean;
    zScore: number;  // Statistical z-score of fluctuation
    percentageChange: number;
    timeframe: string;
}

interface AnomalyDetectionResult {
    anomaliesDetected: boolean;
    anomalyTypes: string[];
    severityScore: number;  // 0-10 scale
}

// Statistical thresholds for detection
const RISK_THRESHOLDS = {
    HIGH_RISK_SCORE: 75,
    MEDIUM_RISK_SCORE: 50,
    LOW_RISK_SCORE: 25,
    SIGNIFICANT_ZSCORE: 2.5,
    PATTERN_CONFIDENCE: 0.7,
    ANOMALY_SEVERITY: 7
};

/**
 * Main fraud detection function that analyzes credit data and detects potential fraud
 * @param creditData The credit data to analyze
 * @param historicalData Optional historical credit data for better analysis
 * @returns Comprehensive fraud detection result with risk scoring
 */
export function detectFraudulentActivity(
    creditData: CreditData, 
    historicalData?: CreditData[]
): FraudDetectionResult {
    // Perform comprehensive analysis using AI-based techniques
    const patternAnalysis = analyzeTransactionPatterns(creditData);
    const scoreFluctuation = analyzeScoreFluctuations(creditData, historicalData);
    const anomalyDetection = detectAnomalies(creditData, historicalData);
    
    // Calculate overall risk score (0-100) based on weighted factors
    const riskScore = calculateRiskScore(patternAnalysis, scoreFluctuation, anomalyDetection);
    
    // Generate recommendations based on findings
    const recommendations = generateRecommendations(patternAnalysis, scoreFluctuation, anomalyDetection);
    
    return {
        isFraudulent: riskScore >= RISK_THRESHOLDS.HIGH_RISK_SCORE,
        riskScore,
        detectionDetails: {
            patternAnalysis,
            scoreFluctuation,
            anomalyDetection,
            recommendations
        },
        timestamp: new Date()
    };
}

/**
 * Analyzes transaction patterns to identify suspicious behaviors
 * Uses statistical models to detect common fraud patterns
 */
function analyzeTransactionPatterns(creditData: CreditData): PatternAnalysisResult {
    const transactions = creditData.transactionHistory;
    const detectedPatterns: string[] = [];
    let confidenceScore = 0;
    
    // Pattern 1: Rapid succession of similar transactions
    if (detectRapidSuccessionTransactions(transactions)) {
        detectedPatterns.push('rapid_succession_transactions');
        confidenceScore += 0.3;
    }
    
    // Pattern 2: Unusual geographic spread of transactions
    if (detectGeographicAnomalies(transactions)) {
        detectedPatterns.push('geographic_anomalies');
        confidenceScore += 0.25;
    }
    
    // Pattern 3: Unusual transaction amount patterns
    if (detectAmountPatterns(transactions)) {
        detectedPatterns.push('unusual_amount_patterns');
        confidenceScore += 0.2;
    }
    
    // Pattern 4: Transactions outside normal hours
    if (detectTimeAnomalies(transactions)) {
        detectedPatterns.push('time_anomalies');
        confidenceScore += 0.15;
    }
    
    // Pattern 5: Structured transactions (just below reporting thresholds)
    if (detectStructuredTransactions(transactions)) {
        detectedPatterns.push('structured_transactions');
        confidenceScore += 0.4;
    }
    
    return {
        suspiciousPatterns: detectedPatterns.length > 0 && confidenceScore >= RISK_THRESHOLDS.PATTERN_CONFIDENCE,
        confidence: confidenceScore,
        detectedPatterns
    };
}

/**
 * Detects transactions that occur in rapid succession
 * Common in card testing or automated fraud attempts
 */
function detectRapidSuccessionTransactions(transactions: TransactionRecord[]): boolean {
    if (transactions.length < 3) return false;
    
    // Sort transactions by timestamp
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Check for multiple transactions in a short timeframe
    let rapidTransactionCount = 0;
    for (let i = 1; i < sortedTransactions.length; i++) {
        const timeDiff = new Date(sortedTransactions[i].timestamp).getTime() - 
                         new Date(sortedTransactions[i-1].timestamp).getTime();
        
        // If less than 5 minutes apart
        if (timeDiff < 5 * 60 * 1000) {
            rapidTransactionCount++;
            
            // If 3 or more transactions in rapid succession
            if (rapidTransactionCount >= 2) {
                return true;
            }
        } else {
            rapidTransactionCount = 0;
        }
    }
    
    return false;
}

/**
 * Detects geographic anomalies in transaction locations
 */
function detectGeographicAnomalies(transactions: TransactionRecord[]): boolean {
    if (transactions.length < 3) return false;
    
    // Extract locations from transactions
    const locations = transactions.map(t => t.location).filter(l => l);
    if (locations.length < 3) return false;
    
    // Find unique locations
    const uniqueLocations = new Set(locations);
    
    // Calculate time-distance impossibility
    // (simplified implementation - would use real geo-coordinates in production)
    for (let i = 1; i < transactions.length; i++) {
        const prevTx = transactions[i-1];
        const currTx = transactions[i];
        
        if (!prevTx.location || !currTx.location) continue;
        
        const timeDiff = new Date(currTx.timestamp).getTime() - 
                         new Date(prevTx.timestamp).getTime();
        
        // If locations are different but time difference is too small for travel
        // (this is a simplified check - real implementation would use actual distances)
        if (prevTx.location !== currTx.location && timeDiff < 2 * 60 * 60 * 1000) {
            return true;
        }
    }
    
    // If too many locations in a short period
    return uniqueLocations.size > 5 && 
           (new Date(transactions[transactions.length-1].timestamp).getTime() - 
            new Date(transactions[0].timestamp).getTime()) < 24 * 60 * 60 * 1000;
}

/**
 * Analyzes unusual patterns in transaction amounts
 */
function detectAmountPatterns(transactions: TransactionRecord[]): boolean {
    if (transactions.length < 5) return false;
    
    const amounts = transactions.map(t => t.amount);
    
    // Calculate statistics
    const average = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const stdDev = Math.sqrt(
        amounts.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / amounts.length
    );
    
    // Look for outliers (values more than 3 standard deviations from mean)
    const outliers = amounts.filter(amount => Math.abs(amount - average) > 3 * stdDev);
    
    // Check for perfectly round amounts in sequence (unusual in legitimate transactions)
    let roundAmountCount = 0;
    for (const amount of amounts) {
        if (amount % 100 === 0 || amount % 1000 === 0) {
            roundAmountCount++;
        }
    }
    
    return outliers.length >= 2 || roundAmountCount >= 3;
}

/**
 * Detects transactions occurring at unusual hours
 */
function detectTimeAnomalies(transactions: TransactionRecord[]): boolean {
    if (transactions.length < 3) return false;
    
    let unusualTimeCount = 0;
    
    for (const transaction of transactions) {
        const hour = new Date(transaction.timestamp).getHours();
        
        // Transactions between midnight and 5am often suspicious
        if (hour >= 0 && hour < 5) {
            unusualTimeCount++;
        }
    }
    
    return unusualTimeCount >= 3;
}

/**
 * Detects structured transactions designed to avoid reporting thresholds
 */
function detectStructuredTransactions(transactions: TransactionRecord[]): boolean {
    if (transactions.length < 3) return false;
    
    // Common reporting thresholds
    const thresholds = [10000, 3000, 5000];
    let justBelowThresholdCount = 0;
    
    for (const transaction of transactions) {
        // Check if amount is just below common reporting thresholds
        for (const threshold of thresholds) {
            if (transaction.amount > threshold * 0.9 && transaction.amount < threshold) {
                justBelowThresholdCount++;
                break;
            }
        }
    }
    
    return justBelowThresholdCount >= 2;
}

/**
 * Analyzes credit score fluctuations to detect suspicious patterns
 * Uses statistical methods to identify significant changes
 */
function analyzeScoreFluctuations(
    creditData: CreditData, 
    historicalData?: CreditData[]
): ScoreFluctuationResult {
    // If no historical data, check for red flags in current data
    if (!historicalData || historicalData.length === 0) {
        return {
            significantFluctuation: false,
            zScore: 0,
            percentageChange: 0,
            timeframe: 'insufficient_data'
        };
    }
    
    // Extract credit scores and timestamps
    const scores = historicalData.map(data => ({
        score: data.creditScore,
        timestamp: new Date(data.lastUpdateTimestamp)
    }));
    
    // Add current score
    scores.push({
        score: creditData.creditScore,
        timestamp: new Date(creditData.lastUpdateTimestamp)
    });
    
    // Sort by timestamp
    scores.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Calculate changes
    const changes: number[] = [];
    let timeframe = '';
    
    for (let i = 1; i < scores.length; i++) {
        changes.push(scores[i].score - scores[i-1].score);
    }
    
    // Calculate statistics
    const avgChange = changes.reduce((sum, val) => sum + val, 0) / changes.length;
    const stdDevChange = Math.sqrt(
        changes.reduce((sum, val) => sum + Math.pow(val - avgChange, 2), 0) / changes.length
    );
    
    // Latest change
    const latestChange = changes[changes.length - 1];
    
    // Z-score of latest change
    const zScore = stdDevChange !== 0 ? Math.abs(latestChange - avgChange) / stdDevChange : 0;
    
    // Percentage change
    const percentageChange = scores.length > 1 ? 
        ((scores[scores.length - 1].score - scores[scores.length - 2].score) / scores[scores.length - 2].score) * 100 : 0;
    
    // Determine timeframe of changes
    const daysDifference = Math.floor(
        (scores[scores.length - 1].timestamp.getTime() - scores[0].timestamp.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDifference <= 7) {
        timeframe = 'weekly';
    } else if (daysDifference <= 30) {
        timeframe = 'monthly';
    } else {
        timeframe = 'long_term';
    }
    
    return {
        significantFluctuation: zScore > RISK_THRESHOLDS.SIGNIFICANT_ZSCORE,
        zScore,
        percentageChange,
        timeframe
    };
}

/**
 * Uses advanced anomaly detection algorithms to identify unusual patterns
 * in the credit data that don't match historical behavior
 */
function detectAnomalies(
    creditData: CreditData, 
    historicalData?: CreditData[]
): AnomalyDetectionResult {
    const anomalyTypes: string[] = [];
    let severityScore = 0;
    
    // Analyze credit utilization changes
    if (detectCreditUtilizationAnomaly(creditData, historicalData)) {
        anomalyTypes.push('credit_utilization_spike');
        severityScore += 3;
    }
    
    // Detect account behavior anomalies
    if (detectAccountBehaviorAnomaly(creditData, historicalData)) {
        anomalyTypes.push('account_behavior_change');
        severityScore += 2;
    }
    
    // Look for new merchant types
    if (detectNewMerchantTypes(creditData, historicalData)) {
        anomalyTypes.push('new_merchant_types');
        severityScore += 1.5;
    }
    
    // Frequency anomalies
    if (detectTransactionFrequencyAnomaly(creditData, historicalData)) {
        anomalyTypes.push('transaction_frequency_change');
        severityScore += 2.5;
    }
    
    // International transactions when none previously
    if (detectNewInternationalActivity(creditData, historicalData)) {
        anomalyTypes.push('new_international_activity');
        sever
