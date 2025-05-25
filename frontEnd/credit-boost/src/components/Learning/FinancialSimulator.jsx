import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimpleProgress from '@/components/Common/SimpleProgress';

/**
 * Financial Simulator Component
 * Advanced simulation tool that uses real financial data to model outcomes
 */
const FinancialSimulator = ({ userData = null }) => {
  const [simulationType, setSimulationType] = useState('loan');
  const [useRealData, setUseRealData] = useState(false);
  const [simulationParams, setSimulationParams] = useState({
    loan: {
      amount: 10000,
      interestRate: 5.5,
      term: 5, // years
      paymentFrequency: 'monthly'
    },
    investment: {
      initialAmount: 5000,
      monthlyContribution: 500,
      annualReturn: 7,
      years: 10,
      compoundingFrequency: 'monthly'
    },
    retirement: {
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      annualReturn: 6,
      inflationRate: 2.5
    },
    career: {
      field: 'technology',
      startingSalary: 60000,
      annualGrowth: 4.5,
      years: 10,
      educationCost: 0,
      workStyle: 'full-time'
    }
  });
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeCareerModule, setActiveCareerModule] = useState('technology');
  
  // Initialize with user data if available
  useEffect(() => {
    if (userData && useRealData) {
      // Update simulation parameters based on user data
      const updatedParams = { ...simulationParams };
      
      if (userData.debts && userData.debts.length > 0) {
        // Calculate average debt and interest rate
        const totalDebt = userData.debts.reduce((sum, debt) => sum + debt.balance, 0);
        const avgInterestRate = userData.debts.reduce((sum, debt) => sum + (debt.balance * debt.interestRate), 0) / totalDebt;
        
        updatedParams.loan = {
          ...updatedParams.loan,
          amount: totalDebt,
          interestRate: avgInterestRate
        };
      }
      
      if (userData.savings !== undefined) {
        updatedParams.investment = {
          ...updatedParams.investment,
          initialAmount: userData.savings
        };
        
        updatedParams.retirement = {
          ...updatedParams.retirement,
          currentSavings: userData.savings
        };
      }
      
      setSimulationParams(updatedParams);
    }
  }, [userData, useRealData]);

  // Run simulation when parameters change
  useEffect(() => {
    runSimulation();
  }, [simulationType, simulationParams]);
  
  // Run the financial simulation
  const runSimulation = () => {
    setIsCalculating(true);
    
    // Simulate API delay
    setTimeout(() => {
      let simulationResults;
      
      switch (simulationType) {
        case 'loan':
          simulationResults = calculateLoanResults(simulationParams.loan);
          break;
        case 'investment':
          simulationResults = calculateInvestmentResults(simulationParams.investment);
          break;
        case 'retirement':
          simulationResults = calculateRetirementResults(simulationParams.retirement);
          break;
        case 'career':
          simulationResults = calculateCareerResults(simulationParams.career);
          break;
        default:
          simulationResults = null;
      }
      
      setResults(simulationResults);
      setIsCalculating(false);
    }, 500);
  };
  
  // Calculate loan simulation results
  const calculateLoanResults = (params) => {
    const { amount, interestRate, term, paymentFrequency } = params;
    
    // Convert annual interest rate to periodic rate
    const periodsPerYear = paymentFrequency === 'monthly' ? 12 : 
                          paymentFrequency === 'biweekly' ? 26 : 
                          paymentFrequency === 'weekly' ? 52 : 12;
    
    const totalPeriods = term * periodsPerYear;
    const periodicRate = interestRate / 100 / periodsPerYear;
    
    // Calculate payment using amortization formula
    const payment = amount * (periodicRate * Math.pow(1 + periodicRate, totalPeriods)) / 
                   (Math.pow(1 + periodicRate, totalPeriods) - 1);
    
    // Calculate amortization schedule
    let balance = amount;
    let totalInterest = 0;
    let totalPrincipal = 0;
    
    const schedule = [];
    
    for (let period = 1; period <= totalPeriods; period++) {
      const interestPayment = balance * periodicRate;
      const principalPayment = payment - interestPayment;
      
      balance -= principalPayment;
      totalInterest += interestPayment;
      totalPrincipal += principalPayment;
      
      // Only store key periods for performance
      if (period === 1 || period === totalPeriods || period % 12 === 0) {
        schedule.push({
          period,
          payment: payment,
          principal: principalPayment,
          interest: interestPayment,
          totalInterest: totalInterest,
          remainingBalance: Math.max(0, balance)
        });
      }
    }
    
    return {
      payment: payment,
      totalPayments: payment * totalPeriods,
      totalInterest: totalInterest,
      totalPrincipal: amount,
      schedule: schedule
    };
  };
  
  // Calculate investment simulation results
  const calculateInvestmentResults = (params) => {
    const { initialAmount, monthlyContribution, annualReturn, years, compoundingFrequency } = params;
    
    // Convert annual return to periodic rate
    const periodsPerYear = compoundingFrequency === 'monthly' ? 12 : 
                          compoundingFrequency === 'quarterly' ? 4 : 
                          compoundingFrequency === 'daily' ? 365 : 1;
    
    const totalPeriods = years * periodsPerYear;
    const periodicRate = annualReturn / 100 / periodsPerYear;
    const periodicContribution = monthlyContribution * (12 / periodsPerYear);
    
    // Calculate growth
    let balance = initialAmount;
    let totalContributions = initialAmount;
    let totalEarnings = 0;
    
    const timeline = [];
    
    for (let period = 1; period <= totalPeriods; period++) {
      const earnings = balance * periodicRate;
      balance += earnings + periodicContribution;
      totalContributions += periodicContribution;
      totalEarnings += earnings;
      
      // Only store key periods for performance
      if (period % periodsPerYear === 0) {
        const year = period / periodsPerYear;
        timeline.push({
          year,
          balance,
          contributions: totalContributions,
          earnings: totalEarnings
        });
      }
    }
    
    return {
      finalBalance: balance,
      totalContributions,
      totalEarnings,
      timeline
    };
  };
  
  // Calculate retirement simulation results
  const calculateRetirementResults = (params) => {
    const { currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn, inflationRate } = params;
    
    const yearsToRetirement = retirementAge - currentAge;
    const periodicRate = annualReturn / 100 / 12;
    const inflationFactor = 1 + (inflationRate / 100);
    
    // Calculate retirement savings
    let balance = currentSavings;
    let totalContributions = currentSavings;
    let totalEarnings = 0;
    
    const timeline = [];
    
    // Pre-retirement growth phase
    for (let month = 1; month <= yearsToRetirement * 12; month++) {
      const earnings = balance * periodicRate;
      balance += earnings + monthlyContribution;
      totalContributions += monthlyContribution;
      totalEarnings += earnings;
      
      // Only store yearly data points
      if (month % 12 === 0) {
        const year = currentAge + (month / 12);
        timeline.push({
          age: year,
          balance,
          phase: 'accumulation',
          contributions: totalContributions,
          earnings: totalEarnings
        });
      }
    }
    
    // Calculate retirement income (4% rule)
    const annualWithdrawal = balance * 0.04;
    const monthlyWithdrawal = annualWithdrawal / 12;
    const inflationAdjustedWithdrawal = monthlyWithdrawal * Math.pow(inflationFactor, yearsToRetirement);
    
    // Post-retirement withdrawal phase (30 years)
    let retirementBalance = balance;
    
    for (let year = 1; year <= 30; year++) {
      const age = retirementAge + year;
      const yearlyWithdrawal = annualWithdrawal * Math.pow(inflationFactor, year);
      const yearlyEarnings = retirementBalance * (annualReturn / 100);
      
      retirementBalance = retirementBalance + yearlyEarnings - yearlyWithdrawal;
      
      if (retirementBalance < 0) retirementBalance = 0;
      
      timeline.push({
        age,
        balance: retirementBalance,
        phase: 'withdrawal',
        withdrawal: yearlyWithdrawal
      });
      
      // Stop if funds are depleted
      if (retirementBalance <= 0) break;
    }
    
    return {
      retirementSavings: balance,
      monthlyRetirementIncome: monthlyWithdrawal,
      inflationAdjustedMonthlyIncome: inflationAdjustedWithdrawal,
      yearsToRetirement,
      timeline
    };
  };
  
  // Handle parameter change
  const handleParamChange = (category, param, value) => {
    setSimulationParams(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [param]: value
      }
    }));
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Render loan simulator
  const renderLoanSimulator = () => {
    const params = simulationParams.loan;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loan Amount</label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <input
                type="number"
                value={params.amount}
                onChange={(e) => handleParamChange('loan', 'amount', Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="1000"
                max="1000000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
            <input
              type="number"
              value={params.interestRate}
              onChange={(e) => handleParamChange('loan', 'interestRate', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0.1"
              max="30"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Term (Years)</label>
            <input
              type="number"
              value={params.term}
              onChange={(e) => handleParamChange('loan', 'term', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1"
              max="30"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Payment Frequency</label>
            <select
              value={params.paymentFrequency}
              onChange={(e) => handleParamChange('loan', 'paymentFrequency', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="monthly">Monthly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        
        {results && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Monthly Payment</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.payment)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Interest</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.totalInterest)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.totalPayments)}</div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Payment Breakdown</h3>
              <div className="h-4 w-full flex rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${(results.totalPrincipal / results.totalPayments) * 100}%` }}
                  title="Principal"
                ></div>
                <div 
                  className="h-full bg-amber-500"
                  style={{ width: `${(results.totalInterest / results.totalPayments) * 100}%` }}
                  title="Interest"
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary mr-1"></div>
                  Principal: {formatCurrency(results.totalPrincipal)} ({Math.round((results.totalPrincipal / results.totalPayments) * 100)}%)
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-500 mr-1"></div>
                  Interest: {formatCurrency(results.totalInterest)} ({Math.round((results.totalInterest / results.totalPayments) * 100)}%)
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Amortization Schedule</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Period</th>
                      <th className="text-right py-2">Payment</th>
                      <th className="text-right py-2">Principal</th>
                      <th className="text-right py-2">Interest</th>
                      <th className="text-right py-2">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.schedule.map((period) => (
                      <tr key={period.period} className="border-b">
                        <td className="py-2">{period.period}</td>
                        <td className="text-right">{formatCurrency(period.payment)}</td>
                        <td className="text-right">{formatCurrency(period.principal)}</td>
                        <td className="text-right">{formatCurrency(period.interest)}</td>
                        <td className="text-right">{formatCurrency(period.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render investment simulator
  const renderInvestmentSimulator = () => {
    const params = simulationParams.investment;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Initial Investment</label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <input
                type="number"
                value={params.initialAmount}
                onChange={(e) => handleParamChange('investment', 'initialAmount', Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
                max="1000000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Contribution</label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <input
                type="number"
                value={params.monthlyContribution}
                onChange={(e) => handleParamChange('investment', 'monthlyContribution', Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
                max="10000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Annual Return (%)</label>
            <input
              type="number"
              value={params.annualReturn}
              onChange={(e) => handleParamChange('investment', 'annualReturn', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0.1"
              max="20"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Time Period (Years)</label>
            <input
              type="number"
              value={params.years}
              onChange={(e) => handleParamChange('investment', 'years', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1"
              max="50"
            />
          </div>
        </div>
        
        {results && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Final Balance</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.finalBalance)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Contributions</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.totalContributions)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.totalEarnings)}</div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Growth Breakdown</h3>
              <div className="h-4 w-full flex rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${(results.totalContributions / results.finalBalance) * 100}%` }}
                  title="Contributions"
                ></div>
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${(results.totalEarnings / results.finalBalance) * 100}%` }}
                  title="Earnings"
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary mr-1"></div>
                  Contributions: {formatCurrency(results.totalContributions)} ({Math.round((results.totalContributions / results.finalBalance) * 100)}%)
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 mr-1"></div>
                  Earnings: {formatCurrency(results.totalEarnings)} ({Math.round((results.totalEarnings / results.finalBalance) * 100)}%)
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Growth Timeline</h3>
              <div className="h-60 relative">
                <div className="absolute inset-0 flex items-end">
                  {results.timeline.map((year, index) => {
                    const height = (year.balance / results.finalBalance) * 100;
                    const contributionsHeight = (year.contributions / year.balance) * height;
                    const earningsHeight = height - contributionsHeight;
                    
                    return (
                      <div 
                        key={index} 
                        className="flex-1 flex flex-col-reverse"
                        title={`Year ${year.year}: ${formatCurrency(year.balance)}`}
                      >
                        <div 
                          className="w-full bg-primary"
                          style={{ height: `${contributionsHeight}%` }}
                        ></div>
                        <div 
                          className="w-full bg-green-500"
                          style={{ height: `${earningsHeight}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Year 1</span>
                <span>Year {params.years}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render retirement simulator
  const renderRetirementSimulator = () => {
    const params = simulationParams.retirement;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Age</label>
            <input
              type="number"
              value={params.currentAge}
              onChange={(e) => handleParamChange('retirement', 'currentAge', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="18"
              max="70"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Retirement Age</label>
            <input
              type="number"
              value={params.retirementAge}
              onChange={(e) => handleParamChange('retirement', 'retirementAge', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min={params.currentAge + 1}
              max="90"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Current Savings</label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <input
                type="number"
                value={params.currentSavings}
                onChange={(e) => handleParamChange('retirement', 'currentSavings', Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
                max="10000000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Monthly Contribution</label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <input
                type="number"
                value={params.monthlyContribution}
                onChange={(e) => handleParamChange('retirement', 'monthlyContribution', Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
                max="10000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Expected Annual Return (%)</label>
            <input
              type="number"
              value={params.annualReturn}
              onChange={(e) => handleParamChange('retirement', 'annualReturn', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0.1"
              max="15"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Expected Inflation Rate (%)</label>
            <input
              type="number"
              value={params.inflationRate}
              onChange={(e) => handleParamChange('retirement', 'inflationRate', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0"
              max="10"
              step="0.1"
            />
          </div>
        </div>
        
        {results && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Retirement Savings</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.retirementSavings)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    At age {params.retirementAge}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Monthly Income</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.monthlyRetirementIncome)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on 4% withdrawal rule
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Inflation-Adjusted Income</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.inflationAdjustedMonthlyIncome)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    In today's dollars
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Retirement Timeline</h3>
              <div className="h-60 relative">
                <div className="absolute inset-0 flex items-end">
                  {results.timeline.map((year, index) => {
                    const height = (year.balance / results.retirementSavings) * 100;
                    
                    return (
                      <div 
                        key={index} 
                        className="flex-1"
                        title={`Age ${year.age}: ${formatCurrency(year.balance)}`}
                      >
                        <div 
                          className={`w-full ${year.phase === 'accumulation' ? 'bg-blue-500' : 'bg-green-500'}`}
                          style={{ height: `${Math.max(0, height)}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Age {params.currentAge}</span>
                <span>Age {params.retirementAge + 30}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                  Accumulation Phase
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 mr-1"></div>
                  Withdrawal Phase
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Calculate career simulation results
  const calculateCareerResults = (params) => {
    const { field, startingSalary, annualGrowth, years, educationCost, workStyle } = params;
    
    // Career path data
    const careerPaths = {
      technology: {
        title: 'Technology',
        roles: ['Junior Developer', 'Developer', 'Senior Developer', 'Tech Lead', 'CTO'],
        salaryMultipliers: [1.0, 1.2, 1.5, 1.8, 2.2],
        skills: ['Programming', 'System Design', 'Problem Solving', 'Communication'],
        workStyles: {
          'full-time': { hoursPerWeek: 40, stabilityFactor: 1.0 },
          'freelance': { hoursPerWeek: 30, stabilityFactor: 0.7, rateMultiplier: 1.5 },
          'remote': { hoursPerWeek: 40, stabilityFactor: 0.9, benefitsFactor: 0.9 }
        }
      },
      healthcare: {
        title: 'Healthcare',
        roles: ['Nurse Assistant', 'Registered Nurse', 'Nurse Practitioner', 'Specialist', 'Medical Director'],
        salaryMultipliers: [1.0, 1.3, 1.7, 2.0, 2.5],
        skills: ['Patient Care', 'Medical Knowledge', 'Critical Thinking', 'Empathy'],
        workStyles: {
          'full-time': { hoursPerWeek: 40, stabilityFactor: 1.0 },
          'part-time': { hoursPerWeek: 24, stabilityFactor: 0.7 },
          'shift-work': { hoursPerWeek: 36, stabilityFactor: 0.8, overtimeMultiplier: 1.5 }
        }
      },
      finance: {
        title: 'Finance',
        roles: ['Financial Analyst', 'Senior Analyst', 'Manager', 'Director', 'CFO'],
        salaryMultipliers: [1.0, 1.25, 1.6, 2.1, 3.0],
        skills: ['Financial Analysis', 'Reporting', 'Forecasting', 'Strategic Planning'],
        workStyles: {
          'full-time': { hoursPerWeek: 45, stabilityFactor: 1.0 },
          'consultant': { hoursPerWeek: 50, stabilityFactor: 0.8, rateMultiplier: 1.7 }
        }
      },
      education: {
        title: 'Education',
        roles: ['Teaching Assistant', 'Teacher', 'Department Head', 'Principal', 'Superintendent'],
        salaryMultipliers: [1.0, 1.15, 1.4, 1.7, 2.0],
        skills: ['Teaching', 'Curriculum Development', 'Student Assessment', 'Leadership'],
        workStyles: {
          'full-time': { hoursPerWeek: 40, stabilityFactor: 1.0 },
          'part-time': { hoursPerWeek: 25, stabilityFactor: 0.7 },
          'summer-off': { hoursPerWeek: 45, stabilityFactor: 0.9, monthsPerYear: 9 }
        }
      },
      trades: {
        title: 'Skilled Trades',
        roles: ['Apprentice', 'Journeyman', 'Master', 'Contractor', 'Business Owner'],
        salaryMultipliers: [1.0, 1.4, 1.8, 2.2, 3.0],
        skills: ['Technical Skills', 'Problem Solving', 'Safety', 'Customer Service'],
        workStyles: {
          'full-time': { hoursPerWeek: 40, stabilityFactor: 1.0 },
          'gig': { hoursPerWeek: 35, stabilityFactor: 0.6, rateMultiplier: 1.4 },
          'self-employed': { hoursPerWeek: 50, stabilityFactor: 0.7, rateMultiplier: 2.0 }
        }
      }
    };
    
    const careerPath = careerPaths[field] || careerPaths.technology;
    const workStyleData = careerPath.workStyles[workStyle] || careerPath.workStyles['full-time'];
    
    // Calculate earnings over time
    const timeline = [];
    let totalEarnings = 0;
    let currentSalary = startingSalary;
    let currentRole = careerPath.roles[0];
    let roleIndex = 0;
    
    for (let year = 1; year <= years; year++) {
      // Update role based on career progression
      if (year > 1 && year % Math.ceil(years / careerPath.roles.length) === 0 && roleIndex < careerPath.roles.length - 1) {
        roleIndex++;
        currentRole = careerPath.roles[roleIndex];
      }
      
      // Calculate salary with growth and role multiplier
      const roleMultiplier = careerPath.salaryMultipliers[roleIndex];
      const yearSalary = currentSalary * roleMultiplier;
      
      // Apply work style adjustments
      let adjustedSalary = yearSalary;
      if (workStyle !== 'full-time') {
        if (workStyleData.rateMultiplier) {
          // For freelance/gig/consulting work
          adjustedSalary = (yearSalary / 2080) * workStyleData.rateMultiplier * (workStyleData.hoursPerWeek * 52);
        } else if (workStyleData.monthsPerYear) {
          // For seasonal work like teaching
          adjustedSalary = yearSalary * (workStyleData.monthsPerYear / 12);
        } else {
          // For part-time
          adjustedSalary = yearSalary * (workStyleData.hoursPerWeek / 40);
        }
      }
      
      // Apply annual growth for next year
      currentSalary = currentSalary * (1 + (annualGrowth / 100));
      
      // Add to total earnings
      totalEarnings += adjustedSalary;
      
      // Add to timeline
      timeline.push({
        year,
        role: currentRole,
        salary: adjustedSalary,
        cumulativeEarnings: totalEarnings
      });
    }
    
    // Calculate education ROI if applicable
    const educationROI = educationCost > 0 ? (totalEarnings / educationCost) : null;
    
    return {
      careerField: careerPath.title,
      workStyle,
      finalSalary: timeline[timeline.length - 1].salary,
      totalEarnings,
      educationROI,
      finalRole: timeline[timeline.length - 1].role,
      timeline,
      skills: careerPath.skills
    };
  };

  // Career modules
  const careerModules = [
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'trades', name: 'Skilled Trades', icon: '🔧' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Financial Simulator</h2>
        <p className="text-muted-foreground">Simulate different financial scenarios with real-world data</p>
      </div>
      
      {/* Data Source Toggle */}
      {userData && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Data Source:</span>
          <Button 
            variant={useRealData ? "outline" : "default"} 
            size="sm"
            onClick={() => setUseRealData(false)}
          >
            Sample Data
          </Button>
          <Button 
            variant={useRealData ? "default" : "outline"} 
            size="sm"
            onClick={() => setUseRealData(true)}
          >
            Your Financial Data
          </Button>
        </div>
      )}
      
      {/* Simulation Type Selection */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="financial">Financial Simulations</TabsTrigger>
          <TabsTrigger value="career">Career Simulations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={simulationType === 'loan' ? 'default' : 'outline'}
              onClick={() => setSimulationType('loan')}
            >
              Loan Calculator
            </Button>
            <Button
              variant={simulationType === 'investment' ? 'default' : 'outline'}
              onClick={() => setSimulationType('investment')}
            >
              Investment Growth
            </Button>
            <Button
              variant={simulationType === 'retirement' ? 'default' : 'outline'}
              onClick={() => setSimulationType('retirement')}
            >
              Retirement Planner
            </Button>
          </div>
          
          {/* Financial Simulation Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {simulationType === 'loan' ? 'Loan Calculator' : 
                 simulationType === 'investment' ? 'Investment Growth Calculator' : 
                 'Retirement Planner'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCalculating ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {simulationType === 'loan' && renderLoanSimulator()}
                  {simulationType === 'investment' && renderInvestmentSimulator()}
                  {simulationType === 'retirement' && renderRetirementSimulator()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="career" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {careerModules.map(career => (
              <Button
                key={career.id}
                variant={activeCareerModule === career.id ? 'default' : 'outline'}
                onClick={() => {
                  setActiveCareerModule(career.id);
                  setSimulationType('career');
                  setSimulationParams(prev => ({
                    ...prev,
                    career: {
                      ...prev.career,
                      field: career.id
                    }
                  }));
                }}
                className="flex items-center gap-2"
              >
                <span>{career.icon}</span>
                <span>{career.name}</span>
              </Button>
            ))}
          </div>
          
          {/* Career Simulation Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                Career Path: {careerModules.find(c => c.id === activeCareerModule)?.name || 'Technology'}
              </CardTitle>
              <CardDescription>
                Simulate income growth and career progression over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCalculating ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                renderCareerSimulator()
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

  // Render career simulator
  const renderCareerSimulator = () => {
    const params = simulationParams.career;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Starting Salary</label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <input
                type="number"
                value={params.startingSalary}
                onChange={(e) => handleParamChange('career', 'startingSalary', Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="20000"
                max="200000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Annual Growth Rate (%)</label>
            <input
              type="number"
              value={params.annualGrowth}
              onChange={(e) => handleParamChange('career', 'annualGrowth', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0"
              max="15"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Career Timeline (Years)</label>
            <input
              type="number"
              value={params.years}
              onChange={(e) => handleParamChange('career', 'years', Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="1"
              max="40"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Work Style</label>
            <select
              value={params.workStyle}
              onChange={(e) => handleParamChange('career', 'workStyle', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="full-time">Full-Time</option>
              <option value="freelance">Freelance</option>
              <option value="remote">Remote</option>
              <option value="part-time">Part-Time</option>
              <option value="gig">Gig Work</option>
              <option value="self-employed">Self-Employed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Education Cost</label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <input
                type="number"
                value={params.educationCost}
                onChange={(e) => handleParamChange('career', 'educationCost', Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="0"
                max="200000"
              />
            </div>
          </div>
        </div>
        
        {results && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Final Salary</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.finalSalary)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    As {results.finalRole}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Career Earnings</div>
                  <div className="text-2xl font-bold">{formatCurrency(results.totalEarnings)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Over {params.years} years
                  </div>
                </CardContent>
              </Card>
              
              {results.educationROI !== null && (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Education ROI</div>
                    <div className="text-2xl font-bold">{results.educationROI.toFixed(1)}x</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Return on education investment
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Career Progression</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Year</th>
                      <th className="text-left py-2">Role</th>
                      <th className="text-right py-2">Annual Salary</th>
                      <th className="text-right py-2">Cumulative Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.timeline.filter((_, index) => index % 5 === 0 || index === results.timeline.length - 1).map((year) => (
                      <tr key={year.year} className="border-b">
                        <td className="py-2">Year {year.year}</td>
                        <td className="py-2">{year.role}</td>
                        <td className="text-right">{formatCurrency(year.salary)}</td>
                        <td className="text-right">{formatCurrency(year.cumulativeEarnings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Salary Growth</h3>
              <div className="h-60 relative">
                <div className="absolute inset-0 flex items-end">
                  {results.timeline.map((year, index) => {
                    const height = (year.salary / results.finalSalary) * 100;
                    
                    return (
                      <div 
                        key={index} 
                        className="flex-1"
                        title={`Year ${year.year}: ${formatCurrency(year.salary)}`}
                      >
                        <div 
                          className="w-full bg-blue-500"
                          style={{ height: `${Math.max(0, height)}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Year 1</span>
                <span>Year {params.years}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Key Skills for {results.careerField}</h3>
              <div className="flex flex-wrap gap-2">
                {results.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default FinancialSimulator;