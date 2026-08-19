import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  Target,
  Wrench,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Loader2,
  RefreshCw,
  Dumbbell,
  ShieldCheck,
  MessageSquare,
  Send,
  User,
  Bot,
  Flame,
  ChevronRight,
  Printer,
  Compass,
  Zap,
  HelpCircle,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';
import { Athlete, TrainingSession, SPPPayment, AttendanceRecord, AICoachAnalysis } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface AICoachEvaluatorViewProps {
  athletes: Athlete[];
  trainingSessions: TrainingSession[];
  sppPayments: SPPPayment[];
  attendanceRecords: AttendanceRecord[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AICoachEvaluatorView: React.FC<AICoachEvaluatorViewProps> = ({
  athletes,
  trainingSessions,
  sppPayments,
  attendanceRecords,
}) => {
  const [activeTab, setActiveTab] = useState<'eval' | 'chat' | 'diagnostic' | 'drill_planner'>('eval');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
  const [selectedTopic, setSelectedTopic] = useState<string>('Semua 6 Topik Horsebow');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Diagnostic tool state
  const [selectedDefect, setSelectedDefect] = useState<string>(
    'Panah grouping condong di kiri bawah (Low-Left)'
  );
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Assalamu\'alaikum! Saya Coach Al-Fatih AI, Konsultan Pelatih Panahan Tradisional Horse Bow & Horseback Archery Seneng Manah. Anda dapat berkonsultasi mengenai teknik Thumb Draw, dorongan Khatra, kecepatan Fast Shooting, teknik menunggang kuda (HBA), tuning anak panah, maupun persiapan mental kejuaraan. Apa yang ingin Anda diskusikan hari ini?',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputChat, setInputChat] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  const recentScores = trainingSessions
    .filter((s) => s.athleteId === selectedAthlete?.id)
    .slice(0, 6);

  const athleteAttendance = attendanceRecords.filter((a) => a.athleteId === selectedAthlete?.id);
  const totalAtt = athleteAttendance.length;
  const hadirCount = athleteAttendance.filter((a) => a.status === 'Hadir').length;
  const attRate = totalAtt > 0 ? Math.round((hadirCount / totalAtt) * 100) : 90;

  const currentMonthSPP = sppPayments.find(
    (p) => p.athleteId === selectedAthlete?.id && p.monthYear === '2026-08'
  );
  const sppStatus = currentMonthSPP ? currentMonthSPP.status : 'LUNAS';

  const handleRunAICoachAnalysis = async () => {
    if (!selectedAthlete) return;
    setLoadingAnalysis(true);

    try {
      const res = await fetch('/api/ai/coach-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athlete: selectedAthlete,
          recentScores,
          attendanceRate: attRate,
          sppStatus,
          requestedTopic: selectedTopic,
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (error) {
      console.error('Error generating AI coach analysis:', error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleRunDiagnostic = async () => {
    setLoadingDiagnostic(true);
    try {
      const res = await fetch('/api/ai/grouping-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupingPattern: selectedDefect,
          division: selectedAthlete?.division || 'Horsebow',
          distance: 30,
        }),
      });
      const data = await res.json();
      if (data.success && data.diagnostic) {
        setDiagnosticResult(data.diagnostic);
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
    } finally {
      setLoadingDiagnostic(false);
    }
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputChat.trim();
    if (!messageText || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setInputChat('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ sender: m.sender, text: m.text })),
          athleteContext: {
            name: selectedAthlete?.name,
            division: selectedAthlete?.division,
            drawWeight: selectedAthlete?.equipment?.drawWeightLbs,
            thumbRing: selectedAthlete?.equipment?.thumbRingType,
            khatra: selectedAthlete?.equipment?.khatraStyle,
            attendanceRate: attRate,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Mohon maaf, terjadi gangguan jaringan saat menghubungi AI Coach. Silakan coba lagi.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const quickQuestions = [
    'Bagaimana cara dorongan khatra yang benar agar panah tidak fishtailing?',
    'Tips melatih blind nocking cepat di bawah 2 detik untuk Fast Shooting?',
    'Cara menjaga seat balance di pelana saat canter pada track HBA?',
    'Bagaimana mengatasi Target Panic (gemetar saat anchor)?',
    'Cara menentukan spine arrow bambu yang pas untuk busur 40 lbs?',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>Coach AI Al-Fatih</span>
              </span>
              <span className="text-xs text-amber-300 font-medium">Model: Gemini 3.7 Flash</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Pusat Analisis & Konsultan AI Panahan Tradisional
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Evaluasi biomekanika Thumb Draw, analisis 6 topik Horsebow, simulasi track HBA, diagnostik grouping, hingga konsultasi teknik langsung.
            </p>
          </div>

          {/* Athlete Selector on Header */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-amber-400" />
              <select
                value={selectedAthleteId}
                onChange={(e) => {
                  setSelectedAthleteId(e.target.value);
                  setAnalysisResult(null);
                }}
                className="bg-slate-900 border border-slate-700 text-xs sm:text-sm font-bold text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.division})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunAICoachAnalysis}
              disabled={loadingAnalysis}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-amber-500/20 transition disabled:opacity-50"
            >
              {loadingAnalysis ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
              <span>{loadingAnalysis ? 'Menganalisis...' : 'Analisis AI'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 mt-6 border-t border-slate-800 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('eval')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'eval'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Evaluasi & Rapor AI</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Tanya Pelatih AI (Chat)</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'diagnostic'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Diagnostik Grouping Panah</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EVALUASI PERFORMA & RAPOR AI                                       */}
      {/* ========================================================================= */}
      {activeTab === 'eval' && (
        <div className="space-y-6">
          {/* Athlete Quick Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Atlit Terpilih</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{selectedAthlete?.name}</div>
              <div className="text-xs text-slate-500">{selectedAthlete?.division} • {selectedAthlete?.ageCategory}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Peralatan Busur</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">{selectedAthlete?.equipment?.drawWeightLbs || 35} lbs</div>
              <div className="text-xs text-slate-500">{selectedAthlete?.equipment?.thumbRingType || 'Ottoman'} / {selectedAthlete?.equipment?.khatraStyle || 'Forward'}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Disiplin Absensi</span>
              <div className="text-base font-bold text-emerald-600 mt-0.5">{attRate}% Kehadiran</div>
              <div className="text-xs text-slate-500">{hadirCount} dari {totalAtt} sesi latihan</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Administrasi SPP</span>
              <div className={`text-base font-bold mt-0.5 ${sppStatus === 'LUNAS' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {sppStatus === 'LUNAS' ? 'LUNAS (Tertib)' : 'Menunggu SPP'}
              </div>
              <div className="text-xs text-slate-500">Iuran Rutin Bulanan</div>
            </div>
          </div>

          {/* Analysis Result Output */}
          {analysisResult ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Grade: {analysisResult.performanceGrade || 'A'}
                    </span>
                    <span className="text-xs text-slate-400">• Dievaluasi dengan AI Archery Logic</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 mt-1">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>{analysisResult.title}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{analysisResult.summary}</p>
                </div>

                <button
                  onClick={handleRunAICoachAnalysis}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200 self-start sm:self-auto transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Analisis Ulang</span>
                </button>
              </div>

              {/* Technique Ratings Bars if available */}
              {analysisResult.techniqueRating && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span>Estimasi Penguasaan Teknik Biomekanika Horsebow</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Thumb Draw & Release</span>
                        <span className="font-bold">{analysisResult.techniqueRating.thumbDrawRelease || 85}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysisResult.techniqueRating.thumbDrawRelease || 85}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Aksi Khatra</span>
                        <span className="font-bold">{analysisResult.techniqueRating.khatraAction || 80}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${analysisResult.techniqueRating.khatraAction || 80}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Anchor Stability</span>
                        <span className="font-bold">{analysisResult.techniqueRating.anchorStability || 82}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analysisResult.techniqueRating.anchorStability || 82}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Equitation / Kuda</span>
                        <span className="font-bold">{analysisResult.techniqueRating.equitationBalance || 80}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${analysisResult.techniqueRating.equitationBalance || 80}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span>Fast Nocking Speed</span>
                        <span className="font-bold">{analysisResult.techniqueRating.fastShootingSpeed || 88}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${analysisResult.techniqueRating.fastShootingSpeed || 88}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3 Columns: Strengths, Areas to Improve, Drills */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Kekuatan & Poin Positif</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysisResult.strengths?.map((str: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas to Improve */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Fokus Perbaikan Form</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysisResult.areasToImprove?.map((area: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Drills Recommended */}
                <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Dumbbell className="w-4 h-4 text-sky-600" />
                    <span>Menu Latihan Khusus (Drills)</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysisResult.drillsRecommended?.map((drill: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-sky-600 font-bold">•</span>
                        <span>{drill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Coach Motivation & Administration Box */}
              <div className="bg-slate-900 text-white rounded-xl p-5 flex items-start space-x-3.5 shadow-md">
                <Lightbulb className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Instruksi Resmi Pelatih Kepala & Pesan untuk Wali Atlet:
                  </h5>
                  <p className="text-xs text-slate-200 mt-1 italic leading-relaxed">{analysisResult.coachNote}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Mulai Evaluasi AI untuk {selectedAthlete?.name}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  AI Coach akan menganalisis data riwayat scoring 6 topik, draw weight, spesifikasi khatra, dan kedisiplinan presensi untuk menyusun evaluasi komprehensif.
                </p>
              </div>
              <button
                onClick={handleRunAICoachAnalysis}
                disabled={loadingAnalysis}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition"
              >
                {loadingAnalysis ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
                <span>Jalankan Analisis AI Sekarang</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TANYA PELATIH AI (LIVE CHAT ASSISTANT)                             */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[640px]">
          {/* Chat Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                  <span>Coach Al-Fatih AI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h4>
                <p className="text-[11px] text-slate-300">
                  Konsultasi Teknik Panahan Horsebow & HBA • Konteks: <span className="text-amber-400 font-bold">{selectedAthlete?.name}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setChatMessages([
                  {
                    id: 'msg-reset',
                    sender: 'ai',
                    text: 'Percakapan telah direset. Ada hal teknis seputar panahan Horse Bow yang ingin Anda tanyakan?',
                    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              Reset Chat
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1 whitespace-nowrap pl-1">
              <HelpCircle className="w-3 h-3" />
              <span>Topik Cepat:</span>
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChatMessage(q)}
                className="text-[11px] font-medium bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-full px-3 py-1 whitespace-nowrap transition shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <div>{msg.text}</div>
                  <div
                    className={`text-[10px] mt-1 text-right font-mono ${
                      msg.sender === 'user' ? 'text-purple-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs bg-white p-3 rounded-2xl border border-slate-200 max-w-xs">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Coach Al-Fatih sedang mengetik balasan...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={inputChat}
              onChange={(e) => setInputChat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              placeholder="Ketik pertanyaan teknik panahan, khatra, busur, atau equitation..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleSendChatMessage()}
              disabled={!inputChat.trim() || chatLoading}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DIAGNOSTIK POLA GROUPING & DEVIASI PANAH                           */}
      {/* ========================================================================= */}
      {activeTab === 'diagnostic' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-amber-500" />
              <span>Diagnostik Pola Grouping & Gejala Kesalahan Form Biomekanika</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih deviasi perkenaan anak panah pada sasaran atau gejala mekanik tubuh untuk mendapatkan analisis penyebab dan langkah koreksi seketika.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Gejala / Deviasi Grouping Sasaran:
              </label>
              <select
                value={selectedDefect}
                onChange={(e) => setSelectedDefect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="Panah grouping condong di kiri bawah (Low-Left)">
                  Panah grouping condong di kiri bawah (Low-Left)
                </option>
                <option value="Panah grouping condong di kanan atas (High-Right)">
                  Panah grouping condong di kanan atas (High-Right)
                </option>
                <option value="Thumb Ring Slip / Kuncian Ibu Jari goyang saat release">
                  Thumb Ring Slip / Kuncian Ibu Jari goyang saat release
                </option>
                <option value="Aksi Khatra kurang mendorong sehingga panah fishtailing / menabrak riser busur">
                  Aksi Khatra kurang mendorong sehingga panah fishtailing / menabrak riser busur
                </option>
                <option value="Tembakan HBA sudut belakang (Kassai Shot) meleset ke atas">
                  Tembakan HBA sudut belakang (Kassai Shot) meleset ke atas
                </option>
                <option value="Blind Nocking terhambat / nock susah masuk ke string saat Fast Shooting">
                  Blind Nocking terhambat / nock susah masuk ke string saat Fast Shooting
                </option>
                <option value="Keseimbangan duduk di pelana (Seat Balance) bergoyang saat kuda canter">
                  Keseimbangan duduk di pelana (Seat Balance) bergoyang saat kuda canter
                </option>
                <option value="Panah menyebar vertikal melebar (atas dan bawah)">
                  Panah menyebar vertikal melebar (atas dan bawah)
                </option>
                <option value="Bahu busur (bow shoulder) naik saat tarikan penuh (full draw)">
                  Bahu busur (bow shoulder) naik saat tarikan penuh (full draw)
                </option>
              </select>

              <button
                onClick={handleRunDiagnostic}
                disabled={loadingDiagnostic}
                className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
              >
                {loadingDiagnostic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4 text-amber-400" />}
                <span>Diagnosa Penyebab & Solusi</span>
              </button>
            </div>

            {/* Visual Guide Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400">Tips Lapangan Pelatih</span>
                <h5 className="text-xs font-bold mt-1">Konsistensi Rambu Tembakan</h5>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Sebagian besar deviasi pada busur Horsebow tanpa sight disebabkan oleh tekanan grip tangan kiri yang berubah-ubah dan pelepasan ibu jari yang tidak mulus.
                </p>
              </div>
              <div className="text-[10px] text-amber-300 font-medium mt-3 border-t border-indigo-800/80 pt-2">
                Selalu lakukan 10 panah pemanasan jarak 5m sebelum scoring jarak jauh.
              </div>
            </div>
          </div>

          {diagnosticResult && (
            <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div>
                <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Penyebab Mekanika / Tuning:</span>
                </h5>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">{diagnosticResult.cause}</p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Langkah Koreksi & Solusi Pelatih:</span>
                </h5>
                <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">{diagnosticResult.solution}</p>
              </div>

              {diagnosticResult.quickChecklist && (
                <div>
                  <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Checklist Cepat di Lapangan:
                  </h5>
                  <ul className="mt-1.5 space-y-1.5 text-xs text-slate-700 pl-1">
                    {diagnosticResult.quickChecklist.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
