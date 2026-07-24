import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';

/**
 * PublicLayout
 * - Desktop: sticky Header at top, full-width content, no bottom bar
 * - Mobile:  no header, scrollable content, fixed MobileNav at bottom
 *
 * Children receive pb-16 on mobile so content isn't hidden behind the nav bar.
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky desktop header — self-hides below md breakpoint */}
      <Header />

      {/* Page content — grows to fill remaining height */}
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Fixed mobile bottom navigation — self-hides at md breakpoint */}
      <MobileNav />
    </div>
  );
}
