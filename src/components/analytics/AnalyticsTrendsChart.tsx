import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CycleTrendData {
  cycleNumber: number;
  date: string;
  contributions?: number;
  commission?: number;
  earnings?: number;
  membersContributed?: number;
  totalCollected?: number;
}

interface AnalyticsTrendsChartProps {
  data: CycleTrendData[];
  chartType?: 'member' | 'organizer';
  title?: string;
}

export const AnalyticsTrendsChart = ({
  data,
  chartType = 'member',
  title = 'Contribution Trends'
}: AnalyticsTrendsChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No data available yet</p>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map(d => ({
    name: `Cycle ${d.cycleNumber}`,
    ...d
  }));

  return (
    <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          {chartType === 'member' ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-slate-700" />
                <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400 text-xs" />
                <YAxis className="text-gray-600 dark:text-gray-400 text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="contributions" fill="#3b82f6" name="Amount Saved" radius={[8, 8, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#8b5cf6"
                  name="Commission"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-slate-700" />
                <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400 text-xs" />
                <YAxis className="text-gray-600 dark:text-gray-400 text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Bar dataKey="totalCollected" fill="#10b981" name="Total Collected" radius={[8, 8, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#f59e0b"
                  name="Your Earnings"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="membersContributed"
                  stroke="#06b6d4"
                  name="Active Members"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  yAxisId="right"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
