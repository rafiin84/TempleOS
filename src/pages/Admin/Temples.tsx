import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Plus, Edit, Eye, ChevronLeft, ChevronRight,
  ChevronsUpDown, ChevronUp, ChevronDown,
} from 'lucide-react'
import { templeApi } from '@/services/mock/api'
import type { Temple } from '@/types'
import { Badge, Button, StarRating, Input } from '@/components/ui'

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const CATEGORIES = ['All', 'Shiva', 'Vishnu', 'Murugan', 'Amman', 'Ganesha', 'Navagraha', 'Heritage', 'Hill Temple']
const STATUSES   = ['All', 'Active', 'Inactive']
const PAGE_SIZE  = 8

/* ─── Supplementary mock rows ───────────────────────────────────────────────── */
const EXTRA_TEMPLES: Partial<Temple>[] = [
  { id: 'thiruchendur',     name: 'Thiruchendur Murugan Temple',   nameTa: 'திருச்செந்தூர் முருகன்',    district: 'Thoothukudi',     deity: 'Lord Murugan',  rating: 4.7, reviewCount: 9200,  visitCount: 1800000, categories: ['Murugan', 'Arupadai Veedu', 'Shore Temple'],    isOpen: true,  coverImage: '' },
  { id: 'swamimalai',       name: 'Swamimalai Murugan Temple',     nameTa: 'சுவாமிமலை முருகன்',          district: 'Kumbakonam',      deity: 'Lord Murugan',  rating: 4.6, reviewCount: 6100,  visitCount: 820000,  categories: ['Murugan', 'Arupadai Veedu'],                     isOpen: true,  coverImage: '' },
  { id: 'ekambareswarar',   name: 'Ekambareswarar Temple',         nameTa: 'ஏகாம்பரேஸ்வரர்',             district: 'Kanchipuram',     deity: 'Lord Shiva',    rating: 4.8, reviewCount: 11400, visitCount: 1500000, categories: ['Shiva', 'Padal Petra Sthalam'],                  isOpen: true,  coverImage: '' },
  { id: 'varadharaja',      name: 'Varadharaja Perumal Temple',    nameTa: 'வரதராஜ பெருமாள்',            district: 'Kanchipuram',     deity: 'Lord Vishnu',   rating: 4.7, reviewCount: 8900,  visitCount: 1100000, categories: ['Vishnu', 'Divya Desam'],                         isOpen: true,  coverImage: '' },
  { id: 'ranganathar',      name: 'Sri Ranganathaswamy Temple',    nameTa: 'ஸ்ரீ ரங்கநாதஸ்வாமி',         district: 'Tiruchirappalli', deity: 'Lord Vishnu',   rating: 4.9, reviewCount: 22000, visitCount: 3500000, categories: ['Vishnu', 'Divya Desam', 'Heritage'],             isOpen: true,  coverImage: '' },
  { id: 'murugan-tiruttani',name: 'Tiruttani Murugan Temple',      nameTa: 'திருத்தணி முருகன்',           district: 'Tiruvallur',      deity: 'Lord Murugan',  rating: 4.6, reviewCount: 7800,  visitCount: 950000,  categories: ['Murugan', 'Arupadai Veedu', 'Hill Temple'],     isOpen: true,  coverImage: '' },
  { id: 'ucchi-pillayar',   name: 'Ucchi Pillaiyar Temple',        nameTa: 'உச்சி பிள்ளையார்',           district: 'Tiruchirappalli', deity: 'Lord Ganesha', rating: 4.5, reviewCount: 5200,  visitCount: 670000,  categories: ['Ganesha', 'Hill Temple'],                        isOpen: false, coverImage: '' },
  { id: 'thillai-nataraja', name: 'Thillai Nataraja Temple',       nameTa: 'தில்லை நடராஜர்',             district: 'Chidambaram',     deity: 'Lord Shiva',    rating: 4.8, reviewCount: 14200, visitCount: 2000000, categories: ['Shiva', 'Heritage', 'Padal Petra Sthalam'],     isOpen: true,  coverImage: '' },
  { id: 'kasi-viswanathar', name: 'Kasi Viswanathar Temple',       nameTa: 'காசி விஸ்வநாதர்',            district: 'Tenkasi',         deity: 'Lord Shiva',    rating: 4.4, reviewCount: 3400,  visitCount: 410000,  categories: ['Shiva'],                                         isOpen: true,  coverImage: '' },
  { id: 'navagraha-main',   name: 'Navagraha Suryanar Kovil',      nameTa: 'நவகிரக சூரியனார் கோயில்',   district: 'Kumbakonam',      deity: 'Lord Surya',    rating: 4.5, reviewCount: 4800,  visitCount: 560000,  categories: ['Navagraha'],                                     isOpen: true,  coverImage: '' },
  { id: 'azhagar',          name: 'Alagar Kovil',                  nameTa: 'அழகர் கோயில்',               district: 'Madurai',         deity: 'Lord Vishnu',   rating: 4.6, reviewCount: 6700,  visitCount: 780000,  categories: ['Vishnu', 'Divya Desam'],                         isOpen: true,  coverImage: '' },
  { id: 'thiruvannamalai',  name: 'Arunachaleswarar Temple',       nameTa: 'அருணாசலேஸ்வரர் கோயில்',    district: 'Tiruvannamalai',  deity: 'Lord Shiva',    rating: 4.9, reviewCount: 18700, visitCount: 2800000, categories: ['Shiva', 'Padal Petra Sthalam', 'Heritage'],     isOpen: true,  coverImage: '' },
]

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type SortKey = 'name' | 'district' | 'rating' | 'visitCount' | 'status'
type SortDir = 'asc' | 'desc'

/* ─── Toggle Switch ──────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={e => { e.stopPropagation(); onChange() }}
      className={[
        'relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 shrink-0',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        checked ? 'bg-primary' : 'bg-[#D1D5DB]',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  )
}

/* ─── Sortable Header Cell ───────────────────────────────────────────────────── */
function SortTh({
  label, col, sort, dir, onSort,
}: { label: string; col: SortKey; sort: SortKey; dir: SortDir; onSort: (c: SortKey) => void }) {
  const active = sort === col
  return (
    <th
      onClick={() => onSort(col)}
      className="px-4 py-3 text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap cursor-pointer select-none group hover:text-[#111827] transition-colors"
    >
      <div className="flex items-center gap-1">
        {label}
        {active ? (
          dir === 'asc'
            ? <ChevronUp   size={12} className="text-primary" />
            : <ChevronDown size={12} className="text-primary" />
        ) : (
          <ChevronsUpDown size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" />
        )}
      </div>
    </th>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function AdminTemples() {
  const [baseTemples, setBaseTemples]     = useState<Partial<Temple>[]>([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [category, setCategory]           = useState('All')
  const [statusFilter, setStatusFilter]   = useState('All')
  const [activeMap, setActiveMap]         = useState<Record<string, boolean>>({})
  const [page, setPage]                   = useState(1)
  const [sortKey, setSortKey]             = useState<SortKey>('name')
  const [sortDir, setSortDir]             = useState<SortDir>('asc')

  useEffect(() => {
    templeApi.list().then(({ items }) => {
      const all: Partial<Temple>[] = [...items, ...EXTRA_TEMPLES]
      setBaseTemples(all)
      const map: Record<string, boolean> = {}
      all.forEach(t => { if (t.id) map[t.id] = t.isOpen ?? true })
      setActiveMap(map)
      setLoading(false)
    })
  }, [])

  function handleSort(col: SortKey) {
    if (col === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(col); setSortDir('asc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return baseTemples.filter(t => {
      const matchSearch  = !q
        || (t.name ?? '').toLowerCase().includes(q)
        || (t.district ?? '').toLowerCase().includes(q)
        || (t.deity ?? '').toLowerCase().includes(q)
      const matchCat    = category === 'All' || (t.categories ?? []).some(c => c === category)
      const matchStatus = statusFilter === 'All'
        || (statusFilter === 'Active'   && (activeMap[t.id!] ?? true))
        || (statusFilter === 'Inactive' && !(activeMap[t.id!] ?? true))
      return matchSearch && matchCat && matchStatus
    })
  }, [baseTemples, search, category, statusFilter, activeMap])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name')       cmp = (a.name ?? '').localeCompare(b.name ?? '')
      if (sortKey === 'district')   cmp = (a.district ?? '').localeCompare(b.district ?? '')
      if (sortKey === 'rating')     cmp = (a.rating ?? 0) - (b.rating ?? 0)
      if (sortKey === 'visitCount') cmp = (a.visitCount ?? 0) - (b.visitCount ?? 0)
      if (sortKey === 'status')     cmp = (activeMap[a.id!] ? 1 : 0) - (activeMap[b.id!] ? 1 : 0)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir, activeMap])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleActive(id: string) {
    setActiveMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const pageNums = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3)              return [1, 2, 3, 4, 5]
    if (page >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [page - 2, page - 1, page, page + 1, page + 2]
  }, [page, totalPages])

  return (
    <div className="space-y-5 max-w-[1200px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#111827]">Temples</h1>
          <span className="px-2.5 py-1 bg-light-violet text-primary text-xs font-bold rounded-full">
            38,407
          </span>
        </div>
        <Button icon={<Plus size={15} />} size="sm">
          Add Temple
        </Button>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-56">
          <Input
            placeholder="Search temples, districts, deities…"
            prefix={<Search size={15} />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1) }}
          className="h-10 px-3 rounded-md border border-[#ECECEC] bg-surface text-sm text-[#111827] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-10 px-3 rounded-md border border-[#ECECEC] bg-surface text-sm text-[#111827] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-surface rounded-lg shadow-card border border-[#ECECEC] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-[#ECECEC] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-[#ECECEC] bg-[#FAFAFC]">
                  <SortTh label="Temple"   col="name"       sort={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortTh label="District" col="district"   sort={sortKey} dir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                    Category
                  </th>
                  <SortTh label="Status"   col="status"     sort={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Bookings" col="visitCount"  sort={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Rating"   col="rating"     sort={sortKey} dir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-sm text-[#6B7280]">
                      No temples match your filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map(temple => {
                    const isActive = activeMap[temple.id!] ?? true
                    return (
                      <tr key={temple.id} className="hover:bg-[#FAFAFC] transition-colors">

                        {/* Name + icon */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-light-violet shrink-0 flex items-center justify-center text-base">
                              {temple.coverImage ? (
                                <img
                                  src={temple.coverImage}
                                  alt={temple.name}
                                  className="w-full h-full object-cover"
                                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                                />
                              ) : (
                                <span aria-hidden="true">🛕</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#111827] truncate max-w-[160px]">{temple.name}</p>
                              <p className="text-[10px] text-[#6B7280]">{temple.deity}</p>
                            </div>
                          </div>
                        </td>

                        {/* District */}
                        <td className="px-4 py-3 text-sm text-[#6B7280] whitespace-nowrap">{temple.district}</td>

                        {/* Categories */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(temple.categories ?? []).slice(0, 2).map(c => (
                              <Badge key={c} variant="primary" size="sm">{c}</Badge>
                            ))}
                            {(temple.categories?.length ?? 0) > 2 && (
                              <Badge variant="ghost" size="sm">+{(temple.categories?.length ?? 0) - 2}</Badge>
                            )}
                          </div>
                        </td>

                        {/* Status toggle */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Toggle checked={isActive} onChange={() => toggleActive(temple.id!)} />
                            <span className={`text-xs font-medium ${isActive ? 'text-success' : 'text-[#6B7280]'}`}>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>

                        {/* Bookings / visits */}
                        <td className="px-4 py-3 text-sm font-semibold text-[#111827] tabular-nums whitespace-nowrap">
                          {(temple.visitCount ?? 0) >= 1000000
                            ? `${((temple.visitCount ?? 0) / 1000000).toFixed(1)}M`
                            : `${Math.round((temple.visitCount ?? 0) / 1000)}K`}
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <StarRating rating={temple.rating ?? 0} size="sm" />
                            <span className="text-xs text-[#6B7280] tabular-nums">{temple.rating?.toFixed(1)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/temple/${temple.id}`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#ECECEC] text-[11px] font-medium text-[#6B7280] hover:border-primary/40 hover:text-primary transition-colors"
                            >
                              <Eye size={12} /> View
                            </Link>
                            <button
                              type="button"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#ECECEC] text-[11px] font-medium text-[#111827] hover:border-primary/40 hover:text-primary transition-colors"
                            >
                              <Edit size={12} /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && sorted.length > 0 && (
          <div className="px-4 py-3 border-t border-[#ECECEC] flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#6B7280]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of{' '}
              <span className="font-semibold text-[#111827]">{sorted.length}</span> results
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#ECECEC] text-xs font-medium text-[#6B7280] hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              {pageNums.map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={[
                    'w-8 h-8 rounded-md text-xs font-semibold transition-colors',
                    page === n
                      ? 'bg-primary text-white'
                      : 'border border-[#ECECEC] text-[#6B7280] hover:border-primary/40 hover:text-primary',
                  ].join(' ')}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#ECECEC] text-xs font-medium text-[#6B7280] hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
