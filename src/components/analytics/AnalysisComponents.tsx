import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Award, Zap, Calendar, ArrowRight, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- HEALTH SCORE CARD ---
export const HealthScoreCard = ({ score, breakdown }: { score: number, breakdown: any }) => {
  let color = "text-red-500";
  let bgBar = "bg-red-500";
  let label = "Needs Improvement";
  
  if (score >= 60) { color = "text-yellow-500"; bgBar = "bg-yellow-500"; label = "Good"; }
  if (score >= 80) { color = "text-green-500"; bgBar = "bg-green-500"; label = "Excellent"; }

  return (
    <Card className="dark:bg-slate-900 border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider flex justify-between">
          <span>Financial Health Score</span>
          <span className="text-xs font-normal bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">0-100</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 mb-2">
          <span className={`text-4xl font-bold ${color}`}>{score}</span>
          <span className="text-sm text-gray-500 mb-1">/ 100</span>
          <span className={`ml-auto font-bold ${color}`}>{label}</span>
        </div>
        
        {/* Progress Bar Visual */}
        <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
          <div className={`h-full ${bgBar} transition-all duration-1000`} style={{ width: `${score}%` }} />
        </div>

        {/* Breakdown Mini-Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex justify-between"><span>Consistency:</span> <span className="font-semibold">{Math.round(breakdown.consistency)}/40</span></div>
          <div className="flex justify-between"><span>Streak:</span> <span className="font-semibold">{Math.round(breakdown.streak)}/20</span></div>
          <div className="flex justify-between"><span>Goals:</span> <span className="font-semibold">{Math.round(breakdown.goal)}/20</span></div>
          <div className="flex justify-between"><span>Vs Group:</span> <span className="font-semibold">{Math.round(breakdown.peer)}/20</span></div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- SMART ALERTS LIST ---
export const SmartAlertsList = ({ alerts }: { alerts: any[] }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Smart Alerts ({alerts.length})</h3>
      {alerts.map((alert, idx) => {
        let borderColor = "border-l-blue-500";
        let icon = <Lightbulb className="w-5 h-5 text-blue-500" />;
        
        if (alert.type === 'danger') { borderColor = "border-l-red-500"; icon = <AlertTriangle className="w-5 h-5 text-red-500" />; }
        if (alert.type === 'fire') { borderColor = "border-l-orange-500"; icon = <Zap className="w-5 h-5 text-orange-500" />; }
        if (alert.type === 'success') { borderColor = "border-l-green-500"; icon = <Award className="w-5 h-5 text-green-500" />; }

        return (
          <div key={idx} className={`p-4 rounded-r-lg border-l-4 shadow-sm bg-white dark:bg-slate-900 dark:border-gray-800 flex gap-3 items-start ${borderColor}`}>
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{alert.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight mt-1">{alert.msg}</p>
              {alert.action && (
                <button className="text-xs font-semibold text-primary mt-2 flex items-center hover:underline">
                  {alert.action} <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- PREDICTIONS ROW ---
export const PredictionsRow = ({ predictions, currency }: { predictions: any, currency: string }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-lg">
        <CardContent className="p-5">
          <p className="text-indigo-200 text-xs mb-1 uppercase tracking-wider">Projected Payout</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{Math.round(predictions.projectedPayout).toLocaleString()}</span>
            <span className="text-sm opacity-80">{currency}</span>
          </div>
          <p className="text-xs text-indigo-100 mt-2 opacity-80">
            Based on your current daily average.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-900 border-none shadow-sm">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider">Goal Progress</p>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round((predictions.projectedPayout / predictions.goalTarget) * 100)}%
              </div>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((predictions.projectedPayout / predictions.goalTarget) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500">
            Target: {predictions.goalTarget.toLocaleString()} {currency}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// --- PATTERN CHART ---
export const PatternsChart = ({ data }: { data: any }) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = data.dayCounts.map((count: number, index: number) => ({
    day: daysOfWeek[index],
    count
  }));

  return (
    <Card className="dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Your Payment Habits
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
              {chartData.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={index === data.dayCounts.indexOf(Math.max(...data.dayCounts)) ? '#2563eb' : '#94a3b8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-center text-gray-400 mt-2">
          You are most active on <span className="font-bold">{data.bestDay}s</span>.
        </p>
      </CardContent>
    </Card>
  );
};
