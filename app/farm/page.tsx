'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
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
  const { t } = useLanguage();

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
        text: t.farm.requiredError,
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
        throw new Error(data.error || 'Error saving farm profile.');
      }

      updateCurrentFarm(data.farm);
      setIsEditing(false);
      setMessage({
        text: t.farm.savedSuccess,
        type: 'success',
      });
    } catch (err: any) {
      setMessage({
        text: err.message || t.farm.requiredError,
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
        <h1 className="text-2xl font-black text-gray-900">{t.farm.title}</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {t.farm.subtitle}
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

      {/* Farm Profile Display Card */}
      {farm && !isEditing && (
        <div className="rounded-2xl bg-white border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-[#145726] text-white flex items-center justify-center shrink-0">
                <Sprout className="h-6 w-6 text-[#f5c518]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                  {t.farm.farmIn} {farm.district}
                </h2>
                <p className="text-[11px] text-gray-500">
                  {t.farm.registeredOn} {new Date(farm.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition active:scale-95 shrink-0"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t.farm.edit}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-[#f2f8f2] border border-[#d0e8d2]">
              <span className="text-[11px] font-bold text-[#145726] uppercase tracking-wider block">{t.farm.locationLabel}</span>
              <p className="font-extrabold text-gray-900 flex items-center gap-1.5 mt-1">
                <MapPin className="h-4 w-4 text-[#145726] shrink-0" />
                <span>{farm.district} — {farm.location_text}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f2f8f2] border border-[#d0e8d2]">
              <span className="text-[11px] font-bold text-[#145726] uppercase tracking-wider block">{t.farm.areaLabel}</span>
              <p className="font-extrabold text-gray-900 flex items-center gap-1.5 mt-1">
                <Maximize2 className="h-4 w-4 text-[#145726] shrink-0" />
                <span>{farm.area_ha} Hectares (Ha)</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f2f8f2] border border-[#d0e8d2]">
              <span className="text-[11px] font-bold text-[#145726] uppercase tracking-wider block">{t.farm.cropsLabel}</span>
              <p className="font-extrabold text-gray-900 flex items-center gap-1.5 mt-1">
                <Layers className="h-4 w-4 text-[#145726] shrink-0" />
                <span>{farm.crops}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f2f8f2] border border-[#d0e8d2]">
              <span className="text-[11px] font-bold text-[#145726] uppercase tracking-wider block">{t.farm.intercropLabel}</span>
              <p className="font-extrabold text-[#145726] flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="h-4 w-4 text-[#145726] shrink-0" />
                <span>{farm.intercrop}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit or Create Farm Form */}
      {(isEditing || !farm) && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-gray-200 p-5 md:p-8 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-black text-gray-900">
            {farm ? t.farm.editTitle : t.farm.newTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* District */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.farm.district}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none focus:ring-1 focus:ring-[#145726]"
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
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.farm.sector}
              </label>
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Kinigi Sector, Nyange Cell"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none focus:ring-1 focus:ring-[#145726]"
                required
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.farm.areaHa}
              </label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                value={areaHa}
                onChange={(e) => setAreaHa(e.target.value)}
                placeholder="0.5"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none focus:ring-1 focus:ring-[#145726]"
                required
              />
            </div>

            {/* Intercrop */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t.farm.intercropSelect}
              </label>
              <select
                value={intercrop}
                onChange={(e) => setIntercrop(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none focus:ring-1 focus:ring-[#145726]"
              >
                <option value="Yes (Maize & Beans)">Yes (Maize & Beans / Ibigori n'ibishyimbo)</option>
                <option value="Yes (Legumes & Cassava)">Yes (Legumes & Cassava / Ibinyamisogwe n'imyumbati)</option>
                <option value="Yes (Other intercrop)">Yes (Other intercrop / Ibindi bihuzwa)</option>
                <option value="No (Monoculture)">No (Monoculture / Oya)</option>
              </select>
            </div>
          </div>

          {/* Crops */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t.farm.cropsInput}
            </label>
            <input
              type="text"
              value={crops}
              onChange={(e) => setCrops(e.target.value)}
              placeholder="e.g. Maize, Beans, Soybeans"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-900 focus:border-[#145726] focus:outline-none focus:ring-1 focus:ring-[#145726] mb-2"
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
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition active:scale-95 ${
                      isSelected
                        ? 'bg-[#145726] text-white border-[#145726] font-bold'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#145726]'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            {farm && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                {t.farm.cancel}
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#145726] border-b-2 border-[#f5c518] px-6 py-3 text-xs sm:text-sm font-black text-white shadow hover:bg-[#0f421d] transition active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#f5c518]" />
                  <span>{t.farm.saving}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-[#f5c518]" />
                  <span>{t.farm.save}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
