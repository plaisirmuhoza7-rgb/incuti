import Link from 'next/link';
import { Sprout, Mail, Phone } from 'lucide-react';

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
    heading: 'Iga & Gisha Inama',
    links: [
      { label: 'Amasomo', href: '/learn' },
      { label: 'Incuti Bot', href: '/chat' },
    ],
  },
  {
    heading: 'Umushinga',
    links: [
      { label: 'Incuti MVP', href: '/' },
      { label: 'Ubuhinzi Bubungabunga', href: '/learn' },
      { label: 'AI Vision — Gemini', href: '/scan' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] text-white mt-12 border-t-4 border-[#f5c518]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-sm bg-[#145726] border border-[#f5c518]/40 flex items-center justify-center relative">
                <Sprout className="h-6 w-6 text-white" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#f5c518]" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Incuti
                  <span className="text-[9px] font-black uppercase tracking-widest bg-[#f5c518] text-[#111c13] px-1.5 py-0.2 rounded-xs">
                    Rwanda
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Conservation Agriculture</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-normal max-w-xs">
              Urubuga rwihariye rw&apos;abahinzi mu Rwanda — ukoresheje AI gusuzuma umurima, kubungabunga ubutaka, no kugisha inama.
            </p>
            {/* Contact */}
            <div className="mt-5 space-y-2">
              <a href="mailto:info@incuti.rw" className="flex items-center gap-2 text-xs text-gray-300 hover:text-[#f5c518] transition font-medium">
                <Mail className="h-3.5 w-3.5 text-[#f5c518]" />
                <span>info@incuti.rw</span>
              </a>
              <a href="tel:+250700000000" className="flex items-center gap-2 text-xs text-gray-300 hover:text-[#f5c518] transition font-medium">
                <Phone className="h-3.5 w-3.5 text-[#f5c518]" />
                <span>+250 700 000 000</span>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.heading}>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-[#f5c518] rounded-xs inline-block" />
                {section.heading}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-[#f5c518] font-medium transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 font-medium">
            © {year} Incuti. Ubuhinzi Bubungabunga Ubutaka. Made in Rwanda 🇷🇼
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-xs">
              <div className="h-2 w-2 rounded-full bg-[#f5c518] animate-pulse" />
              Powered by <span className="text-[#f5c518]">Gemini AI</span>
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#f5c518] transition"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
