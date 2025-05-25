import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';

const ImpactSimulator = ({ currentScore = 750 }) => {
  const [scenario, setScenario] = useState('payment_history');
  const [potentialScore, setPotentialScore] = useState(currentScore);
  const [improvement, setImprovement] = useState(0);
  
  const scenarios = {
    payment_history: {
      description: "Making consistent on-time payments for 3 months",
      impact: 25,
      timeframe: "3-6 months",
      difficulty: "medium"
    },
    credit_utilization: {
      description: "Reducing credit card balances to below 30% of limits",
      impact: 35,
      timeframe: "1-2 months",
      difficulty: "medium"
    },
    credit_mix: {
      description: "Adding a different type of credit account",
      impact: 15,
      timeframe: "6-12 months",
      difficulty: "hard"
    },
    credit_inquiries: {
      description: "Avoiding new credit applications for 6 months",
      impact: 10,
      timeframe: "6 months",
      difficulty: "easy"
    },
    debt_payoff: {
      description: "Paying off a revolving credit account entirely",
      impact: 30,
      timeframe: "immediate",
      difficulty: "hard"
    }
  };

  useEffect(() => {
    // Calculate potential new score based on selected scenario
    const impact = scenarios[scenario]?.impact || 0;
    setPotentialScore(Math.min(850, currentScore + impact));
    setImprovement(impact);
  }, [scenario, currentScore]);

  // Calculate score percentage for progress bar
  const currentPercentage = (currentScore / 850) * 100;
  const potentialPercentage = (potentialScore / 850) * 100;

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Credit Score Impact Simulator</CardTitle>
            <CardDescription>
              See how different actions could affect your credit score
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger><HelpCircle className="h-5 w-5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent side="left">
                <p className="max-w-[250px] text-sm">Estimations based on typical credit score impacts. Individual results may vary based on your specific credit profile.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <Select value={scenario} onValueChange={setScenario}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment_history">Improve Payment History</SelectItem>
              <SelectItem value="credit_utilization">Lower Credit Utilization</SelectItem>
              <SelectItem value="credit_mix">Diversify Credit Mix</SelectItem>
              <SelectItem value="credit_inquiries">Reduce Credit Inquiries</SelectItem>
              <SelectItem value="debt_payoff">Pay Off Revolving Account</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="border rounded-md p-3 bg-muted/20">
            <p className="text-sm mb-2">{scenarios[scenario]?.description}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={getDifficultyColor(scenarios[scenario]?.difficulty)}>
                Difficulty: {scenarios[scenario]?.difficulty}
              </span>
              <span>Timeframe: {scenarios[scenario]?.timeframe}</span>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between mb-2">
              <span>Current Score</span>
              <span>{currentScore}</span>
            </div>
            <Progress value={currentPercentage} className="h-2.5 mb-4" />
            
            <div className="flex justify-between mb-2">
              <span>Potential Score</span>
              <span className="text-green-500 font-medium">{potentialScore} (+{improvement})</span>
            </div>
            <Progress value={potentialPercentage} className="h-2.5 bg-muted" 
              style={{
                background: `linear-gradient(90deg, var(--primary) 0%, var(--primary) ${currentPercentage}%, rgba(var(--primary), 0.3) ${currentPercentage}%, rgba(var(--primary), 0.3) ${potentialPercentage}%, var(--muted) ${potentialPercentage}%)`
              }}
            />
          </div>

          <div className="text-xs text-muted-foreground mt-2">
            * Estimated impact based on typical credit score changes. Individual results may vary.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactSimulator;

