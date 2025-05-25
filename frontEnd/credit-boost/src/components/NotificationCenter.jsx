import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, Calendar, CreditCard } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Notification Center Component
 * 
 * Displays a notification bell with a popover containing notifications
 */
const NotificationCenter = () => {
  // State for notifications
  const [notifications, setNotifications] = useState({
    system: [],
    credit: [],
    account: []
  });
  
  // State for unread count
  const [unreadCount, setUnreadCount] = useState(0);
  
  // State for popover open
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock notifications for demo purposes
  useEffect(() => {
    // In a real app, you would fetch these from an API
    const mockNotifications = {
      system: [
        {
          id: 's1',
          title: 'System Maintenance',
          message: 'Scheduled maintenance on June 15th from 2-4 AM',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          read: false,
          type: 'info'
        },
        {
          id: 's2',
          title: 'New Feature Available',
          message: 'Try our new credit score simulator!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          read: true,
          type: 'info'
        }
      ],
      credit: [
        {
          id: 'c1',
          title: 'Credit Score Updated',
          message: 'Your credit score has increased by 15 points',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          read: false,
          type: 'success'
        },
        {
          id: 'c2',
          title: 'New Credit Report',
          message: 'Your monthly credit report is now available',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          read: false,
          type: 'info'
        }
      ],
      account: [
        {
          id: 'a1',
          title: 'Profile Update Reminder',
          message: 'Please complete your profile for better recommendations',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          read: false,
          type: 'warning'
        }
      ]
    };
    
    setNotifications(mockNotifications);
    
    // Calculate unread count
    const totalUnread = 
      mockNotifications.system.filter(n => !n.read).length +
      mockNotifications.credit.filter(n => !n.read).length +
      mockNotifications.account.filter(n => !n.read).length;
    
    setUnreadCount(totalUnread);
  }, []);
  
  // Mark a notification as read
  const markAsRead = (category, id) => {
    setNotifications(prev => ({
      ...prev,
      [category]: prev[category].map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    }));
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => ({
      system: prev.system.map(n => ({ ...n, read: true })),
      credit: prev.credit.map(n => ({ ...n, read: true })),
      account: prev.account.map(n => ({ ...n, read: true }))
    }));
    
    setUnreadCount(0);
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Format timestamp to relative time
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'system':
        return <Info className="h-4 w-4" />;
      case 'credit':
        return <CreditCard className="h-4 w-4" />;
      case 'account':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  // Calculate total notifications
  const totalNotifications = 
    notifications.system.length + 
    notifications.credit.length + 
    notifications.account.length;
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </div>
        </div>
        
        {totalNotifications > 0 ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="credit">Credit</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="max-h-[300px] overflow-y-auto">
              {[...notifications.system, ...notifications.credit, ...notifications.account]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map(notification => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    category={
                      notifications.system.find(n => n.id === notification.id) ? 'system' :
                      notifications.credit.find(n => n.id === notification.id) ? 'credit' : 'account'
                    }
                    onMarkAsRead={markAsRead}
                    formatTimeAgo={formatTimeAgo}
                    getNotificationIcon={getNotificationIcon}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
            </TabsContent>
            
            <TabsContent value="system" className="max-h-[300px] overflow-y-auto">
              {notifications.system.length > 0 ? (
                notifications.system
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map(notification => (
                    <NotificationItem 
                      key={notification.id}
                      notification={notification}
                      category="system"
                      onMarkAsRead={markAsRead}
                      formatTimeAgo={formatTimeAgo}
                      getNotificationIcon={getNotificationIcon}
                      getCategoryIcon={getCategoryIcon}
                    />
                  ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No system notifications
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="credit" className="max-h-[300px] overflow-y-auto">
              {notifications.credit.length > 0 ? (
                notifications.credit
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map(notification => (
                    <NotificationItem 
                      key={notification.id}
                      notification={notification}
                      category="credit"
                      onMarkAsRead={markAsRead}
                      formatTimeAgo={formatTimeAgo}
                      getNotificationIcon={getNotificationIcon}
                      getCategoryIcon={getCategoryIcon}
                    />
                  ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No credit notifications
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="account" className="max-h-[300px] overflow-y-auto">
              {notifications.account.length > 0 ? (
                notifications.account
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map(notification => (
                    <NotificationItem 
                      key={notification.id}
                      notification={notification}
                      category="account"
                      onMarkAsRead={markAsRead}
                      formatTimeAgo={formatTimeAgo}
                      getNotificationIcon={getNotificationIcon}
                      getCategoryIcon={getCategoryIcon}
                    />
                  ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No account notifications
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        )}
        
        <div className="p-2 border-t text-center">
          <Button variant="link" size="sm" className="text-xs text-gray-500">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Individual notification item component
const NotificationItem = ({ 
  notification, 
  category, 
  onMarkAsRead, 
  formatTimeAgo,
  getNotificationIcon,
  getCategoryIcon
}) => {
  return (
    <div 
      className={`p-3 border-b last:border-b-0 flex items-start gap-3 ${
        notification.read ? 'bg-white dark:bg-gray-950' : 'bg-blue-50 dark:bg-gray-900'
      }`}
    >
      <div className="mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="font-medium text-sm truncate">{notification.title}</p>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
            {formatTimeAgo(notification.timestamp)}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
          {notification.message}
        </p>
        <div className="flex items-center mt-1">
          <div className="flex items-center text-xs text-gray-500">
            {getCategoryIcon(category)}
            <span className="ml-1 capitalize">{category}</span>
          </div>
          {!notification.read && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-6 text-xs"
              onClick={() => onMarkAsRead(category, notification.id)}
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;