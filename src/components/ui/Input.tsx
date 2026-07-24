import React, { forwardRef } from 'react';

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  containerClassName?: string;
}

const sizeClasses = {
  sm: 'h-8 text-xs px-3',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

const iconSizeClasses = {
  sm: 'px-2.5',
  md: 'px-3',
  lg: 'px-4',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefix,
      suffix,
      size = 'md',
      className,
      containerClassName,
      disabled,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#111827] select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span
              className={cn(
                'absolute left-0 inset-y-0 flex items-center text-[#6B7280] pointer-events-none',
                iconSizeClasses[size],
              )}
            >
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full rounded-md border bg-surface text-[#111827] placeholder-[#6B7280]',
              'transition-colors duration-150 outline-none',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              error
                ? 'border-danger focus:border-danger focus:ring-danger/20'
                : 'border-[#ECECEC] hover:border-primary/40',
              disabled && 'opacity-50 cursor-not-allowed bg-[#FAFAFC]',
              sizeClasses[size],
              !!prefix && (size === 'lg' ? 'pl-11' : 'pl-9'),
              !!suffix && (size === 'lg' ? 'pr-11' : 'pr-9'),
              className,
            )}
            {...props}
          />

          {suffix && (
            <span
              className={cn(
                'absolute right-0 inset-y-0 flex items-center text-[#6B7280] pointer-events-none',
                iconSizeClasses[size],
              )}
            >
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-danger font-medium">{error}</p>
        )}
        {!error && hint && (
          <p className="text-xs text-[#6B7280]">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
