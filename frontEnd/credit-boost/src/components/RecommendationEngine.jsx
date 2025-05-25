import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Star, CreditCard, Briefcase, TrendingUp, ArrowRight, ThumbsUp, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Recommendation Engine Component
 * 
 * A personalized recommendation engine for financial tools and actions
 * based on the user's financial data and goals
 */
const RecommendationEngine = ({ userData = {} }) => {
  const [activeTab, setActiveTab] = useState('creditProducts');
  
  // Sample recommendations for demonstration
  const sampleCreditProducts = [
    {
      id: 'card1',
      name: 'CreditBoost Rewards Card',
      provider: 'KCB Bank',
      type: 'Credit Card',
      matchScore: 95,
      interestRate: '18.5%',
      annualFee: 'KES 5,000',
      benefits: [
        'No foreign transaction fees',
        '2% cashback on all purchases',
        'Travel insurance included'
      ],
      requirements: [
        'Credit score of 700+',
        'Monthly income of KES 50,000+',
        'No recent defaults'
      ],
      tags: ['Rewards', 'Travel', 'Cashback']
    },
    {
      id: 'loan1',
      name: 'Personal Development Loan',
      provider: 'Equity Bank',
      type: 'Personal Loan',
      matchScore: 88,
      interestRate: '14%',
      loanAmount: 'Up to KES 500,000',
      term: '12-48 months',
      benefits: [
        'No early repayment fees',
        'Flexible repayment options',
        'Quick approval process'
      ],
      requirements: [
        'Credit score of 650+',
        'Employment history of 1+ years',
        'Debt-to-income ratio below 40%'
      ],
      tags: ['Low Interest', 'Flexible', 'Quick Approval']
    },
    {
      id: 'card2',
      name: 'Business Builder Card',
      provider: 'Stanbic Bank',
      type: 'Business Credit Card',
      matchScore: 82,
      interestRate: '19%',
      annualFee: 'KES 7,500',
      benefits: [
        'Separate personal and business expenses',
        '3% cashback on business services',
        'Employee cards available'
      ],
      requirements: [
        'Business registration documents',
        'Business bank account',
        'Annual turnover of KES 1M+'
      ],
      tags: ['Business', 'Cashback', 'Employee Cards']
    }
  ];
  
  const sampleSavingsProducts = [
    {
      id: 'save1',
      name: 'High-Yield Savings Account',
      provider: 'Co-operative Bank',
      type: 'Savings Account',
      matchScore: 92,
      interestRate: '7% p.a.',
      minimumBalance: 'KES 10,000',
      benefits: [
        'No monthly fees',
        'Mobile banking access',
        'Automatic savings options'
      ],
      requirements: [
        'Valid ID',
        'Proof of address',
        'Initial deposit of KES 10,000'
      ],
      tags: ['High Interest', 'No Fees', 'Mobile Banking']
    },
    {
      id: 'save2',
      name: 'Fixed Deposit Account',
      provider: 'DTB Bank',
      type: 'Term Deposit',
      matchScore: 85,
      interestRate: '9% p.a.',
      term: '12 months',
      minimumDeposit: 'KES 100,000',
      benefits: [
        'Guaranteed returns',
        'Higher interest than savings',
        'Option to reinvest at maturity'
      ],
      requirements: [
        'Valid ID',
        'Existing bank account',
        'Minimum deposit of KES 100,000'
      ],
      tags: ['Fixed Rate', 'Guaranteed Returns', 'Long Term']
    }
  ];
  
  const sampleInvestmentProducts = [
    {
      id: 'inv1',
      name: 'Balanced Mutual Fund',
      provider: 'Old Mutual',
      type: 'Mutual Fund',
      matchScore: 90,
      expectedReturn: '10-12% p.a.',
      riskLevel: 'Medium',
      minimumInvestment: 'KES 5,000',
      benefits: [
        'Professional management',
        'Diversified portfolio',
        'Regular income option'
      ],
      requirements: [
        'Valid ID',
        'KYC documentation',
        'Bank account details'
      ],
      tags: ['Diversified', 'Medium Risk', 'Regular Income']
    },
    {
      id: 'inv2',
      name: 'Money Market Fund',
      provider: 'CIC Asset Management',
      type: 'Money Market Fund',
      matchScore: 87,
      expectedReturn: '8-10% p.a.',
      riskLevel: 'Low',
      minimumInvestment: 'KES 1,000',
      benefits: [
        'Low risk investment',
        'High liquidity',
        'No lock-in period'
      ],
      requirements: [
        'Valid ID',
        'KYC documentation',
        'Bank account details'
      ],
      tags: ['Low Risk', 'Liquid', 'Stable Returns']
    }
  ];
  
  const sampleActions = [
    {
      id: 'action1',
      title: 'Reduce Credit Card Balance',
      description: 'Pay down your credit card balance to below 30% utilization',
      impact: 'High',
      timeframe: 'Short-term',
      difficulty: 'Medium',
      potentialBenefit: '+20 to +40 credit score points',
      steps: [
        'Identify highest interest credit cards',
        'Allocate extra funds to highest interest card first',
        'Make minimum payments on all other cards',
        'Continue until all balances are below 30% of limit'
      ]
    },
    {
      id: 'action2',
      title: 'Set Up Emergency Fund',
      description: 'Build an emergency fund covering 3-6 months of expenses',
      impact: 'Medium',
      timeframe: 'Medium-term',
      difficulty: 'Medium',
      potentialBenefit: 'Financial security and reduced stress',
      steps: [
        'Open a dedicated high-yield savings account',
        'Set up automatic transfers after each paycheck',
        'Start with a goal of KES 50,000',
        'Gradually build to 3-6 months of expenses'
      ]
    },
    {
      id: 'action3',
      title: 'Consolidate High-Interest Debt',
      description: 'Combine multiple high-interest debts into a single lower-interest loan',
      impact: 'High',
      timeframe: 'Short-term',
      difficulty: 'Medium',
      potentialBenefit: 'Save KES 50,000+ in interest payments',
      steps: [
        'List all current debts with interest rates',
        'Research consolidation loan options',
        'Apply for the best option based on your credit profile',
        'Use the loan to pay off high-interest debts',
        'Make regular payments on the new loan'
      ]
    }
  ];
  
  // Get match score color
  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-gray-500';
  };
  
  // Get impact badge color
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get timeframe badge color
  const getTimeframeColor = (timeframe) => {
    switch (timeframe) {
      case 'Short-term':
        return 'bg-green-100 text-green-800';
      case 'Medium-term':
        return 'bg-blue-100 text-blue-800';
      case 'Long-term':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ThumbsUp className="mr-2 h-5 w-5" />
          Personalized Recommendations
        </CardTitle>
        <CardDescription>
          Financial products and actions tailored to your profile and goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="creditProducts">Credit Products</TabsTrigger>
            <TabsTrigger value="savingsProducts">Savings Products</TabsTrigger>
            <TabsTrigger value="investmentProducts">Investments</TabsTrigger>
            <TabsTrigger value="recommendedActions">Recommended Actions</TabsTrigger>
          </TabsList>
          
          {/* Credit Products Tab */}
          <TabsContent value="creditProducts">
            <div className="space-y-6">
              {sampleCreditProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 bg-gray-50 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.provider}</p>
                        <div className="mt-2">
                          <Badge variant="outline">{product.type}</Badge>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm font-medium">Match Score</div>
                        <div className="flex items-center mt-1">
                          <Progress 
                            value={product.matchScore} 
                            className="h-2 flex-1 mr-2"
                          >
                            <div 
                              className={`h-full ${getMatchScoreColor(product.matchScore)}`}
                              style={{ width: `${product.matchScore}%` }}
                            />
                          </Progress>
                          <span className="text-sm font-bold">{product.matchScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-3/4 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Key Details</h4>
                          <ul className="mt-2 space-y-1">
                            <li className="text-sm">Interest Rate: {product.interestRate}</li>
                            {product.annualFee && <li className="text-sm">Annual Fee: {product.annualFee}</li>}
                            {product.loanAmount && <li className="text-sm">Loan Amount: {product.loanAmount}</li>}
                            {product.term && <li className="text-sm">Term: {product.term}</li>}
                          </ul>
                          
                          <h4 className="text-sm font-medium text-gray-500 mt-4">Benefits</h4>
                          <ul className="mt-2 space-y-1">
                            {product.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1 mt-0.5" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Requirements</h4>
                          <ul className="mt-2 space-y-1">
                            {product.requirements.map((requirement, index) => (
                              <li key={index} className="text-sm flex items-start">
                                <AlertCircle className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />
                                <span>{requirement}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button>
                          Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Savings Products Tab */}
          <TabsContent value="savingsProducts">
            <div className="space-y-6">
              {sampleSavingsProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 bg-gray-50 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.provider}</p>
                        <div className="mt-2">
                          <Badge variant="outline">{product.type}</Badge>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm font-medium">Match Score</div>
                        <div className="flex items-center mt-1">
                          <Progress 
                            value={product.matchScore} 
                            className="h-2 flex-1 mr-2"
                          >
                            <div 
                              className={`h-full ${getMatchScoreColor(product.matchScore)}`}
                              style={{ width: `${product.matchScore}%` }}
                            />
                          </Progress>
                          <span className="text-sm font-bold">{product.matchScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-3/4 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Key Details</h4>
                          <ul className="mt-2 space-y-1">
                            <li className="text-sm">Interest Rate: {product.interestRate}</li>
                            {product.minimumBalance && <li className="text-sm">Minimum Balance: {product.minimumBalance}</li>}
                            {product.term && <li className="text-sm">Term: {product.term}</li>}
                            {product.minimumDeposit && <li className="text-sm">Minimum Deposit: {product.minimumDeposit}</li>}
                          </ul>
                          
                          <h4 className="text-sm font-medium text-gray-500 mt-4">Benefits</h4>
                          <ul className="mt-2 space-y-1">
                            {product.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1 mt-0.5" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Requirements</h4>
                          <ul className="mt-2 space-y-1">
                            {product.requirements.map((requirement, index) => (
                              <li key={index} className="text-sm flex items-start">
                                <AlertCircle className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />
                                <span>{requirement}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button>
                          Learn More <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Investment Products Tab */}
          <TabsContent value="investmentProducts">
            <div className="space-y-6">
              {sampleInvestmentProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 bg-gray-50 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.provider}</p>
                        <div className="mt-2">
                          <Badge variant="outline">{product.type}</Badge>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm font-medium">Match Score</div>
                        <div className="flex items-center mt-1">
                          <Progress 
                            value={product.matchScore} 
                            className="h-2 flex-1 mr-2"
                          >
                            <div 
                              className={`h-full ${getMatchScoreColor(product.matchScore)}`}
                              style={{ width: `${product.matchScore}%` }}
                            />
                          </Progress>
                          <span className="text-sm font-bold">{product.matchScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-3/4 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Key Details</h4>
                          <ul className="mt-2 space-y-1">
                            <li className="text-sm">Expected Return: {product.expectedReturn}</li>
                            <li className="text-sm">Risk Level: {product.riskLevel}</li>
                            <li className="text-sm">Minimum Investment: {product.minimumInvestment}</li>
                          </ul>
                          
                          <h4 className="text-sm font-medium text-gray-500 mt-4">Benefits</h4>
                          <ul className="mt-2 space-y-1">
                            {product.benefits.map((benefit, index) => (
                              <li key={index} className="text-sm flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1 mt-0.5" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Requirements</h4>
                          <ul className="mt-2 space-y-1">
                            {product.requirements.map((requirement, index) => (
                              <li key={index} className="text-sm flex items-start">
                                <AlertCircle className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />
                                <span>{requirement}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button>
                          Invest Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Recommended Actions Tab */}
          <TabsContent value="recommendedActions">
            <div className="space-y-6">
              {sampleActions.map((action) => (
                <Card key={action.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getImpactColor(action.impact)}>
                        Impact: {action.impact}
                      </Badge>
                      <Badge className={getTimeframeColor(action.timeframe)}>
                        {action.timeframe}
                      </Badge>
                      <Badge className={getDifficultyColor(action.difficulty)}>
                        Difficulty: {action.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-md mb-4">
                      <p className="text-sm text-blue-700">
                        <strong>Potential Benefit:</strong> {action.potentialBenefit}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Action Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {action.steps.map((step, index) => (
                          <li key={index} className="text-sm">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button>
                      Start This Action <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;