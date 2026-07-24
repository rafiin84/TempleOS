import React from 'react';

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'image';
  count?: number;
}

const shimmer = 'animate-pulse bg-[#ECECEC] rounded';

function TextSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(shimmer, 'h-4 w-full rounded-sm', className)} />
  );
}

function AvatarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(shimmer, 'w-10 h-10 rounded-full', className)} />
  );
}

function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(shimmer, 'w-full h-48 rounded-lg', className)} />
  );
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface border border-[#ECECEC] rounded-lg p-4 shadow-card space-y-3', className)}>
      <div className="flex items-center gap-3">
        <div className={cn(shimmer, 'w-10 h-10 rounded-full shrink-0')} />
        <div className="flex-1 space-y-2">
          <div className={cn(shimmer, 'h-4 w-1/2 rounded-sm')} />
          <div className={cn(shimmer, 'h-3 w-1/3 rounded-sm')} />
        </div>
      </div>
      <div className={cn(shimmer, 'h-36 w-full rounded-md')} />
      <div className="space-y-2">
        <div className={cn(shimmer, 'h-3 w-full rounded-sm')} />
        <div className={cn(shimmer, 'h-3 w-4/5 rounded-sm')} />
      </div>
    </div>
  );
}

export function Skeleton({ className, variant = 'text', count = 1 }: SkeletonProps) {
  if (variant === 'avatar') return <AvatarSkeleton className={className} />;
  if (variant === 'image') return <ImageSkeleton className={className} />;
  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} className={className} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TextSkeleton
          key={i}
          className={cn(i === count - 1 && count > 1 ? 'w-3/5' : 'w-full', className)}
        />
      ))}
    </div>
  );
}

export default Skeleton;
