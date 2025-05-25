import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimpleProgress from '@/components/Common/SimpleProgress';

/**
 * Debt Destroyer Game Component
 * A game that teaches debt repayment strategies
 */
const DebtDestroyer = ({ onComplete }) => {
  // Game state
  const [debts, setDebts] = useState([]);
  const [income, setIncome] = useState(4000);
  const [availableFunds, setAvailableFunds] = useState(1000);
  const [month, setMonth] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing');
  const [strategy, setStrategy] = useState('avalanche'); // 'avalanche', 'snowball', 'custom'
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);
  const [totalPrincipalPaid, setTotalPrincipalPaid] = useState(0);
  
  // Game configuration
  const MAX_MONTHS = 36;
  const MONTHLY_EXPENSES = 2500;
  
  // Initialize game
  useEffect(() => {
    initializeDebts();
  }, []);
  
  // Check for game completion
  useEffect(() => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    if (totalDebt <= 0) {
      setGameStatus('won');
      setGameOver(true);
    } else if (month > MAX_MONTHS) {
      setGameStatus('lost');
      setGameOver(true);
    }
  }, [debts, month]);
  
  // Initialize debts
  const initializeDebts = () => {
    const initialDebts = [
      {
        id: 1,
        name: 'Credit Card 1',
        balance: 5000,
        interestRate: 18.99,
        minimumPayment: 150,
        type: 'credit card'
      },
      {
        id: 2,
        name: 'Car Loan',
        balance: 12000,
        interestRate: 6.5,
        minimumPayment: 300,
        type: 'loan'
      },
      {
        id: 3,
        name: 'Student Loan',
        balance: 20000,
        interestRate: 4.5,
        minimumPayment: 250,
        type: 'loan'
      },
      {
        id: 4,
        name: 'Credit Card 2',
        balance: 2500,
        interestRate: 22.99,
        minimumPayment: 75,
        type: 'credit card'
      }
    ];
    
    setDebts(initialDebts);
  };
  
  // Generate a random event
  const generateEvent = () => {
    const events = [
      {
        id: 1,
        title: "Unexpected Bonus",
        description: "You received a $1,000 bonus at work!",
        options: [
          { text: "Apply it all to debt", effect: { funds: 1000, score: 20 } },
          { text: "Save half, apply half to debt", effect: { funds: 500, score: 10 } },
          { text: "Treat yourself", effect: { funds: 0, score: -10 } }
        ]
      },
      {
        id: 2,
        title: "Balance Transfer Offer",
        description: "You received a 0% balance transfer offer for 12 months with a 3% fee.",
        options: [
          { text: "Transfer high-interest debt", effect: { specialAction: 'balanceTransfer', score: 15 } },
          { text: "Ignore the offer", effect: { funds: 0, score: 0 } }
        ]
      },
      {
        id: 3,
        title: "Side Gig Opportunity",
        description: "You have an opportunity to earn extra income with a side gig.",
        options: [
          { text: "Take the side gig", effect: { income: 500, score: 15 } },
          { text: "Decline the opportunity", effect: { funds: 0, score: 0 } }
        ]
      },
      {
        id: 4,
        title: "Unexpected Expense",
        description: "Your car needs repairs that will cost $600.",
        options: [
          { text: "Pay from available funds", effect: { funds: -600, score: 0 } },
          { text: "Put it on credit card", effect: { addDebt: 600, score: -10 } }
        ]
      },
      {
        id: 5,
        title: "Debt Consolidation Offer",
        description: "You're pre-approved for a debt consolidation loan at 8% interest.",
        options: [
          { text: "Consolidate high-interest debts", effect: { specialAction: 'consolidate', score: 10 } },
          { text: "Keep current debt structure", effect: { funds: 0, score: 0 } }
        ]
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];
  };
  
  // Handle event option selection
  const handleOptionSelect = (effect) => {
    if (effect.funds) {
      setAvailableFunds(prev => prev + effect.funds);
    }
    
    if (effect.income) {
      setIncome(prev => prev + effect.income);
    }
    
    if (effect.addDebt) {
      // Add to highest interest credit card
      const creditCards = debts.filter(debt => debt.type === 'credit card');
      if (creditCards.length > 0) {
        const highestInterestCard = creditCards.reduce((prev, current) => 
          (prev.interestRate > current.interestRate) ? prev : current
        );
        
        setDebts(debts.map(debt => {
          if (debt.id === highestInterestCard.id) {
            return {
              ...debt,
              balance: debt.balance + effect.addDebt
            };
          }
          return debt;
        }));
      }
    }
    
    if (effect.specialAction === 'balanceTransfer') {
      handleBalanceTransfer();
    }
    
    if (effect.specialAction === 'consolidate') {
      handleDebtConsolidation();
    }
    
    setScore(score + effect.score);
    setCurrentEvent(null);
  };
  
  // Handle balance transfer
  const handleBalanceTransfer = () => {
    // Find highest interest credit card
    const creditCards = debts.filter(debt => debt.type === 'credit card');
    if (creditCards.length > 0) {
      const highestInterestCard = creditCards.reduce((prev, current) => 
        (prev.interestRate > current.interestRate) ? prev : current
      );
      
      // Create new balance transfer card
      const transferAmount = highestInterestCard.balance;
      const transferFee = transferAmount * 0.03;
      
      const newDebts = [
        ...debts.filter(debt => debt.id !== highestInterestCard.id),
        {
          id: Date.now(),
          name: 'Balance Transfer Card',
          balance: transferAmount + transferFee,
          interestRate: 0, // 0% for 12 months
          minimumPayment: Math.max(25, Math.ceil((transferAmount + transferFee) * 0.02)),
          type: 'credit card',
          promotionalPeriod: 12
        }
      ];
      
      setDebts(newDebts);
    }
  };
  
  // Handle debt consolidation
  const handleDebtConsolidation = () => {
    // Consolidate all high-interest debts (>8%)
    const highInterestDebts = debts.filter(debt => debt.interestRate > 8);
    const lowInterestDebts = debts.filter(debt => debt.interestRate <= 8);
    
    if (highInterestDebts.length > 0) {
      const totalBalance = highInterestDebts.reduce((sum, debt) => sum + debt.balance, 0);
      
      const consolidatedDebt = {
        id: Date.now(),
        name: 'Consolidation Loan',
        balance: totalBalance,
        interestRate: 8,
        minimumPayment: Math.ceil(totalBalance * 0.02),
        type: 'loan'
      };
      
      setDebts([...lowInterestDebts, consolidatedDebt]);
    }
  };
  
  // Handle making a payment
  const handleMakePayment = (debtId, amount) => {
    if (amount > availableFunds) return;
    
    setAvailableFunds(prev => prev - amount);
    
    setDebts(debts.map(debt => {
      if (debt.id === debtId) {
        const newBalance = Math.max(0, debt.balance - amount);
        return {
          ...debt,
          balance: newBalance
        };
      }
      return debt;
    }));
    
    setTotalPrincipalPaid(prev => prev + amount);
    setScore(score + Math.floor(amount / 100)); // Score points for payments
  };
  
  // Handle advancing to next month
  const advanceMonth = () => {
    // Calculate interest and apply minimum payments
    let fundsAfterMinPayments = availableFunds;
    let interestThisMonth = 0;
    let principalThisMonth = 0;
    
    const updatedDebts = debts.map(debt => {
      // Skip if debt is paid off
      if (debt.balance <= 0) return { ...debt, balance: 0 };
      
      // Calculate interest
      const monthlyInterestRate = debt.interestRate / 100 / 12;
      const interestAmount = debt.balance * monthlyInterestRate;
      interestThisMonth += interestAmount;
      
      // Apply minimum payment
      const minimumPayment = Math.min(debt.minimumPayment, debt.balance + interestAmount);
      fundsAfterMinPayments -= minimumPayment;
      
      // Calculate how much goes to principal
      const principalPayment = minimumPayment - interestAmount;
      principalThisMonth += principalPayment;
      
      // Update balance
      const newBalance = Math.max(0, debt.balance + interestAmount - minimumPayment);
      
      // Handle promotional periods
      let updatedDebt = { ...debt, balance: newBalance };
      if (debt.promotionalPeriod) {
        if (debt.promotionalPeriod === 1) {
          // Promotional period ending
          updatedDebt.interestRate = 18.99; // Revert to standard rate
          updatedDebt.promotionalPeriod = undefined;
        } else {
          updatedDebt.promotionalPeriod = debt.promotionalPeriod - 1;
        }
      }
      
      return updatedDebt;
    });
    
    // Apply extra payment based on strategy
    let remainingDebts = updatedDebts.filter(debt => debt.balance > 0);
    if (fundsAfterMinPayments > 0 && remainingDebts.length > 0) {
      let targetDebt;
      
      if (strategy === 'avalanche') {
        // Highest interest rate first
        targetDebt = remainingDebts.reduce((prev, current) => 
          (prev.interestRate > current.interestRate) ? prev : current
        );
      } else if (strategy === 'snowball') {
        // Lowest balance first
        targetDebt = remainingDebts.reduce((prev, current) => 
          (prev.balance < current.balance) ? prev : current
        );
      }
      
      if (targetDebt) {
        const extraPayment = Math.min(fundsAfterMinPayments, targetDebt.balance);
        fundsAfterMinPayments -= extraPayment;
        principalThisMonth += extraPayment;
        
        // Update the target debt's balance
        updatedDebts = updatedDebts.map(debt => {
          if (debt.id === targetDebt.id) {
            return {
              ...debt,
              balance: Math.max(0, debt.balance - extraPayment)
            };
          }
          return debt;
        });
      }
    }
    
    // Add monthly income and subtract expenses
    const newAvailableFunds = fundsAfterMinPayments + income - MONTHLY_EXPENSES;
    
    // Update state
    setDebts(updatedDebts);
    setAvailableFunds(newAvailableFunds);
    setMonth(month + 1);
    setTotalInterestPaid(prev => prev + interestThisMonth);
    setTotalPrincipalPaid(prev => prev + principalThisMonth);
    
    // Generate random event (20% chance)
    if (Math.random() < 0.2) {
      setCurrentEvent(generateEvent());
    }
  };
  
  // Restart game
  const restartGame = () => {
    setDebts([]);
    setIncome(4000);
    setAvailableFunds(1000);
    setMonth(1);
    setScore(0);
    setGameOver(false);
    setGameStatus('playing');
    setStrategy('avalanche');
    setCurrentEvent(null);
    setTotalInterestPaid(0);
    setTotalPrincipalPaid(0);
    initializeDebts();
  };
  
  // Calculate total debt
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const initialTotalDebt = 39500; // Sum of all initial debts
  const progressPercentage = Math.min(100, ((initialTotalDebt - totalDebt) / initialTotalDebt) * 100);
  
  return (
    <div className="space-y-6">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Welcome to Debt Destroyer!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You're on a mission to eliminate $39,500 of debt using strategic repayment methods.</p>
              
              <div className="space-y-2">
                <h3 className="font-semibold">How to Play:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You have multiple debts with different interest rates</li>
                  <li>Each month you'll make minimum payments on all debts</li>
                  <li>Choose a debt repayment strategy to apply extra funds</li>
                  <li>Handle unexpected events that affect your finances</li>
                  <li>Try to eliminate all debt within 36 months</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold text-blue-800">Debt Repayment Strategies:</h3>
                <ul className="list-disc pl-5 space-y-1 text-blue-700">
                  <li><strong>Avalanche Method:</strong> Pay highest interest rate debts first (saves the most money)</li>
                  <li><strong>Snowball Method:</strong> Pay smallest balance debts first (provides psychological wins)</li>
                  <li><strong>Custom Method:</strong> Choose which debts to prioritize yourself</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md">
                <h3 className="font-semibold text-amber-800">What We're Testing:</h3>
                <p className="text-amber-700">This game tests your understanding of debt repayment strategies, interest calculations, and financial decision-making when dealing with multiple debts.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={() => setShowTutorial(false)}>Start Game</Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Game Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Debt Destroyer</h2>
          <p className="text-muted-foreground">Eliminate your debt using strategic repayment methods</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">Month {month} of {MAX_MONTHS}</Badge>
          <Button variant="outline" size="sm" onClick={restartGame}>Restart Game</Button>
        </div>
      </div>
      
      {/* Game Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Funds Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">${availableFunds.toLocaleString()}</div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Monthly Income: ${income.toLocaleString()}</span>
              <span>Monthly Expenses: ${MONTHLY_EXPENSES.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Debt Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">${totalDebt.toLocaleString()}</div>
            <div className="mt-2">
              <SimpleProgress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Initial: ${initialTotalDebt.toLocaleString()}</span>
                <span>{Math.round(progressPercentage)}% Paid Off</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Strategy Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Repayment Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={strategy === 'avalanche' ? 'default' : 'outline'}
                  onClick={() => setStrategy('avalanche')}
                  className="flex-1"
                >
                  Avalanche
                </Button>
                <Button 
                  size="sm" 
                  variant={strategy === 'snowball' ? 'default' : 'outline'}
                  onClick={() => setStrategy('snowball')}
                  className="flex-1"
                >
                  Snowball
                </Button>
                <Button 
                  size="sm" 
                  variant={strategy === 'custom' ? 'default' : 'outline'}
                  onClick={() => setStrategy('custom')}
                  className="flex-1"
                >
                  Custom
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {strategy === 'avalanche' && 'Highest interest rate first (saves the most money)'}
                {strategy === 'snowball' && 'Smallest balance first (provides psychological wins)'}
                {strategy === 'custom' && 'Choose which debts to prioritize yourself'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Game Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Debts Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Your Debts</CardTitle>
            </CardHeader>
            <CardContent>
              {gameOver ? (
                <div className="text-center space-y-4 py-6">
                  <div className={`text-4xl font-bold ${gameStatus === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                    {gameStatus === 'won' ? 'Congratulations!' : 'Game Over'}
                  </div>
                  
                  <p className="text-xl">
                    {gameStatus === 'won' 
                      ? `You eliminated all your debt in ${month} months!` 
                      : `You didn't eliminate all your debt within 36 months.`}
                  </p>
                  
                  <div className="bg-muted p-4 rounded-md max-w-md mx-auto">
                    <h3 className="font-semibold mb-2">Final Stats:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Remaining Debt: <span className="font-medium">${totalDebt.toLocaleString()}</span></div>
                      <div>Total Interest Paid: <span className="font-medium">${Math.round(totalInterestPaid).toLocaleString()}</span></div>
                      <div>Total Principal Paid: <span className="font-medium">${Math.round(totalPrincipalPaid).toLocaleString()}</span></div>
                      <div>Score: <span className="font-medium">{score}</span></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4 pt-4">
                    <Button onClick={restartGame}>Play Again</Button>
                    {gameStatus === 'won' && onComplete && (
                      <Button variant="outline" onClick={onComplete}>Continue</Button>
                    )}
                  </div>
                </div>
              ) : currentEvent ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{currentEvent.title}</h3>
                    <p>{currentEvent.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentEvent.options.map((option, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4" onClick={() => handleOptionSelect(option.effect)}>
                          <h4 className="font-medium mb-2">{option.text}</h4>
                          <div className="text-sm">
                            {option.effect.funds && (
                              <div className={option.effect.funds >= 0 ? "text-green-500" : "text-red-500"}>
                                Funds: {option.effect.funds > 0 ? '+' : ''}${Math.abs(option.effect.funds)}
                              </div>
                            )}
                            {option.effect.income && (
                              <div className="text-green-500">
                                Monthly Income: +${option.effect.income}
                              </div>
                            )}
                            {option.effect.addDebt && (
                              <div className="text-red-500">
                                Add Debt: +${option.effect.addDebt}
                              </div>
                            )}
                            {option.effect.specialAction && (
                              <div className="text-blue-500">
                                Special Action: {option.effect.specialAction === 'balanceTransfer' ? 'Balance Transfer' : 'Debt Consolidation'}
                              </div>
                            )}
                            <div className={option.effect.score >= 0 ? "text-green-500" : "text-red-500"}>
                              Score: {option.effect.score > 0 ? '+' : ''}{option.effect.score}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {debts.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No debts to display. You're debt free!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {debts.map(debt => (
                        <div key={debt.id} className="p-3 border rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="font-medium">{debt.name}</span>
                              {debt.promotionalPeriod && (
                                <Badge className="ml-2 bg-green-100 text-green-800">
                                  0% for {debt.promotionalPeriod} months
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {debt.type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Balance:</span>
                              <span className="font-medium ml-1">${debt.balance.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Interest:</span>
                              <span className="font-medium ml-1">{debt.interestRate}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Min Payment:</span>
                              <span className="font-medium ml-1">${debt.minimumPayment}</span>
                            </div>
                          </div>
                          
                          {strategy === 'custom' && debt.balance > 0 && (
                            <div className="flex justify-end gap-2">
                              {[100, 500, 1000].map(amount => (
                                <Button 
                                  key={amount}
                                  size="sm" 
                                  variant="outline"
                                  disabled={availableFunds < amount}
                                  onClick={() => handleMakePayment(debt.id, amount)}
                                >
                                  Pay ${amount}
                                </Button>
                              ))}
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={availableFunds < debt.balance}
                                onClick={() => handleMakePayment(debt.id, debt.balance)}
                              >
                                Pay Off
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-center mt-6">
                    <Button size="lg" onClick={advanceMonth}>
                      Next Month
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Stats Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Debt Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span>Principal Paid</span>
                  <span>${Math.round(totalPrincipalPaid).toLocaleString()}</span>
                </div>
                <SimpleProgress 
                  value={(totalPrincipalPaid / (totalPrincipalPaid + totalDebt)) * 100} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span>Interest Paid</span>
                  <span>${Math.round(totalInterestPaid).toLocaleString()}</span>
                </div>
                <SimpleProgress 
                  value={(totalInterestPaid / (totalPrincipalPaid + totalInterestPaid)) * 100} 
                  className="h-2 bg-red-100" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span>Score</span>
                  <span>{score}</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Debt Repayment Tip:</h3>
                <p className="text-sm text-muted-foreground">
                  {strategy === 'avalanche' && "The Avalanche method saves you the most money in interest over time."}
                  {strategy === 'snowball' && "The Snowball method gives you quick wins to stay motivated."}
                  {strategy === 'custom' && "A custom approach lets you prioritize debts based on your personal situation."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebtDestroyer;