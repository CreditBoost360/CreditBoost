import apiConfig from "@/config/api.config";

// Helper function to get API URL
const getApiUrl = (endpoint) => {
    return `${apiConfig.getApiUrl(endpoint)}`;
};

// Mock data for development
const MOCK_DATA = {
    communities: [
        {
            id: '1',
            name: 'Credit Score Improvement',
            description: 'A community focused on helping each other improve credit scores through proven strategies and support.',
            category: 'credit-score',
            member_count: 245,
            message_count: 1289,
            rating: 4.8,
            is_member: true,
            trending: true,
            created_at: '2023-01-15T12:00:00Z'
        },
        {
            id: '2',
            name: 'Budgeting Basics',
            description: 'Learn and share budgeting techniques to help manage your finances better and achieve your financial goals.',
            category: 'budgeting',
            member_count: 189,
            message_count: 876,
            rating: 4.5,
            is_member: false,
            created_at: '2023-02-20T12:00:00Z'
        },
        {
            id: '3',
            name: 'Investment Strategies',
            description: 'Discuss various investment options and strategies for long-term wealth building and financial independence.',
            category: 'investing',
            member_count: 312,
            message_count: 1567,
            rating: 4.7,
            is_member: false,
            trending: true,
            created_at: '2023-03-10T12:00:00Z'
        },
        {
            id: '4',
            name: 'Debt Freedom Journey',
            description: 'Support group for those working to become debt-free. Share your progress, challenges, and victories.',
            category: 'debt',
            member_count: 178,
            message_count: 923,
            rating: 4.9,
            is_member: true,
            created_at: '2023-04-05T12:00:00Z'
        },
        {
            id: '5',
            name: 'First-Time Homebuyers',
            description: 'Navigate the process of buying your first home with advice from others who have been through it.',
            category: 'housing',
            member_count: 156,
            message_count: 734,
            rating: 4.6,
            is_member: false,
            created_at: '2023-05-12T12:00:00Z'
        },
        {
            id: '6',
            name: 'Student Loan Support',
            description: 'Discuss strategies for managing and paying off student loans efficiently.',
            category: 'education',
            member_count: 203,
            message_count: 1045,
            rating: 4.4,
            is_member: false,
            created_at: '2023-06-18T12:00:00Z'
        }
    ],
    messages: [
        {
            id: '101',
            community_id: '1',
            user_id: '1001',
            user_name: 'Sarah Johnson',
            content: 'Hi everyone! I just wanted to share that I increased my credit score by 85 points in the last 3 months by following the advice here. Thank you all for your support!',
            timestamp: '2023-07-15T14:30:00Z',
            is_own: false
        },
        {
            id: '102',
            community_id: '1',
            user_id: '1002',
            user_name: 'Michael Chen',
            content: 'That\'s amazing Sarah! What specific strategies worked best for you?',
            timestamp: '2023-07-15T14:35:00Z',
            is_own: false
        },
        {
            id: '103',
            community_id: '1',
            user_id: '1001',
            user_name: 'Sarah Johnson',
            content: 'The biggest impact came from disputing some old incorrect information on my report and reducing my credit utilization to under 30%. Also, I set up automatic payments to avoid any late payments.',
            timestamp: '2023-07-15T14:40:00Z',
            is_own: false
        },
        {
            id: '104',
            community_id: '1',
            user_id: '1003',
            user_name: 'Current User',
            content: 'Thanks for sharing Sarah! I\'m just starting my credit improvement journey. Did you use any specific tools to help track your progress?',
            timestamp: '2023-07-15T14:45:00Z',
            is_own: true
        },
        {
            id: '105',
            community_id: '1',
            user_id: '1001',
            user_name: 'Sarah Johnson',
            content: 'Yes! I used CreditBoost\'s score simulator to see how different actions would affect my score before I took them. It was really helpful for planning my strategy.',
            timestamp: '2023-07-15T14:50:00Z',
            is_own: false
        }
    ],
    members: [
        {
            id: '1001',
            name: 'Sarah Johnson',
            role: 'admin',
            joined_at: '2023-01-15T12:00:00Z'
        },
        {
            id: '1002',
            name: 'Michael Chen',
            role: 'member',
            joined_at: '2023-01-16T14:30:00Z'
        },
        {
            id: '1003',
            name: 'Current User',
            role: 'member',
            joined_at: '2023-01-20T09:15:00Z'
        },
        {
            id: '1004',
            name: 'Emily Rodriguez',
            role: 'member',
            joined_at: '2023-01-22T16:45:00Z'
        },
        {
            id: '1005',
            name: 'David Kim',
            role: 'member',
            joined_at: '2023-01-25T11:20:00Z'
        },
        {
            id: '1006',
            name: 'Lisa Patel',
            role: 'member',
            joined_at: '2023-01-28T13:10:00Z'
        }
    ]
};

// Use mock data in development, real API in production
const useMockData = true;

export const communityService = {
    getAllCommunities: async (filter = 'all', category = 'all') => {
        if (useMockData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            let filteredCommunities = [...MOCK_DATA.communities];
            
            // Apply filter
            if (filter === 'joined') {
                filteredCommunities = filteredCommunities.filter(c => c.is_member);
            }
            
            // Apply category filter
            if (category !== 'all' && category !== 'trending') {
                filteredCommunities = filteredCommunities.filter(c => c.category === category);
            } else if (category === 'trending') {
                filteredCommunities = filteredCommunities.filter(c => c.trending);
            }
            
            return { communities: filteredCommunities };
        }
        
        try {
            const response = await fetch(
                getApiUrl(`/communities?filter=${filter}&category=${category}`),
                {
                    method: 'GET',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching communities:', error);
            throw error;
        }
    },
    
    getCommunityById: async (id) => {
        if (useMockData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 700));
            
            const community = MOCK_DATA.communities.find(c => c.id === id);
            if (!community) {
                throw new Error('Community not found');
            }
            
            return {
                ...community,
                is_subscribed: community.is_member
            };
        }
        
        try {
            const response = await fetch(
                getApiUrl(`/communities/${id}`),
                {
                    method: 'GET',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching community:', error);
            throw error;
        }
    },

    createCommunity: async (data) => {
        if (useMockData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newCommunity = {
                id: `${MOCK_DATA.communities.length + 1}`,
                name: data.name,
                description: data.description,
                category: data.category || 'general',
                member_count: 1,
                message_count: 0,
                rating: 0,
                is_member: true,
                created_at: new Date().toISOString()
            };
            
            MOCK_DATA.communities.push(newCommunity);
            
            return newCommunity;
        }
        
        try {
            const response = await fetch(
                getApiUrl('/communities'),
                {
                    method: 'POST',
                    headers: apiConfig.getHeaders(true),
                    body: JSON.stringify(data)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error creating community:', error);
            throw error;
        }
    },

    joinCommunity: async (communityId) => {
        if (useMockData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const community = MOCK_DATA.communities.find(c => c.id === communityId);
            if (!community) {
                throw new Error('Community not found');
            }
            
            community.is_member = true;
            community.member_count += 1;
            
            return { success: true };
        }
        
        try {
            const response = await fetch(
                getApiUrl(`/communities/${communityId}/join`),
                {
                    method: 'POST',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error joining community:', error);
            throw error;
        }
    },

    getCommunityMessages: async (communityId) => {
        if (useMockData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const messages = MOCK_DATA.messages.filter(m => m.community_id === communityId);
            
            return { messages };
        }
        
        try {
            const response = await fetch(
                getApiUrl(`/communities/${communityId}/messages`),
                {
                    method: 'GET',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    sendMessage: async (communityId, content) => {
        if (useMockData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const newMessage = {
                id: `${Date.now()}`,
                community_id: communityId,
                user_id: '1003',
                user_name: 'Current User',
                content,
                timestamp: new Date().toISOString(),
                is_own: true
            };
            
            MOCK_DATA.messages.push(newMessage);
            
            // Update message count
            const community = MOCK_DATA.communities.find(c => c.id === communityId);
            if (community) {
                community.message_count += 1;
            }
            
            return { success: true, message: newMessage };
        }
        
        try {
            const response = await fetch(
                getApiUrl(`/communities/${communityId}/messages`),
                {
                    method: 'POST',
                    headers: apiConfig.getHeaders(true),
                    body: JSON.stringify({ content })
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },
    
    getCommunityMembers: async (communityId) => {
        if (useMockData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return { members: MOCK_DATA.members };
        }
        
        try {
            const response = await fetch(
                getApiUrl(`/communities/${communityId}/members`),
                {
                    method: 'GET',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching members:', error);
            throw error;
        }
    },
    
    subscribeToCommunity: async (communityId) => {
        if (useMockData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const community = MOCK_DATA.communities.find(c => c.id === communityId);
            if (!community) {
                throw new Error('Community not found');
            }
            
            return { success: true };
        }
        
        try {
            const response = await fetch(
                getApiUrl(`/communities/${communityId}/subscribe`),
                {
                    method: 'POST',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error subscribing to community:', error);
            throw error;
        }
    },
    
    unsubscribeFromCommunity: async (communityId) => {
        if (useMockData) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const community = MOCK_DATA.communities.find(c => c.id === communityId);
            if (!community) {
                throw new Error('Community not found');
            }
            
            return { success: true };
        }
        
        try {
            const response = await fetch(
                getApiUrl(`/communities/${communityId}/unsubscribe`),
                {
                    method: 'POST',
                    headers: apiConfig.getHeaders(true)
                }
            );
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error unsubscribing from community:', error);
            throw error;
        }
    }
};