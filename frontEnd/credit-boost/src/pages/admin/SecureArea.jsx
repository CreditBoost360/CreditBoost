import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Lock,
  Clock,
  FileText,
  Download,
  Database,
  Key
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminLayout from '@/components/Admin/AdminLayout';

/**
 * Secure Area Component
 * This component provides access to highly sensitive system functions
 * that are only available to Level 6 administrators who have successfully
 * passed the bridge authentication.
 */
const SecureArea = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [bridgeToken, setBridgeToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [secureActions, setSecureActions] = useState([
    {
      id: 'action-1',
      title: 'System Master Key Rotation',
      description: 'Rotate the system master encryption keys',
      icon: <Key size={24} />,
      color: 'blue',
      dangerLevel: 'high',
      requiresApproval: true
    },
    {
      id: 'action-2',
      title: 'Database Backup Export',
      description: 'Export encrypted database backup',
      icon: <Database size={24} />,
      color: 'green',
      dangerLevel: 'medium',
      requiresApproval: false
    },
    {
      id: 'action-3',
      title: 'Security Audit Report',
      description: 'Generate comprehensive security audit report',
      icon: <FileText size={24} />,
      color: 'purple',
      dangerLevel: 'low',
      requiresApproval: false
    },
    {
      id: 'action-4',
      title: 'Emergency System Lockdown',
      description: 'Initiate emergency system lockdown protocol',
      icon: <Lock size={24} />,
      color: 'red',
      dangerLevel: 'critical',
      requiresApproval: true
    }
  ]);

  // Check bridge authentication on mount
  useEffect(() => {
    const verifyBridgeAccess = async () => {
      try {
        setLoading(true);
        
        // Get bridge token from localStorage
        const token = localStorage.getItem('admin-bridge-token');
        if (!token) {
          throw new Error('No bridge access token found');
        }
        
        setBridgeToken(token);
        
        // Verify bridge token
        const response = await fetch('/api/admin/bridge/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin-token')}`,
            'Bridge-Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Bridge access verification failed');
        }
        
        const data = await response.json();
        
        // Set admin user data
        setAdminUser(data.admin);
        
        // Set token expiry
        setTokenExpiry(new Date(data.expiry));
        
        setLoading(false);
      } catch (err) {
        console.error("Bridge access verification error:", err);
        setError("Bridge access verification failed. Please request bridge access again.");
        setLoading(false);
        
        // Redirect to bridge access page after a short delay
        setTimeout(() => {
          navigate('/admin/level6-bridge');
        }, 3000);
      }
    };
    
    verifyBridgeAccess();
    
    // Check for preferred theme
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
    
    // Set up token expiry check
    const expiryInterval = setInterval(() => {
      if (tokenExpiry && new Date() > tokenExpiry) {
        setError("Bridge access token has expired. Please request bridge access again.");
        
        // Redirect to bridge access page after a short delay
        setTimeout(() => {
          navigate('/admin/level6-bridge');
        }, 3000);
        
        clearInterval(expiryInterval);
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(expiryInterval);
    };
  }, [navigate, tokenExpiry]);

  // Format time remaining
  const formatTimeRemaining = () => {
    if (!tokenExpiry) return 'Unknown';
    
    const now = new Date();
    const diff = tokenExpiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  // Handle secure action
  const handleSecureAction = async (action) => {
    try {
      setLoading(true);
      
      // If action requires approval, show confirmation dialog
      if (action.requiresApproval) {
        const confirmed = window.confirm(
          `This action requires additional approval. Are you sure you want to request approval for: ${action.title}?`
        );
        
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }
      
      // Execute secure action
      const response = await fetch(`/api/admin/secure-action/${action.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`,
          'Bridge-Authorization': `Bearer ${bridgeToken}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to execute secure action');
      }
      
      setSuccess(`Action "${action.title}" ${action.requiresApproval ? 'requested' : 'executed'} successfully`);
      
      setLoading(false);
    } catch (err) {
      console.error("Secure action error:", err);
      setError(err.message || "Failed to execute secure action");
      setLoading(false);
    }
  };

  // Get color class based on danger level
  const getDangerLevelClass = (dangerLevel, isDark) => {
    switch (dangerLevel) {
      case 'critical':
        return isDark ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return isDark ? 'bg-orange-900/30 text-orange-400 border-orange-900/50' : 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50' : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return isDark ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-green-100 text-green-800 border-green-200';
      default:
        return isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get color class based on action color
  const getActionColorClass = (color, isDark) => {
    switch (color) {
      case 'blue':
        return isDark ? 'bg-blue-900/20 border-blue-900/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700';
      case 'green':
        return isDark ? 'bg-green-900/20 border-green-900/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700';
      case 'purple':
        return isDark ? 'bg-purple-900/20 border-purple-900/30 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700';
      case 'red':
        return isDark ? 'bg-red-900/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700';
      default:
        return isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <AdminLayout>
      <div className={`container mx-auto px-4 py-6 ${darkMode ? 'text-white' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Secure Area</h1>
            <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Level 6 restricted access zone
            </p>
          </div>
          
          <div className={`mt-4 md:mt-0 p-3 rounded-md border ${
            tokenExpiry && new Date() > tokenExpiry
              ? darkMode ? 'bg-red-900/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
              : darkMode ? 'bg-blue-900/20 border-blue-900/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center">
              <Clock size={16} className="mr-2" />
              <span className="text-sm font-medium">Bridge Access: {formatTimeRemaining()}</span>
            </div>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}
        
        <div className={`p-4 mb-6 rounded-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-start">
            <Shield className={`h-6 w-6 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Level 6 Secure Area
              </h2>
              <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This area provides access to critical system functions that require Level 6 clearance.
                All actions performed here are logged with your unique identifier and require bridge authentication.
              </p>
              <div className={`mt-3 p-2 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center">
                  <AlertTriangle className={`h-4 w-4 mr-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <p className={`text-xs font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Security Notice
                  </p>
                </div>
                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your actions in this area are being recorded and audited. Unauthorized access or misuse
                  of these functions is strictly prohibited and may result in immediate account deactivation.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secureActions.map((action) => (
            <Card 
              key={action.id} 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : ''} overflow-hidden`}
            >
              <div className={`h-2 ${getDangerLevelClass(action.dangerLevel, darkMode)}`}></div>
              <CardHeader className={`pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <CardTitle className={`flex items-center ${darkMode ? 'text-white' : ''}`}>
                  <div className={`p-2 rounded-md mr-3 ${getActionColorClass(action.color, darkMode)}`}>
                    {action.icon}
                  </div>
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {action.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getDangerLevelClass(action.dangerLevel, darkMode)}`}>
                    {action.dangerLevel.toUpperCase()} RISK
                  </div>
                  
                  {action.requiresApproval && (
                    <div className={`flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Shield size={12} className="mr-1" />
                      Requires Additional Approval
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleSecureAction(action)}
                  className={`w-full ${
                    action.dangerLevel === 'critical' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Execute Action'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SecureArea;