import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Sparkles,
  CalendarCheck,
  Image as ImageIcon,
  Landmark,
  AlertTriangle,
  HardHat,
  Building2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { FeedItem } from '@/types';
import { useLang } from '@/contexts/LanguageContext';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function formatPostedAt(dateStr: string, lang: 'en' | 'ta'): string {
  const date = new Date(dateStr);
  const now  = new Date();
  const diffMs   = now.getTime() - date.getTime();
  const diffMins  = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays  = Math.floor(diffMs / 86_400_000);

  if (lang === 'ta') {
    if (diffMins < 1)   return 'இப்போதுதான்';
    if (diffMins < 60)  return `${diffMins} நிமிடம் முன்`;
    if (diffHours < 24) return `${diffHours} மணி முன்`;
    if (diffDays === 1) return 'நேற்று';
    return date.toLocaleDateString('ta-IN', { month: 'short', day: 'numeric' });
  }

  if (diffMins < 1)   return 'Just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';

  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    ...(!sameYear && { year: 'numeric' }),
  });
}

type FeedType = FeedItem['type'];

interface TypeConfig {
  label:   string;
  labelTa: string;
  icon:    React.ReactNode;
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'ghost';
  accent:  string;
}

const TYPE_CONFIG: Record<FeedType, TypeConfig> = {
  announcement: {
    label: 'Announcement', labelTa: 'அறிவிப்பு',
    icon:    <Megaphone   size={12} />,
    variant: 'primary',
    accent:  'bg-primary',
  },
  festival: {
    label: 'Festival', labelTa: 'திருவிழா',
    icon:    <Sparkles    size={12} />,
    variant: 'warning',
    accent:  'bg-warning',
  },
  'booking-open': {
    label: 'Booking Open', labelTa: 'பதிவு தொடங்கியது',
    icon:    <CalendarCheck size={12} />,
    variant: 'success',
    accent:  'bg-success',
  },
  photo: {
    label: 'Photo', labelTa: 'படம்',
    icon:    <ImageIcon   size={12} />,
    variant: 'ghost',
    accent:  'bg-[#6B7280]',
  },
  video: {
    label: 'Video', labelTa: 'வீடியோ',
    icon:    <ImageIcon   size={12} />,
    variant: 'ghost',
    accent:  'bg-[#6B7280]',
  },
  heritage: {
    label: 'Heritage', labelTa: 'பாரம்பரியம்',
    icon:    <Landmark    size={12} />,
    variant: 'primary',
    accent:  'bg-violet-400',
  },
  'crowd-alert': {
    label: 'Crowd Alert', labelTa: 'கூட்ட எச்சரிக்கை',
    icon:    <AlertTriangle size={12} />,
    variant: 'danger',
    accent:  'bg-danger',
  },
  renovation: {
    label: 'Renovation', labelTa: 'புதுப்பிப்பு',
    icon:    <HardHat     size={12} />,
    variant: 'default',
    accent:  'bg-[#6B7280]',
  },
};

/* ─── Feed Image ───────────────────────────────────────────────────────────── */
function FeedImage({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return (
    <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-[#ECECEC]">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setErr(true)}
      />
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  const { lang } = useLang();
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.announcement;
  const templeName = lang === 'ta'
    ? (item.temple?.nameTa || item.temple?.name || item.templeName)
    : (item.temple?.name ?? item.templeName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="w-full bg-surface rounded-xl shadow-card border border-[#ECECEC] overflow-hidden"
    >
      {/* Coloured accent bar */}
      <div className={cn('h-0.5 w-full', config.accent)} />

      <div className="p-4">
        {/* Top row: type badge + temple + time */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant={config.variant} size="sm">
              <span className="flex items-center gap-1">
                {config.icon}
                {lang === 'ta' ? config.labelTa : config.label}
              </span>
            </Badge>
            {templeName && (
              <>
                <span className="text-[#ECECEC] text-xs select-none">·</span>
                <div className="flex items-center gap-1 min-w-0">
                  <Building2 size={11} className="shrink-0 text-[#6B7280]" />
                  <span className="text-xs font-medium text-[#6B7280] line-clamp-1">
                    {templeName}
                  </span>
                </div>
              </>
            )}
          </div>
          <time className="text-[11px] text-[#6B7280] shrink-0 tabular-nums">
            {formatPostedAt(item.postedAt, lang)}
          </time>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-sm font-semibold text-[#111827] leading-snug line-clamp-2">
          {item.title}
        </h3>

        {/* Body */}
        <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed line-clamp-2">
          {item.body}
        </p>

        {/* Image */}
        {item.image && <FeedImage src={item.image} alt={item.title} />}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 4).map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-light-violet text-primary"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default FeedCard;
