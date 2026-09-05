'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import {
  Sprout,
  MapPin,
  Maximize2,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3
} from 'lucide-react';

const RWANDA_DISTRICTS = [
  'Bugesera', 'Burera', 'Gakenke', 'Gasabo', 'Gatsibo', 'Gicumbi', 'Gisagara',
  'Huye', 'Kamonyi', 'Karongi', 'Kayonza', 'Kicukiro', 'Kirehe', 'Muhanga',
  'Musanze', 'Ngoma', 'Ngororero', 'Nyabihu', 'Nyagatare', 'Nyamagabe',
  'Nyamasheke', 'Nyanza', 'Nyarugenge', 'Nyaruguru', 'Rubavu', 'Ruhango',
  'Rulindo', 'Rusizi', 'Rutsiro', 'Rwamagana'
];

const COMMON_CROPS = [
  'Ibigori (Maize)',
  'Ibishyimbo (Beans)',
  'Ibirayi (Irish Potatoes)',
  'Soya (Soybeans)',
  'Umuceri (Rice)',
  'Imyumbati (Cassava)',
  'Ikawa (Coffee)',
  'Icyayi (Tea)',
  'Inanasi / Imbuto (Fruits)',
  'Ubwatsi bw\'amatungo (Fodder)'
];

export default function MyFarmPage() {
  const { user, farm, updateCurrentFarm, setShowAuthModal } = useAuth();

  const [district, setDistrict] = useState(farm?.district || 'Musanze');
  const [locationText, setLocationText] = useState(farm?.location_text || '');
  const [areaHa, setAreaHa] = useState(farm?.area_ha?.toString() || '0.5');
  const [crops, setCrops] = useState(farm?.crops || 'Ibigori, Ibishyimbo');
  const [intercrop, setIntercrop] = useState(farm?.intercrop || 'Yego (Guhuza n\'ibinyamisogwe)');

  const [isEditing, setIsEditing] = useState(!farm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (farm) {
      setDistrict(farm.district);
      setLocationText(farm.location_text);
      setAreaHa(farm.area_ha.toString());
      setCrops(farm.crops);
      setIntercrop(farm.intercrop);
    }
  }, [farm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!district || !locationText.trim()) {
      setMessage({
        text: 'Akarere n\'aho umurima uherereye birakenewe.',
        type: 'error',
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/farm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          district,
          location_text: locationText,
          area_ha: parseFloat(areaHa) || 0.1,
          crops,
          intercrop,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Habaye ikibazo mu kubika umurima.');
      }

      updateCurrentFarm(data.farm);
      setIsEditing(false);
      setMessage({
        text: 'Amakuru y\'umurima yabitswe neza!',
        type: 'success',
      });
    } catch (err: any) {
      setMessage({
        text: err.message || 'Habaye ikibazo mu kubika umurima.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 uppercase tracking-wider mb-1">
          <Sprout className="h-4 w-4" />
          <span>Farm Profile</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">Umurima Wanjye (My Farm)</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Uzuza kandi ucunge amakuru y&apos;ubuso bw&apos;umurima wawe, aho uherereye n&apos;ibihingwa ukunze guhinga.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2 border ${
          message.type === 'success'
            ? 'bg-green-50 text-green-900 border-green-200'
            : 'bg-red-50 text-red-900 border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Farm Profile Display Card (when saved and not currently editing) */}
      {farm && !isEditing && (
        <div className="rounded-3xl bg-white border border-forest-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center">
                <Sprout className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Umurima wo muri {farm.district}
                </h2>
                <p className="text-xs text-gray-500">
                  Wanditswe ku: {new Date(farm.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Hindura</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 block">Aho uherereye:</span>
              <p className="font-bold text-gray-900 flex items-center gap-1.5 mt-1">
                <MapPin className="h-4 w-4 text-forest-700" />
                {farm.district} — {farm.location_text}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 block">Ubuso bw&apos;Umurima:</span>
              <p className="font-bold text-gray-900 flex items-center gap-1.5 mt-1">
                <Maximize2 className="h-4 w-4 text-forest-700" />
                {farm.area_ha} Hectares (Ha)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 block">Ibihingwa by&apos;ibanze:</span>
              <p className="font-bold text-gray-900 flex items-center gap-1.5 mt-1">
                <Layers className="h-4 w-4 text-forest-700" />
                {farm.crops}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-semibold text-gray-500 block">Guhuza Ibihingwa (Intercrop):</span>
              <p className="font-bold text-forest-800 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="h-4 w-4 text-forest-700" />
                {farm.intercrop}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit or Create Farm Form */}
      {(isEditing || !farm) && (
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-forest-100 p-6 md:p-8 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-gray-900">
            {farm ? 'Hindura Amakuru y\'Umurima' : 'Injiza Amakuru Mashya y\'Umurima'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* District */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Akarere (District) *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
                required
              >
                {RWANDA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Location text */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Umurenge / Akagari / Icyaro *
              </label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="urugero: Umurenge wa Kinigi, Akagari ka Nyange"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
                required
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Ubuso bw&apos;Umurima muri Hectares (Ha) *
              </label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                value={areaHa}
                onChange={(e) => setAreaHa(e.target.value)}
                placeholder="0.5"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
                required
              />
            </div>

            {/* Intercrop */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Ese uhuza ibihingwa mu murima umwe?
              </label>
              <select
                value={intercrop}
                onChange={(e) => setIntercrop(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
              >
                <option value="Yego (Ibigori n'ibishyimbo)">Yego (Ibigori n&apos;ibishyimbo)</option>
                <option value="Yego (Ibinyamisogwe n'imyumbati)">Yego (Ibinyamisogwe n&apos;imyumbati)</option>
                <option value="Yego (Ibindi bihuzwa)">Yego (Ibindi bihuzwa)</option>
                <option value="Oya (Ibihingwa ntibivanze)">Oya (Ibihingwa ntibivanze)</option>
              </select>
            </div>
          </div>

          {/* Crops */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Ibihingwa bihingwa muri uyu murima
            </label>
            <input
              type="text"
              value={crops}
              onChange={(e) => setCrops(e.target.value)}
              placeholder="urugero: Ibigori, Ibishyimbo, Soya"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600 mb-2"
            />
            {/* Quick badges */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CROPS.map((c) => {
                const name = c.split(' ')[0];
                const isSelected = crops.includes(name);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setCrops(crops.split(',').map((x) => x.trim()).filter((x) => x !== name).join(', '));
                      } else {
                        setCrops(crops ? `${crops}, ${name}` : name);
                      }
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                      isSelected
                        ? 'bg-forest-700 text-white border-forest-700 font-bold'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-forest-300'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            {farm && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Kureka
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-forest-700 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-forest-800 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Birimo kubikwa...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Bika Umurima</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
