import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, MapPin, IndianRupee, Calendar, Receipt } from 'lucide-react'
import { userApi, bookingApi, donationApi } from '@/services/mock/api'
import { MOCK_TEMPLES } from '@/services/mock/data'
import type { User, Booking, Donation, BookingStatus } from '@/types'
import { Avatar, Badge, Button, Tabs, ProgressBar } from '@/components/ui'
import { useLang } from '@/contexts/LanguageContext'
import { T } from '@/i18n/translations'
import { QRCard, BookingCard } from '@/components/temple'

/* ─── Helpers ─────────────────────────────────────────────────────────────────── */

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

/* ─── Journey chart data ──────────────────────────────────────────────────────── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

function getMonthlyVisits(entries: User['passportEntries']): number[] {
  const counts = new Array(7).fill(0)
  entries.forEach(e => {
    const m = new Date(e.visitedAt).getMonth() // 0=Jan
    if (m < 7) counts[m]++
  })
  return counts
}

/* ─── Upcoming booking filter ─────────────────────────────────────────────────── */
type BookingFilter = 'all' | 'confirmed' | 'pending'

function isUpcoming(b: Booking): boolean {
  return b.status === 'confirmed' || b.status === 'pending'
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function MyTemple() {
  const { lang } = useLang()
  const tr = T[lang]

  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('all')

  const myTabs = [
    { label: tr.myTemple.tabBookings,   value: 'upcoming'   },
    { label: tr.myTemple.tabQRTickets, value: 'qr-tickets' },
    { label: tr.myTemple.tabPassport,  value: 'passport'   },
    { label: tr.myTemple.tabDonations, value: 'donations'  },
    { label: tr.myTemple.tabFollowing, value: 'following'  },
    { label: tr.myTemple.tabHistory,   value: 'journey'    },
  ]

  useEffect(() => {
    Promise.all([
      userApi.getMe(),
      bookingApi.list('u1'),
      donationApi.list('u1'),
    ]).then(([u, b, d]) => {
      setUser(u)
      setBookings(b)
      setDonations(d)
      setLoading(false)
    })
  }, [])

  const totalDonated = donations.reduce((s, d) => s + d.amount, 0)
  const upcomingBookings = bookings.filter(isUpcoming)
  const qrBookings = bookings.filter(b => b.status === 'confirmed')

  const filteredBookings = bookingFilter === 'all'
    ? upcomingBookings
    : upcomingBookings.filter(b => b.status === bookingFilter)

  const followedTemples = MOCK_TEMPLES.filter(t =>
    user?.following.includes(t.id)
  )

  const monthlyVisits = user ? getMonthlyVisits(user.passportEntries) : []
  const maxVisits = Math.max(...monthlyVisits, 1)

  const joinedDate = user
    ? new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-40 bg-[#ECECEC] rounded-xl" />
          <div className="h-10 bg-[#ECECEC] rounded-sm" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-[#ECECEC] rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* ── Profile Header ── */}
      <div className="bg-gradient-to-br from-primary-50 to-white px-4 py-6 border-b border-[#ECECEC]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-4 mb-5">
            <Avatar src={user?.avatar} name={user?.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-[#111827] leading-tight">{user?.name}</h1>
              {user?.nameTa && (
                <p className="text-sm text-primary font-medium">{user.nameTa}</p>
              )}
              <p className="text-xs text-[#6B7280] mt-0.5">{tr.myTemple.memberSince} {joinedDate}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {[
              { label: tr.myTemple.visited,   value: user?.passportEntries.length ?? 0 },
              { label: tr.myTemple.donations, value: formatCurrency(totalDonated) },
              { label: tr.myTemple.following, value: user?.following.length ?? 0 },
              { label: tr.myTemple.routes,   value: '1 started' },
            ].map(stat => (
              <div
                key={stat.label}
                className="shrink-0 text-center bg-white rounded-xl px-4 py-2.5 shadow-soft border border-[#ECECEC]"
              >
                <p className="text-base font-black text-primary">{stat.value}</p>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-2xl mx-auto">
        <Tabs
          tabs={myTabs}
          value={activeTab}
          onChange={setActiveTab}
          className="px-4"
        />

        <div className="px-4 pt-5">
          {/* ── Upcoming ── */}
          {activeTab === 'upcoming' && (
            <div>
              {/* Filter chips */}
              <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                {(['all', 'confirmed', 'pending'] as BookingFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setBookingFilter(f)}
                    className={[
                      'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize',
                      bookingFilter === f
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-[#ECECEC] text-[#6B7280]',
                    ].join(' ')}
                  >
                    {f === 'all' ? tr.explore.all : f === 'confirmed' ? tr.booking.confirmed : tr.booking.pending}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar size={40} className="mx-auto mb-3 text-[#ECECEC]" />
                  <p className="text-sm text-[#6B7280] mb-4">{tr.myTemple.noBookings}</p>
                  <Link to="/bookings">
                    <Button variant="primary" size="sm">{tr.profile.bookPooja}</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map(b => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── QR Tickets ── */}
          {activeTab === 'qr-tickets' && (
            <div className="space-y-5">
              {qrBookings.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-[#6B7280]">{tr.myTemple.noQRTickets}</p>
                </div>
              ) : (
                qrBookings.map(b => <QRCard key={b.id} booking={b} />)
              )}
            </div>
          )}

          {/* ── Passport ── */}
          {activeTab === 'passport' && (
            <div>
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white rounded-xl p-4 shadow-soft border border-[#ECECEC] text-center">
                  <p className="text-2xl font-black text-primary">{user?.passportEntries.length}</p>
                  <p className="text-xs text-[#6B7280]">{tr.myTemple.visited}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-soft border border-[#ECECEC] text-center">
                  <p className="text-2xl font-black text-primary">1</p>
                  <p className="text-xs text-[#6B7280]">{tr.myTemple.routeStarted}</p>
                </div>
              </div>

              <Link to="/passport">
                <Button variant="secondary" className="w-full mb-5">
                  {tr.myTemple.viewPassport}
                </Button>
              </Link>

              {/* Recent stamps grid */}
              <h3 className="text-sm font-semibold text-[#111827] mb-3">{tr.passport.recentStamps}</h3>
              <div className="grid grid-cols-4 gap-3">
                {user?.passportEntries.slice(0, 4).map(entry => (
                  <div key={entry.templeId} className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-full border-2 border-primary p-0.5 shadow-soft overflow-hidden">
                      <img
                        src={entry.templeImage}
                        alt={entry.templeName}
                        className="w-full h-full rounded-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[#6B7280] text-center leading-tight line-clamp-1">
                      {entry.templeName.split(' ')[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Donations ── */}
          {activeTab === 'donations' && (
            <div>
              {/* Total */}
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 mb-5 border border-primary/20 text-center">
                <p className="text-xs text-[#6B7280] uppercase tracking-wider mb-1">{tr.myTemple.totalDonated}</p>
                <p className="text-4xl font-black text-primary">{formatCurrency(totalDonated)}</p>
              </div>

              {/* Donation list */}
              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-[#6B7280]">{tr.myTemple.noDonations}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map(d => (
                    <div
                      key={d.id}
                      className="bg-white rounded-xl border border-[#ECECEC] shadow-soft p-4 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-light-violet shrink-0">
                        <img
                          src={d.templeImage}
                          alt={d.templeName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#111827] line-clamp-1">
                          {d.templeName}
                        </p>
                        <p className="text-xs text-[#6B7280]">{d.purpose}</p>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">{formatDate(d.date)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">
                          ₹{d.amount.toLocaleString('en-IN')}
                        </p>
                        <button
                          className="flex items-center gap-1 text-[10px] text-[#6B7280] hover:text-primary mt-1 transition-colors"
                          onClick={() => alert(`Receipt: ${d.receiptNumber}`)}
                        >
                          <Receipt size={10} />
                          {d.receiptNumber}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Following ── */}
          {activeTab === 'following' && (
            <div>
              {followedTemples.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-[#6B7280] mb-4">{tr.myTemple.noFollowing}</p>
                  <Link to="/explore">
                    <Button variant="primary" size="sm">Explore Temples</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-5">
                    {followedTemples.map(t => (
                      <div
                        key={t.id}
                        className="bg-white rounded-xl border border-[#ECECEC] shadow-soft p-4 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-light-violet shrink-0">
                          <img
                            src={t.coverImage}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#111827] line-clamp-1">{t.name}</p>
                          <p className="text-xs text-[#6B7280]">{t.deity}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-[#6B7280]">
                            <MapPin size={10} className="text-primary" />
                            {t.district}
                          </div>
                        </div>
                        <Badge variant={t.isOpen ? 'success' : 'danger'} size="sm">
                          {t.isOpen ? tr.common.open : tr.common.closed}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Link to="/explore">
                    <Button variant="outline" className="w-full">{tr.myTemple.exploreMore}</Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* ── Journey ── */}
          {activeTab === 'journey' && (
            <div>
              <h2 className="text-base font-bold text-[#111827] mb-4">
                {tr.myTemple.journeyTitle}
              </h2>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { value: user?.passportEntries.length ?? 0, label: tr.common.temples },
                  { value: '2',                                label: tr.myTemple.months },
                  { value: '1 started',                        label: tr.myTemple.routes },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl p-3 shadow-soft border border-[#ECECEC] text-center">
                    <p className="text-lg font-black text-primary">{s.value}</p>
                    <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Monthly bar chart */}
              <div className="bg-white rounded-xl p-5 border border-[#ECECEC] shadow-soft mb-5">
                <p className="text-sm font-semibold text-[#111827] mb-5">{tr.myTemple.monthlyVisits}</p>
                <div className="flex items-end gap-3 h-20">
                  {MONTHS.map((month, i) => {
                    const count = monthlyVisits[i] ?? 0
                    const heightPct = maxVisits > 0 ? (count / maxVisits) * 100 : 0
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-primary font-semibold tabular-nums">
                          {count > 0 ? count : ''}
                        </span>
                        <div className="w-full flex items-end" style={{ height: 64 }}>
                          <div
                            className="w-full bg-primary/70 rounded-t transition-all"
                            style={{ height: count > 0 ? `${Math.max(heightPct, 8)}%` : '2px', opacity: count > 0 ? 1 : 0.2 }}
                          />
                        </div>
                        <span className="text-[10px] text-[#6B7280]">{month}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Favorite temple */}
              <div className="bg-white rounded-xl p-4 border border-[#ECECEC] shadow-soft mb-5">
                <p className="text-xs text-[#6B7280] mb-1">{tr.myTemple.favouriteTemple}</p>
                <p className="text-sm font-semibold text-[#111827]">Meenakshi Amman Temple</p>
                <p className="text-xs text-primary">Most visited in 2026</p>
              </div>

              <Button
                variant="outline"
                icon={<Download size={16} />}
                iconPosition="left"
                className="w-full"
                onClick={() => alert('Journey PDF download coming soon!')}
              >
                {tr.myTemple.downloadJourney}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
