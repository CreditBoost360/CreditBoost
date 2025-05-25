import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimpleProgress from '@/components/Common/SimpleProgress';

/**
 * CreditHero Game Component
 * A gamified experience where users play as a "Credit Hero" working to improve their credit score
 */
const CreditHero = ({ onComplete }) => {
  // Game state
  const [score, setScore] = useState(550);
  const [cash, setCash] = useState(1000);
  const [debt, setDebt] = useState(5000);
  const [month, setMonth] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Game configuration
  const MAX_MONTHS = 24;
  const GOAL_SCORE = 750;
  const MONTHLY_INCOME = 3000;
  const MONTHLY_EXPENSES = 2000;
  
  // Initialize game
  useEffect(() => {
    initializeEvents();
  }, []);
  
  // Check for game completion
  useEffect(() => {
    checkAchievements();
    
    if (score >= GOAL_SCORE) {
      setGameStatus('won');
      setGameOver(true);
    } else if (month > MAX_MONTHS || cash < 0) {
      setGameStatus('lost');
      setGameOver(true);
    }
  }, [score, cash, debt, month]);
  
  // Initialize game events
  const initializeEvents = () => {
    const gameEvents = [
      {
        id: 1,
        title: "Credit Card Offer",
        description: "You received a credit card offer with a $1,000 limit.",
        options: [
          { text: "Accept and use responsibly", effect: { score: +10, cash: 0, debt: +1000 } },
          { text: "Decline the offer", effect: { score: 0, cash: 0, debt: 0 } }
        ]
      },
      {
        id: 2,
        title: "Late Bill Payment",
        description: "You forgot to pay your utility bill on time.",
        options: [
          { text: "Pay it now with late fee", effect: { score: -15, cash: -150, debt: 0 } },
          { text: "Wait until next month", effect: { score: -30, cash: 0, debt: +100 } }
        ]
      },
      {
        id: 3,
        title: "Debt Consolidation",
        description: "You have an opportunity to consolidate your high-interest debts.",
        options: [
          { text: "Consolidate debts", effect: { score: +20, cash: -200, debt: -500 } },
          { text: "Keep current payment plan", effect: { score: 0, cash: 0, debt: 0 } }
        ]
      },
      {
        id: 4,
        title: "Credit Limit Increase",
        description: "Your bank offers to increase your credit limit.",
        options: [
          { text: "Accept the increase", effect: { score: +5, cash: 0, debt: 0 } },
          { text: "Decline the increase", effect: { score: 0, cash: 0, debt: 0 } }
        ]
      },
      {
        id: 5,
        title: "Unexpected Medical Bill",
        description: "You received an unexpected medical bill for $800.",
        options: [
          { text: "Pay in full", effect: { score: 0, cash: -800, debt: 0 } },
          { text: "Pay minimum and finance", effect: { score: -5, cash: -200, debt: +600 } }
        ]
      },
      {
        id: 6,
        title: "Credit Report Error",
        description: "You found an error on your credit report.",
        options: [
          { text: "Dispute the error", effect: { score: +25, cash: 0, debt: 0 } },
          { text: "Ignore it for now", effect: { score: 0, cash: 0, debt: 0 } }
        ]
      },
      {
        id: 7,
        title: "Shopping Spree",
        description: "You're tempted to go on a shopping spree.",
        options: [
          { text: "Resist and stick to budget", effect: { score: +10, cash: +100, debt: 0 } },
          { text: "Splurge on credit card", effect: { score: -10, cash: 0, debt: +500 } }
        ]
      },
      {
        id: 8,
        title: "Bonus at Work",
        description: "You received a $1,000 bonus at work!",
        options: [
          { text: "Pay down debt", effect: { score: +15, cash: 0, debt: -1000 } },
          { text: "Save for emergency fund", effect: { score: +5, cash: +1000, debt: 0 } }
        ]
      },
      {
        id: 9,
        title: "Credit Monitoring Service",
        description: "You can subscribe to a credit monitoring service for $15/month.",
        options: [
          { text: "Subscribe", effect: { score: +5, cash: -15, debt: 0 } },
          { text: "Skip it", effect: { score: 0, cash: 0, debt: 0 } }
        ]
      },
      {
        id: 10,
        title: "Old Collection Account",
        description: "You discovered an old collection account on your credit report.",
        options: [
          { text: "Pay to settle", effect: { score: +30, cash: -400, debt: -600 } },
          { text: "Ignore it", effect: { score: -10, cash: 0, debt: 0 } }
        ]
      }
    ];
    
    setEvents(gameEvents);
  };
  
  // Check for achievements
  const checkAchievements = () => {
    const newAchievements = [];
    
    if (score >= 600 && !achievements.some(a => a.id === 'score600')) {
      newAchievements.push({
        id: 'score600',
        title: 'Fair Credit Achieved',
        description: 'Reached a credit score of 600'
      });
    }
    
    if (score >= 700 && !achievements.some(a => a.id === 'score700')) {
      newAchievements.push({
        id: 'score700',
        title: 'Good Credit Achieved',
        description: 'Reached a credit score of 700'
      });
    }
    
    if (debt <= 2500 && !achievements.some(a => a.id === 'halfDebt')) {
      newAchievements.push({
        id: 'halfDebt',
        title: 'Debt Crusher',
        description: 'Reduced debt by 50%'
      });
    }
    
    if (debt === 0 && !achievements.some(a => a.id === 'noDebt')) {
      newAchievements.push({
        id: 'noDebt',
        title: 'Debt Free!',
        description: 'Paid off all your debt'
      });
    }
    
    if (cash >= 5000 && !achievements.some(a => a.id === 'savings')) {
      newAchievements.push({
        id: 'savings',
        title: 'Super Saver',
        description: 'Accumulated $5,000 in savings'
      });
    }
    
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
    }
  };
  
  // Generate a random event
  const generateEvent = () => {
    if (events.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];
  };
  
  // Handle advancing to next month
  const advanceMonth = () => {
    // Process monthly income and expenses
    const newCash = cash + MONTHLY_INCOME - MONTHLY_EXPENSES;
    setCash(newCash);
    
    // Process debt payments (minimum payment)
    const minimumPayment = Math.min(debt * 0.03, cash);
    if (debt > 0) {
      setDebt(Math.max(0, debt - minimumPayment));
      setCash(newCash - minimumPayment);
    }
    
    // Credit score improvement for on-time payments
    if (newCash >= 0) {
      setScore(Math.min(850, score + 5));
    } else {
      setScore(Math.max(300, score - 20));
    }
    
    // Advance month and generate new event
    setMonth(month + 1);
    setCurrentEvent(generateEvent());
  };
  
  // Handle event option selection
  const handleOptionSelect = (effect) => {
    setScore(Math.max(300, Math.min(850, score + effect.score)));
    setCash(cash + effect.cash);
    setDebt(Math.max(0, debt + effect.debt));
    setCurrentEvent(null);
  };
  
  // Get credit score rating
  const getCreditRating = (score) => {
    if (score >= 800) return { text: "Excellent", color: "bg-green-500" };
    if (score >= 740) return { text: "Very Good", color: "bg-green-400" };
    if (score >= 670) return { text: "Good", color: "bg-green-300" };
    if (score >= 580) return { text: "Fair", color: "bg-yellow-400" };
    return { text: "Poor", color: "bg-red-500" };
  };
  
  // Restart game
  const restartGame = () => {
    setScore(550);
    setCash(1000);
    setDebt(5000);
    setMonth(1);
    setGameOver(false);
    setEvents([]);
    setCurrentEvent(null);
    setAchievements([]);
    setGameStatus('playing');
    initializeEvents();
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, ((score - 550) / (GOAL_SCORE - 550)) * 100);
  
  return (
    <div className="space-y-6">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Welcome to Credit Hero!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You're on a mission to improve your credit score from 550 to 750 in 24 months or less.</p>
              
              <div className="space-y-2">
                <h3 className="font-semibold">How to Play:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Each month you'll earn income and pay expenses</li>
                  <li>You'll face random financial events that require decisions</li>
                  <li>Your choices affect your credit score, cash, and debt</li>
                  <li>Pay down debt and make good financial choices to win</li>
                  <li>If you run out of cash or don't reach 750 in 24 months, you lose</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold text-blue-800">Credit Score Tips:</h3>
                <ul className="list-disc pl-5 space-y-1 text-blue-700">
                  <li>Pay bills on time</li>
                  <li>Keep credit utilization low</li>
                  <li>Reduce debt</li>
                  <li>Don't apply for too much new credit</li>
                  <li>Monitor your credit report for errors</li>
                </ul>
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
          <h2 className="text-2xl font-bold">Credit Hero</h2>
          <p className="text-muted-foreground">Improve your credit score through smart financial decisions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">Month {month} of {MAX_MONTHS}</Badge>
          <Button variant="outline" size="sm" onClick={restartGame}>Restart Game</Button>
        </div>
      </div>
      
      {/* Game Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Credit Score Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credit Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">{score}</div>
              <Badge className={`${getCreditRating(score).color} text-white`}>
                {getCreditRating(score).text}
              </Badge>
            </div>
            <div className="mt-2">
              <SimpleProgress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Goal: {GOAL_SCORE}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Cash Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">${cash.toLocaleString()}</div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Monthly Income: ${MONTHLY_INCOME.toLocaleString()}</span>
              <span>Monthly Expenses: ${MONTHLY_EXPENSES.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Debt Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">${debt.toLocaleString()}</div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Starting Debt: $5,000</span>
              <span>Minimum Payment: ${Math.round(debt * 0.03).toLocaleString()}/mo</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Game Content */}
      <Card className="min-h-[300px]">
        <CardContent className="p-6">
          {gameOver ? (
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${gameStatus === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                {gameStatus === 'won' ? 'Congratulations!' : 'Game Over'}
              </div>
              
              <p className="text-xl">
                {gameStatus === 'won' 
                  ? `You reached a credit score of ${score} in ${month} months!` 
                  : `You didn't reach the target credit score in time.`}
              </p>
              
              <div className="bg-muted p-4 rounded-md max-w-md mx-auto">
                <h3 className="font-semibold mb-2">Final Stats:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Credit Score: <span className="font-medium">{score}</span></div>
                  <div>Rating: <span className="font-medium">{getCreditRating(score).text}</span></div>
                  <div>Cash: <span className="font-medium">${cash.toLocaleString()}</span></div>
                  <div>Debt: <span className="font-medium">${debt.toLocaleString()}</span></div>
                  <div>Months: <span className="font-medium">{month}</span></div>
                  <div>Achievements: <span className="font-medium">{achievements.length}</span></div>
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
                        <div className={option.effect.score >= 0 ? "text-green-500" : "text-red-500"}>
                          Score: {option.effect.score > 0 ? '+' : ''}{option.effect.score}
                        </div>
                        <div className={option.effect.cash >= 0 ? "text-green-500" : "text-red-500"}>
                          Cash: {option.effect.cash > 0 ? '+' : ''}${option.effect.cash}
                        </div>
                        <div className={option.effect.debt <= 0 ? "text-green-500" : "text-red-500"}>
                          Debt: {option.effect.debt > 0 ? '+' : ''}${option.effect.debt}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Month {month}</h3>
                <p className="text-muted-foreground">
                  Time to make your monthly financial decisions.
                </p>
              </div>
              
              <Button size="lg" onClick={advanceMonth}>
                Advance to Next Month
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievements ({achievements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11"></path>
                      <circle cx="12" cy="8" r="7"></circle>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreditHero;