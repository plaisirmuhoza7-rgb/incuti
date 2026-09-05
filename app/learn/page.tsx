'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Play,
  Filter,
  Tag,
  ExternalLink,
  Sparkles,
  Loader2,
  X,
  Search,
  CheckCircle2
} from 'lucide-react';
import { LearningContentItem } from '@/lib/types';

const CATEGORIES = [
  'Byose',
  'Gusasira',
  'Kurwanya Isuri',
  'Imborera',
  'Ibihingwa',
  'Kudahingagura',
  'Uburwayi n\'Udukoko',
  'Ibiti n\'Imyaka',
  'Gufata Amazi'
];

function LearningHubContent() {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get('tag') || '';

  const [items, setItems] = useState<LearningContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Byose');
  const [activeTag, setActiveTag] = useState(initialTag);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoItem, setActiveVideoItem] = useState<LearningContentItem | null>(null);

  useEffect(() => {
    async function loadContent() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== 'Byose') queryParams.set('category', selectedCategory);
        if (activeTag) queryParams.set('tag', activeTag);

        const res = await fetch(`/api/learn?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success && data.items) {
          setItems(data.items);
        }
      } catch (err) {
        console.warn('Error fetching learning content:', err);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [selectedCategory, activeTag]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title_kinyarwanda.toLowerCase().includes(q) ||
      item.description_kinyarwanda.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 uppercase tracking-wider mb-1">
          <BookOpen className="h-4 w-4" />
          <span>Conservation Learning Hub</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">Amasomo y&apos;Ubuhinzi Bubungabunga Ubutaka</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          Amasomo akubiyemo amashusho n&apos;inyandiko ngiro zo kwita ku butaka: gusasira, ifumbire y&apos;imborera, imiringoti n&apos;ibihingwa bivanze.
        </p>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Shakisha isomo (urugero: gusasira, imborera, isuri, udukoko)..."
            className="block w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-gray-900 shadow-xs focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveTag('');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat && !activeTag
                  ? 'bg-forest-700 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-forest-50 hover:border-forest-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Tag indicator */}
        {activeTag && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-forest-100 text-forest-800 rounded-full text-xs font-semibold">
            <Tag className="h-3 w-3" />
            <span>Icyiciro cy&apos;Isuzuma: {activeTag}</span>
            <button
              onClick={() => setActiveTag('')}
              className="hover:text-black font-bold ml-1"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-forest-700" />
          <span>Birimo gupakururwa...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl bg-white border border-gray-200 p-12 text-center text-gray-500">
          <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-700">Nta somo ribonetse muri iki cyiciro.</p>
          <button
            onClick={() => {
              setSelectedCategory('Byose');
              setActiveTag('');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-bold text-forest-700 underline"
          >
            Reba amasomo yose
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl bg-white border border-forest-100 p-5 shadow-xs hover:shadow-md hover:border-forest-300 transition flex flex-col justify-between group"
            >
              <div>
                {/* Category & Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase bg-forest-100 text-forest-800 px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Tag className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{item.related_risk_tags.split(',')[0]}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-forest-900 transition leading-snug">
                  {item.title_kinyarwanda}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  {item.description_kinyarwanda}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveVideoItem(item)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-forest-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-forest-800 transition active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Reba Amashusho</span>
                </button>

                <a
                  href={item.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-forest-800 transition"
                  title="Fungura ku rubuga rw'amashusho"
                >
                  <span>Fungura</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white overflow-hidden shadow-2xl border border-gray-200">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-bold text-forest-400 uppercase tracking-wider block">
                  {activeVideoItem.category}
                </span>
                <h3 className="font-bold text-xs sm:text-sm truncate">
                  {activeVideoItem.title_kinyarwanda}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoItem(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <iframe
                src={getYoutubeEmbedUrl(activeVideoItem.video_url)}
                title={activeVideoItem.title_kinyarwanda}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-5 bg-white">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Inshamake y&apos;Isomo:
              </h4>
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                {activeVideoItem.description_kinyarwanda}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearningHubPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-forest-700" />
          <span>Birimo gupakururwa...</span>
        </div>
      }
    >
      <LearningHubContent />
    </Suspense>
  );
}
