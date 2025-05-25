import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MessageSquare from './MessageSquare';

/**
 * Community Chat Component
 * A modern chat interface similar to WhatsApp or Instagram
 */
const CommunityChat = ({ 
  messages = [], 
  onSendMessage, 
  community = {}, 
  isLoading = false 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage);
    setNewMessage('');
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {community.icon ? (
              <img src={community.icon} alt={community.name} className="w-full h-full rounded-full" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-medium">{community.name}</h3>
            <p className="text-xs text-gray-500">{community.member_count || 0} members</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" title="Community Info">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </Button>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
            <p className="text-gray-500 mt-2">Be the first to start a conversation in this community!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="mb-6">
              <div className="flex justify-center mb-4">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                  {date === new Date().toLocaleDateString() ? 'Today' : date}
                </span>
              </div>
              
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${message.is_own ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {!message.is_own && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {message.user_avatar ? (
                          <img 
                            src={message.user_avatar} 
                            alt={message.user_name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                            {message.user_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`rounded-2xl p-3 ${
                        message.is_own
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-white rounded-tl-none shadow-sm'
                      }`}
                    >
                      {!message.is_own && (
                        <p className="text-xs font-medium mb-1 text-gray-700">
                          {message.user_name}
                        </p>
                      )}
                      
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      
                      {message.image_url && (
                        <img 
                          src={message.image_url} 
                          alt="Shared image" 
                          className="mt-2 rounded-lg max-w-full max-h-60 object-contain"
                        />
                      )}
                      
                      <p className={`text-xs mt-1 text-right ${message.is_own ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-gray-700"
            onClick={handleFileSelect}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-gray-700"
            onClick={handleFileSelect}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </Button>
          
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 py-2 px-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </Button>
          
          <Button 
            type="submit" 
            size="sm" 
            className="rounded-full" 
            disabled={!newMessage.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </Button>
        </div>
        
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
        />
      </form>
    </Card>
  );
};

export default CommunityChat;