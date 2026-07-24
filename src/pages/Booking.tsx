import React, { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, ChevronLeft, ChevronRight, Check,
  Plus, Minus, CreditCard, Smartphone, Building2, Share2,
  Download, MapPin, Clock, Users, Sparkles,
} from 'lucide-react'
import { templeApi, bookingApi } from '@/services/mock/api'
import type { Temple, Pooja, Slot, Booking } from '@/types'
import { Button, Badge, Skeleton, Input, Tabs } from '@/components/ui'
import { TempleCard, QRCard } from '@/components/temple'
import { useLang } from '@/contexts/LanguageContext'
import { T } from '@/i18n/translations'

/* ─── cn helper ───────────────────────────────────────────────────────────── */
function cn(...c: (string | undefined | false | null)[]): string {
  return c.filter(Boolean).join(' ')
}

/* ─── Step indicator ─────────────────────────────────────────────────────── */
function StepIndicator({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="flex items-center px-4 py-3 overflow-x-auto scrollbar-hide gap-0">
      {labels.map((label, i) => {
        const num    = i + 1
        const active = num === step
        const done   = num < step

        return (
          <React.Fragment key={label}>
            {/* Circle node */}
            <div className="flex flex-col items-center shrink-0 gap-0.5">
              <motion.div
                animate={{
                  backgroundColor: active ? '#7C6CF2' : done ? '#EDE9FE' : '#ECECEC',
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
              >
                {done
                  ? <Check size={12} className="text-primary" />
                  : <span className={active ? 'text-white' : 'text-[#6B7280]'}>{num}</span>}
              </motion.div>
              <span className={cn('text-[9px] whitespace-nowrap', active ? 'text-primary font-semibold' : 'text-[#6B7280]')}>
                {label}
              </span>
            </div>

            {/* Connector bar */}
            {i < labels.length - 1 && (
              <motion.div
                animate={{ backgroundColor: done ? '#C4B5FD' : '#ECECEC' }}
                transition={{ duration: 0.3 }}
                className="h-0.5 flex-1 min-w-2 max-w-6 rounded-full mb-4"
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ─── Slide animation variants ────────────────────────────────────────────── */
const slideVariants = {
  enter:  (dir: number) => ({ x: dir > 0 ?  300 : -300, opacity: 0 }),
  center: {
    x: 0, opacity: 1,
    transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] as const },
  },
  exit:   (dir: number) => ({
    x: dir > 0 ? -300 : 300, opacity: 0,
    transition: { duration: 0.22, ease: [0.25, 1, 0.5, 1] as const },
  }),
}

/* ─── Date helpers ────────────────────────────────────────────────────────── */
const DAY_ABBRS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MON_NAMES = ['January','February','March','April','May','June',
                   'July','August','September','October','November','December']
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function todayAtMidnight(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function generateNext30Days(): Date[] {
  const base = todayAtMidnight()
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    return d
  })
}

function friendlyDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

/* ─── Calendar-style date picker ─────────────────────────────────────────── */
function CalendarPicker({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const dates    = generateNext30Days()
  const todayStr = toDateStr(todayAtMidnight())

  // Group dates by month for display
  type MonthGroup = { month: number; year: number; days: Date[] }
  const groups: MonthGroup[] = []
  for (const d of dates) {
    const m = d.getMonth()
    const y = d.getFullYear()
    const last = groups[groups.length - 1]
    if (!last || last.month !== m || last.year !== y) {
      groups.push({ month: m, year: y, days: [d] })
    } else {
      last.days.push(d)
    }
  }

  return (
    <div className="space-y-5">
      {groups.map(({ month, year, days }) => {
        const firstDow = days[0].getDay()
        return (
          <div key={`${year}-${month}`}>
            {/* Month header */}
            <p className="text-xs font-bold text-[#111827] mb-2 uppercase tracking-wide">
              {MON_NAMES[month]} {year}
            </p>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_ABBRS.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-[#6B7280] py-0.5 select-none">
                  {d}
                </div>
              ))}
            </div>

            {/* Date grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Leading padding cells */}
              {Array(firstDow).fill(null).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}

              {days.map(d => {
                const dStr       = toDateStr(d)
                const isSelected = dStr === value
                const isToday    = dStr === todayStr

                return (
                  <button
                    key={dStr}
                    onClick={() => onChange(dStr)}
                    className={cn(
                      'aspect-square rounded-lg flex flex-col items-center justify-center transition-all select-none',
                      isSelected
                        ? 'bg-primary text-white shadow-soft'
                        : isToday
                        ? 'bg-light-violet text-primary border border-primary/30'
                        : 'bg-white border border-[#ECECEC] text-[#111827] hover:border-primary/40 hover:bg-[#FAFAFC]',
                    )}
                  >
                    <span className="text-sm font-bold leading-none">{d.getDate()}</span>
                    {isToday && (
                      <span className={cn(
                        'text-[8px] font-semibold leading-none mt-0.5',
                        isSelected ? 'text-white/80' : 'text-primary',
                      )}>
                        Today
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Back button ─────────────────────────────────────────────────────────── */
function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm text-[#6B7280] mb-4 hover:text-primary transition-colors"
    >
      <ChevronLeft size={16} /> {label}
    </button>
  )
}

/* ─── Payment method type ─────────────────────────────────────────────────── */
type PaymentMethod = 'upi' | 'card' | 'netbanking'

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function Booking() {
  const [searchParams] = useSearchParams()
  const { lang } = useLang()
  const tr = T[lang]

  /* Step state */
  const [step, setStep]           = useState(1)
  const [direction, setDirection] = useState(1)

  /* Step 1 — Temple */
  const [templeId, setTempleId]               = useState('')
  const [temple, setTemple]                   = useState<Temple | null>(null)
  const [searchQuery, setSearchQuery]         = useState('')
  const [featuredTemples, setFeaturedTemples] = useState<Temple[]>([])
  const [templesLoading, setTemplesLoading]   = useState(true)

  /* Step 2 — Pooja */
  const [poojaId, setPoojaId] = useState('')
  const [pooja, setPooja]     = useState<Pooja | null>(null)

  /* Step 3 — Date */
  const [date, setDate] = useState('')

  /* Step 4 — Slot */
  const [slots, setSlots]               = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotId, setSlotId]             = useState('')
  const [slot, setSlot]                 = useState<Slot | null>(null)

  /* Step 5 — Persons */
  const [persons, setPersons] = useState(1)

  /* Step 7 — Payment */
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [upiId, setUpiId]               = useState('')
  const [cardNumber, setCardNumber]     = useState('')
  const [cardExpiry, setCardExpiry]     = useState('')
  const [cardCvv, setCardCvv]           = useState('')
  const [paying, setPaying]             = useState(false)

  /* Step 8 — Confirmed booking */
  const [booking, setBooking] = useState<Booking | null>(null)

  /* ── Navigation ── */
  const advance = useCallback((to?: number) => {
    setDirection(1)
    setStep(prev => to ?? prev + 1)
  }, [])

  const back = useCallback(() => {
    setDirection(-1)
    setStep(prev => Math.max(1, prev - 1))
  }, [])

  /* ── URL param pre-fill + featured temples ── */
  useEffect(() => {
    const paramTempleId = searchParams.get('templeId')
    const paramPoojaId  = searchParams.get('poojaId')

    templeApi.getFeatured().then(ts => {
      setFeaturedTemples(ts)
      setTemplesLoading(false)
    })

    if (paramTempleId) {
      templeApi.get(paramTempleId).then(t => {
        setTempleId(t.id)
        setTemple(t)
        if (paramPoojaId) {
          const found = t.poojas.find(p => p.id === paramPoojaId && p.isBookable)
          if (found) {
            setPoojaId(found.id)
            setPooja(found)
            advance(3)  // skip temple + service → go straight to date
          } else {
            advance(2)  // skip temple → go to service
          }
        } else {
          advance(2)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Fetch slots on step 4 ── */
  useEffect(() => {
    if (step === 4 && templeId && poojaId && date) {
      setSlotsLoading(true)
      setSlotId('')
      setSlot(null)
      templeApi.getSlots(templeId, poojaId, date).then(({ slots: s }) => {
        setSlots(s)
        setSlotsLoading(false)
      })
    }
  }, [step, templeId, poojaId, date])

  /* ── Handlers ── */
  function handleSelectTemple(t: Temple) {
    setTempleId(t.id)
    setTemple(t)
    advance()
  }

  function handleSelectPooja(p: Pooja) {
    setPoojaId(p.id)
    setPooja(p)
  }

  function handleSelectSlot(s: Slot) {
    if (s.available === 0) return
    setSlotId(s.id)
    setSlot(s)
  }

  async function handlePay() {
    if (!templeId || !poojaId || !date || !slotId) return
    setPaying(true)
    const b = await bookingApi.create({
      templeId, poojaId, date, slotId,
      persons,
      totalAmount: (slot?.price ?? 0) * persons,
    })
    setBooking(b)
    setPaying(false)
    advance()
  }

  function resetFlow() {
    setStep(1); setDirection(1)
    setTempleId(''); setTemple(null); setSearchQuery('')
    setPoojaId(''); setPooja(null)
    setDate('')
    setSlotId(''); setSlot(null)
    setPersons(1)
    setBooking(null)
  }

  /* ── Derived values ── */
  const filteredTemples = featuredTemples.filter(t =>
    !searchQuery ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.deity.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const unitPrice   = slot?.price ?? pooja?.price ?? 0
  const totalAmount = unitPrice * persons

  const paymentTabs = [
    { label: 'UPI',         value: 'upi' },
    { label: 'Card',        value: 'card' },
    { label: 'Net Banking', value: 'netbanking' },
  ]

  /* ─────────────────────────────────────────────────────────────────────────
     Render
  ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Step indicator (sticky) ── */}
      <div className="bg-surface border-b border-[#ECECEC] sticky top-0 z-10 shadow-soft">
        <StepIndicator step={step} labels={[
          tr.booking.step1, tr.booking.step2, tr.booking.step3, tr.booking.step4,
          tr.booking.step5, tr.booking.step6, tr.booking.step7, tr.booking.step8,
        ]} />
      </div>

      {/* ── Animated step panels ── */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full"
          >
            <div className="max-w-lg mx-auto px-4 pt-6 pb-12">

              {/* ═══════════════════════════════════════════════════════════
                  STEP 1 — Choose Temple
              ═══════════════════════════════════════════════════════════ */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-bold text-[#111827] mb-5">{tr.booking.selectTempleTitle}</h2>

                  <Input
                    placeholder="Search temples, deities, districts…"
                    prefix={<Search size={15} />}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    containerClassName="mb-5"
                  />

                  {templesLoading ? (
                    <Skeleton variant="card" count={3} />
                  ) : filteredTemples.length === 0 ? (
                    <p className="text-sm text-[#6B7280] text-center py-10">No temples found</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredTemples.map(t => (
                        <TempleCard
                          key={t.id}
                          temple={t}
                          variant="compact"
                          onClick={() => handleSelectTemple(t)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════
                  STEP 2 — Choose Pooja / Service
              ═══════════════════════════════════════════════════════════ */}
              {step === 2 && temple && (
                <div>
                  <BackButton onClick={back} label={tr.booking.back} />

                  {/* Temple context */}
                  <div className="flex items-center gap-3 mb-5 p-3 bg-surface rounded-xl border border-[#ECECEC] shadow-soft">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#ECECEC] shrink-0">
                      <img src={temple.coverImage} alt={temple.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#6B7280] uppercase tracking-wide font-medium">Booking for</p>
                      <p className="text-sm font-bold text-[#111827] leading-snug line-clamp-1">{lang === 'ta' ? (temple.nameTa || temple.name) : temple.name}</p>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-[#111827] mb-4">{tr.booking.selectPoojaTitle}</h2>

                  <div className="space-y-3">
                    {temple.poojas.filter(p => p.isBookable).map(p => {
                      const selected = poojaId === p.id
                      return (
                        <motion.div
                          key={p.id}
                          whileHover={{ y: -1 }}
                          onClick={() => handleSelectPooja(p)}
                          className={cn(
                            'bg-surface rounded-xl p-4 border-2 cursor-pointer transition-all shadow-soft',
                            selected ? 'border-primary bg-light-violet' : 'border-[#ECECEC] hover:border-primary/40',
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-[#111827]">{lang === 'ta' ? (p.nameTa || p.name) : p.name}</p>
                                {selected && (
                                  <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                                    <Check size={9} className="text-white" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#6B7280] mt-0.5">{p.nameTa}</p>
                              <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{p.description}</p>

                              <div className="flex items-center gap-4 mt-2.5">
                                <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
                                  <Clock size={11} className="text-primary" />
                                  {p.time}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
                                  <Sparkles size={11} className="text-primary" />
                                  {p.duration}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-base font-black text-primary">₹{p.price}</p>
                              <p className="text-[10px] text-[#6B7280] mt-0.5">{tr.booking.perPerson}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {poojaId && (
                    <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => advance()}>
                      {tr.booking.next} <ChevronRight size={16} />
                    </Button>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════
                  STEP 3 — Choose Date (calendar grid)
              ═══════════════════════════════════════════════════════════ */}
              {step === 3 && (
                <div>
                  <BackButton onClick={back} label={tr.booking.back} />
                  <h2 className="text-lg font-bold text-[#111827] mb-5">{tr.booking.selectDateTitle}</h2>

                  <div className="bg-surface rounded-xl border border-[#ECECEC] shadow-soft p-4 mb-4">
                    <CalendarPicker value={date} onChange={setDate} />
                  </div>

                  {date && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-light-violet rounded-xl px-4 py-3 flex items-center gap-2 mb-4"
                    >
                      <Check size={14} className="text-primary shrink-0" />
                      <p className="text-sm font-medium text-primary">{friendlyDate(date)}</p>
                    </motion.div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!date}
                    onClick={() => advance()}
                  >
                    {tr.booking.next} <ChevronRight size={16} />
                  </Button>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════
                  STEP 4 — Choose Slot
              ═══════════════════════════════════════════════════════════ */}
              {step === 4 && (
                <div>
                  <BackButton onClick={back} label={tr.booking.back} />
                  <h2 className="text-lg font-bold text-[#111827] mb-1">{tr.booking.selectSlotTitle}</h2>

                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-5">
                    <MapPin size={11} className="text-primary shrink-0" />
                    <span className="line-clamp-1">{lang === 'ta' ? (temple?.nameTa || temple?.name) : temple?.name}</span>
                    <span className="text-[#ECECEC]">·</span>
                    <span className="shrink-0">{date ? friendlyDate(date) : ''}</span>
                  </div>

                  {slotsLoading ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-20 bg-[#ECECEC] rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slots.map(s => {
                        const full     = s.available === 0
                        const selected = slotId === s.id
                        const pct      = Math.round((s.available / s.total) * 100)

                        return (
                          <button
                            key={s.id}
                            onClick={() => handleSelectSlot(s)}
                            disabled={full}
                            className={cn(
                              'rounded-xl p-3 border-2 transition-all text-center',
                              full
                                ? 'bg-[#FAFAFC] border-[#ECECEC] opacity-50 cursor-not-allowed'
                                : selected
                                ? 'bg-light-violet border-primary shadow-soft'
                                : 'bg-surface border-[#ECECEC] hover:border-primary/50 cursor-pointer shadow-soft',
                            )}
                          >
                            <p className="text-sm font-bold text-[#111827]">{s.time}</p>

                            {/* Availability bar */}
                            <div className="mt-1.5 h-1 rounded-full bg-[#ECECEC] overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  full ? 'bg-danger' : pct > 50 ? 'bg-success' : 'bg-warning',
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            <p className={cn('text-[10px] mt-1', full ? 'text-danger font-semibold' : 'text-[#6B7280]')}>
                              {full ? 'Full' : `${s.available}/${s.total} left`}
                            </p>
                            <p className="text-xs font-bold text-primary mt-1">₹{s.price}</p>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {slotId && (
                    <Button variant="primary" size="lg" className="w-full mt-6" onClick={() => advance()}>
                      {tr.booking.next} <ChevronRight size={16} />
                    </Button>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════
                  STEP 5 — Number of Persons
              ═══════════════════════════════════════════════════════════ */}
              {step === 5 && (
                <div>
                  <BackButton onClick={back} label={tr.booking.back} />
                  <h2 className="text-lg font-bold text-[#111827] mb-8">{tr.booking.personsTitle}</h2>

                  <div className="flex items-center justify-center gap-8 mb-4">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPersons(p => Math.max(1, p - 1))}
                      disabled={persons <= 1}
                      className={cn(
                        'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors',
                        persons <= 1
                          ? 'border-[#ECECEC] text-[#ECECEC] cursor-not-allowed'
                          : 'border-primary text-primary hover:bg-light-violet',
                      )}
                    >
                      <Minus size={20} />
                    </motion.button>

                    <motion.span
                      key={persons}
                      initial={{ scale: 0.75, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-6xl font-black text-primary w-20 text-center tabular-nums"
                    >
                      {persons}
                    </motion.span>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPersons(p => Math.min(10, p + 1))}
                      disabled={persons >= 10}
                      className={cn(
                        'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors',
                        persons >= 10
                          ? 'border-[#ECECEC] text-[#ECECEC] cursor-not-allowed'
                          : 'border-primary text-primary hover:bg-light-violet',
                      )}
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>

                  <p className="text-center text-xs text-[#6B7280] mb-6">Max 10 persons per booking</p>

                  {/* Price breakdown */}
                  <div className="bg-light-violet rounded-xl p-4 mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Price per person</span>
                      <span className="font-semibold text-[#111827]">₹{unitPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Persons</span>
                      <span className="font-semibold text-[#111827]">× {persons}</span>
                    </div>
                    <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                      <span className="text-sm font-bold text-[#111827]">Total</span>
                      <span className="text-xl font-black text-primary">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" className="w-full" onClick={() => advance()}>
                    {tr.booking.next} <ChevronRight size={16} />
                  </Button>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════
                  STEP 6 — Review Booking
              ═══════════════════════════════════════════════════════════ */}
              {step === 6 && (
                <div>
                  <BackButton onClick={back} label={tr.booking.back} />
                  <h2 className="text-lg font-bold text-[#111827] mb-5">{tr.booking.reviewTitle}</h2>

                  <div className="bg-surface rounded-xl border border-[#ECECEC] shadow-soft overflow-hidden mb-5">
                    {/* Temple cover */}
                    {temple?.coverImage && (
                      <div className="h-36 overflow-hidden relative">
                        <img
                          src={temple.coverImage}
                          alt={temple.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                        <div className="absolute bottom-3 left-4 text-white">
                          <p className="text-xs opacity-75">{temple.district}</p>
                          <p className="text-sm font-bold leading-snug">{temple.name}</p>
                        </div>
                      </div>
                    )}

                    <div className="divide-y divide-[#ECECEC]">
                      {[
                        { label: 'Temple',  value: lang === 'ta' ? (temple?.nameTa || temple?.name) : temple?.name, editStep: 1 },
                        { label: 'Service', value: lang === 'ta' ? (pooja?.nameTa  || pooja?.name)  : pooja?.name,  editStep: 2 },
                        { label: 'Date',    value: date ? friendlyDate(date) : '', editStep: 3 },
                        { label: 'Slot',    value: slot?.time,               editStep: 4 },
                        { label: 'Persons', value: `${persons} ${persons === 1 ? 'person' : 'persons'}`, editStep: 5 },
                      ].map(row => (
                        <div key={row.label} className="flex items-center gap-3 px-4 py-3">
                          <p className="text-xs text-[#6B7280] w-14 shrink-0">{row.label}</p>
                          <p className="text-sm font-semibold text-[#111827] flex-1 min-w-0">{row.value}</p>
                          <button
                            onClick={() => { setDirection(-1); setStep(row.editStep) }}
                            className="text-xs text-primary hover:underline font-medium shrink-0"
                          >
                            Edit
                          </button>
                        </div>
                      ))}

                      <div className="flex items-center justify-between px-4 py-4">
                        <div>
                          <p className="text-xs text-[#6B7280]">{tr.booking.totalAmount}</p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">
                            ₹{unitPrice} × {persons} {persons === 1 ? 'person' : 'persons'}
                          </p>
                        </div>
                        <p className="text-2xl font-black text-primary">
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" className="w-full" onClick={() => advance()}>
                    {tr.booking.confirm}
                  </Button>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════
                  STEP 7 — Payment
              ═══════════════════════════════════════════════════════════ */}
              {step === 7 && (
                <div>
                  <BackButton onClick={back} label={tr.booking.back} />

                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#111827]">Payment</h2>
                    <p className="text-3xl font-black text-primary mt-1">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {pooja?.name} · {persons} {persons === 1 ? 'person' : 'persons'}
                    </p>
                  </div>

                  <Tabs
                    tabs={paymentTabs}
                    value={paymentMethod}
                    onChange={v => setPaymentMethod(v as PaymentMethod)}
                    className="mb-5"
                  />

                  <AnimatePresence mode="wait">
                    {/* UPI */}
                    {paymentMethod === 'upi' && (
                      <motion.div
                        key="upi"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="space-y-4"
                      >
                        <Input
                          label="UPI ID"
                          placeholder="yourname@upi"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          suffix={<Smartphone size={15} />}
                        />
                        <div className="bg-[#FAFAFC] rounded-xl border border-dashed border-[#ECECEC] p-8 flex flex-col items-center gap-3">
                          {/* Minimal QR visual */}
                          <div className="w-28 h-28 rounded-xl overflow-hidden bg-white border border-[#ECECEC] p-2">
                            <svg viewBox="0 0 7 7" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
                              <rect width="7" height="7" fill="white" />
                              <rect x="0" y="0" width="3" height="3" fill="#111827" />
                              <rect x="0.5" y="0.5" width="2" height="2" fill="white" />
                              <rect x="1" y="1" width="1" height="1" fill="#111827" />
                              <rect x="4" y="0" width="3" height="3" fill="#111827" />
                              <rect x="4.5" y="0.5" width="2" height="2" fill="white" />
                              <rect x="5" y="1" width="1" height="1" fill="#111827" />
                              <rect x="0" y="4" width="3" height="3" fill="#111827" />
                              <rect x="0.5" y="4.5" width="2" height="2" fill="white" />
                              <rect x="1" y="5" width="1" height="1" fill="#111827" />
                              <rect x="3" y="0" width="1" height="1" fill="#111827" />
                              <rect x="3" y="2" width="1" height="1" fill="#111827" />
                              <rect x="3" y="4" width="1" height="1" fill="#111827" />
                              <rect x="4" y="3" width="1" height="1" fill="#111827" />
                              <rect x="5" y="4" width="1" height="1" fill="#111827" />
                              <rect x="6" y="5" width="1" height="1" fill="#111827" />
                              <rect x="4" y="6" width="1" height="1" fill="#111827" />
                              <rect x="6" y="3" width="1" height="1" fill="#111827" />
                              <rect x="3" y="6" width="1" height="1" fill="#111827" />
                            </svg>
                          </div>
                          <p className="text-xs text-[#6B7280] text-center">
                            Scan with any UPI app to pay ₹{totalAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Card */}
                    {paymentMethod === 'card' && (
                      <motion.div
                        key="card"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="space-y-3"
                      >
                        <Input
                          label="Card Number"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          suffix={<CreditCard size={15} />}
                          maxLength={19}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="Expiry"
                            placeholder="MM / YY"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            maxLength={7}
                          />
                          <Input
                            label="CVV"
                            placeholder="•••"
                            type="password"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                            maxLength={4}
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          {['VISA', 'MC', 'AMEX', 'RuPay'].map(c => (
                            <span key={c} className="text-[9px] font-bold px-1.5 py-0.5 border border-[#ECECEC] rounded text-[#6B7280]">
                              {c}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Net Banking */}
                    {paymentMethod === 'netbanking' && (
                      <motion.div
                        key="netbanking"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="space-y-2"
                      >
                        {[
                          { short: 'SBI',   full: 'State Bank of India' },
                          { short: 'HDFC',  full: 'HDFC Bank' },
                          { short: 'ICICI', full: 'ICICI Bank' },
                          { short: 'Axis',  full: 'Axis Bank' },
                          { short: 'Kotak', full: 'Kotak Mahindra Bank' },
                        ].map(bank => (
                          <button
                            key={bank.short}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-surface rounded-xl border border-[#ECECEC] hover:border-primary/40 transition-colors shadow-soft text-left group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-light-violet flex items-center justify-center shrink-0">
                              <Building2 size={15} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#111827]">{bank.short}</p>
                              <p className="text-[10px] text-[#6B7280]">{bank.full}</p>
                            </div>
                            <ChevronRight size={14} className="text-[#6B7280] group-hover:text-primary transition-colors shrink-0" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full mt-6"
                    loading={paying}
                    onClick={handlePay}
                  >
                    Pay ₹{totalAmount.toLocaleString('en-IN')}
                  </Button>

                  <p className="text-center text-[10px] text-[#6B7280] mt-3">
                    Secured by TempleOS · Mock payment — no real charge
                  </p>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════
                  STEP 8 — QR Ticket
              ═══════════════════════════════════════════════════════════ */}
              {step === 8 && booking && (
                <div className="flex flex-col items-center gap-6">
                  {/* Success icon */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-3">
                      <Check size={26} className="text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-[#111827]">{tr.booking.confirmTitle}</h2>
                    <p className="text-sm text-[#6B7280] mt-1">Your pooja slot has been reserved</p>
                  </motion.div>

                  {/* QR ticket */}
                  <div className="w-full">
                    <QRCard booking={booking} />
                  </div>

                  {/* Info badges */}
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="success">
                      <Users size={11} className="mr-1 inline" />
                      {booking.persons} {booking.persons === 1 ? 'person' : 'persons'}
                    </Badge>
                    <Badge variant="primary">
                      <Clock size={11} className="mr-1 inline" />
                      {booking.slot}
                    </Badge>
                    <Badge variant="default">
                      ₹{booking.totalAmount.toLocaleString('en-IN')}
                    </Badge>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 w-full max-w-sm">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      icon={<Download size={15} />}
                      onClick={() => alert('Ticket saved!')}
                    >
                      {tr.booking.downloadQR}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      icon={<Share2 size={15} />}
                      onClick={() => alert('Share coming soon!')}
                    >
                      Share
                    </Button>
                  </div>

                  <Link to="/my-temple" className="text-sm text-primary hover:underline font-medium">
                    {tr.booking.viewBookings}
                  </Link>

                  <button
                    onClick={resetFlow}
                    className="text-xs text-[#6B7280] hover:text-primary transition-colors"
                  >
                    Book another pooja
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
