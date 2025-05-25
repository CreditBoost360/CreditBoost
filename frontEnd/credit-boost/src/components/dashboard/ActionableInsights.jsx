import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

const ActionableInsights = ({ insights = defaultInsights }) => {
  // Gets the appropriate icon based on action type
  const getActionIcon = (type) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'achievement':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };
  
  // Gets appropriate background color based on action type
  const getActionBackground = (type) => {
    switch (type) {
      case 'improvement':
        return 'bg-green-50';
      case 'warning':
        return 'bg-amber-50';
      case 'achievement':
        return 'bg-blue-50';
      case 'pending':
        return 'bg-slate-50';
      default:
        return 'bg-green-50';
    }
  };
  
  // Gets impact badge color
  const getImpactColor = (impact) => {
    const value = parseInt(impact);
    if (value >= 30) return 'bg-green-100 text-green-800 border-green-200';
    if (value >= 15) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recommended Actions</CardTitle>
          <Badge variant="outline" className="ml-2">
            {insights.filter(i => !i.completed).length} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                insight.completed ? 'bg-slate-50 opacity-70' : getActionBackground(insight.type)
              }`}
            >
              <div className="flex items-center">
                {getActionIcon(insight.type)}
                <div className="ml-3">
                  <h4 className="font-medium">{insight.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {insight.impact && (
                      <Badge variant="outline" className={getImpactColor(insight.impact)}>
                        +{insight.impact} points
                      </Badge>
                    )}
                    {insight.timeframe && (
                      <span className="text-xs text-muted-foreground">
                        Timeframe: {insight.timeframe}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant={insight.completed ? "outline" : "default"}
                disabled={insight.completed}
              >
                {insight.completed ? "Completed" : "Take Action"}
              </Button>
            </div>
          ))}
        </div>
        
        {insights.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No action items available at this time.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Default insights if none provided
const defaultInsights = [
  {
    title: "Make Extra Payment On Credit Card",
    type: "improvement",
    impact: "15",
    timeframe: "Immediate",
    completed: false
  },
  {
    title: "Reduce Credit Utilization Below 30%",
    type: "warning",
    impact: "35",
    timeframe: "1-2 months",
    completed: false
  },
  {
    title: "Set Up Automatic Payments",
    type: "improvement",
    impact: "10",
    timeframe: "Next billing cycle",
    completed: false
  },
  {
    title: "Dispute Incorrect Information",
    type: "pending",
    impact: "20",
    timeframe: "30-45 days",
    completed: false
  },
  {
    title: "Removed Late Payment Record",
    type: "achievement",
    impact: "25",
    timeframe: "",
    completed: true
  }
];

export default ActionableInsights;

