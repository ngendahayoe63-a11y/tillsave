import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Flame } from 'lucide-react';

interface MemberConsistencyCardProps {
  cyclesPaidIn: number;
  totalCycles: number;
  streakDays: number;
  trend?: 'improving' | 'stable' | 'declining';
}

export const MemberConsistencyCard = ({
  cyclesPaidIn,
  totalCycles,
  streakDays,
  trend = 'improving'
}: MemberConsistencyCardProps) => {
  const consistencyPercent = totalCycles > 0 ? Math.round((cyclesPaidIn / totalCycles) * 100) : 0;
  
  const getTrendMessage = () => {
    switch (trend) {
      case 'improving':
        return '📈 Your consistency is improving!';
      case 'stable':
        return '✨ You\'re maintaining great consistency!';
      case 'declining':
        return '⚠️ Try to stay consistent with your savings.';
      default:
        return '';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'stable':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'declining':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      default:
        return '';
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Your Consistency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Consistency Circle */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background */}
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200 dark:text-slate-700"
              />
              {/* Progress */}
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={351.86}
                strokeDashoffset={351.86 * (1 - consistencyPercent / 100)}
                className="text-green-500 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {consistencyPercent}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">consistent</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Cycles Paid
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {cyclesPaidIn}/{totalCycles}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
              <Flame className="w-3 h-3" /> Streak
            </p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400 mt-1">
              {streakDays} days
            </p>
          </div>
        </div>

        {/* Trend Message */}
        <div className={`rounded-lg p-3 text-sm font-medium ${getTrendColor()}`}>
          {getTrendMessage()}
        </div>
      </CardContent>
    </Card>
  );
};
