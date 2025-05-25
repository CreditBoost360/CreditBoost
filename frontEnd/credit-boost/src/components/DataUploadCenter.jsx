import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';

/**
 * Data Upload Center Component
 * 
 * A comprehensive interface for uploading various financial data sources
 * with status tracking and data persistence
 */
const DataUploadCenter = ({ onDataUploaded }) => {
  const [activeTab, setActiveTab] = useState('bank');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    bank: [],
    mpesa: [],
    creditBureau: [],
    manual: []
  });
  const [lastUpdated, setLastUpdated] = useState({
    bank: null,
    mpesa: null,
    creditBureau: null,
    manual: null
  });
  const { toast } = useToast();

  // Load previously uploaded files from localStorage
  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem('uploadedFinancialData');
      const savedDates = localStorage.getItem('lastDataUpdates');
      
      if (savedFiles) {
        setUploadedFiles(JSON.parse(savedFiles));
      }
      
      if (savedDates) {
        setLastUpdated(JSON.parse(savedDates));
      }
    } catch (error) {
      console.error('Error loading saved upload data:', error);
    }
  }, []);

  // Save uploaded files to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('uploadedFinancialData', JSON.stringify(uploadedFiles));
      localStorage.setItem('lastDataUpdates', JSON.stringify(lastUpdated));
    } catch (error) {
      console.error('Error saving upload data:', error);
    }
  }, [uploadedFiles, lastUpdated]);

  const handleFileChange = (e, type) => {
    if (!e.target.files.length) return;
    
    const files = Array.from(e.target.files);
    
    // Start upload simulation
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      // Update uploaded files
      setUploadedFiles(prev => ({
        ...prev,
        [type]: [
          ...prev[type],
          ...files.map(file => ({
            id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString()
          }))
        ]
      }));
      
      // Update last updated date
      setLastUpdated(prev => ({
        ...prev,
        [type]: new Date().toISOString()
      }));
      
      // Show success toast
      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully.`,
      });
      
      // Reset upload state
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        
        // Notify parent component
        if (onDataUploaded) {
          onDataUploaded({
            type,
            files: files.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type
            }))
          });
        }
      }, 500);
    }, 3000);
  };

  const handleRemoveFile = (type, fileId) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: prev[type].filter(file => file.id !== fileId)
    }));
    
    toast({
      title: "File Removed",
      description: "The file has been removed from your uploads."
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getDataFreshness = (dateString) => {
    if (!dateString) return { status: 'none', label: 'No Data' };
    
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 7) return { status: 'fresh', label: 'Up to date' };
    if (daysDiff < 30) return { status: 'warning', label: 'Getting old' };
    return { status: 'stale', label: 'Outdated' };
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Financial Data Upload Center
        </CardTitle>
        <CardDescription>
          Upload your financial data to get personalized insights and recommendations.
          Your data is securely stored and only needs to be uploaded once.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="bank">Bank Statements</TabsTrigger>
            <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
            <TabsTrigger value="creditBureau">Credit Bureau</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          {/* Bank Statements Tab */}
          <TabsContent value="bank">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Bank Statement Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your bank statements in PDF or CSV format
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(lastUpdated.bank)}
                  </p>
                  {lastUpdated.bank && (
                    <div className="flex items-center mt-1">
                      {getDataFreshness(lastUpdated.bank).status === 'fresh' && (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {getDataFreshness(lastUpdated.bank).status === 'warning' && (
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      {getDataFreshness(lastUpdated.bank).status === 'stale' && (
                        <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${
                        getDataFreshness(lastUpdated.bank).status === 'fresh' ? 'text-green-600' :
                        getDataFreshness(lastUpdated.bank).status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getDataFreshness(lastUpdated.bank).label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {isUploading && activeTab === 'bank' ? (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="mb-2 font-medium">Drag and drop your bank statements here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF, CSV, and Excel files
                  </p>
                  <div className="relative">
                    <Input
                      type="file"
                      id="bank-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf,.csv,.xlsx,.xls"
                      multiple
                      onChange={(e) => handleFileChange(e, 'bank')}
                    />
                    <Button type="button">
                      <Upload className="h-4 w-4 mr-2" />
                      Select Files
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Uploaded Files List */}
              {uploadedFiles.bank.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.bank.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile('bank', file.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* M-Pesa Tab */}
          <TabsContent value="mpesa">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">M-Pesa Statement Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your M-Pesa statements in PDF or CSV format
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(lastUpdated.mpesa)}
                  </p>
                  {lastUpdated.mpesa && (
                    <div className="flex items-center mt-1">
                      {getDataFreshness(lastUpdated.mpesa).status === 'fresh' && (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {getDataFreshness(lastUpdated.mpesa).status === 'warning' && (
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      {getDataFreshness(lastUpdated.mpesa).status === 'stale' && (
                        <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${
                        getDataFreshness(lastUpdated.mpesa).status === 'fresh' ? 'text-green-600' :
                        getDataFreshness(lastUpdated.mpesa).status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getDataFreshness(lastUpdated.mpesa).label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {isUploading && activeTab === 'mpesa' ? (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="mb-2 font-medium">Drag and drop your M-Pesa statements here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF, CSV, and Excel files
                  </p>
                  <div className="relative">
                    <Input
                      type="file"
                      id="mpesa-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf,.csv,.xlsx,.xls"
                      multiple
                      onChange={(e) => handleFileChange(e, 'mpesa')}
                    />
                    <Button type="button">
                      <Upload className="h-4 w-4 mr-2" />
                      Select Files
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Uploaded Files List */}
              {uploadedFiles.mpesa.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.mpesa.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile('mpesa', file.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Credit Bureau Tab */}
          <TabsContent value="creditBureau">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Credit Bureau Report Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your credit reports from TransUnion, Experian, or Equifax
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(lastUpdated.creditBureau)}
                  </p>
                  {lastUpdated.creditBureau && (
                    <div className="flex items-center mt-1">
                      {getDataFreshness(lastUpdated.creditBureau).status === 'fresh' && (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {getDataFreshness(lastUpdated.creditBureau).status === 'warning' && (
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      {getDataFreshness(lastUpdated.creditBureau).status === 'stale' && (
                        <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${
                        getDataFreshness(lastUpdated.creditBureau).status === 'fresh' ? 'text-green-600' :
                        getDataFreshness(lastUpdated.creditBureau).status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getDataFreshness(lastUpdated.creditBureau).label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {isUploading && activeTab === 'creditBureau' ? (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="mb-2 font-medium">Drag and drop your credit reports here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF and CSV files
                  </p>
                  <div className="relative">
                    <Input
                      type="file"
                      id="credit-upload"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".pdf,.csv"
                      multiple
                      onChange={(e) => handleFileChange(e, 'creditBureau')}
                    />
                    <Button type="button">
                      <Upload className="h-4 w-4 mr-2" />
                      Select Files
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Uploaded Files List */}
              {uploadedFiles.creditBureau.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.creditBureau.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile('creditBureau', file.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Manual Entry Tab */}
          <TabsContent value="manual">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Manual Financial Data Entry</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your financial information manually
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(lastUpdated.manual)}
                  </p>
                  {lastUpdated.manual && (
                    <div className="flex items-center mt-1">
                      {getDataFreshness(lastUpdated.manual).status === 'fresh' && (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {getDataFreshness(lastUpdated.manual).status === 'warning' && (
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      {getDataFreshness(lastUpdated.manual).status === 'stale' && (
                        <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${
                        getDataFreshness(lastUpdated.manual).status === 'fresh' ? 'text-green-600' :
                        getDataFreshness(lastUpdated.manual).status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {getDataFreshness(lastUpdated.manual).label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-income">Monthly Income (KES)</Label>
                  <Input id="monthly-income" type="number" placeholder="e.g. 50000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly-expenses">Monthly Expenses (KES)</Label>
                  <Input id="monthly-expenses" type="number" placeholder="e.g. 30000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings">Total Savings (KES)</Label>
                  <Input id="savings" type="number" placeholder="e.g. 100000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debt">Total Debt (KES)</Label>
                  <Input id="debt" type="number" placeholder="e.g. 200000" />
                </div>
              </div>
              
              <Button className="w-full mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Financial Information
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Data Processing Status */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Data Processing Status</h3>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Bank Data</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                uploadedFiles.bank.length > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {uploadedFiles.bank.length > 0 ? 'Processed' : 'No Data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">M-Pesa Data</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                uploadedFiles.mpesa.length > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {uploadedFiles.mpesa.length > 0 ? 'Processed' : 'No Data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Credit Bureau Data</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                uploadedFiles.creditBureau.length > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {uploadedFiles.creditBureau.length > 0 ? 'Processed' : 'No Data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Manual Data</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                lastUpdated.manual 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {lastUpdated.manual ? 'Processed' : 'No Data'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataUploadCenter;