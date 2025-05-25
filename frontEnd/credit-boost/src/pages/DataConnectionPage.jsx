import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';
import AutoConnectData from '@/components/AutoConnectData';
import DataUploadCenter from '@/components/DataUploadCenter';

/**
 * Data Connection Page
 * 
 * A page that allows users to connect their financial data either
 * automatically or manually through uploads
 */
const DataConnectionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('auto');
  const [dataConnected, setDataConnected] = useState(false);
  
  // Handle data connection completion
  const handleDataConnected = (data) => {
    setDataConnected(true);
  };
  
  // Navigate to financial dashboard
  const goToFinancialDashboard = () => {
    navigate('/financial-dashboard');
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Connect Your Financial Data</h1>
            <p className="text-gray-500">
              Connect your financial data to get personalized insights and recommendations
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="auto">Automatic Connection</TabsTrigger>
            <TabsTrigger value="manual">Manual Upload</TabsTrigger>
          </TabsList>
          
          {/* Automatic Connection Tab */}
          <TabsContent value="auto">
            <AutoConnectData onDataConnected={handleDataConnected} />
          </TabsContent>
          
          {/* Manual Upload Tab */}
          <TabsContent value="manual">
            <DataUploadCenter onDataUploaded={handleDataConnected} />
          </TabsContent>
        </Tabs>
        
        {dataConnected && (
          <div className="flex justify-center mt-6">
            <Button size="lg" onClick={goToFinancialDashboard}>
              View Your Financial Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default DataConnectionPage;