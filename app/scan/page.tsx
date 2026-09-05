'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import Link from 'next/link';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  BookOpen,
  RefreshCw,
  Clock,
  Loader2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { ScanRecord, LearningContentItem, GeminiScanAnalysis } from '@/lib/types';

const SAMPLE_IMAGES = [
  {
    label: 'Erosion sample / Isuri',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    description: 'Uncovered slope / ubutaka butagira ibyatsi'
  },
  {
    label: 'Mulched field / Gusasira',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23982?w=800&auto=format&fit=crop&q=80',
    description: 'Crop residue mulch / gusasira'
  },
  {
    label: 'Intercropping / Guhuza ibihingwa',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
    description: 'Corn & legumes / ibigori n\'ibishyimbo'
  }
];

export default function FarmScanPage() {
  const { user, farm, setShowAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    scan: ScanRecord;
    analysis: GeminiScanAnalysis;
    related_learning: LearningContentItem[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pastScans, setPastScans] = useState<ScanRecord[]>([]);
  const [loadingPastScans, setLoadingPastScans] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load past scans
  useEffect(() => {
    if (farm?.id) {
      setLoadingPastScans(true);
      fetch(`/api/scan?farmId=${farm.id}`)
        .then((r) => (r.ok ? r.json() : { scans: [] }))
        .then((data) => {
          if (data.scans) setPastScans(data.scans);
        })
        .catch((e) => console.warn('Could not load past scans:', e))
        .finally(() => setLoadingPastScans(false));
    }
  }, [farm?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setScanResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const selectSampleImage = async (sampleUrl: string) => {
    try {
      setError(null);
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setScanResult(null);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading sample image:', err);
      setSelectedImage(sampleUrl);
    }
  };

  const handleStartScan = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedImage) {
      setError(t.scan.chooseGallery);
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAnalysisStep(t.scan.analyzingStep1);

    try {
      const farmId = farm?.id || 'demo_farm_' + user.id;

      setAnalysisStep(t.scan.analyzingStep2);

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          image: selectedImage,
          mimeType: 'image/jpeg',
        }),
      });

      setAnalysisStep(t.scan.analyzingStep3);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Analysis error occurred.');
      }

      setScanResult(data);
      if (data.scan) {
        setPastScans((prev) => [data.scan, ...prev]);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'Error conducting scan.');
    } finally {
      setAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const resetScan = () => {
    setSelectedImage(null);
    setScanResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 uppercase tracking-wider mb-1">
            <Camera className="h-4 w-4" />
            <span>AI Farm Vision Scanner (Bilingual EN & RW)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">{t.scan.title}</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {t.scan.subtitle}
          </p>
        </div>

        {farm && (
          <div className="text-left sm:text-right bg-white p-2 sm:p-0 rounded-xl border sm:border-0 border-gray-100">
            <span className="text-[11px] text-gray-500 block">{t.scan.selectedFarm}</span>
            <span className="text-xs font-bold text-forest-800">{farm.district} ({farm.location_text})</span>
          </div>
        )}
      </div>

      {/* Main Upload / Analysis Card */}
      <div className="rounded-2xl bg-white border border-forest-100 p-4 sm:p-6 md:p-8 shadow-sm">
        {!selectedImage ? (
          <div className="space-y-4 sm:space-y-5">
            {/* Dropzone & Buttons */}
            <div className="border-2 border-dashed border-[#145726]/30 rounded-2xl p-5 sm:p-10 text-center hover:border-[#145726] transition bg-[#f2f8f2]">
              <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-2xl bg-[#145726] text-white flex items-center justify-center mb-3 sm:mb-4 shadow-xs relative">
                <Camera className="h-7 w-7 sm:h-8 sm:w-8 text-[#f5c518]" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#f5c518] border-2 border-white" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-gray-900 mb-1">
                {t.scan.dropzoneTitle}
              </h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto mb-5 leading-relaxed">
                {t.scan.dropzoneDesc}
              </p>

              {/* Hidden Inputs for File and Camera */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#145726] border-b-3 border-[#f5c518] px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow hover:bg-[#0f421d] transition active:scale-95"
                >
                  <Camera className="h-4 w-4 text-[#f5c518]" />
                  <span>{t.scan.takePhoto}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95"
                >
                  <Upload className="h-4 w-4 text-gray-600" />
                  <span>{t.scan.chooseGallery}</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Sample Photos */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-[#145726]" />
                <span>{t.scan.demoSamples}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSampleImage(sample.url)}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-[#145726] hover:bg-[#f2f8f2] transition text-left group bg-white shadow-2xs"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="h-full w-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#145726] truncate">
                        {sample.label}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{sample.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview & Actions */}
            <div className="relative rounded-2xl overflow-hidden bg-black/5 max-h-[380px] flex items-center justify-center border border-gray-200">
              <img
                src={selectedImage}
                alt="Selected field image"
                className="max-h-[380px] w-auto object-contain rounded-2xl"
              />
              {!analyzing && (
                <button
                  onClick={resetScan}
                  className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur transition flex items-center gap-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{t.scan.changePhoto}</span>
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-xs sm:text-sm text-red-800 border border-red-200 flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Error: </strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Analyzing State Indicator */}
            {analyzing && (
              <div className="rounded-2xl bg-forest-50 border border-forest-200 p-6 text-center space-y-3">
                <Loader2 className="h-8 w-8 text-forest-700 animate-spin mx-auto text-[#145726]" />
                <h4 className="text-sm font-bold text-forest-950">
                  {t.scan.analyzingTitle}
                </h4>
                <p className="text-xs text-forest-700 font-medium">
                  {analysisStep}
                </p>
              </div>
            )}

            {/* Trigger Button if not analyzed yet */}
            {!scanResult && !analyzing && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#145726] border-b-2 border-[#f5c518] px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#0f421d] transition active:scale-95"
                >
                  <Sparkles className="h-4 w-4 text-[#f5c518]" />
                  <span>{t.scan.analyzeButton}</span>
                </button>
              </div>
            )}

            {/* SUCCESSFUL SCAN RESULT DISPLAY */}
            {scanResult && (
              <div className="space-y-6 pt-2 border-t border-gray-100 animate-fade-in">
                {/* Status & Risk Badge Banner */}
                <div className={`rounded-2xl p-5 border ${
                  scanResult.analysis.risk_level === 'low'
                    ? 'bg-green-50/80 border-green-200 text-green-950'
                    : scanResult.analysis.risk_level === 'high'
                    ? 'bg-red-50/80 border-red-200 text-red-950'
                    : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {scanResult.analysis.risk_level === 'low' ? (
                        <ShieldCheck className="h-6 w-6 text-green-700" />
                      ) : scanResult.analysis.risk_level === 'high' ? (
                        <AlertOctagon className="h-6 w-6 text-red-700" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-amber-700" />
                      )}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                          {t.scan.riskLevel}
                        </span>
                        <h3 className="text-lg font-black">
                          {scanResult.analysis.risk_level === 'low' && t.scan.riskLow}
                          {scanResult.analysis.risk_level === 'moderate' && t.scan.riskModerate}
                          {scanResult.analysis.risk_level === 'high' && t.scan.riskHigh}
                        </h3>
                      </div>
                    </div>

                    {/* Confidence tag */}
                    <div className="text-right">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold uppercase ${
                        scanResult.analysis.confidence === 'high'
                          ? 'bg-green-200/80 text-green-900'
                          : scanResult.analysis.confidence === 'low'
                          ? 'bg-red-200/80 text-red-900'
                          : 'bg-yellow-200/80 text-yellow-900'
                      }`}>
                        {t.scan.confidence} {scanResult.analysis.confidence || 'medium'}
                      </span>
                    </div>
                  </div>

                  {/* Low confidence alert advising Extension Officer */}
                  {scanResult.analysis.confidence === 'low' && (
                    <div className="mt-3 p-3 bg-white/80 rounded-xl border border-red-200 text-xs text-red-900 flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        {t.scan.lowConfidenceWarning}
                      </div>
                    </div>
                  )}
                </div>

                {/* Observation (Bilingual EN & RW) */}
                <div className="rounded-2xl bg-gray-50 p-5 border border-gray-200">
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                    {t.scan.observation}
                  </h4>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 leading-relaxed whitespace-pre-line">
                    {scanResult.analysis.observation}
                  </p>
                </div>

                {/* Actionable Recommendations Checklist (Bilingual EN & RW) */}
                <div className="rounded-2xl bg-forest-50/50 p-5 border border-forest-200">
                  <h4 className="text-xs font-bold uppercase text-forest-900 tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-forest-700" />
                    <span>{t.scan.recommendations}</span>
                  </h4>
                  <ul className="space-y-2.5">
                    {scanResult.analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#145726] text-[10px] font-bold text-white shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="leading-snug whitespace-pre-line">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Explanation */}
                {scanResult.analysis.explanation && (
                  <div className="rounded-2xl bg-earth-50/60 p-5 border border-earth-200">
                    <h4 className="text-xs font-bold uppercase text-earth-900 tracking-wider mb-1.5">
                      {t.scan.explanation}
                    </h4>
                    <p className="text-xs sm:text-sm text-earth-950 leading-relaxed whitespace-pre-line">
                      {scanResult.analysis.explanation}
                    </p>
                  </div>
                )}

                {/* Related Learning Content */}
                {scanResult.related_learning && scanResult.related_learning.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-gray-900 tracking-wider flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-forest-700" />
                        <span>{t.scan.relatedLearning}</span>
                      </h4>
                      <Link href="/learn" className="text-xs font-semibold text-forest-700 hover:underline">
                        {t.scan.viewAllLessons} &rarr;
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {scanResult.related_learning.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-gray-200 p-3.5 bg-white hover:border-forest-300 transition flex flex-col justify-between"
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase bg-forest-100 text-forest-800 px-2 py-0.5 rounded-md inline-block mb-1.5">
                              {item.category}
                            </span>
                            <h5 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2">
                              {item.title_kinyarwanda}
                            </h5>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {item.description_kinyarwanda}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                            <a
                              href={item.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900"
                            >
                              <span>{t.scan.watchVideo}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <Link
                              href={`/learn?tag=${item.related_risk_tags.split(',')[0]}`}
                              className="text-[11px] text-gray-500 hover:underline"
                            >
                              {t.scan.readMore}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Next Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={resetScan}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>{t.scan.scanAnother}</span>
                  </button>

                  <Link
                    href="/actions"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#145726] border-b-2 border-[#f5c518] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#0f421d] transition"
                  >
                    <span>{t.scan.logAction}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Past Scans History for Farm */}
      {pastScans.length > 0 && (
        <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-forest-700" />
              <span>{t.scan.scanHistory}</span>
            </h3>
            <span className="text-xs text-gray-500">{pastScans.length} {t.scan.scansCount}</span>
          </div>

          <div className="space-y-3">
            {pastScans.map((scan) => (
              <div
                key={scan.id}
                className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {scan.image_url ? (
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                      <img
                        src={scan.image_url}
                        alt="Farm scan snapshot"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                      <Camera className="h-6 w-6" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        scan.risk_level === 'low'
                          ? 'bg-green-100 text-green-800'
                          : scan.risk_level === 'high'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {scan.risk_level === 'low' ? 'Low / Bike' : scan.risk_level === 'high' ? 'High / Bikabije' : 'Moderate / Biraringaniye'}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 font-medium line-clamp-2">
                      {scan.observation}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] text-forest-700 font-bold block">
                    {scan.recommendations?.length || 0} {t.scan.recommendationsCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
