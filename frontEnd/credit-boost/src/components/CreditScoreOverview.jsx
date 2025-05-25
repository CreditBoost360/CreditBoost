import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';

/**
 * Enhanced Credit Score Overview Component
 * 
 * A visually appealing credit score display with rating, change indicators,
 * and factor breakdown
 */
const CreditScoreOverview = ({ 
  score = 710, 
  previousScore = 695,
  maxScore = 850,
  factors = [
    { name: 'Payment History', status: 'excellent', percentage: 95, impact: 'high' },
    { name: 'Credit Utilization', status: 'good', percentage: 75, impact: 'high' },
    { name: 'Credit Age', status: 'fair', percentage: 60, impact: 'medium' },
    { name: 'Account Mix', status: 'good', percentage: 80, impact: 'low' },
    { name: 'Recent Inquiries', status: 'excellent', percentage: 90, impact: 'low' }
  ]
}) => {
  // Calculate score percentage
  const scorePercentage = Math.round((score / maxScore) * 100);
  
  // Calculate score change
  const scoreChange = score - previousScore;
  const scoreChangePercent = Math.round((scoreChange / previousScore) * 100 * 10) / 10;
  
  // Determine score rating
  const getScoreRating = (score) => {
    if (score < 580) return { label: 'Poor', color: 'text-red-600' };
    if (score < 670) return { label: 'Fair', color: 'text-orange-500' };
    if (score < 740) return { label: 'Good', color: 'text-blue-500' };
    if (score < 800) return { label: 'Very Good', color: 'text-green-500' };
    return { label: 'Excellent', color: 'text-green-700' };
  };
  
  const scoreRating = getScoreRating(score);
  
  // Get progress color based on score
  const getProgressColor = (score) => {
    if (score < 580) return 'bg-red-500';
    if (score < 670) return 'bg-orange-500';
    if (score < 740) return 'bg-blue-500';
    if (score < 800) return 'bg-green-500';
    return 'bg-green-700';
  };
  
  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'excellent':
        return { icon: <CheckCircle className="h-4 w-4 text-green-600" />, color: 'text-green-600' };
      case 'good':
        return { icon: <CheckCircle className="h-4 w-4 text-blue-500" />, color: 'text-blue-500' };
      case 'fair':
        return { icon: <Clock className="h-4 w-4 text-orange-500" />, color: 'text-orange-500' };
      case 'poor':
        return { icon: <AlertCircle className="h-4 w-4 text-red-500" />, color: 'text-red-500' };
      default:
        return { icon: <Clock className="h-4 w-4 text-gray-500" />, color: 'text-gray-500' };
    }
  };
  
  // Get impact badge style
  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Score Display Section */}
          <div className="p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r">
            <div className="text-sm font-medium text-gray-500 mb-2">Your Credit Score</div>
            <div className="text-5xl font-bold mb-2">{score}</div>
            <div className={`text-lg font-medium ${scoreRating.color} mb-3`}>
              {scoreRating.label}
            </div>
            
            <div className="w-full mb-2">
              <Progress 
                value={scorePercentage} 
                className="h-2"
                style={{ backgroundColor: '#e5e7eb' }}
              >
                <div 
                  className="h-full transition-all" 
                  style={{ 
                    width: `${scorePercentage}%`,
                    backgroundColor: getProgressColor(score)
                  }}
                />
              </Progress>
            </div>
            
            <div className="flex justify-between w-full text-xs text-gray-500">
              <span>300</span>
              <span>{maxScore}</span>
            </div>
            
            <div className={`mt-4 flex items-center ${
              scoreChange > 0 ? 'text-green-600' : scoreChange < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {scoreChange > 0 ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : scoreChange < 0 ? (
                <ArrowDown className="h-4 w-4 mr-1" />
              ) : null}
              <span className="font-medium">
                {scoreChange > 0 ? '+' : ''}{scoreChange} points ({scoreChangePercent > 0 ? '+' : ''}{scoreChangePercent}%)
              </span>
            </div>
            
            <div className="text-xs text-gray-500 mt-1">
              Since last month
            </div>
          </div>
          
          {/* Factors Section */}
          <div className="p-6 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Key Factors Affecting Your Score</h3>
            
            <div className="space-y-4">
              {factors.map((factor, index) => {
                const statusInfo = getStatusInfo(factor.status);
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {statusInfo.icon}
                        <span className="ml-2 font-medium">{factor.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${statusInfo.color} font-medium capitalize`}>
                          {factor.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getImpactBadge(factor.impact)}`}>
                          {factor.impact} impact
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${factor.percentage}%`,
                          backgroundColor: 
                            factor.status === 'excellent' ? '#10b981' : 
                            factor.status === 'good' ? '#3b82f6' : 
                            factor.status === 'fair' ? '#f59e0b' : 
                            '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p className="mb-1">
                <strong>Tip:</strong> Focus on improving factors with high impact to see the biggest score improvements.
              </p>
              <p>
                Next update expected on {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditScoreOverview;