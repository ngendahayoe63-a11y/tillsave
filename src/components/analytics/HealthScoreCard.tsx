import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface HealthScoreCardProps {
  score: number;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score }) => {
  // Color Logic
  let color = "text-red-500";
  let bgColor = "bg-red-100 dark:bg-red-900/20";
  let label = "Needs Attention";
  let Icon = AlertTriangle;

  if (score >= 60) {
    color = "text-yellow-500";
    bgColor = "bg-yellow-100 dark:bg-yellow-900/20";
    label = "Good";
    Icon = TrendingUp;
  }
  if (score >= 85) {
    color = "text-green-500";
    bgColor = "bg-green-100 dark:bg-green-900/20";
    label = "Excellent";
    Icon = CheckCircle;
  }

  return (
    <Card className="dark:bg-slate-900 border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Financial Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        {/* Score Circle */}
        <div className={`h-20 w-20 rounded-full flex items-center justify-center border-4 ${bgColor} ${color.replace('text', 'border')} relative`}>
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
        </div>

        {/* Text Details */}
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${color} flex items-center gap-2`}>
            {label} <Icon className="h-5 w-5" />
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Based on your consistency, streak, and volume vs. targets.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};