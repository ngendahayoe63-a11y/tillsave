import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CycleHistoryCardProps {
  groupId: string;
  cycles: Array<{
    id: string;
    cycle_number: number;
    payout_date: string;
    totalSaved?: Record<string, number>;
    commissionEarned?: Record<string, number>;
    amountReceived?: Record<string, number>;
  }>;
  userRole: 'MEMBER' | 'ORGANIZER';
}

export const CycleHistoryCard = ({ groupId, cycles, userRole }: CycleHistoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!cycles || cycles.length === 0) {
    return null;
  }

  const formatAmount = (amounts: Record<string, number> | undefined) => {
    if (!amounts || Object.keys(amounts).length === 0) return 'N/A';
    return Object.entries(amounts)
      .map(([curr, val]) => `${val.toLocaleString()} ${curr}`)
      .join(' + ');
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-slate-700">
      <CardContent className="p-4">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Past Cycles
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cycles.length} completed cycle{cycles.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-3 border-t border-blue-200 dark:border-slate-700 pt-4">
            {cycles.map((cycle) => (
              <Link
                key={cycle.id}
                to={`/group/${groupId}/history/cycle/${cycle.id}`}
                className="block"
              >
                <Card className="bg-white dark:bg-slate-800 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Cycle {cycle.cycle_number}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(cycle.payout_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-gray-50 dark:bg-slate-700 rounded p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {userRole === 'MEMBER' ? 'Saved' : 'Collected'}
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                          {formatAmount(cycle.totalSaved)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-700 rounded p-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {userRole === 'MEMBER' ? 'Commission' : 'Your Earnings'}
                        </p>
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
                          {formatAmount(
                            userRole === 'MEMBER' 
                              ? cycle.commissionEarned 
                              : cycle.commissionEarned
                          )}
                        </p>
                      </div>
                      {userRole === 'MEMBER' && (
                        <div className="col-span-2 bg-green-50 dark:bg-green-900/20 rounded p-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Amount Received
                          </p>
                          <p className="text-sm font-bold text-green-700 dark:text-green-400 mt-1">
                            {formatAmount(cycle.amountReceived)}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      View Details →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
