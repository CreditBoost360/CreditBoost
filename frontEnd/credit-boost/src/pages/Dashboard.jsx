import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight, Download, Info } from 'lucide-react';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import ActionableInsights from '@/components/dashboard/ActionableInsights';
import ImpactSimulator from '@/components/dashboard/ImpactSimulator';
import CreditScoreOverview from '@/components/CreditScoreOverview';

const Dashboard = () => {
  const { user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}. Here's your financial overview.
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Take Action
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <DashboardMetrics 
          creditScore={750}
          creditScoreChange={15}
          financialHealth={85}
          actionItems={3}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <CreditScoreOverview 
              score={750}
              previousScore={735}
              factors={[
                { name: 'Payment History', status: 'excellent', percentage: 95, impact: 'high' },
                { name: 'Credit Utilization', status: 'good', percentage: 75, impact: 'high' },
                { name: 'Credit Age', status: 'fair', percentage: 60, impact: 'medium' },
                { name: 'Account Mix', status: 'good', percentage: 80, impact: 'low' },
                { name: 'Recent Inquiries', status: 'excellent', percentage: 90, impact: 'low' }
              ]}
            />
            <ActionableInsights />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ImpactSimulator currentScore={750} />
            
            {/* Financial Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle>Personalized Tips</CardTitle>
                <CardDescription>
                  Recommendations based on your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Optimize Credit Utilization</h4>
                      <p className="text-sm text-muted-foreground">
                        Consider requesting a credit limit increase to improve your utilization ratio.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Automate Loan Payments</h4>
                      <p className="text-sm text-muted-foreground">
                        Setting up automatic payments can prevent missed payments and improve your credit score.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Diversify Your Credit Mix</h4>
                      <p className="text-sm text-muted-foreground">
                        Adding different types of credit can improve your score over time.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;

