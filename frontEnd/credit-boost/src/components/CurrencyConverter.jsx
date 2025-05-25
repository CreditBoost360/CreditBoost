import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Currency Converter Component
 * Provides real-time currency conversion based on current exchange rates
 */
const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [exchangeRates, setExchangeRates] = useState({});
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Popular currencies
  const popularCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' }
  ];
  
  // Fetch exchange rates
  useEffect(() => {
    fetchExchangeRates();
  }, []);
  
  // Update converted amount when inputs change
  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);
  
  // Fetch exchange rates from API
  const fetchExchangeRates = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an actual API
      // For demo purposes, we'll use mock data
      const mockRates = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.82,
        CAD: 1.36,
        AUD: 1.52,
        CNY: 7.21,
        INR: 83.12,
        KES: 129.50,
        NGN: 1550.00,
        ZAR: 18.65,
        BRL: 5.05,
        MXN: 16.75
      };
      
      setExchangeRates(mockRates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Convert currency based on current rates
  const convertCurrency = () => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      setConvertedAmount(null);
      return;
    }
    
    // Convert to USD first (base currency), then to target currency
    const amountInUSD = amount / exchangeRates[fromCurrency];
    const result = amountInUSD * exchangeRates[toCurrency];
    
    setConvertedAmount(result);
  };
  
  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setAmount(value);
    }
  };
  
  // Swap currencies
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  // Get currency details
  const getCurrencyDetails = (code) => {
    return popularCurrencies.find(currency => currency.code === code) || { 
      code, 
      name: code, 
      symbol: '', 
      flag: '🏳️' 
    };
  };
  
  // Format currency for display
  const formatCurrency = (value, currencyCode) => {
    const currency = getCurrencyDetails(currencyCode);
    return `${currency.symbol} ${Number(value).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Currency Converter</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchExchangeRates}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Refresh Rates'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && Object.keys(exchangeRates).length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="text-lg"
              />
            </div>
            
            {/* Currency Selection */}
            <div className="grid grid-cols-5 gap-2 items-center">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">From</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {popularCurrencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSwapCurrencies}
                  className="rounded-full p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4"></path>
                    <path d="M17 8v12m0 0l4-4m-4 4l-4-4"></path>
                  </svg>
                </Button>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {popularCurrencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Conversion Result */}
            <div className="bg-muted p-4 rounded-md">
              <div className="text-sm text-muted-foreground mb-1">Converted Amount</div>
              <div className="text-2xl font-bold">
                {convertedAmount !== null ? (
                  <>
                    {formatCurrency(amount, fromCurrency)} = {formatCurrency(convertedAmount, toCurrency)}
                  </>
                ) : (
                  'Unable to convert'
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                1 {fromCurrency} = {(exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)} {toCurrency}
              </div>
            </div>
            
            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-right">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            )}
            
            {/* Popular Conversions */}
            <div>
              <h3 className="text-sm font-medium mb-2">Popular Conversions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['EUR', 'GBP', 'JPY', 'CAD'].map(code => {
                  if (code === fromCurrency) return null;
                  
                  const rate = exchangeRates[code] / exchangeRates[fromCurrency];
                  return (
                    <div key={code} className="flex justify-between items-center p-2 border rounded-md">
                      <div className="flex items-center gap-1">
                        <span>{getCurrencyDetails(fromCurrency).flag}</span>
                        <span>1 {fromCurrency}</span>
                      </div>
                      <div>=</div>
                      <div className="flex items-center gap-1">
                        <span>{getCurrencyDetails(code).flag}</span>
                        <span>{rate.toFixed(4)} {code}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;