import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Database, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';

/**
 * Auto Connect Data Component
 * 
 * Automatically connects to various data sources without requiring manual uploads
 */
const AutoConnectData = ({ onDataConnected }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectedSources, setConnectedSources] = useState({
    bank: false,
    mpesa: false,
    creditBureau: false
  });
  const [connectionStatus, setConnectionStatus] = useState('idle'); // idle, connecting, success, error
  
  // Data sources to connect to
  const dataSources = [
    {
      id: 'bank',
      name: 'Bank Accounts',
      description: 'Connect to your bank accounts to import transaction history',
      icon: <Database className="h-5 w-5" />,
      status: connectedSources.bank ? 'connected' : 'disconnected'
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Connect to your M-Pesa account to import transaction history',
      icon: <Database className="h-5 w-5" />,
      status: connectedSources.mpesa ? 'connected' : 'disconnected'
    },
    {
      id: 'creditBureau',
      name: 'Credit Bureau',
      description: 'Connect to credit bureaus to import your credit history',
      icon: <Database className="h-5 w-5" />,
      status: connectedSources.creditBureau ? 'connected' : 'disconnected'
    }
  ];
  
  // Check if any sources are already connected (from localStorage)
  useEffect(() => {
    const savedSources = localStorage.getItem('connectedDataSources');
    if (savedSources) {
      setConnectedSources(JSON.parse(savedSources));
    }
  }, []);
  
  // Save connected sources to localStorage when they change
  useEffect(() => {
    localStorage.setItem('connectedDataSources', JSON.stringify(connectedSources));
  }, [connectedSources]);
  
  // Auto-connect to data sources
  const connectToDataSources = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    setConnectionProgress(0);
    
    // Simulate connection process
    try {
      // Connect to bank
      await simulateConnection('bank');
      setConnectionProgress(33);
      
      // Connect to M-Pesa
      await simulateConnection('mpesa');
      setConnectionProgress(66);
      
      // Connect to credit bureau
      await simulateConnection('creditBureau');
      setConnectionProgress(100);
      
      // Update connected sources
      setConnectedSources({
        bank: true,
        mpesa: true,
        creditBureau: true
      });
      
      setConnectionStatus('success');
      
      toast({
        title: "Data Connected Successfully",
        description: "Your financial data has been automatically connected and processed.",
      });
      
      // Notify parent component
      if (onDataConnected) {
        onDataConnected({
          bank: true,
          mpesa: true,
          creditBureau: true
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect to one or more data sources. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Simulate connection to a data source
  const simulateConnection = async (sourceId) => {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        setConnectedSources(prev => ({
          ...prev,
          [sourceId]: true
        }));
        resolve();
      }, 1500);
    });
  };
  
  // Check if all sources are connected
  const allSourcesConnected = Object.values(connectedSources).every(Boolean);
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Automatic Data Connection
        </CardTitle>
        <CardDescription>
          Connect to your financial data sources automatically for a seamless experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnecting ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Progress value={connectionProgress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Connecting to your financial data sources... {connectionProgress}%
            </p>
          </div>
        ) : connectionStatus === 'success' || allSourcesConnected ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800">All Data Sources Connected</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your financial data has been automatically connected and processed. You can now access your personalized insights and recommendations.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              {dataSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    {source.icon}
                    <div className="ml-3">
                      <p className="text-sm font-medium">{source.name}</p>
                      <p className="text-xs text-gray-500">{source.description}</p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full" onClick={connectToDataSources}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        ) : connectionStatus === 'error' ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Connection Failed</h3>
                <p className="text-sm text-red-700 mt-1">
                  We couldn't connect to one or more of your data sources. Please try again or connect manually.
                </p>
              </div>
            </div>
            
            <Button className="w-full" onClick={connectToDataSources}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Connect to your financial data sources with a single click. This will automatically import your transaction history, credit information, and more.
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Why Connect Automatically?</h3>
              <ul className="mt-2 space-y-1">
                <li className="text-sm text-blue-700 flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />
                  <span>No need to manually upload statements</span>
                </li>
                <li className="text-sm text-blue-700 flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />
                  <span>Real-time updates to your financial data</span>
                </li>
                <li className="text-sm text-blue-700 flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />
                  <span>Secure, read-only access to your accounts</span>
                </li>
                <li className="text-sm text-blue-700 flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-1 mt-0.5" />
                  <span>More accurate credit score and recommendations</span>
                </li>
              </ul>
            </div>
            
            <Button className="w-full" onClick={connectToDataSources}>
              Connect Data Sources
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoConnectData;