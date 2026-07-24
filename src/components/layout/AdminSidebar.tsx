import { NavLink } from 'react-router-dom';
import {
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
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  to: '/admin',              icon: LayoutDashboard, end: true },
  { label: 'Temples',    to: '/admin/temples',       icon: Building2       },
  { label: 'Bookings',   to: '/admin/bookings',      icon: CalendarDays    },
  { label: 'Services',   to: '/admin/services',      icon: Star            },
  { label: 'Donations',  to: '/admin/donations',     icon: Heart           },
  { label: 'Renovation', to: '/admin/renovation',    icon: Hammer          },
  { label: 'Sponsors',   to: '/admin/sponsors',      icon: Handshake       },
  { label: 'Users',      to: '/admin/users',         icon: Users           },
  { label: 'Reports',    to: '/admin/reports',       icon: FileText        },
  { label: 'Analytics',  to: '/admin/analytics',     icon: BarChart3       },
  { label: 'Settings',   to: '/admin/settings',      icon: Settings        },
];

// Placeholder admin user — replace with real auth context
const ADMIN_USER = {
  name: 'Karthik Sundaram',
  role: 'State Admin',
  avatar: undefined as string | undefined,
};

export default function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-60 h-screen fixed left-0 top-0 bg-surface border-r border-[#ECECEC] flex-col z-40">

      {/* Logo */}
      <div className="h-16 border-b border-[#ECECEC] px-5 flex items-center gap-2.5 shrink-0">
        {/* Temple mark */}
        <svg
          width="24"
          height="24"
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
        <span className="font-bold text-base text-[#111827] tracking-tight">
          Temple<span className="text-primary">OS</span>
        </span>
        <Badge variant="primary" size="sm" className="ml-auto shrink-0">
          Admin
        </Badge>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Admin navigation">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
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
      </nav>

      {/* User profile footer */}
      <div className="border-t border-[#ECECEC] p-4 flex items-center gap-3 shrink-0">
        <Avatar
          src={ADMIN_USER.avatar}
          name={ADMIN_USER.name}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#111827] leading-tight truncate">
            {ADMIN_USER.name}
          </p>
          <p className="text-xs text-[#6B7280] leading-tight mt-0.5 truncate">
            {ADMIN_USER.role}
          </p>
        </div>
        <button
          type="button"
          className={cn(
            'shrink-0 p-1.5 rounded-md text-[#6B7280]',
            'hover:text-danger hover:bg-red-50 transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300',
          )}
          aria-label="Log out"
        >
          <LogOut size={15} />
        </button>
      </div>

    </aside>
  );
}
