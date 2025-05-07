import React from 'react';
import { Users, Shield, AlertTriangle, Activity, BarChart3, CheckCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const MetricsGrid = ({ metrics, darkMode }) => {
  const metricCards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers.toLocaleString(),
      icon: <Users size={24} />,
      color: 'blue',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Active Passports',
      value: metrics.activePassports.toLocaleString(),
      icon: <Shield size={24} />,
      color: 'green',
      change: '+8.3%',
      changeType: 'positive'
    },
    {
      title: 'Verification Stamps',
      value: metrics.verificationStamps.toLocaleString(),
      icon: <CheckCircle size={24} />,
      color: 'purple',
      change: '+15.2%',
      changeType: 'positive'
    },
    {
      title: 'Pending Issues',
      value: metrics.pendingIssues,
      icon: <AlertTriangle size={24} />,
      color: 'amber',
      change: '-5.7%',
      changeType: 'positive'
    },
    {
      title: 'API Usage',
      value: `${metrics.apiUsage}M`,
      icon: <BarChart3 size={24} />,
      color: 'indigo',
      change: '+23.1%',
      changeType: 'positive'
    },
    {
      title: 'System Health',
      value: metrics.systemHealth,
      icon: <Activity size={24} />,
      color: 'emerald',
      change: 'Stable',
      changeType: 'neutral'
    }
  ];

  // Color mapping for both light and dark modes
  const colorMap = {
    blue: {
      light: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        icon: 'bg-blue-100 text-blue-600',
        border: 'border-blue-200'
      },
      dark: {
        bg: 'bg-blue-900/20',
        text: 'text-blue-400',
        icon: 'bg-blue-900/30 text-blue-400',
        border: 'border-blue-900/50'
      }
    },
    green: {
      light: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        icon: 'bg-green-100 text-green-600',
        border: 'border-green-200'
      },
      dark: {
        bg: 'bg-green-900/20',
        text: 'text-green-400',
        icon: 'bg-green-900/30 text-green-400',
        border: 'border-green-900/50'
      }
    },
    purple: {
      light: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        icon: 'bg-purple-100 text-purple-600',
        border: 'border-purple-200'
      },
      dark: {
        bg: 'bg-purple-900/20',
        text: 'text-purple-400',
        icon: 'bg-purple-900/30 text-purple-400',
        border: 'border-purple-900/50'
      }
    },
    amber: {
      light: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        icon: 'bg-amber-100 text-amber-600',
        border: 'border-amber-200'
      },
      dark: {
        bg: 'bg-amber-900/20',
        text: 'text-amber-400',
        icon: 'bg-amber-900/30 text-amber-400',
        border: 'border-amber-900/50'
      }
    },
    indigo: {
      light: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        icon: 'bg-indigo-100 text-indigo-600',
        border: 'border-indigo-200'
      },
      dark: {
        bg: 'bg-indigo-900/20',
        text: 'text-indigo-400',
        icon: 'bg-indigo-900/30 text-indigo-400',
        border: 'border-indigo-900/50'
      }
    },
    emerald: {
      light: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        icon: 'bg-emerald-100 text-emerald-600',
        border: 'border-emerald-200'
      },
      dark: {
        bg: 'bg-emerald-900/20',
        text: 'text-emerald-400',
        icon: 'bg-emerald-900/30 text-emerald-400',
        border: 'border-emerald-900/50'
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricCards.map((metric, index) => {
        const colorSet = darkMode ? colorMap[metric.color].dark : colorMap[metric.color].light;
        
        return (
          <Card 
            key={index} 
            className={`${colorSet.bg} border ${colorSet.border} ${darkMode ? 'shadow-none' : 'shadow-sm'}`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {metric.title}
                  </p>
                  <h3 className={`text-2xl font-bold mt-2 ${colorSet.text}`}>
                    {metric.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-full ${colorSet.icon}`}>
                  {metric.icon}
                </div>
              </div>
              
              <div className="mt-4 flex items-center">
                <span className={`text-xs font-medium ${
                  metric.changeType === 'positive' 
                    ? darkMode ? 'text-green-400' : 'text-green-600'
                    : metric.changeType === 'negative'
                      ? darkMode ? 'text-red-400' : 'text-red-600'
                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {metric.change}
                </span>
                <span className={`text-xs ml-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  since last month
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MetricsGrid;