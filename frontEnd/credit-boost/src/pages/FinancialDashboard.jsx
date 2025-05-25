import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, BarChart, ArrowUpRight, Download, Filter } from 'lucide-react';
import DataUploadCenter from '@/components/DataUploadCenter';
import FinancialBreakdown from '@/components/FinancialBreakdown';
import CreditSimulator from '@/components/CreditSimulator';
import RecommendationEngine from '@/components/RecommendationEngine';
import CreditScoreOverview from '@/components/CreditScoreOverview';

/**
 * Financial Dashboard Page
 * 
 * A comprehensive dashboard that integrates all the financial components
 */
const FinancialDashboard = () => {
  const { user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [hasUploadedData, setHasUploadedData] = useState(false);
  
  // Check if user has uploaded data
  useEffect(() => {
    const savedFiles = localStorage.getItem('uploadedFinancialData');
    if (savedFiles) {
      const files = JSON.parse(savedFiles);
      const hasFiles = Object.values(files).some(fileArray => fileArray.length > 0);
      setHasUploadedData(hasFiles);
    }
  }, []);
  
  // Handle data upload completion
  const handleDataUploaded = (data) => {
    setHasUploadedData(true);
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-gray-500">
              Your personalized financial insights and recommendations
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Take Action
            </Button>
          </div>
        </div>
        
        {!hasUploadedData ? (
          <div className="mb-6">
            <DataUploadCenter onDataUploaded={handleDataUploaded} />
          </div>
        ) : (
          <>
            {/* Credit Score Overview */}
            <div className="mb-6">
              <CreditScoreOverview 
                score={710} 
                previousScore={695}
                factors={[
                  { name: 'Payment History', status: 'excellent', percentage: 95, impact: 'high' },
                  { name: 'Credit Utilization', status: 'good', percentage: 75, impact: 'high' },
                  { name: 'Credit Age', status: 'fair', percentage: 60, impact: 'medium' },
                  { name: 'Account Mix', status: 'good', percentage: 80, impact: 'low' },
                  { name: 'Recent Inquiries', status: 'excellent', percentage: 90, impact: 'low' }
                ]}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="breakdown">Financial Breakdown</TabsTrigger>
                <TabsTrigger value="simulator">Credit Simulator</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2" />
                        Financial Summary
                      </CardTitle>
                      <CardDescription>
                        Key metrics from your financial data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
                          <div className="text-2xl font-bold mt-1">KES 85,000</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
                          <div className="text-2xl font-bold mt-1">KES 60,000</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Savings Rate</h3>
                          <div className="text-2xl font-bold mt-1 text-green-600">29%</div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h3 className="text-sm font-medium text-gray-500">Debt-to-Income</h3>
                          <div className="text-2xl font-bold mt-1 text-yellow-600">32%</div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Top Spending Categories</h3>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Housing</span>
                              <span>KES 25,000</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Food</span>
                              <span>KES 15,000</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Transportation</span>
                              <span>KES 10,000</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div className="bg-yellow-600 h-1.5 rounded-full" style={{ width: '17%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart className="h-5 w-5 mr-2" />
                        Key Insights
                      </CardTitle>
                      <CardDescription>
                        Actionable insights from your financial data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h3 className="font-medium text-blue-800">Credit Score Improvement</h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Your credit score has improved by 15 points in the last month. Continue making on-time payments to maintain this trend.
                          </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h3 className="font-medium text-yellow-800">Budget Alert</h3>
                          <p className="text-sm text-yellow-700 mt-1">
                            Your entertainment spending is 20% higher than your monthly average. Consider adjusting your budget for next month.
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h3 className="font-medium text-green-800">Savings Opportunity</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Based on your income and expenses, you could increase your monthly savings by KES 5,000 by reducing discretionary spending.
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h3 className="font-medium text-purple-800">Investment Potential</h3>
                          <p className="text-sm text-purple-700 mt-1">
                            With your current savings rate, you could invest KES 10,000 monthly in a balanced fund for long-term growth.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Financial Breakdown Tab */}
              <TabsContent value="breakdown">
                <FinancialBreakdown />
              </TabsContent>
              
              {/* Credit Simulator Tab */}
              <TabsContent value="simulator">
                <CreditSimulator currentScore={710} />
              </TabsContent>
              
              {/* Recommendations Tab */}
              <TabsContent value="recommendations">
                <RecommendationEngine userData={user} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default FinancialDashboard;