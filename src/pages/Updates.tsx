import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Bell, RefreshCw, Megaphone, Sparkles, Landmark, CalendarCheck, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { feedApi } from '@/services/mock/api'
import type { FeedItem } from '@/types'
import { FeedCard } from '@/components/temple'
import { Skeleton } from '@/components/ui'
import { useLang } from '@/contexts/LanguageContext'
import { T } from '@/i18n/translations'

/* ─── Filter types ─────────────────────────────────────────────────────────── */
type FilterType = 'all' | 'festival' | 'announcement' | 'heritage' | 'booking-open' | 'crowd-alert'

interface FilterDef {
  label: string
  value: FilterType
  icon: React.ReactNode
}

const FILTERS: FilterDef[] = [
  { label: 'All',           value: 'all',          icon: null },
  { label: 'Festivals',     value: 'festival',     icon: <Sparkles    size={11} /> },
  { label: 'Announcements', value: 'announcement', icon: <Megaphone   size={11} /> },
  { label: 'Heritage',      value: 'heritage',     icon: <Landmark    size={11} /> },
  { label: 'Bookings',      value: 'booking-open', icon: <CalendarCheck size={11} /> },
  { label: 'Alerts',        value: 'crowd-alert',  icon: <AlertTriangle size={11} /> },
]

/* ─── Pull-to-refresh banner ───────────────────────────────────────────────── */
function RefreshBanner({ onRefresh }: { onRefresh: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="max-w-4xl mx-auto px-4"
      >
        <button
          onClick={onRefresh}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-primary bg-light-violet rounded-lg border border-primary/20"
        >
          <RefreshCw size={12} />
          New updates available — tap to refresh
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Empty state ──────────────────────────────────────────────────────────── */
function EmptyState({ filter, onClear }: { filter: FilterType; onClear: () => void }) {
  const filterLabel = FILTERS.find(f => f.value === filter)?.label.toLowerCase() ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 gap-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-light-violet flex items-center justify-center">
        <Bell size={26} className="text-primary/40" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#111827]">No updates here</p>
        <p className="text-xs text-[#6B7280] mt-1">
          {filter === 'all'
            ? 'Check back later for new updates'
            : `No ${filterLabel} updates right now`}
        </p>
      </div>
      {filter !== 'all' && (
        <button
          onClick={onClear}
          className="text-xs text-primary font-semibold hover:underline"
        >
          Show all updates
        </button>
      )}
    </motion.div>
  )
}

/* ─── Main page ────────────────────────────────────────────────────────────── */
export default function Updates() {
  const { lang } = useLang()
  const tr = T[lang]
  const [allItems, setAllItems]       = useState<FeedItem[]>([])
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]         = useState(false)
  const [filter, setFilter]           = useState<FilterType>('all')
  const [showBanner, setShowBanner]   = useState(false)

  // Refs to avoid stale closures inside IntersectionObserver callback
  const pageRef         = useRef(1)
  const loadingMoreRef  = useRef(false)
  const hasMoreRef      = useRef(false)
  const sentinelRef     = useRef<HTMLDivElement>(null)
  // Poll timer ref
  const pollTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Initial / refresh load ─── */
  const loadInitial = useCallback(async () => {
    setLoading(true)
    setShowBanner(false)
    pageRef.current        = 1
    hasMoreRef.current     = false
    loadingMoreRef.current = false

    const { items, hasMore: more } = await feedApi.list(1)
    setAllItems(items)
    hasMoreRef.current = more
    setHasMore(more)
    setLoading(false)
  }, [])

  /* ── Load next page ─── */
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)

    const nextPage = pageRef.current + 1
    const { items: newItems, hasMore: more } = await feedApi.list(nextPage)

    pageRef.current    = nextPage
    hasMoreRef.current = more
    setAllItems(prev => [...prev, ...newItems])
    setHasMore(more)
    loadingMoreRef.current = false
    setLoadingMore(false)
  }, [])

  /* ── Mount: initial fetch ─── */
  useEffect(() => { loadInitial() }, [loadInitial])

  /* ── Infinite scroll via IntersectionObserver ─── */
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  /* ── Simulate "new updates" banner after 30 s for demo purposes ─── */
  useEffect(() => {
    pollTimerRef.current = setTimeout(() => setShowBanner(true), 30_000)
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current)
    }
  }, [])

  const filtered = filter === 'all'
    ? allItems
    : allItems.filter(item => item.type === filter)

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky header + filter pills ── */}
      <div className="sticky top-0 z-20 bg-surface border-b border-[#ECECEC] shadow-soft">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">{tr.updates.title}</h1>
            <p className="text-[11px] text-[#6B7280] mt-0.5">{tr.updates.subtitle}</p>
          </div>

          <button
            onClick={loadInitial}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-light-violet text-[#6B7280] hover:text-primary transition-colors disabled:opacity-50"
            aria-label="Refresh feed"
          >
            <RefreshCw
              size={15}
              className={loading ? 'animate-spin text-primary' : ''}
            />
          </button>
        </div>

        {/* Filter chips */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex justify-center gap-2 px-4 pb-3 min-w-full">
            {FILTERS.map(f => {
              const active = filter === f.value
              const filterLabels: Record<string, string> = {
                all: tr.updates.all,
                festival: tr.updates.festival,
                announcement: tr.updates.alert,
                heritage: tr.updates.heritage,
                renovation: tr.updates.renovation,
                'booking-open': tr.updates.booking,
                'crowd-alert': tr.updates.alert,
              }
              const label = filterLabels[f.value] ?? f.label
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={[
                    'shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap',
                    active
                      ? 'bg-primary text-white border-primary shadow-soft'
                      : 'bg-surface border-[#ECECEC] text-[#6B7280] hover:border-primary/40 hover:text-primary',
                  ].join(' ')}
                >
                  {f.icon && <span>{f.icon}</span>}
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Pull-to-refresh banner ── */}
      {showBanner && (
        <div className="pt-3">
          <RefreshBanner onRefresh={loadInitial} />
        </div>
      )}

      {/* ── Feed list ── */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-10 flex flex-col gap-3">

        {loading ? (
          <Skeleton variant="card" count={4} />
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} onClear={() => setFilter('all')} />
        ) : (
          <>
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((item, idx) => {
                const displayItem = lang === 'ta'
                  ? { ...item, title: item.titleTa || item.title, body: item.bodyTa || item.body }
                  : item
                return (
                  <motion.div
                    key={`${filter}-${item.id}`}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.22, delay: Math.min(idx * 0.045, 0.22) },
                    }}
                    exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                  >
                    <FeedCard item={displayItem} />
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Infinite scroll sentinel — always rendered when feed is visible */}
            <div ref={sentinelRef} className="h-px" aria-hidden />

            {/* Load-more skeleton */}
            {loadingMore && <Skeleton variant="card" count={2} />}

            {/* End of feed */}
            {!hasMore && !loadingMore && allItems.length > 3 && (
              <p className="text-center text-[11px] text-[#6B7280] py-4 font-medium tracking-wide">
                — You're all caught up —
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
