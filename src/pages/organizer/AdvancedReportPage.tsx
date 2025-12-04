import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsService } from '@/services/analyticsService';
import { groupsService } from '@/services/groupsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, TrendingUp, Users, AlertCircle, PiggyBank, Wallet } from 'lucide-react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const AdvancedReportPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!groupId) return;
      try {
        const group = await groupsService.getGroupDetails(groupId);
        setGroupName(group.name);

        const now = new Date();
        const data = await analyticsService.getGroupAnalytics(
          groupId, 
          startOfMonth(now), 
          endOfMonth(now)
        );
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [groupId]);

  // Helper to render currency list
  const renderCurrencyList = (data: Record<string, number>, emptyText: string) => {
    const entries = Object.entries(data);
    if (entries.length === 0) return <p className="text-sm opacity-70">{emptyText}</p>;
    
    return entries.map(([currency, amount]) => (
      <div key={currency} className="flex justify-between items-baseline w-full">
        <span className="text-sm font-medium opacity-80">{currency}</span>
        <span className="text-xl font-bold">{amount.toLocaleString()}</span>
      </div>
    ));
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/organizer')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Group Insights</h1>
          <p className="text-xs text-gray-500">{groupName} • {format(new Date(), 'MMMM yyyy')}</p>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        
        {/* --- NEW FINANCIAL CARDS --- */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* 1. Total Group Savings */}
          <Card className="col-span-2 bg-green-600 text-white border-none shadow-md">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <PiggyBank className="h-4 w-4" /> Total Group Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {renderCurrencyList(stats.totalSavings, "No savings yet")}
              </div>
            </CardContent>
          </Card>

          {/* 2. Organizer Incentive (Earnings) */}
          <Card className="col-span-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-md">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2 opacity-90">
                <Wallet className="h-4 w-4" /> Your Incentives (Est.)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                 {renderCurrencyList(stats.organizerEarnings, "No earnings yet")}
              </div>
              <p className="text-[10px] mt-2 opacity-70">*Based on active members this month</p>
            </CardContent>
          </Card>
        </div>

        {/* --- EXISTING METRICS --- */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">{stats.completionRate}%</div>
              <div className="text-xs text-gray-500">Participation Rate</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-red-100 p-2 rounded-full mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-700">{stats.missedPayments}</div>
              <div className="text-xs text-gray-500">Missed Payments</div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Daily Payment Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 10}} 
                  interval={4}
                  stroke="#888888"
                />
                <YAxis allowDecimals={false} tick={{fontSize: 10}} stroke="#888888" />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="payments" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};