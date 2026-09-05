'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  CheckSquare,
  PlusCircle,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  X,
  Filter,
  Calendar
} from 'lucide-react';
import { ActionRecord } from '@/lib/types';

const COMMON_CONSERVATION_ACTIONS = [
  {
    type: 'Gusasira (Mulching)',
    desc: 'Gupfuka ubutaka ukoresheje ibyatsi byumye cyangwa ibisigazwa by\'imyaka.',
    badge: 'Ubuhehere'
  },
  {
    type: 'Ifumbire y\'Imborera (Organic Manure)',
    desc: 'Gushyira mu murima ifumbire iboze neza ikoze mu bishingwe n\'amase y\'amatungo.',
    badge: 'Uburumbuke'
  },
  {
    type: 'Gupfuka Ubutaka (Soil Cover Crops)',
    desc: 'Gutera ibihingwa bipfuka ubutaka nka mucuna cyangwa ibishyimbo by\'urubingo.',
    badge: 'Kwirinda Izuba'
  },
  {
    type: 'Kurwanya Isuri (Erosion Control / Terracing)',
    desc: 'Gucukura imiringoti ifata amazi no gutera ibyatsi by\'urubingo ku mirongo.',
    badge: 'Isuri'
  },
  {
    type: 'Kudahingagura Cyane (Minimum Tillage)',
    desc: 'Guharura ahazaterwa imbuto gusa utangije ubutaka bwose.',
    badge: 'Ubuzima bw\'Ubutaka'
  },
  {
    type: 'Guhuza / Guhinduranya Ibihingwa (Intercropping)',
    desc: 'Guhinza ibigori bivanze n\'ibinyamisogwe kugira ngo byongere azote mu butaka.',
    badge: 'Azote'
  },
  {
    type: 'Ibindi bikorwa (Other)',
    desc: 'Ikindi gikorwa cyose cyo kubungabunga umurima.',
    badge: 'Ibindi'
  }
];

export default function ActionTrackerPage() {
  const { user, farm, setShowAuthModal } = useAuth();

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
  }, [farm?.id]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const farmId = farm?.id || 'demo_farm_' + user.id;

    setSubmitting(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          action_type: actionType,
          description,
          photo,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Habaye ikibazo mu kubika igikorwa.');
      }

      if (data.action) {
        setActions((prev) => [data.action, ...prev]);
      }

      // Reset modal
      setShowAddModal(false);
      setDescription('');
      setPhoto(null);
      setActionType('Gusasira (Mulching)');
      setStatus('Byarangiye');
    } catch (err: any) {
      alert(err.message || 'Habaye ikibazo.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredActions = actions.filter((a) => {
    if (filterType === 'All') return true;
    return a.action_type.includes(filterType) || a.status === filterType;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 uppercase tracking-wider mb-1">
            <CheckSquare className="h-4 w-4" />
            <span>Conservation Action Tracker</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Ibikorwa Byo Kubungabunga Ubutaka</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Kurikirana ibikorwa umaze gukora ku butaka bwawe: gusasira, ifumbire y&apos;imborera, gupfuka ubutaka n&apos;imiringoti.
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) {
              setShowAuthModal(true);
            } else {
              setShowAddModal(true);
            }
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow hover:bg-forest-800 transition active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Andika Igikorwa Gishya</span>
        </button>
      </div>

      {/* Recommended Conservation Checklist Cards */}
      <div className="rounded-3xl bg-white border border-forest-100 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-forest-600" />
          <span>Ibikorwa By&apos;Ingenzi Byo Kwitaho (Action Checklist)</span>
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
                onClick={() => {
                  setActionType(item.type);
                  setShowAddModal(true);
                }}
                className="mt-3 text-[11px] font-bold text-forest-700 hover:text-forest-900 text-left flex items-center gap-1"
              >
                <span>+ Andika iki gikorwa</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* History of Completed Actions */}
      <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-forest-700" />
              <span>Amateka y&apos;Ibikorwa Byakozwe ({actions.length})</span>
            </h2>
            <p className="text-xs text-gray-500">Urutonde rw&apos;ibyo wakoze mu kurengera ubutaka</p>
          </div>

          {/* Filter badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['All', 'Gusasira', 'Imborera', 'Isuri', 'Byarangiye'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  filterType === f
                    ? 'bg-forest-700 text-white font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'All' ? 'Byose' : f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-forest-700" />
            <span>Birimo gushakishwa...</span>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            <CheckSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">Nta gikorwa kirandikwa muri iki cyiciro.</p>
            <p className="text-gray-400 mt-1">Kanda kuri &quot;Andika Igikorwa Gishya&quot; hejuru kugira ngo ubike icyo wakoze.</p>
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
                      <img
                        src={action.photo_url}
                        alt="Action photo proof"
                        className="h-full w-full object-cover"
                      />
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
                        {action.status || 'Byarangiye'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-1 leading-relaxed">
                      {action.description || 'Igikorwa cyo kubungabunga ubutaka.'}
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

      {/* Modal to Log a New Action */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-8 shadow-2xl border border-gray-200 max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-[#145726] text-white flex items-center justify-center shrink-0">
                <CheckSquare className="h-5 w-5 text-[#f5c518]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">Andika Igikorwa Cyakozwe</h3>
                <p className="text-[11px] text-gray-500">Kubika amakuru muri Google Sheets</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ubwoko bw&apos;Igikorwa (Action Type) *
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none"
                  required
                >
                  {COMMON_CONSERVATION_ACTIONS.map((a) => (
                    <option key={a.type} value={a.type}>
                      {a.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ubusobanuro cyangwa Inyandiko (Description)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="urugero: Nasasiye umurima wose w'ibigori nkoresheje ibyatsi byumye..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Imiterere y&apos;Igikorwa (Status)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none"
                >
                  <option value="Byarangiye">Byarangiye (Completed)</option>
                  <option value="Birakomeza">Birakomeza (In Progress)</option>
                </select>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ifoto y&apos;Igikorwa (Optional Photo Proof)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {photo ? (
                  <div className="relative rounded-xl overflow-hidden max-h-40 bg-gray-100 border border-gray-200">
                    <img src={photo} alt="Action preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full text-xs"
                    >
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
                    <span>Fata ifoto cyangwa kanda hano uhitemo</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Kureka
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#145726] border-b-2 border-[#f5c518] px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow hover:bg-[#0f421d] transition active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#f5c518]" />
                      <span>Birimo kubikwa...</span>
                    </>
                  ) : (
                    <span>Bika Igikorwa</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

