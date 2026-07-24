import React from 'react';
import { motion } from 'framer-motion';

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface CardProps {
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  children: React.ReactNode;
  padding?: boolean;
}

export function Card({
  className,
  onClick,
  hoverable = false,
  children,
  padding = true,
}: CardProps) {
  const isInteractive = hoverable || !!onClick;

  return (
    <motion.div
      onClick={onClick}
      whileHover={isInteractive ? { y: -2, boxShadow: 'var(--shadow-elevated)' } : {}}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'bg-surface rounded-lg shadow-card border border-[#ECECEC]',
        padding && 'p-4',
        isInteractive && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export default Card;
