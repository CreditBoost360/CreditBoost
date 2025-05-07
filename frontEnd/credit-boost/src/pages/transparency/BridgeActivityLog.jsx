import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Clock, Search, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

/**
 * BridgeActivityLog Component
 * Displays a log of all Level 6 bridge access activities
 * for transparency to regular users
 */
const BridgeActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  
  useEffect(() => {
    // Fetch bridge activities
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockActivities = [
          {
            id: 'bridge-001',
            adminId: 'admin-9001',
            adminIdentifier: 'L6-A1',
            accessPoint: 5,
            reason: 'Emergency security patch deployment',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            approved: true,
            approvedBy: ['admin-9002', 'admin-9003'],
            approvalTime: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString(),
            emergency: true,
            cryptographicProof: 'e7c6f8a2d5b3c9e1a4f7d2b5e8c3a9f6b2d5e8a3c9f6b2d5e8c3a9f6',
            duration: '15 minutes'
          },
          {
            id: 'bridge-002',
            adminId: 'admin-9002',
            adminIdentifier: 'L6-A2',
            accessPoint: 8,
            reason: 'Quarterly security audit of encryption keys',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
            approved: true,
            approvedBy: ['admin-9001', 'admin-9003'],
            approvalTime: new Date(Date.now() - 11.8 * 60 * 60 * 1000).toISOString(),
            emergency: false,
            cryptographicProof: 'a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5',
            duration: '45 minutes'
          },
          {
            id: 'bridge-003',
            adminId: 'admin-9003',
            adminIdentifier: 'L6-A3',
            accessPoint: 3,
            reason: 'Database master key rotation',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            approved: true,
            approvedBy: ['admin-9001', 'admin-9002'],
            approvalTime: new Date(Date.now() - 1.98 * 24 * 60 * 60 * 1000).toISOString(),
            emergency: false,
            cryptographicProof: 'b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3',
            duration: '30 minutes'
          },
          {
            id: 'bridge-004',
            adminId: 'admin-9001',
            adminIdentifier: 'L6-A1',
            accessPoint: 11,
            reason: 'Investigate potential security breach',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            approved: true,
            approvedBy: ['admin-9002', 'admin-9003'],
            approvalTime: new Date(Date.now() - 4.97 * 24 * 60 * 60 * 1000).toISOString(),
            emergency: true,
            cryptographicProof: 'c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2',
            duration: '2 hours'
          },
          {
            id: 'bridge-005',
            adminId: 'admin-9002',
            adminIdentifier: 'L6-A2',
            accessPoint: 7,
            reason: 'System recovery after power outage',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            approved: false,
            emergency: true,
            cryptographicProof: 'd5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9f6b2d5e8c3a9',
            deniedReason: 'Insufficient justification for emergency access'
          }
        ];
        
        setActivities(mockActivities);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch bridge activities:', err);
        setError('Failed to load bridge activity log. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  // Filter activities based on search input and date range
  const filteredActivities = activities.filter(activity => {
    // Text filter
    const textMatch = 
      activity.adminId.toLowerCase().includes(filter.toLowerCase()) || 
      activity.adminIdentifier.toLowerCase().includes(filter.toLowerCase()) ||
      activity.reason.toLowerCase().includes(filter.toLowerCase());
    
    // Date filter
    let dateMatch = true;
    const activityDate = new Date(activity.timestamp);
    const now = new Date();
    
    if (dateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateMatch = activityDate >= today;
    } else if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateMatch = activityDate >= weekAgo;
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateMatch = activityDate >= monthAgo;
    }
    
    return textMatch && dateMatch;
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Calculate time ago
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link to="/transparency" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={16} className="mr-1" />
            Back to Transparency Portal
          </Link>
          
          <h1 className="text-2xl font-bold mt-4">Bridge Activity Log</h1>
          <p className="text-gray-600 mt-1">
            View and verify all Level 6 bridge access activities
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">About Bridge Access</h3>
              <p className="text-sm text-blue-700">
                Bridge access is a secure mechanism that allows Level 6 administrators to perform
                critical system operations. Each access requires approval from at least two other
                Level 6 administrators and is cryptographically verified.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by admin ID or reason..."
                  className="pl-10"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading activity log...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-6">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="border rounded-lg overflow-hidden bg-white">
                <div className={`h-2 ${
                  activity.emergency 
                    ? 'bg-red-500' 
                    : 'bg-blue-500'
                }`}></div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                      <div>
                        <h3 className="font-medium">
                          Bridge Access {activity.approved ? 'Approved' : 'Denied'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.reason}</p>
                        
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Admin ID:</span>
                            <span className="ml-2 font-mono">{activity.adminIdentifier}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Access Point:</span>
                            <span className="ml-2">{activity.accessPoint}</span>
                          </div>
                          
                          {activity.approved ? (
                            <>
                              <div>
                                <span className="text-gray-500">Approved By:</span>
                                <span className="ml-2">
                                  {activity.approvedBy.map(id => 
                                    id.replace('admin-900', 'L6-A')
                                  ).join(', ')}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Duration:</span>
                                <span className="ml-2">{activity.duration}</span>
                              </div>
                            </>
                          ) : (
                            <div className="col-span-2">
                              <span className="text-gray-500">Denial Reason:</span>
                              <span className="ml-2 text-red-600">{activity.deniedReason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {timeAgo(activity.timestamp)}
                      </div>
                      
                      <div className={`mt-1 px-2 py-1 text-xs font-medium rounded-full inline-block ${
                        activity.emergency 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.emergency ? 'EMERGENCY' : 'STANDARD'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      {formatDate(activity.timestamp)}
                    </div>
                    
                    <div className="flex items-center">
                      {activity.approved ? (
                        <div className="flex items-center text-green-600 text-xs">
                          <CheckCircle size={14} className="mr-1" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 text-xs">
                          <XCircle size={14} className="mr-1" />
                          Denied
                        </div>
                      )}
                      
                      <Button variant="outline" size="sm" className="ml-3">
                        Verify Proof
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bridge activities found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BridgeActivityLog;