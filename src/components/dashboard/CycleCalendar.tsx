import React, { useMemo } from 'react';
import { format, isToday, isFuture, differenceInCalendarDays, eachDayOfInterval } from 'date-fns';
import { Check, X, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CycleCalendarProps {
  cycleStartDate: Date;
  cycleDays: number;
  paidDays: string[]; // Array of date strings (YYYY-MM-DD format)
  currentDate?: Date;
  title?: string;
}

export const CycleCalendar: React.FC<CycleCalendarProps> = ({
  cycleStartDate,
  cycleDays,
  paidDays,
  currentDate = new Date(),
  title = 'Cycle Calendar'
}) => {
  const calendarData = useMemo(() => {
    const cycleEnd = new Date(cycleStartDate);
    cycleEnd.setDate(cycleEnd.getDate() + cycleDays - 1);

    // Generate all days in the cycle
    const allDays = eachDayOfInterval({
      start: cycleStartDate,
      end: cycleEnd
    });

    const paidDaysSet = new Set(paidDays.map(d => format(new Date(d), 'yyyy-MM-dd')));

    return allDays.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isPaid = paidDaysSet.has(dateStr);
      const isFutureDate = isFuture(date) && !isToday(date);

      return {
        date,
        isPaid,
        isFuture: isFutureDate,
        isToday: isToday(date),
        dateStr
      };
    });
  }, [cycleStartDate, cycleDays, paidDays, currentDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date(currentDate);
    const cycleStart = new Date(cycleStartDate);
    const daysElapsed = Math.min(
      cycleDays,
      differenceInCalendarDays(now, cycleStart) + 1
    );

    const paidCount = calendarData.filter(d => d.isPaid && !d.isFuture).length;
    const missedCount = daysElapsed - paidCount;

    return {
      totalCycleDays: cycleDays,
      daysElapsed,
      daysRemaining: Math.max(0, cycleDays - daysElapsed),
      paidDays: paidCount,
      missedDays: missedCount,
      percentage: daysElapsed > 0 ? Math.round((paidCount / daysElapsed) * 100) : 0
    };
  }, [calendarData, cycleDays, cycleStartDate, currentDate]);

  return (
    <Card className="dark:bg-slate-900 border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Cycle Days</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.totalCycleDays}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Days Paid</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.paidDays}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Days Missed</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.missedDays}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Days Left</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.daysRemaining}</p>
          </div>
        </div>

        {/* Calendar Grid */}
        <div>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 py-2">
                {day}
              </div>
            ))}

            {calendarData.map((day, idx) => (
              <div
                key={idx}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center border-2 text-xs font-semibold relative transition-all
                  ${day.isPaid ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400' : ''}
                  ${!day.isPaid && !day.isFuture ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400' : ''}
                  ${day.isFuture ? 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-500' : ''}
                  ${day.isToday ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900 font-bold' : ''}
                `}
                title={format(day.date, 'MMM d, yyyy')}
              >
                <span>{format(day.date, 'd')}</span>
                <span className="mt-0.5">
                  {day.isPaid ? (
                    <Check className="w-3 h-3" />
                  ) : !day.isFuture ? (
                    <X className="w-3 h-3" />
                  ) : (
                    <Circle className="w-2 h-2" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Saved</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Missed</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Future</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
