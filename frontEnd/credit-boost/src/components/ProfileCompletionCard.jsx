import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

/**
 * Profile Completion Card Component
 * 
 * Displays a card showing the user's profile completion progress
 * with a list of completed and pending items.
 */
const ProfileCompletionCard = ({ user }) => {
  // Calculate completion percentage and items
  const { completionPercentage, completionItems } = useMemo(() => {
    // Define all possible profile fields
    const profileItems = [
      { 
        id: 'profileImage', 
        label: 'Profile Picture', 
        completed: !!user?.profileImage,
        important: false
      },
      { 
        id: 'firstName', 
        label: 'First Name', 
        completed: !!user?.firstName,
        important: true
      },
      { 
        id: 'lastName', 
        label: 'Last Name', 
        completed: !!user?.lastName,
        important: true
      },
      { 
        id: 'email', 
        label: 'Email Address', 
        completed: !!user?.email,
        important: true
      },
      { 
        id: 'phone', 
        label: 'Phone Number', 
        completed: !!user?.phone,
        important: true
      },
      { 
        id: 'address', 
        label: 'Address', 
        completed: !!user?.address,
        important: false
      },
      { 
        id: 'dateOfBirth', 
        label: 'Date of Birth', 
        completed: !!user?.dateOfBirth,
        important: false
      },
      { 
        id: 'idVerification', 
        label: 'ID Verification', 
        completed: !!user?.idVerified,
        important: false
      }
    ];
    
    // Count completed items
    const completedCount = profileItems.filter(item => item.completed).length;
    
    // Calculate percentage
    const percentage = Math.round((completedCount / profileItems.length) * 100);
    
    return {
      completionPercentage: percentage,
      completionItems: profileItems
    };
  }, [user]);
  
  // Determine progress color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage < 40) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  // Get completion status text
  const getCompletionStatus = (percentage) => {
    if (percentage < 40) return 'Needs Attention';
    if (percentage < 70) return 'Good Progress';
    if (percentage < 100) return 'Almost Complete';
    return 'Complete';
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          <span>Profile Completion</span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            completionPercentage < 40 ? 'bg-red-100 text-red-700' : 
            completionPercentage < 70 ? 'bg-yellow-100 text-yellow-700' : 
            'bg-green-100 text-green-700'
          }`}>
            {completionPercentage}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Progress 
            value={completionPercentage} 
            className="h-2"
            indicatorClassName={getProgressColor(completionPercentage)}
          />
          <p className="text-sm text-gray-500 mt-1">
            {getCompletionStatus(completionPercentage)}
          </p>
        </div>
        
        <div className="space-y-2">
          {/* Incomplete important items first */}
          {completionItems
            .filter(item => !item.completed && item.important)
            .map(item => (
              <div key={item.id} className="flex items-center text-sm">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-red-700">{item.label} (Required)</span>
              </div>
            ))}
            
          {/* Incomplete non-important items */}
          {completionItems
            .filter(item => !item.completed && !item.important)
            .map(item => (
              <div key={item.id} className="flex items-center text-sm">
                <Circle className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">{item.label}</span>
              </div>
            ))}
            
          {/* Completed items */}
          {completionItems
            .filter(item => item.completed)
            .map(item => (
              <div key={item.id} className="flex items-center text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-gray-600 line-through">{item.label}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionCard;