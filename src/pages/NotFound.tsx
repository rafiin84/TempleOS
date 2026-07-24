import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

/* ── Lotus SVG ─────────────────────────────────────────────────────────────── */
function Lotus({ size = 56 }: { size?: number }) {
  const c = size / 2

  // Outer ring: 8 petals at 0°, 45°, … 315° — long, low-opacity
  const outerAngles = [0, 45, 90, 135, 180, 225, 270, 315]
  // Inner ring: 6 petals at 0°, 60°, … 300° — shorter, higher-opacity
  const innerAngles = [0, 60, 120, 180, 240, 300]

  // Each petal is an ellipse whose center sits above the SVG center (cx, cy - offset).
  // Rotating around (c, c) fans petals outward like a mandala.
  const outerCy   = c * 0.62           // unrotated center of outer petal
  const outerRy   = c * 0.38           // outer petal half-height  → tip ≈ 76% of radius out
  const outerRx   = c * 0.065          // outer petal half-width

  const innerCy   = c * 0.72           // unrotated center of inner petal
  const innerRy   = c * 0.28           // inner petal half-height  → tip ≈ 56% of radius out
  const innerRx   = c * 0.10           // inner petal half-width

  const centerR   = c * 0.17

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
    >
      {/* Outer petals */}
      {outerAngles.map((deg) => (
        <ellipse
          key={`o${deg}`}
          cx={c}
          cy={outerCy}
          rx={outerRx}
          ry={outerRy}
          fill="currentColor"
          opacity="0.22"
          transform={`rotate(${deg} ${c} ${c})`}
        />
      ))}

      {/* Inner petals */}
      {innerAngles.map((deg) => (
        <ellipse
          key={`i${deg}`}
          cx={c}
          cy={innerCy}
          rx={innerRx}
          ry={innerRy}
          fill="currentColor"
          opacity="0.6"
          transform={`rotate(${deg} ${c} ${c})`}
        />
      ))}

      {/* Centre */}
      <circle cx={c} cy={c} r={centerR} fill="currentColor" />
    </svg>
  )
}

/* ── Animation variants ────────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
})

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-16 bg-gradient-to-b from-[#F5F3FF] via-[#FAFAFC] to-white">

      {/* ── Background blobs ─────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-[#EDE9FE]/60 blur-3xl"
        aria-hidden="true"
      />

      {/* ── Lotus icon ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 relative"
      >
        {/* Glow halo */}
        <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl scale-[1.6]" />

        {/* Icon container */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/20 bg-light-violet shadow-soft">
          <motion.div
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="text-primary"
          >
            <Lotus size={58} />
          </motion.div>
        </div>
      </motion.div>

      {/* ── 404 digits (staggered) ───────────────────────────────────────── */}
      <div className="flex items-center leading-none select-none" aria-label="404">
        {['4', '0', '4'].map((digit, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[6.5rem] font-black tracking-tight text-primary md:text-[8.5rem]"
          >
            {digit}
          </motion.span>
        ))}
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.42 }}
        className="mt-2 mb-7 h-px w-14 origin-center rounded-full bg-primary/30"
      />

      {/* ── Heading ──────────────────────────────────────────────────────── */}
      <motion.h1
        {...fadeUp(0.52)}
        className="text-center text-xl font-bold text-[#111827]"
      >
        This temple path leads nowhere
      </motion.h1>

      {/* ── Tamil subtitle ────────────────────────────────────────────────── */}
      <motion.p
        {...fadeUp(0.62)}
        className="mt-2 text-center text-base font-medium text-primary/75"
        lang="ta"
      >
        இந்த பாதை தவறானது
      </motion.p>

      {/* ── Description ──────────────────────────────────────────────────── */}
      <motion.p
        {...fadeUp(0.70)}
        className="mt-3 max-w-[22rem] text-center text-sm leading-relaxed text-[#6B7280]"
      >
        The sanctum you seek does not exist here. It may have been moved or was never consecrated.
      </motion.p>

      {/* ── Buttons ──────────────────────────────────────────────────────── */}
      <motion.div
        {...fadeUp(0.80)}
        className="mt-9 flex flex-wrap justify-center gap-3"
      >
        <Button
          variant="primary"
          size="md"
          icon={<Home size={16} />}
          iconPosition="left"
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
        <Button
          variant="ghost"
          size="md"
          icon={<ArrowLeft size={16} />}
          iconPosition="left"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </motion.div>

      {/* ── Decorative dot row ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="mt-16 flex items-center gap-2"
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            className={`rounded-full bg-primary/25 ${i === 2 ? 'h-2 w-2' : 'h-1.5 w-1.5'}`}
            animate={{
              opacity: [0.25, i === 2 ? 0.75 : 0.55, 0.25],
              scale:   i === 2 ? [1, 1.35, 1] : 1,
            }}
            transition={{ duration: 2.2, delay: i * 0.28, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

    </div>
  )
}
