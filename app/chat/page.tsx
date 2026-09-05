'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  BookOpen,
  Sprout,
  Globe
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'incuti';
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS_KINYARWANDA = [
  'Nteye ibigori, nasasira nte mu murima wanjye?',
  'Ubutaka bwanjye burimo isuri y\'amazi, nakora iki?',
  'Nakorana nte ifumbire y\'imborera iboze neza?',
  'Ese guhuza ibishyimbo n\'ibigori byongera ifumbire?'
];

const SUGGESTED_QUESTIONS_ENGLISH = [
  'How do I mulch my maize plot to conserve water?',
  'My field has soil erosion issues, what steps should I take?',
  'How do I make high quality organic compost manure?',
  'Does intercropping beans with corn increase soil nitrogen?'
];

export default function IncutiChatPage() {
  const { user, setShowAuthModal } = useAuth();
  const { t, language } = useLanguage();

  const initialWelcome = language === 'en'
    ? `Hello dear farmer! I am Incuti Bot, your AI assistant for conservation agriculture in Rwanda.\nMy answers are generated in **BOTH English and Kinyarwanda**.\n\nAsk me any question about mulching, terracing, soil cover, compost manure, or crop health!`
    : `Muraho neza muhinzi mwiza! Ndi Incuti Bot, umufasha wawe w'ubwenge buhangano (AI) mu buhinzi bubungabunga ubutaka mu Rwanda.\nIbisubizo byanjye bitangwa mu **Kinyarwanda n'Icyongereza (English & Kinyarwanda)**.\n\nMbaza ikibazo icyo ari cyo cyose ku gusasira, kurwanya isuri, ifumbire cyangwa imyaka yawe!`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'incuti',
      text: initialWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const userMessage: Message = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'anonymous',
          question: query,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Habaye ikibazo mu itumanaho.');
      }

      const botMessage: Message = {
        id: 'bot_' + Date.now(),
        sender: 'incuti',
        text: (data.answer || '').trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error_' + Date.now(),
          sender: 'incuti',
          text: language === 'en'
            ? 'Sorry, a network connection error occurred. Please try again.'
            : 'Ihanganire, habaye ikibazo mu kubona igisubizo. Ongera ugerageze akanya gato.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = language === 'en'
    ? SUGGESTED_QUESTIONS_ENGLISH
    : SUGGESTED_QUESTIONS_KINYARWANDA;

  return (
    <div className="flex flex-col h-[calc(100dvh-150px)] md:h-[calc(100vh-110px)] max-w-4xl mx-auto animate-fade-in border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forest-100 bg-white p-3.5 sm:p-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-[#145726] text-white flex items-center justify-center shadow-xs">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-[#f5c518]" />
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5 leading-tight">
              <span>{t.chat.title}</span>
              <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="h-3 w-3 text-amber-700" />
                <span>RW & EN</span>
              </span>
            </h1>
            <p className="text-[11px] text-gray-500">{t.chat.subtitle}</p>
          </div>
        </div>

        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 bg-forest-50 px-2.5 py-1.5 rounded-lg border border-forest-200 hover:bg-forest-100 transition"
        >
          <BookOpen className="h-3.5 w-3.5 text-[#145726]" />
          <span className="hidden sm:inline">{t.chat.learnBtn}</span>
        </Link>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'incuti' && (
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-[#145726] text-white flex items-center justify-center shrink-0 mb-1">
                <Sprout className="h-3.5 w-3.5 text-[#f5c518]" />
              </div>
            )}

            <div
              className={`max-w-[88%] sm:max-w-lg rounded-2xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#145726] text-white rounded-br-none'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>
              <div
                className={`text-[9px] sm:text-[10px] mt-1 text-right ${
                  msg.sender === 'user' ? 'text-green-200' : 'text-gray-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0 mb-1">
                <User className="h-3.5 w-3.5 text-[#145726]" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-[#145726] text-white flex items-center justify-center shrink-0">
              <Sprout className="h-3.5 w-3.5 text-[#f5c518]" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-none p-3 border border-gray-200 shadow-xs flex items-center gap-2 text-xs text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin text-[#145726]" />
              <span>{t.chat.typing}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-white border-t border-gray-100 px-3 py-2 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap flex items-center gap-1 shrink-0">
            <Sparkles className="h-3 w-3 text-forest-600" />
            {t.chat.suggestedHeader}
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-forest-50 hover:text-forest-800 border border-gray-200 whitespace-nowrap transition active:scale-95 shrink-0 font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <div className="bg-white p-2.5 sm:p-3 border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={t.chat.inputPlaceholder}
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2.5 text-sm text-gray-900 focus:border-forest-600 focus:outline-none focus:ring-1 focus:ring-forest-600"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#145726] text-white flex items-center justify-center hover:bg-[#0f421d] transition active:scale-95 disabled:opacity-50 shrink-0 shadow-xs"
            title={t.chat.send}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#f5c518]" /> : <Send className="h-4 w-4 text-[#f5c518]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
