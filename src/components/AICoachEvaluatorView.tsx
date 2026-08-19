import React, { useState } from 'react';
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
} from 'lucide-react';
import { Athlete, TrainingSession, SPPPayment, AttendanceRecord, AICoachAnalysis } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface AICoachEvaluatorViewProps {
  athletes: Athlete[];
  trainingSessions: TrainingSession[];
  sppPayments: SPPPayment[];
  attendanceRecords: AttendanceRecord[];
}

export const AICoachEvaluatorView: React.FC<AICoachEvaluatorViewProps> = ({
  athletes,
  trainingSessions,
  sppPayments,
  attendanceRecords,
}) => {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AICoachAnalysis | null>(null);

  // Grouping diagnostic tool
  const [selectedDefect, setSelectedDefect] = useState<string>(
    'Panah grouping condong di kiri bawah (Low-Left)'
  );
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  const recentScores = trainingSessions
    .filter((s) => s.athleteId === selectedAthlete?.id)
    .slice(0, 4);

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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
              AI Archery Master Coach
            </span>
            <span className="text-xs text-slate-400 font-medium">Powered by Gemini AI Model</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Evaluasi Performa & Konsultan Teknik Panahan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Analisis terintegrasi dari data scoring uji tanding, spesifikasi draw weight, kebiasaan perkenaan panah, hingga disiplin absensi & administrasi.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <select
            value={selectedAthleteId}
            onChange={(e) => {
              setSelectedAthleteId(e.target.value);
              setAnalysisResult(null);
            }}
            className="bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
          >
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.division})
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAICoachAnalysis}
            disabled={loadingAnalysis}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xs transition disabled:opacity-50"
          >
            {loadingAnalysis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loadingAnalysis ? 'Menganalisis...' : 'Analisis AI'}</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Output Area */}
      {analysisResult ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>{analysisResult.title}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{analysisResult.summary}</p>
            </div>
            <button
              onClick={handleRunAICoachAnalysis}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider border border-slate-200 self-start sm:self-auto transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Analisis Ulang</span>
            </button>
          </div>

          {/* 3 Columns: Strengths, Areas to Improve, Drills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strengths */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kekuatan & Poin Positif</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysisResult.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Fokus Perbaikan Form</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysisResult.areasToImprove?.map((area, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Drills Recommended */}
            <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Dumbbell className="w-4 h-4 text-sky-600" />
                <span>Menu Latihan Khusus (Drills)</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {analysisResult.drillsRecommended?.map((drill, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-sky-600 font-bold">•</span>
                    <span>{drill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coach Motivation & Administration Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-slate-900">Catatan Pelatih untuk Orang Tua & Atlit:</h5>
              <p className="text-xs text-slate-600 mt-1 italic leading-relaxed">{analysisResult.coachNote}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Belum ada analisis untuk {selectedAthlete?.name}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Klik tombol di bawah untuk meminta AI Coach mengevaluasi riwayat scoring uji tanding, data peralatan busur, dan kedisiplinan atlit secara otomatis.
          </p>
          <button
            onClick={handleRunAICoachAnalysis}
            disabled={loadingAnalysis}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs uppercase tracking-wider shadow-xs transition"
          >
            {loadingAnalysis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Mulai Evaluasi AI Atlit</span>
          </button>
        </div>
      )}

      {/* Interactive Form & Grouping Diagnostic Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-amber-500" />
            <span>Diagnostik Pola Tembakan & Gejala Kesalahan Form</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih gejala deviasi perkenaan anak panah atau kendala mekanika tubuh untuk mendapatkan solusi korektif
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pilih Gejala / Pola Grouping yang Terjadi:
            </label>
            <select
              value={selectedDefect}
              onChange={(e) => setSelectedDefect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:border-amber-500"
            >
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
              <option value="Panah grouping condong di kiri bawah (Low-Left)">
                Panah grouping condong di kiri bawah (Low-Left)
              </option>
              <option value="Panah menyebar vertikal melebar (atas dan bawah)">
                Panah menyebar vertikal melebar (atas dan bawah)
              </option>
              <option value="Bahu busur (bow shoulder) naik saat tarikan penuh (full draw)">
                Bahu busur (bow shoulder) naik saat tarikan penuh (full draw)
              </option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunDiagnostic}
              disabled={loadingDiagnostic}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition shadow-xs disabled:opacity-50"
            >
              {loadingDiagnostic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4 text-amber-400" />}
              <span>Diagnosa Masalah</span>
            </button>
          </div>
        </div>

        {diagnosticResult && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div>
              <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Penyebab Mekanika / Tuning:
              </h5>
              <p className="text-xs text-slate-700 mt-1">{diagnosticResult.cause}</p>
            </div>
            <div>
              <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Langkah Koreksi & Solusi Pelatih:
              </h5>
              <p className="text-xs text-slate-700 mt-1">{diagnosticResult.solution}</p>
            </div>
            {diagnosticResult.quickChecklist && (
              <div>
                <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Checklist Cepat di Lapangan:
                </h5>
                <ul className="mt-1 space-y-1 text-xs text-slate-700 pl-2">
                  {diagnosticResult.quickChecklist.map((item: string, idx: number) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
