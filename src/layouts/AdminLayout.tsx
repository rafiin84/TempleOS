import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  CalendarDays,
  Settings,
  Users,
  BarChart3,
  FileText,
  Hammer,
  Heart,
  Star,
  Handshake,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Avatar } from '@/components/ui';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

/* ─────────────────────────────────────────────────────────────
   Shared temple SVG mark (32×32 viewBox, rendered at any size)
───────────────────────────────────────────────────────────── */
function TempleMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="11" y="18" width="10" height="10" rx="1.5" fill="#7C6CF2" />
      <polygon points="16,5 9,18 23,18" fill="#7C6CF2" />
      <polygon points="16,9 11.5,18 20.5,18" fill="#F5F3FF" opacity="0.6" />
      <circle cx="16" cy="4" r="1.5" fill="#7C6CF2" />
      <rect x="14" y="21" width="4" height="7" rx="1" fill="#F5F3FF" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mobile admin top header
───────────────────────────────────────────────────────────── */
function MobileAdminHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="md:hidden sticky top-0 z-30 h-14 bg-surface border-b border-[#ECECEC] px-4 flex items-center gap-3 shrink-0">
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-md text-[#6B7280]',
          'hover:bg-[#FAFAFC] hover:text-[#111827] transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
        )}
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 select-none">
        <TempleMark size={22} />
        <span className="font-bold text-sm text-[#111827] tracking-tight">
          Temple<span className="text-primary">OS</span>
          <span className="ml-1 text-[#6B7280] font-normal">Admin</span>
        </span>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mobile drawer nav (mirrors AdminSidebar items, independently
   rendered so it is not gated by AdminSidebar's md:flex guard)
───────────────────────────────────────────────────────────── */
interface DrawerNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

const DRAWER_NAV: DrawerNavItem[] = [
  { label: 'Dashboard',  to: '/admin',            icon: LayoutDashboard, end: true },
  { label: 'Temples',    to: '/admin/temples',     icon: Building2       },
  { label: 'Bookings',   to: '/admin/bookings',    icon: CalendarDays    },
  { label: 'Services',   to: '/admin/services',    icon: Star            },
  { label: 'Donations',  to: '/admin/donations',   icon: Heart           },
  { label: 'Renovation', to: '/admin/renovation',  icon: Hammer          },
  { label: 'Sponsors',   to: '/admin/sponsors',    icon: Handshake       },
  { label: 'Users',      to: '/admin/users',       icon: Users           },
  { label: 'Reports',    to: '/admin/reports',     icon: FileText        },
  { label: 'Analytics',  to: '/admin/analytics',   icon: BarChart3       },
  { label: 'Settings',   to: '/admin/settings',    icon: Settings        },
];

function MobileDrawerNav() {
  return (
    <nav aria-label="Mobile admin navigation">
      <ul className="flex flex-col gap-0.5">
        {DRAWER_NAV.map(({ label, to, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium',
                  'transition-colors duration-150 select-none',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
                  isActive
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-[#6B7280] hover:bg-[#FAFAFC] hover:text-[#111827]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Admin user strip */}
      <div className="mt-4 pt-4 border-t border-[#ECECEC] px-1 flex items-center gap-3">
        <Avatar name="Karthik Sundaram" size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111827] truncate leading-tight">
            Karthik Sundaram
          </p>
          <p className="text-xs text-[#6B7280] leading-tight">State Admin</p>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────
   AdminLayout
   - Desktop (md+): AdminSidebar fixed left (w-60), content ml-60
   - Mobile (<md):  sticky top header + slide-over drawer
───────────────────────────────────────────────────────────── */
export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-background flex">

      {/* Desktop sidebar — self-hides on mobile via hidden md:flex inside component */}
      <AdminSidebar />

      {/* Mobile slide-over backdrop */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200',
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile slide-over drawer */}
      <div
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-surface shadow-elevated flex flex-col',
          'transition-transform duration-200 ease-in-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
      >
        {/* Drawer header */}
        <div className="h-14 border-b border-[#ECECEC] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 select-none">
            <TempleMark size={22} />
            <span className="font-bold text-sm text-[#111827] tracking-tight">
              Temple<span className="text-primary">OS</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
            className={cn(
              'inline-flex items-center justify-center w-8 h-8 rounded-md text-[#6B7280]',
              'hover:bg-[#FAFAFC] hover:text-[#111827] transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
            )}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer nav body */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <MobileDrawerNav />
        </div>
      </div>

      {/* Main content column */}
      <div className="flex-1 md:ml-60 min-h-screen flex flex-col">
        <MobileAdminHeader onMenuOpen={() => setDrawerOpen(true)} />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
