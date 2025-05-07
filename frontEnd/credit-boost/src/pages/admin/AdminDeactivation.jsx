import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserX, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Clock,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdminLayout from '@/components/Admin/AdminLayout';

/**
 * Admin Deactivation Component
 * This component provides the interface for Level 6 administrators to deactivate
 * other Level 6 administrators. It requires approval from other Level 6 administrators.
 */
const AdminDeactivation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [level6Admins, setLevel6Admins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [reason, setReason] = useState('');
  const [securityThreat, setSecurityThreat] = useState(false);
  const [deactivationRequestId, setDeactivationRequestId] = useState(null);
  const [deactivationStatus, setDeactivationStatus] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [securityKey, setSecurityKey] = useState('');
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Check authentication and load admin data
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
        
        // Load other Level 6 admins
        const adminsData = await fetch('/api/admin/level6-admins', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
          }
        }).then(res => {
          if (!res.ok) throw new Error('Failed to load admin data');
          return res.json();
        });
        
        // Filter out current admin
        setLevel6Admins(adminsData.filter(admin => admin.id !== adminData.id));
        
        // Load pending deactivation requests that need approval
        const pendingRequestsData = await fetch('/api/admin/deactivation/pending-requests', {
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
        console.error("Admin deactivation initialization error:", err);
        setError("Failed to load admin data. Please try again.");
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

  // Handle deactivation request submission
  const handleDeactivationSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      
      if (!selectedAdmin || !reason) {
        throw new Error('Admin selection and reason are required');
      }
      
      const response = await fetch('/api/admin/deactivation/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        },
        body: JSON.stringify({
          targetAdminId: selectedAdmin,
          reason,
          securityThreat
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Deactivation request failed');
      }
      
      // Store deactivation request ID
      setDeactivationRequestId(data.requestId);
      setDeactivationStatus(data.status);
      setPendingApprovals(data.pendingApprovals || 1);
      
      setSuccess('Deactivation request submitted successfully. Waiting for approval.');
      
      // Start polling for status updates
      const interval = setInterval(checkDeactivationStatus, 5000);
      setStatusCheckInterval(interval);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check deactivation status
  const checkDeactivationStatus = async () => {
    try {
      const response = await fetch(`/api/admin/deactivation/status/${deactivationRequestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        }
      });
      
      const data = await response.json();
      
      setDeactivationStatus(data.status);
      setPendingApprovals(data.pendingApprovals || 0);
      
      // If approved, show success message
      if (data.status === 'APPROVED') {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
        
        setSuccess('Admin deactivation approved! The admin account has been deactivated.');
        
        // Refresh admin list after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
      
      // If denied or expired, show error
      if (data.status === 'DENIED' || data.status === 'EXPIRED') {
        clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
        setError(`Deactivation request ${data.status.toLowerCase()}. Reason: ${data.message || 'No reason provided'}`);
        setDeactivationRequestId(null);
      }
    } catch (err) {
      console.error('Error checking deactivation status:', err);
    }
  };

  // Handle approval of a pending request
  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/deactivation/approve/${requestId}`, {
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
      
      const response = await fetch(`/api/admin/deactivation/deny/${requestId}`, {
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
        <h1 className="text-3xl font-bold mb-6">Admin Deactivation</h1>
        
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
          {/* Request Admin Deactivation */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className={`pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <CardTitle className={darkMode ? 'text-white' : ''}>
                Request Admin Deactivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeactivationSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Select Admin to Deactivate
                  </label>
                  <select
                    value={selectedAdmin}
                    onChange={(e) => setSelectedAdmin(e.target.value)}
                    className={`w-full p-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Admin</option>
                    {level6Admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.firstName} {admin.lastName} ({admin.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Reason for Deactivation
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
                    placeholder="Provide a detailed reason for deactivating this admin"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="security-threat"
                    checked={securityThreat}
                    onChange={() => setSecurityThreat(!securityThreat)}
                    className="mr-2"
                  />
                  <label htmlFor="security-threat" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    This admin poses a security threat
                  </label>
                </div>
                
                {securityThreat && (
                  <div className={`p-4 rounded-md ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className="flex items-center mb-2">
                      <AlertTriangle className={`h-4 w-4 mr-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                      <h4 className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                        Security Threat Alert
                      </h4>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Marking an admin as a security threat will immediately lock their account
                      upon approval and trigger a security audit. This action should only be
                      taken in serious situations.
                    </p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className={`w-full ${securityThreat ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    disabled={loading || deactivationRequestId || level6Admins.length === 0}
                  >
                    {loading ? 'Submitting...' : 'Request Deactivation'}
                  </Button>
                </div>
              </form>
              
              {deactivationRequestId && (
                <div className={`mt-4 p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Deactivation Request Status
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Request ID:
                    </span>
                    <span className={`text-sm font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {deactivationRequestId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status:
                    </span>
                    <span className={`text-sm font-medium ${
                      deactivationStatus === 'APPROVED' 
                        ? 'text-green-600' 
                        : deactivationStatus === 'DENIED' 
                          ? 'text-red-600' 
                          : deactivationStatus === 'EXPIRED' 
                            ? 'text-orange-600' 
                            : 'text-blue-600'
                    }`}>
                      {deactivationStatus}
                    </span>
                  </div>
                  {deactivationStatus === 'PENDING' && (
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
                Pending Deactivation Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <UserX className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>No pending deactivation requests</p>
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
                            {request.requestingAdminName} requested to deactivate {request.targetAdminName}
                          </h4>
                        </div>
                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.securityThreat 
                            ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                            : darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.securityThreat ? 'SECURITY THREAT' : 'STANDARD'}
                        </div>
                      </div>
                      
                      <div className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Reason:</strong> {request.reason}
                      </div>
                      
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

export default AdminDeactivation;