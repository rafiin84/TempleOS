import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Star, MapPin, Heart, Route, Trophy, ChevronRight } from 'lucide-react'
import { userApi } from '@/services/mock/api'
import type { User } from '@/types'
import { ProgressBar, Badge, Button } from '@/components/ui'

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function formatStampDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  })
}

function formatCurrency(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

/* ─── Collection Card ─────────────────────────────────────────────────────────── */
interface CollectionCardProps {
  title: string
  total: number
  completed: number
  emoji: string
}

function CollectionCard({ title, total, completed, emoji }: CollectionCardProps) {
  const pct = Math.round((completed / total) * 100)
  return (
    <Link to="/explore">
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(124,108,242,0.12)' }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-xl shadow-soft border border-[#ECECEC] p-4 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <div>
              <p className="text-sm font-semibold text-[#111827] leading-tight">{title}</p>
              <p className="text-xs text-[#6B7280]">{total} temples</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#6B7280]" />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-primary">{completed}</span>
          <span className="text-xs text-[#6B7280]">/ {total}</span>
          <span className="ml-auto text-xs font-medium text-[#6B7280]">{pct}%</span>
        </div>
        <ProgressBar value={pct} color="primary" />
      </motion.div>
    </Link>
  )
}

/* ─── Achievement Badge ───────────────────────────────────────────────────────── */
interface AchievementProps {
  icon: string
  label: string
  description: string
  unlocked: boolean
}

function Achievement({ icon, label, description, unlocked }: AchievementProps) {
  return (
    <div
      className={[
        'relative rounded-xl p-4 border text-center transition-all',
        unlocked
          ? 'bg-white border-primary/20 shadow-soft'
          : 'bg-[#FAFAFC] border-[#ECECEC] opacity-60 grayscale',
      ].join(' ')}
    >
      {!unlocked && (
        <div className="absolute top-2 right-2">
          <Lock size={12} className="text-[#6B7280]" />
        </div>
      )}
      <div
        className={[
          'w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-2',
          unlocked ? 'bg-light-violet' : 'bg-[#ECECEC]',
        ].join(' ')}
      >
        {icon}
      </div>
      <p className="text-xs font-bold text-[#111827] mb-0.5">{label}</p>
      <p className="text-[10px] text-[#6B7280] leading-snug">{description}</p>
    </div>
  )
}

/* ─── Stamp Circle ───────────────────────────────────────────────────────────── */
interface StampProps {
  src?: string
  name: string
  date?: string
  visited: boolean
}

function Stamp({ src, name, date, visited }: StampProps) {
  const [imgErr, setImgErr] = useState(false)

  if (!visited) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#ECECEC] flex items-center justify-center bg-[#FAFAFC]">
          <span className="text-[#ECECEC] text-lg font-bold">?</span>
        </div>
        <p className="text-[9px] text-[#ECECEC] text-center">Unvisited</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-14 h-14 rounded-full border-2 border-primary p-0.5 shadow-soft">
        {src && !imgErr ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full rounded-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full rounded-full bg-light-violet flex items-center justify-center">
            <span className="text-base">🛕</span>
          </div>
        )}
      </div>
      {date && (
        <p className="text-[9px] text-[#6B7280] text-center leading-tight">{date}</p>
      )}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function TemplePassport() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userApi.getMe().then(u => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const totalDonated = user?.donations.reduce((s, d) => s + d.amount, 0) ?? 0
  const visitCount = user?.passportEntries.length ?? 0

  const COLLECTIONS = [
    { title: 'Navagraha',              total: 9,   completed: 0, emoji: '🪐' },
    { title: 'Arupadai Veedu',         total: 6,   completed: 1, emoji: '🕉️' },
    { title: 'Divya Desam',            total: 108, completed: 1, emoji: '🌸' },
    { title: 'Padal Petra Sthalam',    total: 276, completed: 3, emoji: '📜' },
  ]

  const ACHIEVEMENTS: AchievementProps[] = [
    { icon: '🏛️', label: 'First Step',      description: 'Visited first temple',    unlocked: visitCount >= 1 },
    { icon: '⭐', label: 'Explorer',         description: '5 temples visited',       unlocked: visitCount >= 5 },
    { icon: '🕉️', label: 'Devotee',          description: '10 temples visited',      unlocked: visitCount >= 10 },
    { icon: '💰', label: 'Generous Soul',    description: 'Made a donation',         unlocked: totalDonated > 0 },
    { icon: '🗺️', label: 'Pilgrim',          description: 'Started a route',         unlocked: true },
    { icon: '🏆', label: 'Master Devotee',   description: '50 temples visited',      unlocked: visitCount >= 50 },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
          <div className="h-48 bg-[#ECECEC] rounded-xl" />
          <div className="h-8 bg-[#ECECEC] rounded-sm w-1/3" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#ECECEC] rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* ── Passport Cover ── */}
      <div className="relative bg-gradient-to-br from-[#7C6CF2] to-[#5B3FD4] text-white py-12 px-6">
        {/* Double-border passport decoration */}
        <div className="absolute inset-4 border border-white/20 rounded-xl pointer-events-none" />
        <div className="absolute inset-6 border border-white/10 rounded-xl pointer-events-none" />

        <div className="relative max-w-lg mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60 font-medium mb-4">
            Tamil Nadu Temple Passport
          </p>
          <h1 className="text-3xl font-black mb-1">{user?.name}</h1>
          {user?.nameTa && (
            <p className="text-base text-white/70 font-medium mb-1">{user.nameTa}</p>
          )}
          <p className="text-xs text-white/50 mb-8">Official HR&amp;CE Devotee Passport</p>

          {/* Stats */}
          <div className="flex gap-6 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-black">{visitCount}</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wider">Temples</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black">0</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wider">Routes</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black">{formatCurrency(totalDonated)}</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wider">Donated</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-10">
        {/* ── Collections ── */}
        <section>
          <h2 className="text-base font-bold text-[#111827] mb-4">Your Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COLLECTIONS.map(c => (
              <CollectionCard key={c.title} {...c} />
            ))}
          </div>
        </section>

        {/* ── Temple Stamps ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#111827]">
              Your Stamps
              <span className="ml-2 text-sm font-normal text-[#6B7280]">
                ({visitCount} temples visited)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {/* Visited stamps */}
            {user?.passportEntries.map(entry => (
              <Stamp
                key={entry.templeId}
                src={entry.templeImage}
                name={entry.templeName}
                date={formatStampDate(entry.visitedAt)}
                visited
              />
            ))}
            {/* Placeholder unvisited slots */}
            {[...Array(20)].map((_, i) => (
              <Stamp key={`placeholder-${i}`} name="" visited={false} />
            ))}
          </div>
        </section>

        {/* ── Achievements ── */}
        <section>
          <h2 className="text-base font-bold text-[#111827] mb-4">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map(a => (
              <Achievement key={a.label} {...a} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
