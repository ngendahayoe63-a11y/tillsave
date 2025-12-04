import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { advancedAnalyticsService } from '@/services/advancedAnalyticsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthScoreCard } from '@/components/analytics/HealthScoreCard';
import { PredictionCard } from '@/components/analytics/PredictionCard';
import { Loader2, ArrowLeft, Lightbulb, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import confetti from 'canvas-confetti';

export const MemberAnalyticsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !groupId) return;
      try {
        const insights = await advancedAnalyticsService.getMemberInsights(user.id, groupId);
        setData(insights);

        // 🎉 Celebrate Excellence
        if (insights && insights.healthScore >= 80) {
           setTimeout(() => {
             confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
           }, 500);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user, groupId]);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (!data) return <div>No data available</div>;

  // Transform day counts for chart
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = data.patterns.dayCounts.map((count: number, index: number) => ({
    day: daysOfWeek[index],
    count
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      <header className="bg-white dark:bg-slate-900 p-4 shadow-sm sticky top-0 z-10 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
        <Button variant="ghost" size="icon" onClick={() => navigate('/member')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">My Insights</h1>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-6">
        
        {/* 1. Health Score */}
        <HealthScoreCard score={data.healthScore} />

        {/* 2. Predictions */}
        <PredictionCard data={data.predictions} currency={data.totals.currency} />

        {/* 3. Smart Alerts */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Smart Alerts</h3>
          {data.alerts.map((alert: any, idx: number) => (
            <div 
              key={idx} 
              className={`p-4 rounded-lg border-l-4 shadow-sm bg-white dark:bg-slate-900 dark:border-gray-800
                ${alert.type === 'danger' ? 'border-l-red-500' : ''}
                ${alert.type === 'warning' ? 'border-l-yellow-500' : ''}
                ${alert.type === 'success' ? 'border-l-green-500' : ''}
                ${alert.type === 'info' ? 'border-l-blue-500' : ''}
              `}
            >
              <h4 className="font-bold text-sm mb-1">{alert.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{alert.msg}</p>
            </div>
          ))}
        </div>

        {/* 4. Pattern Chart */}
        <Card className="dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Your Payment Habits
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" tick={{fontSize: 10}} stroke="#888888" />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === data.patterns.dayCounts.indexOf(Math.max(...data.patterns.dayCounts)) ? '#2563eb' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-center text-gray-400 mt-2">
              You are most active on <span className="font-bold">{data.patterns.bestDay}s</span>.
            </p>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};