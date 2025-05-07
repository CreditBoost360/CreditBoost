import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowLeft, AlertTriangle, CheckCircle, Shield, Clock, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * SecurityAlertSubscription Component
 * Allows users to subscribe to different types of security alerts
 * and view past security notifications
 */
const SecurityAlertSubscription = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState({
    adminActions: true,
    bridgeAccess: true,
    loginAttempts: false,
    systemUpdates: true,
    securityIncidents: true
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationMethod, setNotificationMethod] = useState({
    email: true,
    inApp: true,
    sms: false
  });
  
  useEffect(() => {
    // Fetch user's current subscription settings and notifications
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, this would be an API call
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock notifications
        const mockNotifications = [
          {
            id: 'notif-001',
            type: 'BRIDGE_ACCESS',
            title: 'Emergency Bridge Access',
            message: 'Level 6 administrator accessed bridge for emergency security patch deployment',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            severity: 'high',
            read: false
          },
          {
            id: 'notif-002',
            type: 'SYSTEM_UPDATE',
            title: 'Security Policy Update',
            message: 'Password complexity requirements have been increased',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
            severity: 'medium',
            read: true
          },
          {
            id: 'notif-003',
            type: 'LOGIN_ATTEMPT',
            title: 'Failed Login Attempts Detected',
            message: 'Multiple failed login attempts from unusual location',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            severity: 'high',
            read: true
          },
          {
            id: 'notif-004',
            type: 'SECURITY_INCIDENT',
            title: 'Potential Security Incident Investigated',
            message: 'Security team investigated and resolved a potential security incident',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            severity: 'critical',
            read: true
          },
          {
            id: 'notif-005',
            type: 'ADMIN_ACTION',
            title: 'Admin Deactivation Request',
            message: 'A Level 6 administrator deactivation was requested and approved',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            severity: 'high',
            read: true
          }
        ];
        
        setNotifications(mockNotifications);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch subscription data:', err);
        setError('Failed to load subscription settings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle subscription toggle
  const handleSubscriptionToggle = (key) => {
    setSubscriptions({
      ...subscriptions,
      [key]: !subscriptions[key]
    });
    
    // In a real app, this would update the user's preferences via API
  };
  
  // Handle notification method toggle
  const handleMethodToggle = (key) => {
    setNotificationMethod({
      ...notificationMethod,
      [key]: !notificationMethod[key]
    });
    
    // In a real app, this would update the user's preferences via API
  };
  
  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    
    // In a real app, this would update the notification status via API
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    
    // In a real app, this would update all notifications via API
  };
  
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
  
  // Get icon for notification type
  const getNotificationIcon = (type, severity) => {
    switch (type) {
      case 'BRIDGE_ACCESS':
        return <Shield size={16} className="text-blue-600" />;
      case 'SYSTEM_UPDATE':
        return <Info size={16} className="text-green-600" />;
      case 'LOGIN_ATTEMPT':
        return <AlertTriangle size={16} className="text-amber-600" />;
      case 'SECURITY_INCIDENT':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'ADMIN_ACTION':
        return <Shield size={16} className="text-purple-600" />;
      default:
        return <Bell size={16} className="text-gray-600" />;
    }
  };
  
  // Get color class for severity
  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-amber-100 text-amber-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/transparency" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={16} className="mr-1" />
            Back to Transparency Portal
          </Link>
          
          <h1 className="text-2xl font-bold mt-4">Security Alerts</h1>
          <p className="text-gray-600 mt-1">
            Manage your security alert subscriptions and view past notifications
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Admin Actions</p>
                      <p className="text-sm text-gray-500">
                        Level 6 admin activities
                      </p>
                    </div>
                    <Switch 
                      checked={subscriptions.adminActions}
                      onCheckedChange={() => handleSubscriptionToggle('adminActions')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bridge Access</p>
                      <p className="text-sm text-gray-500">
                        Bridge access events
                      </p>
                    </div>
                    <Switch 
                      checked={subscriptions.bridgeAccess}
                      onCheckedChange={() => handleSubscriptionToggle('bridgeAccess')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Attempts</p>
                      <p className="text-sm text-gray-500">
                        Unusual login activity
                      </p>
                    </div>
                    <Switch 
                      checked={subscriptions.loginAttempts}
                      onCheckedChange={() => handleSubscriptionToggle('loginAttempts')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Updates</p>
                      <p className="text-sm text-gray-500">
                        Security policy changes
                      </p>
                    </div>
                    <Switch 
                      checked={subscriptions.systemUpdates}
                      onCheckedChange={() => handleSubscriptionToggle('systemUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Incidents</p>
                      <p className="text-sm text-gray-500">
                        Critical security events
                      </p>
                    </div>
                    <Switch 
                      checked={subscriptions.securityIncidents}
                      onCheckedChange={() => handleSubscriptionToggle('securityIncidents')}
                    />
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-medium mb-3">Notification Methods</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p>Email Notifications</p>
                      <Switch 
                        checked={notificationMethod.email}
                        onCheckedChange={() => handleMethodToggle('email')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p>In-App Notifications</p>
                      <Switch 
                        checked={notificationMethod.inApp}
                        onCheckedChange={() => handleMethodToggle('inApp')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p>SMS Alerts</p>
                      <Switch 
                        checked={notificationMethod.sms}
                        onCheckedChange={() => handleMethodToggle('sms')}
                      />
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-4">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Security Alerts</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark All Read
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading alerts...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
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
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 rounded-lg border ${notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-1 p-1 rounded-full bg-gray-100">
                            {getNotificationIcon(notification.type, notification.severity)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className={`font-medium ${notification.read ? '' : 'text-blue-800'}`}>
                                {notification.title}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {timeAgo(notification.timestamp)}
                              </span>
                            </div>
                            
                            <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600' : 'text-blue-700'}`}>
                              {notification.message}
                            </p>
                            
                            <div className="mt-2 flex items-center justify-between">
                              <div className={`text-xs px-2 py-1 rounded-full ${getSeverityClass(notification.severity)}`}>
                                {notification.severity.toUpperCase()}
                              </div>
                              
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Mark as Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center pt-2">
                      <Button variant="outline">
                        View All Alerts
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No security alerts to display</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAlertSubscription;