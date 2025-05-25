import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Activity, CheckCircle } from 'lucide-react';

const DashboardMetrics = ({ creditScore = 750, creditScoreChange = 15, financialHealth = 85, actionItems = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Credit Score</CardTitle>
            <TrendingUp className="text-green-500 h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{creditScore}</div>
          <div className="text-sm text-green-500">↑ {creditScoreChange} points this month</div>
          <Progress value={(creditScore / 850) * 100} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Financial Health</CardTitle>
            <Activity className="text-blue-500 h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{financialHealth}%</div>
          <div className="text-sm">
            {financialHealth >= 80 ? 'Excellent Standing' : 
             financialHealth >= 70 ? 'Very Good Standing' :
             financialHealth >= 60 ? 'Good Standing' :
             financialHealth >= 50 ? 'Fair Standing' : 'Needs Attention'}
          </div>
          <Progress value={financialHealth} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Action Items</CardTitle>
            <CheckCircle className="text-green-500 h-5 w-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{actionItems}</div>
          <div className="text-sm">Quick wins available</div>
          <Button className="mt-2 w-full">View Actions</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;

