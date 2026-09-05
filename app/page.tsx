'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthContext';
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
            <span>AI-Powered Conservation Agriculture · Rwanda</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight tracking-tight">
            {user
              ? <><span className="text-amber-300">Muraho</span>, {user.name}!</>
              : <>Grow Smarter.<br /><span className="text-amber-300">Farm Better.</span></>}
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            Incuti empowers Rwandan farmers with AI-powered field scanning, personalised advice in Kinyarwanda, and sustainable farming knowledge — all in one place.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 text-sm font-bold text-emerald-950 shadow-lg hover:bg-amber-300 transition active:scale-95"
            >
              <Camera className="h-4 w-4" />
              Scan Your Field
              <ArrowRight className="h-4 w-4" />
            </Link>

            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition active:scale-95"
              >
                Create Free Account
              </button>
            ) : (
              <Link
                href="/farm"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition"
              >
                <Sprout className="h-4 w-4 text-amber-300" />
                My Farm
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {[
              { label: 'AI-powered', icon: <Sparkles className="h-3.5 w-3.5 text-amber-300" /> },
              { label: 'Kinyarwanda supported', icon: <Globe className="h-3.5 w-3.5 text-amber-300" /> },
              { label: 'Free for farmers', icon: <ShieldCheck className="h-3.5 w-3.5 text-amber-300" /> },
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
          <span className="text-[10px] text-white/30 tracking-widest uppercase font-medium">Scroll</span>
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
            About Incuti
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Built for Rwanda&apos;s Farmers
          </h2>
          <p className="text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Incuti — meaning <em>&quot;friend&quot;</em> in Kinyarwanda — is an AI platform supporting
            smallholder farmers across Rwanda. We combine Google&apos;s Gemini AI with local agricultural
            knowledge to help you protect soil, identify crop diseases, and grow sustainably.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
            {[
              {
                icon: <Camera className="h-5 w-5 text-[#145726]" />,
                title: 'AI Field Scanning',
                desc: 'Point your phone at any crop or soil — get an instant diagnosis powered by Gemini.',
              },
              {
                icon: <MessageSquare className="h-5 w-5 text-[#145726]" />,
                title: 'Chat in Kinyarwanda',
                desc: 'Ask any farming question and receive expert answers in your language.',
              },
              {
                icon: <BookOpen className="h-5 w-5 text-[#145726]" />,
                title: 'Learn & Grow',
                desc: 'Access curated lessons on conservation farming, composting, and soil health.',
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
                src="/scan_field.png"
                alt="Aerial view of Rwandan terraced farm fields"
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
                AI Vision · Gemini
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
                Scan Your Field.<br />Get Instant Answers.
              </h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed mb-7">
                Take a photo of any crop, leaf, or soil sample. Gemini AI analyses it in seconds —
                detecting disease, nutrient deficiency, pest damage, and moisture issues — then
                delivers a clear action plan.
              </p>
              <Link
                href="/scan"
                className="self-start inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-emerald-950 hover:bg-amber-300 transition active:scale-95"
              >
                Scan Now
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
                src="/incuti_bot.png"
                alt="Rwandan farmer using Incuti on mobile phone"
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
                AI Chat · Kinyarwanda
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
                Ask Incuti Bot.<br /><span className="text-amber-300">Anytime. Anything.</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-7">
                Got a question about composting, irrigation, or fighting pests? Incuti Bot
                understands Kinyarwanda and gives you expert answers powered by Gemini AI —
                like having an agronomist in your pocket.
              </p>
              <Link
                href="/chat"
                className="self-start inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-amber-300 transition active:scale-95"
              >
                Start Chatting
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
                src="/learn_photo.png"
                alt="Books and green leaves for learning"
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
                Knowledge · Amasomo
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
                Learn Conservation<br />Farming Practices.
              </h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed mb-5">
                Explore curated lessons on soil health, composting, crop rotation, organic inputs,
                and pest management — built for Rwandan smallholder conditions.
              </p>
              <ul className="space-y-2 mb-7">
                {[
                  'Soil conservation & terracing',
                  'Natural composting techniques',
                  'Intercropping strategies',
                  'Organic pest control',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-emerald-100">
                    <ChevronRight className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/learn"
                className="self-start inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-emerald-950 hover:bg-amber-300 transition active:scale-95"
              >
                Start Learning
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
                src="/farm_photo.png"
                alt="Lush terraced farm hills in Rwanda"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            {/* Text */}
            <div className="relative w-full sm:w-1/2 p-8 sm:p-14 flex flex-col justify-center bg-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-5 self-start">
                <Sprout className="h-3.5 w-3.5" />
                My Farm · Umurima Wanjye
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4">
                Your Farm Profile.<br />Track Everything.
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                Register your farm, log your location, crop types, and area. Track all your field
                actions and get AI recommendations tailored to your specific farm conditions.
              </p>
              <ul className="space-y-2 mb-7">
                {[
                  'Register farm location & size',
                  'Log crops & intercropping',
                  'Track field actions & history',
                  'Get personalised AI advice',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#145726] shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/farm"
                className="self-start inline-flex items-center gap-2 rounded-full bg-[#145726] px-6 py-3 text-sm font-bold text-white hover:bg-[#0f421d] transition active:scale-95"
              >
                <Sprout className="h-4 w-4 text-amber-300" />
                My Farm
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
                  Contact Us
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  We&apos;d love to<br />
                  <span className="text-amber-300">hear from you.</span>
                </h2>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  Whether you&apos;re a farmer, researcher, NGO partner, or agri-investor — reach out.
                  Incuti is growing and we welcome collaborations across Rwanda.
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
                    <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium mb-0.5">Email</div>
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
                    <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium mb-0.5">Phone</div>
                    <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition">+250 700 000 000</div>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/15">
                  <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-medium mb-0.5">Location</div>
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
