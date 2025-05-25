import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimpleProgress from '@/components/Common/SimpleProgress';
import { Input } from "@/components/ui/input";

/**
 * Credit Simulator Component
 * An interactive simulation tool that shows how different financial actions affect credit scores
 */
const CreditSimulator = () => {
  // Simulation state
  const [baseScore, setBaseScore] = useState(650);
  const [simulatedScore, setSimulatedScore] = useState(650);
  const [actions, setActions] = useState([]);
  const [history, setHistory] = useState([]);
  const [customAction, setCustomAction] = useState({ name: '', impact: 0 });
  const [showInfo, setShowInfo] = useState(true);
  
  // Available actions that affect credit score
  const availableActions = [
    { id: 'pay_on_time', name: 'Pay all bills on time for 3 months', impact: 15 },
    { id: 'pay_off_card', name: 'Pay off credit card balance', impact: 25 },
    { id: 'reduce_utilization', name: 'Reduce credit utilization to under 30%', impact: 20 },
    { id: 'increase_limit', name: 'Increase credit limit (without new debt)', impact: 10 },
    { id: 'remove_error', name: 'Remove error from credit report', impact: 40 },
    { id: 'old_account', name: 'Keep old accounts open', impact: 5 },
    { id: 'new_credit', name: 'Apply for new credit', impact: -10 },
    { id: 'miss_payment', name: 'Miss a payment', impact: -40 },
    { id: 'default', name: 'Default on a loan', impact: -100 },
    { id: 'bankruptcy', name: 'File for bankruptcy', impact: -200 },
    { id: 'collection', name: 'Account sent to collections', impact: -75 },
    { id: 'high_utilization', name: 'High credit utilization (over 70%)', impact: -25 },
    { id: 'close_old_account', name: 'Close oldest credit account', impact: -15 },
    { id: 'pay_collection', name: 'Pay off collection account', impact: 30 },
    { id: 'credit_mix', name: 'Improve credit mix (different types of credit)', impact: 15 }
  ];
  
  // Initialize simulation
  useEffect(() => {
    setActions(availableActions);
  }, []);
  
  // Get credit score rating
  const getCreditRating = (score) => {
    if (score >= 800) return { text: "Excellent", color: "bg-green-500" };
    if (score >= 740) return { text: "Very Good", color: "bg-green-400" };
    if (score >= 670) return { text: "Good", color: "bg-green-300" };
    if (score >= 580) return { text: "Fair", color: "bg-yellow-400" };
    return { text: "Poor", color: "bg-red-500" };
  };
  
  // Apply action to simulated score
  const applyAction = (action) => {
    const newScore = Math.max(300, Math.min(850, simulatedScore + action.impact));
    setSimulatedScore(newScore);
    
    setHistory([
      ...history,
      {
        id: Date.now(),
        name: action.name,
        impact: action.impact,
        oldScore: simulatedScore,
        newScore: newScore
      }
    ]);
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setSimulatedScore(baseScore);
    setHistory([]);
  };
  
  // Add custom action
  const addCustomAction = () => {
    if (customAction.name && customAction.impact) {
      const newAction = {
        id: `custom_${Date.now()}`,
        name: customAction.name,
        impact: parseInt(customAction.impact)
      };
      
      setActions([...actions, newAction]);
      setCustomAction({ name: '', impact: 0 });
    }
  };
  
  // Update base score
  const updateBaseScore = (newBaseScore) => {
    const score = Math.max(300, Math.min(850, newBaseScore));
    setBaseScore(score);
    setSimulatedScore(score);
    setHistory([]);
  };
  
  // Calculate score difference
  const scoreDifference = simulatedScore - baseScore;
  
  return (
    <div className="space-y-6">
      {/* Info Panel */}
      {showInfo && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-800">Credit Score Simulator</h3>
                <p className="text-blue-700">
                  See how different financial actions could affect your credit score. This simulator helps you understand
                  the potential impact of various financial decisions.
                </p>
                <p className="text-sm text-blue-600">
                  <strong>Note:</strong> This is a simulation based on general credit scoring principles. 
                  Actual credit score changes may vary based on your specific credit history and the scoring model used.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInfo(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Simulator Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Credit Score Simulator</h2>
          <p className="text-muted-foreground">See how different actions affect your credit score</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Starting Score:</span>
            <Input
              type="number"
              min="300"
              max="850"
              value={baseScore}
              onChange={(e) => updateBaseScore(parseInt(e.target.value))}
              className="w-20 h-8 text-center"
            />
          </div>
          <Button variant="outline" size="sm" onClick={resetSimulation}>Reset</Button>
        </div>
      </div>
      
      {/* Score Display */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">Starting Score</div>
              <div className="text-4xl font-bold">{baseScore}</div>
              <Badge className={`mt-1 ${getCreditRating(baseScore).color} text-white`}>
                {getCreditRating(baseScore).text}
              </Badge>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="w-full max-w-md">
                <SimpleProgress value={(simulatedScore - 300) / 5.5} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>300</span>
                  <span>850</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <div className={`text-sm font-medium ${scoreDifference > 0 ? 'text-green-500' : scoreDifference < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {scoreDifference > 0 ? '+' : ''}{scoreDifference} points
                </div>
                
                {scoreDifference !== 0 && (
                  <div className="text-xs text-muted-foreground">
                    ({scoreDifference > 0 ? '+' : ''}{((scoreDifference / baseScore) * 100).toFixed(1)}%)
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">Simulated Score</div>
              <div className="text-4xl font-bold">{simulatedScore}</div>
              <Badge className={`mt-1 ${getCreditRating(simulatedScore).color} text-white`}>
                {getCreditRating(simulatedScore).text}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Simulator Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {actions.map((action) => (
                  <Card 
                    key={action.id} 
                    className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
                      action.impact > 0 ? 'border-l-green-500' : 'border-l-red-500'
                    }`}
                    onClick={() => applyAction(action)}
                  >
                    <CardContent className="p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{action.name}</p>
                      </div>
                      <Badge className={action.impact > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {action.impact > 0 ? '+' : ''}{action.impact}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Custom Action */}
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3">
                <Input
                  placeholder="Action name"
                  value={customAction.name}
                  onChange={(e) => setCustomAction({ ...customAction, name: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Impact (-200 to +200)"
                  min="-200"
                  max="200"
                  value={customAction.impact || ''}
                  onChange={(e) => setCustomAction({ ...customAction, impact: e.target.value })}
                  className="md:w-40"
                />
                <Button onClick={addCustomAction} disabled={!customAction.name || !customAction.impact}>
                  Add Action
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* History Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Action History</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
                <p>Select actions to see their impact</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.oldScore}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                        <span>{item.newScore}</span>
                      </div>
                    </div>
                    <Badge className={item.impact > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {item.impact > 0 ? '+' : ''}{item.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {history.length > 0 && (
            <CardFooter className="flex justify-end pt-0">
              <Button variant="ghost" size="sm" onClick={resetSimulation}>
                Reset Simulation
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Credit Score Ranges */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Score Ranges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div className="p-3 bg-red-100 rounded-md">
              <div className="font-semibold text-red-800">Poor</div>
              <div className="text-sm text-red-700">300-579</div>
              <div className="text-xs text-red-600 mt-1">High risk, limited options</div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-md">
              <div className="font-semibold text-yellow-800">Fair</div>
              <div className="text-sm text-yellow-700">580-669</div>
              <div className="text-xs text-yellow-600 mt-1">Below average, higher rates</div>
            </div>
            <div className="p-3 bg-green-100 rounded-md">
              <div className="font-semibold text-green-800">Good</div>
              <div className="text-sm text-green-700">670-739</div>
              <div className="text-xs text-green-600 mt-1">Near or slightly above average</div>
            </div>
            <div className="p-3 bg-green-200 rounded-md">
              <div className="font-semibold text-green-800">Very Good</div>
              <div className="text-sm text-green-700">740-799</div>
              <div className="text-xs text-green-600 mt-1">Above average, favorable terms</div>
            </div>
            <div className="p-3 bg-green-300 rounded-md">
              <div className="font-semibold text-green-800">Excellent</div>
              <div className="text-sm text-green-700">800-850</div>
              <div className="text-xs text-green-600 mt-1">Well above average, best rates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditSimulator;