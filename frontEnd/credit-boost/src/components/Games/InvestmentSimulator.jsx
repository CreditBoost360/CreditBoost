import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimpleProgress from '@/components/Common/SimpleProgress';

/**
 * Investment Simulator Game Component
 * A gamified experience to learn about investment allocation, risk, and portfolio management
 */
const InvestmentSimulator = ({ onComplete }) => {
  // Game state
  const [portfolio, setPortfolio] = useState({
    cash: 10000,
    stocks: 0,
    bonds: 0,
    realEstate: 0,
    crypto: 0
  });
  const [allocation, setAllocation] = useState({
    stocks: 0,
    bonds: 0,
    realEstate: 0,
    crypto: 0
  });
  const [assetPerformance, setAssetPerformance] = useState({
    stocks: { growth: 0, volatility: 'medium' },
    bonds: { growth: 0, volatility: 'low' },
    realEstate: { growth: 0, volatility: 'medium' },
    crypto: { growth: 0, volatility: 'high' }
  });
  const [marketCondition, setMarketCondition] = useState('neutral'); // 'bull', 'bear', 'neutral'
  const [year, setYear] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing');
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [history, setHistory] = useState([]);
  const [riskLevel, setRiskLevel] = useState('moderate'); // 'conservative', 'moderate', 'aggressive'
  
  // Game configuration
  const MAX_YEARS = 10;
  const GOAL_AMOUNT = 25000;
  
  // Initialize game
  useEffect(() => {
    setMarketConditions();
  }, []);
  
  // Check for game completion
  useEffect(() => {
    const totalPortfolioValue = calculateTotalPortfolioValue();
    if (totalPortfolioValue >= GOAL_AMOUNT) {
      setGameStatus('won');
      setGameOver(true);
    } else if (year > MAX_YEARS) {
      setGameStatus('lost');
      setGameOver(true);
    }
  }, [portfolio, year]);
  
  // Calculate total portfolio value
  const calculateTotalPortfolioValue = () => {
    return portfolio.cash + 
           portfolio.stocks + 
           portfolio.bonds + 
           portfolio.realEstate + 
           portfolio.crypto;
  };
  
  // Set market conditions
  const setMarketConditions = () => {
    // Randomly determine market condition
    const rand = Math.random();
    let newMarketCondition;
    
    if (rand < 0.3) {
      newMarketCondition = 'bear';
    } else if (rand < 0.7) {
      newMarketCondition = 'neutral';
    } else {
      newMarketCondition = 'bull';
    }
    
    setMarketCondition(newMarketCondition);
    
    // Set growth rates based on market conditions
    setAssetPerformance({
      stocks: { 
        growth: getGrowthRate('stocks', newMarketCondition),
        volatility: 'medium'
      },
      bonds: { 
        growth: getGrowthRate('bonds', newMarketCondition),
        volatility: 'low'
      },
      realEstate: { 
        growth: getGrowthRate('realEstate', newMarketCondition),
        volatility: 'medium'
      },
      crypto: { 
        growth: getGrowthRate('crypto', newMarketCondition),
        volatility: 'high'
      }
    });
  };
  
  // Get growth rate based on asset type and market condition
  const getGrowthRate = (assetType, condition) => {
    // Base rates by asset type
    const baseRates = {
      stocks: { bear: -0.15, neutral: 0.08, bull: 0.20 },
      bonds: { bear: 0.02, neutral: 0.04, bull: 0.06 },
      realEstate: { bear: -0.08, neutral: 0.06, bull: 0.12 },
      crypto: { bear: -0.30, neutral: 0.10, bull: 0.40 }
    };
    
    // Get base rate
    const baseRate = baseRates[assetType][condition];
    
    // Add randomness based on volatility
    const volatility = {
      low: 0.02,
      medium: 0.05,
      high: 0.15
    };
    
    const assetVolatility = volatility[assetPerformance[assetType]?.volatility || 'medium'];
    const randomFactor = (Math.random() - 0.5) * assetVolatility * 2;
    
    return baseRate + randomFactor;
  };
  
  // Handle allocation change
  const handleAllocationChange = (assetType, value) => {
    // Calculate current total allocation
    const currentTotal = Object.values(allocation).reduce((a, b) => a + b, 0);
    
    // Calculate how much is available to allocate
    const available = 100 - currentTotal + allocation[assetType];
    
    // Ensure we don't exceed 100% total
    const newValue = Math.min(value, available);
    
    setAllocation({
      ...allocation,
      [assetType]: newValue
    });
  };
  
  // Apply allocations to portfolio
  const applyAllocations = () => {
    const totalValue = calculateTotalPortfolioValue();
    
    // Calculate new portfolio values based on allocations
    const newPortfolio = {
      cash: totalValue * (1 - (allocation.stocks + allocation.bonds + allocation.realEstate + allocation.crypto) / 100),
      stocks: totalValue * (allocation.stocks / 100),
      bonds: totalValue * (allocation.bonds / 100),
      realEstate: totalValue * (allocation.realEstate / 100),
      crypto: totalValue * (allocation.crypto / 100)
    };
    
    setPortfolio(newPortfolio);
    setScore(score + 5); // Points for making allocation decisions
  };
  
  // Handle advancing to next year
  const advanceYear = () => {
    // Record current portfolio value
    const startValue = calculateTotalPortfolioValue();
    const startYear = year;
    
    // Apply market growth to each asset
    const newPortfolio = {
      cash: portfolio.cash * (1 + 0.01), // Cash grows at 1% (savings account)
      stocks: portfolio.stocks * (1 + assetPerformance.stocks.growth),
      bonds: portfolio.bonds * (1 + assetPerformance.bonds.growth),
      realEstate: portfolio.realEstate * (1 + assetPerformance.realEstate.growth),
      crypto: portfolio.crypto * (1 + assetPerformance.crypto.growth)
    };
    
    // Update portfolio
    setPortfolio(newPortfolio);
    
    // Record history
    const endValue = calculateTotalPortfolioValue(newPortfolio);
    setHistory([
      ...history,
      {
        year: startYear,
        startValue: startValue,
        endValue: endValue,
        growth: ((endValue - startValue) / startValue) * 100,
        marketCondition: marketCondition
      }
    ]);
    
    // Calculate score based on growth and risk alignment
    const growth = endValue - startValue;
    let growthScore = Math.floor(growth / 100);
    
    // Bonus points for alignment with risk strategy
    if (riskLevel === 'conservative' && allocation.bonds > 40) {
      growthScore += 5;
    } else if (riskLevel === 'aggressive' && allocation.stocks + allocation.crypto > 60) {
      growthScore += 5;
    } else if (riskLevel === 'moderate' && allocation.stocks > 30 && allocation.bonds > 20) {
      growthScore += 5;
    }
    
    setScore(score + growthScore);
    
    // Advance year and set new market conditions
    setYear(year + 1);
    setMarketConditions();
    
    // Generate random event (30% chance)
    if (Math.random() < 0.3) {
      setCurrentEvent(generateEvent());
    }
  };
  
  // Generate a random event
  const generateEvent = () => {
    const events = [
      {
        id: 1,
        title: "Market Crash",
        description: "The stock market has suddenly crashed! How will you respond?",
        options: [
          { text: "Sell stocks to protect assets", effect: { action: 'sellStocks', score: -10 } },
          { text: "Buy more stocks at discount", effect: { action: 'buyStocks', score: 15 } },
          { text: "Hold your current position", effect: { action: 'hold', score: 5 } }
        ]
      },
      {
        id: 2,
        title: "Real Estate Boom",
        description: "The real estate market is experiencing a sudden boom!",
        options: [
          { text: "Increase real estate allocation", effect: { action: 'buyRealEstate', score: 10 } },
          { text: "Maintain current allocation", effect: { action: 'hold', score: 5 } }
        ]
      },
      {
        id: 3,
        title: "Interest Rate Hike",
        description: "The central bank has raised interest rates significantly.",
        options: [
          { text: "Move more into bonds", effect: { action: 'buyBonds', score: 10 } },
          { text: "Reduce bond holdings", effect: { action: 'sellBonds', score: -5 } },
          { text: "Maintain current allocation", effect: { action: 'hold', score: 3 } }
        ]
      },
      {
        id: 4,
        title: "Crypto Surge",
        description: "Cryptocurrency values are surging rapidly!",
        options: [
          { text: "Increase crypto allocation", effect: { action: 'buyCrypto', score: 0 } },
          { text: "Take profits and sell crypto", effect: { action: 'sellCrypto', score: 5 } },
          { text: "Maintain current allocation", effect: { action: 'hold', score: 3 } }
        ]
      },
      {
        id: 5,
        title: "Diversification Opportunity",
        description: "A new investment opportunity could help diversify your portfolio.",
        options: [
          { text: "Rebalance portfolio evenly", effect: { action: 'diversify', score: 15 } },
          { text: "Maintain current strategy", effect: { action: 'hold', score: 0 } }
        ]
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];
  };
  
  // Handle event option selection
  const handleOptionSelect = (effect) => {
    const totalValue = calculateTotalPortfolioValue();
    
    switch (effect.action) {
      case 'sellStocks':
        setPortfolio({
          ...portfolio,
          cash: portfolio.cash + portfolio.stocks,
          stocks: 0
        });
        break;
      case 'buyStocks':
        if (portfolio.cash > totalValue * 0.2) {
          setPortfolio({
            ...portfolio,
            cash: portfolio.cash - totalValue * 0.2,
            stocks: portfolio.stocks + totalValue * 0.2
          });
        }
        break;
      case 'buyRealEstate':
        if (portfolio.cash > totalValue * 0.15) {
          setPortfolio({
            ...portfolio,
            cash: portfolio.cash - totalValue * 0.15,
            realEstate: portfolio.realEstate + totalValue * 0.15
          });
        }
        break;
      case 'buyBonds':
        if (portfolio.cash > totalValue * 0.2) {
          setPortfolio({
            ...portfolio,
            cash: portfolio.cash - totalValue * 0.2,
            bonds: portfolio.bonds + totalValue * 0.2
          });
        }
        break;
      case 'sellBonds':
        setPortfolio({
          ...portfolio,
          cash: portfolio.cash + portfolio.bonds * 0.5,
          bonds: portfolio.bonds * 0.5
        });
        break;
      case 'buyCrypto':
        if (portfolio.cash > totalValue * 0.1) {
          setPortfolio({
            ...portfolio,
            cash: portfolio.cash - totalValue * 0.1,
            crypto: portfolio.crypto + totalValue * 0.1
          });
        }
        break;
      case 'sellCrypto':
        setPortfolio({
          ...portfolio,
          cash: portfolio.cash + portfolio.crypto,
          crypto: 0
        });
        break;
      case 'diversify':
        // Equal allocation strategy
        setPortfolio({
          cash: totalValue * 0.2,
          stocks: totalValue * 0.2,
          bonds: totalValue * 0.2,
          realEstate: totalValue * 0.2,
          crypto: totalValue * 0.2
        });
        break;
      default:
        // Hold - do nothing
        break;
    }
    
    setScore(score + effect.score);
    setCurrentEvent(null);
  };
  
  // Restart game
  const restartGame = () => {
    setPortfolio({
      cash: 10000,
      stocks: 0,
      bonds: 0,
      realEstate: 0,
      crypto: 0
    });
    setAllocation({
      stocks: 0,
      bonds: 0,
      realEstate: 0,
      crypto: 0
    });
    setAssetPerformance({
      stocks: { growth: 0, volatility: 'medium' },
      bonds: { growth: 0, volatility: 'low' },
      realEstate: { growth: 0, volatility: 'medium' },
      crypto: { growth: 0, volatility: 'high' }
    });
    setMarketCondition('neutral');
    setYear(1);
    setScore(0);
    setGameOver(false);
    

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimpleProgress from '@/components/Common/SimpleProgress';

const InvestmentSimulator = ({ onComplete }) => {
  // Game state
  const [portfolio, setPortfolio] = useState({
    cash: 10000,
    stocks: 0,
    bonds: 0,
    realEstate: 0,
    crypto: 0
  });
  const [assetValues, setAssetValues] = useState({
    stocks: 100,
    bonds: 100,
    realEstate: 100,
    crypto: 100
  });
  const [year, setYear] = useState(1);
  const [totalValue, setTotalValue] = useState(10000);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [history, setHistory] = useState([]);
  
  // Game configuration
  const MAX_YEARS = 10;
  const GOAL = 25000;
  
  // Initialize game
  useEffect(() => {
    initializeEvents();
    updateTotalValue();
  }, []);
  
  // Update total value when portfolio or asset values change
  useEffect(() => {
    updateTotalValue();
  }, [portfolio, assetValues]);
  
  // Check for game completion
  useEffect(() => {
    if (year > MAX_YEARS) {
      setGameOver(true);
    }
  }, [year]);
  
  // Initialize events
  const initializeEvents = () => {
    const gameEvents = [
      {
        id: 1,
        title: "Market Boom",
        description: "The stock market is experiencing a boom!",
        effects: {
          stocks: 1.15,
          bonds: 1.05,
          realEstate: 1.08,
          crypto: 1.25
        }
      },
      {
        id: 2,
        title: "Market Crash",
        description: "The stock market has crashed!",
        effects: {
          stocks: 0.75,
          bonds: 0.90,
          realEstate: 0.85,
          crypto: 0.60
        }
      },
      {
        id: 3,
        title: "Real Estate Boom",
        description: "The real estate market is booming!",
        effects: {
          stocks: 1.02,
          bonds: 1.01,
          realEstate: 1.20,
          crypto: 1.05
        }
      },
      {
        id: 4,
        title: "Crypto Surge",
        description: "Cryptocurrency prices are surging!",
        effects: {
          stocks: 1.00,
          bonds: 0.98,
          realEstate: 1.02,
          crypto: 1.50
        }
      },
      {
        id: 5,
        title: "Stable Economy",
        description: "The economy is stable with moderate growth.",
        effects: {
          stocks: 1.07,
          bonds: 1.04,
          realEstate: 1.05,
          crypto: 1.10
        }
      },
      {
        id: 6,
        title: "Recession",
        description: "The economy has entered a recession.",
        effects: {
          stocks: 0.85,
          bonds: 0.95,
          realEstate: 0.90,
          crypto: 0.70
        }
      },
      {
        id: 7,
        title: "Interest Rate Hike",
        description: "The central bank has increased interest rates.",
        effects: {
          stocks: 0.93,
          bonds: 0.97,
          realEstate: 0.95,
          crypto: 0.90
        }
      },
      {
        id: 8,
        title: "Interest Rate Cut",
        description: "The central bank has cut interest rates.",
        effects: {
          stocks: 1.08,
          bonds: 1.03,
          realEstate: 1.10,
          crypto: 1.15
        }
      }
    ];
    
    setEvents(gameEvents);
  };
  
  // Update total portfolio value
  const updateTotalValue = () => {
    const value = portfolio.cash +
      (portfolio.stocks * assetValues.stocks) +
      (portfolio.bonds * assetValues.bonds) +
      (portfolio.realEstate * assetValues.realEstate) +
      (portfolio.crypto * assetValues.crypto);
    
    setTotalValue(Math.round(value));
  };
  
  // Handle buying assets
  const handleBuy = (asset, amount) => {
    const cost = amount * assetValues[asset];
    if (cost > portfolio.cash) return;
    
    setPortfolio({
      ...portfolio,
      cash: portfolio.cash - cost,
      [asset]: portfolio[asset] + amount
    });
  };
  
  // Handle selling assets
  const handleSell = (asset, amount) => {
    if (amount > portfolio[asset]) return;
    
    const value = amount * assetValues[asset];
    setPortfolio({
      ...portfolio,
      cash: portfolio.cash + value,
      [asset]: portfolio[asset] - amount
    });
  };
  
  // Advance to next year
  const advanceYear = () => {
    // Generate random event
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    setCurrentEvent(randomEvent);
    
    // Apply event effects to asset values
    const newAssetValues = {
      stocks: Math.round(assetValues.stocks * randomEvent.effects.stocks),
      bonds: Math.round(assetValues.bonds * randomEvent.effects.bonds),
      realEstate: Math.round(assetValues.realEstate * randomEvent.effects.realEstate),
      crypto: Math.round(assetValues.crypto * randomEvent.effects.crypto)
    };
    
    // Calculate portfolio value before and after
    const oldValue = totalValue;
    const newValue = portfolio.cash +
      (portfolio.stocks * newAssetValues.stocks) +
      (portfolio.bonds * newAssetValues.bonds) +
      (portfolio.realEstate * newAssetValues.realEstate) +
      (portfolio.crypto * newAssetValues.crypto);
    
    // Update history
    setHistory([
      ...history,
      {
        year,
        event: randomEvent.title,
        portfolioValue: Math.round(newValue),
        change: Math.round(newValue - oldValue)
      }
    ]);
    
    // Update state
    setAssetValues(newAssetValues);
    setYear(year + 1);
  };
  
  // Continue after event
  const continueAfterEvent = () => {
    setCurrentEvent(null);
  };
  
  // Restart game
  const restartGame = () => {
    setPortfolio({
      cash: 10000,
      stocks: 0,
      bonds: 0,
      realEstate: 0,
      crypto: 0
    });
    setAssetValues({
      stocks: 100,
      bonds: 100,
      realEstate: 100,
      crypto: 100
    });
    setYear(1);
    setTotalValue(10000);
    setCurrentEvent(null);
    setGameOver(false);
    setHistory([]);
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, (totalValue / GOAL) * 100);
  
  // Calculate returns
  const calculateReturns = () => {
    if (history.length === 0) return 0;
    return ((totalValue - 10000) / 10000) * 100;
  };
  
  // Get asset allocation percentages
  const getAllocation = () => {
    const total = totalValue;
    if (total === 0) return { cash: 100, stocks: 0, bonds: 0, realEstate: 0, crypto: 0 };
    
    return {
      cash: Math.round((portfolio.cash / total) * 100),
      stocks: Math.round(((portfolio.stocks * assetValues.stocks) / total) * 100),
      bonds: Math.round(((portfolio.bonds * assetValues.bonds) / total) * 100),
      realEstate: Math.round(((portfolio.realEstate * assetValues.realEstate) / total) * 100),
      crypto: Math.round(((portfolio.crypto * assetValues.crypto) / total) * 100)
    };
  };
  
  const allocation = getAllocation();
  
  return (
    <div className="space-y-6">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Welcome to Investment Simulator!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have $10,000 to invest over 10 years. Your goal is to grow your portfolio to $25,000 or more.</p>
              
              <div className="space-y-2">
                <h3 className="font-semibold">How to Play:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Buy and sell different types of assets</li>
                  <li>Each year, market events will affect asset values</li>
                  <li>Diversify your portfolio to manage risk</li>
                  <li>Try to reach the $25,000 goal in 10 years or less</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold text-blue-800">Investment Types:</h3>
                <ul className="list-disc pl-5 space-y-1 text-blue-700">
                  <li><strong>Stocks:</strong> Higher risk, higher potential returns</li>
                  <li><strong>Bonds:</strong> Lower risk, stable but lower returns</li>
                  <li><strong>Real Estate:</strong> Moderate risk, good for diversification</li>
                  <li><strong>Crypto:</strong> Highest risk, volatile but potentially high returns</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md">
                <h3 className="font-semibold text-amber-800">What We're Testing:</h3>
                <p className="text-amber-700">This simulation tests your understanding of investment diversification, risk management, and how different market conditions affect various asset classes.</p>
              </div>
            </CardContent>
            <CardContent className="flex justify-end">
              <Button onClick={() => setShowTutorial(false)}>Start Investing</Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Game Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Investment Simulator</h2>
          <p className="text-muted-foreground">Grow your portfolio through strategic investments</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">Year {year} of {MAX_YEARS}</Badge>
          <Button variant="outline" size="sm" onClick={restartGame}>Restart</Button>
        </div>
      </div>
      
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
            <div className="mt-2">
              <SimpleProgress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Goal: ${GOAL.toLocaleString()}</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cash Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">${portfolio.cash.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {allocation.cash}% of portfolio
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${calculateReturns() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {calculateReturns() >= 0 ? '+' : ''}{calculateReturns().toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              ${(totalValue - 10000).toLocaleString()} total gain/loss
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Game Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investment Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Investment Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              {gameOver ? (
                <div className="text-center space-y-4 py-6">
                  <div className="text-4xl font-bold">Simulation Complete</div>
                  
                  <p className="text-xl">
                    {totalValue >= GOAL 
                      ? `Congratulations! You've reached your investment goal with a final portfolio value of $${totalValue.toLocaleString()}.` 
                      : `Your final portfolio value is $${totalValue.toLocaleString()}, which is ${Math.round((totalValue/GOAL)*100)}% of your $${GOAL.toLocaleString()} goal.`}
                  </p>
                  
                  <div className="bg-muted p-4 rounded-md max-w-md mx-auto">
                    <h3 className="font-semibold mb-2">Final Stats:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Starting Value: <span className="font-medium">$10,000</span></div>
                      <div>Final Value: <span className="font-medium">${totalValue.toLocaleString()}</span></div>
                      <div>Total Return: <span className={`font-medium ${calculateReturns() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {calculateReturns() >= 0 ? '+' : ''}{calculateReturns().toFixed(1)}%
                      </span></div>
                      <div>Years: <span className="font-medium">{year - 1}</span></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4 pt-4">
                    <Button onClick={restartGame}>Play Again</Button>
                    {totalValue >= GOAL && onComplete && (
                      <Button variant="outline" onClick={onComplete}>Continue</Button>
                    )}
                  </div>
                </div>
              ) : currentEvent ? (
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-xl font-bold mb-2">{currentEvent.title}</h3>
                    <p>{currentEvent.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Stocks</div>
                        <div className={`font-medium ${currentEvent.effects.stocks >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                          {currentEvent.effects.stocks >= 1 ? '+' : ''}{((currentEvent.effects.stocks - 1) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Bonds</div>
                        <div className={`font-medium ${currentEvent.effects.bonds >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                          {currentEvent.effects.bonds >= 1 ? '+' : ''}{((currentEvent.effects.bonds - 1) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Real Estate</div>
                        <div className={`font-medium ${currentEvent.effects.realEstate >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                          {currentEvent.effects.realEstate >= 1 ? '+' : ''}{((currentEvent.effects.realEstate - 1) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Crypto</div>
                        <div className={`font-medium ${currentEvent.effects.crypto >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                          {currentEvent.effects.crypto >= 1 ? '+' : ''}{((currentEvent.effects.crypto - 1) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button onClick={continueAfterEvent}>Continue</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Asset Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Asset</th>
                          <th className="text-right py-2">Price</th>
                          <th className="text-right py-2">Owned</th>
                          <th className="text-right py-2">Value</th>
                          <th className="text-right py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3">Stocks</td>
                          <td className="text-right">${assetValues.stocks}</td>
                          <td className="text-right">{portfolio.stocks}</td>
                          <td className="text-right">${(portfolio.stocks * assetValues.stocks).toLocaleString()}</td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={portfolio.cash < assetValues.stocks}
                                onClick={() => handleBuy('stocks', 1)}
                              >
                                Buy
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={portfolio.stocks < 1}
                                onClick={() => handleSell('stocks', 1)}
                              >
                                Sell
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3">Bonds</td>
                          <td className="text-right">${assetValues.bonds}</td>
                          <td className="text-right">{portfolio.bonds}</td>
                          <td className="text-right">${(portfolio.bonds * assetValues.bonds).toLocaleString()}</td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={portfolio.cash < assetValues.bonds}
                                onClick={() => handleBuy('bonds', 1)}
                              >
                                Buy
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={portfolio.bonds < 1}
                                onClick={() => handleSell('bonds', 1)}
                              >
                                Sell
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3">Real Estate</td>
                          <td className="text-right">${assetValues.realEstate}</td>
                          <td className="text-right">{portfolio.realEstate}</td>
                          <td className="text-right">${(portfolio.realEstate * assetValues.realEstate).toLocaleString()}</td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={portfolio.cash < assetValues.realEstate}
                                onClick={() => handleBuy('realEstate', 1)}
                              >
                                Buy
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={portfolio.realEstate < 1}
                                onClick={() => handleSell('realEstate', 1)}
                              >
                                Sell
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3">Cryptocurrency</td>
                          <td className="text-right">${assetValues.crypto}</td>
                          <td className="text-right">{portfolio.crypto}</td>
                          <td className="text-right">${(portfolio.crypto * assetValues.crypto).toLocaleString()}</td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={portfolio.cash < assetValues.crypto}
                                onClick={() => handleBuy('crypto', 1)}
                              >
                                Buy
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                disabled={portfolio.crypto < 1}
                                onClick={() => handleSell('crypto', 1)}
                              >
                                Sell
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <Button size="lg" onClick={advanceYear}>
                      Advance to Next Year
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Portfolio Breakdown */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span>Cash</span>
                    <span>{allocation.cash}%</span>
                  </div>
                  <SimpleProgress value={allocation.cash} className="h-2 bg-green-100" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span>Stocks</span>
                    <span>{allocation.stocks}%</span>
                  </div>
                  <SimpleProgress value={allocation.stocks} className="h-2 bg-blue-100" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span>Bonds</span>
                    <span>{allocation.bonds}%</span>
                  </div>
                  <SimpleProgress value={allocation.bonds} className="h-2 bg-yellow-100" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span>Real Estate</span>
                    <span>{allocation.realEstate}%</span>
                  </div>
                  <SimpleProgress value={allocation.realEstate} className="h-2 bg-orange-100" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span>Cryptocurrency</span>
                    <span>{allocation.crypto}%</span>
                  </div>
                  <SimpleProgress value={allocation.crypto} className="h-2 bg-purple-100" />
                </div>
              </div>
              
              {history.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Performance History</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {history.map((item, index) => (
                      <div key={index} className="text-sm p-2 border-b">
                        <div className="flex justify-between">
                          <span>Year {item.year}</span>
                          <span className={item.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {item.change >= 0 ? '+' : ''}${item.change.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{item.event}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Investment Tip:</h3>
                <p className="text-sm text-muted-foreground">
                  Diversification helps manage risk. Consider spreading your investments across different asset classes to protect against market volatility.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSimulator;