import React, { useState, useRef } from 'react';
import {
  X,
  Newspaper,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  Camera,
  Link2,
  CheckCircle2,
  FileImage,
  RefreshCw,
} from 'lucide-react';
import { NewsArticle, UserAccount } from '../types';

interface NewsManagerModalProps {
  currentUser: UserAccount;
  newsList: NewsArticle[];
  isOpen: boolean;
  onClose: () => void;
  onSaveNews: (article: NewsArticle) => void;
  onDeleteNews: (id: string) => void;
}

export const NewsManagerModal: React.FC<NewsManagerModalProps> = ({
  currentUser,
  newsList,
  isOpen,
  onClose,
  onSaveNews,
  onDeleteNews,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: '',
    category: 'Pengumuman Klub',
    summary: '',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=800&auto=format&fit=crop&q=80',
    tags: ['Panahan', 'Kota Batu'],
    featured: false,
  });

  const handleStartAdd = () => {
    setEditingArticle(null);
    setFormData({
      id: `news-${Date.now()}`,
      title: '',
      category: 'Pengumuman Klub',
      date: new Date().toISOString().slice(0, 10),
      author: currentUser.name,
      authorRole: currentUser.role === 'super_admin' ? 'Super Admin' : currentUser.role === 'pelatih_utama' ? 'Pelatih Utama' : 'Admin',
      summary: '',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=800&auto=format&fit=crop&q=80',
      tags: ['Pengumuman', 'Seneng Manah'],
      featured: false,
      createdAt: new Date().toISOString(),
    });
  };

  const handleStartEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({ ...article });
  };

  // Image Upload Processor (From Local Drive HP / Computer)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih berkas gambar yang valid (JPG, PNG, WEBP, HEIC).');
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Optimize banner image size for fast Firestore loading & clean rendering
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.84);
          setFormData((prev) => ({ ...prev, imageUrl: optimizedDataUrl }));
        } else {
          setFormData((prev) => ({ ...prev, imageUrl: rawDataUrl }));
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setFormData((prev) => ({ ...prev, imageUrl: rawDataUrl }));
        setIsProcessingImage(false);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      alert('Gagal membaca berkas gambar dari memori perangkat.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const finalArticle: NewsArticle = {
      id: editingArticle?.id || formData.id || `news-${Date.now()}`,
      title: formData.title || 'Berita Panahan',
      category: (formData.category as any) || 'Pengumuman Klub',
      date: formData.date || new Date().toISOString().slice(0, 10),
      author: formData.author || currentUser.name,
      authorRole: formData.authorRole || (currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin'),
      summary: formData.summary || formData.content?.slice(0, 120) || '',
      content: formData.content || '',
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=800&auto=format&fit=crop&q=80',
      featured: formData.featured || false,
      tags: typeof formData.tags === 'string' ? (formData.tags as string).split(',').map((s) => s.trim()) : formData.tags,
      createdAt: editingArticle?.createdAt || new Date().toISOString(),
    };

    onSaveNews(finalArticle);
    setEditingArticle(null);
    alert('Berita berhasil disimpan dan dipublikasikan langsung ke Cloud & Beranda!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-blue-500/30 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kelola Berita & Pengumuman Beranda</h3>
              <p className="text-xs text-slate-400">SENENG MANAH SHOOTING CLASS BATU</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleStartAdd}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Berita Baru</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-12 gap-6">
          {/* Left Column: Form Tulis / Edit */}
          <div className="col-span-12 lg:col-span-7 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
              {editingArticle ? 'Edit Berita' : 'Form Pembuatan Berita Baru'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Judul Berita / Pengumuman *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Jadwal Scoring Test Sirkuit Panahan Pelajar 2026..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kategori Berita</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-semibold"
                  >
                    <option value="Pengumuman Klub">Pengumuman Klub</option>
                    <option value="Jadwal & Event">Jadwal & Event</option>
                    <option value="Tips & Teknik">Tips & Teknik</option>
                    <option value="Prestasi Atlit">Prestasi Atlit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tanggal Publikasi</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Gambar Berita (Upload dari Drive HP/Komputer / Kamera / URL) */}
              <div className="space-y-2 p-3 bg-slate-900 border border-slate-700/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    <span>Gambar Banner Berita *</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        imageMode === 'upload' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        imageMode === 'url' ? 'bg-pink-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      URL Link
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' ? (
                  <div className="space-y-2">
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

                    {/* Drag and drop upload zone */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="border-2 border-dashed border-slate-700 hover:border-pink-500/60 rounded-xl p-3 text-center bg-slate-950/60 transition cursor-pointer flex flex-col items-center justify-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                        {isProcessingImage ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">
                          {isProcessingImage ? 'Mengoptimalkan Gambar...' : 'Klik untuk Pilih Foto dari HP / Komputer'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Mendukung file JPG, PNG, WEBP dari galeri atau penyimpanan lokal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                      >
                        <FileImage className="w-3.5 h-3.5 text-pink-400" />
                        <span>Pilih dari Galeri / Drive</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition"
                      >
                        <Camera className="w-3.5 h-3.5 text-purple-400" />
                        <span>Kamera HP</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>
                )}

                {/* Image Live Preview */}
                {formData.imageUrl && (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 h-32 flex items-center justify-center group">
                    <img
                      src={formData.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded bg-pink-500 text-white font-bold text-[10px] shadow"
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[10px] shadow"
                      >
                        Hapus
                      </button>
                    </div>
                    <div className="absolute bottom-1.5 left-1.5 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Foto Siap Terbit
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Ringkasan Singkat</label>
                <input
                  type="text"
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Ringkasan 1 kalimat yang muncul pada kartu beranda..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Isi Berita Lengkap *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tuliskan detail pengumuman / materi berita secara lengkap..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-bold">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-pink-500 focus:ring-pink-500 bg-slate-800 border-slate-700 w-4 h-4"
                  />
                  <span>Tampilkan sebagai Berita Utama (Featured)</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Terbitkan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Daftar Berita yang ada */}
          <div className="col-span-12 lg:col-span-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daftar Berita Terpublikasi ({newsList.length})
            </h4>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {newsList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2 hover:border-slate-600 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>

                  <h5 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {item.title}
                  </h5>

                  <p className="text-[11px] text-slate-400 line-clamp-2">{item.summary || item.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px]">
                    <span className="text-slate-500">Oleh: {item.author}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded transition"
                        title="Edit Berita"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus berita "${item.title}"?`)) {
                            onDeleteNews(item.id);
                          }
                        }}
                        className="p-1 text-rose-400 hover:text-rose-300 hover:bg-slate-700 rounded transition"
                        title="Hapus Berita"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
