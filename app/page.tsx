'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import {
  Camera,
  Sprout,
  CheckSquare,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Leaf,
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { ScanRecord, ActionRecord } from '@/lib/types';

export default function HomePage() {
  const { user, farm, setShowAuthModal } = useAuth();
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [recentActions, setRecentActions] = useState<ActionRecord[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (farm?.id) {
      setLoadingActivity(true);
      Promise.all([
        fetch(`/api/scan?farmId=${farm.id}`).then((r) => r.ok ? r.json() : { scans: [] }),
        fetch(`/api/actions?farmId=${farm.id}`).then((r) => r.ok ? r.json() : { actions: [] }),
      ])
        .then(([scansData, actionsData]) => {
          if (scansData.scans) setRecentScans(scansData.scans.slice(0, 3));
          if (actionsData.actions) setRecentActions(actionsData.actions.slice(0, 3));
        })
        .catch((err) => console.warn('Activity fetch error:', err))
        .finally(() => setLoadingActivity(false));
    }
  }, [farm?.id]);

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── HERO BANNER ─────────────────────────── */}
      <div className="rounded-none sm:rounded-2xl bg-[#145726] border-t-4 border-[#f5c518] p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 opacity-[0.06] pointer-events-none">
          <Leaf className="w-56 h-56 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-xs bg-[#f5c518] text-[#111c13] px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4 shadow-2xs">
            <Sparkles className="h-3 w-3 text-[#111c13]" />
            <span>AI-Powered Agriculture · Rwanda</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
            {user ? `Muraho neza, ${user.name}!` : 'Murakaza neza\nkuri Incuti'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-green-100 font-normal leading-relaxed max-w-lg opacity-90">
            {user
              ? "Suzuma ubutaka n'ibihingwa byawe mu ifoto imwe, wige uburyo bwiza bwo gusasira no kurwanya isuri, hanyuma ugishe inama Incuti AI."
              : "Urubuga rwihariye rw'abahinzi mu Rwanda — Suzuma umurima wawe ukoresheje AI, kurikirana ibikorwa byo kubungabunga ubutaka, no kugisha inama mu Kinyarwanda."}
          </p>
          {!user && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-2.5 rounded-sm bg-white border-b-4 border-[#f5c518] px-6 py-3 text-sm font-black text-[#145726] shadow hover:bg-green-50 transition-all active:scale-95 group"
              >
                <span>Tangira Ubu — Injira</span>
                <span className="h-5 w-5 rounded-full bg-[#f5c518] text-[#111c13] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── FARM STATUS (logged in) ──────────────── */}
      {user && (
        <div className="rounded-sm bg-white border border-gray-200 border-l-4 border-l-[#f5c518] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-sm bg-[#145726] text-white flex items-center justify-center relative">
                <Sprout className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#f5c518]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-black tracking-tight flex items-center gap-2">
                  Umwirondoro w&apos;Umurima Wawe
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f5c518]" />
                </h3>
                <p className="text-xs text-gray-500 font-medium">Amakuru y&apos;ibanze ku murima</p>
              </div>
            </div>
            <Link
              href="/farm"
              className="text-xs font-black text-[#145726] flex items-center gap-1 border border-[#145726] border-b-2 border-b-[#f5c518] rounded-sm px-2.5 py-1 hover:bg-[#edf7ee] transition"
            >
              <span>{farm ? 'Hindura' : 'Andika Umurima'}</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#145726]" />
            </Link>
          </div>

          {farm ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-gray-100">
              {[
                { label: "Akarere n'Aho uherereye", value: `${farm.district} — ${farm.location_text}`, icon: <MapPin className="h-3.5 w-3.5 text-[#145726] shrink-0" /> },
                { label: "Ubunini", value: `${farm.area_ha} Ha`, icon: null },
                { label: "Ibihingwa", value: farm.crops, icon: null },
                { label: "Guhuza ibihingwa", value: farm.intercrop || 'Oya', icon: null },
              ].map((item, i) => (
                <div key={i} className="bg-[#f2f8f2] border border-[#d0e8d2] p-3 rounded-sm relative">
                  <span className="text-[10px] font-bold text-[#1a7030] uppercase tracking-wider block mb-1">{item.label}</span>
                  <span className="font-black text-[13px] text-black flex items-center gap-1 truncate">
                    {item.icon}{item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[#f2f8f2] rounded-sm border border-[#c8e8cb] border-l-4 border-l-[#f5c518] text-sm text-black flex items-center justify-between">
              <span className="font-medium">Uzuza amakuru y&apos;umurima wawe — aho uherereye n&apos;ubunini bwawo.</span>
              <Link href="/farm" className="font-black text-[#145726] underline whitespace-nowrap ml-3">
                Uzuza umurima →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── AI SCAN FEATURE ──────────────────────── */}
      <div className="rounded-sm bg-white border border-gray-200 border-l-4 border-l-[#145726] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-sm bg-[#145726] text-white flex items-center justify-center shrink-0 relative">
            <Camera className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#f5c518] border-2 border-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 bg-[#f5c518] text-[#111c13] rounded-xs px-2 py-0.5 text-[10px] font-black uppercase tracking-widest mb-2 shadow-2xs">
              <Sparkles className="h-2.5 w-2.5" />
              <span>Gemini AI Vision</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              Gusuzuma Umurima n&apos;Ibihingwa
            </h2>
            <p className="mt-1 text-sm text-gray-600 font-medium max-w-md leading-relaxed">
              Fata ifoto y&apos;ubutaka, ibyatsi, cyangwa ibihingwa. Gemini AI irasesengura ubuhehere,
              isuri, imborera n&apos;uburwayi mu masegonda make.
            </p>
          </div>
        </div>
        <Link
          href="/scan"
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#145726] border-b-3 border-[#f5c518] px-6 py-3.5 text-sm font-black text-white shadow hover:bg-[#0f421d] transition-all active:scale-95 whitespace-nowrap shrink-0 group"
        >
          <Camera className="h-4 w-4 text-[#f5c518]" />
          <span>Fata Ifoto / Tangira</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── QUICK NAV CARDS ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-black tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-[#f5c518] rounded-xs inline-block" />
            Ibyiciro by&apos;Incuti
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Card 1 — Scan */}
          <Link
            href="/scan"
            className="card-hover group rounded-sm bg-[#145726] p-5 border-2 border-[#145726] shadow-sm flex flex-col justify-between aspect-square relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#f5c518] text-[#111c13] text-[9px] font-black uppercase tracking-wider rounded-xs">
              AI Vision
            </div>
            <div>
              <div className="h-11 w-11 rounded-sm bg-white/15 text-white flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-black text-lg text-white leading-tight tracking-tight">
                Gusuzuma<br />Umurima
              </h3>
              <p className="text-[11px] text-green-200 mt-2 font-medium leading-relaxed">
                Fata ifoto y&apos;ubutaka ubone inama n&apos;isuzuma rya AI.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-black text-[#f5c518] group-hover:translate-x-0.5 transition-transform">
              <span>Tangira</span>
              <ChevronRight className="h-4 w-4 ml-0.5 text-[#f5c518]" />
            </div>
          </Link>

          {/* Card 2 — Farm */}
          <Link
            href="/farm"
            className="card-hover group rounded-sm bg-[#1e7a36] p-5 border-2 border-[#1e7a36] shadow-sm flex flex-col justify-between aspect-square relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#f5c518] text-[#111c13] text-[9px] font-black uppercase tracking-wider rounded-xs">
              Umurima
            </div>
            <div>
              <div className="h-11 w-11 rounded-sm bg-white/15 text-white flex items-center justify-center mb-4">
                <Sprout className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-black text-lg text-white leading-tight tracking-tight">
                Umurima<br />Wanjye
              </h3>
              <p className="text-[11px] text-green-100 mt-2 font-medium leading-relaxed">
                Akarere, ubuso bw&apos;umurima n&apos;ibihingwa bihingwa.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-black text-[#f5c518] group-hover:translate-x-0.5 transition-transform">
              <span>Reba Umurima</span>
              <ChevronRight className="h-4 w-4 ml-0.5 text-[#f5c518]" />
            </div>
          </Link>

          {/* Card 3 — Actions */}
          <Link
            href="/actions"
            className="card-hover group rounded-sm bg-white p-5 border-2 border-[#c8e8cb] hover:border-[#145726] shadow-sm flex flex-col justify-between aspect-square relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-0 w-0 border-t-[20px] border-t-[#f5c518] border-l-[20px] border-l-transparent" />
            <div>
              <div className="h-11 w-11 rounded-sm bg-[#145726] text-white flex items-center justify-center mb-4 relative">
                <CheckSquare className="h-6 w-6" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#f5c518]" />
              </div>
              <h3 className="font-black text-lg text-black leading-tight tracking-tight">
                Ibikorwa<br />Byakozwe
              </h3>
              <p className="text-[11px] text-gray-500 mt-2 font-medium leading-relaxed">
                Kwandika gusasira, ifumbire n&apos;imiringoti wubatse.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-black text-[#145726] group-hover:translate-x-0.5 transition-transform">
              <span>Kurikirana</span>
              <ChevronRight className="h-4 w-4 ml-0.5 text-[#f5c518]" />
            </div>
          </Link>

          {/* Card 4 — Learn */}
          <Link
            href="/learn"
            className="card-hover group rounded-sm bg-white p-5 border-2 border-[#c8e8cb] hover:border-[#145726] shadow-sm flex flex-col justify-between aspect-square relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-0 w-0 border-t-[20px] border-t-[#f5c518] border-l-[20px] border-l-transparent" />
            <div>
              <div className="h-11 w-11 rounded-sm bg-[#145726] text-white flex items-center justify-center mb-4 relative">
                <BookOpen className="h-6 w-6" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#f5c518]" />
              </div>
              <h3 className="font-black text-lg text-black leading-tight tracking-tight">
                Amasomo<br />n&apos;Amashusho
              </h3>
              <p className="text-[11px] text-gray-500 mt-2 font-medium leading-relaxed">
                Amasomo ngiro ku kubungabunga ubutaka n&apos;amazi.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-black text-[#145726] group-hover:translate-x-0.5 transition-transform">
              <span>Wige Ubu</span>
              <ChevronRight className="h-4 w-4 ml-0.5 text-[#f5c518]" />
            </div>
          </Link>

        </div>
      </div>

      {/* ── INCUTI AI CALLOUT ────────────────────── */}
      <div className="rounded-sm bg-white border-2 border-[#145726] border-l-6 border-l-[#f5c518] p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-sm bg-[#145726] text-white flex items-center justify-center shrink-0 relative">
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#f5c518]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-black tracking-tight">
                Ukeneye Inama z&apos;Ubuhinzi? Baza &quot;Incuti Bot&quot;
              </h3>
              <span className="text-[9px] font-black uppercase bg-[#f5c518] text-[#111c13] px-1.5 py-0.2 rounded-xs">
                Kinyarwanda
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Baza ikibazo icyo ari cyo cyose ku gusasira, imborera, cyangwa indwara z&apos;ibihingwa mu Kinyarwanda.
            </p>
          </div>
        </div>
        <Link
          href="/chat"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm bg-[#145726] border-b-3 border-[#f5c518] px-5 py-3 text-sm font-black text-white hover:bg-[#0f421d] transition-all whitespace-nowrap group"
        >
          <span>Tangira Ikiganiro</span>
          <ArrowRight className="h-4 w-4 text-[#f5c518] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── RECENT ACTIVITY ─────────────────────── */}
      {farm && (recentScans.length > 0 || recentActions.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {recentScans.length > 0 && (
            <div className="rounded-sm bg-white border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-[#145726]" />
                  <span>Ibisuzumwa Biheruka</span>
                </h3>
                <Link href="/scan" className="text-[11px] font-black text-[#145726] hover:underline">
                  Byose →
                </Link>
              </div>
              <div className="space-y-2">
                {recentScans.map((s) => (
                  <div key={s.id} className="p-3 rounded-sm bg-[#f2f8f2] border border-[#c8e8cb] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black ${
                        s.risk_level === 'low'
                          ? 'bg-[#145726] text-white'
                          : s.risk_level === 'high'
                          ? 'bg-red-600 text-white'
                          : 'bg-[#f5c518] text-[#111c13]'
                      }`}>
                        {s.risk_level === 'low' ? 'Ibyago Bike' : s.risk_level === 'high' ? 'Ibyago Bikabije' : 'Iringaniye'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(s.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-black font-medium line-clamp-2">{s.observation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentActions.length > 0 && (
            <div className="rounded-sm bg-white border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-[#145726]" />
                  <span>Ibikorwa Biheruka</span>
                </h3>
                <Link href="/actions" className="text-[11px] font-black text-[#145726] hover:underline">
                  Byose →
                </Link>
              </div>
              <div className="space-y-2">
                {recentActions.map((a) => (
                  <div key={a.id} className="p-3 rounded-sm bg-[#f2f8f2] border border-[#c8e8cb] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-black">{a.action_type}</span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium line-clamp-1">{a.description || 'Igikorwa cyo kubungabunga umurima'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
