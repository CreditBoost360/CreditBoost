import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import CreditHero from '@/components/Games/CreditHero';
import BudgetMaster from '@/components/Games/BudgetMaster';
import InvestmentSimulator from '@/components/Games/InvestmentSimulator';
import FinancialSimulator from '@/components/Learning/FinancialSimulator';

const Games = () => {
  const [activeTab, setActiveTab] = useState('games');
  
  // Featured games for financial education
  const featuredGames = [
    {
      id: 'credit-hero',
      title: 'Credit Hero',
      description: 'Improve your credit score through strategic financial decisions in this simulation game.',
      image: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Simulation',
      difficulty: 'Beginner',
      component: CreditHero,
      testing: 'This game tests your understanding of credit score factors and how different financial decisions impact your credit score over time.'
    },
    {
      id: 'budget-master',
      title: 'Budget Master',
      description: 'Learn to create and stick to a budget while handling unexpected financial challenges.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Strategy',
      difficulty: 'Intermediate',
      component: BudgetMaster,
      testing: 'This game tests your ability to prioritize expenses, make trade-offs between spending and saving, and handle unexpected financial events.'
    },
    {
      id: 'investment-simulator',
      title: 'Investment Simulator',
      description: 'Build and manage an investment portfolio to reach your financial goals.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Simulation',
      difficulty: 'Intermediate',
      component: InvestmentSimulator,
      testing: 'This simulation tests your understanding of investment diversification, risk management, and how different market conditions affect various asset classes.'
    },
    {
      id: 'debt-destroyer',
      title: 'Debt Destroyer',
      description: 'Strategically eliminate debt using different repayment methods in this addictive game.',
      image: 'https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Action',
      difficulty: 'Intermediate',
      comingSoon: true,
      testing: 'This game will test your understanding of debt repayment strategies, interest calculations, and financial decision-making when dealing with multiple debts.'
    },
    {
      id: 'entrepreneur-tycoon',
      title: 'Entrepreneur Tycoon',
      description: 'Build and grow your own business while managing resources, employees, and market challenges.',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Strategy',
      difficulty: 'Advanced',
      comingSoon: true,
      testing: 'This game tests your business acumen, resource management, and strategic decision-making in a competitive market environment.'
    },
    {
      id: 'market-master',
      title: 'Market Master',
      description: 'Test your stock trading skills in a simulated market with real-world economic events.',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Trading',
      difficulty: 'Advanced',
      comingSoon: true,
      testing: 'This game tests your ability to analyze market trends, make timely investment decisions, and build a profitable portfolio in changing economic conditions.'
    },
    {
      id: 'property-mogul',
      title: 'Property Mogul',
      description: 'Build a real estate empire by buying, selling, and managing properties in different market conditions.',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Strategy',
      difficulty: 'Intermediate',
      comingSoon: true,
      testing: 'This game tests your understanding of real estate markets, property valuation, financing options, and long-term investment strategies.'
    },
    {
      id: 'retirement-road',
      title: 'Retirement Road',
      description: 'Navigate life\'s financial journey from career start to retirement with strategic planning and decision-making.',
      image: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Life Simulation',
      difficulty: 'Beginner',
      comingSoon: true,
      testing: 'This game tests your ability to make sound financial decisions throughout different life stages to achieve a comfortable retirement.'
    },
    {
      id: 'tax-tactics',
      title: 'Tax Tactics',
      description: 'Master the art of legal tax optimization through strategic financial planning and decision-making.',
      image: 'https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Strategy',
      difficulty: 'Advanced',
      comingSoon: true,
      testing: 'This game tests your understanding of tax regulations, deductions, credits, and planning strategies to legally minimize tax liability.'
    },
    {
      id: 'insurance-defender',
      title: 'Insurance Defender',
      description: 'Protect your assets and financial future by making smart insurance decisions against various risks.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Strategy',
      difficulty: 'Intermediate',
      comingSoon: true,
      testing: 'This game tests your risk assessment skills and understanding of different insurance products to create optimal protection for various life scenarios.'
    }
  ];
  
  // Simulation tools
  const simulationTools = [
    {
      id: 'financial-simulator',
      title: 'Advanced Financial Simulator',
      description: 'Comprehensive financial planning tool with loan, investment, and retirement simulations.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Advanced',
      difficulty: 'Advanced',
      component: FinancialSimulator,
      testing: 'This advanced simulator tests your ability to plan for complex financial scenarios including loans, investments, and retirement planning with real-world variables.'
    },
    {
      id: 'career-simulator',
      title: 'Career Path Simulator',
      description: 'Explore different career paths and see how they impact your long-term financial future.',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Career',
      difficulty: 'Intermediate',
      component: FinancialSimulator,
      testing: 'This simulator helps you understand how different career choices, work styles, and education investments affect your lifetime earnings and financial growth.'
    }
  ];
  
  // Currently selected game or simulation
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Handle item selection
  const handleSelectItem = (item) => {
    if (item.comingSoon) return;
    setSelectedItem(item);
  };
  
  // Handle back button
  const handleBack = () => {
    setSelectedItem(null);
  };
  
  // Handle navigation to Learn section
  const navigateToLearn = () => {
    window.location.href = '/learn';
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        {selectedItem ? (
          <div className="space-y-6">
            <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold">{selectedItem.title}</h1>
              <p className="text-muted-foreground">{selectedItem.description}</p>
            </div>
            
            {selectedItem.testing && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 mt-0.5">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="M12 8v4"></path>
                      <path d="M12 16h.01"></path>
                    </svg>
                    <div>
                      <h3 className="font-semibold text-amber-800">What We're Testing</h3>
                      <p className="text-amber-700">{selectedItem.testing}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {selectedItem.component && <selectedItem.component onComplete={handleBack} />}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Financial Games & Simulations</h1>
              <p className="text-muted-foreground">Learn financial concepts through interactive games and advanced simulations</p>
            </div>
            
            <Tabs defaultValue="games" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="games" className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 2v8H2"></path>
                    <path d="M2 12v4a8 8 0 0 0 16 0v-4"></path>
                    <path d="M22 12v4a8 8 0 0 1-8 8"></path>
                    <path d="M18 2v8h8"></path>
                    <path d="M22 2 12 12"></path>
                  </svg>
                  Games
                </TabsTrigger>
                <TabsTrigger value="simulations" className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                  </svg>
                  Simulations
                </TabsTrigger>
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                  About
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="games" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredGames.map((game) => (
                    <Card 
                      key={game.id} 
                      className={`overflow-hidden hover:shadow-lg transition-shadow ${
                        game.comingSoon ? 'opacity-70' : 'cursor-pointer'
                      }`}
                      onClick={() => handleSelectItem(game)}
                    >
                      <div className="relative h-48">
                        <img 
                          src={game.image} 
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                        {game.comingSoon && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Coming Soon
                            </div>
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{game.title}</CardTitle>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {game.category}
                          </span>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {game.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-sm text-muted-foreground">
                            {game.difficulty}
                          </div>
                          {!game.comingSoon && (
                            <Button size="sm">Play Now</Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="simulations" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {simulationTools.map((sim) => (
                    <Card 
                      key={sim.id} 
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleSelectItem(sim)}
                    >
                      <div className="relative h-48">
                        <img 
                          src={sim.image} 
                          alt={sim.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{sim.title}</CardTitle>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {sim.category}
                          </span>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {sim.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <div className="flex justify-between items-center w-full">
                          <div className="text-sm text-muted-foreground">
                            {sim.difficulty}
                          </div>
                          <Button size="sm">Launch</Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">What are Financial Simulations?</h3>
                  <p className="text-blue-700 mb-4">
                    Financial simulations use real-world data and mathematical models to help you understand complex financial concepts and make better decisions. Unlike games, simulations focus on accuracy and detailed calculations rather than gamified experiences.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="font-medium text-blue-800 mb-1">Loan Calculator</h4>
                      <p className="text-sm text-blue-700">Calculate payments, interest, and amortization schedules for different loan types.</p>
                    </div>
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="font-medium text-blue-800 mb-1">Investment Projections</h4>
                      <p className="text-sm text-blue-700">Model investment growth with different contribution amounts, returns, and time periods.</p>
                    </div>
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="font-medium text-blue-800 mb-1">Retirement Planning</h4>
                      <p className="text-sm text-blue-700">Project retirement savings and income needs with inflation adjustments.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Financial Games & Simulations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Why Play Financial Games?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                          <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                              </svg>
                            </div>
                            <CardTitle>Learn by Doing</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">
                              Interactive games help you understand complex financial concepts through hands-on experience.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
                                <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
                              </svg>
                            </div>
                            <CardTitle>Risk-Free Practice</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">
                              Make financial decisions and see their consequences without risking your real money.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11"></path>
                                <circle cx="12" cy="8" r="7"></circle>
                              </svg>
                            </div>
                            <CardTitle>Track Progress</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">
                              Earn achievements and see your financial knowledge grow as you master different concepts.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Features</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <span className="font-medium">Interactive Simulations:</span> Each game includes realistic financial scenarios that respond to your decisions.
                        </li>
                        <li>
                          <span className="font-medium">Advanced Simulators:</span> Detailed financial calculators for loans, investments, and retirement planning.
                        </li>
                        <li>
                          <span className="font-medium">Educational Content:</span> Learn key financial concepts through gameplay with explanations of what skills are being tested.
                        </li>
                        <li>
                          <span className="font-medium">Progress Tracking:</span> Track your improvement over time with achievements and score tracking.
                        </li>
                        <li>
                          <span className="font-medium">Personalized Challenges:</span> Face financial scenarios tailored to common real-world situations.
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="md:w-1/4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mx-auto">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                          </svg>
                        </div>
                        <div className="md:w-2/4">
                          <h3 className="text-xl font-bold text-blue-800 mb-2">Looking for personalized learning?</h3>
                          <p className="text-blue-700 mb-4">
                            Visit our Learning Center for personalized financial insights, educational tools, and courses based on your own financial data.
                          </p>
                        </div>
                        <div className="md:w-1/4 flex justify-center">
                          <Button onClick={navigateToLearn} size="lg">
                            Go to Learning Center
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Games;