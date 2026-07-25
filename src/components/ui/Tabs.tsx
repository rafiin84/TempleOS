import React from 'react';
import { motion } from 'framer-motion';

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  wrap?: boolean;
}

export function Tabs({ tabs, value, onChange, className, wrap }: TabsProps) {
  return (
    <div
      className={cn(
        'flex items-end gap-0 border-b border-[#ECECEC]',
        !wrap && 'overflow-x-auto',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative py-2 transition-colors duration-150 outline-none',
              'focus-visible:ring-2 focus-visible:ring-primary/30 rounded-t-sm',
              wrap
                ? 'px-1 text-[10px] font-medium flex-1 min-w-0 text-center leading-tight'
                : 'px-4 text-sm font-medium whitespace-nowrap shrink-0',
              isActive ? 'text-primary' : 'text-[#6B7280] hover:text-[#111827]',
            )}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
