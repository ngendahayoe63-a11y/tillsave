import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { Calendar, Copy, Settings, ArrowRight, BarChart3, History, DollarSign, Clock } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';

interface GroupCardProps {
  group: any;
  role: 'ORGANIZER' | 'MEMBER';
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, role }) => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const copyCode = () => {
    navigator.clipboard.writeText(group.join_code);
    addToast({
      type: 'success',
      title: 'Code copied',
      description: `Join code ${group.join_code} copied to clipboard`,
      duration: 2000,
    });
  };

  // Calculate Progress Logic directly here for Organizer View
  const startDate = new Date(group.current_cycle_start_date);
  const today = new Date();
  const daysPassed = differenceInCalendarDays(today, startDate);
  const daysRemaining = Math.max(0, group.cycle_days - daysPassed);
  const progressPercent = Math.min(100, Math.max(0, (daysPassed / group.cycle_days) * 100));

  return (
    <Card className="mb-4 shadow-sm border-l-4 border-l-primary bg-card text-card-foreground dark:border-l-primary dark:bg-slate-900 dark:border-gray-800">
      <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">{group.name}</CardTitle>
          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full font-mono">
            {t('groups.cycle')} {group.current_cycle}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 pt-4">
        {/* Progress Bar */}
        <div className="mb-4">
           <ProgressBar progress={progressPercent} daysRemaining={daysRemaining} />
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{group.cycle_days} Days / {t('groups.cycle')}</span>
          </div>
          
          {role === 'ORGANIZER' && (
             <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-2 rounded border border-dashed border-gray-300 dark:border-gray-700 mt-2">
               <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{t('groups.join_code_label')}:</span>
               <code className="text-primary font-bold text-base">{group.join_code}</code>
               <button onClick={copyCode} className="ml-auto text-gray-400 hover:text-primary transition-colors">
                 <Copy className="w-4 h-4" />
               </button>
             </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 gap-2 flex-wrap bg-gray-50 dark:bg-slate-900/50 pb-3 rounded-b-lg">
        {role === 'ORGANIZER' ? (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Link to={`/organizer/group/${group.id}`} className="col-span-1">
              <Button className="w-full" variant="outline">{t('groups.manage')}</Button>
            </Link>
            <Link to={`/organizer/group/${group.id}/analytics`} className="col-span-1">
              <Button className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50">
                <BarChart3 className="w-4 h-4 mr-1" /> Insights
              </Button>
            </Link>
            {/* END CYCLE BUTTON */}
            <Link to={`/organizer/group/${group.id}/payout-cycle`} className="col-span-2">
              <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200">
                <DollarSign className="w-4 h-4 mr-1" /> End Cycle & Payout
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Link to={`/member/group/${group.id}/setup`} className="col-span-1">
              <Button variant="outline" className="w-full h-9 px-2 text-[10px]">
                <Settings className="w-3 h-3 mr-1" /> {t('common.setup')}
              </Button>
            </Link>
            
            {/* NEW PAST CYCLES LINK */}
            <Link to={`/group/${group.id}/history/cycles`} className="col-span-1">
              <Button variant="outline" className="w-full h-9 px-2 text-[10px]">
                <Clock className="w-3 h-3 mr-1" /> Past Cycles
              </Button>
            </Link>

            <Link to={`/member/group/${group.id}/history`} className="col-span-1">
              <Button variant="outline" className="w-full h-9 px-2 text-[10px]">
                <History className="w-3 h-3 mr-1" /> {t('common.history')}
              </Button>
            </Link>
            
            <Link to={`/member/group/${group.id}/payout`} className="col-span-1">
               <Button className="w-full h-9 bg-green-600 hover:bg-green-700 text-white text-[10px]">
                 {t('common.view_payout')} <ArrowRight className="w-3 h-3 ml-1" />
               </Button>
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
