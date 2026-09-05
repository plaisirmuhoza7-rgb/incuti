import Link from 'next/link';
import { Sprout } from 'lucide-react';

const FOOTER_LINKS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Ahabanza', href: '/' },
      { label: 'Gusuzuma Umurima', href: '/scan' },
      { label: 'Umurima Wanjye', href: '/farm' },
      { label: 'Ibikorwa Byakozwe', href: '/actions' },
    ],
  },
  {
    heading: 'Amatsiko & Inama',
    links: [
      { label: 'Amasomo y’ubuhinzi', href: '/learn' },
      { label: 'Incuti Bot AI', href: '/chat' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black text-zinc-300 pb-24 md:pb-12 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-800">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-amber-300">
                <Sprout className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-white tracking-wide">Incuti</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Urubuga rwihariye rw’abahinzi mu Rwanda — AI vision yo gusuzuma umurima, kurwanya isuri, no kurinda ubutaka.
            </p>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.heading}>
              <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3">
                {section.heading}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-zinc-400 hover:text-amber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {year} Incuti. Conservation Agriculture Platform, Rwanda.</p>
          <p className="flex items-center gap-1.5 font-medium text-zinc-400">
            <span>Powered by Gemini AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}


