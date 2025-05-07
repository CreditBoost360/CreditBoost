import React from 'react';
import { AlertTriangle, Info, AlertCircle, Clock } from 'lucide-react';

const RecentAlerts = ({ alerts, darkMode }) => {
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
  
  // Function to get icon based on alert type
  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      case 'info':
        return <Info size={16} />;
      default:
        return <Clock size={16} />;
    }
  };
  
  // Function to get color based on alert type
  const getAlertColor = (type, isDark) => {
    switch (type) {
      case 'error':
        return isDark ? 'text-red-400 bg-red-900/30' : 'text-red-600 bg-red-100';
      case 'warning':
        return isDark ? 'text-amber-400 bg-amber-900/30' : 'text-amber-600 bg-amber-100';
      case 'info':
        return isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-100';
      default:
        return isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.length > 0 ? (
        alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${getAlertColor(alert.type, darkMode)}`}>
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {alert.title}
                  </p>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {timeAgo(alert.timestamp)}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {alert.description}
                </p>
              </div>
            </div>
            
            <div className="mt-2 flex justify-end">
              <button className={`text-xs ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                View details
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className={`p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No alerts to display
        </div>
      )}
      
      {alerts.length > 0 && (
        <div className="text-center pt-2">
          <button className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
            View all alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentAlerts;