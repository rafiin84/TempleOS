import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, LayoutGrid, List, Map, Sparkles, Send, ChevronDown,
  MapPin, Navigation, Star, Clock, Bot, Loader2, SlidersHorizontal,
  TrendingUp, Compass,
} from 'lucide-react';

import type { Temple, District } from '@/types';
import { templeApi, districtApi } from '@/services/mock/api';
import { Button, Badge } from '@/components/ui';
import { TempleCard } from '@/components/temple';
import { useLang } from '@/contexts/LanguageContext';
import { T } from '@/i18n/translations';

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const FILTER_CHIPS = [
  { label: 'All',         labelTa: 'அனைத்தும்',      emoji: '🏛️' },
  { label: 'Shiva',       labelTa: 'சிவன்',           emoji: '🔱' },
  { label: 'Vishnu',      labelTa: 'விஷ்ணு',          emoji: '🪷' },
  { label: 'Murugan',     labelTa: 'முருகன்',         emoji: '🦚' },
  { label: 'Amman',       labelTa: 'அம்மன்',          emoji: '🙏' },
  { label: 'Navagraha',   labelTa: 'நவகிரகம்',        emoji: '⭐' },
  { label: 'Divya Desam', labelTa: 'திவ்ய தேசம்',     emoji: '📿' },
  { label: 'Heritage',    labelTa: 'பாரம்பரியம்',     emoji: '🗺️' },
];

const AI_EXAMPLE_QUERIES = [
  'Find Shiva temples near Thanjavur',
  'Temples open now with low crowd',
  'Heritage temples with audio guides',
  'Famous Amman temples in Madurai district',
  'Vishnu temples built before 1000 CE',
  'Temples accessible by wheelchair',
];

const AI_MOCK_RESPONSES: Record<string, string> = {
  default: `Based on your query, I found several temples matching your criteria in Tamil Nadu. The results are filtered and shown below. You can further narrow down using the district filter or category tabs above.`,
  shiva: `Found 12 Shiva temples near Thanjavur. The Brihadeeswara Temple (UNESCO Heritage Site) is the most prominent — open until 8:30 PM today with moderate crowd levels. Also notable: Gangaikondacholapuram temple, just 72 km away with low crowds.`,
  open: `Currently 8 temples are open across Tamil Nadu. The Brihadeeswara Temple (Thanjavur) and Meenakshi Amman Temple (Madurai) have the lowest crowd levels right now — ideal for a peaceful visit.`,
  heritage: `Tamil Nadu has 6 UNESCO-recognised heritage temples. All feature audio guides and most have 360° virtual tours. The Brihadeeswara Temple complex is the top-rated at 4.9 stars with over 12,000 reviews.`,
};

type ViewMode = 'grid' | 'list' | 'map';

/* ─── Animation variants ────────────────────────────────────────────────────── */
const cardEntrance = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const, delay: Math.min(i * 0.05, 0.4) },
  }),
};

/* ─── Skeleton card ─────────────────────────────────────────────────────────── */
function ExploreSkeleton({ variant }: { variant: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <div className="bg-surface rounded-xl border border-[#ECECEC] overflow-hidden flex animate-pulse shadow-card">
        <div className="w-28 min-h-[112px] bg-[#ECECEC] flex-shrink-0 rounded-l-xl" />
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 bg-[#ECECEC] rounded-sm w-2/3" />
          <div className="h-3 bg-[#ECECEC] rounded-sm w-1/2" />
          <div className="h-3 bg-[#ECECEC] rounded-sm w-3/4" />
          <div className="h-3 bg-[#ECECEC] rounded-sm w-1/3" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-surface rounded-xl border border-[#ECECEC] overflow-hidden animate-pulse shadow-card">
      <div className="h-44 bg-[#ECECEC]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#ECECEC] rounded-sm w-3/4" />
        <div className="h-3 bg-[#ECECEC] rounded-sm w-1/2" />
        <div className="h-3 bg-[#ECECEC] rounded-sm w-2/3" />
        <div className="h-px bg-[#ECECEC] w-full mt-1" />
        <div className="h-3 bg-[#ECECEC] rounded-sm w-2/5" />
      </div>
    </div>
  );
}

/* ─── Map Marker Pin ─────────────────────────────────────────────────────────── */
function MapMarker({
  temple,
  isSelected,
  onClick,
  style,
}: {
  temple: Temple;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}) {
  return (
    <motion.button
      onClick={onClick}
      style={style}
      animate={{ scale: isSelected ? 1.15 : 1 }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className={cn(
        'absolute flex flex-col items-center gap-0.5 group cursor-pointer',
        isSelected ? 'z-20' : 'z-10',
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-xl shadow-elevated flex items-center justify-center text-lg border-2 transition-colors',
          isSelected
            ? 'bg-primary border-primary text-white'
            : 'bg-white border-[#ECECEC] group-hover:border-primary',
        )}
      >
        🛕
      </div>
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            className="absolute top-12 z-30 bg-white rounded-xl shadow-elevated border border-[#ECECEC] p-3 w-56 text-left"
          >
            <p className="text-xs font-semibold text-[#111827] line-clamp-1">{temple.name}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5">{temple.deity}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin size={9} className="text-primary shrink-0" />
              <span className="text-[10px] text-[#6B7280]">{temple.district}</span>
              <span className="text-[10px] text-amber-500 ml-auto flex items-center gap-0.5">
                <Star size={9} fill="currentColor" />
                {temple.rating.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant={temple.isOpen ? 'success' : 'danger'} size="sm">
                {temple.isOpen ? '● Open' : '● Closed'}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={cn(
          'w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent',
          isSelected ? 'border-t-primary' : 'border-t-white',
        )}
      />
    </motion.button>
  );
}

/* ─── Map View ───────────────────────────────────────────────────────────────── */
function MapView({
  temples,
  onTempleClick,
}: {
  temples: Temple[];
  onTempleClick: (temple: Temple) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Tamil Nadu bounding box: lat ~8–13, lng ~77–80.3
  // Normalise to [0..100] for positioning within the map container
  function toPercent(lat: number, lng: number) {
    const latMin = 8.0, latMax = 13.5;
    const lngMin = 76.8, lngMax = 80.5;
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    const y = ((latMax - lat) / (latMax - latMin)) * 100; // invert Y
    return { x: Math.max(2, Math.min(93, x)), y: Math.max(2, Math.min(93, y)) };
  }

  const selectedTemple = temples.find((t) => t.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Map container */}
      <div className="relative w-full rounded-xl overflow-hidden border border-[#ECECEC] shadow-card bg-[#E8F4E8]" style={{ height: 480 }}>
        {/* Map-like background grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid-major" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#C8E6C9" strokeWidth="1" />
            </pattern>
            <pattern id="grid-minor" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#DCEDC8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-minor)" />
          <rect width="100%" height="100%" fill="url(#grid-major)" />

          {/* Simulated roads */}
          <line x1="20%" y1="0" x2="45%" y2="100%" stroke="#B8D4B8" strokeWidth="2.5" />
          <line x1="55%" y1="0" x2="70%" y2="100%" stroke="#B8D4B8" strokeWidth="2" />
          <line x1="0" y1="35%" x2="100%" y2="40%" stroke="#B8D4B8" strokeWidth="2.5" />
          <line x1="0" y1="65%" x2="100%" y2="60%" stroke="#B8D4B8" strokeWidth="2" />
          <line x1="30%" y1="0" x2="80%" y2="100%" stroke="#C5D9C5" strokeWidth="1.5" />

          {/* Rivers (blue lines) */}
          <path d="M 10% 20% Q 35% 45% 60% 70% T 90% 90%" stroke="#90CAF9" strokeWidth="3" fill="none" opacity="0.7" />
          <path d="M 5% 55% Q 30% 50% 55% 55% T 95% 45%" stroke="#90CAF9" strokeWidth="2" fill="none" opacity="0.5" />

          {/* Water body (sea on right) */}
          <rect x="88%" y="0" width="12%" height="100%" fill="#B3D9F5" opacity="0.5" />
        </svg>

        {/* Map label */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-soft border border-[#ECECEC] flex items-center gap-2">
          <Compass size={13} className="text-primary" />
          <span className="text-xs font-semibold text-[#111827]">Tamil Nadu</span>
          <span className="text-[10px] text-[#6B7280]">{temples.length} temples</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-soft border border-[#ECECEC] text-[10px] text-[#6B7280] space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white border border-[#ECECEC]" />
            <span>Temple</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-[#90CAF9]" />
            <span>River</span>
          </div>
        </div>

        {/* Placeholder notice */}
        <div className="absolute top-3 right-3 z-10 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 shadow-soft flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-amber-700">Map Preview — click a marker</span>
        </div>

        {/* Temple markers */}
        {temples.map((temple) => {
          const { x, y } = toPercent(temple.location.lat, temple.location.lng);
          return (
            <MapMarker
              key={temple.id}
              temple={temple}
              isSelected={selectedId === temple.id}
              onClick={() => setSelectedId(selectedId === temple.id ? null : temple.id)}
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)' }}
            />
          );
        })}
      </div>

      {/* Selected temple detail strip */}
      <AnimatePresence>
        {selectedTemple && (
          <motion.div
            key={selectedTemple.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
          >
            <TempleCard
              temple={selectedTemple}
              variant="list"
              onClick={() => onTempleClick(selectedTemple)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable temple list below map */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
        {temples.map((temple) => (
          <motion.button
            key={temple.id}
            onClick={() => setSelectedId(temple.id)}
            whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(124,108,242,0.12)' }}
            transition={{ duration: 0.15 }}
            className={cn(
              'text-left bg-surface rounded-xl border p-3 transition-colors duration-150 shadow-soft',
              selectedId === temple.id
                ? 'border-primary ring-1 ring-primary/20'
                : 'border-[#ECECEC] hover:border-primary/40',
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">🛕</span>
              <Badge variant={temple.isOpen ? 'success' : 'danger'} size="sm">
                {temple.isOpen ? 'Open' : 'Closed'}
              </Badge>
            </div>
            <p className="text-xs font-semibold text-[#111827] line-clamp-1">{temple.name}</p>
            <p className="text-[10px] text-[#6B7280] mt-0.5 flex items-center gap-1">
              <MapPin size={8} className="text-primary" />
              {temple.district}
            </p>
            <div className="flex items-center gap-0.5 mt-1 text-[10px] text-amber-500 font-medium">
              <Star size={9} fill="currentColor" />
              {temple.rating.toFixed(1)}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─── AI Panel ────────────────────────────────────────────────────────────────── */
function AiPanel({
  onClose,
  onSearch,
}: {
  onClose: () => void;
  onSearch: (q: string) => void;
}) {
  const { lang } = useLang();
  const tr = T[lang];
  const [aiQuery, setAiQuery] = useState('');
  const [thinking, setThinking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function getMockResponse(q: string): string {
    const lower = q.toLowerCase();
    if (lower.includes('shiva') || lower.includes('thanjavur')) return AI_MOCK_RESPONSES.shiva;
    if (lower.includes('open') || lower.includes('crowd')) return AI_MOCK_RESPONSES.open;
    if (lower.includes('heritage') || lower.includes('audio')) return AI_MOCK_RESPONSES.heritage;
    return AI_MOCK_RESPONSES.default;
  }

  const handleSubmit = async (q: string) => {
    const query = q.trim();
    if (!query) return;
    setAiQuery(query);
    setThinking(true);
    setResponse(null);

    await new Promise((r) => setTimeout(r, 1200));
    setResponse(getMockResponse(query));
    setThinking(false);
  };

  const handleApply = () => {
    if (aiQuery.trim()) {
      onSearch(aiQuery.trim());
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-elevated border border-[#ECECEC] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ECECEC] bg-gradient-to-r from-[#F5F3FF] to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-soft">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827]">{tr.explore.aiModalTitle}</p>
              <p className="text-xs text-[#6B7280]">Describe what you're looking for</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#FAFAFC] hover:text-[#111827] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Example queries */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Try asking</p>
          <div className="flex flex-col gap-1.5">
            {AI_EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSubmit(q)}
                disabled={thinking}
                className="text-left text-xs text-[#6B7280] bg-[#FAFAFC] border border-[#ECECEC] rounded-lg px-3 py-2 hover:border-primary/40 hover:text-primary hover:bg-light-violet transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* AI Response area */}
        <AnimatePresence>
          {(thinking || response) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pt-2 pb-0 overflow-hidden"
            >
              <div className="bg-[#F5F3FF] border border-primary/20 rounded-xl p-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={12} className="text-primary" />
                  </div>
                  {thinking ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 size={14} className="text-primary animate-spin" />
                      <span className="text-xs text-[#6B7280] italic">Searching temples...</span>
                    </div>
                  ) : (
                    <div className="space-y-2 flex-1">
                      <p className="text-xs text-[#111827] leading-relaxed">{response}</p>
                      <button
                        onClick={handleApply}
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-primary bg-white border border-primary/30 rounded-full px-3 py-1 hover:bg-light-violet transition-colors"
                      >
                        <TrendingUp size={10} />
                        Apply search to results
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(aiQuery); }}
          className="px-5 pb-5 pt-3"
        >
          <div className="flex items-center gap-2 bg-[#FAFAFC] border border-[#ECECEC] rounded-xl px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={tr.explore.aiModalPlaceholder}
              className="flex-1 py-3 text-sm text-[#111827] bg-transparent placeholder-[#6B7280] focus:outline-none"
            />
            <button
              type="submit"
              title={tr.explore.aiModalBtn}
              disabled={!aiQuery.trim() || thinking}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 shrink-0',
                aiQuery.trim() && !thinking
                  ? 'bg-primary text-white hover:bg-primary-600'
                  : 'bg-[#ECECEC] text-[#6B7280] cursor-not-allowed',
              )}
            >
              {thinking ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────────── */
function EmptyState({
  query,
  category,
  onClear,
}: {
  query: string;
  category: string;
  onClear: () => void;
}) {
  const { lang } = useLang();
  const tr = T[lang];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-[#F5F3FF] border border-[#ECECEC] flex items-center justify-center">
          <span className="text-4xl">🛕</span>
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#FAFAFC] border border-[#ECECEC] flex items-center justify-center shadow-soft">
          <Search size={14} className="text-[#6B7280]" />
        </div>
      </div>

      <h3 className="text-base font-bold text-[#111827] mb-1">{tr.explore.noResults}</h3>

      <p className="text-sm text-[#6B7280] mb-1 max-w-xs">
        {query && category
          ? `No "${category}" temples match "${query}"`
          : query
          ? `No temples match "${query}"`
          : category
          ? `No "${category}" temples found with current filters`
          : 'No temples match the current filters'}
      </p>
      <p className="text-xs text-[#6B7280] mb-6 max-w-xs">
        {tr.explore.noResultsSub}
      </p>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear all filters
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── View Toggle Button ─────────────────────────────────────────────────────── */
function ViewBtn({
  mode,
  current,
  onClick,
  icon: Icon,
  label,
}: {
  mode: ViewMode;
  current: ViewMode;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  const active = mode === current;
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        'flex items-center gap-1.5 px-2.5 h-8 rounded-md text-xs font-medium transition-colors duration-150',
        active
          ? 'bg-primary text-white shadow-soft'
          : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFAFC]',
      )}
    >
      <Icon size={14} />
      <span className="hidden sm:block">{label}</span>
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function Explore() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang } = useLang();
  const tr = T[lang];

  // URL-persisted state
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [district, setDistrict] = useState(searchParams.get('district') ?? '');
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) ?? 'grid',
  );

  // Local state
  const [temples, setTemples] = useState<Temple[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [districtOptions, setDistrictOptions] = useState<District[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 300);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load district options
  useEffect(() => {
    districtApi.list().then(setDistrictOptions);
  }, []);

  // Sync URL params on mount (handles navigation from Home chips)
  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    const d = searchParams.get('district');
    const v = searchParams.get('view') as ViewMode | null;
    if (s !== null) setSearchInput(s);
    if (c !== null) setCategory(c);
    if (d !== null) setDistrict(d);
    if (v && ['grid', 'list', 'map'].includes(v)) setViewMode(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch temples whenever debounced filters change
  useEffect(() => {
    setLoading(true);

    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (district) params.district = district;
    if (viewMode !== 'grid') params.view = viewMode;
    setSearchParams(params, { replace: true });

    templeApi
      .list({
        search: debouncedSearch || undefined,
        category: category || undefined,
        district: district || undefined,
      })
      .then((result) => {
        setTemples(result.items);
        setTotalCount(result.total);
        setLoading(false);
      });
  }, [debouncedSearch, category, district]);

  // Persist view mode in URL
  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (viewMode !== 'grid') prev.set('view', viewMode);
        else prev.delete('view');
        return prev;
      },
      { replace: true },
    );
  }, [viewMode]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setCategory('');
    setDistrict('');
    setSearchParams({}, { replace: true });
    searchRef.current?.focus();
  }, [setSearchParams]);

  const hasActiveFilters = !!(debouncedSearch || category || district);
  const isSearching = debouncedSearch.length > 0;

  return (
    <div className="min-h-screen bg-background">

      {/* ── STICKY SEARCH BAR ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">

          {/* Search input */}
          <div className="flex-1 flex items-center gap-2 bg-[#FAFAFC] border border-[#ECECEC] rounded-xl px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 focus-within:bg-white transition-all duration-200 max-w-xl">
            <Search size={16} className="text-[#6B7280] shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={tr.explore.searchPlaceholder}
              className="flex-1 py-2.5 text-sm text-[#111827] bg-transparent placeholder-[#6B7280] focus:outline-none"
            />
            <AnimatePresence>
              {searchInput && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchInput('')}
                  className="text-[#6B7280] hover:text-[#111827] transition-colors shrink-0"
                >
                  <X size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Result count (shows when searching) */}
          <AnimatePresence>
            {!loading && isSearching && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="hidden md:block text-xs text-[#6B7280] shrink-0 whitespace-nowrap"
              >
                <span className="font-semibold text-[#111827]">{temples.length}</span> {tr.explore.results}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Spacer */}
          <div className="flex-1 hidden md:block" />

          {/* Mobile filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'md:hidden flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium border transition-colors',
              showFilters || hasActiveFilters
                ? 'border-primary text-primary bg-light-violet'
                : 'border-[#ECECEC] text-[#6B7280] bg-white',
            )}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-bold">
                {[!!debouncedSearch, !!category, !!district].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-[#FAFAFC] border border-[#ECECEC] rounded-lg p-1 shrink-0">
            <ViewBtn mode="grid"  current={viewMode} onClick={() => setViewMode('grid')}  icon={LayoutGrid} label={tr.explore.grid} />
            <ViewBtn mode="list"  current={viewMode} onClick={() => setViewMode('list')}  icon={List}        label={tr.explore.list} />
            <ViewBtn mode="map"   current={viewMode} onClick={() => setViewMode('map')}   icon={Map}         label="Map"  />
          </div>
        </div>

        {/* ── FILTER BAR ──────────────────────────────────────────────────── */}
        <div className={cn('border-t border-[#ECECEC] bg-white', !showFilters && 'hidden md:block')}>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-3">

            {/* Scrollable category chips */}
            <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 min-w-0">
              {FILTER_CHIPS.map(({ label, labelTa, emoji }) => {
                const isActive = label === 'All' ? !category : category === label;
                const displayLabel = lang === 'ta' ? labelTa : (label === 'All' ? tr.explore.all : label);
                return (
                  <motion.button
                    key={label}
                    onClick={() => setCategory(label === 'All' ? '' : label)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border',
                      isActive
                        ? 'bg-primary text-white border-primary shadow-soft'
                        : 'bg-white border-[#ECECEC] text-[#6B7280] hover:border-primary/40 hover:text-primary hover:bg-light-violet',
                    )}
                  >
                    <span className="text-sm leading-none">{emoji}</span>
                    {displayLabel}
                  </motion.button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-5 bg-[#ECECEC] shrink-0" />

            {/* District dropdown */}
            <div className="relative shrink-0">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={cn(
                  'appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border transition-colors duration-150 cursor-pointer focus:outline-none focus:border-primary bg-white min-w-[120px]',
                  district
                    ? 'border-primary text-primary font-semibold bg-light-violet'
                    : 'border-[#ECECEC] text-[#6B7280] hover:border-primary/40',
                )}
              >
                <option value="">{tr.explore.filterDistrict}</option>
                {districtOptions.map((d) => (
                  <option key={d.id} value={d.name}>
                    {lang === 'ta' ? (d.nameTa || d.name) : d.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={11}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]"
              />
            </div>

            {/* Clear active filters */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={clearFilters}
                  className="flex-shrink-0 flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-danger transition-colors"
                >
                  <X size={11} />
                  <span className="hidden sm:block">Clear</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-32">

        {/* Result count line */}
        <AnimatePresence>
          {!loading && viewMode !== 'map' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between mb-4"
            >
              <p className="text-sm text-[#6B7280]">
                {hasActiveFilters ? (
                  <>
                    <span className="font-semibold text-[#111827]">{temples.length}</span>
                    {' '}temple{temples.length !== 1 ? 's' : ''} found
                    {totalCount > temples.length && (
                      <span className="text-[#6B7280]"> of {totalCount.toLocaleString()}</span>
                    )}
                    {debouncedSearch && (
                      <span className="text-[#6B7280]"> for "<span className="text-[#111827] font-medium">{debouncedSearch}</span>"</span>
                    )}
                  </>
                ) : (
                  <>
                    Showing all{' '}
                    <span className="font-semibold text-[#111827]">{totalCount.toLocaleString()}</span>{' '}
                    temples
                  </>
                )}
              </p>

              {/* Active filter pills */}
              <div className="flex items-center gap-1.5">
                {category && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-light-violet text-primary rounded-full px-2.5 py-0.5 font-medium border border-primary/20">
                    {category}
                    <button onClick={() => setCategory('')} className="hover:text-danger">
                      <X size={10} />
                    </button>
                  </span>
                )}
                {district && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-light-violet text-primary rounded-full px-2.5 py-0.5 font-medium border border-primary/20">
                    <Navigation size={9} />
                    {district}
                    <button onClick={() => setDistrict('')} className="hover:text-danger">
                      <X size={10} />
                    </button>
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAP VIEW ──────────────────────────────────────────────────────── */}
        {viewMode === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="w-full rounded-xl bg-[#ECECEC] animate-pulse" style={{ height: 480 }} />
            ) : temples.length === 0 ? (
              <EmptyState query={debouncedSearch} category={category} onClear={clearFilters} />
            ) : (
              <MapView temples={temples} onTempleClick={(t) => navigate(`/temple/${t.id}`)} />
            )}
          </motion.div>
        )}

        {/* ── GRID VIEW ─────────────────────────────────────────────────────── */}
        {viewMode === 'grid' && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ExploreSkeleton key={i} variant="grid" />
                ))}
              </div>
            ) : temples.length === 0 ? (
              <EmptyState query={debouncedSearch} category={category} onClear={clearFilters} />
            ) : (
              <motion.div
                key="grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {temples.map((temple, i) => (
                    <motion.div
                      key={temple.id}
                      layout
                      custom={i}
                      variants={cardEntrance}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.96 }}
                    >
                      <TempleCard
                        temple={temple}
                        variant="grid"
                        onClick={() => navigate(`/temple/${temple.id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}

        {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
        {viewMode === 'list' && (
          <>
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ExploreSkeleton key={i} variant="list" />
                ))}
              </div>
            ) : temples.length === 0 ? (
              <EmptyState query={debouncedSearch} category={category} onClear={clearFilters} />
            ) : (
              <motion.div
                key="list"
                className="flex flex-col gap-3"
              >
                <AnimatePresence mode="popLayout">
                  {temples.map((temple, i) => (
                    <motion.div
                      key={temple.id}
                      layout
                      custom={i}
                      variants={cardEntrance}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -8 }}
                    >
                      <TempleCard
                        temple={temple}
                        variant="list"
                        onClick={() => navigate(`/temple/${temple.id}`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ── AI SEARCH FLOATING BUTTON ─────────────────────────────────────────── */}
      <motion.button
        onClick={() => setShowAiPanel(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(124,108,242,0.35)' }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center gap-2.5 bg-primary text-white px-5 py-3 rounded-full shadow-elevated text-sm font-semibold"
      >
        <Sparkles size={16} />
        {tr.explore.aiAsk}
        <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
      </motion.button>

      {/* ── AI PANEL MODAL ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAiPanel && (
          <AiPanel
            onClose={() => setShowAiPanel(false)}
            onSearch={(q) => {
              setSearchInput(q);
              setViewMode('grid');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
