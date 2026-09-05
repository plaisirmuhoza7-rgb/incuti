'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useLanguage, LanguageToggle } from './LanguageContext';
import {
  Home,
  Camera,
  Sprout,
  CheckSquare,
  BookOpen,
  MessageSquare,
  LogOut,
  LogIn
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, setShowAuthModal, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/scan', label: t.nav.scan, icon: Camera, highlight: true },
    { href: '/farm', label: t.nav.farm, icon: Sprout },
    { href: '/actions', label: t.nav.actions, icon: CheckSquare },
    { href: '/learn', label: t.nav.learn, icon: BookOpen },
    { href: '/chat', label: t.nav.chat, icon: MessageSquare },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Navigation Bar */}
      <header className="sticky top-0 z-40 hidden md:block bg-white/90 backdrop-blur-md border-b border-emerald-900/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-[#145726] flex items-center justify-center text-white shadow-xs group-hover:bg-[#0f421d] transition">
              <Sprout className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-emerald-950">
              Incuti
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <LanguageToggle />

            {user ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/60">
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-950 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{user.phone}</div>
                </div>
                <button
                  onClick={logout}
                  title={t.nav.logout}
                  className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-[#145726] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0f421d] shadow-xs transition active:scale-95"
              >
                <LogIn className="h-3.5 w-3.5 text-amber-300" />
                <span>{t.nav.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 md:hidden bg-white/90 backdrop-blur-md border-b border-emerald-900/5">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#145726] flex items-center justify-center text-white shadow-xs">
              <Sprout className="h-4 w-4" />
            </div>
            <span className="font-bold text-base text-emerald-950 tracking-tight">Incuti</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Toggle on Mobile Top Header */}
            <LanguageToggle />

            {user ? (
              <button
                onClick={logout}
                title={t.nav.logout}
                className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-white bg-[#145726] px-3 py-1 rounded-full shadow-xs active:scale-95 transition"
              >
                <LogIn className="h-3.5 w-3.5 text-amber-300" />
                <span>{t.nav.login}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/60 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isActive
                  ? 'text-emerald-900 font-bold'
                  : 'text-slate-400 font-medium hover:text-slate-700'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-transform ${
                  isActive ? 'text-[#145726] scale-110' : 'text-slate-400'
                }`}
              />
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-emerald-950 font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
