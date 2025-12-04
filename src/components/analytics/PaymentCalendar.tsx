import React from 'react';
import { format, isToday, isFuture } from 'date-fns';
import { Check, X } from 'lucide-react';

interface DayData {
  date: Date;
  status: string; // 'PAID' | 'MISSED'
  amount: number;
}

interface PaymentCalendarProps {
  data: DayData[];
}

export const PaymentCalendar: React.FC<PaymentCalendarProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-center text-xs font-bold text-gray-400 py-1">
          {day}
        </div>
      ))}
      
      {data.map((day, idx) => {
        const isFutureDate = isFuture(day.date) && !isToday(day.date);
        const isPaid = day.status === 'PAID';
        
        return (
          <div 
            key={idx}
            className={`
              aspect-square rounded-lg flex flex-col items-center justify-center border relative
              ${isPaid ? 'bg-green-100 border-green-200 text-green-700' : ''}
              ${!isPaid && !isFutureDate ? 'bg-red-50 border-red-100 text-red-300' : ''}
              ${isFutureDate ? 'bg-gray-50 border-gray-100 text-gray-300' : ''}
              ${isToday(day.date) ? 'ring-2 ring-primary ring-offset-1' : ''}
            `}
          >
            <span className="text-xs font-semibold mb-1">{format(day.date, 'd')}</span>
            
            {isPaid ? (
              <Check className="w-4 h-4" />
            ) : !isFutureDate ? (
              <X className="w-4 h-4" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};