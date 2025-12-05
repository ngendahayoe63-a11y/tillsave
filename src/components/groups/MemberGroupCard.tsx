import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Settings, BarChart3, ArrowRight, PiggyBank, Receipt } from 'lucide-react';

interface MemberGroupCardProps {
  data: any;
}

export const MemberGroupCard: React.FC<MemberGroupCardProps> = ({ data }) => {
  const { t } = useTranslation();
  const { group, cycle, financials } = data;

  return (
    // FIX: Added dark:border-gray-800 and removed hardcoded white backgrounds
    <Card className="mb-4 border-none shadow-md overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800 bg-card text-card-foreground">
      
      {/* Header: Fixed dark mode background */}
      <CardHeader className="bg-gray-50 dark:bg-slate-900 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">{group.name}</CardTitle>
          <span className="text-xs font-mono bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
            Cycle {cycle.current}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        <ProgressBar 
          progress={cycle.progressPercent} 
          daysRemaining={cycle.daysRemaining} 
        />

        {/* Financial Grid: Fixed dark mode colors */}
        <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-3 space-y-3">
          {financials.length === 0 ? (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 italic py-2">
              No contributions yet this cycle.
            </p>
          ) : (
            financials.map((fin: any) => (
              <div key={fin.currency} className="flex flex-col gap-1 border-b border-blue-100 dark:border-blue-800 last:border-0 pb-2 last:pb-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900 dark:text-blue-100">{fin.currency}</span>
                  <span className="font-bold text-lg text-green-700 dark:text-green-400">{fin.net.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <PiggyBank className="w-3 h-3" /> Saved: {fin.saved.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-red-400 dark:text-red-300">
                    <Receipt className="w-3 h-3" /> Fee: -{fin.fee.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Footer: Fixed dark mode background */}
      <CardFooter className="bg-gray-50 dark:bg-slate-900 pt-2 pb-2 px-2 grid grid-cols-4 gap-2">
        <Link to={`/member/group/${group.id}/setup`} className="col-span-1">
          <Button variant="ghost" className="w-full h-10 flex-col gap-1 text-[10px] text-gray-600 dark:text-gray-300 hover:dark:bg-slate-800">
            <Settings className="w-4 h-4" /> {t('common.setup')}
          </Button>
        </Link>
        
        <Link to={`/member/group/${group.id}/analytics`} className="col-span-1">
          <Button variant="ghost" className="w-full h-10 flex-col gap-1 text-[10px] text-gray-600 dark:text-gray-300 hover:dark:bg-slate-800">
            <BarChart3 className="w-4 h-4" /> Stats
          </Button>
        </Link>

        <Link to={`/member/group/${group.id}/payout`} className="col-span-2">
           {/* FIX: Dark mode friendly main button */}
           <Button className="w-full h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 hover:dark:bg-slate-700 shadow-sm">
             {t('common.view_payout')} <ArrowRight className="w-4 h-4 ml-1" />
           </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
