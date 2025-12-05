import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface PredictionCardProps {
  data: any;
  currency: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ data, currency }) => {
  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4 opacity-80">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold uppercase tracking-wider">AI Forecast</span>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-indigo-200 text-xs mb-1">Projected Payout</p>
            <div className="text-3xl font-bold">
              {Math.round(data.projectedPayout).toLocaleString()} 
              <span className="text-base font-normal ml-1 opacity-70">{currency}</span>
            </div>
          </div>
          <div className="text-right">
             <p className="text-xs text-indigo-200 mb-1">{data.daysRemaining} days left</p>
             <div className="h-2 w-20 bg-indigo-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 w-3/4 animate-pulse" />
             </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-indigo-500/30 flex gap-2 text-xs text-indigo-100">
          <span>💡 Tip:</span>
          <span>Saving just 500 {currency} more daily would increase this by {(500 * data.daysRemaining).toLocaleString()}.</span>
        </div>
      </CardContent>
    </Card>
  );
};