import { NavLink } from 'react-router-dom';
import { House, Compass, Bell, CalendarDays, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { T } from '@/i18n/translations';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

interface NavItem { to: string; icon: LucideIcon; end?: boolean; key: string }

const NAV_ITEMS: NavItem[] = [
  { key: 'home',      to: '/',          icon: House,        end: true },
  { key: 'explore',   to: '/explore',   icon: Compass                 },
  { key: 'updates',   to: '/updates',   icon: Bell                    },
  { key: 'bookings',  to: '/bookings',  icon: CalendarDays            },
  { key: 'myTemple',  to: '/my-temple', icon: User                    },
];

export default function MobileNav() {
  const { lang } = useLang();
  const tr = T[lang].nav;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-[#ECECEC]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="h-[60px] flex items-stretch">
        {NAV_ITEMS.map(({ key, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-[3px] py-2',
                'transition-colors duration-150 select-none',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-300',
                isActive ? 'text-primary' : 'text-[#6B7280]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                <span className={cn('text-[10px] font-medium leading-none tracking-tight', isActive ? 'text-primary' : 'text-[#6B7280]')}>
                  {tr[key as keyof typeof tr]}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
