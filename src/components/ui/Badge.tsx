import React from 'react';

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-[#ECECEC] text-[#111827]',
  primary: 'bg-light-violet text-primary',
  success: 'bg-green-50 text-success',
  warning: 'bg-amber-50 text-warning',
  danger: 'bg-red-50 text-danger',
  ghost: 'bg-transparent border border-[#ECECEC] text-[#6B7280]',
};

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
