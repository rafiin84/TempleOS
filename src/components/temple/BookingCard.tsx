import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  Users,
  IndianRupee,
  QrCode,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Booking, BookingStatus } from '@/types';
import { useLang } from '@/contexts/LanguageContext';
import { T } from '@/i18n/translations';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ─── Status config ────────────────────────────────────────────────────────── */
interface StatusConfig {
  label:   string;
  variant: 'success' | 'warning' | 'danger' | 'ghost' | 'primary';
  dot:     string; // tailwind text color for dot
}

const STATUS_CONFIG: Record<BookingStatus, StatusConfig & { labelTa: string }> = {
  confirmed: { label: 'Confirmed', labelTa: 'உறுதிப்படுத்தப்பட்டது', variant: 'success', dot: 'text-success' },
  pending:   { label: 'Pending',   labelTa: 'நிலுவையில் உள்ளது',     variant: 'warning', dot: 'text-warning' },
  cancelled: { label: 'Cancelled', labelTa: 'ரத்து செய்யப்பட்டது',   variant: 'danger',  dot: 'text-danger'  },
  completed: { label: 'Completed', labelTa: 'முடிந்தது',              variant: 'ghost',   dot: 'text-[#6B7280]' },
  scanned:   { label: 'Scanned',   labelTa: 'ஸ்கேன் செய்யப்பட்டது', variant: 'primary', dot: 'text-primary'  },
};

/* ─── Temple image ─────────────────────────────────────────────────────────── */
function TempleThumb({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className="w-14 h-14 rounded-xl overflow-hidden bg-light-violet shrink-0 flex items-center justify-center">
      {!err ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <span className="text-2xl">🛕</span>
      )}
    </div>
  );
}

/* ─── Info row ─────────────────────────────────────────────────────────────── */
function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#6B7280]">
      <span className="text-primary shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
interface BookingCardProps {
  booking:     Booking;
  onViewQR?:  () => void;
}

export function BookingCard({ booking, onViewQR }: BookingCardProps) {
  const { lang } = useLang();
  const tr = T[lang];
  const statusCfg = STATUS_CONFIG[booking.status];
  const isCancelled = booking.status === 'cancelled';

  const formattedDate = new Date(booking.date).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
    weekday: 'short',
    year:    'numeric',
    month:   'short',
    day:     'numeric',
  });

  return (
    <motion.div
      whileHover={!isCancelled ? { y: -2, boxShadow: '0 10px 36px rgba(124,108,242,0.11)' } : {}}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'bg-surface rounded-xl shadow-card border overflow-hidden select-none',
        isCancelled ? 'border-red-100 opacity-75' : 'border-[#ECECEC]',
      )}
    >
      {/* Status accent bar */}
      <div
        className={cn(
          'h-0.5',
          booking.status === 'confirmed' && 'bg-success',
          booking.status === 'pending'   && 'bg-warning',
          booking.status === 'cancelled' && 'bg-danger',
          booking.status === 'completed' && 'bg-[#ECECEC]',
          booking.status === 'scanned'   && 'bg-primary',
        )}
      />

      <div className="p-4">
        {/* Header: temple thumb + name + status */}
        <div className="flex items-start gap-3">
          <TempleThumb src={booking.templeImage} alt={booking.templeName} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111827] line-clamp-1">
                  {lang === 'ta' ? (booking.templeNameTa || booking.templeName) : booking.templeName}
                </p>
                <p className="text-xs text-primary font-medium mt-0.5 line-clamp-1">
                  {lang === 'ta' ? (booking.poojaNameTa || booking.poojaName) : booking.poojaName}
                </p>
              </div>
              <Badge variant={statusCfg.variant} size="sm" className="shrink-0">
                <span className={cn('mr-1', statusCfg.dot)}>●</span>
                {lang === 'ta' ? statusCfg.labelTa : statusCfg.label}
              </Badge>
            </div>

            {/* Ticket number */}
            <p className="text-[10px] text-[#6B7280] mt-1 font-mono tracking-wide">
              #{booking.ticketNumber}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-dashed border-[#ECECEC]" />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2">
          <InfoRow icon={<CalendarDays size={12} />}>
            {formattedDate}
          </InfoRow>
          <InfoRow icon={<Clock size={12} />}>
            {booking.slot}
          </InfoRow>
          <InfoRow icon={<Users size={12} />}>
            {booking.persons} {booking.persons === 1 ? tr.booking.person : tr.booking.persons}
          </InfoRow>
          <InfoRow icon={<IndianRupee size={12} />}>
            {booking.totalAmount.toLocaleString('en-IN')}
          </InfoRow>
        </div>

        {/* QR button — only for active bookings */}
        {(booking.status === 'confirmed' || booking.status === 'scanned') && onViewQR && (
          <>
            <div className="my-3 border-t border-[#ECECEC]" />
            <Button
              variant="secondary"
              size="sm"
              icon={<QrCode size={14} />}
              iconPosition="left"
              onClick={onViewQR}
              className="w-full justify-between"
            >
              <span className="flex-1 text-left">{lang === 'ta' ? 'QR டிக்கெட் காண்க' : 'View QR Ticket'}</span>
              <ChevronRight size={14} className="text-primary opacity-60" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default BookingCard;
