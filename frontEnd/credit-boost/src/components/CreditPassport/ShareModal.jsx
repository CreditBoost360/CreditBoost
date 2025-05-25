import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, X, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ShareModal = ({ shareLink, expiryTime, onChangeExpiry, onClose, onCopy, onDownload }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Share Your Credit Passport</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Share this link or QR code with institutions or individuals who need to verify your credit information.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link Expiry Time
          </label>
          <select 
            value={expiryTime}
            onChange={(e) => onChangeExpiry(parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={0.75}>45 minutes</option>
            <option value={1}>1 hour</option>
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
            <option value={168}>7 days</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shareable Link
          </label>
          <div className="flex">
            <input 
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              onClick={() => onCopy(shareLink)}
              className="rounded-l-none"
            >
              <Copy size={16} className="mr-2" />
              Copy
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            QR Code
          </label>
          <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-md">
            <div id="passport-qr-code">
              <QRCodeSVG value={shareLink} size={200} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Scan this QR code to access the passport
          </p>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          
          <Button
            variant="outline"
            onClick={onDownload}
          >
            <Download size={16} className="mr-2" />
            Download QR Code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;