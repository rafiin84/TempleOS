import React from 'react';
import { Star } from 'lucide-react';

type ClassValue = string | undefined | null | false;

function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 12,
  md: 16,
  lg: 20,
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

function StarIcon({ fill, size }: { fill: 'full' | 'half' | 'empty'; size: number }) {
  if (fill === 'full') {
    return <Star size={size} className="fill-amber-400 text-amber-400 shrink-0" />;
  }

  if (fill === 'half') {
    return (
      <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
        <Star size={size} className="text-[#ECECEC] fill-[#ECECEC]" />
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: size / 2 }}
        >
          <Star size={size} className="fill-amber-400 text-amber-400" />
        </span>
      </span>
    );
  }

  return <Star size={size} className="fill-[#ECECEC] text-[#ECECEC] shrink-0" />;
}

export function StarRating({ rating, reviewCount, size = 'md', className }: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(5, rating));
  const iconSize = sizeMap[size];

  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = clampedRating - i;
    if (filled >= 1) return 'full' as const;
    if (filled >= 0.5) return 'half' as const;
    return 'empty' as const;
  });

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <span className="flex items-center gap-0.5">
        {stars.map((fill, i) => (
          <StarIcon key={i} fill={fill} size={iconSize} />
        ))}
      </span>
      {typeof reviewCount === 'number' && (
        <span className={cn('text-[#6B7280] leading-none', textSizeMap[size])}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}

export default StarRating;
