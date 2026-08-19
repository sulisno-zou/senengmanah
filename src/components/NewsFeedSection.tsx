import React, { useState } from 'react';
import { Newspaper, Calendar, Tag, ArrowRight, Sparkles, PlusCircle, BookOpen, Share2, X, User } from 'lucide-react';
import { NewsArticle, UserAccount } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface NewsFeedSectionProps {
  newsList: NewsArticle[];
  currentUser: UserAccount;
  onOpenNewsManager: () => void;
}

export const NewsFeedSection: React.FC<NewsFeedSectionProps> = ({
  newsList,
  currentUser,
  onOpenNewsManager,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);

  const canManageNews =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'pelatih_utama';

  const categories = ['SEMUA', 'Pengumuman Klub', 'Jadwal & Event', 'Tips & Teknik', 'Prestasi Atlit'];

  const filteredNews =
    selectedCategory === 'SEMUA'
      ? newsList
      : newsList.filter((n) => n.category === selectedCategory);

  const featured = newsList.find((n) => n.featured) || newsList[0];

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 p-4 sm:p-5 rounded-2xl border border-pink-500/20 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>Warta & Berita Seneng Manah Batu</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30 uppercase tracking-wider">
                Terkini
              </span>
            </h3>
            <p className="text-xs text-slate-400">Pengumuman resmi, jadwal uji tanding, tips teknik memanah, dan prestasi atlet</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {canManageNews && (
            <button
              onClick={onOpenNewsManager}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-pink-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Kelola Berita</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Cards Grid with Pink-Blue-Purple Accents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNews.map((news) => {
          const isFeatured = news.featured;
          return (
            <div
              key={news.id}
              onClick={() => setReadingArticle(news)}
              className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between ${
                isFeatured ? 'border-pink-500/40 ring-1 ring-pink-500/20' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Category Pill on image */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-md">
                      {news.category}
                    </span>
                  </div>

                  {isFeatured && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest text-white bg-blue-600 shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Utama</span>
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-pink-400" />
                      <span>{formatDateIndo(news.date)}</span>
                    </span>
                    <span className="text-pink-300 font-semibold">{news.author}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug group-hover:text-pink-600 transition-colors line-clamp-2">
                    {news.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {news.summary || news.content}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[11px] font-bold text-pink-600 group-hover:text-pink-700 flex items-center gap-1">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">
                  {news.authorRole}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Article Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header Banner */}
            <div className="relative h-56 sm:h-64 w-full bg-slate-900 overflow-hidden">
              <img
                src={readingArticle.imageUrl}
                alt={readingArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <button
                onClick={() => setReadingArticle(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-md inline-block mb-2">
                  {readingArticle.category}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                  {readingArticle.title}
                </h3>
              </div>
            </div>

            {/* Author bar */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-800">{readingArticle.author}</span>
                <span>•</span>
                <span>{readingArticle.authorRole}</span>
              </div>
              <span className="font-mono text-slate-400">{formatDateIndo(readingArticle.date)}</span>
            </div>

            {/* Article Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-sm leading-relaxed flex-1">
              <p className="font-medium text-slate-900 text-base leading-snug border-l-4 border-pink-500 pl-3 py-0.5 italic bg-pink-50/50 rounded-r-lg">
                {readingArticle.summary}
              </p>
              <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                {readingArticle.content}
              </div>

              {readingArticle.tags && readingArticle.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {readingArticle.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-pink-500" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">SENENG MANAH OFFICIAL PRESS</span>
              <button
                onClick={() => setReadingArticle(null)}
                className="px-5 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:opacity-90 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
