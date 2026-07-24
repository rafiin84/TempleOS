import React, { useState } from 'react';

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorClass(name?: string): string {
  const colors = [
    'bg-violet-200 text-violet-700',
    'bg-blue-200 text-blue-700',
    'bg-emerald-200 text-emerald-700',
    'bg-amber-200 text-amber-700',
    'bg-rose-200 text-rose-700',
    'bg-cyan-200 text-cyan-700',
    'bg-fuchsia-200 text-fuchsia-700',
    'bg-indigo-200 text-indigo-700',
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full shrink-0 overflow-hidden',
        sizeClasses[size],
        !showImage && getColorClass(name),
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-semibold leading-none select-none">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

export default Avatar;
