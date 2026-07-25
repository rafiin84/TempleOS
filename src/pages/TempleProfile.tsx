import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Share2, Heart, MapPin, Users, Bookmark,
  Navigation, CheckCircle2, AlertCircle, IndianRupee,
  Camera, Volume2, RotateCcw, Hammer, ChevronRight, Clock, Timer,
  Flame, Utensils, Droplets, Wind, Sparkles, ShoppingBag,
  CalendarDays, Info, Building2,
} from 'lucide-react'
import {
  Button, Card, Badge, Tabs, StarRating, ProgressBar, Skeleton, Input,
} from '@/components/ui'
import { templeApi, renovationApi, donationApi } from '@/services/mock/api'
import { MOCK_TEMPLES } from '@/services/mock/data'
import { TempleCard } from '@/components/temple/TempleCard'
import type { Temple, RenovationProject } from '@/types'
import { useLang } from '@/contexts/LanguageContext'
import { T } from '@/i18n/translations'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`
  if (n >= 100_000)    return `${(n / 100_000).toFixed(0)}L`
  if (n >= 1_000)      return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString('en-IN')
}

function formatCurrency(n: number): string {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)}Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)      return `₹${(n / 1_000).toFixed(0)}K`
  return `₹${n}`
}

const FACILITY_ICONS: Record<string, string> = {
  'Prasad Counter':              '🪔',
  'Wheelchair Access':           '♿',
  'Free Parking':                '🅿️',
  'Paid Parking':                '🅿️',
  'Cloak Room':                  '🧳',
  'Drinking Water':              '💧',
  'Restrooms':                   '🚻',
  'Photography Allowed':         '📷',
  'Gift Shop':                   '🛍️',
  'Rope Car':                    '🚡',
  'Winch Car':                   '🚡',
  'Theertham (22 Sacred Wells)': '🏛️',
}
function facilityIcon(name: string): string {
  return FACILITY_ICONS[name] ?? '✓'
}

function crowdBadgeVariant(level: string): 'success' | 'warning' | 'danger' {
  if (level === 'Low')      return 'success'
  if (level === 'Moderate') return 'warning'
  return 'danger'
}

// ─── Services data ────────────────────────────────────────────────────────────

interface TempleService {
  id:          string
  name:        string
  nameTa:      string
  description: string
  price:       number
  duration:    string
  icon:        React.ReactNode
  category:    'Ritual' | 'Charitable' | 'Offering'
  isBookable:  boolean
}

const TEMPLE_SERVICES: TempleService[] = [
  {
    id: 'abhishekam',
    name: 'Abhishekam',
    nameTa: 'அபிஷேகம்',
    description: 'Sacred bathing ritual of the deity with milk, honey, rose water, sandalwood paste and sacred water. Done by a trained priest.',
    price: 500,
    duration: '45 min',
    icon: <Droplets size={20} className="text-primary" />,
    category: 'Ritual',
    isBookable: true,
  },
  {
    id: 'annadanam',
    name: 'Annadanam',
    nameTa: 'அன்னதானம்',
    description: 'Sponsor a free meal for pilgrims and devotees visiting the temple. A noble act of charity that feeds hundreds every day.',
    price: 1001,
    duration: '1 day',
    icon: <Utensils size={20} className="text-primary" />,
    category: 'Charitable',
    isBookable: true,
  },
  {
    id: 'archanai',
    name: 'Archanai',
    nameTa: 'அர்ச்சனை',
    description: 'Personalised prayer offering where the priest chants your name, birth star, and gotra while offering flowers to the deity.',
    price: 51,
    duration: '15 min',
    icon: <Flame size={20} className="text-primary" />,
    category: 'Offering',
    isBookable: true,
  },
  {
    id: 'homam',
    name: 'Homam / Yagnam',
    nameTa: 'ஹோமம் / யாகம்',
    description: 'Sacred fire ritual performed to invoke divine blessings for prosperity, health, and protection. Conducted in the homa kundam.',
    price: 2100,
    duration: '2 hrs',
    icon: <Wind size={20} className="text-primary" />,
    category: 'Ritual',
    isBookable: true,
  },
  {
    id: 'deepa-aradhana',
    name: 'Deepa Aradhana',
    nameTa: 'தீப ஆராதனை',
    description: 'Waving of lit oil lamps before the deity accompanied by bell ringing and recitation of hymns. The most auspicious evening ritual.',
    price: 150,
    duration: '20 min',
    icon: <Sparkles size={20} className="text-primary" />,
    category: 'Ritual',
    isBookable: false,
  },
  {
    id: 'vastra-alankaram',
    name: 'Vastra Alankaram',
    nameTa: 'வஸ்த்ர அலங்காரம்',
    description: 'Donation of garments, silk sarees, or dhotis to adorn the deity. The cloth is blessed and can be taken back as prasad.',
    price: 750,
    duration: '-',
    icon: <ShoppingBag size={20} className="text-primary" />,
    category: 'Offering',
    isBookable: true,
  },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const tabVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.14, ease: 'easeIn' as const } },
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ temple }: { temple: Temple }) {
  const { lang } = useLang()
  const tr = T[lang]
  const facts = [
    { label: tr.profile.yearBuilt,  value: temple.yearBuilt },
    { label: tr.profile.dynasty,    value: temple.dynasty },
    { label: tr.profile.style,      value: temple.architecturalStyle },
    { label: tr.profile.visitCount, value: formatNumber(temple.visitCount) },
    { label: tr.profile.followers,  value: formatNumber(temple.followCount) },
    { label: tr.profile.reviews,    value: formatNumber(temple.reviewCount) },
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Description */}
      <section>
        <h2 className="text-sm font-semibold text-[#111827] mb-2">{tr.profile.about}</h2>
        <p className="text-sm text-[#6B7280] leading-relaxed">{lang === 'ta' ? (temple.descriptionTa || temple.description) : temple.description}</p>
      </section>

      {/* Tamil name */}
      <section className="flex items-center gap-3 p-3 rounded-xl bg-light-violet border border-primary/10">
        <Info size={16} className="text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-[#6B7280] mb-0.5">{tr.profile.tamilName}</p>
          <p className="text-sm font-semibold text-primary">{temple.nameTa}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">{temple.deityTa}</p>
        </div>
      </section>

      {/* Quick facts */}
      <section>
        <h2 className="text-sm font-semibold text-[#111827] mb-3">{tr.profile.quickFacts}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {facts.map((f) => (
            <Card key={f.label} className="text-center !p-3">
              <p className="text-xs text-[#6B7280] mb-1">{f.label}</p>
              <p className="text-sm font-semibold text-[#111827] leading-tight">{f.value}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories */}
      {temple.categories.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#111827] mb-2">{tr.profile.categories}</h2>
          <div className="flex flex-wrap gap-2">
            {temple.categories.map((c) => (
              <Badge key={c} variant="primary">{c}</Badge>
            ))}
          </div>
        </section>
      )}

      {/* Facilities */}
      {temple.facilities.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#111827] mb-3">{tr.profile.facilities}</h2>
          <div className="flex flex-wrap gap-2">
            {temple.facilities.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-light-violet text-xs font-medium text-primary"
              >
                <span aria-hidden="true">{facilityIcon(f)}</span>
                {f}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Tab: History ─────────────────────────────────────────────────────────────

function HistoryTab({ temple }: { temple: Temple }) {
  const { lang } = useLang()
  const tr = T[lang]
  return (
    <div className="p-4 space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-[#111827] mb-2">{tr.profile.tabHistory}</h2>
        <p className="text-sm text-[#6B7280] leading-relaxed">{temple.history}</p>
      </section>

      {temple.heritage.dynasties.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#111827] mb-2">{tr.profile.dynasties}</h2>
          <div className="flex flex-wrap gap-2">
            {temple.heritage.dynasties.map((d) => (
              <Badge key={d} variant="primary">{d}</Badge>
            ))}
          </div>
        </section>
      )}

      {temple.heritage.timeline.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#111827] mb-4">{tr.profile.timeline}</h2>
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />
            <div className="space-y-6">
              {temple.heritage.timeline.map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.2 }}
                  className="relative"
                >
                  {/* Dot */}
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-soft" />
                  <Badge variant="primary" size="sm" className="mb-1.5">
                    {event.year}
                  </Badge>
                  <p className="text-sm text-[#111827] leading-relaxed">{event.event}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Tab: Gallery ─────────────────────────────────────────────────────────────

function GalleryTab({ temple }: { temple: Temple }) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  return (
    <>
      <div className="p-4">
        {temple.images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Camera size={48} className="text-[#ECECEC] mb-3" />
            <p className="text-sm text-[#6B7280]">No photos available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {/* First image spans 2 columns for a masonry feel */}
            {temple.images.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className={`cursor-pointer overflow-hidden rounded-lg bg-[#ECECEC] ${
                  i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                }`}
                onClick={() => setLightboxImage(img)}
              >
                <img
                  src={img}
                  alt={`${temple.name} — photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-[#6B7280] mt-3">
          {temple.images.length} photo{temple.images.length !== 1 ? 's' : ''} · Tap to enlarge
        </p>
      </div>

      {/* Full-screen lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.img
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{ scale: 0.88,    opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={lightboxImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              aria-label="Close lightbox"
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors text-xl font-light"
              onClick={() => setLightboxImage(null)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Tab: Timings ─────────────────────────────────────────────────────────────

function TimingsTab({ temple }: { temple: Temple }) {
  const { lang } = useLang()
  const tr = T[lang]
  return (
    <div className="p-4 space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#ECECEC] shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-light-violet">
              {[tr.profile.day, tr.profile.morning, tr.profile.evening].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-[#111827] uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {temple.timings.map((timing, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFC]'}>
                <td className="px-4 py-3 font-medium text-[#111827] leading-snug">
                  {timing.day}
                </td>
                <td className="px-4 py-3 text-[#6B7280]">
                  {timing.closed
                    ? <span className="font-medium text-danger">{tr.common.closed}</span>
                    : <span className="flex items-center gap-1"><Clock size={12} className="text-primary" />{timing.morning}</span>
                  }
                </td>
                <td className="px-4 py-3 text-[#6B7280]">
                  {timing.closed
                    ? <span className="font-medium text-danger">{tr.common.closed}</span>
                    : <span className="flex items-center gap-1"><Clock size={12} className="text-primary" />{timing.evening}</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
        <Info size={14} className="text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B7280] leading-relaxed">
          {tr.profile.timingsNote}
        </p>
      </div>
    </div>
  )
}

// ─── Tab: Poojas ──────────────────────────────────────────────────────────────

function PoojasTab({ temple }: { temple: Temple }) {
  const navigate = useNavigate()
  const { lang } = useLang()
  const tr = T[lang]

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <CalendarDays size={15} className="text-primary" />
        <h2 className="text-sm font-semibold text-[#111827]">{tr.profile.dailyPoojas}</h2>
      </div>
      {temple.poojas.map((pooja) => (
        <Card key={pooja.id}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-[#111827]">{lang === 'ta' ? (pooja.nameTa || pooja.name) : pooja.name}</h3>
                <span className="text-xs text-[#6B7280]">{lang === 'ta' ? pooja.name : pooja.nameTa}</span>
              </div>
              <p className="text-xs text-primary mt-0.5 font-medium">{tr.profile.deityLabel}: {pooja.deity}</p>
              <p className="text-sm text-[#6B7280] mt-1.5 leading-snug">{pooja.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280]">
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-primary" /> {pooja.time}
                </span>
                <span className="flex items-center gap-1">
                  <Timer size={11} className="text-primary" /> {pooja.duration}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-base font-bold text-primary">
                {pooja.price === 0 ? tr.profile.free : `₹${pooja.price}`}
              </span>
              {pooja.isBookable ? (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    navigate(`/bookings?templeId=${temple.id}&poojaId=${pooja.id}`)
                  }
                >
                  {tr.profile.book}
                </Button>
              ) : (
                <span className="text-xs text-[#6B7280] italic">{tr.profile.walkinOnly}</span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── Tab: Services ────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<TempleService['category'], string> = {
  Ritual:     'bg-violet-50 text-primary border-primary/20',
  Charitable: 'bg-green-50 text-success border-success/20',
  Offering:   'bg-amber-50 text-warning border-amber-200',
}

function ServicesTab({ temple }: { temple: Temple }) {
  const navigate  = useNavigate()
  const { lang } = useLang()
  const tr = T[lang]
  const [booked, setBooked] = useState<Set<string>>(new Set())

  function handleBook(serviceId: string) {
    // Navigate to bookings with the service pre-selected or show success
    setBooked((prev) => new Set(prev).add(serviceId))
    setTimeout(() => {
      navigate(`/bookings?templeId=${temple.id}&serviceId=${serviceId}`)
    }, 500)
  }

  const categories: TempleService['category'][] = ['Ritual', 'Offering', 'Charitable']
  const CAT_LABELS: Record<TempleService['category'], string> = {
    Ritual:     tr.profile.categoryRitual,
    Offering:   tr.profile.categoryOffering,
    Charitable: tr.profile.categoryCharitable,
  }

  return (
    <div className="p-4 space-y-6">
      {/* Intro */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-light-violet border border-primary/10">
        <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-[#6B7280] leading-relaxed">
          {tr.profile.servicesIntro}
        </p>
      </div>

      {categories.map((cat) => {
        const items = TEMPLE_SERVICES.filter((s) => s.category === cat)
        return (
          <section key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_COLORS[cat]}`}>
                {CAT_LABELS[cat]}
              </span>
            </div>
            <div className="space-y-3">
              {items.map((service) => {
                const isBooked = booked.has(service.id)
                return (
                  <motion.div
                    key={service.id}
                    layout
                    className="bg-surface rounded-xl border border-[#ECECEC] shadow-soft overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-light-violet flex items-center justify-center shrink-0">
                          {service.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-[#111827]">{lang === 'ta' ? (service.nameTa || service.name) : service.name}</h3>
                            <span className="text-xs text-[#6B7280]">{lang === 'ta' ? service.name : service.nameTa}</span>
                          </div>
                          <p className="text-sm text-[#6B7280] mt-1.5 leading-snug">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280]">
                            {service.duration !== '-' && (
                              <span className="flex items-center gap-1">
                                <Timer size={11} className="text-primary" />
                                {service.duration}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Building2 size={11} className="text-primary" />
                              {tr.profile.atTemple}
                            </span>
                          </div>
                        </div>

                        {/* Price + CTA */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-base font-bold text-primary">
                            ₹{service.price.toLocaleString('en-IN')}
                          </span>
                          {service.isBookable ? (
                            <Button
                              size="sm"
                              variant={isBooked ? 'secondary' : 'primary'}
                              icon={isBooked ? <CheckCircle2 size={12} /> : undefined}
                              onClick={() => !isBooked && handleBook(service.id)}
                              disabled={isBooked}
                            >
                              {isBooked ? tr.profile.booked : tr.profile.book}
                            </Button>
                          ) : (
                            <span className="text-xs text-[#6B7280] italic">{tr.profile.walkin}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ─── Tab: Donations ───────────────────────────────────────────────────────────

const DONATION_PRESETS = [100, 500, 1001, 5001] as const
const DONATION_PURPOSES = ['Annadanam', 'Renovation', 'General', 'Festival', 'Lamp Oil'] as const

function DonationsTab({ temple }: { temple: Temple }) {
  const { lang } = useLang()
  const tr = T[lang]
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null)
  const [customAmount, setCustomAmount]     = useState('')
  const [isCustom, setIsCustom]             = useState(false)
  const [purpose, setPurpose]               = useState('General')
  const [isAnonymous, setIsAnonymous]       = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [success, setSuccess]               = useState(false)
  const [receiptNo, setReceiptNo]           = useState('')

  const effectiveAmount = isCustom
    ? (parseInt(customAmount, 10) || 0)
    : (selectedPreset ?? 0)

  async function handleDonate() {
    if (effectiveAmount <= 0) return
    setSubmitting(true)
    try {
      const donation = await donationApi.create({
        templeId: temple.id,
        amount: effectiveAmount,
        purpose,
        isAnonymous,
      })
      setReceiptNo(donation.receiptNumber)
      setSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setSuccess(false)
    setSelectedPreset(null)
    setCustomAmount('')
    setIsCustom(false)
    setPurpose('General')
    setIsAnonymous(false)
    setReceiptNo('')
  }

  if (success) {
    return (
      <div className="p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h3 className="font-semibold text-[#111827] text-lg mb-1">{tr.profile.donationSuccess}</h3>
            <p className="text-sm text-[#6B7280] mb-1">
              Your contribution of{' '}
              <strong className="text-[#111827]">{formatCurrency(effectiveAmount)}</strong>{' '}
              towards <strong className="text-[#111827]">{purpose}</strong> has been received.
            </p>
            {receiptNo && (
              <p className="text-xs text-[#6B7280] mb-5">{tr.profile.receipt}: <span className="font-mono text-primary">{receiptNo}</span></p>
            )}
            <Button variant="secondary" onClick={reset}>
              {tr.profile.donateAgain}
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card>
        <h2 className="font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <IndianRupee size={16} className="text-primary shrink-0" />
          {tr.profile.donateNow}
        </h2>

        {/* Preset amounts */}
        <div className="mb-4">
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">
            {tr.profile.selectAmount}
          </p>
          <div className="flex flex-wrap gap-2">
            {DONATION_PRESETS.map((amount) => (
              <button
                key={amount}
                onClick={() => { setSelectedPreset(amount); setIsCustom(false) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  !isCustom && selectedPreset === amount
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-white text-[#111827] border-[#ECECEC] hover:border-primary hover:text-primary'
                }`}
              >
                ₹{amount.toLocaleString('en-IN')}
              </button>
            ))}
            <button
              onClick={() => { setIsCustom(true); setSelectedPreset(null) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                isCustom
                  ? 'bg-primary text-white border-primary shadow-soft'
                  : 'bg-white text-[#111827] border-[#ECECEC] hover:border-primary hover:text-primary'
              }`}
            >
              {tr.profile.customAmount}
            </button>
          </div>
        </div>

        {/* Custom amount input */}
        <AnimatePresence>
          {isCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <Input
                label={tr.profile.enterAmount}
                type="number"
                min={1}
                placeholder="e.g. 2500"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                prefix={<span className="text-sm font-medium">₹</span>}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Purpose */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#111827] mb-1.5">{tr.profile.purpose}</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-[#ECECEC] bg-white text-sm text-[#111827] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
          >
            {DONATION_PURPOSES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-2.5 mb-5 cursor-pointer select-none">
          <div
            onClick={() => setIsAnonymous((v) => !v)}
            className={`relative w-10 h-5.5 h-[22px] rounded-full transition-colors duration-200 ${
              isAnonymous ? 'bg-primary' : 'bg-[#ECECEC]'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200 ${
                isAnonymous ? 'translate-x-[18px]' : 'translate-x-0'
              }`}
            />
          </div>
          <span className="text-sm text-[#6B7280]">{tr.profile.donateAnonymously}</span>
        </label>

        {/* Summary */}
        <AnimatePresence>
          {effectiveAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-3 rounded-lg bg-light-violet text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">{tr.profile.summaryAmount}</span>
                  <span className="font-semibold text-[#111827]">{formatCurrency(effectiveAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">{tr.profile.purpose}</span>
                  <span className="font-semibold text-[#111827]">{purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">{tr.profile.summaryAnonymous}</span>
                  <span className="font-semibold text-[#111827]">{isAnonymous ? tr.common.yes : tr.common.no}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={submitting}
          disabled={effectiveAmount <= 0}
          onClick={handleDonate}
        >
          {effectiveAmount > 0
            ? `${tr.profile.donate} ${formatCurrency(effectiveAmount)}`
            : 'Select an Amount'}
        </Button>
      </Card>
    </div>
  )
}

// ─── Tab: Renovation ──────────────────────────────────────────────────────────

function RenovationTab({ projects }: { projects: RenovationProject[] }) {
  const { lang } = useLang()
  const tr = T[lang]
  const STATUS_LABELS: Record<string, string> = {
    active:    tr.profile.statusActive,
    completed: tr.profile.statusCompleted,
    planned:   tr.profile.statusPlanned,
  }
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-light-violet flex items-center justify-center mb-4">
          <Hammer size={28} className="text-primary" />
        </div>
        <h3 className="font-semibold text-[#111827] mb-1">{tr.profile.noRenovation}</h3>
        <p className="text-sm text-[#6B7280]">
          {tr.profile.noRenovationMsg}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {projects.map((project) => (
        <Card key={project.id}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-[#111827] leading-snug">{project.title}</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {project.startDate} → {project.expectedEnd}
              </p>
            </div>
            <Badge
              variant={
                project.status === 'active'    ? 'success'
                : project.status === 'completed' ? 'primary'
                : 'ghost'
              }
              size="sm"
            >
              {STATUS_LABELS[project.status] ?? project.status}
            </Badge>
          </div>

          <p className="text-sm text-[#6B7280] mb-4 leading-relaxed">{project.description}</p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#6B7280] mb-1.5">
              <span>
                {tr.profile.raisedOf}:{' '}
                <span className="font-medium text-[#111827]">
                  {formatCurrency(project.raisedAmount)}
                </span>
              </span>
              <span>
                {tr.profile.target}:{' '}
                <span className="font-medium text-[#111827]">
                  {formatCurrency(project.targetAmount)}
                </span>
              </span>
            </div>
            <ProgressBar value={project.progress} color="primary" showLabel />
          </div>

          {/* Milestones */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
              {tr.profile.milestones}
            </h4>
            <div className="space-y-2">
              {project.milestones.map((m) => (
                <div key={m.id} className="flex items-start gap-2">
                  {m.isCompleted ? (
                    <CheckCircle2 size={15} className="text-success shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-[15px] h-[15px] mt-0.5 rounded-full border-2 border-[#ECECEC] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${m.isCompleted ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
                      {m.title}
                    </span>
                    {m.completedAt && (
                      <p className="text-xs text-[#6B7280] mt-0.5">{m.completedAt}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsors */}
          {project.sponsors.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                {tr.profile.sponsors}
              </h4>
              <div className="space-y-2">
                {project.sponsors.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className={s.isAnonymous ? 'text-[#6B7280] italic' : 'text-[#111827]'}>
                      {s.isAnonymous ? tr.profile.anonymousDonor : s.name}
                    </span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(s.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

// ─── Tab: Heritage ────────────────────────────────────────────────────────────

function HeritageTab({ temple }: { temple: Temple }) {
  const { lang } = useLang()
  const tr = T[lang]
  const { heritage } = temple
  const exploreItems = [
    {
      key:       'audio',
      label:     tr.profile.audioGuide,
      desc:      tr.profile.audioGuideDesc,
      icon:      <Volume2 size={20} className="text-primary" />,
      available: heritage.hasAudioGuide,
    },
    {
      key:       '360',
      label:     tr.profile.tour360,
      desc:      tr.profile.tour360Desc,
      icon:      <RotateCcw size={20} className="text-primary" />,
      available: heritage.has360Tour,
    },
    {
      key:       'drone',
      label:     tr.profile.droneView,
      desc:      tr.profile.droneViewDesc,
      icon:      <Camera size={20} className="text-primary" />,
      available: heritage.hasDroneGallery,
    },
  ]

  return (
    <div className="p-4 space-y-6">
      {/* Architecture */}
      <section>
        <h2 className="text-sm font-semibold text-[#111827] mb-2">{tr.profile.architecture}</h2>
        <p className="text-sm text-[#6B7280] leading-relaxed">{heritage.architecture}</p>
      </section>

      {/* Inscriptions */}
      {heritage.inscriptions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#111827] mb-2">{tr.profile.inscriptions}</h2>
          <ul className="space-y-2">
            {heritage.inscriptions.map((ins, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#6B7280]">
                <ChevronRight size={14} className="text-primary shrink-0 mt-0.5" />
                {ins}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Murals */}
      {heritage.murals && (
        <section>
          <h2 className="text-sm font-semibold text-[#111827] mb-2">{tr.profile.murals}</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">{heritage.murals}</p>
        </section>
      )}

      {/* Sculptures */}
      {heritage.sculptures && (
        <section>
          <h2 className="text-sm font-semibold text-[#111827] mb-2">{tr.profile.sculptures}</h2>
          <p className="text-sm text-[#6B7280] leading-relaxed">{heritage.sculptures}</p>
        </section>
      )}

      {/* Explore CTA cards */}
      <section>
        <h2 className="text-sm font-semibold text-[#111827] mb-3">{tr.profile.exploreDigitally}</h2>
        <div className="space-y-3">
          {exploreItems.map((item) => (
            <motion.div
              key={item.key}
              whileHover={item.available ? { y: -1, boxShadow: '0 8px 24px rgba(124,108,242,0.10)' } : {}}
              transition={{ duration: 0.15 }}
              className={`flex items-center gap-3 p-4 rounded-xl border border-[#ECECEC] bg-white transition-colors ${
                item.available
                  ? 'cursor-pointer hover:bg-light-violet'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-light-violet flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{item.label}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {item.available ? item.desc : tr.profile.comingSoon}
                </p>
              </div>
              <Badge variant={item.available ? 'success' : 'ghost'} size="sm">
                {item.available ? tr.profile.available : tr.profile.soon}
              </Badge>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Tab: Nearby ──────────────────────────────────────────────────────────────

function NearbyTab({ temple }: { temple: Temple }) {
  const navigate = useNavigate()
  const { lang } = useLang()
  const tr = T[lang]
  const nearby   = MOCK_TEMPLES.filter((t) => t.id !== temple.id).slice(0, 3)

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={15} className="text-primary" />
        <h2 className="text-sm font-semibold text-[#111827]">{tr.profile.nearbyTitle}</h2>
      </div>
      {nearby.map((t) => (
        <TempleCard
          key={t.id}
          temple={t}
          variant="compact"
          onClick={() => navigate(`/temple/${t.id}`)}
        />
      ))}
    </div>
  )
}

// ─── Skeleton loading ─────────────────────────────────────────────────────────

function TempleProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="animate-pulse bg-[#ECECEC] h-64 md:h-80 w-full" />

      {/* Detail bar skeleton */}
      <div className="bg-white px-4 py-4 border-b border-[#ECECEC] space-y-3">
        <div className="flex items-center gap-3">
          <div className="animate-pulse bg-[#ECECEC] h-4 w-32 rounded-sm" />
          <div className="animate-pulse bg-[#ECECEC] h-5 w-20 rounded-full" />
          <div className="animate-pulse bg-[#ECECEC] h-5 w-16 rounded-full" />
        </div>
        <div className="animate-pulse bg-[#ECECEC] h-4 w-44 rounded-sm" />
        <div className="flex gap-2 pt-1">
          {[84, 92, 72, 80, 64].map((w, i) => (
            <div
              key={i}
              className="animate-pulse bg-[#ECECEC] h-8 rounded-lg shrink-0"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="bg-white border-b border-[#ECECEC] px-4 py-2.5 flex gap-5 overflow-hidden">
        {[56, 48, 52, 52, 44, 58, 60, 68, 52, 44].map((w, i) => (
          <div
            key={i}
            className="animate-pulse bg-[#ECECEC] h-3.5 rounded-sm shrink-0"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="px-4 pt-6 space-y-4">
        <Skeleton count={3} />
        <div className="grid grid-cols-2 gap-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TempleProfile() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lang } = useLang()
  const tr = T[lang]

  const TABS = [
    { label: tr.profile.tabOverview,   value: 'overview'   },
    { label: tr.profile.tabHistory,    value: 'history'    },
    { label: tr.profile.tabGallery,    value: 'gallery'    },
    { label: tr.profile.tabTimings,    value: 'timings'    },
    { label: tr.profile.tabPoojas,     value: 'poojas'     },
    { label: tr.profile.tabServices,   value: 'services'   },
    { label: tr.profile.tabDonations,  value: 'donations'  },
    { label: tr.profile.tabRenovation, value: 'renovation' },
    { label: tr.profile.tabHeritage,   value: 'heritage'   },
    { label: tr.profile.tabNearby,     value: 'nearby'     },
  ]

  const [temple, setTemple]                         = useState<Temple | null>(null)
  const [loading, setLoading]                       = useState(true)
  const [activeTab, setActiveTab]                   = useState('overview')
  const [isFollowed, setIsFollowed]                 = useState(false)
  const [isFavorite, setIsFavorite]                 = useState(false)
  const [renovationProjects, setRenovationProjects] = useState<RenovationProject[]>([])
  const [followLoading, setFollowLoading]           = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setActiveTab('overview')
    Promise.all([templeApi.get(id), renovationApi.list()])
      .then(([templeData, allRenovations]) => {
        setTemple(templeData)
        setIsFollowed(templeData.isFollowed ?? false)
        setIsFavorite(templeData.isFavorite ?? false)
        setRenovationProjects(allRenovations.filter((r) => r.templeId === id))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  // Optimistic follow toggle
  async function handleFollow() {
    if (!temple || followLoading) return
    // Optimistic update
    setIsFollowed((v) => !v)
    setFollowLoading(true)
    try {
      if (isFollowed) {
        await templeApi.unfollow(temple.id)
      } else {
        await templeApi.follow(temple.id)
      }
    } catch {
      // Revert on error
      setIsFollowed((v) => !v)
    } finally {
      setFollowLoading(false)
    }
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share && temple) {
      navigator.share({ title: temple.name, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).catch(() => {})
    }
  }

  function handleNavigate() {
    if (!temple) return
    const { lat, lng } = temple.location
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank', 'noopener,noreferrer')
  }

  function renderTabContent() {
    if (!temple) return null
    switch (activeTab) {
      case 'overview':   return <OverviewTab   temple={temple} />
      case 'history':    return <HistoryTab    temple={temple} />
      case 'gallery':    return <GalleryTab    temple={temple} />
      case 'timings':    return <TimingsTab    temple={temple} />
      case 'poojas':     return <PoojasTab     temple={temple} />
      case 'services':   return <ServicesTab   temple={temple} />
      case 'donations':  return <DonationsTab  temple={temple} />
      case 'renovation': return <RenovationTab projects={renovationProjects} />
      case 'heritage':   return <HeritageTab   temple={temple} />
      case 'nearby':     return <NearbyTab     temple={temple} />
      default:           return null
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return <TempleProfileSkeleton />

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!temple) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-danger" />
        </div>
        <h2 className="font-semibold text-[#111827] text-lg mb-2">{tr.profile.notFound}</h2>
        <p className="text-sm text-[#6B7280] mb-5">
          {tr.profile.notFoundMsg}
        </p>
        <Button variant="primary" onClick={() => navigate(-1)}>{tr.common.goBack}</Button>
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* ─────────────── HERO ─────────────────────────────────────────────── */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={temple.coverImage}
          alt={temple.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1621378527534-68e15c3e3e28?w=800&q=80'
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        {/* Top nav controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <button
              aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              onClick={() => setIsFavorite((v) => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
            >
              <Heart
                size={18}
                className={isFavorite ? 'fill-red-400 text-red-400' : ''}
              />
            </button>
            <button
              aria-label="Share temple"
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Temple info — anchored to hero bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-12">
          <h1 className="text-white font-bold text-2xl md:text-3xl leading-tight drop-shadow">
            {lang === 'ta' ? (temple.nameTa || temple.name) : temple.name}
          </h1>
          <p className="text-white/80 text-sm mt-0.5">{lang === 'ta' ? (temple.deityTa || temple.deity) : temple.deity}</p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/40 text-white text-xs font-medium">
              {temple.dynasty}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/40 text-white text-xs font-medium">
              {temple.yearBuilt}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/40 text-white text-xs font-medium">
              {temple.architecturalStyle}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────── DETAIL BAR ───────────────────────────────────────── */}
      <div className="bg-white px-4 py-4 border-b border-[#ECECEC]">

        {/* Row 1: Rating | Crowd | Open/Closed */}
        <div className="flex items-center gap-3 flex-wrap">
          <StarRating rating={temple.rating} reviewCount={temple.reviewCount} size="sm" />

          <Badge variant={crowdBadgeVariant(temple.crowdLevel)} size="sm">
            <Users size={10} className="mr-1 inline" />
            {temple.crowdLevel === 'Low' ? tr.card.quiet : temple.crowdLevel === 'Moderate' ? tr.card.moderate : tr.card.busy} {tr.profile.crowd}
          </Badge>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              temple.isOpen ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${temple.isOpen ? 'bg-success animate-pulse' : 'bg-danger'}`}
            />
            {temple.isOpen ? tr.common.open : tr.common.closed}
          </span>
        </div>

        {/* Row 2: Location + distance */}
        <div className="flex items-center gap-1.5 mt-2.5 text-sm text-[#6B7280]">
          <MapPin size={13} className="text-primary shrink-0" />
          <span>{temple.city}, {lang === 'ta' ? (temple.districtTa || temple.district) : temple.district}, {tr.common.tamilNadu}</span>
          {temple.distanceKm !== undefined && temple.distanceKm > 0 && (
            <>
              <span className="text-[#ECECEC] select-none mx-0.5">·</span>
              <Navigation size={12} className="shrink-0" />
              <span>{temple.distanceKm.toFixed(1)} {tr.profile.nearbyKm}</span>
            </>
          )}
        </div>

        {/* Row 3: Action buttons — horizontal scroll on mobile */}
        <div
          className="flex gap-2 mt-3 overflow-x-auto md:flex-wrap -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none' }}
        >
          <Button
            variant={isFollowed ? 'primary' : 'secondary'}
            size="sm"
            icon={<Bookmark size={13} />}
            loading={followLoading}
            onClick={handleFollow}
            className="shrink-0"
          >
            {isFollowed ? tr.profile.following : tr.profile.follow}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('poojas')}
            className="shrink-0"
          >
            {tr.profile.bookPooja}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<IndianRupee size={13} />}
            onClick={() => setActiveTab('donations')}
            className="shrink-0"
          >
            {tr.profile.donate}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<Navigation size={13} />}
            onClick={handleNavigate}
            className="shrink-0"
          >
            {tr.profile.directions}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<Share2 size={13} />}
            onClick={handleShare}
            className="shrink-0"
          >
            {tr.profile.share}
          </Button>
        </div>
      </div>

      {/* ─────────────── STICKY TABS ──────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white shadow-soft">
        <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />
      </div>

      {/* ─────────────── TAB CONTENT ──────────────────────────────────────── */}
      <div className="pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
