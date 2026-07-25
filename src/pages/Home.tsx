import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowRight, MapPin, Calendar, Users,
  Clock, Route as RouteIcon,
} from 'lucide-react';

import type { Temple, Festival, PilgrimageRoute, District } from '@/types';
import { templeApi, festivalApi, routeApi, districtApi } from '@/services/mock/api';
import { Badge } from '@/components/ui';
import { TempleCard } from '@/components/temple';
import { useLang } from '@/contexts/LanguageContext';
import { T } from '@/i18n/translations';

/* ─── Utility ─────────────────────────────────────────────────────────────── */
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ─── Animation variants ──────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  }),
};

/* ─── Static data ─────────────────────────────────────────────────────────── */
const QUICK_CATS = [
  { label: 'Shiva',      emoji: '🔱' },
  { label: 'Vishnu',     emoji: '🪷' },
  { label: 'Murugan',    emoji: '🦚' },
  { label: 'Amman',      emoji: '🙏' },
  { label: 'Navagraha',  emoji: '⭐' },
  { label: 'Heritage',   emoji: '🏛️' },
];

const WORKS = [
  {
    id: 1,
    title: 'Restoring sacred heritage',
    sub: 'Gopuram conservation · Madurai',
    status: 'completed',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Meenakshi_Amman_Temple_at_night.jpg/1280px-Meenakshi_Amman_Temple_at_night.jpg',
  },
  {
    id: 2,
    title: 'Better facilities for devotees',
    sub: 'Pilgrim amenities · Rameswaram',
    status: 'completed',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Ramanathaswamy_Temple_Corridor.jpg/1280px-Ramanathaswamy_Temple_Corridor.jpg',
  },
  {
    id: 3,
    title: 'Reviving temple tanks',
    sub: 'Water conservation · Thanjavur',
    status: 'ongoing',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Brihadisvara_Temple_during_Maha_Shivaratri-WUS03611_%28edit%29.jpg/1280px-Brihadisvara_Temple_during_Maha_Shivaratri-WUS03611_%28edit%29.jpg',
  },
];

const DEITY_GRID = [
  { label: 'Shiva',       emoji: '🔱', category: 'Shiva',       bgClass: 'bg-violet-50',  emojiSize: 'text-3xl' },
  { label: 'Vishnu',      emoji: '🪷', category: 'Vishnu',      bgClass: 'bg-blue-50',    emojiSize: 'text-3xl' },
  { label: 'Murugan',     emoji: '🦚', category: 'Murugan',     bgClass: 'bg-orange-50',  emojiSize: 'text-3xl' },
  { label: 'Amman',       emoji: '🙏', category: 'Amman',       bgClass: 'bg-rose-50',    emojiSize: 'text-3xl' },
  { label: 'Ganesha',     emoji: '🐘', category: 'Ganesha',     bgClass: 'bg-amber-50',   emojiSize: 'text-3xl' },
  { label: 'Navagraha',   emoji: '⭐', category: 'Navagraha',   bgClass: 'bg-cyan-50',    emojiSize: 'text-3xl' },
  { label: 'Divya Desam', emoji: '🏛️', category: 'Divya Desam', bgClass: 'bg-emerald-50', emojiSize: 'text-3xl' },
  { label: 'Heritage',    emoji: '🗺️', category: 'Heritage',    bgClass: 'bg-primary-50', emojiSize: 'text-3xl' },
];


/* ─── Reusable Section Header ─────────────────────────────────────────────── */
function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
}) {
  const { lang } = useLang();
  const tr = T[lang];
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="flex items-end justify-between mb-6"
    >
      <div>
        {eyebrow && (
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.12em] mb-1.5">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl md:text-[28px] font-bold text-[#111827] leading-tight">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          to={href}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-600 transition-colors shrink-0 ml-4 pb-0.5"
        >
          {tr.home.viewAll}
          <ArrowRight size={14} />
        </Link>
      )}
    </motion.div>
  );
}

/* ─── Skeleton for TempleCard ────────────────────────────────────────────── */
function TempleCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl shadow-card border border-[#ECECEC] overflow-hidden animate-pulse">
      <div className="h-44 bg-[#ECECEC]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#ECECEC] rounded-sm w-3/4" />
        <div className="h-3 bg-[#ECECEC] rounded-sm w-1/2" />
        <div className="h-3 bg-[#ECECEC] rounded-sm w-2/3" />
      </div>
    </div>
  );
}

/* ─── Live Festival Card ─────────────────────────────────────────────────── */
function LiveFestivalCard({ festival }: { festival: Festival }) {
  const [imgErr, setImgErr] = useState(false);
  const [thumbErr, setThumbErr] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 56px rgba(124,108,242,0.18)' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 w-80 bg-surface rounded-xl shadow-card border border-[#ECECEC] overflow-hidden cursor-pointer"
    >
      {/* Cover image */}
      <div className="relative h-48 bg-[#ECECEC]">
        {!imgErr && (
          <img
            src={festival.image}
            alt={festival.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        )}
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* LIVE badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            LIVE NOW
          </span>
        </div>

        {/* District badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="ghost" size="sm" className="bg-black/30 text-white border-white/20">
            {festival.district}
          </Badge>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-base leading-snug line-clamp-1">
            {festival.name}
          </h3>
          <p className="text-white/70 text-xs font-medium mt-0.5">{festival.nameTa}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#ECECEC] overflow-hidden shrink-0">
            {!thumbErr && (
              <img
                src={festival.templeImage}
                alt={festival.templeName}
                className="w-full h-full object-cover"
                onError={() => setThumbErr(true)}
              />
            )}
          </div>
          <p className="text-xs font-medium text-[#374151] line-clamp-1 min-w-0">
            {festival.templeName}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#6B7280] shrink-0 ml-3">
          <Calendar size={10} className="text-primary" />
          {new Date(festival.startDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Festival loading skeleton ──────────────────────────────────────────── */
function FestivalSkeleton() {
  return (
    <div className="flex-shrink-0 w-80 rounded-xl bg-[#ECECEC] animate-pulse" style={{ height: '228px' }} />
  );
}

/* ─── District Card ──────────────────────────────────────────────────────── */
function DistrictCard({ district, onClick }: { district: District; onClick: () => void }) {
  const { lang } = useLang();
  const tr = T[lang];
  const [imgErr, setImgErr] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.025 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-xl overflow-hidden cursor-pointer h-40 md:h-48 bg-[#ECECEC] group shadow-soft select-none"
    >
      {!imgErr && (
        <img
          src={district.coverImage}
          alt={district.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}
          onError={() => setImgErr(true)}
        />
      )}
      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-bold text-base leading-tight">{lang === 'ta' ? (district.nameTa || district.name) : district.name}</p>
        <p className="text-white/65 text-[11px] font-medium mt-0.5">{district.nameTa}</p>
        <div className="mt-2">
          <span
            className="inline-block text-white text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}
          >
            {district.templeCount.toLocaleString()} {tr.home.temples}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Route Card ─────────────────────────────────────────────────────────── */
function RouteCard({ route, onClick }: { route: PilgrimageRoute; onClick: () => void }) {
  const { lang } = useLang();
  const tr = T[lang];
  const [imgErr, setImgErr] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5, boxShadow: '0 20px 56px rgba(124,108,242,0.18)' }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 w-72 bg-surface rounded-xl shadow-card border border-[#ECECEC] overflow-hidden cursor-pointer select-none"
    >
      {/* Image */}
      <div className="relative h-40 bg-[#ECECEC]">
        {!imgErr && (
          <img
            src={route.coverImage}
            alt={route.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

        {/* Duration badge */}
        <div className="absolute top-3 right-3">
          <span
            className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          >
            {route.durationDays} {tr.home.days}
          </span>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="primary" size="sm">{route.category}</Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <p className="font-bold text-[#111827] text-sm leading-snug line-clamp-1">
            {lang === 'ta' ? (route.nameTa || route.name) : route.name}
          </p>
          <p className="text-[11px] text-[#6B7280] mt-0.5">{route.nameTa}</p>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <MapPin size={10} className="text-primary" />
            {route.templeCount} {tr.home.temples}
          </span>
          <span className="flex items-center gap-1">
            <RouteIcon size={10} />
            {route.distanceKm} {tr.home.km}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {route.durationDays}d
          </span>
        </div>

        {/* Completed by */}
        {route.completedBy !== undefined && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] pt-2.5 border-t border-[#ECECEC]">
            <Users size={10} className="text-primary" />
            <span>{route.completedBy.toLocaleString()} {tr.home.devotees}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Home() {
  const { lang } = useLang();
  const tr = T[lang];
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchFocused, setSearchFocused]   = useState(false);

  const [featuredTemples, setFeaturedTemples] = useState<Temple[]>([]);
  const [liveFestivals, setLiveFestivals]     = useState<Festival[]>([]);
  const [districts, setDistricts]             = useState<District[]>([]);
  const [routes, setRoutes]                   = useState<PilgrimageRoute[]>([]);

  const [loadingTemples,   setLoadingTemples]   = useState(true);
  const [loadingFestivals, setLoadingFestivals] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingRoutes,    setLoadingRoutes]    = useState(true);

  const stats = [
    { value: tr.home.statsTemplesVal,   label: tr.home.statsTemplesLabel,   sub: tr.home.statsTemplesSub   },
    { value: tr.home.statsDistrictsVal, label: tr.home.statsDistrictsLabel, sub: tr.home.statsDistrictsSub },
    { value: tr.home.statsDonatedVal,   label: tr.home.statsDonatedLabel,   sub: tr.home.statsDonatedSub   },
    { value: tr.home.statsVisitsVal,    label: tr.home.statsVisitsLabel,    sub: tr.home.statsVisitsSub    },
  ];

  useEffect(() => {
    templeApi.getFeatured().then((data) => {
      setFeaturedTemples(data);
      setLoadingTemples(false);
    });
    festivalApi.getLive().then((data) => {
      setLiveFestivals(data);
      setLoadingFestivals(false);
    });
    districtApi.list().then((data) => {
      setDistricts(data.slice(0, 6));
      setLoadingDistricts(false);
    });
    routeApi.list().then((data) => {
      setRoutes(data);
      setLoadingRoutes(false);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 · HERO
          ═══════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Brihadisvara_Temple_during_Maha_Shivaratri-WUS03611_%28edit%29.jpg/1920px-Brihadisvara_Temple_during_Maha_Shivaratri-WUS03611_%28edit%29.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
      >
        {/* Dark overlay — keeps text crisp over the photo */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Bottom fade into page background */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-20 md:py-36 text-center flex flex-col items-center">

          {/* Platform pill */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold text-white/90 mb-8 select-none"
            style={{
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 1px 6px rgba(0,0,0,0.25)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {tr.home.tagline}
          </motion.div>

          {/* Hero headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="font-extrabold text-white tracking-tight leading-[0.95] mb-5 select-none"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}
          >
            {tr.home.heroTitle}
          </motion.h1>

          {/* English subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.18}
            className="text-xl md:text-2xl font-medium text-white/90 leading-snug"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
          >
            {tr.home.subtitle}
          </motion.p>

          {/* Stats line */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.24}
            className="flex items-center justify-center gap-2 text-sm text-white/70 mt-3 flex-wrap"
          >
            <span>{tr.home.stats1}</span>
            <span className="w-1 h-1 rounded-full bg-white/30 inline-block" />
            <span>{tr.home.stats2}</span>
            <span className="w-1 h-1 rounded-full bg-white/30 inline-block" />
            <span>{tr.home.stats3}</span>
          </motion.div>

          {/* Search bar */}
          <motion.form
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.32}
            onSubmit={handleSearch}
            className="w-full max-w-2xl mt-10"
          >
            <div
              className="bg-white rounded-xl flex items-center overflow-hidden transition-all duration-200"
              style={{
                border: searchFocused
                  ? '1.5px solid #7C6CF2'
                  : '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: searchFocused
                  ? '0 8px 32px rgba(124,108,242,0.25), 0 0 0 3px rgba(124,108,242,0.12)'
                  : '0 8px 40px rgba(0,0,0,0.3), 0 2px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div className="pl-5 flex items-center shrink-0 text-[#9CA3AF]">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={tr.home.searchPlaceholder}
                className="flex-1 px-4 py-4 text-sm md:text-base text-[#111827] placeholder-[#9CA3AF] bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="m-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors duration-150 shrink-0 select-none"
              >
                {tr.home.searchBtn}
              </button>
            </div>
          </motion.form>

          {/* Quick category chips */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.4}
            className="flex flex-wrap justify-center gap-2 mt-5"
          >
            {QUICK_CATS.map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.label)}`)}
                className="rounded-full px-4 py-2 text-xs font-medium text-white/90 border border-white/25 hover:border-primary/60 hover:text-primary hover:bg-white/15 transition-all duration-150 select-none"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 · LIVE FESTIVALS
          ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {(loadingFestivals || liveFestivals.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="py-12 border-b border-[#F3F4F6]"
          >
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {/* Ping animation */}
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <h2 className="text-2xl md:text-[28px] font-bold text-[#111827]">
                    {tr.home.liveFestivals}
                  </h2>
                </div>
                <Link
                  to="/explore"
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-600 transition-colors"
                >
                  {tr.home.seeAll} <ArrowRight size={14} />
                </Link>
              </div>

              {/* Scroll container */}
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {loadingFestivals
                  ? Array.from({ length: 3 }).map((_, i) => <FestivalSkeleton key={i} />)
                  : liveFestivals.map((f) => <LiveFestivalCard key={f.id} festival={f} />)
                }
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 · FEATURED TEMPLES
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeader
            eyebrow={tr.home.featuredEyebrow}
            title={tr.home.featuredTemples}
            href="/explore"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {loadingTemples
              ? Array.from({ length: 4 }).map((_, i) => <TempleCardSkeleton key={i} />)
              : featuredTemples.map((temple, i) => (
                  <motion.div
                    key={temple.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-40px' }}
                    custom={i * 0.1}
                  >
                    <TempleCard
                      temple={temple}
                      variant="grid"
                      onClick={() => navigate(`/temple/${temple.id}`)}
                    />
                  </motion.div>
                ))
            }
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 · EXPLORE BY DISTRICT
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeader
            eyebrow={tr.home.districtsEyebrow}
            title={tr.home.exploreDistricts}
            href="/explore"
          />

          {loadingDistricts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-[#ECECEC] animate-pulse"
                  style={{ height: '192px' }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {districts.map((district, i) => (
                <motion.div
                  key={district.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  custom={i * 0.08}
                >
                  <DistrictCard
                    district={district}
                    onClick={() =>
                      navigate(`/explore?district=${encodeURIComponent(district.name)}`)
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5 · PILGRIMAGE ROUTES
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeader
            eyebrow={tr.home.routesEyebrow}
            title={tr.home.pilgrimageRoutes}
            href="/explore"
          />

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {loadingRoutes
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-72 rounded-xl bg-[#ECECEC] animate-pulse"
                    style={{ height: '248px' }}
                  />
                ))
              : routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    onClick={() => navigate('/explore')}
                  />
                ))
            }
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6 · EXPLORE BY DEITY
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionHeader
            eyebrow={tr.home.deityEyebrow}
            title={tr.home.browseDeity}
          />

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 md:gap-3">
            {DEITY_GRID.map((item, i) => (
              <motion.button
                key={item.label}
                onClick={() =>
                  navigate(`/explore?category=${encodeURIComponent(item.category)}`)
                }
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i * 0.05}
                whileHover={{ scale: 1.06, y: -3 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-2.5 bg-white border border-[#ECECEC] rounded-xl p-3 md:p-4 cursor-pointer hover:border-primary/30 hover:shadow-card transition-all duration-200 select-none"
              >
                <div
                  className={cn(
                    'w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center',
                    item.bgClass,
                  )}
                >
                  <span className={cn('leading-none', item.emojiSize)}>{item.emoji}</span>
                </div>
                <span className="text-[10px] md:text-[11px] font-semibold text-[#374151] text-center leading-tight">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 7 · STATS BANNER
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3E2895 0%, #4C32B8 40%, #6D56E8 100%)' }}>
        {/* Dot texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Glows */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.04)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.04)', filter: 'blur(60px)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-[11px] font-bold text-white/40 uppercase tracking-[0.16em] mb-10"
          >
            {tr.home.statsBanner}
          </motion.p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.1}
                className="flex flex-col items-center"
              >
                <p
                  className="font-extrabold text-white tracking-tight"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
                >
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-white/85 mt-1.5">{stat.label}</p>
                <p className="text-xs text-white/45 mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.45}
            className="text-center mt-12"
          >
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-white text-primary text-sm font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50 transition-colors duration-150 select-none shadow-lg"
            >
              Explore All Temples
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Work on the Ground ── */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-8">
            <SectionHeader
              eyebrow={tr.home.worksEyebrow}
              title={tr.home.worksTitle}
              className="mb-0"
            />
            <Link to="/updates" className="text-sm font-semibold text-primary hover:underline shrink-0 ml-4">
              {tr.home.worksViewAll}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {WORKS.map((w, i) => (
              <motion.div
                key={w.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.08}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer"
              >
                <img
                  src={w.image}
                  alt={w.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c29cc] via-[#1a1a3a55] to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    'text-[11px] font-semibold px-2.5 py-1 rounded-full',
                    w.status === 'completed'
                      ? 'bg-white/90 text-green-700'
                      : 'bg-amber-400/90 text-amber-900',
                  )}>
                    {w.status === 'completed' ? tr.home.worksCompleted : tr.home.worksOngoing}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-lg leading-tight">{w.title}</p>
                  <p className="text-white/70 text-xs mt-1">{w.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
