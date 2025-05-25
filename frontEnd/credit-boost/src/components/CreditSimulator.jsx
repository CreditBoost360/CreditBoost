import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';

/**
 * Credit Simulator Component
 * 
 * A tool that forecasts credit score changes based on user behavior
 * and financial decisions
 */
const CreditSimulator = ({ currentScore = 710, maxScore = 850 }) => {
  const [simulatedScore, setSimulatedScore] = useState(currentScore);
  const [activeTab, setActiveTab] = useState('paymentHistory');
  const [simulationParams, setSimulationParams] = useState({
    paymentHistory: {
      missedPayments: 0,
      onTimePayments: 6
    },
    creditUtilization: {
      utilizationRate: 30
    },
    creditAge: {
      closeOldestAccount: false,
      openNewAccount: false
    },
    inquiries: {
      newInquiries: 0
    },
    debtReduction: {
      reductionPercentage: 0
    }
  });
  
  // Calculate score percentage
  const scorePercentage = Math.round((simulatedScore / maxScore) * 100);
  const originalPercentage = Math.round((currentScore / maxScore) * 100);
  
  // Calculate score change
  const scoreChange = simulatedScore - currentScore;
  
  // Determine score rating
  const getScoreRating = (score) => {
    if (score < 580) return { label: 'Poor', color: 'text-red-600' };
    if (score < 670) return { label: 'Fair', color: 'text-orange-500' };
    if (score < 740) return { label: 'Good', color: 'text-blue-500' };
    if (score < 800) return { label: 'Very Good', color: 'text-green-500' };
    return { label: 'Excellent', color: 'text-green-700' };
  };
  
  const scoreRating = getScoreRating(simulatedScore);
  const originalRating = getScoreRating(currentScore);
  
  // Get progress color based on score
  const getProgressColor = (score) => {
    if (score < 580) return 'bg-red-500';
    if (score < 670) return 'bg-orange-500';
    if (score < 740) return 'bg-blue-500';
    if (score < 800) return 'bg-green-500';
    return 'bg-green-700';
  };
  
  // Simulate score changes based on parameters
  useEffect(() => {
    let newScore = currentScore;
    
    // Payment history impact
    newScore -= simulationParams.paymentHistory.missedPayments * 15;
    newScore += Math.min(simulationParams.paymentHistory.onTimePayments * 5, 30);
    
    // Credit utilization impact
    if (simulationParams.creditUtilization.utilizationRate <= 10) {
      newScore += 15;
    } else if (simulationParams.creditUtilization.utilizationRate <= 30) {
      newScore += 5;
    } else if (simulationParams.creditUtilization.utilizationRate >= 50) {
      newScore -= 10;
    } else if (simulationParams.creditUtilization.utilizationRate >= 75) {
      newScore -= 25;
    }
    
    // Credit age impact
    if (simulationParams.creditAge.closeOldestAccount) {
      newScore -= 20;
    }
    if (simulationParams.creditAge.openNewAccount) {
      newScore -= 5;
    }
    
    // Inquiries impact
    newScore -= simulationParams.inquiries.newInquiries * 5;
    
    // Debt reduction impact
    newScore += Math.floor(simulationParams.debtReduction.reductionPercentage / 10) * 5;
    
    // Ensure score stays within bounds
    newScore = Math.max(300, Math.min(maxScore, newScore));
    
    setSimulatedScore(newScore);
  }, [simulationParams, currentScore, maxScore]);
  
  // Handle parameter changes
  const updateParams = (category, param, value) => {
    setSimulationParams(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [param]: value
      }
    }));
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setSimulationParams({
      paymentHistory: {
        missedPayments: 0,
        onTimePayments: 6
      },
      creditUtilization: {
        utilizationRate: 30
      },
      creditAge: {
        closeOldestAccount: false,
        openNewAccount: false
      },
      inquiries: {
        newInquiries: 0
      },
      debtReduction: {
        reductionPercentage: 0
      }
    });
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Credit Score Simulator
        </CardTitle>
        <CardDescription>
          See how different financial decisions could impact your credit score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Current Score */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Current Score</h3>
            <div className="text-3xl font-bold">{currentScore}</div>
            <div className={`text-sm font-medium ${originalRating.color}`}>
              {originalRating.label}
            </div>
            <div className="w-full mt-2">
              <Progress 
                value={originalPercentage} 
                className="h-1.5"
                style={{ backgroundColor: '#e5e7eb' }}
              >
                <div 
                  className="h-full transition-all" 
                  style={{ 
                    width: `${originalPercentage}%`,
                    backgroundColor: getProgressColor(currentScore)
                  }}
                />
              </Progress>
            </div>
          </div>
          
          {/* Simulated Score */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Simulated Score</h3>
            <div className="text-3xl font-bold">{simulatedScore}</div>
            <div className={`text-sm font-medium ${scoreRating.color}`}>
              {scoreRating.label}
            </div>
            <div className="w-full mt-2">
              <Progress 
                value={scorePercentage} 
                className="h-1.5"
                style={{ backgroundColor: '#e5e7eb' }}
              >
                <div 
                  className="h-full transition-all" 
                  style={{ 
                    width: `${scorePercentage}%`,
                    backgroundColor: getProgressColor(simulatedScore)
                  }}
                />
              </Progress>
            </div>
          </div>
          
          {/* Score Change */}
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Potential Impact</h3>
            <div className="flex items-center">
              <div className={`text-3xl font-bold ${
                scoreChange > 0 ? 'text-green-600' : 
                scoreChange < 0 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {scoreChange > 0 ? '+' : ''}{scoreChange}
              </div>
              <div className="ml-2">
                {scoreChange > 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : scoreChange < 0 ? (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                ) : (
                  <Clock className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </div>
            <div className={`text-sm font-medium ${
              scoreChange > 0 ? 'text-green-600' : 
              scoreChange < 0 ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {scoreChange > 0 ? 'Improvement' : 
               scoreChange < 0 ? 'Decline' : 
               'No Change'}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Based on simulated actions
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="paymentHistory">Payment History</TabsTrigger>
            <TabsTrigger value="creditUtilization">Credit Utilization</TabsTrigger>
            <TabsTrigger value="creditAge">Credit Age</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="debtReduction">Debt Reduction</TabsTrigger>
          </TabsList>
          
          {/* Payment History Tab */}
          <TabsContent value="paymentHistory">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Missed Payments (Next 6 Months)</label>
                  <span className="text-sm font-medium">{simulationParams.paymentHistory.missedPayments}</span>
                </div>
                <Slider
                  value={[simulationParams.paymentHistory.missedPayments]}
                  min={0}
                  max={6}
                  step={1}
                  onValueChange={(value) => updateParams('paymentHistory', 'missedPayments', value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 (Best)</span>
                  <span>6 (Worst)</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {simulationParams.paymentHistory.missedPayments === 0 ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Perfect payment history can significantly boost your score</span>
                    </div>
                  ) : simulationParams.paymentHistory.missedPayments >= 3 ? (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Multiple missed payments can severely damage your credit</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Even a single missed payment can impact your score</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">On-Time Payments (Next 6 Months)</label>
                  <span className="text-sm font-medium">{simulationParams.paymentHistory.onTimePayments}</span>
                </div>
                <Slider
                  value={[simulationParams.paymentHistory.onTimePayments]}
                  min={0}
                  max={6}
                  step={1}
                  onValueChange={(value) => updateParams('paymentHistory', 'onTimePayments', value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 (Worst)</span>
                  <span>6 (Best)</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Credit Utilization Tab */}
          <TabsContent value="creditUtilization">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Credit Utilization Rate (%)</label>
                  <span className="text-sm font-medium">{simulationParams.creditUtilization.utilizationRate}%</span>
                </div>
                <Slider
                  value={[simulationParams.creditUtilization.utilizationRate]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => updateParams('creditUtilization', 'utilizationRate', value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0% (Best)</span>
                  <span>100% (Worst)</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {simulationParams.creditUtilization.utilizationRate <= 10 ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Excellent utilization rate under 10%</span>
                    </div>
                  ) : simulationParams.creditUtilization.utilizationRate <= 30 ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Good utilization rate under 30%</span>
                    </div>
                  ) : simulationParams.creditUtilization.utilizationRate <= 50 ? (
                    <div className="flex items-center text-orange-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>High utilization rate may negatively impact your score</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Very high utilization rate can significantly damage your score</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Credit Age Tab */}
          <TabsContent value="creditAge">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Close Oldest Account</h3>
                  <p className="text-xs text-gray-500">
                    Simulate closing your oldest credit account
                  </p>
                </div>
                <Button
                  variant={simulationParams.creditAge.closeOldestAccount ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => updateParams('creditAge', 'closeOldestAccount', !simulationParams.creditAge.closeOldestAccount)}
                >
                  {simulationParams.creditAge.closeOldestAccount ? "Account Closed" : "Keep Account"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Open New Account</h3>
                  <p className="text-xs text-gray-500">
                    Simulate opening a new credit account
                  </p>
                </div>
                <Button
                  variant={simulationParams.creditAge.openNewAccount ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => updateParams('creditAge', 'openNewAccount', !simulationParams.creditAge.openNewAccount)}
                >
                  {simulationParams.creditAge.openNewAccount ? "Account Opened" : "No New Account"}
                </Button>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Credit Age Impact</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Your credit age makes up about 15% of your credit score. Closing your oldest account can significantly reduce your average credit age, while opening new accounts can temporarily lower it.
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Inquiries Tab */}
          <TabsContent value="inquiries">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">New Credit Inquiries (Next 6 Months)</label>
                  <span className="text-sm font-medium">{simulationParams.inquiries.newInquiries}</span>
                </div>
                <Slider
                  value={[simulationParams.inquiries.newInquiries]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => updateParams('inquiries', 'newInquiries', value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 (Best)</span>
                  <span>10 (Worst)</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {simulationParams.inquiries.newInquiries === 0 ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>No new inquiries is ideal for your credit score</span>
                    </div>
                  ) : simulationParams.inquiries.newInquiries <= 2 ? (
                    <div className="flex items-center text-blue-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>A few inquiries have minimal impact on your score</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Multiple inquiries in a short period can significantly impact your score</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">About Credit Inquiries</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Hard inquiries occur when you apply for new credit and typically impact your score for 12 months. Multiple inquiries for the same type of loan within a short period (usually 14-45 days) are typically counted as a single inquiry.
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Debt Reduction Tab */}
          <TabsContent value="debtReduction">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Debt Reduction (%)</label>
                  <span className="text-sm font-medium">{simulationParams.debtReduction.reductionPercentage}%</span>
                </div>
                <Slider
                  value={[simulationParams.debtReduction.reductionPercentage]}
                  min={0}
                  max={100}
                  step={10}
                  onValueChange={(value) => updateParams('debtReduction', 'reductionPercentage', value[0])}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0% (No Change)</span>
                  <span>100% (Debt Free)</span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {simulationParams.debtReduction.reductionPercentage >= 50 ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Significant debt reduction can substantially improve your score</span>
                    </div>
                  ) : simulationParams.debtReduction.reductionPercentage > 0 ? (
                    <div className="flex items-center text-blue-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Any debt reduction helps improve your credit profile</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>No change in debt level</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Debt Reduction Strategy</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Reducing your overall debt, especially credit card debt, can significantly improve your credit score. Focus on paying down high-interest debt first while maintaining minimum payments on all accounts.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 pt-6 border-t flex justify-between">
          <Button variant="outline" onClick={resetSimulation}>
            Reset Simulation
          </Button>
          <Button>
            Save Simulation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditSimulator;