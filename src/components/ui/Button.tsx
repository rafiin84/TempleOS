import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-white shadow-soft hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-300',
  secondary:
    'bg-light-violet text-primary hover:bg-primary-100 active:bg-primary-200 focus-visible:ring-primary-300',
  outline:
    'border border-[#ECECEC] bg-surface text-[#111827] hover:bg-[#FAFAFC] active:bg-[#ECECEC] focus-visible:ring-[#ECECEC]',
  ghost:
    'bg-transparent text-[#6B7280] hover:bg-[#FAFAFC] hover:text-[#111827] active:bg-[#ECECEC] focus-visible:ring-[#ECECEC]',
  danger:
    'bg-danger text-white shadow-soft hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-300',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-sm',
  md: 'h-10 px-4 text-sm gap-2 rounded-md',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  onClick,
  type = 'button',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'select-none',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : (
        icon && iconPosition === 'left' && (
          <span className="shrink-0">{icon}</span>
        )
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </motion.button>
  );
}

export default Button;
