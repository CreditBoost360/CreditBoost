import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, MessageSquare, TrendingUp } from 'lucide-react';

/**
 * Community Card Component
 * Displays a community with its details in a card format
 */
const CommunityCard = ({ community, onJoin }) => {
  const navigate = useNavigate();
  
  // Calculate activity level based on message count and member count
  const getActivityLevel = () => {
    const messageCount = community?.message_count || 0;
    const memberCount = community?.member_count || 0;
    
    if (messageCount > memberCount * 5) return 'Very Active';
    if (messageCount > memberCount * 2) return 'Active';
    if (messageCount > memberCount) return 'Moderate';
    return 'New';
  };
  
  // Get activity badge color
  const getActivityColor = () => {
    const level = getActivityLevel();
    switch (level) {
      case 'Very Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get category badge color
  const getCategoryColor = () => {
    const category = community?.category?.toLowerCase() || '';
    
    if (category.includes('invest')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (category.includes('save')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (category.includes('budget')) return 'bg-green-100 text-green-800 border-green-200';
    if (category.includes('debt')) return 'bg-red-100 text-red-800 border-red-200';
    if (category.includes('credit')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{community?.name}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className={getCategoryColor()}>
                {community?.category || 'General'}
              </Badge>
              <Badge variant="outline" className={getActivityColor()}>
                {getActivityLevel()}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="font-medium">{community?.rating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-gray-600 line-clamp-3 mb-4">{community?.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-auto">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{community?.member_count || 0} members</span>
          </div>
          
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{community?.message_count || 0} messages</span>
          </div>
          
          {community?.trending && (
            <div className="flex items-center gap-1 text-blue-600">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t flex justify-between">
        <div className="flex -space-x-2">
          {[...Array(Math.min(3, community?.member_count || 0))].map((_, i) => (
            <div 
              key={i} 
              className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden"
            >
              {community?.member_avatars?.[i] ? (
                <img 
                  src={community.member_avatars[i]} 
                  alt="Member" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-4 h-4 text-gray-500" />
              )}
            </div>
          ))}
          
          {(community?.member_count || 0) > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
              +{(community?.member_count || 0) - 3}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {!community?.is_member && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onJoin(community.id)}
            >
              Join
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => navigate(`/community/${community.id}`)}
          >
            View
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommunityCard;