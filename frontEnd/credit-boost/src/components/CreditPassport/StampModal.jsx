import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stamp, Upload, X } from 'lucide-react';

/**
 * Stamp Modal Component
 * 
 * A modal for financial institutions to add their stamp to a credit passport
 */
const StampModal = ({ isOpen, onClose, onAddStamp }) => {
  const [institutionName, setInstitutionName] = useState('');
  const [stampLogo, setStampLogo] = useState(null);
  const [stampLogoPreview, setStampLogoPreview] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo file size must be less than 2MB');
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setStampLogoPreview(reader.result);
      setStampLogo(file);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!institutionName.trim()) {
      setError('Institution name is required');
      return;
    }
    
    if (!verificationCode.trim()) {
      setError('Verification code is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would send the data to an API
      // For demo purposes, we'll simulate an API call
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create stamp data
      const stampData = {
        id: `stamp-${Date.now()}`,
        institution: institutionName,
        date: new Date().toISOString(),
        verified: true,
        logo: stampLogoPreview || 'https://via.placeholder.com/100x100?text=' + institutionName.charAt(0)
      };
      
      // Call onAddStamp callback
      onAddStamp(stampData);
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error adding stamp:', error);
      setError('Failed to add stamp. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset form when modal closes
  const handleClose = () => {
    setInstitutionName('');
    setStampLogo(null);
    setStampLogoPreview(null);
    setVerificationCode('');
    setError('');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Stamp className="mr-2 h-5 w-5" />
            Add Official Institution Stamp
          </DialogTitle>
          <DialogDescription>
            Add your institution's stamp to verify this Credit Passport.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="institutionName">Institution Name</Label>
            <Input
              id="institutionName"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g. KCB Bank"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stampLogo">Institution Logo</Label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 border rounded-md flex items-center justify-center overflow-hidden">
                {stampLogoPreview ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={stampLogoPreview} 
                      alt="Logo Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5"
                      onClick={() => {
                        setStampLogo(null);
                        setStampLogoPreview(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <Upload className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="stampLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('stampLogo').click()}
                  className="w-full"
                >
                  Upload Logo
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 2MB. Recommended: 100x100px
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter the verification code"
            />
            <p className="text-xs text-gray-500">
              This code was sent to your institution's email address.
            </p>
          </div>
          
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Adding...
                </>
              ) : (
                'Add Stamp'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StampModal;