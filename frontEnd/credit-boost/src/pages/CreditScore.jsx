import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import { useNavigate } from 'react-router-dom';
import CreditScoreOverview from '@/components/CreditScoreOverview';

const CreditScore = () => {
    const [selectedBreakdown, setSelectedBreakdown] = useState('Credit utilization');
    const navigate = useNavigate();

    const timelineData = [
        { month: 'Jan', score: 650 },
        { month: 'Feb', score: 670 },
        { month: 'Mar', score: 665 },
        { month: 'Apr', score: 680 },
        { month: 'May', score: 695 },
        { month: 'Jun', score: 710 },
    ];

    const breakdownData = [
        { name: 'Credit utilization', value: 30, color: '#00A76F' },
        { name: 'Payment History', value: 35, color: '#1C4456' },
        { name: 'Account Age', value: 15, color: '#FFC107' },
        { name: 'Credit Mix', value: 10, color: '#FF5630' },
        { name: 'Recent Inquiries', value: 10, color: '#FF9777' }
    ];

    const dataSources = [
        { name: 'TransUnion', status: 'Connected', lastUpdate: '2024-03-21' },
        { name: 'Experian', status: 'Connected', lastUpdate: '2024-03-20' },
        { name: 'Equifax', status: 'Pending', lastUpdate: '-' },
    ];

    return (
        <AuthenticatedLayout>
            <div className="container flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Credit Score Overview</h1>
                <Button 
                    onClick={() => navigate('/credit-score/upload-data')}
                    className="flex items-center gap-2"
                >
                    <Icon icon="mdi:upload" className="w-5 h-5" />
                    Update Data
                </Button>
            </div>
            
            {/* Enhanced Credit Score Overview */}
            <div className="px-6 mb-6">
                <CreditScoreOverview 
                    score={710} 
                    previousScore={695}
                    factors={[
                        { name: 'Payment History', status: 'excellent', percentage: 95, impact: 'high' },
                        { name: 'Credit Utilization', status: 'good', percentage: 75, impact: 'high' },
                        { name: 'Credit Age', status: 'fair', percentage: 60, impact: 'medium' },
                        { name: 'Account Mix', status: 'good', percentage: 80, impact: 'low' },
                        { name: 'Recent Inquiries', status: 'excellent', percentage: 90, impact: 'low' }
                    ]}
                />
            </div>
            
            <div className="grid gap-6 px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Real-time Graph Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Credit Score History</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Showing credit score progression over the last 6 months
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timelineData}>
                                        <defs>
                                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis domain={[600, 850]} />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#3b82f6"
                                            fill="url(#scoreGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4">
                                <p className="font-medium">Score up by 5.2% this month</p>
                                <p className="text-sm text-muted-foreground">January - June 2024</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Credit Score Breakdown Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Credit Score Breakdown</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Contributors to Credit Score: 710
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="ml-auto">
                                        {selectedBreakdown}
                                        <Icon icon="mdi:chevron-down" className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {breakdownData.map((item) => (
                                        <DropdownMenuItem
                                            key={item.name}
                                            onClick={() => setSelectedBreakdown(item.name)}
                                        >
                                            {item.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={breakdownData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {breakdownData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold">710</div>
                                        <div className="text-sm text-muted-foreground">Score</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="font-medium">Score up by 5.2% this month</p>
                                <p className="text-sm text-muted-foreground">January - June 2024</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Sources Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Sources</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Credit report data sources and their current status
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Source</th>
                                        <th className="text-left py-3 px-4">Status</th>
                                        <th className="text-left py-3 px-4">Last Update</th>
                                        <th className="text-left py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataSources.map((source, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="py-3 px-4">{source.name}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${source.status === 'Connected'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {source.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{source.lastUpdate}</td>
                                            <td className="py-3 px-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {source.status === 'Connected' ? 'Refresh' : 'Connect'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
};

export default CreditScore;