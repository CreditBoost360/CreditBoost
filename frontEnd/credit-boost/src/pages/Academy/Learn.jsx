import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight, User, FileText, BarChart2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { topicService } from '@/services/topic.service';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import FinancialNewsVerifier from '@/components/Learning/FinancialNewsVerifier';
import DataInsightsAnalyzer from '@/components/Learning/DataInsightsAnalyzer';

const Learn = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('topics');
  const [selectedTool, setSelectedTool] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      const { topics } = await topicService.getTopics();
      setTopics(topics);
      setLoading(false);
    };
    
    const fetchUserData = async () => {
      try {
        // In a real implementation, this would fetch user data from an API
        // For now, we'll use mock data
        const mockUserData = {
          creditScore: 720,
          transactions: [
            { id: 1, date: '2023-10-15', amount: 1200, category: 'Income', description: 'Salary' },
            { id: 2, date: '2023-10-16', amount: -85, category: 'Food', description: 'Grocery Store' },
            { id: 3, date: '2023-10-18', amount: -120, category: 'Utilities', description: 'Electricity Bill' },
            { id: 4, date: '2023-10-20', amount: -45, category: 'Entertainment', description: 'Streaming Service' },
            { id: 5, date: '2023-10-22', amount: -350, category: 'Housing', description: 'Rent Payment' }
          ],
          debts: [
            { type: 'Credit Card', balance: 2500, interestRate: 18.99 },
            { type: 'Student Loan', balance: 15000, interestRate: 4.5 }
          ],
          savings: 3500,
          spendingByCategory: {
            Housing: 35,
            Food: 20,
            Transportation: 15,
            Utilities: 10,
            Entertainment: 10,
            Other: 10
          }
        };
        
        setUserData(mockUserData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchTopics();
    fetchUserData();
  }, []);

  // Learning tools
  const learningTools = [
    {
      id: 'news-verifier',
      title: 'Financial News Verifier',
      description: 'Learn to identify reliable financial information and spot misinformation.',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Media Literacy',
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      component: FinancialNewsVerifier
    },
    {
      id: 'data-insights',
      title: 'Data Insights Analyzer',
      description: 'Analyze your financial data to uncover patterns and opportunities.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Analytics',
      icon: <BarChart2 className="h-8 w-8 text-green-500" />,
      component: DataInsightsAnalyzer
    }
  ];

  // Navigate to Games section for simulations
  const navigateToGames = () => {
    window.location.href = '/games';
  };

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
  };

  const handleBack = () => {
    setSelectedTool(null);
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        {selectedTool ? (
          <div className="space-y-6">
            <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Learning
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold">{selectedTool.title}</h1>
              <p className="text-muted-foreground">{selectedTool.description}</p>
            </div>
            
            {selectedTool.component && <selectedTool.component userData={userData} />}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Learning Center</h1>
              <p className="text-muted-foreground">Improve your financial knowledge with courses, tools, and personalized insights</p>
            </div>
            
            <Tabs defaultValue="topics" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="topics" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Learning Topics
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Learning Tools
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Your Insights
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="topics" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topics.map((topic) => (
                    <Card
                      key={topic.id}
                      className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/learn/topics/${topic.id}/quizzes`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                            {topic.title}
                          </h2>
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{topic.rating}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-6">{topic.description}</p>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="h-4 w-4" />
                            <span>{topic.creatorName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-primary">
                            <span className="font-medium">Start Learning</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tools" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {learningTools.map((tool) => (
                    <Card 
                      key={tool.id} 
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleSelectTool(tool)}
                    >
                      <div className="relative h-48">
                        <img 
                          src={tool.image} 
                          alt={tool.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{tool.title}</CardTitle>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {tool.category}
                          </span>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-0">
                        <Button className="w-full">Explore Tool</Button>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  {/* Link to Financial Simulator in Games section */}
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={navigateToGames}>
                    <div className="relative h-48">
                      <img 
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Financial Simulations"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Financial Simulations</CardTitle>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          Simulation
                        </span>
                      </div>
                      <CardDescription className="line-clamp-2">
                        Access advanced financial simulations for loans, investments, and retirement planning in our Games section.
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Button className="w-full">Go to Simulations</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="insights" className="mt-6">
                {userData ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Financial Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-blue-600 mb-1">Credit Score</div>
                            <div className="text-2xl font-bold">{userData.creditScore}</div>
                            <div className="text-xs text-blue-600 mt-1">Good</div>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-sm text-green-600 mb-1">Savings</div>
                            <div className="text-2xl font-bold">${userData.savings.toLocaleString()}</div>
                            <div className="text-xs text-green-600 mt-1">Emergency Fund</div>
                          </div>
                          
                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-sm text-red-600 mb-1">Total Debt</div>
                            <div className="text-2xl font-bold">
                              ${userData.debts.reduce((sum, debt) => sum + debt.balance, 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-red-600 mt-1">
                              {userData.debts.length} active accounts
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-2">Learning Recommendations</h3>
                          <div className="space-y-2">
                            <div className="p-3 border rounded-md flex items-center justify-between">
                              <div>
                                <div className="font-medium">Improve Your Credit Score</div>
                                <div className="text-sm text-muted-foreground">Learn strategies to boost your credit rating</div>
                              </div>
                              <Button size="sm">Start</Button>
                            </div>
                            
                            <div className="p-3 border rounded-md flex items-center justify-between">
                              <div>
                                <div className="font-medium">Debt Reduction Strategies</div>
                                <div className="text-sm text-muted-foreground">Techniques to pay down high-interest debt faster</div>
                              </div>
                              <Button size="sm">Start</Button>
                            </div>
                            
                            <div className="p-3 border rounded-md flex items-center justify-between">
                              <div>
                                <div className="font-medium">Building Emergency Savings</div>
                                <div className="text-sm text-muted-foreground">How to establish a robust financial safety net</div>
                              </div>
                              <Button size="sm">Start</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Transactions Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Spending by Category</h3>
                            <div className="h-4 w-full flex rounded-full overflow-hidden">
                              {Object.entries(userData.spendingByCategory).map(([category, percentage], index) => (
                                <div 
                                  key={category}
                                  className={`h-full ${
                                    index % 5 === 0 ? 'bg-blue-500' : 
                                    index % 5 === 1 ? 'bg-green-500' : 
                                    index % 5 === 2 ? 'bg-yellow-500' : 
                                    index % 5 === 3 ? 'bg-purple-500' : 
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                  title={`${category}: ${percentage}%`}
                                ></div>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                              {Object.entries(userData.spendingByCategory).map(([category, percentage], index) => (
                                <div key={category} className="flex items-center text-xs">
                                  <div 
                                    className={`w-3 h-3 mr-1 ${
                                      index % 5 === 0 ? 'bg-blue-500' : 
                                      index % 5 === 1 ? 'bg-green-500' : 
                                      index % 5 === 2 ? 'bg-yellow-500' : 
                                      index % 5 === 3 ? 'bg-purple-500' : 
                                      'bg-red-500'
                                    }`}
                                  ></div>
                                  {category}: {percentage}%
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2">Date</th>
                                    <th className="text-left py-2">Description</th>
                                    <th className="text-left py-2">Category</th>
                                    <th className="text-right py-2">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {userData.transactions.map((transaction) => (
                                    <tr key={transaction.id} className="border-b">
                                      <td className="py-2">{transaction.date}</td>
                                      <td className="py-2">{transaction.description}</td>
                                      <td className="py-2">{transaction.category}</td>
                                      <td className={`py-2 text-right ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${Math.abs(transaction.amount).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-center">
                      <Button onClick={() => handleSelectTool(learningTools.find(tool => tool.id === 'data-insights'))}>
                        View Detailed Data Analysis
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <BarChart2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      We don't have enough financial data to provide personalized insights. 
                      Please connect your accounts or upload transaction data.
                    </p>
                    <Button>Connect Accounts</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Learn;