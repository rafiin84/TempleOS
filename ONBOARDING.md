# TempleOS — Tamil Nadu HR&CE Digital Temple Platform

## What is this?

TempleOS is the official digital platform connecting devotees, temples, pilgrimage routes, and HR&CE administrators across Tamil Nadu. Think Apple meets Airbnb, built for 38,407 temples.

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # production build
```

> **Node requirement:** Node ≥ 22.12 for production builds (Vite 5 dev server works on any Node 22+)

## Tech Stack

| Layer | Library |
|---|---|
| UI | React 19 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS v3 (custom design system) |
| Routing | React Router v7 |
| Data fetching | TanStack Query |
| Animations | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |

## Project Structure

```
src/
├── types/index.ts          # All TypeScript interfaces
├── services/mock/
│   ├── data.ts             # Rich mock data (5 temples, festivals, bookings, etc.)
│   └── api.ts              # Service layer — swap with real Zoho Catalyst APIs here
├── components/
│   ├── ui/                 # Button, Card, Input, Badge, Avatar, Skeleton, Tabs, StarRating, ProgressBar
│   ├── temple/             # TempleCard, FeedCard, BookingCard, QRCard, PassportEntry
│   └── layout/             # Header, MobileNav, AdminSidebar
├── layouts/
│   ├── PublicLayout.tsx    # Header + main + MobileNav
│   └── AdminLayout.tsx     # AdminSidebar + content
└── pages/
    ├── Home.tsx            # Hero, featured temples, districts, routes, stats
    ├── Explore.tsx         # Search + filters + grid/list + AI Ask
    ├── TempleProfile.tsx   # 9-tab deep-dive (Overview → Nearby)
    ├── Updates.tsx         # Official feed, max 550px, no UGC
    ├── Booking.tsx         # 8-step booking → QR ticket
    ├── MyTemple.tsx        # Devotee dashboard (bookings, passport, donations)
    ├── TemplePassport.tsx  # Collections, stamps, achievements
    └── Admin/
        ├── Dashboard.tsx   # KPI cards, activity tables, charts
        ├── Temples.tsx     # Temple management table
        └── Analytics.tsx   # Period-aware analytics
```

## Design System

```
Primary:    #7C6CF2   (bg-primary, text-primary)
Background: #FAFAFC   (bg-background)
Surface:    #FFFFFF   (bg-surface)
Light violet: #F5F3FF (bg-light-violet)
Text:       #111827
Muted:      #6B7280
Border:     #ECECEC
Success:    #16A34A   Warning: #F59E0B   Danger: #DC2626

Font: Inter
Spacing: 8pt system
Radius: sm=8px  md=12px  lg=16px  xl=24px
Shadow: shadow-soft  shadow-card  shadow-elevated
```

## Routes

| URL | Page |
|---|---|
| `/` | Home |
| `/explore` | Explore (search + filter) |
| `/temple/:id` | Temple Profile |
| `/updates` | Updates Feed |
| `/bookings` | Booking Flow |
| `/my-temple` | My Temple (devotee) |
| `/passport` | Temple Passport |
| `/admin` | Admin Dashboard |
| `/admin/temples` | Temple Management |
| `/admin/analytics` | Analytics |

## Adding Real APIs

All data flows through `src/services/mock/api.ts`. Replace any function there with a real Zoho Catalyst call — the UI never imports from `data.ts` directly.

```ts
// Before (mock)
export const templeApi = {
  async list() {
    await delay()
    return paginate(MOCK_TEMPLES)
  }
}

// After (Catalyst)
export const templeApi = {
  async list(params) {
    const res = await catalystApp.zcql().executeQuery(`SELECT * FROM Temple`)
    return res.data
  }
}
```

## Key Conventions

- Path alias `@/` → `src/` (configured in `vite.config.ts` + `tsconfig.app.json`)
- All pages are lazy-loaded via `React.lazy()` in `App.tsx`
- Tamil-first text in mock data (`nameTa`, `descriptionTa`, etc.)
- No comments in code — names are self-documenting
- Mobile-first Tailwind classes (`md:` breakpoint for desktop upgrades)
