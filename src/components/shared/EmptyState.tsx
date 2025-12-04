import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 min-h-[300px] bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 ${className}`}>
      
      {/* Visual Circle with Ring Effect */}
      <div className="relative mb-6 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-primary/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200" />
        <div className="relative h-20 w-20 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center ring-1 ring-blue-100 dark:ring-slate-700">
          <Icon className="h-10 w-10 text-primary dark:text-blue-400 opacity-80" strokeWidth={1.5} />
        </div>
      </div>

      {/* Text Content */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] mb-6 leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="shadow-lg shadow-blue-500/20">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};