import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  daysRemaining: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, daysRemaining, label }) => {
  // Color logic: Green (early), Yellow (middle), Red (ending soon)
  let colorClass = "bg-green-500";
  if (progress > 50) colorClass = "bg-yellow-500";
  if (progress > 85) colorClass = "bg-red-500";

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs font-medium text-gray-500">
        <span>{label || "Cycle Progress"}</span>
        <span>{daysRemaining} days left</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};