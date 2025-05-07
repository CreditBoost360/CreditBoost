import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  FileText, 
  Settings, 
  HelpCircle, 
  AlertTriangle,
  Database,
  Key,
  Activity,
  MessageSquare,
  UserX,
  X
} from 'lucide-react';

/**
 * Sidebar component for admin pages.
 * Provides navigation links to different admin sections.
 */
const AdminSidebar = ({ darkMode, adminUser, mobileMenuOpen, setMobileMenuOpen }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard'
    },
    {
      title: 'User Management',
      icon: <Users size={20} />,
      path: '/admin/users'
    },
    {
      title: 'Level 6 Bridge',
      icon: <Shield size={20} />,
      path: '/admin/level6-bridge',
      level6Only: true
    },
    {
      title: 'Admin Deactivation',
      icon: <UserX size={20} />,
      path: '/admin/admin-deactivation',
      level6Only: true
    },
    {
      title: 'Blockchain Monitor',
      icon: <Database size={20} />,
      path: '/admin/blockchain'
    },
    {
      title: 'API Management',
      icon: <Key size={20} />,
      path: '/admin/api'
    },
    {
      title: 'System Logs',
      icon: <Activity size={20} />,
      path: '/admin/logs'
    },
    {
      title: 'Support Tickets',
      icon: <MessageSquare size={20} />,
      path: '/admin/support'
    },
    {
      title: 'Reports',
      icon: <FileText size={20} />,
      path: '/admin/reports'
    },
    {
      title: 'Security Alerts',
      icon: <AlertTriangle size={20} />,
      path: '/admin/alerts'
    },
    {
      title: 'Settings',
      icon: <Settings size={20} />,
      path: '/admin/settings'
    },
    {
      title: 'Help & Documentation',
      icon: <HelpCircle size={20} />,
      path: '/admin/help'
    }
  ];

  // Filter menu items based on admin access level
  const filteredMenuItems = menuItems.filter(item => {
    if (item.level6Only) {
      return adminUser?.accessLevel === 6;
    }
    return true;
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`w-64 h-screen flex-shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-y-auto hidden md:block`}>
        {/* Logo and Brand */}
        <div className="p-6">
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-3`}>
              <Shield size={18} className="text-white" />
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              CreditBoost <span className="text-blue-600">Admin</span>
            </span>
          </div>
        </div>
        
        {/* Admin Info */}
        <div className={`mx-6 mb-6 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {adminUser?.firstName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {adminUser?.firstName} {adminUser?.lastName}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {adminUser?.accessLevel === 6 ? 'Level 6 Administrator' : 'Administrator'}
              </p>
            </div>
          </div>
          {adminUser?.accessLevel === 6 && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ID: <span className="font-mono">{adminUser?.id}</span>
              </p>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="px-4 pb-6">
          <ul className="space-y-1">
            {filteredMenuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? darkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-blue-600'
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Version Info */}
        <div className="px-6 py-4 mt-auto">
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Admin Portal v1.0.0
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            © 2023 CreditBoost
          </p>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-y-auto`}>
            {/* Close Button */}
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2 rounded-md ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Logo and Brand */}
            <div className="px-6 pb-6">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-3`}>
                  <Shield size={18} className="text-white" />
                </div>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  CreditBoost <span className="text-blue-600">Admin</span>
                </span>
              </div>
            </div>
            
            {/* Admin Info */}
            <div className={`mx-6 mb-6 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {adminUser?.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {adminUser?.firstName} {adminUser?.lastName}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {adminUser?.accessLevel === 6 ? 'Level 6 Administrator' : 'Administrator'}
                  </p>
                </div>
              </div>
              {adminUser?.accessLevel === 6 && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ID: <span className="font-mono">{adminUser?.id}</span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Navigation */}
            <nav className="px-4 pb-6">
              <ul className="space-y-1">
                {filteredMenuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? darkMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-gray-100 text-blue-600'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;