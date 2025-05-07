import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminLayout from '@/components/Admin/AdminLayout';

/**
 * Level 6 Bridge Access Component
 * This component provides the interface for Level 6 administrators to access
 * the secure bridge system. It requires multi-factor authentication and
 * approval from other Level 6 administrators.
 */
const Level6Bridge = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [accessPoint, setAccessPoint] = useState('');
  const [reason, setReason] = useState('');
  const [bridgeRequestId, setBridgeRequestId] = useState(null);
  const [bridgeStatus, setBridgeStatus] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [securityKey, setSecurityKey] = useState('');
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [emergencyAccess, setEmergencyAccess] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);

  // Check authentication and load bridge data
  useEffect(() => {
    const verifyAdminAndLoadData = async () => {
      try {
        setLoading(true);
        
        // Verify admin authentication and level 6 access
        const adminData = await fetch('/api/admin/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
          }
        }).then(res => {
          if (!res.ok) throw new Error('Authentication failed');
          return res.json();
        });
        
        if (adminData.accessLevel !== 6) {
          navigate('/admin/unauthorized');
          return;
        }
        
        setAdminUser(adminData);
        
        // Load pending bridge access requests that need approval
        const pendingRequestsData = await fetch('/api/admin/bridge/pending-requests', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
          }
        }).then(res => {
          if (!res.ok) throw new Error('Failed to load pending requests');
          return res.json();
        });
        
        setPendingRequests(pendingRequestsData);
        
        setLoading(false);
      } catch (err) {
        console.error("Bridge initialization error:", err);
        setError("Failed to load bridge access. Please try again.");
        setLoading(false);
      }
    };
    
    verifyAdminAndLoadData();
    
    // Check for preferred theme
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
    
    return () => {
      // Clear any intervals on unmount
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [navigate]);

  // Handle bridge access request submission
  const handleBridgeAccessSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      
      if (!accessPoint || !reason) {
        throw new Error('Access point and reason are required');
      }
      
      const response = await fetch('/api/admin/bridge/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        },
        body: JSON.stringify({
          accessPoint: parseInt(accessPoint),
          reason,
          emergencyAccess,
          emergencyReason: emergencyAccess ? emergencyReason : undefined
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Bridge access request failed');
      }
      
      // Store bridge request ID
      setBridgeRequestId(data.requestId);
      setBridgeStatus(data.status);
      setPendingApprovals(data.pendingApprovals || 2);
      
      setSuccess('Bridge access request submitted successfully. Waiting for approval.');
      
      // Start polling for status updates
      const interval = setInterval(checkBridgeStatus, 5000);
      setStatusCheckInterval(interval);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check bridge access status
  const checkBridgeStatus = async () => {
    try {
      const response = await fetch(`/api/admin/bridge/status/${bridgeRequestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        }
      });
      
      const data = await response.json();
      
      setBridgeStatus(data.status);
      setPendingApprovals(data.pendingApprovals || 0);
      
      // If approved, proceed to bridge access
      if (data.status === 'APPROVED') {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
        
        // Store bridge token
        localStorage.setItem('admin-bridge-token', data.bridgeToken);
        
        setSuccess('Bridge access approved! Redirecting to secure area...');
        
        // Redirect to secure area after a short delay
        setTimeout(() => {
          navigate('/admin/secure-area');
        }, 2000);
      }
      
      // If denied or expired, show error
      if (data.status === 'DENIED' || data.status === 'EXPIRED') {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
        setError(`Bridge access ${data.status.toLowerCase()}. Reason: ${data.message || 'No reason provided'}`);
        setBridgeRequestId(null);
      }
    } catch (err) {
      console.error('Error checking bridge status:', err);
    }
  };

  // Handle approval of a pending request
  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/bridge/approve/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        },
        body: JSON.stringify({
          securityKey
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve request');
      }
      
      setSuccess('Request approved successfully');
      
      // Remove the approved request from the list
      setPendingRequests(pendingRequests.filter(req => req.requestId !== requestId));
      
      // Clear security key
      setSecurityKey('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle denial of a pending request
  const handleDenyRequest = async (requestId) => {
    try {
      setLoading(true);
      
      const denialReason = prompt('Please provide a reason for denying this request:');
      if (!denialReason) {
        setLoading(false);
        return; // User cancelled
      }
      
      const response = await fetch(`/api/admin/bridge/deny/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        },
        body: JSON.stringify({
          reason: denialReason
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to deny request');
      }
      
      setSuccess('Request denied successfully');
      
      // Remove the denied request from the list
      setPendingRequests(pendingRequests.filter(req => req.requestId !== requestId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <AdminLayout>
      <div className={`container mx-auto px-4 py-6 ${darkMode ? 'text-white' : ''}`}>
        <h1 className="text-3xl font-bold mb-6">Level 6 Bridge Access</h1>
        
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Bridge Access */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className={`pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <CardTitle className={darkMode ? 'text-white' : ''}>
                Request Bridge Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBridgeAccessSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Bridge Access Point
                  </label>
                  <select
                    value={accessPoint}
                    onChange={(e) => setAccessPoint(e.target.value)}
                    className={`w-full p-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Access Point</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Access Point {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Reason for Access
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={`w-full p-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                    rows={3}
                    required
                    placeholder="Provide a detailed reason for requesting bridge access"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emergency-access"
                    checked={emergencyAccess}
                    onChange={() => {
                      setEmergencyAccess(!emergencyAccess);
                      setShowEmergencyForm(!emergencyAccess);
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="emergency-access" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Request Emergency Access
                  </label>
                </div>
                
                {showEmergencyForm && (
                  <div className={`p-4 rounded-md ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <h4 className={`font-medium mb-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                      Emergency Access Request
                    </h4>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Emergency access should only be requested in critical situations.
                      This will be logged and audited.
                    </p>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Emergency Reason
                      </label>
                      <textarea
                        value={emergencyReason}
                        onChange={(e) => setEmergencyReason(e.target.value)}
                        className={`w-full p-2 border rounded-md ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300'
                        }`}
                        rows={2}
                        required={emergencyAccess}
                        placeholder="Describe the emergency situation"
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className={`w-full ${emergencyAccess ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    disabled={loading || bridgeRequestId}
                  >
                    {loading ? 'Submitting...' : 'Request Bridge Access'}
                  </Button>
                </div>
              </form>
              
              {bridgeRequestId && (
                <div className={`mt-4 p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Bridge Access Request Status
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Request ID:
                    </span>
                    <span className={`text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {bridgeRequestId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status:
                    </span>
                    <span className={`text-sm font-medium ${
                      bridgeStatus === 'APPROVED' 
                        ? 'text-green-600' 
                        : bridgeStatus === 'DENIED' 
                          ? 'text-red-600' 
                          : bridgeStatus === 'EXPIRED' 
                            ? 'text-orange-600' 
                            : 'text-blue-600'
                    }`}>
                      {bridgeStatus}
                    </span>
                  </div>
                  {bridgeStatus === 'PENDING' && (
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Pending Approvals:
                      </span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {pendingApprovals}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pending Approval Requests */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className={`pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <CardTitle className={darkMode ? 'text-white' : ''}>
                Pending Approval Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Shield className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>No pending bridge access requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div 
                      key={request.requestId} 
                      className={`p-4 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {request.adminName}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Access Point: {request.accessPoint}
                          </p>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.emergencyAccess 
                            ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                            : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.emergencyAccess ? 'EMERGENCY' : 'STANDARD'}
                        </div>
                      </div>
                      
                      <div className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Reason:</strong> {request.reason}
                      </div>
                      
                      {request.emergencyAccess && (
                        <div className={`text-sm mb-3 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                          <strong>Emergency Reason:</strong> {request.emergencyReason}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs mb-4">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          Requested at: {formatDate(request.requestTime)}
                        </span>
                        <span className={`font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ID: {request.requestId.substring(0, 8)}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="mb-3">
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            Your Security Key
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={securityKey}
                              onChange={(e) => setSecurityKey(e.target.value)}
                              className={`w-full p-2 border rounded-md ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300'
                              }`}
                              placeholder="Enter your security key"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                              {showPassword ? (
                                <EyeOff size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                              ) : (
                                <Eye size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleApproveRequest(request.requestId)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={loading || !securityKey}
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleDenyRequest(request.requestId)}
                            variant="destructive"
                            className="flex-1"
                            disabled={loading}
                          >
                            Deny
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Level6Bridge;