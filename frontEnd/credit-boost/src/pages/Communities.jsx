import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { communityService } from '@/services/community.service';
import WelcomeMessage from '@/components/Communities/WelcomeMessage';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const Communities = () => {
    const [communities, setCommunities] = useState([]);
    const [filter, setFilter] = useState('all');
    const [category, setCategory] = useState('trending');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: 'general' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showWelcome, setShowWelcome] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if welcome message has been dismissed before
        const hasSeenWelcome = localStorage.getItem('hasSeenCommunityWelcome');
        if (hasSeenWelcome) {
            setShowWelcome(false);
        }
        
        fetchCommunities();
    }, [filter, category]);

    const fetchCommunities = async () => {
        setIsLoading(true);
        try {
            const data = await communityService.getAllCommunities(filter, category);
            setCommunities(data.communities || []);
        } catch (error) {
            console.error('Error fetching communities:', error);
            setError('Failed to load communities');
            setCommunities([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCommunity = async (e) => {
        e.preventDefault();
        try {
            await communityService.createCommunity(newCommunity);
            setNewCommunity({ name: '', description: '', category: 'general' });
            setIsDialogOpen(false); // Close the dialog
            await fetchCommunities(); // Refresh the communities list
        } catch (error) {
            console.error('Error creating community:', error);
        }
    };

    const handleJoinCommunity = async (communityId) => {
        try {
            await communityService.joinCommunity(communityId);
            await fetchCommunities();
        } catch (error) {
            console.error('Error joining community:', error);
        }
    };
    
    const handleDismissWelcome = () => {
        localStorage.setItem('hasSeenCommunityWelcome', 'true');
        setShowWelcome(false);
    };
    
    const handleCategorySelect = (categoryId) => {
        setCategory(categoryId);
    };

    // Categories with SVG icons
    const categories = [
        { 
            id: 'trending', 
            name: 'Trending', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
            )
        },
        { 
            id: 'credit-score', 
            name: 'Credit Score', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
            )
        },
        { 
            id: 'budgeting', 
            name: 'Budgeting', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
            )
        },
        { 
            id: 'saving', 
            name: 'Saving', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path>
                    <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
                    <path d="M16 11h0"></path>
                </svg>
            )
        },
        { 
            id: 'investing', 
            name: 'Investing', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            )
        },
    ];
    
    // Filter communities based on search query
    const filteredCommunities = communities.filter(community => 
        community?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate activity level based on message count and member count
    const getActivityLevel = (community) => {
        const messageCount = community?.message_count || 0;
        const memberCount = community?.member_count || 0;
        
        if (messageCount > memberCount * 5) return 'Very Active';
        if (messageCount > memberCount * 2) return 'Active';
        if (messageCount > memberCount) return 'Moderate';
        return 'New';
    };
    
    // Get activity badge color
    const getActivityColor = (level) => {
        switch (level) {
            case 'Very Active': return 'bg-green-100 text-green-800 border-green-200';
            case 'Active': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    
    // Get category badge color
    const getCategoryColor = (category) => {
        const categoryStr = category?.toLowerCase() || '';
        
        if (categoryStr.includes('invest')) return 'bg-purple-100 text-purple-800 border-purple-200';
        if (categoryStr.includes('save')) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (categoryStr.includes('budget')) return 'bg-green-100 text-green-800 border-green-200';
        if (categoryStr.includes('debt')) return 'bg-red-100 text-red-800 border-red-200';
        if (categoryStr.includes('credit')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <AuthenticatedLayout>
            <div className="container mx-auto px-4 py-6">
                {/* Welcome Message */}
                {showWelcome && <WelcomeMessage onDismiss={handleDismissWelcome} />}
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Communities</h1>
                        <p className="text-gray-500">Connect with others on your financial journey</p>
                    </div>
                    
                    <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create Community
                    </Button>
                </div>
                
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <Input
                            placeholder="Search communities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            className="flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            All Communities
                        </Button>
                        
                        <Button
                            variant={filter === 'joined' ? 'default' : 'outline'}
                            onClick={() => setFilter('joined')}
                            className="flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 12h-4"></path>
                                <path d="M18 8v8"></path>
                            </svg>
                            My Communities
                        </Button>
                    </div>
                </div>
                
                {/* Categories */}
                <div className="mb-6 overflow-x-auto pb-2">
                    <div className="flex space-x-2">
                        {categories.map((cat) => (
                            <Button
                                key={cat.id}
                                variant={category === cat.id ? "default" : "outline"}
                                className={`flex items-center gap-2 whitespace-nowrap ${
                                    category === cat.id ? 'bg-primary text-primary-foreground' : 'bg-background'
                                }`}
                                onClick={() => handleCategorySelect(cat.id)}
                            >
                                {cat.icon}
                                <span>{cat.name}</span>
                            </Button>
                        ))}
                    </div>
                </div>
                
                {/* Communities Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="text-gray-500">Loading communities...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Communities</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={fetchCommunities}>Try Again</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCommunities.length > 0 ? (
                            filteredCommunities.map((community) => {
                                const activityLevel = getActivityLevel(community);
                                
                                return (
                                    <Card key={community?.id} className="overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-semibold">{community?.name}</h3>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <Badge variant="outline" className={getCategoryColor(community?.category)}>
                                                            {community?.category || 'General'}
                                                        </Badge>
                                                        <Badge variant="outline" className={getActivityColor(activityLevel)}>
                                                            {activityLevel}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                    </svg>
                                                    <span className="font-medium">{community?.rating?.toFixed(1) || '0.0'}</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        
                                        <CardContent className="flex-grow">
                                            <p className="text-gray-600 line-clamp-3 mb-4">{community?.description}</p>
                                            
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-auto">
                                                <div className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="9" cy="7" r="4"></circle>
                                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                    </svg>
                                                    <span>{community?.member_count || 0} members</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                                    </svg>
                                                    <span>{community?.message_count || 0} messages</span>
                                                </div>
                                                
                                                {community?.trending && (
                                                    <div className="flex items-center gap-1 text-blue-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                                            <polyline points="17 6 23 6 23 12"></polyline>
                                                        </svg>
                                                        <span>Trending</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        
                                        <CardFooter className="pt-2 border-t flex justify-between">
                                            <div className="flex -space-x-2">
                                                {[...Array(Math.min(3, community?.member_count || 0))].map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                            <circle cx="12" cy="7" r="4"></circle>
                                                        </svg>
                                                    </div>
                                                ))}
                                                
                                                {(community?.member_count || 0) > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                                        +{(community?.member_count || 0) - 3}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                {!community?.is_member && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleJoinCommunity(community.id)}
                                                    >
                                                        Join
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    onClick={() => navigate(`/community/${community.id}`)}
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Communities Found</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchQuery 
                                        ? "No communities match your search criteria." 
                                        : filter === 'joined'
                                            ? "You haven't joined any communities yet."
                                            : "No communities available in this category."}
                                </p>
                                <Button onClick={() => setIsDialogOpen(true)}>
                                    Create a Community
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Create Community Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Community</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCommunity} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">
                                    Community Name
                                </label>
                                <Input
                                    id="name"
                                    value={newCommunity.name}
                                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium mb-1">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={newCommunity.category}
                                    onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                    required
                                >
                                    <option value="general">General Finance</option>
                                    <option value="credit-score">Credit Score</option>
                                    <option value="budgeting">Budgeting</option>
                                    <option value="saving">Saving</option>
                                    <option value="investing">Investing</option>
                                    <option value="debt">Debt Management</option>
                                    <option value="housing">Housing</option>
                                    <option value="education">Education</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={newCommunity.description}
                                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                                    className="w-full p-2 border rounded-md h-32"
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Create Community
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
};

export default Communities;