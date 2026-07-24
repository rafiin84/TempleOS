import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, QrCode, PenLine } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { PassportEntry as PassportEntryType } from '@/types';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function formatVisitDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

/* ─── Temple image with error fallback ─────────────────────────────────────── */

function TempleImage({
  src,
  alt,
  className,
}: {
  src:        string;
  alt:        string;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  return (
    <div className={cn('overflow-hidden bg-light-violet flex items-center justify-center', className)}>
      {!err ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <span className="text-2xl">🛕</span>
      )}
    </div>
  );
}

/* ─── Method badge ─────────────────────────────────────────────────────────── */

function MethodBadge({ method }: { method: 'qr' | 'manual' }) {
  return (
    <Badge
      variant={method === 'qr' ? 'primary' : 'ghost'}
      size="sm"
      className="flex items-center gap-0.5"
    >
      {method === 'qr' ? (
        <><QrCode size={9} className="mr-0.5" />QR Scan</>
      ) : (
        <><PenLine size={9} className="mr-0.5" />Manual</>
      )}
    </Badge>
  );
}

/* ─── PassportEntry — circular stamp card ──────────────────────────────────── */

interface PassportEntryProps {
  entry:      PassportEntryType;
  index?:     number;
  isVisited?: boolean;
}

export function PassportEntry({ entry, index, isVisited = true }: PassportEntryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.22,
        ease: 'easeOut',
        delay: index !== undefined ? index * 0.06 : 0,
      }}
      className="flex flex-col items-center gap-2 w-[88px]"
    >
      {/* Circular stamp */}
      {isVisited ? (
        <div className="relative shrink-0">
          {/* Primary color ring */}
          <div className="w-16 h-16 rounded-full ring-2 ring-primary ring-offset-2 overflow-hidden">
            <TempleImage
              src={entry.templeImage}
              alt={entry.templeName}
              className="w-full h-full rounded-full"
            />
          </div>
          {/* Method indicator dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-white">
            {entry.method === 'qr' ? (
              <QrCode size={9} className="text-white" />
            ) : (
              <PenLine size={9} className="text-white" />
            )}
          </div>
        </div>
      ) : (
        /* Unvisited placeholder — greyscale dashed */
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#ECECEC] bg-[#FAFAFC] flex items-center justify-center shrink-0 grayscale opacity-50 overflow-hidden">
          <TempleImage
            src={entry.templeImage}
            alt={entry.templeName}
            className="w-full h-full rounded-full opacity-60"
          />
        </div>
      )}

      {/* Temple name */}
      <p
        className={cn(
          'text-[11px] font-semibold text-center leading-tight line-clamp-2 w-full',
          isVisited ? 'text-[#111827]' : 'text-[#6B7280]',
        )}
      >
        {entry.templeName}
      </p>

      {/* Visit date */}
      {isVisited && (
        <div className="flex items-center gap-0.5 text-[10px] text-[#6B7280]">
          <CalendarDays size={9} className="shrink-0" />
          <span>{formatVisitDate(entry.visitedAt)}</span>
        </div>
      )}

      {/* Method badge */}
      <MethodBadge method={entry.method} />
    </motion.div>
  );
}

/* ─── PassportEntryList — horizontal list-item variant ─────────────────────── */

interface PassportEntryListProps {
  entry:      PassportEntryType;
  index?:     number;
  isVisited?: boolean;
}

export function PassportEntryList({ entry, index, isVisited = true }: PassportEntryListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.22,
        ease: 'easeOut',
        delay: index !== undefined ? index * 0.06 : 0,
      }}
      className={cn(
        'flex items-center gap-3 bg-surface rounded-xl shadow-card border border-[#ECECEC] p-3 select-none',
        !isVisited && 'opacity-60 grayscale',
      )}
    >
      {/* Circular avatar */}
      <div
        className={cn(
          'w-12 h-12 rounded-full shrink-0 overflow-hidden',
          isVisited
            ? 'ring-2 ring-primary ring-offset-1'
            : 'border-2 border-dashed border-[#ECECEC]',
        )}
      >
        <TempleImage
          src={entry.templeImage}
          alt={entry.templeName}
          className="w-full h-full"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111827] line-clamp-1">
          {entry.templeName}
        </p>
        {entry.pooja && (
          <p className="text-xs text-primary font-medium mt-0.5 line-clamp-1">
            {entry.pooja}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1 text-[11px] text-[#6B7280]">
          <CalendarDays size={11} className="shrink-0" />
          <span>{formatVisitDate(entry.visitedAt)}</span>
        </div>
      </div>

      {/* Right: method badge + entry number */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <MethodBadge method={entry.method} />
        {index !== undefined && (
          <span className="text-[10px] font-bold text-[#6B7280] tabular-nums">
            #{String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default PassportEntry;
