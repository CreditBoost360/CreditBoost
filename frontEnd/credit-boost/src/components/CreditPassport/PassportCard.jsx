import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PassportCard = ({ 
  userData, 
  creditScore, 
  onView,
  onShare
}) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Universal Credit Passport</h3>
              <p className="text-blue-100 text-sm">Blockchain-Secured Financial Identity</p>
            </div>
            <Shield className="h-10 w-10" />
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">
                {userData?.firstName?.[0]}{userData?.lastName?.[0]}
              </span>
            </div>
            <div>
              <h4 className="font-bold">{userData?.firstName} {userData?.lastName}</h4>
              <p className="text-sm text-gray-500">{userData?.email}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">Credit Score</span>
              <span className="text-sm font-medium text-gray-500">Last Updated: {formatDate(userData?.updatedAt || new Date())}</span>
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${(creditScore/850)*100}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-4">
                <span className="text-2xl font-bold text-blue-600">{creditScore}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center text-green-600 mb-1">
                <CheckCircle size={14} className="mr-1" />
                <span className="text-sm font-medium">Blockchain Verified</span>
              </div>
              <p className="text-xs text-gray-500">Your data is secured on the blockchain</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center text-blue-600 mb-1">
                <Clock size={14} className="mr-1" />
                <span className="text-sm font-medium">Real-time Updates</span>
              </div>
              <p className="text-xs text-gray-500">Credit data is updated in real-time</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onView}>
              View Passport
            </Button>
            <Button onClick={onShare}>
              Share Passport
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PassportCard;