import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { communityService } from '@/services/community.service';
import EnhancedCommunityChat from '@/components/Communities/EnhancedCommunityChat';

const CommunityPage = () => {
    const { id } = useParams();
    const [community, setCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('chat');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [members, setMembers] = useState([]);
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        fetchCommunityDetails();
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000);
        
        // Get user's preferred language
        const userLang = localStorage.getItem('preferredLanguage') || 'en';
        setLanguage(userLang);
        
        return () => clearInterval(interval);
    }, [id]);

    const fetchCommunityDetails = async () => {
        try {
            const response = await communityService.getCommunityById(id);
            setCommunity(response);
            setIsSubscribed(response.is_subscribed || false);
            
            // Fetch members
            const membersData = await communityService.getCommunityMembers(id);
            setMembers(membersData.members || []);
        } catch (error) {
            console.error('Error fetching community details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await communityService.getCommunityMessages(id);
            setMessages(response.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (messageData) => {
        try {
            await communityService.sendMessage(id, messageData.content, messageData.replyTo);
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };
    
    const toggleSubscription = async () => {
        try {
            if (isSubscribed) {
                await communityService.unsubscribeFromCommunity(id);
            } else {
                await communityService.subscribeToCommunity(id);
            }
            setIsSubscribed(!isSubscribed);
        } catch (error) {
            console.error('Error toggling subscription:', error);
        }
    };

    if (isLoading) {
        return (
            <AuthenticatedLayout>
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-gray-500">Loading community...</p>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto px-4 py-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/communities">
                        <Button variant="ghost" size="sm" className="gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Back to Communities
                        </Button>
                    </Link>
                </div>
                
                {/* Community Header */}
                <Card className="mb-6">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                    {community?.icon ? (
                                        <img 
                                            src={community.icon} 
                                            alt={community?.name} 
                                            className="w-full h-full rounded-lg object-cover"
                                        />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    )}
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold">{community?.name}</h1>
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                            {community?.category || 'General'}
                                        </Badge>
                                    </div>
                                    <p className="text-gray-600 mt-1">{community?.description}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={toggleSubscription}
                                    className="gap-2"
                                >
                                    {isSubscribed ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                                <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
                                                <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
                                                <path d="M18 8a6 6 0 0 0-9.33-5"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                            Unsubscribe
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                            </svg>
                                            Subscribe
                                        </>
                                    )}
                                </Button>
                                
                                <Button variant="outline" size="sm" className="gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="18" cy="5" r="3"></circle>
                                        <circle cx="6" cy="12" r="3"></circle>
                                        <circle cx="18" cy="19" r="3"></circle>
                                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                    </svg>
                                    Share
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 pb-4">
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <span className="text-sm">{community?.member_count || 0} members</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span className="text-sm">{messages.length} messages</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <span className="text-sm">{community?.rating?.toFixed(1) || '0.0'} rating</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span className="text-sm">Created {new Date(community?.created_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <path d="m5 8 6 6"></path>
                                    <path d="m4 14 6-6 2-3"></path>
                                    <path d="M2 5h12"></path>
                                    <path d="M7 2h1"></path>
                                    <path d="m22 22-5-10-5 10"></path>
                                    <path d="M14 18h6"></path>
                                </svg>
                                <span className="text-sm">Language: {language.toUpperCase()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Tabs */}
                <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList>
                        <TabsTrigger value="chat" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Chat
                        </TabsTrigger>
                        <TabsTrigger value="members" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            Members
                        </TabsTrigger>
                        <TabsTrigger value="resources" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            Resources
                        </TabsTrigger>
                        <TabsTrigger value="about" className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            About
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="chat" className="mt-6">
                        <EnhancedCommunityChat 
                            messages={messages} 
                            onSendMessage={handleSendMessage} 
                            community={community} 
                        />
                    </TabsContent>
                    
                    <TabsContent value="members" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Community Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {members.map(member => (
                                        <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {member.avatar ? (
                                                    <img 
                                                        src={member.avatar} 
                                                        alt={member.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                                                        {member.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {member.role === 'admin' ? 'Admin' : 'Member'} • Joined {new Date(member.joined_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="resources" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Community Resources</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-gray-600">
                                        Shared resources and files for this community will appear here.
                                    </p>
                                    
                                    {/* Example resources */}
                                    <div className="border rounded-lg divide-y">
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                                    <polyline points="10 9 9 9 8 9"></polyline>
                                                </svg>
                                                <div>
                                                    <p className="font-medium">Budgeting Template</p>
                                                    <p className="text-xs text-gray-500">Shared by Admin • PDF • 2.4MB</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">Download</Button>
                                        </div>
                                        
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                                    <polyline points="10 9 9 9 8 9"></polyline>
                                                </svg>
                                                <div>
                                                    <p className="font-medium">Credit Score Guide</p>
                                                    <p className="text-xs text-gray-500">Shared by Admin • PDF • 1.8MB</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline">Download</Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="about" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>About This Community</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Description</h3>
                                        <p className="text-gray-600">{community?.description}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Guidelines</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                            <li>Be respectful and supportive of other members</li>
                                            <li>Do not share personal financial information (account numbers, etc.)</li>
                                            <li>Avoid giving specific investment advice</li>
                                            <li>No spam, solicitation, or promotional content</li>
                                            <li>Report inappropriate content to community moderators</li>
                                        </ul>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Moderators</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {members
                                                .filter(member => member.role === 'admin')
                                                .map(admin => (
                                                    <div key={admin.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                            {admin.avatar ? (
                                                                <img 
                                                                    src={admin.avatar} 
                                                                    alt={admin.name} 
                                                                    className="w-full h-full rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                admin.name?.charAt(0).toUpperCase() || '?'
                                                            )}
                                                        </div>
                                                        <span className="text-sm">{admin.name}</span>
                                                    </div>
                                                ))}
                                        </div>
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

export default CommunityPage;