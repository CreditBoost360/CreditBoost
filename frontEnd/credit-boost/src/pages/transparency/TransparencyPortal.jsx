import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle, Bell, Eye, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * TransparencyPortal Component
 * Provides regular users with visibility into admin actions
 * while maintaining security of the system
 */
const TransparencyPortal = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Security Transparency Portal</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This portal provides transparency into administrative actions while maintaining
            the security of our systems. All Level 6 administrative actions are logged
            and verifiable here.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Why Transparency Matters</h3>
              <p className="text-sm text-blue-700">
                Our system uses a multi-bridge security architecture with Level 6 administrators
                who have special access privileges. This portal allows you to verify that these
                privileges are being used appropriately and securely.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/transparency/bridge-log" className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <Shield className="h-8 w-8 mb-2 text-blue-600" />
                <CardTitle className="text-lg">Bridge Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  View a complete log of all Level 6 bridge connections, including which
                  administrators approved each connection and for what purpose.
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/transparency/verify-action" className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CheckCircle className="h-8 w-8 mb-2 text-green-600" />
                <CardTitle className="text-lg">Verify Admin Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Verify that an administrative action was properly authorized
                  by scanning its QR code or entering its verification ID.
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/transparency/alerts" className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <Bell className="h-8 w-8 mb-2 text-purple-600" />
                <CardTitle className="text-lg">Security Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Subscribe to security alerts and view the history of
                  security notifications for your organization.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent System Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mr-3 mt-1 bg-green-100 p-1 rounded-full">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">System Security Audit Completed</p>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  A comprehensive security audit was completed by the security team.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1 bg-blue-100 p-1 rounded-full">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">Bridge Access Point Rotation</p>
                  <span className="text-xs text-gray-500">6 hours ago</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Level 6 bridge access points were automatically rotated for security.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mr-3 mt-1 bg-amber-100 p-1 rounded-full">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">Failed Login Attempts Detected</p>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Multiple failed login attempts were detected and blocked.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Link to="/transparency/activity" className="text-sm text-blue-600 hover:text-blue-800">
              View all system activity
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This transparency portal is part of our commitment to security and accountability.
            If you have questions or concerns, please contact the security team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransparencyPortal;