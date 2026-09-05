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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-forest-100">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Funga"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
            <Sprout className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Injira muri Incuti</h2>
            <p className="text-xs text-forest-700 font-medium">Ubuhinzi Bubungabunga Ubutaka</p>
          </div>
        </div>

        <p className="mb-5 text-sm text-gray-600">
          Shyiramo amazina yawe na numero ya telefone kugira ngo utangire gusesengura umurima,
          kubika ibikorwa no kubaza <strong>Incuti Bot</strong>.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Amazina yawe
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="urugero: Kwizera Jean"
                className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600 bg-gray-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nimero ya Telefone
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="urugero: 0788 123 456"
                className="block w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600 bg-gray-50/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest-700 py-3 text-sm font-semibold text-white shadow-md hover:bg-forest-800 transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Birimo kwinjira...</span>
              </>
            ) : (
              <span>Komeza</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-forest-300 bg-forest-50 py-2.5 text-xs font-semibold text-forest-800 hover:bg-forest-100 transition"
          >
            <Sparkles className="h-4 w-4 text-forest-600" />
            <span>Konti y&apos;Icyitegererezo (Demo Farmer)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
