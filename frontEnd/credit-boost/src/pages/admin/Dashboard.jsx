import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Sun, 
  Moon,
  Search,
  Bell,
  LogOut
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdminSidebar from '@/components/Admin/AdminSidebar';
import AdminHeader from '@/components/Admin/AdminHeader';
import ActivityLog from '@/components/Admin/ActivityLog';
import MetricsGrid from '@/components/Admin/MetricsGrid';
import RecentAlerts from '@/components/Admin/RecentAlerts';
import { adminAuthService } from '@/services/admin/adminAuth.service';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activePassports: 0,
    verificationStamps: 0,
    pendingIssues: 0,
    apiUsage: 0,
    systemHealth: 'Optimal'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Check authentication and load dashboard data
  useEffect(() => {
    const verifyAdminAndLoadData = async () => {
      try {
        setLoading(true);
        
        // Verify admin authentication
        const adminData = await adminAuthService.verifyAdminSession();
        if (!adminData) {
          navigate('/admin/login');
          return;
        }
        
        setAdminUser(adminData);
        
        // Load dashboard data (in a real app, these would be separate API calls)
        await loadDashboardData();
        
        setLoading(false);
      } catch (err) {
        console.error("Dashboard initialization error:", err);
        setError("Failed to load dashboard. Please try again.");
        setLoading(false);
      }
    };
    
    verifyAdminAndLoadData();
    
    // Set up activity logging
    const logPageVisit = async () => {
      try {
        await adminAuthService.logAdminActivity({
          action: 'PAGE_VIEW',
          page: 'admin_dashboard',
          details: 'Admin dashboard accessed'
        });
      } catch (error) {
        console.error("Failed to log activity:", error);
      }
    };
    
    logPageVisit();
    
    // Check for preferred theme
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Set up periodic data refresh
    const refreshInterval = setInterval(() => {
      loadDashboardData(false); // Don't show loading state for refreshes
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [navigate]);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
    
    // Log theme change
    adminAuthService.logAdminActivity({
      action: 'SETTINGS_CHANGE',
      details: `Theme changed to ${newDarkMode ? 'dark' : 'light'} mode`
    }).catch(error => console.error("Failed to log activity:", error));
  };
  
  // Load dashboard data
  const loadDashboardData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      // In a real app, these would be API calls to your backend
      
      // Mock metrics data
      setMetrics({
        totalUsers: 12458,
        activePassports: 8734,
        verificationStamps: 15692,
        pendingIssues: 23,
        apiUsage: 1.2, // million requests
        systemHealth: 'Optimal'
      });
      
      // Mock activity data
      setRecentActivity([
        {
          id: 'act-1001',
          adminId: 'admin-5678',
          adminName: 'Sarah Johnson',
          action: 'USER_UPDATE',
          details: 'Reset password for user ID: user-3421',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          ipAddress: '192.168.1.45'
        },
        {
          id: 'act-1002',
          adminId: 'admin-4290',
          adminName: 'Michael Chen',
          action: 'VERIFICATION_APPROVAL',
          details: 'Approved verification stamp from First National Bank',
          timestamp: new Date(Date.now() - 23 * 60000).toISOString(),
          ipAddress: '192.168.1.62'
        },
        {
          id: 'act-1003',
          adminId: 'admin-7712',
          adminName: 'Alex Rodriguez',
          action: 'API_KEY_GENERATED',
          details: 'Generated new API key for partner: TransUnion',
          timestamp: new Date(Date.now() - 47 * 60000).toISOString(),
          ipAddress: '192.168.1.28'
        },
        {
          id: 'act-1004',
          adminId: adminUser?.id || 'admin-9001',
          adminName: adminUser?.name || 'Current User',
          action: 'SYSTEM_CONFIG',
          details: 'Updated rate limiting settings for public API',
          timestamp: new Date(Date.now() - 112 * 60000).toISOString(),
          ipAddress: '192.168.1.30'
        },
        {
          id: 'act-1005',
          adminId: 'admin-3356',
          adminName: 'Priya Patel',
          action: 'SUPPORT_TICKET',
          details: 'Resolved ticket #4582: User unable to create passport',
          timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
          ipAddress: '192.168.1.15'
        }
      ]);
      
      // Mock alerts data
      setAlerts([
        {
          id: 'alert-501',
          type: 'warning',
          title: 'API Rate Limit Approaching',
          description: 'Partner "FinTech Solutions" at 85% of rate limit',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString()
        },
        {
          id: 'alert-502',
          type: 'error',
          title: 'Failed Login Attempts',
          description: 'Multiple failed login attempts for admin account "admin-4290"',
          timestamp: new Date(Date.now() - 32 * 60000).toISOString()
        },
        {
          id: 'alert-503',
          type: 'info',
          title: 'System Maintenance',
          description: 'Scheduled maintenance in 24 hours. Duration: 2 hours',
          timestamp: new Date(Date.now() - 120 * 60000).toISOString()
        }
      ]);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await adminAuthService.logAdminActivity({
        action: 'LOGOUT',
        details: 'Admin user logged out'
      });
      
      await adminAuthService.logout();
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar darkMode={darkMode} adminUser={adminUser} />
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <AdminHeader 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
            adminUser={adminUser}
            onLogout={handleLogout}
          />
          
          {/* Main Dashboard Content */}
          <main className={`flex-1 overflow-y-auto p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="container mx-auto">
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Admin Dashboard
                  </h1>
                  <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Welcome back, {adminUser?.name || 'Admin'}. Here's what's happening today.
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => loadDashboardData()}
                    className={darkMode ? 'border-gray-700 hover:bg-gray-800' : ''}
                  >
                    <Clock size={16} className="mr-2" />
                    Refresh Data
                  </Button>
                  
                  <Button>
                    <Activity size={16} className="mr-2" />
                    System Status
                  </Button>
                </div>
              </div>
              
              {/* Metrics Grid */}
              <MetricsGrid metrics={metrics} darkMode={darkMode} />
              
              {/* Activity and Alerts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Activity Log */}
                <div className="lg:col-span-2">
                  <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>
                        Recent Admin Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ActivityLog activities={recentActivity} darkMode={darkMode} />
                    </CardContent>
                  </Card>
                </div>
                
                {/* Alerts */}
                <div>
                  <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>
                        System Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RecentAlerts alerts={alerts} darkMode={darkMode} />
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Security Audit Section */}
              <Card className={`mt-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <CardHeader>
                  <CardTitle className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>
                    Security Audit Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Your Session Information
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                        Active
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin ID</p>
                        <p className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {adminUser?.id || 'admin-9001'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Session Started</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date().toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>IP Address</p>
                        <p className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {adminUser?.lastIp || '192.168.1.30'}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>2FA Status</p>
                        <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          Verified
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        All actions are logged and audited. Your unique identifier is used to track all system changes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;