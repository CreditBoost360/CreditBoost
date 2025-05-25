import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Welcome Message Component for Communities
 * Displays a warm welcome message with community guidelines
 */
const WelcomeMessage = ({ onDismiss }) => {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-blue-800">Welcome to CreditBoost Communities!</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-blue-700">
            Connect with others on your financial journey, share experiences, and learn together in a supportive environment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Connect with Others</h4>
                <p className="text-sm text-blue-600">Join communities that match your financial goals and interests</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Share & Learn</h4>
                <p className="text-sm text-blue-600">Exchange tips, ask questions, and share your financial journey</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Grow Together</h4>
                <p className="text-sm text-blue-600">Track your progress and celebrate financial milestones as a community</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-800">Safe Environment</h4>
                <p className="text-sm text-blue-600">Our communities follow strict guidelines to ensure respectful discussions</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-blue-100 mt-4">
            <h4 className="font-medium text-gray-800 mb-2">Community Guidelines</h4>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>Be respectful and supportive of other members</li>
              <li>Do not share personal financial information (account numbers, etc.)</li>
              <li>Avoid giving specific investment advice</li>
              <li>No spam, solicitation, or promotional content</li>
              <li>Report inappropriate content to community moderators</li>
            </ul>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={onDismiss} className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeMessage;