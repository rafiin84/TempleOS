import { NavLink, Link } from 'react-router-dom';
import { Globe, Building2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useLang } from '@/contexts/LanguageContext';
import { T } from '@/i18n/translations';

type ClassValue = string | undefined | null | false;
function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

function TempleOSLogo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="11" y="18" width="10" height="10" rx="1.5" fill="#7C6CF2" />
        <polygon points="16,5 9,18 23,18" fill="#7C6CF2" />
        <polygon points="16,9 11.5,18 20.5,18" fill="#F5F3FF" opacity="0.6" />
        <circle cx="16" cy="4" r="1.5" fill="#7C6CF2" />
        <line x1="16" y1="5.5" x2="16" y2="9" stroke="#7C6CF2" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="9" cy="18" rx="3" ry="1.2" fill="#7C6CF2" opacity="0.4" transform="rotate(-25 9 18)" />
        <ellipse cx="23" cy="18" rx="3" ry="1.2" fill="#7C6CF2" opacity="0.4" transform="rotate(25 23 18)" />
        <rect x="14" y="21" width="4" height="7" rx="1" fill="#F5F3FF" />
      </svg>
      <span className="text-[18px] font-bold tracking-tight text-[#111827]">
        Temple<span className="text-primary">OS</span>
      </span>
    </div>
  );
}

export default function Header() {
  const { lang, toggle } = useLang();
  const tr = T[lang];

  const NAV_LINKS = [
    { label: tr.nav.home,      to: '/',          end: true },
    { label: tr.nav.explore,   to: '/explore'              },
    { label: tr.nav.updates,   to: '/updates'              },
    { label: tr.nav.bookings,  to: '/bookings'             },
    { label: tr.nav.myTemple,  to: '/my-temple'            },
  ];

  return (
    <>
    {/* ── Mobile top bar ── */}
    <div className="md:hidden sticky top-0 z-40 bg-surface border-b border-[#ECECEC] h-14 flex items-center justify-between px-4">
      <Link to="/" aria-label="TempleOS home">
        <TempleOSLogo />
      </Link>
      <div className="flex items-center gap-2">
        {/* Language toggle pill */}
        <button
          type="button"
          onClick={toggle}
          aria-label={`Switch to ${lang === 'en' ? 'Tamil' : 'English'}`}
          className="relative inline-flex items-center h-8 rounded-full border border-[#ECECEC] bg-[#F5F3FF] p-1 gap-0"
        >
          <span className={cn(
            'relative z-10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors duration-200',
            lang === 'ta' ? 'text-white' : 'text-[#6B7280]',
          )}>த</span>
          <span className={cn(
            'relative z-10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors duration-200',
            lang === 'en' ? 'text-white' : 'text-[#6B7280]',
          )}>EN</span>
          <span
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-primary transition-all duration-200"
            style={{ left: lang === 'ta' ? '4px' : 'calc(50%)' }}
          />
        </button>
        <Button variant="primary" size="sm">{tr.nav.signIn}</Button>
      </div>
    </div>

    {/* ── Desktop header ── */}
    <header className="hidden md:flex sticky top-0 z-40 bg-surface border-b border-[#ECECEC] h-16 items-center px-6 gap-6">

      <Link to="/" aria-label="TempleOS home" className="shrink-0">
        <TempleOSLogo />
      </Link>

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

      <div className="flex-none flex items-center gap-1">
        {/* Language toggle pill */}
        <button
          type="button"
          onClick={toggle}
          aria-label={`Switch to ${lang === 'en' ? 'Tamil' : 'English'}`}
          className="relative inline-flex items-center h-9 rounded-full border border-[#ECECEC] bg-[#F5F3FF] p-1 gap-0 transition-colors duration-150 hover:border-primary/40"
        >
          <span className={cn(
            'relative z-10 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200',
            lang === 'ta' ? 'text-white' : 'text-[#6B7280]',
          )}>
            த
          </span>
          <span className={cn(
            'relative z-10 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200',
            lang === 'en' ? 'text-white' : 'text-[#6B7280]',
          )}>
            EN
          </span>
          {/* Sliding pill */}
          <span
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-primary transition-all duration-200"
            style={{ left: lang === 'ta' ? '4px' : 'calc(50%)' }}
          />
        </button>

        <Button variant="primary" size="sm">{tr.nav.signIn}</Button>
      </div>

    </header>
    </>
  );
}
