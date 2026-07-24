import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, Globe, Building2 } from 'lucide-react';
import { Button } from '@/components/ui';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

const NAV_LINKS = [
  { label: 'Home',      to: '/',          end: true },
  { label: 'Explore',   to: '/explore'              },
  { label: 'Updates',   to: '/updates'              },
  { label: 'Bookings',  to: '/bookings'             },
  { label: 'My Temple', to: '/my-temple'            },
];

function TempleOSLogo() {
  return (
    <div className="flex items-center gap-2 select-none">
      {/* Custom temple/gopuram SVG mark */}
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Gopuram body */}
        <rect x="11" y="18" width="10" height="10" rx="1.5" fill="#7C6CF2" />
        {/* Tiered pyramid top */}
        <polygon points="16,5 9,18 23,18" fill="#7C6CF2" />
        <polygon points="16,9 11.5,18 20.5,18" fill="#F5F3FF" opacity="0.6" />
        {/* Kalasam (finial) */}
        <circle cx="16" cy="4" r="1.5" fill="#7C6CF2" />
        <line x1="16" y1="5.5" x2="16" y2="9" stroke="#7C6CF2" strokeWidth="1.5" strokeLinecap="round" />
        {/* Lotus petals flanking */}
        <ellipse cx="9" cy="18" rx="3" ry="1.2" fill="#7C6CF2" opacity="0.4" transform="rotate(-25 9 18)" />
        <ellipse cx="23" cy="18" rx="3" ry="1.2" fill="#7C6CF2" opacity="0.4" transform="rotate(25 23 18)" />
        {/* Door arch */}
        <rect x="14" y="21" width="4" height="7" rx="1" fill="#F5F3FF" />
      </svg>
      <span className="text-[18px] font-bold tracking-tight text-[#111827]">
        Temple<span className="text-primary">OS</span>
      </span>
    </div>
  );
}

export default function Header() {
  const [lang, setLang] = useState<'EN' | 'த'>('EN');

  function toggleLang() {
    setLang((prev) => (prev === 'EN' ? 'த' : 'EN'));
  }

  return (
    <header className="hidden md:flex sticky top-0 z-40 bg-surface border-b border-[#ECECEC] h-16 items-center px-6 gap-6">

      {/* LEFT: Logo */}
      <Link to="/" aria-label="TempleOS home" className="shrink-0">
        <TempleOSLogo />
      </Link>

      {/* CENTER: Nav links */}
      <nav className="flex-1 flex items-center justify-center gap-0.5" aria-label="Main navigation">
        {NAV_LINKS.map(({ label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'relative px-3.5 py-2 text-sm font-medium rounded-md transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
                isActive
                  ? 'text-primary'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAFAFC]',
              )
            }
          >
            {({ isActive }) => (
              <>
                {label}
                {/* Active underline indicator */}
                {isActive && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-3/4 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* RIGHT: Actions */}
      <div className="flex-none flex items-center gap-1">
        {/* Search icon button */}
        <button
          type="button"
          aria-label="Open search"
          className={cn(
            'inline-flex items-center justify-center w-9 h-9 rounded-md text-[#6B7280]',
            'hover:bg-[#FAFAFC] hover:text-[#111827] transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
          )}
        >
          <Search size={18} />
        </button>

        {/* Language toggle: EN / த */}
        <button
          type="button"
          onClick={toggleLang}
          aria-label={`Switch language to ${lang === 'EN' ? 'Tamil' : 'English'}`}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md',
            'text-sm font-medium text-[#6B7280]',
            'hover:bg-[#FAFAFC] hover:text-[#111827] transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
          )}
        >
          <Globe size={15} className="shrink-0" />
          <span className="min-w-[1.75rem] text-center">{lang}</span>
        </button>

        {/* Sign In */}
        <Button variant="primary" size="sm">
          Sign In
        </Button>
      </div>

    </header>
  );
}
