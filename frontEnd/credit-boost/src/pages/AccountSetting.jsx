import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Camera, Save, User } from 'lucide-react';

const AccountSetting = () => {
  const { user, updateUser } = useContext(AppContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || null
      });
      
      if (user.profileImage) {
        setPreviewImage(user.profileImage);
      }
    }
  }, [user]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('Selected file:', file.name, file.type, `${Math.round(file.size/1024)}KB`);
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const imageData = reader.result;
        console.log('Image loaded, size:', Math.round(imageData.length/1024), 'KB');
        
        // Compress the image if it's too large
        if (imageData.length > 1024 * 1024) { // If larger than 1MB
          console.log('Image is large, compressing...');
          
          // Create an image element to draw to canvas
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate new dimensions (maintain aspect ratio)
            let width = img.width;
            let height = img.height;
            const maxDimension = 800; // Max width or height
            
            if (width > height && width > maxDimension) {
              height = Math.round(height * maxDimension / width);
              width = maxDimension;
            } else if (height > maxDimension) {
              width = Math.round(width * maxDimension / height);
              height = maxDimension;
            }
            
            // Resize the image
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get compressed image data
            const compressedImage = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality
            console.log('Compressed image size:', Math.round(compressedImage.length/1024), 'KB');
            
            // Update state with compressed image
            setPreviewImage(compressedImage);
            setFormData(prev => ({ ...prev, profileImage: compressedImage }));
          };
          img.src = imageData;
        } else {
          // Use original image if it's not too large
          setPreviewImage(imageData);
          setFormData(prev => ({ ...prev, profileImage: imageData }));
        }
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          title: "Image Processing Error",
          description: "Failed to process the image. Please try another one.",
          variant: "destructive"
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Submitting form data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        profileImage: formData.profileImage ? '[Image data present]' : null
      });
      
      // Create a copy of the form data to send
      const dataToSend = {...formData};
      
      // If the profile image is too large, compress it further
      if (dataToSend.profileImage && dataToSend.profileImage.length > 2 * 1024 * 1024) {
        console.log('Profile image is very large, compressing further before sending');
        
        // Create an image element
        const img = new Image();
        img.src = dataToSend.profileImage;
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set dimensions (reduce if necessary)
        const maxDimension = 600;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxDimension) {
          height = Math.round(height * maxDimension / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round(width * maxDimension / height);
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed image
        dataToSend.profileImage = canvas.toDataURL('image/jpeg', 0.6);
        console.log('Final image size:', Math.round(dataToSend.profileImage.length/1024), 'KB');
      }
      
      const result = await updateUser(dataToSend);
      console.log('Update result:', result);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!formData.firstName && !formData.lastName) return 'U';
    
    const firstInitial = formData.firstName ? formData.firstName[0] : '';
    const lastInitial = formData.lastName ? formData.lastName[0] : '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };
  
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                      {previewImage ? (
                        <AvatarImage src={previewImage} alt={formData.firstName} />
                      ) : null}
                      <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">Profile Photo</p>
                    <p className="text-xs text-gray-500">Click on the avatar to change</p>
                  </div>
                </div>
                
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
              <p className="text-muted-foreground mb-6">Manage your password and security preferences.</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="Enter your current password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="Enter your new password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Confirm your new password" />
                </div>
                
                <div className="flex justify-end">
                  <Button>Update Password</Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
              <p className="text-muted-foreground mb-6">Manage how you receive notifications.</p>
              
              {/* Notification settings would go here */}
              <p>Notification settings coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default AccountSetting;