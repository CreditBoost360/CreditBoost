import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  LogOut, 
  User,
  Settings,
  HelpCircle,
  Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Header component for admin pages.
 * Provides search, notifications, theme toggle, and user menu.
 */
const AdminHeader = ({ darkMode, toggleDarkMode, adminUser, onLogout, toggleMobileMenu }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New Support Ticket',
      message: 'A new high-priority support ticket has been created.',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 'notif-2',
      title: 'System Update',
      message: 'System update completed successfully.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 'notif-3',
      title: 'New Admin User',
      message: 'A new admin user "James Wilson" has been added.',
      time: '3 hours ago',
      read: true
    }
  ]);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3`}>
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <Input
              type="search"
              placeholder="Search..."
              className={`pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-1.5 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className={`p-1.5 rounded-full relative ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} z-50`}>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 ${notification.read ? '' : darkMode ? 'bg-gray-700' : 'bg-blue-50'} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} border-b border-gray-200 dark:border-gray-700`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{notification.title}</p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{notification.message}</p>
                          </div>
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{notification.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <button className={`w-full text-center text-xs ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-700 hover:text-gray-900'} py-1`}>
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 focus:outline-none"
              aria-label="User menu"
            >
              <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {adminUser?.firstName?.charAt(0) || 'A'}
                </span>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} z-50`}>
                <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {adminUser?.firstName} {adminUser?.lastName}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {adminUser?.email}
                  </p>
                  {adminUser?.accessLevel === 6 && (
                    <div className={`mt-1 pt-1 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center`}>
                      <Shield size={12} className={`mr-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Level 6 Access
                      </span>
                    </div>
                  )}
                </div>
                <div className="py-1">
                  <button className={`flex items-center w-full px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <User size={16} className="mr-3" />
                    Profile
                  </button>
                  <button className={`flex items-center w-full px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <Settings size={16} className="mr-3" />
                    Settings
                  </button>
                  <button className={`flex items-center w-full px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <HelpCircle size={16} className="mr-3" />
                    Help
                  </button>
                  <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} my-1`}></div>
                  <button 
                    onClick={onLogout}
                    className={`flex items-center w-full px-4 py-2 text-sm ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;