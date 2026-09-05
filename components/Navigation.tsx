'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  Home,
  Camera,
  Sprout,
  CheckSquare,
  BookOpen,
  MessageSquare,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Ahabanza', icon: Home },
  { href: '/scan', label: 'Gusuzuma', icon: Camera, highlight: true },
  { href: '/farm', label: 'Umurima', icon: Sprout },
  { href: '/actions', label: 'Ibikorwa', icon: CheckSquare },
  { href: '/learn', label: 'Amasomo', icon: BookOpen },
  { href: '/chat', label: 'Incuti Bot', icon: MessageSquare },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, setShowAuthModal, logout } = useAuth();

  return (
    <>
      {/* Desktop & Tablet Top Navigation Bar */}
      <header className="sticky top-0 z-40 hidden md:block bg-white/95 backdrop-blur border-b border-gray-200 shadow-xs">
        {/* Decorative Top Yellow Accent Line */}
        <div className="h-1 bg-[#f5c518] w-full" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-sm bg-[#145726] flex items-center justify-center text-white shadow-xs group-hover:bg-[#0f421d] transition relative">
              <Sprout className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#f5c518] border-2 border-white" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-black flex items-center gap-1.5 leading-none">
                Incuti
                <span className="text-[9px] font-black uppercase tracking-widest bg-[#f5c518] text-[#111c13] px-1.5 py-0.5 rounded-xs shadow-2xs">
                  MVP
                </span>
              </div>
              <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Ubuhinzi Bubungabunga</div>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-bold transition relative ${
                    isActive
                      ? 'bg-[#145726] text-white shadow-xs'
                      : 'text-gray-700 hover:text-[#145726] hover:bg-green-50'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#f5c518]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#f5c518]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="text-right">
                  <div className="text-xs font-black text-black leading-tight">{user.name}</div>
                  <div className="text-[10px] text-gray-500 font-medium">{user.phone}</div>
                </div>
                <button
                  onClick={logout}
                  title="Sohoka"
                  className="h-8 w-8 rounded-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 rounded-sm bg-[#145726] border-b-2 border-[#f5c518] px-3.5 py-1.5 text-xs font-black text-white hover:bg-[#0f421d] shadow-xs transition active:scale-95"
              >
                <LogIn className="h-3.5 w-3.5 text-[#f5c518]" />
                <span>Injira</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 md:hidden bg-white/95 backdrop-blur border-b border-gray-200 shadow-xs">
        <div className="h-1 bg-[#f5c518] w-full" />
        <div className="px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-sm bg-[#145726] flex items-center justify-center text-white relative">
              <Sprout className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#f5c518]" />
            </div>
            <span className="font-black text-base text-black tracking-tight">Incuti</span>
            <span className="text-[9px] font-black uppercase bg-[#f5c518] text-[#111c13] px-1 py-0.2 rounded-xs">MVP</span>
          </Link>
          <div>
            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-1 text-[11px] font-bold text-black bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-sm"
              >
                <User className="h-3 w-3 text-[#145726]" />
                <span className="max-w-[100px] truncate">{user.name}</span>
                <LogOut className="h-3 w-3 ml-0.5 text-gray-400" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1 text-[11px] font-black text-white bg-[#145726] border-b-2 border-[#f5c518] px-3 py-1 rounded-sm"
              >
                <LogIn className="h-3 w-3 text-[#f5c518]" />
                <span>Injira</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Fixed Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t-2 border-[#f5c518] px-2 py-1.5 flex items-center justify-around shadow-lg">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-sm transition ${
                item.highlight
                  ? isActive
                    ? 'text-white bg-[#145726] border-b-2 border-[#f5c518] font-bold px-3 shadow-sm'
                    : 'text-[#145726] font-extrabold hover:bg-green-50'
                  : isActive
                  ? 'text-[#145726] font-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#145726]' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight leading-none font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
