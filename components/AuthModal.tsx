'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Sprout, Phone, User as UserIcon, X, Sparkles, Loader2 } from 'lucide-react';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nyabuneka shyiramo amazina yawe na numero ya telefone.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(name, phone);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Ntibyashobotse kwinjira. Gerageza nanone.');
    }
  };

  const handleQuickDemo = async () => {
    setName('Kwizera Jean');
    setPhone('0788123456');
    setLoading(true);
    setError('');
    const res = await login('Kwizera Jean', '0788123456');
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Ntibyashobotse kwinjira.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-gray-200 max-h-[90dvh] overflow-y-auto">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
          aria-label="Funga"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#145726] text-white shrink-0">
            <Sprout className="h-6 w-6 text-[#f5c518]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">Injira muri Incuti</h2>
            <p className="text-xs text-[#145726] font-bold">Ubuhinzi Bubungabunga Ubutaka</p>
          </div>
        </div>

        <p className="mb-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
          Shyiramo amazina yawe na numero ya telefone kugira ngo utangire gusesengura umurima,
          kubika ibikorwa no kubaza <strong>Incuti Bot</strong>.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Amazina yawe
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="urugero: Kwizera Jean"
                className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:border-[#145726] focus:outline-none focus:ring-1 focus:ring-[#145726] bg-gray-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nimero ya Telefone
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="urugero: 0788 123 456"
                className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:border-[#145726] focus:outline-none focus:ring-1 focus:ring-[#145726] bg-gray-50/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#145726] border-b-2 border-[#f5c518] py-3 text-sm font-black text-white shadow hover:bg-[#0f421d] transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#f5c518]" />
                <span>Birimo kwinjira...</span>
              </>
            ) : (
              <span>Komeza</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3.5 border-t border-gray-100">
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#145726]/30 bg-[#f2f8f2] py-2.5 text-xs font-black text-[#145726] hover:bg-green-100 transition active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4 text-[#145726]" />
            <span>Konti y&apos;Icyitegererezo (Demo Farmer)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

