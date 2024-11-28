import React, { useState, useEffect } from 'react';
import { Share2, Link, Trash2 } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { transactionChat } from '@/services/transactionChat';
import { creditDataService } from '@/services/creditData.service';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { chatHistoryService } from '@/services/chatHistory.service';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

const DataChatInterface = () => {
    const [selectedSource, setSelectedSource] = useState('');
    const [selectedData, setSelectedData] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableData, setAvailableData] = useState([]);
    const [chatTitle, setChatTitle] = useState('');
    const [chatHistories, setChatHistories] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteHistory, setDeleteHistory] = useState(null);

    const { toast } = useToast();

    const sources = [
        { value: 'mpesa', label: 'M-Pesa' },
        { value: 'transunion', label: 'TransUnion' },
        { value: 'experian', label: 'Experian' },
        { value: 'equifax', label: 'Equifax' }
    ];

    // Fetch both available data and chat histories when source changes
    useEffect(() => {
        if (selectedSource) {
            fetchAvailableData();
            setCurrentPage(1);
            fetchChatHistories(1);
        }
    }, [selectedSource]);

    // Handle pagination changes
    useEffect(() => {
        if (selectedSource && currentPage > 0) {
            fetchChatHistories(currentPage);
        }
    }, [currentPage]);

    const fetchChatHistories = async (page) => {
        try {
            setHistoryLoading(true);
            const response = await chatHistoryService.getHistories(selectedSource, page);
            setChatHistories(response.histories);
            setTotalPages(response.pagination.totalPages);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch chat histories",
                variant: "destructive"
            });
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchAvailableData = async () => {
        try {
            setLoading(true);
            const response = await creditDataService.getCreditData({
                source: selectedSource,
                status: 'completed'
            });
            setAvailableData(response.creditData);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch available data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleDataSelection = (item) => {
        const exists = selectedData.find(d => d.id === item.id);
        if (exists) {
            setSelectedData(selectedData.filter(d => d.id !== item.id));
        } else {
            setSelectedData([...selectedData, item]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || selectedData.length === 0) return;

        try {
            setLoading(true);
            const userMessage = {
                id: messages.length + 1,
                text: inputMessage,
                sender: 'user',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');

            const { aiResponse } = await transactionChat.sendChatMessage(
                selectedSource,
                inputMessage,
                selectedData.map(d => d.id)
            );

            const aiMessage = {
                id: messages.length + 2,
                text: aiResponse.message,
                sender: 'ai',
                timestamp: aiResponse.timestamp
            };
            setMessages(prev => [...prev, aiMessage]);

            await chatHistoryService.saveHistory(
                selectedSource,
                selectedData.map(d => d.id),
                [...messages, userMessage, aiMessage],
                chatTitle || `Chat ${new Date().toLocaleDateString()}`
            );

            // Refresh chat histories after saving
            fetchChatHistories(currentPage);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send message or save chat",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLoadHistory = async (history) => {
        try {
            setLoading(true);
            const selectedUploads = await Promise.all(
                history.uploadIds.map(async (id) => {
                    const response = await creditDataService.getCreditData({
                        id,
                        source: selectedSource,
                        status: 'completed'
                    });
                    return response.creditData.find(d => d.id === id);
                })
            );

            setSelectedData(selectedUploads.filter(Boolean));
            setMessages(history.messages);
            setChatTitle(history.title);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load chat history",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleShareHistory = async (history) => {
        try {
            const { shareToken } = await chatHistoryService.shareHistory(selectedSource, history.id);
            const shareUrl = `${window.location.origin}/shared-chat/${shareToken}`;
            await navigator.clipboard.writeText(shareUrl);
            toast({
                title: "Success",
                description: "Share link copied to clipboard"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to share chat history",
                variant: "destructive"
            });
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteHistory) return;

        try {
            await chatHistoryService.deleteHistory(selectedSource, deleteHistory.id);
            await fetchChatHistories(currentPage);
            toast({
                title: "Success",
                description: "Chat history deleted successfully"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete chat history",
                variant: "destructive"
            });
        } finally {
            setDeleteHistory(null);
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="flex h-screen max-h-[600px]"> {/* Reduced height by 40% from 800px */}
                {/* Left Panel - Data Selection */}
                <div className="w-1/2 border-r p-4 flex flex-col overflow-hidden">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Select Data to Analyze</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden flex flex-col">
                            {/* Source Selection */}
                            <div className="mb-6 flex-shrink-0">
                                <label className="block text-sm font-medium mb-2">
                                    Data Source
                                </label>
                                <Select
                                    value={selectedSource}
                                    onValueChange={(value) => {
                                        setSelectedSource(value);
                                        setSelectedData([]);
                                    }}
                                    disabled={loading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select data source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sources.map(source => (
                                            <SelectItem key={source.value} value={source.value}>
                                                {source.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Available Data List - Now Scrollable */}
                            {selectedSource && (
                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <h3 className="text-sm font-medium mb-4 flex-shrink-0">
                                        {loading ? 'Loading...' :
                                            availableData.length === 0 ? 'No data available' :
                                                `Select ${selectedSource === 'mpesa' ? 'M-Pesa' : selectedSource} data to analyze`}
                                    </h3>
                                    <div className="space-y-3 overflow-y-auto flex-1">
                                        {availableData.map(item => (
                                            <div
                                                key={item.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedData.find(d => d.id === item.id)
                                                    ? 'bg-blue-50 border-blue-500'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                                onClick={() => toggleDataSelection(item)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{item.fileName}</p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Uploaded on {new Date(item.uploadedAt).toLocaleDateString()}
                                                        </p>
                                                        {item.totalTransactions && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {item.totalTransactions} transactions
                                                            </p>
                                                        )}
                                                    </div>
                                                    {selectedData.find(d => d.id === item.id) && (
                                                        <span className="text-blue-500 text-sm font-medium">
                                                            Selected
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Chat Interface - Right Panel */}
                <div className="w-1/2 flex flex-col p-4">
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Chat with Your Data</CardTitle>
                            <Input
                                    placeholder="Chat title..."
                                    value={chatTitle}
                                    onChange={(e) => setChatTitle(e.target.value)}
                                    className="w-48"
                                />
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                                {messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100'
                                                }`}
                                        >
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input form - Fixed at bottom */}
                            <form onSubmit={handleSendMessage} className="flex gap-2 flex-shrink-0">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder={selectedData.length === 0
                                        ? "Select data to start chatting..."
                                        : "Ask about your data..."}
                                    className="flex-1 p-2 border rounded-md"
                                    disabled={selectedData.length === 0 || loading}
                                />
                                <button
                                    type="submit"
                                    disabled={selectedData.length === 0 || loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
                                >
                                    {loading ? 'Sending...' : 'Send'}
                                </button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                {/* Chat History Table */}

            </div><div className="px-4 pb-4">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Chat History</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Messages</TableHead>
                                        <TableHead>Data Files</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : chatHistories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                No chat histories found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        chatHistories.map((history) => (
                                            <TableRow key={history.id} className="cursor-pointer hover:bg-gray-50">
                                                <TableCell onClick={() => handleLoadHistory(history)}>
                                                    {history.title}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(history.createdAt).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {history.messages.length} messages
                                                </TableCell>
                                                <TableCell>
                                                    {history.uploadIds.length} files
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShareHistory(history);
                                                        }}
                                                    >
                                                        {history.shareToken ? (
                                                            <Link className="w-4 h-4" />
                                                        ) : (
                                                            <Share2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteHistory(history);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                    <AlertDialog open={!!deleteHistory} onOpenChange={() => setDeleteHistory(null)}>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the chat history
                                                                    "{deleteHistory?.title}" and remove all its data from our servers.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleDeleteConfirm}
                                                                    className="bg-red-500 hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default DataChatInterface;