import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import SimpleProgress from '@/components/Common/SimpleProgress';

/**
 * BudgetMaster Game Component
 * A gamified experience to teach budget management and financial decision making
 */
const BudgetMaster = ({ onComplete }) => {
  // Game state
  const [budget, setBudget] = useState({
    income: 4000,
    savings: 0,
    expenses: {
      housing: 1200,
      food: 500,
      transportation: 300,
      utilities: 200,
      entertainment: 150,
      healthcare: 100,
      misc: 100,
    },
    available: 1450, // Calculated from income - sum(expenses)
  });
  
  const [month, setMonth] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing');
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [savingsGoal, setSavingsGoal] = useState(10000);
  const [decisions, setDecisions] = useState([]);
  const [history, setHistory] = useState([]);
  
  // Game configuration
  const MAX_MONTHS = 12;

  // Initialize game
  useEffect(() => {
    calculateAvailable();
  }, [budget.income, budget.expenses]);
  
  // Check for game completion
  useEffect(() => {
    if (budget.savings >= savingsGoal) {
      setGameStatus('won');
      setGameOver(true);
    } else if (month > MAX_MONTHS) {
      setGameStatus(budget.savings >= savingsGoal * 0.7 ? 'partial' : 'lost');
      setGameOver(true);
    }
  }, [budget.savings, month, savingsGoal]);
  
  // Calculate available funds
  const calculateAvailable = () => {
    const totalExpenses = Object.values(budget.expenses).reduce((sum, item) => sum + item, 0);
    const available = budget.income - totalExpenses;
    
    setBudget(prev => ({
      ...prev,
      available,
    }));
  };
  
  // Handle expense changes
  const handleExpenseChange = (category, amount) => {
    const newAmount = Math.max(0, amount);
    
    setBudget(prev => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [category]: newAmount,
      },
    }));
  };
  
  // Handle saving money
  const handleSaveAmount = (amount) => {
    if (amount > budget.available) return;
    
    setBudget(prev => ({
      ...prev,
      savings: prev.savings + amount,
      available: prev.available - amount,
    }));
    
    setScore(score + Math.floor(amount / 100)); // Add score points
  };
  
  // Generate a random event
  const generateEvent = () => {
    const events = [
      {
        id: 1,
        title: "Unexpected Medical Expense",
        description: "You have an unexpected medical bill of $400.",
        options: [
          { text: "Pay from current budget", effect: { type: 'expense', amount: 400, category: 'healthcare' } },
          { text: "Use savings", effect: { type: 'savings', amount: -400 } },
          { text: "Skip treatment", effect: { type: 'happiness', amount: -10 } }
        ]
      },
      {
        id: 2,
        title: "Overtime Opportunity",
        description: "You have an opportunity to work overtime this month.",
        options: [
          { text: "Accept the opportunity", effect: { type: 'income', amount: 500 } },
          { text: "Decline - prefer work/life balance", effect: { type: 'happiness', amount: 5 } }
        ]
      },
      {
        id: 3,
        title: "Entertainment Sale",
        description: "There's a sale on entertainment subscriptions.",
        options: [
          { text: "Sign up for a new subscription", effect: { type: 'expense', amount: 15, category: 'entertainment' } },
          { text: "Skip it and save", effect: { type: 'score', amount: 5 } }
        ]
      },
      {
        id: 4,
        title: "Friend's Birthday Dinner",
        description: "Your friend's birthday dinner will cost $75.",
        options: [
          { text: "Attend the dinner", effect: { type: 'expense', amount: 75, category: 'entertainment' } },
          { text: "Skip the dinner", effect: { type: 'happiness', amount: -5 } }
        ]
      },
      {
        id: 5,
        title: "Home Repair",
        description: "Your home needs a repair that will cost $350.",
        options: [
          { text: "Fix it now", effect: { type: 'expense', amount: 350, category: 'housing' } },
          { text: "Delay the repair", effect: { type: 'future_expense', amount: 700, category: 'housing', delay: 2 } }
        ]
      },
      {
        id: 6,
        title: "Utility Bill Increase",
        description: "Your utility bills have increased by $50.",
        options: [
          { text: "Accept the increase", effect: { type: 'expense', amount: 50, category: 'utilities' } },
          { text: "Find ways to reduce usage", effect: { type: 'conservation', score: 10 } }
        ]
      },
      {
        id: 7,
        title: "Grocery Shopping",
        description: "You can save money on groceries by meal planning.",
        options: [
          { text: "Spend time meal planning", effect: { type: 'expense', amount: -50, category: 'food' } },
          { text: "Continue as usual", effect: { type: 'no_effect' } }
        ]
      },
      {
        id: 8,
        title: "Transportation Decision",
        description: "Your car needs expensive maintenance. Public transit is an option.",
        options: [
          { text: "Pay for car maintenance", effect: { type: 'expense', amount: 250, category: 'transportation' } },
          { text: "Switch to public transit", effect: { type: 'expense', amount: -150, category: 'transportation', recurring: true } }
        ]
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];
  };
  
  // Handle event option selection
  const handleOptionSelect = (effect) => {
    let scoreDelta = 0;
    let futureEvent = null;
    
    switch (effect.type) {
      case 'income':
        setBudget(prev => ({
          ...prev,
          income: prev.income + effect.amount,
          available: prev.available + effect.amount
        }));
        scoreDelta = Math.floor(effect.amount / 100);
        break;
        
      case 'expense':
        if (effect.recurring) {
          // Permanent expense change
          setBudget(prev => ({
            ...prev,
            expenses: {
              ...prev.expenses,
              [effect.category]: prev.expenses[effect.category] + effect.amount
            }
          }));
        } else {
          // One-time expense
          setBudget(prev => ({
            ...prev,
            available: prev.available - effect.amount
          }));
        }
        scoreDelta = effect.amount < 0 ? Math.abs(Math.floor(effect.amount / 100)) : -Math.floor(effect.amount / 100);
        break;
        
      case 'savings':
        setBudget(prev => ({
          ...prev,
          savings: Math.max(0, prev.savings + effect.amount)
        }));
        scoreDelta = effect.amount > 0 ? Math.floor(effect.amount / 100) : -Math.floor(Math.abs(effect.amount) / 200);
        break;
        
      case 'happiness':
        scoreDelta = effect.amount;
        break;
        
      case 'score':
        scoreDelta = effect.amount;
        break;
        
      case 'conservation':
        setBudget(prev => ({
          ...prev,
          expenses: {
            ...prev.expenses,
            utilities: Math.max(0, prev.expenses.utilities - 30)
          }
        }));
        scoreDelta = effect.score;
        break;
        
      case 'future_expense':
        futureEvent = {
          month: month + effect.delay,
          type: 'expense',
          amount: effect.amount,
          category: effect.category,
          description: `Delayed ${effect.category} expense came due`
        };
        setDecisions(prev => [...prev, futureEvent]);
        break;
        
      default:
        // No effect
        break;
    }
    
    setScore(prev => prev + scoreDelta);
    setCurrentEvent(null);
  };
  
  // Handle advancing to next month
  const advanceMonth = () => {
    // Record current state
    const monthlyBalance = budget.income - Object.values(budget.expenses).reduce((sum, item) => sum + item, 0);
    
    // Add to history
    setHistory(prev => [
      ...prev,
      {
        month,
        income: budget.income,
        expenses: Object.values(budget.expenses).reduce((sum, item) => sum + item, 0),
        savings: budget.savings,
        balance: monthlyBalance
      }
    ]);
    
    // Apply any future events that are due this month
    const currentDecisions = decisions.filter(d => d.month === month + 1);
    const remainingDecisions = decisions.filter(d => d.month !== month + 1);
    
    setDecisions(remainingDecisions);
    
    // Apply effects of current decisions
    currentDecisions.forEach(decision => {
      if (decision.type === 'expense') {
        // Apply one-time expense
        setBudget(prev => ({
          ...prev,
          available: prev.available - decision.amount
        }));
      }
    });
    
    // Move available funds to savings (simplified for game)
    setBudget(prev => ({
      ...prev,
      savings: prev.savings + prev.available,
      available: prev.income - Object.values(prev.expenses).reduce((sum, item) => sum + item, 0)
    }));
    
    // Advance month and generate new event
    setMonth(prev => prev + 1);
    
    // Generate random event (70% chance)
    if (Math.random() < 0.7) {
      setCurrentEvent(generateEvent());
    }
  };
  
  // Restart game
  const restartGame = () => {
    setBudget({
      income: 4000,
      savings: 0,
      expenses: {
        housing: 1200,
        food: 500,
        transportation: 300,
        utilities: 200,
        entertainment: 150,
        healthcare: 100,
        misc: 100,
      },
      available: 1450,
    });
    setMonth(1);
    setScore(0);
    setGameOver(false);
    setGameStatus('playing');
    setCurrentEvent(null);
    setDecisions([]);
    setHistory([]);
  };
  
  // Category display names
  const categoryNames = {
    housing: 'Housing',
    food: 'Food & Groceries',
    transportation: 'Transportation',
    utilities: 'Utilities',
    entertainment: 'Entertainment',
    healthcare: 'Healthcare',
    misc: 'Miscellaneous'
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, (budget.savings / savingsGoal) * 100);
  
  // Calculate score based on savings and budget management
  const calculateFinalScore = () => {
    let finalScore = score;
    
    // Add bonus points for reaching savings goal
    if (budget.savings >= savingsGoal) {
      finalScore += 50;
    } else if (budget.savings >= savingsGoal * 0.7) {
      finalScore += 25;
    }
    
    // Add bonus for efficiency (spending less than income)
    const averageExpenses = history.reduce((sum, item) => sum + item.expenses, 0) / history.length;
    if (averageExpenses < budget.income * 0.7) {
      finalScore += 25;
    }
    
    return finalScore;
  };
  
  return (
    <div className="space-y-6">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Welcome to Budget Master!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>In this game, you'll manage your monthly budget to reach a savings goal of ${savingsGoal.toLocaleString()} in 12 months.</p>
              
              <div className="space-y-2">
                <h3 className="font-semibold">How to Play:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Manage your monthly income and expenses</li>
                  <li>Adjust your spending in different categories</li>
                  <li>Save money to reach your financial goal</li>
                  <li>Make choices when unexpected events occur</li>
                  <li>Balance your financial health with life satisfaction</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md">
                <h3 className="font-semibold text-amber-800">What We're Testing:</h3>
                <p className="text-amber-700">This game tests your ability to prioritize expenses, make trade-offs between spending and saving, and handle unexpected financial events - all key skills for successful budgeting in real life.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold text-blue-800">Budgeting Tip:</h3>
                <p className="text-blue-700">The 50/30/20 rule is a budgeting strategy that suggests allocating 50% of income to needs, 30% to wants, and 20% to

            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{score}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Higher scores indicate better budgeting skills
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Game Content */}
      <Card>
        <CardContent className="p-6">
          {gameOver ? (
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${gameStatus === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                {gameStatus === 'won' ? 'Congratulations!' : 'Game Over'}
              </div>
              
              <p className="text-xl">
                {gameStatus === 'won' 
                  ? `You reached your savings goal of $${GOAL_SAVINGS.toLocaleString()}!` 
                  : `You didn't reach your savings goal in time.`}
              </p>
              
              <div className="bg-muted p-4 rounded-md max-w-md mx-auto">
                <h3 className="font-semibold mb-2">Final Stats:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Final Budget: <span className="font-medium">${budget.toLocaleString()}</span></div>
                  <div>Savings: <span className="font-medium">${savings.toLocaleString()}</span></div>
                  <div>Score: <span className="font-medium">{score}</span></div>
                  <div>Months: <span className="font-medium">{month}</span></div>
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
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className={option.effect.budget >= 0 ? "text-green-500" : "text-red-500"}>
                          Budget: {option.effect.budget > 0 ? '+' : ''}${Math.abs(option.effect.budget)}
                        </div>
                        <div className={option.effect.savings >= 0 ? "text-green-500" : "text-red-500"}>
                          Savings: {option.effect.savings > 0 ? '+' : ''}${Math.abs(option.effect.savings)}
                        </div>
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
              <div className="grid grid-cols-1 gap-3">
                <h3 className="font-medium text-sm text-muted-foreground">Essential Expenses</h3>
                {expenses.filter(e => e.essential).map(expense => (
                  <div key={expense.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <span className="font-medium">{expense.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({expense.category})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">${expense.amount}</span>
                      <Button 
                        size="sm" 
                        variant={expense.paid ? "ghost" : "default"}
                        disabled={expense.paid || budget < expense.amount}
                        onClick={() => handlePayExpense(expense.id)}
                      >
                        {expense.paid ? "Paid" : "Pay"}
                      </Button>
                    </div>
                  </div>
                ))}
                
                <h3 className="font-medium text-sm text-muted-foreground mt-4">Non-Essential Expenses</h3>
                {expenses.filter(e => !e.essential).map(expense => (
                  <div key={expense.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <span className="font-medium">{expense.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({expense.category})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">${expense.amount}</span>
                      <Button 
                        size="sm" 
                        variant={expense.paid ? "ghost" : "outline"}
                        disabled={expense.paid || budget < expense.amount}
                        onClick={() => handlePayExpense(expense.id)}
                      >
                        {expense.paid ? "Paid" : "Pay"}
                      </Button>
                    </div>
                  </div>
                ))}
                
                <h3 className="font-medium text-sm text-muted-foreground mt-4">Savings</h3>
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <span className="font-medium">Add to Savings</span>
                  <div className="flex items-center gap-2">
                    {[100, 500, 1000].map(amount => (
                      <Button 
                        key={amount}
                        size="sm" 
                        variant="outline"
                        disabled={budget < amount}
                        onClick={() => handleSave(amount)}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button 
                    size="lg" 
                    onClick={advanceMonth}
                    disabled={expenses.some(e => e.essential && !e.paid)}
                  >
                    Next Month
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetMaster;