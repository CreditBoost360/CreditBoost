import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Clock, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const ShareModal = ({ 
  shareLink = "https://credvault.co.ke/passport/share/abc123def456", 
  expiryTime = 24,
  onChangeExpiry,
  onClose,
  onCopy 
}) => {
  const [copied, setCopied] = useState(false);
  const [localExpiryTime, setLocalExpiryTime] = useState(expiryTime);

  const handleCopy = () => {
    onCopy(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExpiryChange = (value) => {
    setLocalExpiryTime(value);
    if (onChangeExpiry) {
      onChangeExpiry(value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Share Your Credit Passport</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Use this secure link to share your credit passport with financial institutions.
              This link will expire after the selected time period.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center text-sm text-blue-700 mb-1">
                <Clock size={14} className="mr-1" />
                <span>Link expires in {localExpiryTime} hours</span>
              </div>
              <p className="text-xs text-blue-600">
                For security, we recommend shorter expiration times for sensitive information.
              </p>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="expiry-slider" className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Time: {localExpiryTime} hours
              </Label>
              <input
                type="range"
                id="expiry-slider"
                min="1"
                max="72"
                step="1"
                value={localExpiryTime}
                onChange={(e) => handleExpiryChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 hour</span>
                <span>24 hours</span>
                <span>72 hours</span>
              </div>
            </div>
            
            <Label htmlFor="share-link" className="block text-sm font-medium text-gray-700 mb-2">
              Shareable Link
            </Label>
            <div className="flex">
              <Input
                id="share-link"
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 rounded-r-none focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                onClick={handleCopy}
                className="rounded-l-none"
                variant={copied ? "success" : "default"}
              >
                {copied ? (
                  <>
                    <Check size={16} className="mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Who can access this link?</h4>
            <p className="text-xs text-gray-600">
              Anyone with this link can view your credit passport until the link expires.
              They cannot modify your data or access other parts of your account.
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareModal;