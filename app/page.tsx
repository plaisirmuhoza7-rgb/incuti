'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import {
  Camera,
  Sprout,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Leaf,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const { user, setShowAuthModal } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in -mt-3 -mx-3 sm:-mx-6 lg:-mx-8">

      {/* ══════════════════════════════════════ */}
      {/*  1. HERO                               */}
      {/* ══════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center overflow-hidden px-6 py-24 bg-gradient-to-br from-[#0b3a1a] via-[#145726] to-[#1e7a36]">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-7">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs text-emerald-100 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight tracking-tight whitespace-pre-line">
            {user ? (
              <><span className="text-amber-300">{t.hero.welcome}</span>, {user.name}!</>
            ) : (
              <>Grow Smarter.<br /><span className="text-amber-300">Farm Better.</span></>
            )}
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 text-sm font-bold text-emerald-950 shadow-lg hover:bg-amber-300 transition active:scale-95"
            >
              <Camera className="h-4 w-4" />
              <span>{t.hero.scanButton}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition active:scale-95"
              >
                {t.hero.createAccount}
              </button>
            ) : (
              <Link
                href="/farm"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                <Sprout className="h-4 w-4 text-amber-300" />
                <span>{t.hero.myFarm}</span>
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {[
              { label: t.hero.trustAi, icon: <Sparkles className="h-3.5 w-3.5 text-amber-300" /> },
              { label: t.hero.trustLang, icon: <Globe className="h-3.5 w-3.5 text-amber-300" /> },
              { label: t.hero.trustFree, icon: <ShieldCheck className="h-3.5 w-3.5 text-amber-300" /> },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 text-xs text-emerald-100/70 font-medium">
                {s.icon}
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] text-white/30 tracking-widest uppercase font-medium">{t.hero.scroll}</span>
          <div className="w-px h-6 bg-white/20 rounded-full" />
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/*  2. ABOUT US                           */}
      {/* ══════════════════════════════════════ */}
      <section className="bg-white px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <Leaf className="h-3.5 w-3.5" />
            {t.about.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {t.about.title}
          </h2>
          <p className="text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {t.about.desc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
            {[
              {
                icon: <Camera className="h-5 w-5 text-[#145726]" />,
                title: t.about.card1Title,
                desc: t.about.card1Desc,
              },
              {
                icon: <MessageSquare className="h-5 w-5 text-[#145726]" />,
                title: t.about.card2Title,
                desc: t.about.card2Desc,
              },
              {
                icon: <BookOpen className="h-5 w-5 text-[#145726]" />,
                title: t.about.card3Title,
                desc: t.about.card3Desc,
              },
            ].map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/*  3. SCAN FIELD                         */}
      {/* ══════════════════════════════════════ */}
      <section className="bg-[#f6faf6] px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[480px] flex flex-col sm:flex-row">
            {/* Photo */}
            <div className="relative w-full sm:w-1/2 min-h-[260px] sm:min-h-auto">
              <Image
                src="/scan.png"
                alt="Scan crop disease preview"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-[#0b3a1a]/50 hidden sm:block" />
            </div>
            {/* Text */}
            <div className="relative bg-[#145726] w-full sm:w-1/2 p-8 sm:p-14 flex flex-col justify-center text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-200 uppercase tracking-wider mb-5 self-start">
                <Camera className="h-3.5 w-3.5" />
                {t.homeScanSection.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4 whitespace-pre-line">
                {t.homeScanSection.title}
              </h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed mb-7">
                {t.homeScanSection.desc}
              </p>
              <Link
                href="/scan"
                className="self-start inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-emerald-950 hover:bg-amber-300 transition active:scale-95"
              >
                <span>{t.homeScanSection.button}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/*  4. INCUTI BOT                         */}
      {/* ══════════════════════════════════════ */}
      <section className="bg-white px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[480px] flex flex-col sm:flex-row-reverse">
            {/* Photo */}
            <div className="relative w-full sm:w-1/2 min-h-[260px] sm:min-h-auto">
              <Image
                src="/bot.png"
                alt="Incuti AI Assistant preview"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-slate-900/30 hidden sm:block" />
            </div>
            {/* Text */}
            <div className="relative w-full sm:w-1/2 p-8 sm:p-14 flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-5 self-start">
                <MessageSquare className="h-3.5 w-3.5" />
                {t.homeBotSection.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4 whitespace-pre-line">
                {t.homeBotSection.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-7">
                {t.homeBotSection.desc}
              </p>
              <Link
                href="/chat"
                className="self-start inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-amber-300 transition active:scale-95"
              >
                <span>{t.homeBotSection.button}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/*  5. START LEARNING                     */}
      {/* ══════════════════════════════════════ */}
      <section className="bg-[#f6faf6] px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[480px] flex flex-col sm:flex-row">
            {/* Photo */}
            <div className="relative w-full sm:w-1/2 min-h-[260px] sm:min-h-auto">
              <Image
                src="/lan.png"
                alt="Learning center preview"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-emerald-950/40 hidden sm:block" />
            </div>
            {/* Text */}
            <div className="relative bg-gradient-to-br from-emerald-800 to-[#0b3a1a] w-full sm:w-1/2 p-8 sm:p-14 flex flex-col justify-center text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-5 self-start">
                <BookOpen className="h-3.5 w-3.5" />
                {t.homeLearnSection.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4 whitespace-pre-line">
                {t.homeLearnSection.title}
              </h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed mb-5">
                {t.homeLearnSection.desc}
              </p>
              <ul className="space-y-2 mb-7">
                {t.homeLearnSection.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-emerald-100">
                    <ChevronRight className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/learn"
                className="self-start inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-emerald-950 hover:bg-amber-300 transition active:scale-95"
              >
                <span>{t.homeLearnSection.button}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/*  6. MY FARM                            */}
      {/* ══════════════════════════════════════ */}
      <section className="bg-white px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[480px] flex flex-col sm:flex-row-reverse">
            {/* Photo */}
            <div className="relative w-full sm:w-1/2 min-h-[260px] sm:min-h-auto">
              <Image
                src="/maize.png"
                alt="My Farm maize preview"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            {/* Text */}
            <div className="relative w-full sm:w-1/2 p-8 sm:p-14 flex flex-col justify-center bg-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-5 self-start">
                <Sprout className="h-3.5 w-3.5" />
                {t.homeFarmSection.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4 whitespace-pre-line">
                {t.homeFarmSection.title}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                {t.homeFarmSection.desc}
              </p>
              <ul className="space-y-2 mb-7">
                {t.homeFarmSection.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#145726] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/farm"
                className="self-start inline-flex items-center gap-2 rounded-full bg-[#145726] px-6 py-3 text-sm font-bold text-white hover:bg-[#0f421d] transition active:scale-95"
              >
                <Sprout className="h-4 w-4 text-amber-300" />
                <span>{t.homeFarmSection.button}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ */}
      {/*  7. CONTACT US                         */}
      {/* ══════════════════════════════════════ */}
      <section className="bg-[#f6faf6] px-4 py-5 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-[#0b3a1a] via-[#145726] to-[#1e7a36] p-8 sm:p-14 text-white">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-300/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-12 items-center">
              {/* Left — headline */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-200 uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5" />
                  {t.contact.badge}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight whitespace-pre-line">
                  {t.contact.title}
                </h2>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  {t.contact.desc}
                </p>
              </div>

              {/* Right — contact cards */}
              <div className="space-y-3">
                <a
                  href="mailto:info@incuti.rw"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/20 transition group"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium mb-0.5">{t.contact.email}</div>
                    <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition">info@incuti.rw</div>
                  </div>
                </a>

                <a
                  href="tel:+250700000000"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/20 transition group"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium mb-0.5">{t.contact.phone}</div>
                    <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition">+250 700 000 000</div>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/15">
                  <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium mb-0.5">{t.contact.location}</div>
                    <div className="text-sm font-semibold text-white">Kigali, Rwanda 🇷🇼</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
