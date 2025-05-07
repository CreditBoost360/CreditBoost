import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Building, User } from 'lucide-react';

const VerificationStamp = ({ verification }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{verification.institution}</h4>
              <p className="text-sm text-gray-600">{verification.purpose}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 flex items-center justify-end">
            <Clock size={12} className="mr-1" />
            {formatDate(verification.timestamp)}
          </div>
          <div className="text-xs text-gray-500 mt-1">ID: {verification.id}</div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <Building size={12} className="mr-1" />
          <span>Institution: {verification.institution}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <User size={12} className="mr-1" />
          <span>Verified by: {verification.verifier}</span>
        </div>
      </div>
      
      <div className="mt-3 flex justify-end">
        <div className="h-10 w-10">
          {/* This would be the institution's stamp/seal image */}
          <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">
              {verification.institution.split(' ').map(word => word[0]).join('')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationStamp;