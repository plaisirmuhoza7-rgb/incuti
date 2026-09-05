'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import {
  CheckSquare,
  PlusCircle,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  X,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ShoppingCart,
  Minus,
  Plus,
} from 'lucide-react';
import { ActionRecord } from '@/lib/types';

const COMMON_CONSERVATION_ACTIONS = [
  {
    type: 'Gusasira (Mulching)',
    desc: 'Gupfuka ubutaka ukoresheje ibyatsi byumye cyangwa ibisigazwa by\'imyaka / Apply mulch.',
    badge: 'Moisture / Ubuhehere'
  },
  {
    type: 'Ifumbire y\'Imborera (Organic Compost)',
    desc: 'Gushyira mu murima ifumbire iboze neza / Apply organic compost manure.',
    badge: 'Soil Health / Uburumbuke'
  },
  {
    type: 'Gupfuka Ubutaka (Cover Crops)',
    desc: 'Gutera ibihingwa bipfuka ubutaka / Plant cover crops to prevent sun damage.',
    badge: 'Sun Protection'
  },
  {
    type: 'Kurwanya Isuri (Terracing & Trenches)',
    desc: 'Gucukura imiringoti ifata amazi / Dig infiltration trenches along slope contours.',
    badge: 'Erosion Control'
  },
  {
    type: 'Kudahingagura Cyane (Minimum Tillage)',
    desc: 'Guharura ahazaterwa imbuto gusa / Disturb soil as little as possible.',
    badge: 'Minimum Tillage'
  },
  {
    type: 'Guhuza / Guhinduranya Ibihingwa (Intercropping)',
    desc: 'Guhinza ibigori bivanze n\'ibinyamisogwe / Intercrop maize with nitrogen fixing beans.',
    badge: 'Nitrogen Fixation'
  },
  {
    type: 'Ibindi bikorwa (Other Action)',
    desc: 'Ikindi gikorwa cyose cyo kubungabunga umurima / Other field conservation action.',
    badge: 'General'
  }
];

const EXPENSE_CATEGORIES = [
  'Seeds / Imbuto',
  'Fertilizer / Ifumbire',
  'Labor / Akazi',
  'Tools / Ibikoresho',
  'Transport / Gutwara',
  'Irrigation / Kuhira',
  'Pesticides / Imiti',
  'Other / Ibindi',
];

const REVENUE_CATEGORIES = [
  'Crop Sale / Kugurisha Imyaka',
  'Livestock / Amatungo',
  'Government Support / Inkunga',
  'Processing / Gukora',
  'Other / Ibindi',
];

interface FinanceEntry {
  id: string;
  type: 'revenue' | 'expense';
  amount: number;
  category: string;
  note: string;
  date: string;
}

const STORAGE_KEY = 'incuti_finance_entries';

function loadFinanceEntries(): FinanceEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFinanceEntries(entries: FinanceEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function ActionTrackerPage() {
  const { user, farm, setShowAuthModal } = useAuth();
  const { t } = useLanguage();

  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [actionType, setActionType] = useState('Gusasira (Mulching)');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<'Byarangiye' | 'Birakomeza'>('Byarangiye');
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('All');

  // Finance states
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeType, setFinanceType] = useState<'revenue' | 'expense'>('revenue');
  const [financeAmount, setFinanceAmount] = useState('');
  const [financeCategory, setFinanceCategory] = useState('');
  const [financeNote, setFinanceNote] = useState('');
  const [activeTab, setActiveTab] = useState<'actions' | 'finance'>('actions');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load actions
  const fetchActions = async () => {
    if (!farm?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/actions?farmId=${farm.id}`);
      const data = await res.json();
      if (data.success && data.actions) {
        setActions(data.actions);
      }
    } catch (err) {
      console.warn('Error fetching actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
    setFinanceEntries(loadFinanceEntries());
  }, [farm?.id]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setShowAuthModal(true); return; }
    const farmId = farm?.id || 'demo_farm_' + user.id;
    setSubmitting(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmId, action_type: actionType, description, photo, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Habaye ikibazo mu kubika igikorwa.');
      if (data.action) setActions((prev) => [data.action, ...prev]);
      setShowAddModal(false);
      setDescription('');
      setPhoto(null);
      setActionType('Gusasira (Mulching)');
      setStatus('Byarangiye');
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!financeAmount || isNaN(Number(financeAmount))) return;
    const entry: FinanceEntry = {
      id: Date.now().toString(),
      type: financeType,
      amount: Number(financeAmount),
      category: financeCategory || (financeType === 'revenue' ? REVENUE_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
      note: financeNote,
      date: new Date().toISOString(),
    };
    const updated = [entry, ...financeEntries];
    setFinanceEntries(updated);
    saveFinanceEntries(updated);
    setShowFinanceModal(false);
    setFinanceAmount('');
    setFinanceNote('');
    setFinanceCategory('');
  };

  const deleteFinanceEntry = (id: string) => {
    const updated = financeEntries.filter((e) => e.id !== id);
    setFinanceEntries(updated);
    saveFinanceEntries(updated);
  };

  const totalRevenue = financeEntries.filter((e) => e.type === 'revenue').reduce((s, e) => s + e.amount, 0);
  const totalExpense = financeEntries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  const filteredActions = actions.filter((a) => {
    if (filterType === 'All') return true;
    return a.action_type.includes(filterType) || a.status === filterType;
  });

  const formatRWF = (n: number) =>
    new Intl.NumberFormat('rw-RW', { maximumFractionDigits: 0 }).format(n) + ' RWF';

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 uppercase tracking-wider mb-1">
            <CheckSquare className="h-4 w-4" />
            <span>Conservation Action Tracker</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">{t.actions.title}</h1>
          <p className="text-xs sm:text-sm text-gray-600">{t.actions.subtitle}</p>
        </div>
        <button
          onClick={() => { if (!user) { setShowAuthModal(true); } else { setShowAddModal(true); } }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#145726] border-b-2 border-[#f5c518] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow hover:bg-[#0f421d] transition active:scale-95"
        >
          <PlusCircle className="h-4 w-4 text-[#f5c518]" />
          <span>{t.actions.newActionBtn}</span>
        </button>
      </div>

      {/* ─── ISOKO MINAGRI CARD ─── */}
      <a
        href="https://www.minagri.gov.rw/isoko"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 px-5 py-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer no-underline"
        id="isoko-minagri-link"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-amber-400/20 border border-amber-300 flex items-center justify-center shrink-0">
            <ShoppingCart className="h-5 w-5 text-amber-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider">{t.actions.isokoTitle}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 font-bold">LIVE</span>
            </div>
            <p className="text-xs text-amber-700 font-medium truncate">{t.actions.isokoDesc}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-amber-700 font-bold text-xs group-hover:gap-2 transition-all">
          <span className="hidden sm:block">{t.actions.isokoBtn}</span>
          <ExternalLink className="h-4 w-4" />
        </div>
      </a>

      {/* ─── TAB SWITCHER ─── */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'actions'
              ? 'bg-white text-[#145726] shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>{t.actions.title.split(' ')[0]}</span>
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'finance'
              ? 'bg-white text-[#145726] shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Finance Wise</span>
        </button>
      </div>

      {/* ══════════ ACTIONS TAB ══════════ */}
      {activeTab === 'actions' && (
        <>
          {/* Recommended Conservation Checklist Cards */}
          <div className="rounded-3xl bg-white border border-forest-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-forest-600" />
              <span>{t.actions.checklistTitle}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {COMMON_CONSERVATION_ACTIONS.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-forest-50/40 hover:border-forest-200 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold bg-white text-forest-800 px-2 py-0.5 rounded-md border border-forest-100">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900">{item.type}</h3>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => { setActionType(item.type); setShowAddModal(true); }}
                    className="mt-3 text-[11px] font-bold text-forest-700 hover:text-forest-900 text-left flex items-center gap-1"
                  >
                    <span>{t.actions.addThisAction}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-forest-700" />
                  <span>{t.actions.historyTitle} ({actions.length})</span>
                </h2>
                <p className="text-xs text-gray-500">{t.actions.historySubtitle}</p>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['All', 'Gusasira', 'Imborera', 'Isuri', 'Byarangiye'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      filterType === f ? 'bg-[#145726] text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'All' ? t.actions.filterAll : f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-forest-700" />
                <span>Loading...</span>
              </div>
            ) : filteredActions.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                <CheckSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-700">{t.actions.noActions}</p>
                <p className="text-gray-400 mt-1">{t.actions.clickToAdd}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActions.map((action) => (
                  <div
                    key={action.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {action.photo_url ? (
                        <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                          <img src={action.photo_url} alt="Action photo proof" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900">{action.action_type}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                            {action.status || 'Completed'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1 leading-relaxed">
                          {action.description || 'Conservation practice recorded.'}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(action.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════ FINANCE TAB ══════════ */}
      {activeTab === 'finance' && (
        <div className="space-y-4 animate-fade-in">
          {/* Finance Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#145726]" />
                {t.actions.financeTitle}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{t.actions.financeSubtitle}</p>
            </div>
            <button
              onClick={() => setShowFinanceModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#145726] border-b-2 border-[#f5c518] px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-[#0f421d] transition active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 text-[#f5c518]" />
              <span>Add</span>
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Revenue */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">{t.actions.totalRevenue}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <p className="text-sm sm:text-base font-black text-emerald-800 leading-tight break-all">
                {formatRWF(totalRevenue)}
              </p>
            </div>

            {/* Expense */}
            <div className="rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">{t.actions.totalExpense}</span>
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              </div>
              <p className="text-sm sm:text-base font-black text-red-700 leading-tight break-all">
                {formatRWF(totalExpense)}
              </p>
            </div>

            {/* Net */}
            <div className={`rounded-2xl border p-4 flex flex-col gap-1 ${
              netProfit >= 0
                ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200'
                : 'bg-gradient-to-br from-orange-50 to-red-100 border-orange-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wide ${netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {t.actions.netProfit}
                </span>
                {netProfit >= 0
                  ? <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  : <TrendingDown className="h-3.5 w-3.5 text-orange-600" />
                }
              </div>
              <p className={`text-sm sm:text-base font-black leading-tight break-all ${netProfit >= 0 ? 'text-blue-800' : 'text-orange-700'}`}>
                {netProfit >= 0 ? '+' : ''}{formatRWF(netProfit)}
              </p>
            </div>
          </div>

          {/* Quick add row */}
          <div className="flex gap-2">
            <button
              onClick={() => { setFinanceType('revenue'); setShowFinanceModal(true); }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 py-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.actions.addRevenue}
            </button>
            <button
              onClick={() => { setFinanceType('expense'); setShowFinanceModal(true); }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-red-300 bg-red-50 py-3 text-xs font-bold text-red-600 hover:bg-red-100 hover:border-red-400 transition"
            >
              <Minus className="h-3.5 w-3.5" />
              {t.actions.addExpense}
            </button>
          </div>

          {/* Transaction List */}
          <div className="rounded-3xl bg-white border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5" />
              Transactions
            </h3>
            {financeEntries.length === 0 ? (
              <div className="py-10 text-center">
                <BarChart3 className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-500">{t.actions.noRecords}</p>
                <p className="text-[11px] text-gray-400 mt-1">Press the buttons above to add your first record.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {financeEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3.5 py-3 hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        entry.type === 'revenue'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {entry.type === 'revenue'
                          ? <ArrowUpRight className="h-4 w-4" />
                          : <ArrowDownRight className="h-4 w-4" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{entry.category}</p>
                        {entry.note && <p className="text-[11px] text-gray-500 truncate">{entry.note}</p>}
                        <p className="text-[10px] text-gray-400">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-black ${entry.type === 'revenue' ? 'text-emerald-700' : 'text-red-600'}`}>
                        {entry.type === 'revenue' ? '+' : '-'}{formatRWF(entry.amount)}
                      </span>
                      <button
                        onClick={() => deleteFinanceEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Modal: Log New Conservation Action ─── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-8 shadow-2xl border border-gray-200 max-h-[90dvh] overflow-y-auto">
            <button onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#145726] text-white flex items-center justify-center shrink-0">
                <CheckSquare className="h-5 w-5 text-[#f5c518]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">{t.actions.modalTitle}</h3>
                <p className="text-[11px] text-gray-500">{t.actions.modalSubtitle}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.actions.actionTypeLabel}</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none"
                  required
                >
                  {COMMON_CONSERVATION_ACTIONS.map((a) => (
                    <option key={a.type} value={a.type}>{a.type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.actions.descriptionLabel}</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Mulched maize plot with crop residue to keep moisture..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.actions.statusLabel}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none"
                >
                  <option value="Byarangiye">{t.actions.completed}</option>
                  <option value="Birakomeza">{t.actions.inProgress}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.actions.photoLabel}</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                {photo ? (
                  <div className="relative rounded-xl overflow-hidden max-h-40 bg-gray-100 border border-gray-200">
                    <img src={photo} alt="Action preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full text-xs">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border border-dashed border-gray-300 p-3.5 text-center text-xs font-semibold text-gray-600 hover:border-[#145726] hover:bg-[#f2f8f2] transition flex items-center justify-center gap-2"
                  >
                    <Camera className="h-4 w-4 text-[#145726]" />
                    <span>{t.actions.takePhotoBtn}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50">
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#145726] border-b-2 border-[#f5c518] px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow hover:bg-[#0f421d] transition active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin text-[#f5c518]" /><span>{t.actions.savingAction}</span></>
                  ) : (
                    <span>{t.actions.saveAction}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Add Finance Entry ─── */}
      {showFinanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-7 shadow-2xl border border-gray-200">
            <button onClick={() => setShowFinanceModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1">
              <X className="h-5 w-5" />
            </button>

            {/* Type toggle inside modal */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                financeType === 'revenue' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
              }`}>
                {financeType === 'revenue' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {financeType === 'revenue' ? t.actions.addRevenue : t.actions.addExpense}
                </h3>
                <p className="text-[11px] text-gray-500">Finance Wise · {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Type switcher */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFinanceType('revenue')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  financeType === 'revenue'
                    ? 'bg-emerald-500 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                + {t.actions.revenueLabel}
              </button>
              <button
                onClick={() => setFinanceType('expense')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  financeType === 'expense'
                    ? 'bg-red-500 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                − {t.actions.expenseLabel}
              </button>
            </div>

            <form onSubmit={handleFinanceSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.actions.amountLabel} *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">RWF</span>
                  <input
                    type="number"
                    min="0"
                    value={financeAmount}
                    onChange={(e) => setFinanceAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-12 pr-3 py-2.5 text-sm font-bold text-gray-900 focus:border-[#145726] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.actions.categoryLabel}</label>
                <select
                  value={financeCategory}
                  onChange={(e) => setFinanceCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none"
                >
                  {(financeType === 'revenue' ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t.actions.noteLabel}</label>
                <input
                  type="text"
                  value={financeNote}
                  onChange={(e) => setFinanceNote(e.target.value)}
                  placeholder="e.g. Sold maize at Kigali market..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFinanceModal(false)}
                  className="flex-1 rounded-xl border border-gray-300 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  className={`flex-1 rounded-xl border-b-2 py-2.5 text-xs font-black text-white shadow transition active:scale-95 ${
                    financeType === 'revenue'
                      ? 'bg-emerald-600 border-emerald-800 hover:bg-emerald-700'
                      : 'bg-red-500 border-red-700 hover:bg-red-600'
                  }`}
                >
                  {t.actions.saveAction}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
