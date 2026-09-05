'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import {
  BookOpen,
  Play,
  Tag,
  ExternalLink,
  Loader2,
  X,
  Search,
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
  const { t } = useLanguage();

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
        <h1 className="text-2xl font-black text-gray-900">{t.learn.title}</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {t.learn.subtitle}
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
            placeholder={t.learn.searchPlaceholder}
            className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm text-gray-900 shadow-xs focus:border-[#145726] focus:outline-none focus:ring-1 focus:ring-[#145726]"
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActiveTag('');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 shrink-0 ${
                selectedCategory === cat && !activeTag
                  ? 'bg-[#145726] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-[#f2f8f2] hover:border-[#145726]'
              }`}
            >
              {cat === 'Byose' ? t.learn.categoryAll : cat}
            </button>
          ))}
        </div>

        {/* Active Tag indicator */}
        {activeTag && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-[#145726] rounded-full text-xs font-bold">
            <Tag className="h-3 w-3" />
            <span>{t.learn.filterTag} {activeTag}</span>
            <button
              onClick={() => setActiveTag('')}
              className="hover:text-black font-extrabold ml-1"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-[#145726]" />
          <span>{t.learn.loading}</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-200 p-8 sm:p-12 text-center text-gray-500">
          <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-700 text-sm">{t.learn.noLessons}</p>
          <button
            onClick={() => {
              setSelectedCategory('Byose');
              setActiveTag('');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-bold text-[#145726] underline"
          >
            {t.learn.viewAllLessons}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#145726] transition flex flex-col justify-between group"
            >
              <div>
                {/* Category & Tag */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-black uppercase bg-[#f2f8f2] text-[#145726] px-2 py-0.5 rounded-sm border border-[#d0e8d2]">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Tag className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{item.related_risk_tags.split(',')[0]}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 group-hover:text-[#145726] transition leading-snug">
                  {item.title_kinyarwanda}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-3">
                  {item.description_kinyarwanda}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveVideoItem(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#145726] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0f421d] transition active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-[#f5c518]" />
                  <span>{t.learn.watchVideo}</span>
                </button>

                <a
                  href={item.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-[#145726] transition"
                  title="Open video link"
                >
                  <span>{t.learn.openSource}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200">
            <div className="p-3.5 bg-gray-900 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-bold text-[#f5c518] uppercase tracking-wider block">
                  {activeVideoItem.category}
                </span>
                <h3 className="font-bold text-xs sm:text-sm truncate">
                  {activeVideoItem.title_kinyarwanda}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoItem(null)}
                className="text-gray-300 hover:text-white p-1 rounded-full bg-white/10 active:scale-95"
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

            <div className="p-4 sm:p-5 bg-white">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                {t.learn.summary}
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
          <span>Loading...</span>
        </div>
      }
    >
      <LearningHubContent />
    </Suspense>
  );
}
