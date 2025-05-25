import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Filter, Calendar, PieChart as PieChartIcon, BarChart as BarChartIcon, TrendingUp } from 'lucide-react';

/**
 * Financial Breakdown Component
 * 
 * A comprehensive breakdown of the user's financial data with
 * visualizations and insights
 */
const FinancialBreakdown = ({ 
  incomeData = [], 
  expenseData = [], 
  savingsData = [],
  debtData = []
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('monthly');
  
  // Sample data for demonstration
  const sampleIncomeData = [
    { category: 'Salary', amount: 85000, percentage: 85 },
    { category: 'Freelance', amount: 12000, percentage: 12 },
    { category: 'Investments', amount: 3000, percentage: 3 }
  ];
  
  const sampleExpenseCategories = [
    { name: 'Housing', value: 35, color: '#0088FE' },
    { name: 'Food', value: 20, color: '#00C49F' },
    { name: 'Transportation', value: 15, color: '#FFBB28' },
    { name: 'Utilities', value: 10, color: '#FF8042' },
    { name: 'Entertainment', value: 10, color: '#8884d8' },
    { name: 'Other', value: 10, color: '#82ca9d' }
  ];
  
  const sampleMonthlyExpenses = [
    { month: 'Jan', amount: 42000 },
    { month: 'Feb', amount: 45000 },
    { month: 'Mar', amount: 39000 },
    { month: 'Apr', amount: 41000 },
    { month: 'May', amount: 43000 },
    { month: 'Jun', amount: 40000 }
  ];
  
  const sampleDebtBreakdown = [
    { name: 'Credit Cards', value: 25, color: '#FF5630' },
    { name: 'Student Loans', value: 40, color: '#FFAB00' },
    { name: 'Car Loan', value: 20, color: '#36B37E' },
    { name: 'Personal Loan', value: 15, color: '#6554C0' }
  ];
  
  const sampleSavingsGoals = [
    { name: 'Emergency Fund', target: 50000, current: 30000, percentage: 60 },
    { name: 'Home Down Payment', target: 200000, current: 50000, percentage: 25 },
    { name: 'Vacation', target: 20000, current: 15000, percentage: 75 }
  ];
  
  // Financial summary calculations
  const totalIncome = sampleIncomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = sampleMonthlyExpenses.reduce((sum, item) => sum + item.amount, 0) / sampleMonthlyExpenses.length;
  const monthlySavings = totalIncome - totalExpenses;
  const savingsRate = Math.round((monthlySavings / totalIncome) * 100);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5" />
              Financial Breakdown
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your income, expenses, savings, and debt
            </CardDescription>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 6 Months
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Monthly Income</h3>
            <div className="text-2xl font-bold mt-1">{formatCurrency(totalIncome)}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Monthly Expenses</h3>
            <div className="text-2xl font-bold mt-1">{formatCurrency(totalExpenses)}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Monthly Savings</h3>
            <div className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(monthlySavings)}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Savings Rate</h3>
            <div className="text-2xl font-bold mt-1 flex items-center">
              {savingsRate}%
              <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="savings">Savings & Debt</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income vs Expenses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Income vs Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Income', value: totalIncome },
                            { name: 'Expenses', value: totalExpenses },
                            { name: 'Savings', value: monthlySavings }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Expense Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sampleExpenseCategories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {sampleExpenseCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Financial Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-800">Savings Opportunity</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Your entertainment spending is 15% higher than last month. Reducing this could add KES 5,000 to your monthly savings.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-800">Positive Trend</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your savings rate has increased by 5% compared to the previous quarter. Keep up the good work!
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-medium text-yellow-800">Debt Reduction</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Allocating an additional KES 10,000 per month to your highest interest debt could save you KES 50,000 in interest over the next year.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Income Tab */}
          <TabsContent value="income">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Income Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sampleIncomeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                          label={({ category, percentage }) => `${category} ${percentage}%`}
                        >
                          <Cell fill="#36B37E" />
                          <Cell fill="#00B8D9" />
                          <Cell fill="#6554C0" />
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Income Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Source</th>
                          <th className="text-left py-3 px-4">Monthly Amount</th>
                          <th className="text-left py-3 px-4">Annual Amount</th>
                          <th className="text-left py-3 px-4">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleIncomeData.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 px-4">{item.category}</td>
                            <td className="py-3 px-4">{formatCurrency(item.amount)}</td>
                            <td className="py-3 px-4">{formatCurrency(item.amount * 12)}</td>
                            <td className="py-3 px-4">{item.percentage}%</td>
                          </tr>
                        ))}
                        <tr className="font-medium">
                          <td className="py-3 px-4">Total</td>
                          <td className="py-3 px-4">{formatCurrency(totalIncome)}</td>
                          <td className="py-3 px-4">{formatCurrency(totalIncome * 12)}</td>
                          <td className="py-3 px-4">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Income Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-800">Diversify Income Sources</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        85% of your income comes from a single source. Consider developing additional income streams to reduce financial risk.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-800">Investment Opportunity</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Only 3% of your income comes from investments. Consider increasing your investment allocation to build passive income.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Expense Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sampleExpenseCategories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name} ${value}%`}
                          >
                            {sampleExpenseCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Expenses Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={sampleMonthlyExpenses}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Bar dataKey="amount" fill="#FF5630" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expense Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="font-medium text-yellow-800">High Housing Costs</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your housing expenses are 35% of your income, which is above the recommended 30%. Consider ways to reduce this expense.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-800">Food Budget Optimization</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your food expenses are 20% of your budget. Meal planning and bulk cooking could help reduce this by 5-10%.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-800">Transportation Savings</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Consider carpooling or public transport to reduce your transportation costs, which currently account for 15% of your expenses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Savings & Debt Tab */}
          <TabsContent value="savings">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Debt Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sampleDebtBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name} ${value}%`}
                          >
                            {sampleDebtBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Savings Goals Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sampleSavingsGoals.map((goal, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{goal.name}</span>
                            <span className="text-sm text-gray-500">
                              {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${goal.percentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-end mt-1">
                            <span className="text-xs text-gray-500">{goal.percentage}% Complete</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Debt Repayment Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-medium text-red-800">High Interest Debt First</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Focus on paying off your credit card debt first, as it likely has the highest interest rate. This could save you KES 30,000 in interest over the next year.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-800">Debt Snowball Method</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Consider the debt snowball method: pay minimum payments on all debts, then put extra money toward your smallest debt. Once paid off, roll that payment into the next smallest debt.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-green-800">Refinancing Opportunity</h3>
                      <p className="text-sm text-green-700 mt-1">
                        You may be able to refinance your student loans at a lower interest rate, potentially saving KES 20,000 over the life of the loan.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FinancialBreakdown;