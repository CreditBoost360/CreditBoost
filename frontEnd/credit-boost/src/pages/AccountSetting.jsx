import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { settingsService } from '@/services/settingsService';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { AppContext } from '@/context/AppContext';
import { authService } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';

const AccountSetting = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user, updateUser, logout } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        avatarUrl: user?.avatarUrl || ''
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        emailUpdates: true,
        creditScoreChanges: true,
        newLearningContent: false,
        desktopNotifications: true,
        soundNotifications: false
    });

  

    useEffect(() => {
        const initializeSettings = async () => {
            try {
                setLoading(true);
                
                // Try to get cached settings first
                const cachedSettings = localStorage.getItem('user_settings');
                let settings = cachedSettings ? JSON.parse(cachedSettings) : null;
        
                try {
                    // Attempt to verify token and get fresh settings
                    await authService.verifyToken();
                    settings = await settingsService.getCurrentSettings();
                    
                    // Cache the new settings
                    localStorage.setItem('user_settings', JSON.stringify(settings));
                } catch (error) {
                    console.error('API connection error:', error);
                    // If we have cached settings, use them
                    if (!settings) {
                        throw error; // Only throw if we have no fallback
                    }
                }
        
                // Update state with whatever settings we have
                if (user) {
                    setProfileData(prevData => ({
                        ...prevData,
                        firstName: user.firstName || prevData.firstName,
                        lastName: user.lastName || prevData.lastName,
                        email: user.email || prevData.email,
                        phone: user.phone || prevData.phone,
                        avatarUrl: user.avatarUrl || prevData.avatarUrl
                    }));
                }
        
                setNotifications(settings?.notifications || {
                    emailUpdates: true,
                    creditScoreChanges: true,
                    newLearningContent: false,
                    desktopNotifications: true,
                    soundNotifications: false
                });
            } catch (error) {
                console.error('Settings load error:', error);
                
                if (error.message === 'Token invalid' || error.message === 'No auth token') {
                    toast({
                        variant: "destructive",
                        title: "Session Expired",
                        description: "Please log in again"
                    });
                    logout();
                    navigate('/login');
                    return;
                }
        
                toast({
                    variant: "destructive",
                    title: "Connection Error",
                    description: "Unable to connect to the server. Using cached data."
                });
            } finally {
                setLoading(false);
            }
        };

        initializeSettings();
    }, [user, logout, navigate, toast]);
 
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Validate data first
            if (!profileData.firstName || !profileData.lastName || !profileData.email) {
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: "First name, last name, and email are required"
                });
                return;
            }
    
            // Check if email is being changed
            const isEmailChanged = user?.email !== profileData.email;
    
            // Verify token before proceeding
            const isTokenValid = await authService.verifyToken();
            if (!isTokenValid) {
                throw new Error('Token invalid');
            }
    
            // Update profile
            const updatedProfile = await settingsService.updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phone: profileData.phone || null
            });
    
            if (!updatedProfile) {
                throw new Error('Failed to update profile');
            }
    
            // Update both local state and global context
            setProfileData(prev => ({
                ...prev,
                ...updatedProfile
            }));
    
            await updateUser(updatedProfile);
    
            if (isEmailChanged) {
                toast({
                    title: "Email Updated",
                    description: "Your profile has been updated. Please log in again with your new email."
                });
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 2000);
            } else {
                toast({
                    title: "Success",
                    description: "Profile updated successfully"
                });
            }
    
        } catch (error) {
            console.error('Profile update error:', error);
            
            if (error.message === 'Token invalid' || error.message === 'No auth token') {
                toast({
                    variant: "destructive",
                    title: "Session Expired",
                    description: "Please log in again to continue"
                });
                logout();
                navigate('/login');
                return;
            }
    
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message || "Failed to update profile"
            });
        } finally {
            setSaving(false);
        }
    };


    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Password Mismatch",
                description: "New passwords do not match"
            });
            return;
        }

        setSaving(true);
        try {
            // Verify token before update
            await authService.verifyToken();
            
            await settingsService.updatePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            
            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            toast({
                title: "Password Updated",
                description: "Your password has been updated successfully. Please log in again."
            });
            
            // Force re-login after password change
            logout();
            navigate('/login');
        } catch (error) {
            if (error.message === 'Token invalid' || error.message === 'No auth token') {
                toast({
                    variant: "destructive",
                    title: "Session Expired",
                    description: "Please log in again"
                });
                logout();
                navigate('/login');
                return;
            }

            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message || "Failed to update password"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleNotificationUpdate = async (key, value) => {
        try {
            // Verify token before update
            await authService.verifyToken();
            
            const newSettings = {
                ...notifications,
                [key]: value
            };
            
            await settingsService.updateNotifications(newSettings);
            setNotifications(newSettings);
            
            toast({
                title: "Notifications Updated",
                description: "Your notification preferences have been updated"
            });
        } catch (error) {
            if (error.message === 'Token invalid' || error.message === 'No auth token') {
                toast({
                    variant: "destructive",
                    title: "Session Expired",
                    description: "Please log in again"
                });
                logout();
                navigate('/login');
                return;
            }

            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message || "Failed to update notifications"
            });
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast({
                variant: "destructive",
                title: "Invalid File Type",
                description: "Please upload a JPEG, PNG, GIF, or WebP image"
            });
            return;
        }
    
        // 5MB size limit
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast({
                variant: "destructive",
                title: "File Too Large",
                description: "Please upload an image smaller than 5MB"
            });
            return;
        }
    
        try {
            setSaving(true);
            
            // Verify token before upload
            await authService.verifyToken();
    
            const result = await settingsService.uploadProfilePhoto(file);
            const photoUrl = result.photoUrl;
            
            setProfileData(prev => ({
                ...prev,
                avatarUrl: photoUrl
            }));
            
            // Update user context through the proper method
            await updateUser({ avatarUrl: photoUrl });
    
            toast({
                title: "Photo Updated",
                description: "Your profile photo has been updated successfully"
            });
        } catch (error) {
            if (error.message === 'Token invalid' || error.message === 'No auth token') {
                toast({
                    variant: "destructive",
                    title: "Session Expired",
                    description: "Please log in again"
                });
                logout();
                navigate('/login');
                return;
            }
    
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error.message || "Failed to upload photo"
            });
        } finally {
            setSaving(false);
            // Reset the file input
            e.target.value = '';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold">Account Settings</h1>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="help">Help & Support</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage
                                            loading="lazy"
                                            decoding="async"
                                            fetchPriority="high"
                                            src={profileData.avatarUrl || "/api/placeholder/80/80"}
                                            alt="Profile"
                                            onError={(e) => {
                                                e.currentTarget.src = "/api/placeholder/80/80";
                                            }}
                                        />
                                        <AvatarFallback>
                                            {saving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                `${profileData.firstName?.[0]}${profileData.lastName?.[0]}`
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <input
                                            type="file"
                                            id="photo-upload"
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={handlePhotoUpload}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => document.getElementById('photo-upload').click()}
                                            disabled={saving}
                                        >
                                            Change Photo
                                        </Button>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">First Name</label>
                                            <Input
                                                value={profileData.firstName}
                                                onChange={(e) => setProfileData(prev => ({
                                                    ...prev,
                                                    firstName: e.target.value
                                                }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last Name</label>
                                            <Input
                                                value={profileData.lastName}
                                                onChange={(e) => setProfileData(prev => ({
                                                    ...prev,
                                                    lastName: e.target.value
                                                }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <Input
                                                value={profileData.email}
                                                onChange={(e) => setProfileData(prev => ({
                                                    ...prev,
                                                    email: e.target.value
                                                }))}
                                                type="email"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone</label>
                                            <Input
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData(prev => ({
                                                    ...prev,
                                                    phone: e.target.value
                                                }))}
                                                type="tel"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : 'Save Changes'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Current Password</label>
                                        <Input
                                            type="password"
                                            value={passwords.currentPassword}
                                            onChange={(e) => setPasswords(prev => ({
                                                ...prev,
                                                currentPassword: e.target.value
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">New Password</label>
                                        <Input
                                            type="password"
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords(prev => ({
                                                ...prev,
                                                newPassword: e.target.value
                                            }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirm New Password</label>
                                        <Input
                                            type="password"
                                            value={passwords.confirmPassword}
                                            onChange={(e) => setPasswords(prev => ({
                                                ...prev,
                                                confirmPassword: e.target.value
                                            }))}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : 'Update Password'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Email Updates</div>
                                            <div className="text-sm text-muted-foreground">
                                                Receive updates about your account
                                            </div>
                                        </div>
                                        <Switch
                                            checked={notifications.emailUpdates}
                                            onCheckedChange={(checked) => handleNotificationUpdate('emailUpdates', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Credit Score Changes</div>
                                            <div className="text-sm text-muted-foreground">
                                                Get notified when your credit score changes
                                            </div>
                                        </div>
                                        <Switch
                                            checked={notifications.creditScoreChanges}
                                            onCheckedChange={(checked) => handleNotificationUpdate('creditScoreChanges', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <div className="text-sm font-medium">Desktop Notifications</div>
                                            <div className="text-sm text-muted-foreground">
                                                Receive notifications on your desktop
                                            </div>
                                        </div>
                                        <Switch
                                            checked={notifications.desktopNotifications}
                                            onCheckedChange={(checked) => handleNotificationUpdate('desktopNotifications', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="help">
                        <Card>
                            <CardHeader>
                                <CardTitle>Help & Support</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="bg-muted p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Contact Support</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Our support team is available 24/7 to help you with any questions or concerns.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <Mail className="h-4 w-4 mr-2" />
                                                <span className="text-sm">support@creditboost.com</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="h-4 w-4 mr-2" />
                                                <span className="text-sm">1-800-CREDIT-BOOST</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-muted p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">FAQs</h3>
                                        <ul className="space-y-2">
                                            <li>
                                                <button className="text-sm text-left w-full hover:text-primary">
                                                    How do I improve my credit score?
                                                </button>
                                            </li>
                                            <li>
                                                <button className="text-sm text-left w-full hover:text-primary">
                                                    What factors affect my credit score?
                                                </button>
                                            </li>
                                            <li>
                                                <button className="text-sm text-left w-full hover:text-primary">
                                                    How often is my credit score updated?
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>

    );
};

export default AccountSetting;