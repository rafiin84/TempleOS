import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { LanguageProvider } from '@/contexts/LanguageContext'
import { FontSizeProvider } from '@/contexts/FontSizeContext'
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'

const Home = lazy(() => import('@/pages/Home'))
const Explore = lazy(() => import('@/pages/Explore'))
const TempleProfile = lazy(() => import('@/pages/TempleProfile'))
const Updates = lazy(() => import('@/pages/Updates'))
const Booking = lazy(() => import('@/pages/Booking'))
const MyTemple = lazy(() => import('@/pages/MyTemple'))
const TemplePassport = lazy(() => import('@/pages/TemplePassport'))
const AdminDashboard = lazy(() => import('@/pages/Admin/Dashboard'))
const AdminTemples = lazy(() => import('@/pages/Admin/Temples'))
const AdminAnalytics = lazy(() => import('@/pages/Admin/Analytics'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
})

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#6B7280]">Loading…</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FontSizeProvider>
      <LanguageProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/temple/:id" element={<TempleProfile />} />
              <Route path="/updates" element={<Updates />} />
              <Route path="/bookings" element={<Booking />} />
              <Route path="/my-temple" element={<MyTemple />} />
              <Route path="/passport" element={<TemplePassport />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/temples" element={<AdminTemples />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </LanguageProvider>
      </FontSizeProvider>
    </QueryClientProvider>
  )
}
