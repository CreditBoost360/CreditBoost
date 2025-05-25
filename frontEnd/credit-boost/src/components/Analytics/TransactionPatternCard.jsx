import React from 'react';
import { Calendar, CreditCard, AlertCircle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * TransactionPatternCard component for displaying transaction patterns
 * 
 * @param {Object} props
 * @param {Object} props.pattern - The transaction pattern object
 * @param {Function} props.formatAmount - Function to format currency amounts
 */
const TransactionPatternCard = ({ pattern, formatAmount }) => {
  if (!pattern) return null;

  const getPatternTypeIcon = () => {
    switch (pattern.type) {
      case 'recurring':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'anomaly':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'cluster':
        return <CreditCard className="h-5 w-5 text-indigo-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  // Render different card content based on pattern type
  const renderPatternContent = () => {
    switch (pattern.type) {
      case 'recurring':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{pattern.description}</h3>
                <div className="flex items-center text-sm mt-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {pattern.frequency.charAt(0).toUpperCase() + pattern.frequency.slice(1)} • 
                    {pattern.occurrences} occurrences
                  </span>
                </div>
              </div>
              <Badge className="text-sm">{pattern.category}</Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatAmount(pattern.amount)}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pattern confidence</span>
                <span className="font-medium">{Math.round(pattern.confidence * 100)}%</span>
              </div>
              <Progress value={pattern.confidence * 100} className="h-1.5" />
            </div>
            
            {pattern.nextExpected && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next expected</span>
                <span className="font-medium">{pattern.nextExpected}</span>
              </div>
            )}
          </div>
        );
      
      case 'anomaly':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{pattern.description}</h3>
                <p className="text-sm mt-1 text-muted-foreground">
                  {pattern.details}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                {pattern.date}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatAmount(pattern.amount)}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Anomaly score</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <span className="font-medium">{Math.round(pattern.anomalyScore * 100)}%</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Higher scores indicate greater deviation from normal patterns</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Progress value={pattern.anomalyScore * 100} className="h-1.5 bg-amber-500" />
            </div>
            
            <Button variant="outline" size="sm" className="w-full">
              Investigate
            </Button>
          </div>
        );
      
      case 'cluster':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{pattern.description}</h3>
                <div className="flex items-center text-sm mt-1 text-muted-foreground">
                  <span>
                    {pattern.transactionCount} transactions
                  </span>
                </div>
              </div>
              <Badge className="text-sm">{pattern.category}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Total Amount</div>
                <div className="text-sm font-medium">{formatAmount(pattern.totalAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Average</div>
                <div className="text-sm font-medium">{formatAmount(pattern.averageAmount)}</div>
              </div>
            </div>
            
            {pattern.timeInsight && (
              <div className="text-xs italic text-muted-foreground">
                "{pattern.timeInsight}"
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div>Unknown pattern type: {pattern.type}</div>
        );
    }
  };

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center mb-4">
          <div className="mr-3">
            {getPatternTypeIcon()}
          </div>
          <div className="flex-1">
            {renderPatternContent()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionPatternCard;

