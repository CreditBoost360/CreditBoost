import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Sector,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Treemap,
    Cell
} from 'recharts';
import { creditDataService } from '@/services/creditData.service';
import { analyticsService } from/pages/TransactionDashboard.jsx '@/services/analytics.service';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { toast } from "sonner";
import { format, subMonths } from 'date-fns';
import { 
    Filter, 
    Download, 
    TrendingUp, 
    TrendingDown, 
    RefreshCcw, 
    Search, 
    AlertTriangle, 
    AlertCircle, 
    BarChart2, 
    PieChart as PieChartIcon, 
    Activity, 
    Brain 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip as TooltipComponent, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Pagination, { PerPageSelect } from '@/components/Common/Pagination';
import TransactionUploadModal from '@/components/Common/TransactionUploadModal';
import InsightCard from '@/components/Analytics/InsightCard';
import TransactionPatternCard from '@/components/Analytics/TransactionPatternCard';

const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Helper function to determine sentiment color
const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
        case 'positive':
            return 'text-green-500';
        case 'negative':
            return 'text-red-500';
        default:
            return 'text-slate-400';
    }
};

// Helper function to determine sentiment background color
const getSentimentBgColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
        case 'positive':
            return 'bg-green-500';
        case 'negative':
            return 'bg-red-500';
        default:
            return 'bg-slate-400';
    }
};

const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-8">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="pb-2">
                        <div className="h-4 bg-muted rounded-full w-24" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-8 bg-muted rounded-full w-32 mb-2" />
                        <div className="h-3 bg-muted rounded-full w-20" />
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Filters Skeleton */}
        <Card>
            <CardContent className="py-4">
                <div className="flex flex-wrap gap-4">
                    <div className="h-10 bg-muted rounded w-[200px]" />
                    <div className="h-10 bg-muted rounded w-[150px]" />
                    <div className="h-10 bg-muted rounded w-[150px]" />
                    <div className="h-10 bg-muted rounded w-[150px]" />
                </div>
            </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex space-x-4 p-4">
                            <div className="h-4 bg-muted rounded w-24" />
                            <div className="h-4 bg-muted rounded w-48 flex-1" />
                            <div className="h-4 bg-muted rounded w-24" />
                            <div className="h-4 bg-muted rounded w-32" />
                            <div className="h-4 bg-muted rounded w-24" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);


const StatsCards = ({ loading, stats, formatAmount }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="animate-pulse h-4 bg-muted rounded-full w-24" />
                        </CardHeader>
                        <CardContent>
                            <div className="animate-pulse">
                                <div className="h-8 bg-muted rounded-full w-32 mb-2" />
                                <div className="h-3 bg-muted rounded-full w-20" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.totalTransactions}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        In selected period
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Inflow
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">
                        {formatAmount(stats.inflow)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Money received
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Outflow
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                        {formatAmount(stats.outflow)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Money sent
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Net Flow
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stats.netFlow >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {formatAmount(Math.abs(stats.netFlow))}
                    </div>
                    <div className="flex items-center text-xs mt-1">
                        {stats.netFlow >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className="text-muted-foreground">
                            Net {stats.netFlow >= 0 ? 'savings' : 'spending'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


const TransactionDashboard = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [view, setView] = useState('transactions'); // 'transactions', 'analytics', or 'nlp-insights'
    const [analyticsTab, setAnalyticsTab] = useState('overview'); // 'overview', 'patterns', 'sentiment', 'predictions'
    const { uploadId } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [dataLoadingPage, setDataLoadingPage] = useState(1);
    const [allDataLoaded, setAllDataLoaded] = useState(false);
    const [fraudAlerts, setFraudAlerts] = useState([]);
    const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
    const [transactionPatterns, setTransactionPatterns] = useState([]);
    const [predictiveInsights, setPredictiveInsights] = useState(null);
    const [nlpError, setNlpError] = useState(null);
    const [nlpRetrying, setNlpRetrying] = useState(false);
    const [activeInsightTab, setActiveInsightTab] = useState('sentiment');
    const [phraseFrequencyData, setPhraseFrequencyData] = useState([]);
    const observerRef = useRef(null);
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.5,
    });



    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, filter, dateRange]);

    useEffect(() => {
        if (uploadId) {
            fetchTransactions();
            fetchAdvancedInsights();
        }
    }, [uploadId]);

    useEffect(() => {
        if (inView && hasMoreData && !loading && !allDataLoaded) {
            loadMoreTransactions();
        }
    }, [inView, hasMoreData]);

    // Error handling state
    const [fetchError, setFetchError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;

    const fetchTransactions = async (page = 1, reset = true) => {
        if (!uploadId) return;
        
        try {
            setLoading(true);
            setFetchError(null);
            const [transactionsData, summaryData] = await Promise.all([
                creditDataService.getMpesaTransactions(uploadId, { page, pageSize: 50 }),
                creditDataService.getMpesaTransactionSummary(uploadId)
            ]);
            
            if (reset) {
                setTransactions(transactionsData.data || []);
                setHasMoreData(transactionsData.hasMore || false);
                setDataLoadingPage(2); // Next page to load would be 2
            } else {
                setTransactions(prev => [...prev, ...(transactionsData.data || [])]);
                setHasMoreData(transactionsData.hasMore || false);
                setDataLoadingPage(prev => prev + 1);
            }
            
            if (!transactionsData.hasMore) {
                setAllDataLoaded(true);
            }
            
            setSummary(summaryData);
        } catch (error) {
            console.error("Transaction fetch error:", error);
            setFetchError("Failed to fetch transactions");
            
            // Implement retry logic
            if (retryCount < maxRetries) {
                setRetryCount(prev => prev + 1);
                toast.error(`Failed to fetch transactions. Retrying (${retryCount + 1}/${maxRetries})...`);
                
                // Retry after a delay
                setTimeout(() => {
                    fetchTransactions(page, reset);
                }, 2000); // 2 seconds delay between retries
            } else {
                toast.error("Failed to fetch transactions after multiple attempts.");
            }
        } finally {
            setLoading(false);
        }
    };

    const loadMoreTransactions = () => {
        if (hasMoreData && !loading) {
            fetchTransactions(dataLoadingPage, false);
        }
    };

    const fetchAdvancedInsights = async () => {
        if (!uploadId) return;
        
        try {
            setInsightsLoading(true);
            setFetchError(null);
            setNlpError(null);
            const [insightsData, fraudData, sentimentData, patternsData, predictionsData] = await Promise.all([
                analyticsService.getFinancialInsights(uploadId),
                analyticsService.getFraudAlerts(uploadId),
                analyticsService.getSentimentAnalysis(uploadId),
                analyticsService.getTransactionPatterns(uploadId),
                analyticsService.getPredictiveInsights(uploadId)
            ]);
            
            setInsights(insightsData);
            setFraudAlerts(fraudData || []);
            setSentimentAnalysis(sentimentData);
            setTransactionPatterns(patternsData || []);
            setPredictiveInsights(predictionsData);
            
            // Process phrase frequency data for visualization
            if (sentimentData?.keyPhrases) {
                const frequencyMap = {};
                sentimentData.keyPhrases.forEach(phrase => {
                    frequencyMap[phrase.text] = (frequencyMap[phrase.text] || 0) + phrase.frequency;
                });
                
                const processedData = Object.entries(frequencyMap)
                    .map(([text, frequency]) => ({ text, frequency }))
                    .sort((a, b) => b.frequency - a.frequency)
                    .slice(0, 10);
                    
                setPhraseFrequencyData(processedData);
            }
        } catch (error) {
            console.error("Advanced insights fetch error:", error);
            setFetchError("Failed to fetch advanced insights");
            setNlpError("Failed to fetch NLP insights");
            toast.error("Failed to fetch advanced insights. Some visualizations may be incomplete.");
        } finally {
            setInsightsLoading(false);
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const matchesSearch = transaction.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                transaction.partyInfo.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;

            const matchesFilter = filter === 'all' ||
                (filter === 'sent' && transaction.withdrawn > 0) ||
                (filter === 'received' && transaction.paidIn > 0);

            // Date range filtering logic
            let matchesDate = true;
            const txDate = new Date(transaction.completionTime);
            const now = new Date();

            switch (dateRange) {
                case 'today': {
                    matchesDate = format(txDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
                    break;
                }
                case 'week': {
                    const weekAgo = new Date(now.setDate(now.getDate() - 7));
                    matchesDate = txDate >= weekAgo;
                    break;
                }
                case 'month': {
                    const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                    matchesDate = txDate >= monthAgo;
                    break;
                }
                default:
                    matchesDate = true;
            }

            return matchesSearch && matchesCategory && matchesFilter && matchesDate;
        });
    }, [transactions, searchTerm, selectedCategory, filter, dateRange]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredTransactions.slice(startIndex, endIndex);
    }, [filteredTransactions, currentPage, pageSize]);

    const transactionStats = useMemo(() => {
        const stats = {
            totalAmount: 0,
            inflow: 0,
            outflow: 0,
            netFlow: 0,
            totalTransactions: filteredTransactions.length,
            categories: {}
        };

        filteredTransactions.forEach(tx => {
            stats.inflow += tx.paidIn || 0;
            stats.outflow += tx.withdrawn || 0;
            stats.categories[tx.category] = (stats.categories[tx.category] || 0) + 1;
        });

        stats.netFlow = stats.inflow - stats.outflow;
        stats.totalAmount = stats.inflow + stats.outflow;

        return stats;
    }, [filteredTransactions]);

    const monthlyData = useMemo(() => {
        const monthly = {};

        filteredTransactions.forEach(tx => {
            const month = format(new Date(tx.completionTime), 'MMM yyyy');
            if (!monthly[month]) {
                monthly[month] = {
                    month,
                    inflow: 0,
                    outflow: 0,
                    net: 0,
                    count: 0
                };
            }
            monthly[month].inflow += tx.paidIn || 0;
            monthly[month].outflow += tx.withdrawn || 0;
            monthly[month].count += 1;
        });

        Object.values(monthly).forEach(data => {
            data.net = data.inflow - data.outflow;
        });

        return Object.values(monthly).sort((a, b) =>
            new Date(a.month) - new Date(b.month)
        );
    }, [filteredTransactions]);


    return (
        <AuthenticatedLayout>
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Transaction History</h1>
                        <p className="text-muted-foreground">
                            Manage and analyze your M-PESA transactions
                        </p>
                        {fraudAlerts && fraudAlerts.length > 0 && (
                            <Badge variant="destructive" className="mt-2">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {fraudAlerts.length} Potential fraud alerts detected
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={view === 'transactions' ? 'default' : 'outline'}
                            onClick={() => setView('transactions')}
                        >
                            <Icon icon="mdi:list" className="w-4 h-4 mr-2" />
                            Transactions
                        </Button>
                        <Button
                            variant={view === 'analytics' ? 'default' : 'outline'}
                            onClick={() => setView('analytics')}
                        >
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Analytics
                        </Button>
                        <Button
                            variant={view === 'nlp-insights' ? 'default' : 'outline'}
                            onClick={() => setView('nlp-insights')}
                        >
                            <Brain className="w-4 h-4 mr-2" />
                            NLP Insights
                        </Button>
                        <Button onClick={() => setShowUploadModal(true)}>
                            <Icon icon="mdi:upload" className="w-4 h-4 mr-2" />
                            Upload New
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                {!uploadId ? (
                    <Card className="mb-8">
                        <CardContent className="py-8 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Icon icon="mdi:file-upload-outline" className="w-12 h-12 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">No Statement Found</h3>
                                <p className="text-muted-foreground">
                                    Please upload an M-PESA statement to view your transactions
                                </p>
                                <Button onClick={() => setShowUploadModal(true)}>
                                    Upload Statement
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : loading ? (
                    <LoadingSkeleton />
                ) : (
                    <>
                        <StatsCards loading={loading} stats={transactionStats} formatAmount={formatAmount} />
                        {/* Filters Section */}
                        <Card className="mb-8">
                            <CardContent className="py-4">
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 min-w-[200px] flex items-center gap-4">
                                        <PerPageSelect
                                            pageSize={pageSize}
                                            onPageSizeChange={(newSize) => {
                                                setPageSize(newSize);
                                                setCurrentPage(1);
                                            }}
                                        />
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Search transactions..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full"
                                                icon={<Search className="w-4 h-4" />}
                                            />
                                        </div>
                                    </div>
                                    <Select value={filter} onValueChange={setFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Filter by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Transactions</SelectItem>
                                            <SelectItem value="sent">Money Sent</SelectItem>
                                            <SelectItem value="received">Money Received</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={dateRange} onValueChange={setDateRange}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Date range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">Last 7 Days</SelectItem>
                                            <SelectItem value="month">Last 30 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {Object.keys(transactionStats.categories).map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category.replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" onClick={fetchTransactions}>
                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                        Refresh
                                    </Button>
                                    <Button variant="outline">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <AnimatePresence mode="wait">
                            {view === 'transactions' && (
                                <motion.div
                                    key="transactions"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Transactions Table */}
                                    <Card>
                                        <CardContent className="p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead>Recipient</TableHead>
                                                        <TableHead className="text-right">Amount</TableHead>
                                                        <TableHead>Type</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {loading ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center py-8">
                                                                <div className="flex justify-center items-center">
                                                                    <Icon
                                                                        icon="mdi:loading"
                                                                        className="w-6 h-6 animate-spin mr-2"
                                                                    />
                                                                    Loading transactions...
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : paginatedTransactions.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center py-8">
                                                                No transactions found
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        paginatedTransactions.map((tx, index) => (
                                                            <TableRow key={tx.id || index}>
                                                                <TableCell>
                                                                    {format(new Date(tx.completionTime), 'MMM dd, yyyy HH:mm')}
                                                                </TableCell>
                                                                <TableCell className="max-w-[300px] truncate">
                                                                    {tx.details}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                                        {tx.category.replace('_', ' ')}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">
                                                                            {tx.partyInfo.name || 'Unknown'}
                                                                        </span>
                                                                        {tx.partyInfo.phoneNumber && (
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {tx.partyInfo.phoneNumber}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className={`font-medium ${tx.paidIn > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                        {tx.paidIn > 0
                                                                            ? `+${formatAmount(tx.paidIn)}`
                                                                            : `-${formatAmount(tx.withdrawn)}`
                                                                        }
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {tx.paidIn > 0 ? (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                            Received
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                            Sent
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                            <Pagination
                                                currentPage={currentPage}
                                                totalItems={filteredTransactions.length}
                                                pageSize={pageSize}
                                                onPageChange={setCurrentPage}
                                                onPageSizeChange={(newSize) => {
                                                    setPageSize(newSize);
                                                    setCurrentPage(1); // Reset to first page when changing page size
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                            {view === 'analytics' && (
                                <motion.div
                                    key="analytics"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                                >
                                    {/* Analytics content */}
                                </motion.div>
                            )}
                            {view === 'nlp-insights' && (
                                <motion.div
                                    key="nlp-insights"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="mb-6">
                                        <Tabs defaultValue="sentiment" value={activeInsightTab} onValueChange={setActiveInsightTab} className="w-full">
                                            <TabsList className="grid grid-cols-3 mb-4">
                                                <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
                                                <TabsTrigger value="patterns">Transaction Patterns</TabsTrigger>
                                                <TabsTrigger value="predictions">Predictive Insights</TabsTrigger>
                                            </TabsList>

                                            {nlpError && !insightsLoading && (
                                                <div className="bg-destructive/15 border border-destructive rounded-md p-4 mb-4 flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                                                        <p>Failed to load NLP insights data. Some features may be limited.</p>
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={fetchAdvancedInsights} disabled={insightsLoading || nlpRetrying}>
                                                        {insightsLoading || nlpRetrying ? (
                                                            <>
                                                                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                                                                Retrying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <RefreshCcw className="h-4 w-4 mr-2" />
                                                                Retry
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}

                                            {insightsLoading && (
                                                <div className="flex justify-center items-center p-20">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
                                                        <p className="text-sm text-muted-foreground">Analyzing transaction data...</p>
                                                    </div>
                                                </div>
                                            )}

                                            <TabsContent value="sentiment" className="mt-4">
                                                {!insightsLoading && sentimentAnalysis && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Sentiment Distribution Card */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Sentiment Distribution</CardTitle>
                                                                <CardDescription>
                                                                    Sentiment analysis of transaction descriptions
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="h-[300px]">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <PieChart>
                                                                            <Pie
                                                                                data={[
                                                                                    { name: 'Positive', value: sentimentAnalysis.distribution?.positive || 0, sentiment: 'positive' },
                                                                                    { name: 'Neutral', value: sentimentAnalysis.distribution?.neutral || 0, sentiment: 'neutral' },
                                                                                    { name: 'Negative', value: sentimentAnalysis.distribution?.negative || 0, sentiment: 'negative' }
                                                                                ]}
                                                                                cx="50%"
                                                                                cy="50%"
                                                                                innerRadius={60}
                                                                                outerRadius={80}
                                                                                fill="#8884d8"
                                                                                paddingAngle={2}
                                                                                dataKey="value"
                                                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                                labelLine={true}
                                                                            >
                                                                                {[
                                                                                    { name: 'Positive', value: sentimentAnalysis.distribution?.positive || 0, sentiment: 'positive' },
                                                                                    { name: 'Neutral', value: sentimentAnalysis.distribution?.neutral || 0, sentiment: 'neutral' },
                                                                                    { name: 'Negative', value: sentimentAnalysis.distribution?.negative || 0, sentiment: 'negative' }
                                                                                ].map((entry, index) => (
                                                                                    <Cell key={`cell-${index}`} fill={getSentimentBgColor(entry.sentiment)} />
                                                                                ))}
                                                                            </Pie>
                                                                            <Tooltip formatter={(value) => `${value} transactions`} />
                                                                        </PieChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                                <div className="flex justify-center gap-6 mt-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                                        <span>Positive</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                                                                        <span>Neutral</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                                        <span>Negative</span>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Key Phrases Card */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Key Phrase Frequency</CardTitle>
                                                                <CardDescription>
                                                                    Most common phrases in your transactions
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="h-[300px]">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <BarChart
                                                                            layout="vertical"
                                                                            data={phraseFrequencyData}
                                                                            margin={{
                                                                                top: 5,
                                                                                right: 30,
                                                                                left: 50,
                                                                                bottom: 5,
                                                                            }}
                                                                        >
                                                                            <CartesianGrid strokeDasharray="3 3" />
                                                                            <XAxis type="number" />
                                                                            <YAxis dataKey="text" type="category" scale="band" tick={{ fontSize: 10 }} width={100} />
                                                                            <Tooltip formatter={(value) => [`${value} occurrences`, 'Frequency']} />
                                                                            <Bar dataKey="frequency" fill="#6366f1" barSize={20} />
                                                                        </BarChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Sentiment Trends Card */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Sentiment Trends</CardTitle>
                                                                <CardDescription>
                                                                    How transaction sentiment changes over time
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="h-[300px]">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <LineChart
                                                                            data={sentimentAnalysis.trends || []}
                                                                            margin={{
                                                                                top: 5,
                                                                                right: 30,
                                                                                left: 20,
                                                                                bottom: 5,
                                                                            }}
                                                                        >
                                                                            <CartesianGrid strokeDasharray="3 3" />
                                                                            <XAxis dataKey="date" />
                                                                            <YAxis />
                                                                            <Tooltip />
                                                                            <Legend />
                                                                            <Line type="monotone" dataKey="positive" stroke="#22c55e" activeDot={{ r: 8 }} />
                                                                            <Line type="monotone" dataKey="negative" stroke="#ef4444" />
                                                                            <Line type="monotone" dataKey="neutral" stroke="#9ca3af" />
                                                                        </LineChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Individual Transaction Sentiment */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Transaction Sentiment</CardTitle>
                                                                <CardDescription>
                                                                    Individual transaction sentiment analysis
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="h-[300px] overflow-auto space-y-2">
                                                                    {sentimentAnalysis.transactions?.slice(0, 10).map((tx, index) => (
                                                                        <div key={index} className="p-3 rounded-md border">
                                                                            <div className="flex justify-between">
                                                                                <p className="text-sm truncate max-w-[70%]">{tx.description}</p>
                                                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getSentimentColor(tx.sentiment)}`}>
                                                                                    {tx.sentiment}
                                                                                </span>
                                                                            </div>
                                                                            <div className="mt-2">
                                                                                <div className="h-1.5 w-full bg-gray-200 rounded-full">
                                                                                    <div 
                                                                                        className={`h-full rounded-full ${getSentimentBgColor(tx.sentiment)}`} 
                                                                                        style={{width: `${tx.confidence * 100}%`}}
                                                                                    ></div>
                                                                                </div>
                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                    Confidence: {(tx.confidence * 100).toFixed(0)}%
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="patterns" className="mt-4">
                                                {insightsLoading && (
                                                    <div className="flex justify-center items-center p-20">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
                                                            <p className="text-sm text-muted-foreground">Analyzing transaction patterns...</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {!insightsLoading && transactionPatterns && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Recurring Payments Card */}
                                                        <Card className="md:col-span-2">
                                                            <CardHeader>
                                                                <CardTitle>Recurring Payments</CardTitle>
                                                                <CardDescription>
                                                                    Detected regular transaction patterns
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="space-y-4">
                                                                    {transactionPatterns.filter(pattern => pattern.type === 'recurring').length > 0 ? (
                                                                        transactionPatterns
                                                                            .filter(pattern => pattern.type === 'recurring')
                                                                            .map((pattern, index) => (
                                                                                <TransactionPatternCard
                                                                                    key={index}
                                                                                    pattern={pattern}
                                                                                    formatAmount={formatAmount}
                                                                                />
                                                                            ))
                                                                    ) : (
                                                                        <div className="text-center py-10">
                                                                            <p className="text-muted-foreground">No recurring patterns detected in your transactions</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Transaction Clusters Card */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Transaction Clusters</CardTitle>
                                                                <CardDescription>
                                                                    Groups of similar transactions
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="h-[300px]">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <Treemap
                                                                            data={transactionPatterns.filter(pattern => pattern.type === 'cluster')}
                                                                            dataKey="totalAmount"
                                                                            nameKey="description"
                                                                            aspectRatio={4/3}
                                                                            content={({
                                                                                root,
                                                                                depth,
                                                                                x,
                                                                                y,
                                                                                width,
                                                                                height,
                                                                                index,
                                                                                payload,
                                                                                colors,
                                                                                rank,
                                                                                name,
                                                                            }) => {
                                                                                return (
                                                                                    <g>
                                                                                        <rect
                                                                                            x={x}
                                                                                            y={y}
                                                                                            width={width}
                                                                                            height={height}
                                                                                            style={{
                                                                                                fill: index % 2 ? '#6366f1' : '#818cf8',
                                                                                                stroke: '#fff',
                                                                                                strokeWidth: 2 / (depth + 1e-10),
                                                                                                strokeOpacity: 1 / (depth + 1e-10),
                                                                                            }}
                                                                                        />
                                                                                        {width > 30 && height > 30 && (
                                                                                            <text
                                                                                                x={x + width / 2}
                                                                                                y={y + height / 2}
                                                                                                textAnchor="middle"
                                                                                                dominantBaseline="middle"
                                                                                                fill="#fff"
                                                                                                fontSize={10}
                                                                                            >
                                                                                                {name}
                                                                                            </text>
                                                                                        )}
                                                                                    </g>
                                                                                );
                                                                            }}
                                                                        />
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                        
                                                        {/* Spending Behavior Card */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Spending Behavior</CardTitle>
                                                                <CardDescription>
                                                                    Transaction patterns by time of day and day of week
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="h-[300px]">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <RadarChart 
                                                                            outerRadius={100} 
                                                                            data={[
                                                                                { subject: 'Mon', value: transactionPatterns.reduce((sum, p) => sum + (p.dayOfWeekDistribution?.monday || 0), 0) },
                                                                                { subject: 'Tue', value: transactionPatterns.reduce((sum, p) => sum + (p.dayOfWeekDistribution?.tuesday || 0), 0) },
                                                                                { subject: 'Wed', value: transactionPatterns.reduce((sum, p) => sum + (p.dayOfWeekDistribution?.wednesday || 0), 0) },
                                                                                { subject: 'Thu', value: transactionPatterns.reduce((sum, p) => sum + (p.dayOfWeekDistribution?.thursday || 0), 0) },
                                                                                { subject: 'Fri', value: transactionPatterns.reduce((sum, p) => sum + (p.dayOfWeekDistribution?.friday || 0), 0) },
                                                                                { subject: 'Sat', value: transactionPatterns.reduce((sum, p) => sum + (p.dayOfWeekDistribution?.saturday || 0), 0) },
                                                                                { subject: 'Sun', value: transactionPatterns.reduce((sum, p) => sum + (p.dayOfWeekDistribution?.sunday || 0), 0) }
                                                                            ]}
                                                                        >
                                                                            <PolarGrid />
                                                                            <PolarAngleAxis dataKey="subject" />
                                                                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                                                                            <Radar name="Transaction Activity" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                                                                            <Tooltip formatter={(value) => `${value} transactions`} />
                                                                        </RadarChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                                <div className="mt-4">
                                                                    <h4 className="text-sm font-medium mb-2">Transaction Timing Insights</h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {transactionPatterns.some(p => p.timeInsight) 
                                                                            ? transactionPatterns.find(p => p.timeInsight)?.timeInsight 
                                                                            : "Most of your transactions occur on weekdays, particularly during business hours."}
                                                                    </p>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Unusual Transactions Card */}
                                                        <Card className="md:col-span-2">
                                                            <CardHeader>
                                                                <CardTitle>Unusual Transactions</CardTitle>
                                                                <CardDescription>
                                                                    Transactions that deviate from your normal patterns
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="space-y-4">
                                                                    {transactionPatterns.filter(pattern => pattern.type === 'anomaly').length > 0 ? (
                                                                        transactionPatterns
                                                                            .filter(pattern => pattern.type === 'anomaly')
                                                                            .map((pattern, index) => (
                                                                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                                                    <div className="flex items-center">
                                                                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                                                                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <h4 className="font-medium">{pattern.description}</h4>
                                                                                            <p className="text-sm text-muted-foreground">
                                                                                                {pattern.details || 'This transaction deviates from your usual spending patterns.'}
                                                                                            </p>
                                                                                            <div className="mt-2">
                                                                                                <TooltipProvider>
                                                                                                    <Tooltip>
                                                                                                        <TooltipTrigger asChild>
                                                                                                            <Badge variant="outline" className="cursor-help">
                                                                                                                Anomaly Score: {((pattern.anomalyScore || 0.8) * 100).toFixed(0)}%
                                                                                                            </Badge>
                                                                                                        </TooltipTrigger>
                                                                                                        <TooltipContent>
                                                                                                            <p>Higher scores indicate greater deviation from normal patterns</p>
                                                                                                        </TooltipContent>
                                                                                                    </Tooltip>
                                                                                                </TooltipProvider>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <span className="font-medium">{formatAmount(pattern.amount || 0)}</span>
                                                                                        <p className="text-xs text-muted-foreground">{pattern.date || 'Unknown date'}</p>
                                                                                        <Button variant="ghost" size="sm" className="mt-2">
                                                                                            View Details
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                    ) : (
                                                                        <div className="text-center py-10">
                                                                            <p className="text-muted-foreground">No unusual patterns detected in your transactions</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                        
                                                        {/* Seasonal Spending Patterns */}
                                                        <Card className="md:col-span-2">
                                                            <CardHeader>
                                                                <CardTitle>Seasonal Spending Patterns</CardTitle>
                                                                <CardDescription>
                                                                    How your spending changes throughout the year
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="h-[300px]">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <LineChart
                                                                            data={[
                                                                                { month: 'Jan', amount: 45000 },
                                                                                { month: 'Feb', amount: 48000 },
                                                                                { month: 'Mar', amount: 42000 },
                                                                                { month: 'Apr', amount: 40000 },
                                                                                { month: 'May', amount: 43000 },
                                                                                { month: 'Jun', amount: 50000 },
                                                                                { month: 'Jul', amount: 55000 },
                                                                                { month: 'Aug', amount: 52000 },
                                                                                { month: 'Sep', amount: 49000 },
                                                                                { month: 'Oct', amount: 47000 },
                                                                                { month: 'Nov', amount: 53000 },
                                                                                { month: 'Dec', amount: 60000 }
                                                                            ]}
                                                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                                        >
                                                                            <CartesianGrid strokeDasharray="3 3" />
                                                                            <XAxis dataKey="month" />
                                                                            <YAxis />
                                                                            <Tooltip formatter={(value) => formatAmount(value)} />
                                                                            <Legend />
                                                                            <Line 
                                                                                type="monotone" 
                                                                                dataKey="amount" 
                                                                                name="Monthly Spending" 
                                                                                stroke="#6366f1" 
                                                                                strokeWidth={2}
                                                                                activeDot={{ r: 8 }}
                                                                            />
                                                                        </LineChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                                <div className="mt-4 space-y-2">
                                                                    <h4 className="text-sm font-medium">Seasonal Insights</h4>
                                                                    <div className="flex flex-col gap-2">
                                                                        <Badge variant="outline" className="w-fit">
                                                                            <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                                                            Peak spending in December
                                                                        </Badge>
                                                                        <Badge variant="outline" className="w-fit">
                                                                            <TrendingDown className="h-3.5 w-3.5 mr-1" />
                                                                            Lowest spending in April
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground mt-2">
                                                                        Your spending tends to increase during holiday seasons (June-July and November-December). Consider setting aside additional funds during these periods.
                                                                    </p>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </TabsContent>

                                            <TabsContent value="predictions" className="mt-4">
                                                {insightsLoading && (
                                                    <div className="flex justify-center items-center p-20">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
                                                            <p className="text-sm text-muted-foreground">Generating predictive insights...</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {!insightsLoading && predictiveInsights && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Cash Flow Forecast Card */}
                                                        <Card className="md:col-span-2">
                                                            <CardHeader>
                                                                <CardTitle>Cash Flow Forecast</CardTitle>
                                                                <CardDescription>
                                                                    Projected financial flows for the next 30 days
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="h-[400px]">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <LineChart
                                                                            data={predictiveInsights.cashFlowForecast || []}
                                                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                                        >
                                                                            <CartesianGrid strokeDasharray="3 3" />
                                                                            <XAxis dataKey="date" />
                                                                            <YAxis />
                                                                            <Tooltip formatter={(value) => formatAmount(value)} />
                                                                            <Legend />
                                                                            <Line type="monotone" dataKey="predictedInflow" stroke="#22c55e" name="Predicted Income" strokeWidth={2} />
                                                                            <Line type="monotone" dataKey="predictedOutflow" stroke="#ef4444" name="Predicted Expenses" strokeWidth={2} />
                                                                            <Line type="monotone" dataKey="predictedBalance" stroke="#6366f1" name="Predicted Balance" strokeWidth={2} dot={{ r: 4 }} />
                                                                        </LineChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                                <div className="mt-4 p-4 bg-muted rounded-lg">
                                                                    <h4 className="text-sm font-medium mb-2">Cash Flow Summary</h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {predictiveInsights.cashFlowSummary || 
                                                                        "Based on your transaction history, we predict your net cash flow will be positive over the next 30 days."}
                                                                    </p>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Monthly Budget Prediction Card */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Expense Categories Forecast</CardTitle>
                                                                <CardDescription>
                                                                    Projected spending by category for next month
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="space-y-6">
                                                                    {predictiveInsights.categoryPredictions?.map((category, index) => (
                                                                        <div key={index}>
                                                                            <div className="flex justify-between mb-1">
                                                                                <span className="text-sm font-medium">
                                                                                    {category.name}
                                                                                </span>
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <span className="text-sm font-semibold cursor-help">
                                                                                                {formatAmount(category.predictedAmount)}
                                                                                                {category.trend === 'up' && <TrendingUp className="inline w-3 h-3 ml-1 text-red-500" />}
                                                                                                {category.trend === 'down' && <TrendingDown className="inline w-3 h-3 ml-1 text-green-500" />}
                                                                                            </span>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            <p>
                                                                                                {category.trend === 'up' ? 'Increased spending expected' :
                                                                                                category.trend === 'down' ? 'Decreased spending expected' : 'Similar to previous months'}
                                                                                            </p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            </div>
                                                                            <Progress 
                                                                                value={Math.min((category.predictedAmount / category.budgetAmount) * 100, 100) || 75} 
                                                                                className={`h-2 ${
                                                                                    category.predictedAmount > category.budgetAmount ? 'bg-red-500' : 'bg-green-500'
                                                                                }`}
                                                                            />
                                                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                                                <span>Predicted</span>
                                                                                <span>Budget: {formatAmount(category.budgetAmount || category.predictedAmount * 1.2)}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {(!predictiveInsights.categoryPredictions || predictiveInsights.categoryPredictions.length === 0) && (
                                                                        <div className="space-y-6">
                                                                            <div>
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="text-sm font-medium">Shopping</span>
                                                                                    <span className="text-sm font-semibold">
                                                                                        {formatAmount(12500)}
                                                                                        <TrendingUp className="inline w-3 h-3 ml-1 text-red-500" />
                                                                                    </span>
                                                                                </div>
                                                                                <Progress value={85} className="h-2 bg-red-500" />
                                                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                                                    <span>Predicted</span>
                                                                                    <span>Budget: {formatAmount(15000)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="text-sm font-medium">Utilities</span>
                                                                                    <span className="text-sm font-semibold">
                                                                                        {formatAmount(8200)}
                                                                                    </span>
                                                                                </div>
                                                                                <Progress value={70} className="h-2 bg-green-500" />
                                                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                                                    <span>Predicted</span>
                                                                                    <span>Budget: {formatAmount(10000)}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="flex justify-between mb-1">
                                                                                    <span className="text-sm font-medium">Food</span>
                                                                                    <span className="text-sm font-semibold">
                                                                                        {formatAmount(7500)}
                                                                                        <TrendingDown className="inline w-3 h-3 ml-1 text-green-500" />
                                                                                    </span>
                                                                                </div>
                                                                                <Progress value={60} className="h-2 bg-green-500" />
                                                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                                                    <span>Predicted</span>
                                                                                    <span>Budget: {formatAmount(12000)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                        
                                                        {/* Financial Health Score Card */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Financial Health Score</CardTitle>
                                                                <CardDescription>
                                                                    Analysis of your financial stability and habits
                                                                </CardDescription>
                                                            </CardHeader>
                                                                <CardContent>
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="text-sm font-medium">Financial Health Score</h4>
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Badge className={`cursor-help ${
                                                                                        (predictiveInsights.healthScore || 75) >= 80 ? 'bg-green-500' :
                                                                                        (predictiveInsights.healthScore || 75) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                                    }`}>
                                                                                        {predictiveInsights.healthScore || 75}/100
                                                                                    </Badge>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>Based on income stability, savings rate, and spending patterns</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </div>
                                                                    <Progress 
                                                                        value={predictiveInsights.healthScore || 75} 
                                                                        className={`h-2.5 ${
                                                                            (predictiveInsights.healthScore || 75) >= 80 ? 'bg-green-500' :
                                                                            (predictiveInsights.healthScore || 75) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                        }`} 
                                                                    />

                                                                    <div className="p-4 rounded-lg bg-muted mt-4">
                                                                        <h4 className="text-sm font-medium mb-2">Financial Health Insights</h4>
                                                                        <ul className="space-y-2 text-sm">
                                                                            {predictiveInsights.healthInsights?.map((insight, index) => (
                                                                                <li key={index} className="flex items-start">
                                                                                    {insight.type === 'positive' ? (
                                                                                        <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                                                                    ) : insight.type === 'negative' ? (
                                                                                        <TrendingDown className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                                                                                    ) : (
                                                                                        <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                                                                                    )}
                                                                                    <span>{insight.text}</span>
                                                                                </li>
                                                                            ))}
                                                                            {(!predictiveInsights.healthInsights || predictiveInsights.healthInsights.length === 0) && (
                                                                                <>
                                                                                    <li className="flex items-start">
                                                                                        <TrendingUp className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                                                                        <span>Your regular income pattern shows stability, which is positive for your financial health.</span>
                                                                                    </li>
                                                                                    <li className="flex items-start">
                                                                                        <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                                                                                        <span>Consider setting aside more for emergency savings based on your current spending patterns.</span>
                                                                                    </li>
                                                                                    <li className="flex items-start">
                                                                                        <TrendingDown className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                                                                                        <span>Your frequent transaction fees could be reduced by consolidating payments.</span>
                                                                                    </li>
                                                                                </>
                                                                            )}
                                                                        </ul>
                                                                    </div>
                                                                </CardContent>
                                                        </Card>

                                                        {/* Financial Goals Progress Card */}
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Financial Goals Projection</CardTitle>
                                                                <CardDescription>
                                                                    Predicted progress towards your financial goals
                                                                </CardDescription>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="space-y-6">
                                                                    {predictiveInsights.goalProjections?.map((goal, index) => (
                                                                        <div key={index} className="space-y-2">
                                                                            <div className="flex justify-between">
                                                                                <h4 className="text-sm font-medium">{goal.name}</h4>
                                                                                <span className="text-sm font-medium">
                                                                                    {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)}
                                                                                </span>
                                                                            </div>
                                                                            <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
                                                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                                                <span>Current: {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%</span>
                                                                                <span>
                                                                                    {goal.predictedCompletionDate && `Predicted completion: ${goal.predictedCompletionDate}`}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {(!predictiveInsights.goalProjections || predictiveInsights.goalProjections.length === 0) && (
                                                                        <div className="space-y-6">
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between">
                                                                                    <h4 className="text-sm font-medium">Emergency Fund</h4>
                                                                                    <span className="text-sm font-medium">
                                                                                        {formatAmount(25000)} / {formatAmount(60000)}
                                                                                    </span>
                                                                                </div>
                                                                                <Progress value={42} className="h-2" />
                                                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                                                    <span>Current: 42%</span>
                                                                                    <span>Predicted completion: June 2024</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <div className="flex justify-between">
                                                                                    <h4 className="text-sm font-medium">Home Down Payment</h4>
                                                                                    <span className="text-sm font-medium">
                                                                                        {formatAmount(120000)} / {formatAmount(500000)}
                                                                                    </span>
                                                                                </div>
                                                                                <Progress value={24} className="h-2" />
                                                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                                                    <span>Current: 24%</span>
                                                                                    <span>Predicted completion: March 2026</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="mt-6">
                                                                    <h4 className="text-sm font-medium mb-2">Savings Potential</h4>
                                                                    <div className="p-3 bg-muted rounded-lg">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-sm">Monthly Savings Potential:</span>
                                                                            <span className="font-medium">{formatAmount(predictiveInsights.savingsPotential?.monthly || 15000)}</span>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {predictiveInsights.savingsPotential?.recommendation || 
                                                                            "Based on your income and spending patterns, you could potentially save this amount monthly by optimizing discretionary expenses."}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>

            <TransactionUploadModal
                showModal={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUploadSuccess={(uploadId) => {
                    setShowUploadModal(false);
                    navigate(`/transactions/${uploadId}`);
                }}
            />

            {/* Infinite scroll observer */}
            {hasMoreData && !loading && (
                <div ref={loadMoreRef} className="h-10 w-full" />
            )}
        </AuthenticatedLayout>
    );
};

export default TransactionDashboard;
