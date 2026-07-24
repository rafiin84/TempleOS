import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Calendar, Clock, Users, CheckCircle2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { Booking, BookingStatus } from '@/types';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ─── QR Code dot-grid placeholder ────────────────────────────────────────── */

const FINDER = [
  [1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1],
];

const GRID_SIZE = 21;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function buildMatrix(ticket: string): boolean[][] {
  let seed = 0;
  for (let i = 0; i < ticket.length; i++) {
    seed = (seed * 31 + ticket.charCodeAt(i)) >>> 0;
  }
  const rand = seededRandom(seed);

  const grid: boolean[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false),
  );

  function placeFinder(row: number, col: number) {
    FINDER.forEach((r, ri) =>
      r.forEach((v, ci) => {
        if (ri + row < GRID_SIZE && ci + col < GRID_SIZE) {
          grid[ri + row][ci + col] = v === 1;
        }
      }),
    );
  }
  placeFinder(0, 0);
  placeFinder(0, GRID_SIZE - 7);
  placeFinder(GRID_SIZE - 7, 0);

  const reserved = new Set<string>();
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) reserved.add(`${r},${c}`);
  for (let r = 0; r < 9; r++) for (let c = GRID_SIZE - 8; c < GRID_SIZE; c++) reserved.add(`${r},${c}`);
  for (let r = GRID_SIZE - 8; r < GRID_SIZE; r++) for (let c = 0; c < 9; c++) reserved.add(`${r},${c}`);
  for (let i = 8; i < GRID_SIZE - 8; i++) {
    reserved.add(`6,${i}`);
    reserved.add(`${i},6`);
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!reserved.has(`${r},${c}`)) {
        grid[r][c] = rand() > 0.45;
      }
    }
  }

  return grid;
}

interface QRPlaceholderProps {
  ticket: string;
}

function QRPlaceholder({ ticket }: QRPlaceholderProps) {
  const matrix = buildMatrix(ticket);
  const totalSize = 140;
  const cell = totalSize / GRID_SIZE;

  return (
    <div
      className="w-[140px] h-[140px] rounded-lg overflow-hidden bg-white p-1"
      aria-label="QR Code"
    >
      <svg
        width={totalSize}
        height={totalSize}
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <rect width={totalSize} height={totalSize} fill="white" />
        {matrix.map((row, ri) =>
          row.map((filled, ci) =>
            filled ? (
              <rect
                key={`${ri}-${ci}`}
                x={ci * cell + 0.5}
                y={ri * cell + 0.5}
                width={cell - 1}
                height={cell - 1}
                rx={cell * 0.22}
                fill="#111827"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}

/* ─── Status config ────────────────────────────────────────────────────────── */

interface StatusUi {
  label:    string;
  variant:  'success' | 'warning' | 'danger' | 'ghost' | 'primary';
  barColor: string;
}

const STATUS_UI: Record<BookingStatus, StatusUi> = {
  confirmed: { label: 'Confirmed', variant: 'success', barColor: 'bg-green-400'  },
  pending:   { label: 'Pending',   variant: 'warning', barColor: 'bg-amber-400'  },
  cancelled: { label: 'Cancelled', variant: 'danger',  barColor: 'bg-red-400'    },
  completed: { label: 'Completed', variant: 'ghost',   barColor: 'bg-[#ECECEC]'  },
  scanned:   { label: 'Scanned',   variant: 'primary', barColor: 'bg-primary'    },
};

/* ─── Detail item ──────────────────────────────────────────────────────────── */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon:  React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-medium">
        {label}
      </span>
      <div className="flex items-center gap-1.5 text-[#111827] text-sm font-semibold">
        <span className="text-primary shrink-0">{icon}</span>
        <span>{value}</span>
      </div>
    </div>
  );
}

/* ─── Serrated divider ─────────────────────────────────────────────────────── */

function SerratedDivider() {
  return (
    <div className="relative flex items-center overflow-hidden">
      <div className="absolute -left-5 w-9 h-9 rounded-full bg-[#FAFAFC] border-r border-[#ECECEC]" />
      <div className="flex-1 border-t border-dashed border-[#ECECEC] mx-4" />
      <div className="absolute -right-5 w-9 h-9 rounded-full bg-[#FAFAFC] border-l border-[#ECECEC]" />
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────────────── */

interface QRCardProps {
  booking: Booking;
}

export function QRCard({ booking }: QRCardProps) {
  const statusUi  = STATUS_UI[booking.status];
  const isCancelled = booking.status === 'cancelled';

  const formattedDate = new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative bg-surface rounded-xl shadow-card border overflow-hidden max-w-sm mx-auto select-none',
        isCancelled ? 'border-red-100' : 'border-[#ECECEC]',
      )}
    >
      {/* Status accent bar */}
      <div className={cn('h-1', statusUi.barColor)} />

      {/* Header */}
      <div
        className={cn(
          'px-5 py-4',
          isCancelled
            ? 'bg-gradient-to-br from-red-50 to-white'
            : 'bg-gradient-to-br from-light-violet to-white',
        )}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin size={12} className={isCancelled ? 'text-danger' : 'text-primary'} />
          <p className="text-xs text-[#6B7280] font-medium line-clamp-1">
            {booking.templeName}
          </p>
        </div>
        <h2 className="text-base font-bold text-[#111827] line-clamp-1">
          {booking.poojaName}
        </h2>
        <div className="mt-3">
          <Badge variant={statusUi.variant}>{statusUi.label}</Badge>
        </div>
      </div>

      {/* Details grid */}
      <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <DetailItem icon={<Calendar size={13} />}    label="Date"    value={formattedDate} />
        <DetailItem icon={<Clock    size={13} />}    label="Slot"    value={booking.slot} />
        <DetailItem icon={<Users    size={13} />}    label="Persons" value={`${booking.persons} ${booking.persons === 1 ? 'Person' : 'Persons'}`} />
        <DetailItem icon={<CheckCircle2 size={13} />} label="Amount" value={`₹${booking.totalAmount.toLocaleString('en-IN')}`} />
      </div>

      {/* Serrated divider */}
      <div className="px-5">
        <SerratedDivider />
      </div>

      {/* QR section */}
      <div className="px-5 py-5 flex flex-col items-center gap-3">
        <div
          className={cn(
            'p-3 rounded-xl border-2',
            isCancelled ? 'border-red-200 opacity-40 grayscale' : 'border-[#ECECEC]',
          )}
        >
          <QRPlaceholder ticket={booking.ticketNumber} />
        </div>

        <div className="text-center">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-widest font-medium">
            Ticket Number
          </p>
          <p className="text-sm font-mono font-bold text-[#111827] tracking-wider mt-0.5">
            #{booking.ticketNumber}
          </p>
        </div>

        {/* Bottom row */}
        <div className="w-full flex items-center justify-between pt-2 border-t border-dashed border-[#ECECEC]">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Users size={13} className="text-primary" />
            <span>
              {booking.persons} {booking.persons === 1 ? 'Person' : 'Persons'}
            </span>
          </div>
          <Badge variant={statusUi.variant} size="sm">
            {statusUi.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
          <QrCode size={11} className="text-primary" />
          <span>Scan at Temple</span>
        </div>
      </div>

      {/* Cancelled watermark */}
      {isCancelled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-danger/25 font-black text-3xl rotate-[-25deg] tracking-[0.25em] border-4 border-danger/20 px-4 py-1 rounded-lg">
            CANCELLED
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default QRCard;
