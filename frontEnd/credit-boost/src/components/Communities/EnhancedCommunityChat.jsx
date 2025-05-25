import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Enhanced Community Chat Component
 * A modern chat interface similar to WhatsApp with additional social features
 */
const EnhancedCommunityChat = ({ 
  messages = [], 
  onSendMessage, 
  community = {}, 
  isLoading = false 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showStories, setShowStories] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  
  // Common emojis for quick selection
  const commonEmojis = ['👍', '❤️', '😊', '😂', '🙏', '👏', '🔥', '💯', '🎉', '👀'];
  
  // Sample stories data
  const stories = [
    { id: 1, user: 'Sarah Johnson', avatar: null, seen: false, time: '2h ago' },
    { id: 2, user: 'Michael Chen', avatar: null, seen: true, time: '5h ago' },
    { id: 3, user: 'Emily Rodriguez', avatar: null, seen: false, time: '8h ago' },
    { id: 4, user: 'David Kim', avatar: null, seen: false, time: '12h ago' },
    { id: 5, user: 'Lisa Patel', avatar: null, seen: true, time: '1d ago' }
  ];
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    } else {
      clearInterval(recordingInterval);
      setRecordingTime(0);
    }
    
    return () => clearInterval(recordingInterval);
  }, [isRecording]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const messageData = {
      content: newMessage,
      replyTo: replyingTo ? replyingTo.id : null
    };
    
    onSendMessage(messageData);
    setNewMessage('');
    setReplyingTo(null);
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Handle file upload
    console.log('File selected:', file);
    
    // Reset input
    e.target.value = '';
  };
  
  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  const handleStartRecording = () => {
    // Request microphone permission and start recording
    setIsRecording(true);
  };
  
  const handleStopRecording = () => {
    // Stop recording and process audio
    setIsRecording(false);
    
    // Simulate sending voice message
    onSendMessage({
      content: `[Voice message - ${recordingTime}s]`,
      type: 'voice'
    });
  };
  
  const handleCancelRecording = () => {
    // Cancel recording without sending
    setIsRecording(false);
  };
  
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
  };
  
  const handleReactionToMessage = (messageId, reaction) => {
    // Handle reaction to message
    console.log(`Reacted with ${reaction} to message ${messageId}`);
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowStories(!showStories)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v8"></path>
              <path d="M8 12h8"></path>
            </svg>
            <span className="sr-only">Stories</span>
          </Button>
          <Button variant="ghost" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
      
      {/* Stories Section (conditionally shown) */}
      {showStories && (
        <div className="p-2 border-b bg-gray-50">
          <div className="flex overflow-x-auto gap-2 pb-2">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
              </div>
              <p className="text-xs text-center mt-1">Add Story</p>
            </div>
            
            {stories.map(story => (
              <div key={story.id} className="flex-shrink-0">
                <div className={`w-16 h-16 rounded-full border-2 ${story.seen ? 'border-gray-300' : 'border-primary'} flex items-center justify-center bg-gray-100 overflow-hidden`}>
                  {story.avatar ? (
                    <img src={story.avatar} alt={story.user} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                      {story.user.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-xs text-center mt-1 truncate w-16">{story.user.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/60">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
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
                  <div className="flex items-end gap-2 max-w-[80%] group">
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
                      className={`rounded-2xl p-3 relative ${
                        message.is_own
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-white rounded-tl-none shadow-sm'
                      }`}
                    >
                      {/* Reply indicator if this message is a reply */}
                      {message.replyTo && (
                        <div className={`text-xs p-2 rounded-lg mb-1 ${
                          message.is_own ? 'bg-primary-dark text-white/80' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <div className="font-medium">
                            {message.replyToUser || 'User'}
                          </div>
                          <div className="truncate">{message.replyToContent}</div>
                        </div>
                      )}
                      
                      {!message.is_own && (
                        <p className="text-xs font-medium mb-1 text-gray-700">
                          {message.user_name}
                        </p>
                      )}
                      
                      {message.type === 'voice' ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </Button>
                          <div className="flex-1">
                            <div className="h-1 bg-gray-200 rounded-full">
                              <div className="h-1 bg-primary rounded-full w-0"></div>
                            </div>
                          </div>
                          <span className="text-xs">{message.content.split('-')[1].trim()}</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}
                      
                      {message.image_url && (
                        <img 
                          src={message.image_url} 
                          alt="Shared image" 
                          className="mt-2 rounded-lg max-w-full max-h-60 object-contain"
                        />
                      )}
                      
                      <p className={`text-xs mt-1 text-right ${message.is_own ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.seen && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </p>
                      
                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className={`absolute ${message.is_own ? 'left-0' : 'right-0'} bottom-0 transform ${message.is_own ? '-translate-x-1/2' : 'translate-x-1/2'} translate-y-1/3`}>
                          <div className="flex bg-white rounded-full shadow-md p-1">
                            {message.reactions.map((reaction, i) => (
                              <div key={i} className="w-5 h-5 flex items-center justify-center text-xs">
                                {reaction.emoji}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Message actions on hover */}
                      <div className="absolute top-0 right-0 transform translate-x-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mr-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 rounded-full p-0 bg-white shadow-sm"
                          onClick={() => handleReplyToMessage(message)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 17 4 12 9 7"></polyline>
                            <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                          </svg>
                        </Button>
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 rounded-full p-0 bg-white shadow-sm"
                            onClick={() => handleReactionToMessage(message.id, '👍')}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {message.is_own && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Reply indicator */}
      {replyingTo && (
        <div className="p-2 border-t bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 17 4 12 9 7"></polyline>
              <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
            </svg>
            <div>
              <div className="text-xs font-medium">Replying to {replyingTo.user_name}</div>
              <div className="text-xs text-gray-500 truncate max-w-[200px]">{replyingTo.content}</div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={() => setReplyingTo(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>
      )}
      
      {/* Recording indicator */}
      {isRecording && (
        <div className="p-3 border-t bg-red-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <span>Recording... {formatRecordingTime(recordingTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-500"
              onClick={handleCancelRecording}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleStopRecording}
            >
              Send
            </Button>
          </div>
        </div>
      )}
      
      {/* Message Input */}
      {!isRecording && (
        <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </Button>
              
              {/* Emoji picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg p-2 z-10">
                  <div className="grid grid-cols-5 gap-1">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                        onClick={() => handleEmojiClick(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
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
            
            {newMessage.trim() ? (
              <Button 
                type="submit" 
                size="sm" 
                className="rounded-full" 
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </Button>
            ) : (
              <Button 
                type="button" 
                size="sm" 
                className="rounded-full"
                onClick={handleStartRecording}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </Button>
            )}
          </div>
          
          {/* Hidden file inputs */}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <input 
            type="file" 
            ref={audioInputRef} 
            className="hidden" 
            accept="audio/*"
          />
        </form>
      )}
    </Card>
  );
};

export default EnhancedCommunityChat;