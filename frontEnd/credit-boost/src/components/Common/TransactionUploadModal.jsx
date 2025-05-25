import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransactionUploader from './TransactionUploader';

/**
 * Modal component for uploading transaction statements
 * This is a simplified version that doesn't rely on Dialog component
 */
const TransactionUploadModal = ({ open, onClose, onSuccess }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Upload Transaction Statement</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="p-6">
          <TransactionUploader 
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionUploadModal;