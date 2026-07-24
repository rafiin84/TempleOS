import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import type { Temple, CrowdLevel } from '@/types';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface TempleCardProps {
  temple: Temple;
  variant?: 'grid' | 'list' | 'compact';
  onClick?: () => void;
}

function crowdBadgeVariant(level: CrowdLevel) {
  switch (level) {
    case 'Low':       return 'success' as const;
    case 'Moderate':  return 'warning' as const;
    case 'High':      return 'danger' as const;
    case 'Very High': return 'danger' as const;
  }
}

function crowdLabel(level: CrowdLevel) {
  return level === 'Very High' ? 'Very Busy' : `${level} Crowd`;
}

function CoverImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  return (
    <div className={cn('bg-[#ECECEC] overflow-hidden shrink-0', className)}>
      {!err ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-light-violet">
          <span className="text-3xl">🛕</span>
        </div>
      )}
    </div>
  );
}

/* ─── Grid Variant ─────────────────────────────────────────────────────────── */
function GridCard({ temple, onClick }: { temple: Temple; onClick?: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(124,108,242,0.13)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-surface rounded-xl shadow-card border border-[#ECECEC] overflow-hidden cursor-pointer select-none"
    >
      {/* Image */}
      <div className="relative">
        <CoverImage
          src={temple.coverImage}
          alt={temple.name}
          className="h-44 w-full rounded-t-xl"
        />
        {/* Overlay badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <Badge variant={temple.isOpen ? 'success' : 'danger'} size="sm">
            {temple.isOpen ? '● Open' : '● Closed'}
          </Badge>
        </div>
        <div className="absolute top-2.5 right-2.5">
          <Badge variant={crowdBadgeVariant(temple.crowdLevel)} size="sm">
            <Users size={9} className="mr-0.5 inline" />
            {crowdLabel(temple.crowdLevel)}
          </Badge>
        </div>
        {/* Gradient scrim */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        <div>
          <h3 className="font-semibold text-[#111827] text-sm leading-snug line-clamp-1">
            {temple.name}
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">{temple.deity}</p>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
          <MapPin size={11} className="shrink-0 text-primary" />
          <span className="line-clamp-1">{temple.district}</span>
          {temple.distanceKm !== undefined && (
            <>
              <span className="mx-1 text-[#ECECEC]">·</span>
              <Navigation size={10} className="shrink-0" />
              <span>{temple.distanceKm.toFixed(1)} km</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#ECECEC]">
          <StarRating rating={temple.rating} reviewCount={temple.reviewCount} size="sm" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── List Variant ─────────────────────────────────────────────────────────── */
function ListCard({ temple, onClick }: { temple: Temple; onClick?: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -1, boxShadow: '0 8px 28px rgba(124,108,242,0.10)' }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="bg-surface rounded-xl shadow-card border border-[#ECECEC] overflow-hidden cursor-pointer select-none flex"
    >
      {/* Left image */}
      <CoverImage
        src={temple.coverImage}
        alt={temple.name}
        className="w-28 h-auto min-h-[112px] rounded-l-xl flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 p-4 min-w-0 flex flex-col gap-2 justify-center">
        {/* Name + badges row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-[#111827] text-sm leading-snug line-clamp-1">
              {temple.name}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">{temple.deity}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant={temple.isOpen ? 'success' : 'danger'} size="sm">
              {temple.isOpen ? '● Open' : '● Closed'}
            </Badge>
            <Badge variant={crowdBadgeVariant(temple.crowdLevel)} size="sm">
              {crowdLabel(temple.crowdLevel)}
            </Badge>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
          <MapPin size={11} className="shrink-0 text-primary" />
          <span>{temple.district}, Tamil Nadu</span>
          {temple.distanceKm !== undefined && (
            <>
              <span className="mx-1">·</span>
              <Navigation size={10} className="shrink-0" />
              <span>{temple.distanceKm.toFixed(1)} km away</span>
            </>
          )}
        </div>

        {/* Timings preview */}
        {temple.timings.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-[#6B7280]">
            <Clock size={11} className="shrink-0" />
            <span className="line-clamp-1">
              {temple.timings[0].morning} &amp; {temple.timings[0].evening}
            </span>
          </div>
        )}

        {/* Rating */}
        <StarRating rating={temple.rating} reviewCount={temple.reviewCount} size="sm" />
      </div>
    </motion.div>
  );
}

/* ─── Compact Variant ──────────────────────────────────────────────────────── */
function CompactCard({ temple, onClick }: { temple: Temple; onClick?: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: '#F5F3FF' }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 px-4 py-3 bg-surface border border-[#ECECEC] rounded-lg cursor-pointer select-none"
    >
      {/* Thumbnail */}
      <CoverImage
        src={temple.coverImage}
        alt={temple.name}
        className="w-12 h-12 rounded-lg shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111827] line-clamp-1">{temple.name}</p>
        <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-0.5">
          <MapPin size={10} className="shrink-0 text-primary" />
          <span className="line-clamp-1">{temple.district}</span>
          {temple.distanceKm !== undefined && (
            <span className="shrink-0 ml-1">&middot; {temple.distanceKm.toFixed(1)} km</span>
          )}
        </div>
      </div>

      {/* Right: rating + open */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-0.5 text-xs font-medium text-amber-500">
          <span>★</span>
          <span>{temple.rating.toFixed(1)}</span>
        </div>
        <Badge variant={temple.isOpen ? 'success' : 'danger'} size="sm">
          {temple.isOpen ? 'Open' : 'Closed'}
        </Badge>
      </div>
    </motion.div>
  );
}

/* ─── Exported Component ───────────────────────────────────────────────────── */
export function TempleCard({ temple, variant = 'grid', onClick }: TempleCardProps) {
  if (variant === 'list')    return <ListCard    temple={temple} onClick={onClick} />;
  if (variant === 'compact') return <CompactCard temple={temple} onClick={onClick} />;
  return <GridCard temple={temple} onClick={onClick} />;
}

export default TempleCard;
