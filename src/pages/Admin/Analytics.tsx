import React, { useState } from 'react'
import { Users, CalendarDays, Heart, TrendingUp } from 'lucide-react'
import { ProgressBar, Tabs } from '@/components/ui'

/* ─── Static data ────────────────────────────────────────────────────────────── */
const TOP_TEMPLES = [
  { name: 'Ramanathaswamy Temple',  district: 'Ramanathapuram', visits: 3200000 },
  { name: 'Meenakshi Amman Temple', district: 'Madurai',        visits: 2800000 },
  { name: 'Palani Murugan Temple',  district: 'Dindigul',       visits: 2100000 },
  { name: 'Brihadeeswara Temple',   district: 'Thanjavur',      visits: 1250000 },
  { name: 'Kapaleeshwarar Temple',  district: 'Chennai',        visits: 890000  },
]

const TOP_DISTRICTS = [
  { name: 'Thanjavur',      visits: 3800000, pct: 100 },
  { name: 'Madurai',        visits: 3100000, pct: 82  },
  { name: 'Ramanathapuram', visits: 2500000, pct: 66  },
  { name: 'Chennai',        visits: 1900000, pct: 50  },
  { name: 'Dindigul',       visits: 1200000, pct: 32  },
]

const BOOKING_TREND = [
  { month: "Jul '25", value: 8200  },
  { month: "Sep '25", value: 11400 },
  { month: "Nov '25", value: 14800 },
  { month: "Jan '26", value: 10200 },
  { month: "Mar '26", value: 18900 },
  { month: "May '26", value: 22100 },
  { month: "Jul '26", value: 28450 },
]

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function fmt(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `${(n / 100000).toFixed(1)} L`
  if (n >= 1000)     return `${(n / 1000).toFixed(0)}K`
  return n.toLocaleString('en-IN')
}

/* ─── Period KPI data ────────────────────────────────────────────────────────── */
type Period = 'week' | 'month' | 'year'

const PERIOD_DATA: Record<Period, {
  visitors: string; bookings: string; donations: string; revenue: string
  visitorsSub: string; bookingsSub: string; donationsSub: string; revenueSub: string
}> = {
  week: {
    visitors: '2.84 L',   visitorsSub: '↑ 6% vs prev week',
    bookings: '3,240',    bookingsSub: '↑ 11% vs prev week',
    donations: '₹12.5 L', donationsSub: '↑ 4% vs prev week',
    revenue: '₹21.3 L',   revenueSub:   '↑ 9% vs prev week',
  },
  month: {
    visitors: '12.4 L',   visitorsSub: '↑ 14% vs last month',
    bookings: '28,450',   bookingsSub: '↑ 8% vs last month',
    donations: '₹1.2 Cr', donationsSub: '↑ 21% vs last month',
    revenue: '₹87.5 L',   revenueSub:   '↑ 15% vs last month',
  },
  year: {
    visitors: '1.24 Cr',    visitorsSub: '↑ 32% vs last year',
    bookings: '1,28,450',   bookingsSub: '↑ 28% vs last year',
    donations: '₹4.52 Cr',  donationsSub: '↑ 41% vs last year',
    revenue: '₹10.5 Cr',    revenueSub:   '↑ 37% vs last year',
  },
}

const PERIOD_TABS = [
  { label: 'This Week',  value: 'week'  },
  { label: 'This Month', value: 'month' },
  { label: 'This Year',  value: 'year'  },
]

/* ─── KPI Tile ───────────────────────────────────────────────────────────────── */
function KpiTile({
  icon, label, value, sub,
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string
}) {
  return (
    <div className="bg-surface rounded-xl shadow-card border border-[#ECECEC] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-light-violet flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="text-xs text-[#6B7280] font-medium">{label}</p>
      </div>
      <p className="text-[22px] font-black text-[#111827] tabular-nums leading-none">{value}</p>
      {sub && (
        <p className="text-[10px] text-success font-medium mt-1.5">{sub}</p>
      )}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>('month')

  const data    = PERIOD_DATA[period]
  const maxVisit = Math.max(...TOP_TEMPLES.map(t => t.visits))
  const maxBar   = Math.max(...BOOKING_TREND.map(d => d.value))

  return (
    <div className="space-y-6 max-w-[1200px] pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Analytics</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Platform-wide metrics and temple performance</p>
        </div>
        <Tabs
          tabs={PERIOD_TABS}
          value={period}
          onChange={v => setPeriod(v as Period)}
        />
      </div>

      {/* ── KPI Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          icon={<Users        size={16} className="text-primary" />}
          label="Unique Visitors"
          value={data.visitors}
          sub={data.visitorsSub}
        />
        <KpiTile
          icon={<CalendarDays size={16} className="text-blue-600" />}
          label="Bookings"
          value={data.bookings}
          sub={data.bookingsSub}
        />
        <KpiTile
          icon={<Heart        size={16} className="text-pink-600" />}
          label="Donations"
          value={data.donations}
          sub={data.donationsSub}
        />
        <KpiTile
          icon={<TrendingUp   size={16} className="text-success" />}
          label="Revenue"
          value={data.revenue}
          sub={data.revenueSub}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top 5 Temples by Visits */}
        <div className="bg-surface rounded-xl shadow-card border border-[#ECECEC] p-5">
          <h3 className="text-sm font-bold text-[#111827] mb-5">Top 5 Temples by Visits</h3>
          <div className="space-y-4">
            {TOP_TEMPLES.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span
                  className={[
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0',
                    i === 0 ? 'bg-amber-400 text-white' :
                    i === 1 ? 'bg-[#C0C0C0] text-white' :
                    i === 2 ? 'bg-amber-700 text-white' :
                              'bg-[#ECECEC] text-[#6B7280]',
                  ].join(' ')}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-[#111827] truncate">{t.name}</p>
                    <span className="text-xs font-bold text-primary tabular-nums shrink-0">
                      {fmt(t.visits)}
                    </span>
                  </div>
                  <ProgressBar value={(t.visits / maxVisit) * 100} color="primary" />
                  <p className="text-[10px] text-[#6B7280] mt-0.5">{t.district}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Districts */}
        <div className="bg-surface rounded-xl shadow-card border border-[#ECECEC] p-5">
          <h3 className="text-sm font-bold text-[#111827] mb-5">Top Districts by Visits</h3>
          <div className="space-y-4">
            {TOP_DISTRICTS.map(d => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#6B7280] w-28 shrink-0">{d.name}</span>
                <div className="flex-1">
                  <ProgressBar value={d.pct} color="primary" showLabel />
                </div>
                <span className="text-[10px] text-[#6B7280] w-14 text-right shrink-0 tabular-nums">
                  {fmt(d.visits)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#6B7280] mt-4">Thanjavur is 100% baseline · Relative scale</p>
        </div>
      </div>

      {/* ── Booking Trend ── */}
      <div className="bg-surface rounded-xl shadow-card border border-[#ECECEC] p-5">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h3 className="text-sm font-bold text-[#111827]">Booking Trend (Jul 2025 – Jul 2026)</h3>
          <span className="text-[10px] text-[#6B7280] bg-[#FAFAFC] px-2.5 py-1 rounded-full border border-[#ECECEC]">
            Monthly bookings across all temples
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-2 sm:gap-3 h-44 px-1">
          {BOOKING_TREND.map((d, i) => {
            const heightPct = (d.value / maxBar) * 100
            const isLast    = i === BOOKING_TREND.length - 1
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] sm:text-[10px] font-bold text-primary tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                  {fmt(d.value)}
                </span>
                <div className="w-full flex items-end" style={{ height: 120 }}>
                  <div
                    className={[
                      'w-full rounded-t transition-all duration-200 cursor-pointer',
                      isLast ? 'bg-primary' : 'bg-primary/50 hover:bg-primary/75',
                    ].join(' ')}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    title={`${d.month}: ${d.value.toLocaleString('en-IN')} bookings`}
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] text-[#6B7280] text-center leading-tight whitespace-nowrap">
                  {d.month}
                </span>
              </div>
            )
          })}
        </div>

        {/* Y-axis guide */}
        <div className="mt-3 flex items-center justify-between px-1">
          <p className="text-[10px] text-[#6B7280]">0</p>
          <p className="text-[10px] text-[#6B7280]">
            Peak: <span className="font-semibold text-primary">{fmt(maxBar)}</span>
          </p>
        </div>
      </div>

    </div>
  )
}
