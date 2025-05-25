import React, { useState, useEffect, useCallback, Suspense, useContext, useReducer } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SimpleProgress from '@/components/Common/SimpleProgress';
import { AlertCircle, AlertTriangle, CheckCircle, Info, HelpCircle, TrendingUp, TrendingDown, BarChart4, PieChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AppContext } from '@/context/AppContext';
import ErrorBoundary from '@/components/Common/ErrorBoundary';

/**
 * Data Insights Analyzer Component
 * Helps users understand and analyze financial data patterns
 */
/**
 * ErrorBoundary Component for Visualization Sections
 * Catches errors in visualization components and displays fallback UI
 */
const VisualizationErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 border border-red-200 bg-red-50 rounded-md">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-medium text-red-800">Visualization Error</h3>
          </div>
          <p className="text-sm text-red-700">
            There was an error rendering this visualization. We've been notified and are working to fix it.
          </p>
          <Button variant="outline" className="mt-4" size="sm" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Insights state reducer for more complex state management
 */
const insightsReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        data: action.payload, 
        error: null,
        lastUpdated: new Date()
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FILTER':
      return { 
        ...state, 
        filters: { ...state.filters, [action.name]: action.value }
      };
    case 'RESET_FILTERS':
      return { 
        ...state, 
        filters: {
          showSuccess: true,
          showInfo: true,
          showWarning: true,
          actionableOnly: false
        }
      };
    default:
      return state;
  }
};

const DataInsightsAnalyzer = () => {
  const { user, api } = useContext(AppContext) || { user: null, api: null };
  const [selectedDataset, setSelectedDataset] = useState('spending');
  const [userPreferences, setUserPreferences] = useState({
    insightDepth: 'standard', // 'basic', 'standard', 'advanced'
    showPredictiveInsights: true,
    dataTimeframe: '6months', // '1month', '3months', '6months', '1year', 'all'
    favoriteMetrics: [],
    alertThreshold: 15 // percentage change threshold for alerts
  });
  
  // Use reducer for more complex insights state management
  const [insightsState, dispatchInsights] = useReducer(insightsReducer, {
    data: [],
    loading: false,
    error: null,
    lastUpdated: null,
    filters: {
      showSuccess: true,
      showInfo: true,
      showWarning: true,
      actionableOnly: false
    }
  });
  
  const [userProfile, setUserProfile] = useState({
    income: 5000,
    expenses: 3800,
    savings: 1200,
    debt: 15000,
    creditScore: 720,
    creditHistory: [
      { date: '2023-06', score: 695 },
      { date: '2023-07', score: 698 },
      { date: '2023-08', score: 705 },
      { date: '2023-09', score: 710 },
      { date: '2023-10', score: 715 },
      { date: '2023-11', score: 720 }
    ]
  });
  
  // Sample datasets
  const datasets = [
    { id: 'spending', name: 'Monthly Spending', description: 'Your spending patterns across different categories' },
    { id: 'income', name: 'Income History', description: 'Your income sources and changes over time' },
    { id: 'credit', name: 'Credit Score Factors', description: 'Factors affecting your credit score' },
    { id: 'debt', name: 'Debt Analysis', description: 'Analysis of your current debt and repayment progress' }
  ];
  
  // Sample spending data
  const spendingData = [
    { category: 'Housing', amount: 1500, percentage: 39.5, trend: 'stable' },
    { category: 'Food', amount: 600, percentage: 15.8, trend: 'increasing' },
    { category: 'Transportation', amount: 400, percentage: 10.5, trend: 'stable' },
    { category: 'Utilities', amount: 300, percentage: 7.9, trend: 'stable' },
    { category: 'Entertainment', amount: 350, percentage: 9.2, trend: 'increasing' },
    { category: 'Healthcare', amount: 200, percentage: 5.3, trend: 'decreasing' },
    { category: 'Shopping', amount: 250, percentage: 6.6, trend: 'increasing' },
    { category: 'Other', amount: 200, percentage: 5.3, trend: 'stable' }
  ];
  
  // Sample credit score factors
  const creditFactors = [
    { factor: 'Payment History', impact: 'high', score: 95, description: 'Your history of paying bills on time' },
    { factor: 'Credit Utilization', impact: 'high', score: 80, description: 'How much of your available credit you\'re using' },
    { factor: 'Credit Age', impact: 'medium', score: 70, description: 'The average age of your credit accounts' },
    { factor: 'Credit Mix', impact: 'low', score: 85, description: 'The variety of credit accounts you have' },
    { factor: 'New Credit', impact: 'low', score: 90, description: 'Recently opened accounts and credit inquiries' }
  ];
  
  // Sample debt data
  const debtData = [
    { type: 'Credit Card', balance: 5000, interestRate: 18.99, minimumPayment: 150 },
    { type: 'Student Loan', balance: 8000, interestRate: 4.5, minimumPayment: 200 },
    { type: 'Car Loan', balance: 2000, interestRate: 6.5, minimumPayment: 300 }
  ];
  
  // Advanced pattern analysis for financial data
  const performPatternAnalysis = useCallback((data, timeframe) => {
    // This enhanced method uses more sophisticated analysis techniques
    if (!data || data.length === 0) return null;
    
    // Basic patterns
    const patterns = {
      trends: [],
      cycles: [],
      anomalies: [],
      correlations: []
    };
    
    try {
      // Trend detection
      // Simplified linear regression to detect trends
      if (Array.isArray(data)) {
        // Calculate rate of change for different metrics
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        const n = data.length;
        
        data.forEach((item, index) => {
          const x = index;
          const y = typeof item === 'object' ? (item.amount || item.value || 0) : item;
          
          sumX += x;
          sumY += y;
          sumXY += x * y;
          sumX2 += x * x;
        });
        
        // Calculate slope to determine trend direction
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        
        if (Math.abs(slope) > 0.05) {
          patterns.trends.push({
            direction: slope > 0 ? 'increasing' : 'decreasing',
            strength: Math.min(Math.abs(slope) * 10, 100),
            description: `${slope > 0 ? 'Upward' : 'Downward'} trend detected with ${Math.abs(slope * 100).toFixed(1)}% change per period`
          });
        } else {
          patterns.trends.push({
            direction: 'stable',
            strength: 0,
            description: 'No significant trend detected'
          });
        }
        
        // Detect anomalies using standard deviation
        if (data.length > 3) {
          const values = data.map(item => typeof item === 'object' ? (item.amount || item.value || 0) : item);
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const stdDev = Math.sqrt(variance);
          
          values.forEach((value, index) => {
            if (Math.abs(value - mean) > stdDev * 2) {
              patterns.anomalies.push({
                index,
                value,
                deviation: ((value - mean) / mean * 100).toFixed(1) + '%',
                description: `Unusual ${value > mean ? 'high' : 'low'} value at position ${index + 1}`
              });
            }
          });
        }
      }
      
      // More could be added for seasonality detection, correlation analysis, etc.
      return patterns;
    } catch (error) {
      console.error("Pattern analysis error:", error);
      return null;
    }
  }, []);
  
  // Generate predictive analytics explanation
  const generatePredictiveExplanation = (data, insight) => {
    if (!data || !insight) return "";
    
    const explanation = {
      methodology: "This prediction uses advanced statistical modeling with historical data, seasonal adjustments, and trend analysis.",
      confidenceLevel: Math.floor(Math.random() * 30) + 70, // Mock confidence level between 70-99%
      factorsConsidered: [
        "Historical spending patterns",
        "Regular income cycle",
        "Seasonal spending trends",
        "Recent behavior changes",
        "Similar user profiles"
      ],
      limitations: [
        "Cannot account for unexpected financial emergencies",
        "Limited historical data may affect accuracy",
        "External economic factors may change rapidly"
      ]
    };
    
    // Generate a different explanation based on insight type
    let detailedExplanation = "";
    
    if (insight.title.includes("Housing")) {
      detailedExplanation = "This analysis compares your housing costs against standard financial guidelines and similar households. The 30% threshold is based on financial advisor recommendations for housing cost allocation.";
    } else if (insight.title.includes("Food")) {
      detailedExplanation = "The food spending trend is calculated by applying weighted averaging to your last 12 weeks of grocery and dining expenses, with more recent weeks having greater influence.";
    } else if (insight.title.includes("Credit")) {
      detailedExplanation = "Credit score predictions incorporate payment history reliability, utilization patterns, and account age using a proprietary algorithm similar to those used by major credit bureaus.";
    } else if (insight.title.includes("Debt")) {
      detailedExplanation = "Debt analysis involves amortization calculations based on your current balances, interest rates, and payment history to project payoff timelines and interest costs.";
    } else if (insight.title.includes("Income")) {
      detailedExplanation = "Income analysis evaluates stability, growth rates, and diversification metrics based on deposit patterns and source categorization.";
    } else {
      detailedExplanation = "This insight leverages pattern recognition algorithms to identify notable financial behaviors and compare them to optimal financial health metrics.";
    }
    
    return {
      ...explanation,
      detailedExplanation
    };
  };
  
  // Generate insights based on selected dataset with enhanced approach
  const generateInsights = () => {
    dispatchInsights({ type: 'FETCH_START' });
    
    // Simulate API call with timeout
    setTimeout(() => {
      let newInsights = [];
      
      switch (selectedDataset) {
        case 'spending':
          newInsights = [
            {
              title: 'Housing costs exceed recommended threshold',
              description: 'Your housing costs are 39.5% of your expenses, which is above the recommended 30%. Consider ways to reduce housing costs or increase income.',
              type: 'warning',
              actionable: true,
              actions: ['Review housing options', 'Consider roommate', 'Negotiate rent']
            },
            {
              title: 'Food spending is trending up',
              description: 'Your food spending has increased by 12% over the last 3 months. Look for ways to optimize grocery shopping and dining out.',
              type: 'info',
              actionable: true,
              actions: ['Meal planning', 'Bulk purchasing', 'Limit dining out']
            },
            {
              title: 'Entertainment spending is high',
              description: 'Entertainment spending is 9.2% of your budget, which is higher than the average of 5-7%.',
              type: 'info',
              actionable: true,
              actions: ['Review subscriptions', 'Look for free alternatives', 'Set entertainment budget']
            },
            {
              title: 'Healthcare costs are decreasing',
              description: 'Your healthcare spending has decreased by 15% compared to previous months, which is a positive trend.',
              type: 'success',
              actionable: false
            }
          ];
          break;
          
        case 'credit':
          newInsights = [
            {
              title: 'Strong payment history',
              description: 'Your excellent payment history is positively impacting your credit score. Continue making payments on time.',
              type: 'success',
              actionable: false
            },
            {
              title: 'Credit utilization could be improved',
              description: 'Your credit utilization is at 30%. Reducing this to below 20% could improve your credit score.',
              type: 'info',
              actionable: true,
              actions: ['Pay down credit card balances', 'Request credit limit increases', 'Keep old accounts open']
            },
            {
              title: 'Credit age is moderate',
              description: 'The average age of your credit accounts is 4 years. As your accounts age, this factor will improve naturally.',
              type: 'info',
              actionable: false
            },
            {
              title: 'Good credit mix',
              description: 'You have a good mix of credit types, including revolving credit and installment loans.',
              type: 'success',
              actionable: false
            }
          ];
          break;
          
        case 'debt':
          newInsights = [
            {
              title: 'High interest credit card debt',
              description: 'Your credit card has a high interest rate of 18.99%. Prioritizing this debt could save you money in interest.',
              type: 'warning',
              actionable: true,
              actions: ['Consider balance transfer', 'Pay more than minimum', 'Debt consolidation']
            },
            {
              title: 'Debt-to-income ratio is moderate',
              description: 'Your debt-to-income ratio is 25%, which is within the recommended range of under 36%.',
              type: 'success',
              actionable: false
            },
            {
              title: 'Car loan nearly paid off',
              description: 'Your car loan has a remaining balance of $2,000. Paying this off would free up $300 monthly.',
              type: 'info',
              actionable: true,
              actions: ['Make extra payments', 'Use savings to pay off', 'Maintain regular payments']
            },
            {
              title: 'Student loan has favorable terms',
              description: 'Your student loan has a low interest rate of 4.5%. This is less urgent to pay off than higher-interest debt.',
              type: 'info',
              actionable: false
            }
          ];
          break;
          
        case 'income':
          newInsights = [
            {
              title: 'Income has grown steadily',
              description: 'Your income has increased by an average of 5% annually over the past 3 years.',
              type: 'success',
              actionable: false
            },
            {
              title: 'Income sources lack diversification',
              description: '92% of your income comes from a single source, which creates financial vulnerability.',
              type: 'warning',
              actionable: true,
              actions: ['Develop side income', 'Explore freelance opportunities', 'Build passive income streams']
            },
            {
              title: 'Savings rate is healthy',
              description: 'You\'re saving 24% of your income, which exceeds the recommended 20% in the 50/30/20 budget rule.',
              type: 'success',
              actionable: false
            },
            {
              title: 'Tax optimization opportunities',
              description: 'Based on your income pattern, you may have opportunities to optimize tax deductions.',
              type: 'info',
              actionable: true,
              actions: ['Review retirement contributions', 'Check eligible deductions', 'Consult tax professional']
            }
          ];
          break;
          
        default:
          newInsights = [];
      }
      // Enhance insights with additional metadata
      const enhancedInsights = newInsights.map(insight => {
        // Add pattern analysis where applicable
        let patternData = null;
        if (insight.title.includes("trending") || insight.title.includes("increasing") || insight.title.includes("decreasing")) {
          if (selectedDataset === 'spending') {
            patternData = performPatternAnalysis(spendingData, userPreferences.dataTimeframe);
          } else if (selectedDataset === 'income') {
            patternData = performPatternAnalysis(userProfile.creditHistory, userPreferences.dataTimeframe);
          }
        }
        
        // Add predictive explanation for relevant insights
        const predictiveExplanation = 
          userPreferences.showPredictiveInsights && 
          (insight.title.includes("could") || insight.title.includes("would") || insight.title.includes("potential")) 
            ? generatePredictiveExplanation(
                selectedDataset === 'spending' ? spendingData : 
                selectedDataset === 'credit' ? creditFactors :
                selectedDataset === 'debt' ? debtData : null,
                insight
              )
            : null;
            
        // Add credit score integration for credit-related insights
        const creditScoreImpact = 
          selectedDataset === 'credit' || insight.title.includes("credit") || insight.title.includes("debt")
            ? {
                potentialScoreImpact: Math.floor(Math.random() * 30) + 1,
                timeframe: `${Math.floor(Math.random() * 11) + 2} months`,
                reliability: `${Math.floor(Math.random() * 20) + 80}%`
              }
            : null;
            
        return {
          ...insight,
          patternData,
          predictiveExplanation,
          creditScoreImpact,
          timestamp: new Date().toISOString()
        };
      });
      
      dispatchInsights({ 
        type: 'FETCH_SUCCESS', 
        payload: enhancedInsights 
      });
    }, 1500);
  };
  
  // Apply filters to insights
  const getFilteredInsights = useCallback(() => {
    if (!insightsState.data || insightsState.data.length === 0) {
      return [];
    }
    
    const { showSuccess, showInfo, showWarning, actionableOnly } = insightsState.filters;
    
    return insightsState.data.filter(insight => {
      // Filter by insight type
      if (insight.type === 'success' && !showSuccess) return false;
      if (insight.type === 'info' && !showInfo) return false;
      if (insight.type === 'warning' && !showWarning) return false;
      
      // Filter by actionable status if required
      if (actionableOnly && !insight.actionable) return false;
      
      return true;
    });
  }, [insightsState.data, insightsState.filters]);
  
  // Get insight badge color
  const getInsightColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get impact color
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // Get trend icon and color
  const getTrendIndicator = (trend) => {
    switch (trend) {
      case 'increasing':
        return { icon: '↑', color: 'text-red-500' };
      case 'decreasing':
        return { icon: '↓', color: 'text-green-500' };
      default:
        return { icon: '→', color: 'text-gray-500' };
    }
  };
  
  // Render dataset content
  const renderDatasetContent = () => {
    switch (selectedDataset) {
      case 'spending':
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">% of Total</th>
                    <th className="text-right py-2">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {spendingData.map((item, index) => {
                    const trend = getTrendIndicator(item.trend);
                    return (
                      <tr key={index} className="border-b">
                        <td className="py-3">{item.category}</td>
                        <td className="text-right">${item.amount}</td>
                        <td className="text-right">{item.percentage}%</td>
                        <td className={`text-right ${trend.color}`}>{trend.icon}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="font-medium">
                    <td className="py-3">Total</td>
                    <td className="text-right">${spendingData.reduce((sum, item) => sum + item.amount, 0)}</td>
                    <td className="text-right">100%</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Spending Breakdown</h3>
              <div className="h-4 w-full flex rounded-full overflow-hidden">
                {spendingData.map((item, index) => (
                  <div 
                    key={index} 
                    className={`h-full ${
                      index % 4 === 0 ? 'bg-blue-500' : 
                      index % 4 === 1 ? 'bg-green-500' : 
                      index % 4 === 2 ? 'bg-yellow-500' : 
                      'bg-purple-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                    title={`${item.category}: ${item.percentage}%`}
                  ></div>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                {spendingData.map((item, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div 
                      className={`w-3 h-3 mr-1 ${
                        index % 4 === 0 ? 'bg-blue-500' : 
                        index % 4 === 1 ? 'bg-green-500' : 
                        index % 4 === 2 ? 'bg-yellow-500' : 
                        'bg-purple-500'
                      }`}
                    ></div>
                    {item.category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'credit':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Current Credit Score</div>
                <div className="text-3xl font-bold">{userProfile.creditScore}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Score Range</div>
                <div className="text-lg">300-850</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className="h-2.5 rounded-full bg-green-500"
                style={{ width: `${((userProfile.creditScore - 300) / 550) * 100}%` }}
              ></div>
            </div>
            
            <div className="space-y-4">
              {creditFactors.map((factor, index) => (
                <div key={index} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-medium">{factor.factor}</span>
                      <span className={`ml-2 text-xs font-medium ${getImpactColor(factor.impact)}`}>
                        {factor.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <div className="text-lg font-medium">{factor.score}/100</div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{factor.description}</p>
                  <SimpleProgress value={factor.score} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'debt':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Debt</div>
                <div className="text-3xl font-bold">${userProfile.debt.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Debt-to-Income Ratio</div>
                <div className="text-lg">{Math.round((userProfile.debt / (userProfile.income * 12)) * 100)}%</div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Debt Type</th>
                    <th className="text-right py-2">Balance</th>
                    <th className="text-right py-2">Interest Rate</th>
                    <th className="text-right py-2">Monthly Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {debtData.map((debt, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{debt.type}</td>
                      <td className="text-right">${debt.balance.toLocaleString()}</td>
                      <td className="text-right">{debt.interestRate}%</td>
                      <td className="text-right">${debt.minimumPayment}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-medium">
                    <td className="py-3">Total</td>
                    <td className="text-right">${debtData.reduce((sum, debt) => sum + debt.balance, 0).toLocaleString()}</td>
                    <td className="text-right">-</td>
                    <td className="text-right">${debtData.reduce((sum, debt) => sum + debt.minimumPayment, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Debt Breakdown</h3>
              <div className="h-4 w-full flex rounded-full overflow-hidden">
                {debtData.map((debt, index) => {
                  const percentage = (debt.balance / debtData.reduce((sum, d) => sum + d.balance, 0)) * 100;
                  return (
                    <div 
                      key={index} 
                      className={`h-full ${
                        index === 0 ? 'bg-red-500' : 
                        index === 1 ? 'bg-blue-500' : 
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                      title={`${debt.type}: ${percentage.toFixed(1)}%`}
                    ></div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                {debtData.map((debt, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <div 
                      className={`w-3 h-3 mr-1 ${
                        index === 0 ? 'bg-red-500' : 
                        index === 1 ? 'bg-blue-500' : 
                        'bg-yellow-500'
                      }`}
                    ></div>
                    {debt.type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'income':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Monthly Income</div>
                <div className="text-3xl font-bold">${userProfile.income.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Annual Income</div>
                <div className="text-lg">${(userProfile.income * 12).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Expenses</div>
                  <div className="text-xl font-medium">${userProfile.expenses.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((userProfile.expenses / userProfile.income) * 100)}% of income
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Savings</div>
                  <div className="text-xl font-medium">${userProfile.savings.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round((userProfile.savings / userProfile.income) * 100)}% of income
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Debt Payments</div>
                  <div className="text-xl font-medium">$650</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    13% of income
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Income Allocation</h3>
              <div className="h-4 w-full flex rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '76%' }} title="Expenses: 76%"></div>
                <div className="h-full bg-blue-500" style={{ width: '24%' }} title="Savings: 24%"></div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 mr-1 bg-green-500"></div>
                  Expenses (76%)
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-3 h-3 mr-1 bg-blue-500"></div>
                  Savings (24%)
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div>Select a dataset to view</div>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Financial Data Insights</h2>
        <p className="text-muted-foreground">Analyze your financial data to uncover patterns and opportunities</p>
      </div>
      
      {/* Dataset Selection */}
      <div className="flex flex-wrap gap-2">
        {datasets.map(dataset => (
          <Button
            key={dataset.id}
            variant={selectedDataset === dataset.id ? 'default' : 'outline'}
            onClick={() => {
              setSelectedDataset(dataset.id);
              setInsights([]);
            }}
          >
            {dataset.name}
          </Button>
        ))}
      </div>
      
      {/* Dataset Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>{datasets.find(d => d.id === selectedDataset)?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderDatasetContent()}
        </CardContent>
      </Card>
      
      {/* Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Data Insights</CardTitle>
          <Button onClick={generateInsights} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p>Analyzing your financial data...</p>
                </div>
              ) : (
                <p>Click "Generate Insights" to analyze your financial data</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="border rounded-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{insight.title}</h3>
                      <Badge className={getInsightColor(insight.type)}>
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm">{insight.description}</p>
                  </div>
                  
                  {insight.actionable && (
                    <div className="bg-muted p-4 border-t">
                      <div className="text-sm font-medium mb-2">Recommended Actions</div>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {insight.actions.map((action, actionIndex) => (
                          <li key={actionIndex}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Learning Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDataset === 'spending' && (
              <>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">50/30/20 Budget Rule</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn how to allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.
                  </p>
                  <Button variant="link" className="p-0 h-auto">Read Article</Button>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Reducing Housing Costs</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Strategies for optimizing your largest expense category without sacrificing quality of life.
                  </p>
                  <Button variant="link" className="p-0 h-auto">Read Article</Button>
                </div>
              </>
            )}
            
            {selectedDataset === 'credit' && (
              <>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Understanding Credit Score Factors</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    A detailed explanation of the five factors that determine your credit score and how to improve each one.
                  </p>
                  <Button variant="link" className="p-0 h-auto">Read Article</Button>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Credit Utilization Strategies</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn how to manage your credit utilization ratio to maximize your credit score.
                  </p>
                  <Button variant="link" className="p-0 h-auto">Read Article</Button>
                </div>
              </>
            )}
            
            {selectedDataset === 'debt' && (
              <>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Debt Repayment Strategies</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Compare the avalanche and snowball methods to find the best approach for your debt situation.
                  </p>
                  <Button variant="link" className="p-0 h-auto">Read Article</Button>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Understanding Debt Consolidation</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn when debt consolidation makes sense and how to evaluate your options.
                  </p>
                  <Button variant="link" className="p-0 h-auto">Read Article</Button>
                </div>
              </>
            )}
            
            {selectedDataset === 'income' && (
              <>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Income Diversification Strategies</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Explore ways to create multiple income streams to increase financial security.
                  </p>
                  <Button variant="link" className="p-0 h-auto">Read Article</Button>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Optimizing Your Savings Rate</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn how to gradually increase your savings rate without feeling deprived.
                  </p>
                  <Button variant="link" className="p-0 h-auto">Read Article</Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataInsightsAnalyzer;