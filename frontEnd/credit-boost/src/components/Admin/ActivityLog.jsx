import React from 'react';
import { 
  UserCog, 
  ShieldCheck, 
  Key, 
  Settings, 
  Ticket,
  Clock
} from 'lucide-react';

const ActivityLog = ({ activities, darkMode }) => {
  // Function to format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Function to calculate time ago
  const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };
  
  // Function to get icon based on action type
  const getActionIcon = (action) => {
    switch (action) {
      case 'USER_UPDATE':
        return <UserCog size={16} />;
      case 'VERIFICATION_APPROVAL':
        return <ShieldCheck size={16} />;
      case 'API_KEY_GENERATED':
        return <Key size={16} />;
      case 'SYSTEM_CONFIG':
        return <Settings size={16} />;
      case 'SUPPORT_TICKET':
        return <Ticket size={16} />;
      default:
        return <Clock size={16} />;
    }
  };
  
  // Function to get color based on action type
  const getActionColor = (action, isDark) => {
    switch (action) {
      case 'USER_UPDATE':
        return isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-100';
      case 'VERIFICATION_APPROVAL':
        return isDark ? 'text-green-400 bg-green-900/30' : 'text-green-600 bg-green-100';
      case 'API_KEY_GENERATED':
        return isDark ? 'text-purple-400 bg-purple-900/30' : 'text-purple-600 bg-purple-100';
      case 'SYSTEM_CONFIG':
        return isDark ? 'text-amber-400 bg-amber-900/30' : 'text-amber-600 bg-amber-100';
      case 'SUPPORT_TICKET':
        return isDark ? 'text-indigo-400 bg-indigo-900/30' : 'text-indigo-600 bg-indigo-100';
      default:
        return isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div 
            key={activity.id} 
            className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} flex items-start`}
          >
            <div className={`p-2 rounded-full mr-3 ${getActionColor(activity.action, darkMode)}`}>
              {getActionIcon(activity.action)}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {activity.adminName}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {activity.details}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {timeAgo(activity.timestamp)}
                  </span>
                  <span className={`text-xs mt-1 font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    ID: {activity.adminId.substring(0, 8)}
                  </span>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatTime(activity.timestamp)}
                </span>
                <span className={`text-xs font-mono ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  IP: {activity.ipAddress}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className={`p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No recent activity to display
        </div>
      )}
      
      {activities.length > 0 && (
        <div className="text-center pt-2">
          <button className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;