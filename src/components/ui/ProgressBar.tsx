import React from 'react';
import { motion } from 'framer-motion';

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface ProgressBarProps {
  value: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

const colorClasses: Record<NonNullable<ProgressBarProps['color']>, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export function ProgressBar({
  value,
  color = 'primary',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-2 bg-[#ECECEC] rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-[#6B7280] tabular-nums w-9 text-right shrink-0">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}

export default ProgressBar;
