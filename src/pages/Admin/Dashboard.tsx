import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, CalendarDays, Heart, TrendingUp,
  AlertTriangle, ChevronRight, Plus, Megaphone, BarChart3, CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import { adminApi } from '@/services/mock/api'
import type { AdminStats } from '@/types'
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui'
import { Button } from '@/components/ui'

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
function formatNumber(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `${(n / 100000).toFixed(2)} L`
  if (n >= 1000)     return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString('en-IN')
}

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

/* ─── Static activity data ─────────────────────────────────────────────────── */
const RECENT_BOOKINGS = [
  { temple: 'Brihadeeswara Temple',  pooja: 'Uchikala Pooja',   date: '26 Jul 2026', amount: '₹500',   status: 'confirmed' },
  { temple: 'Kapaleeshwarar Temple', pooja: 'Vinayakar Pooja',  date: '30 Jul 2026', amount: '₹75',    status: 'confirmed' },
  { temple: 'Meenakshi Amman',       pooja: 'Thiruvanandal',    date: '10 Jul 2026', amount: '₹300',   status: 'completed' },
  { temple: 'Palani Murugan',        pooja: 'Kavadi Pooja',     date: '8 Jul 2026',  amount: '₹400',   status: 'pending'   },
  { temple: 'Ramanathaswamy',        pooja: 'Thiruvanandal',    date: '5 Jul 2026',  amount: '₹50',    status: 'cancelled' },
]

const RECENT_DONATIONS = [
  { temple: 'Brihadeeswara Temple',  devotee: 'Karthik S.',  amount: '₹10,000', purpose: 'Renovation Fund',     date: '24 Jul 2026' },
  { temple: 'Meenakshi Amman',       devotee: 'Priya M.',    amount: '₹5,000',  purpose: 'Annadanam',           date: '23 Jul 2026' },
  { temple: 'Kapaleeshwarar Temple', devotee: 'Anonymous',   amount: '₹1,001',  purpose: 'General Fund',        date: '22 Jul 2026' },
  { temple: 'Ramanathaswamy',        devotee: 'Rajan K.',    amount: '₹25,000', purpose: 'Gopuram Restoration', date: '21 Jul 2026' },
  { temple: 'Palani Murugan',        devotee: 'Suresh R.',   amount: '₹2,500',  purpose: 'Annadanam',           date: '20 Jul 2026' },
]

const MONTHLY_VISITS = [
  { month: 'Feb', visits: 420,  pct: 34 },
  { month: 'Mar', visits: 680,  pct: 55 },
  { month: 'Apr', visits: 590,  pct: 48 },
  { month: 'May', visits: 780,  pct: 63 },
  { month: 'Jun', visits: 1050, pct: 85 },
  { month: 'Jul', visits: 1240, pct: 100 },
]

const DISTRICT_BOOKINGS = [
  { district: 'Thanjavur',   bookings: '42K', pct: 100 },
  { district: 'Madurai',     bookings: '37K', pct: 89  },
  { district: 'Chennai',     bookings: '22K', pct: 52  },
  { district: 'Tirunelveli', bookings: '16K', pct: 38  },
  { district: 'Coimbatore',  bookings: '11K', pct: 26  },
]

/* ─── KPI Card ─────────────────────────────────────────────────────────────── */
function KpiCard({
  icon, label, value, trend, iconBg, loading,
}: {
  icon: React.ReactNode; label: string; value: string
  trend: string; iconBg: string; loading: boolean
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <span className="flex items-center gap-0.5 text-[11px] font-semibold text-success bg-green-50 px-2 py-0.5 rounded-full">
          <TrendingUp size={10} /> {trend}
        </span>
      </div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-24 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </>
      ) : (
        <>
          <p className="text-[28px] font-black text-[#111827] leading-none tabular-nums">{value}</p>
          <p className="text-xs text-[#6B7280] font-medium">{label}</p>
        </>
      )}
    </Card>
  )
}

/* ─── Status Badge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'ghost'> = {
    confirmed: 'success', pending: 'warning', cancelled: 'danger',
    completed: 'primary', scanned: 'success',
  }
  return (
    <Badge variant={map[status] ?? 'ghost'} size="sm" className="capitalize">
      {status}
    </Badge>
  )
}

/* ─── Quick Action ─────────────────────────────────────────────────────────── */
function QuickAction({
  icon, label, to, badge,
}: { icon: React.ReactNode; label: string; to: string; badge?: number }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#ECECEC] bg-surface hover:bg-light-violet hover:border-primary/30 transition-colors group"
    >
      <div className="relative w-10 h-10 rounded-xl bg-light-violet text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-1.5 -right-1.5 h-[18px] min-w-[18px] px-1 rounded-full bg-warning text-white text-[9px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-[#6B7280] group-hover:text-primary text-center leading-tight">
        {label}
      </span>
    </Link>
  )
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats, setStats]   = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats().then(s => {
      setStats(s)
      setLoading(false)
    })
  }, [])

  const pendingCount = stats?.pendingApprovals ?? 23

  return (
    <div className="space-y-6 max-w-[1200px]">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-[#111827]">Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/admin/temples">
          <Button icon={<Plus size={14} />} size="sm">Add Temple</Button>
        </Link>
      </div>

      {/* ── Pending Approvals Alert ── */}
      {(!loading && pendingCount > 0) && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-warning shrink-0" />
          <p className="flex-1 text-sm font-medium text-amber-800">
            <span className="font-bold">{pendingCount} pending temple approvals</span> — your review is required.
          </p>
          <Link
            to="/admin/approvals"
            className="flex items-center gap-1 text-sm font-semibold text-warning hover:underline shrink-0"
          >
            Review Now <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          loading={loading}
          icon={<Building2 size={18} className="text-primary" />}
          label="Total Temples"
          value={loading ? '' : formatNumber(stats!.totalTemples)}
          trend="↑ 12% vs last month"
          iconBg="bg-light-violet"
        />
        <KpiCard
          loading={loading}
          icon={<CalendarDays size={18} className="text-blue-600" />}
          label="Total Bookings"
          value={loading ? '' : formatNumber(stats!.totalBookings)}
          trend="↑ 8% vs last month"
          iconBg="bg-blue-50"
        />
        <KpiCard
          loading={loading}
          icon={<Heart size={18} className="text-pink-600" />}
          label="Total Donations"
          value={loading ? '' : formatCurrency(stats!.totalDonations)}
          trend="↑ 21% vs last month"
          iconBg="bg-pink-50"
        />
        <KpiCard
          loading={loading}
          icon={<TrendingUp size={18} className="text-success" />}
          label="Monthly Revenue"
          value={loading ? '' : formatCurrency(stats!.monthlyRevenue)}
          trend="↑ 15% vs last month"
          iconBg="bg-green-50"
        />
      </div>

      {/* ── Quick Actions ── */}
      <Card>
        <p className="text-sm font-bold text-[#111827] mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={<Plus size={18} />}         label="Add Temple"          to="/admin/temples"   />
          <QuickAction icon={<Megaphone size={18} />}    label="Create Announcement" to="/updates"         />
          <QuickAction icon={<BarChart3 size={18} />}    label="View Reports"        to="/admin/analytics" />
          <QuickAction
            icon={<CheckCircle2 size={18} />}
            label="Pending Approvals"
            to="/admin/approvals"
            badge={pendingCount}
          />
        </div>
      </Card>

      {/* ── Activity Tables ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Recent Bookings */}
        <Card padding={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <p className="text-sm font-bold text-[#111827]">Recent Bookings</p>
            <Link to="/admin/bookings" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-[#ECECEC]">
                  {['Temple', 'Pooja', 'Date', 'Amount', 'Status'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC]">
                {RECENT_BOOKINGS.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAFAFC] transition-colors">
                    <td className="px-5 py-3 text-xs font-semibold text-[#111827] max-w-[110px] truncate">{row.temple}</td>
                    <td className="px-5 py-3 text-xs text-[#6B7280] max-w-[110px] truncate">{row.pooja}</td>
                    <td className="px-5 py-3 text-xs text-[#6B7280] whitespace-nowrap">{row.date}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-primary whitespace-nowrap">{row.amount}</td>
                    <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Donations */}
        <Card padding={false}>
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <p className="text-sm font-bold text-[#111827]">Recent Donations</p>
            <Link to="/admin/donations" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-[#ECECEC]">
                  {['Temple', 'Devotee', 'Amount', 'Purpose', 'Date'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC]">
                {RECENT_DONATIONS.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAFAFC] transition-colors">
                    <td className="px-5 py-3 text-xs font-semibold text-[#111827] max-w-[110px] truncate">{row.temple}</td>
                    <td className="px-5 py-3 text-xs text-[#6B7280] whitespace-nowrap">{row.devotee}</td>
                    <td className="px-5 py-3 text-xs font-semibold text-success whitespace-nowrap">{row.amount}</td>
                    <td className="px-5 py-3 text-xs text-[#6B7280] max-w-[110px] truncate">{row.purpose}</td>
                    <td className="px-5 py-3 text-xs text-[#6B7280] whitespace-nowrap">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Monthly Visits */}
        <Card>
          <p className="text-sm font-bold text-[#111827] mb-5">Monthly Visits</p>
          <div className="space-y-3">
            {MONTHLY_VISITS.map(({ month, visits, pct }) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-7 text-xs font-medium text-[#6B7280] text-right shrink-0">{month}</span>
                <div className="flex-1">
                  <ProgressBar value={pct} color="primary" />
                </div>
                <span className="w-14 text-xs font-semibold text-[#111827] tabular-nums text-right shrink-0">
                  {(visits / 1000).toFixed(1)}L
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#6B7280] mt-4">Feb – Jul 2026 · Unique visitors in lakhs</p>
        </Card>

        {/* Bookings by District */}
        <Card>
          <p className="text-sm font-bold text-[#111827] mb-5">Bookings by District</p>
          <div className="space-y-3">
            {DISTRICT_BOOKINGS.map(({ district, bookings, pct }) => (
              <div key={district} className="flex items-center gap-3">
                <span className="w-28 text-xs font-medium text-[#6B7280] shrink-0 truncate">{district}</span>
                <div className="flex-1">
                  <ProgressBar value={pct} color="primary" />
                </div>
                <span className="w-10 text-xs font-semibold text-[#111827] tabular-nums text-right shrink-0">
                  {bookings}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#6B7280] mt-4">Relative to Thanjavur (42K bookings this month)</p>
        </Card>
      </div>

    </div>
  )
}
