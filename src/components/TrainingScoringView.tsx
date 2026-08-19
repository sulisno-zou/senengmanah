import React, { useState, useEffect, useRef } from 'react';
import {
  Target,
  Plus,
  Award,
  Calendar,
  Crosshair,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  Zap,
  Lock,
  Sparkles,
  Trophy,
  Flame,
  Activity,
  Play,
  Pause,
  Timer,
  Shield,
  Gauge,
  Compass,
  Footprints,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { Athlete, TrainingSession, EndScore, ArrowHit, UserAccount, HorseBowTopic, HBATrackShot } from '../types';
import { formatDateIndo, getArrowNumericValue } from '../utils/formatters';
import { TargetFaceVisualizer } from './TargetFaceVisualizer';

interface TrainingScoringViewProps {
  athletes: Athlete[];
  trainingSessions: TrainingSession[];
  currentUser: UserAccount;
  onAddTrainingSession: (session: TrainingSession) => void;
  onDeleteTrainingSession: (id: string) => void;
}

export const TrainingScoringView: React.FC<TrainingScoringViewProps> = ({
  athletes,
  trainingSessions,
  currentUser,
  onAddTrainingSession,
  onDeleteTrainingSession,
}) => {
  const isAthleteOnly = currentUser.role === 'atlit';
  const canScore =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'pelatih_utama' ||
    currentUser.role === 'pelatih' ||
    currentUser.role === 'pelatih_atlit';

  const [activeSubTab, setActiveSubTab] = useState<'input' | 'history'>(
    isAthleteOnly ? 'history' : 'input'
  );
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
  const [filterAthleteHistory, setFilterAthleteHistory] = useState<string>(
    isAthleteOnly && currentUser.athleteId ? currentUser.athleteId : 'ALL'
  );
  const [filterTopicHistory, setFilterTopicHistory] = useState<string>('ALL');

  // SELECTED TOPIC FOR HORSE BOW EVALUATION
  const [selectedTopic, setSelectedTopic] = useState<HorseBowTopic>('Latihan Rutin');

  // General Session State
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [weatherCondition, setWeatherCondition] = useState<string>('Cerah & Tenang');
  const [physicalCondition, setPhysicalCondition] = useState<string>('Sangat Baik');
  const [coachEvaluation, setCoachEvaluation] = useState('');

  // Horsebow Technique & Equipment State
  const [techniqueStyle, setTechniqueStyle] = useState<string>('Thumb Draw (Jempol)');
  const [khatraStyle, setKhatraStyle] = useState<string>('Forward Khatra');
  const [distanceMeters, setDistanceMeters] = useState<number>(30);
  const [targetFaceType, setTargetFaceType] = useState<string>('80cm (10-Ring)');

  // 1. LATIHAN RUTIN & 2. PERSIAPAN LOMBA: Standard Ends & Arrows
  const totalEnds = 6;
  const arrowsPerEnd = 6;
  const [currentEndIndex, setCurrentEndIndex] = useState<number>(0);
  const [endsData, setEndsData] = useState<(number | 'X' | 'M')[][]>(
    Array.from({ length: totalEnds }, () => [])
  );
  const [arrowHits, setArrowHits] = useState<ArrowHit[]>([]);

  // 2. PERSIAPAN LOMBA SPECIFIC STATE
  const [championshipFormat, setChampionshipFormat] = useState<string>('WHAF World Championship Standard');
  const [competitionCategory, setCompetitionCategory] = useState<string>('Horsebow On-Foot Putra (30m)');

  // 3. HBA (HORSEBACK ARCHERY) SPECIFIC STATE
  const [hbaTrackType, setHbaTrackType] = useState<string>('Korean Style (90m - 3 Target: Front, Side, Back)');
  const [hbaTimeLimitSeconds, setHbaTimeLimitSeconds] = useState<number>(14.0);
  const [hbaTrackTimeSeconds, setHbaTrackTimeSeconds] = useState<number>(11.8);
  const [hbaTrackShots, setHbaTrackShots] = useState<HBATrackShot[]>([
    { targetIndex: 1, targetName: 'Target 1 (Front 45°)', angle: 'Front (Maju)', score: 5 },
    { targetIndex: 2, targetName: 'Target 2 (Side 90°)', angle: 'Side (Samping)', score: 5 },
    { targetIndex: 3, targetName: 'Target 3 (Back/Kassai 135°)', angle: 'Back (Kassai/Belakang)', score: 4 },
  ]);

  // 4. BERKUDA (HORSE RIDING & EQUITATION) SPECIFIC STATE
  const [horseName, setHorseName] = useState<string>('Bintang Timur');
  const [gaitType, setGaitType] = useState<'Walk (Jalan)' | 'Trot (Trot)' | 'Canter (Canter)' | 'Gallop (Lari Kencang)'>('Canter (Canter)');
  const [seatBalanceScore, setSeatBalanceScore] = useState<number>(88);
  const [reinsControlScore, setReinsControlScore] = useState<number>(85);
  const [gaitRhythmSyncScore, setGaitRhythmSyncScore] = useState<number>(90);
  const [postureScore, setPostureScore] = useState<number>(87);
  const [ridingEvaluationNotes, setRidingEvaluationNotes] = useState<string>('Keseimbangan duduk di pelana sangat stabil saat canter. Kendali tali kekang satu tangan aman saat nocking anak panah.');

  // 5. FAST SHOOTING (SPEED SHOOTING) SPECIFIC STATE & STOPWATCH
  const [fastShootingMode, setFastShootingMode] = useState<string>('30 Detik Speed Test');
  const [fastShootingTimeLimit, setFastShootingTimeLimit] = useState<number>(30);
  const [fastShootingArrowsCount, setFastShootingArrowsCount] = useState<number>(6);
  const [fastShootingHitCount, setFastShootingHitCount] = useState<number>(5);
  const [fastShootingTotalPoints, setFastShootingTotalPoints] = useState<number>(42);
  const [blindNockingRating, setBlindNockingRating] = useState<'S' | 'A' | 'B' | 'C'>('A');
  
  // Stopwatch for Fast Shooting
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const handleStartStopTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  // 6. DYNAMIC ARCHERY SPECIFIC STATE
  const [dynamicCourseName, setDynamicCourseName] = useState<string>('Tactical Obstacle Course (3 Posisi + 5 Target)');
  const [dynamicObstacleCount, setDynamicObstacleCount] = useState<number>(4);
  const [dynamicCourseTimeSeconds, setDynamicCourseTimeSeconds] = useState<number>(34.5);
  const [dynamicTargetHits, setDynamicTargetHits] = useState<number>(5);
  const [dynamicTotalTargets, setDynamicTotalTargets] = useState<number>(5);
  const [dynamicAgilityScore, setDynamicAgilityScore] = useState<number>(90);
  const [dynamicTargetPoints, setDynamicTargetPoints] = useState<number>(46);

  // Standard Ends Calculation
  const calculatedEnds: EndScore[] = endsData.map((arrows, idx) => {
    const endTotal = arrows.reduce((sum: number, val) => sum + getArrowNumericValue(val), 0);
    return {
      endNumber: idx + 1,
      arrows: [...arrows],
      endTotal,
      runningTotal: 0,
    };
  });

  let running = 0;
  calculatedEnds.forEach((end) => {
    running += end.endTotal;
    end.runningTotal = running;
  });

  const totalStandardScore = running;
  const allArrowsFlat = endsData.flat();
  const totalArrowsCount = allArrowsFlat.length;
  const xCount = allArrowsFlat.filter((a) => a === 'X').length;
  const tensCount = allArrowsFlat.filter((a) => a === 10 || a === 'X').length;
  const goldCount = allArrowsFlat.filter((a) => a === 'X' || a === 10 || a === 9).length;
  const goldPercentage = totalArrowsCount > 0 ? Number(((goldCount / totalArrowsCount) * 100).toFixed(1)) : 0;
  const avgPerArrow = totalArrowsCount > 0 ? Number((totalStandardScore / totalArrowsCount).toFixed(2)) : 0;

  // HBA Score Calculation: Target Points + Speed Bonus
  const hbaRawTargetScore = hbaTrackShots.reduce((sum, shot) => sum + getArrowNumericValue(shot.score), 0);
  const hbaSpeedBonus = hbaTrackTimeSeconds > 0 && hbaTrackTimeSeconds < hbaTimeLimitSeconds
    ? Number((hbaTimeLimitSeconds - hbaTrackTimeSeconds).toFixed(1))
    : 0;
  const hbaTotalScore = Number((hbaRawTargetScore + hbaSpeedBonus).toFixed(1));

  // Berkuda Equitation Average
  const berkudaAverageScore = Math.round(
    (seatBalanceScore + reinsControlScore + gaitRhythmSyncScore + postureScore) / 4
  );

  // Fast Shooting Speed per Arrow
  const fastShootingTimeUsed = timerSeconds > 0 ? timerSeconds : 24.5;
  const speedPerArrowSeconds = fastShootingArrowsCount > 0
    ? Number((fastShootingTimeUsed / fastShootingArrowsCount).toFixed(2))
    : 0;

  // Dynamic Total Score
  const dynamicTotalScore = dynamicTargetPoints;

  // Keypad click for Standard / Persiapan Lomba
  const handleScoreInput = (val: number | 'X' | 'M') => {
    const currentEndArrows = endsData[currentEndIndex];
    if (currentEndArrows.length >= arrowsPerEnd) {
      if (currentEndIndex < totalEnds - 1) {
        setCurrentEndIndex(currentEndIndex + 1);
        const nextEnd = [...endsData[currentEndIndex + 1], val];
        const newEnds = [...endsData];
        newEnds[currentEndIndex + 1] = nextEnd;
        setEndsData(newEnds);
      }
      return;
    }

    const updatedCurrent = [...currentEndArrows, val];
    const newEnds = [...endsData];
    newEnds[currentEndIndex] = updatedCurrent;
    setEndsData(newEnds);

    if (updatedCurrent.length === arrowsPerEnd && currentEndIndex < totalEnds - 1) {
      setCurrentEndIndex(currentEndIndex + 1);
    }
  };

  const handleUndo = () => {
    const currentEndArrows = endsData[currentEndIndex];
    if (currentEndArrows.length > 0) {
      const updated = currentEndArrows.slice(0, -1);
      const newEnds = [...endsData];
      newEnds[currentEndIndex] = updated;
      setEndsData(newEnds);
      if (arrowHits.length > 0) {
        setArrowHits(arrowHits.slice(0, -1));
      }
    } else if (currentEndIndex > 0) {
      const prevEnd = currentEndIndex - 1;
      setCurrentEndIndex(prevEnd);
      const updated = endsData[prevEnd].slice(0, -1);
      const newEnds = [...endsData];
      newEnds[prevEnd] = updated;
      setEndsData(newEnds);
      if (arrowHits.length > 0) {
        setArrowHits(arrowHits.slice(0, -1));
      }
    }
  };

  const handleReset = () => {
    if (confirm('Reset seluruh nilai scoring sesi ini?')) {
      setEndsData(Array.from({ length: totalEnds }, () => []));
      setCurrentEndIndex(0);
      setArrowHits([]);
    }
  };

  const handleAddTargetHit = (hit: ArrowHit) => {
    handleScoreInput(hit.score);
    setArrowHits([...arrowHits, hit]);
  };

  // Update HBA Shot
  const handleUpdateHBAShot = (index: number, score: number | 'X' | 'M') => {
    const updated = [...hbaTrackShots];
    updated[index] = { ...updated[index], score };
    setHbaTrackShots(updated);
  };

  // Add HBA Target
  const handleAddHBATarget = () => {
    const newTargetIdx = hbaTrackShots.length + 1;
    setHbaTrackShots([
      ...hbaTrackShots,
      {
        targetIndex: newTargetIdx,
        targetName: `Target ${newTargetIdx} (Multi-angle)`,
        angle: 'Side (Samping)',
        score: 5,
      },
    ]);
  };

  // SAVE SESSION ACCORDING TO TOPIC
  const handleSaveSession = () => {
    const athlete = athletes.find((a) => a.id === selectedAthleteId);
    if (!athlete) return;

    let finalTotalScore = 0;
    let finalMaxPossible = 0;
    let finalRoundType = '';

    if (selectedTopic === 'Latihan Rutin') {
      if (totalArrowsCount === 0) {
        alert('Masukkan minimal 1 nilai panah untuk menyimpan sesi Latihan Rutin.');
        return;
      }
      finalTotalScore = totalStandardScore;
      finalMaxPossible = totalEnds * arrowsPerEnd * 10;
      finalRoundType = `Horsebow Latihan Rutin ${distanceMeters}m (${totalEnds}x${arrowsPerEnd})`;
    } else if (selectedTopic === 'Persiapan Lomba') {
      if (totalArrowsCount === 0) {
        alert('Masukkan minimal 1 nilai panah untuk sesi Persiapan Lomba.');
        return;
      }
      finalTotalScore = totalStandardScore;
      finalMaxPossible = totalEnds * arrowsPerEnd * 10;
      finalRoundType = `Simulasi Lomba: ${championshipFormat}`;
    } else if (selectedTopic === 'HBA') {
      finalTotalScore = Math.round(hbaTotalScore);
      finalMaxPossible = (hbaTrackShots.length * 5) + Math.round(hbaTimeLimitSeconds);
      finalRoundType = `HBA Track: ${hbaTrackType}`;
    } else if (selectedTopic === 'Berkuda') {
      finalTotalScore = berkudaAverageScore;
      finalMaxPossible = 100;
      finalRoundType = `Equitation & Horse Riding: ${gaitType} (${horseName})`;
    } else if (selectedTopic === 'FAST SHOOTING') {
      finalTotalScore = fastShootingTotalPoints;
      finalMaxPossible = fastShootingArrowsCount * 10;
      finalRoundType = `Fast Shooting: ${fastShootingMode} (${fastShootingArrowsCount} Panah)`;
    } else if (selectedTopic === 'DYNAMIC') {
      finalTotalScore = dynamicTotalScore;
      finalMaxPossible = dynamicTotalTargets * 10;
      finalRoundType = `Dynamic Archery: ${dynamicCourseName}`;
    }

    const newSession: TrainingSession = {
      id: `ts-${Date.now()}`,
      athleteId: athlete.id,
      athleteName: athlete.name,
      date: sessionDate,
      topic: selectedTopic,
      distanceMeters,
      targetFaceType,
      roundType: finalRoundType,
      sessionType: selectedTopic === 'HBA' ? 'HBA (Horseback Archery)' : selectedTopic === 'Berkuda' ? 'Berkuda & Equitation' : selectedTopic === 'FAST SHOOTING' ? 'Fast Shooting' : selectedTopic === 'DYNAMIC' ? 'Dynamic Archery' : 'Latihan Rutin',
      ends: (selectedTopic === 'Latihan Rutin' || selectedTopic === 'Persiapan Lomba') ? calculatedEnds : [],
      totalScore: finalTotalScore,
      maxPossibleScore: finalMaxPossible,
      tensCount: (selectedTopic === 'Latihan Rutin' || selectedTopic === 'Persiapan Lomba') ? tensCount : undefined,
      xCount: (selectedTopic === 'Latihan Rutin' || selectedTopic === 'Persiapan Lomba') ? xCount : undefined,
      averagePerArrow: (selectedTopic === 'Latihan Rutin' || selectedTopic === 'Persiapan Lomba') ? avgPerArrow : (finalTotalScore / (fastShootingArrowsCount || 5)),
      goldPercentage: (selectedTopic === 'Latihan Rutin' || selectedTopic === 'Persiapan Lomba') ? goldPercentage : undefined,
      arrowHitsCoordinates: arrowHits,
      weatherCondition,
      physicalCondition,
      coachEvaluation: coachEvaluation || undefined,
      createdAt: new Date().toISOString(),

      // Horsebow specs
      techniqueStyle,
      khatraStyle,

      // Specific topic data
      championshipFormat: selectedTopic === 'Persiapan Lomba' ? championshipFormat : undefined,
      competitionCategory: selectedTopic === 'Persiapan Lomba' ? competitionCategory : undefined,

      hbaTrackType: selectedTopic === 'HBA' ? hbaTrackType : undefined,
      hbaTrackTimeSeconds: selectedTopic === 'HBA' ? hbaTrackTimeSeconds : undefined,
      hbaTimeLimitSeconds: selectedTopic === 'HBA' ? hbaTimeLimitSeconds : undefined,
      hbaTimeBonus: selectedTopic === 'HBA' ? hbaSpeedBonus : undefined,
      hbaTrackShots: selectedTopic === 'HBA' ? hbaTrackShots : undefined,

      horseName: selectedTopic === 'Berkuda' ? horseName : undefined,
      gaitType: selectedTopic === 'Berkuda' ? gaitType : undefined,
      seatBalanceScore: selectedTopic === 'Berkuda' ? seatBalanceScore : undefined,
      reinsControlScore: selectedTopic === 'Berkuda' ? reinsControlScore : undefined,
      gaitRhythmSyncScore: selectedTopic === 'Berkuda' ? gaitRhythmSyncScore : undefined,
      postureScore: selectedTopic === 'Berkuda' ? postureScore : undefined,
      ridingEvaluationNotes: selectedTopic === 'Berkuda' ? ridingEvaluationNotes : undefined,

      fastShootingMode: selectedTopic === 'FAST SHOOTING' ? fastShootingMode : undefined,
      timeElapsedSeconds: selectedTopic === 'FAST SHOOTING' ? fastShootingTimeUsed : undefined,
      timeLimitSeconds: selectedTopic === 'FAST SHOOTING' ? fastShootingTimeLimit : undefined,
      fastShootingArrowsCount: selectedTopic === 'FAST SHOOTING' ? fastShootingArrowsCount : undefined,
      fastShootingHitCount: selectedTopic === 'FAST SHOOTING' ? fastShootingHitCount : undefined,
      blindNockingRating: selectedTopic === 'FAST SHOOTING' ? blindNockingRating : undefined,
      speedScorePerArrow: selectedTopic === 'FAST SHOOTING' ? speedPerArrowSeconds : undefined,

      dynamicCourseName: selectedTopic === 'DYNAMIC' ? dynamicCourseName : undefined,
      dynamicObstacleCount: selectedTopic === 'DYNAMIC' ? dynamicObstacleCount : undefined,
      dynamicCourseTimeSeconds: selectedTopic === 'DYNAMIC' ? dynamicCourseTimeSeconds : undefined,
      dynamicAgilityScore: selectedTopic === 'DYNAMIC' ? dynamicAgilityScore : undefined,
      dynamicTargetHits: selectedTopic === 'DYNAMIC' ? dynamicTargetHits : undefined,
    };

    onAddTrainingSession(newSession);
    alert(`Berhasil menyimpan skor penilaian Horse Bow [${selectedTopic}] untuk atlet ${athlete.name}!`);
    handleReset();
    setActiveSubTab('history');
  };

  // Filtered history
  const filteredHistory = trainingSessions.filter((s) => {
    const matchesAthlete = filterAthleteHistory === 'ALL' || s.athleteId === filterAthleteHistory;
    const matchesTopic = filterTopicHistory === 'ALL' || s.topic === filterTopicHistory || (filterTopicHistory === 'Latihan Rutin' && !s.topic);
    return matchesAthlete && matchesTopic;
  });

  // History Chart Data
  const historyChartData = (
    filterAthleteHistory === 'ALL'
      ? trainingSessions.slice(0, 10)
      : trainingSessions.filter((s) => s.athleteId === filterAthleteHistory)
  )
    .slice(-8)
    .map((s) => ({
      date: s.date.slice(5),
      atlet: s.athleteName.split(' ')[0],
      topik: s.topic || 'Latihan Rutin',
      skor: s.totalScore,
    }));

  const topicConfigs: {
    id: HorseBowTopic;
    name: string;
    badgeLabel: string;
    icon: any;
    color: string;
    bgHover: string;
    borderActive: string;
    desc: string;
  }[] = [
    {
      id: 'Latihan Rutin',
      name: 'Latihan Rutin',
      badgeLabel: 'ROUTINE',
      icon: Target,
      color: 'from-pink-500 to-rose-600',
      bgHover: 'hover:border-pink-300',
      borderActive: 'border-pink-500 bg-pink-50/80 text-pink-700',
      desc: 'Form Thumb Draw, Khatra, Akurasi Target Face (10m - 70m)',
    },
    {
      id: 'Persiapan Lomba',
      name: 'Persiapan Lomba',
      badgeLabel: 'COMPETITION',
      icon: Trophy,
      color: 'from-amber-500 to-orange-600',
      bgHover: 'hover:border-amber-300',
      borderActive: 'border-amber-500 bg-amber-50/80 text-amber-700',
      desc: 'Simulasi Regulasi WHAF/IHAA/KPBI & Scoring Tekanan Tinggi',
    },
    {
      id: 'HBA',
      name: 'HBA',
      badgeLabel: 'HORSEBACK ARCHERY',
      icon: Compass,
      color: 'from-purple-600 to-indigo-600',
      bgHover: 'hover:border-purple-300',
      borderActive: 'border-purple-500 bg-purple-50/80 text-purple-700',
      desc: 'Lintasan Korean 90m, Turkish Qabaq, Kassai 99m & Speed Bonus',
    },
    {
      id: 'Berkuda',
      name: 'Berkuda',
      badgeLabel: 'EQUITATION',
      icon: Shield,
      color: 'from-emerald-500 to-teal-600',
      bgHover: 'hover:border-emerald-300',
      borderActive: 'border-emerald-500 bg-emerald-50/80 text-emerald-700',
      desc: 'Keseimbangan Pelana, Ritme Canter/Gallop & Kendali Kekang',
    },
    {
      id: 'FAST SHOOTING',
      name: 'FAST SHOOTING',
      badgeLabel: 'SPEED SHOOTING',
      icon: Flame,
      color: 'from-red-500 to-rose-600',
      bgHover: 'hover:border-red-300',
      borderActive: 'border-red-500 bg-red-50/80 text-red-700',
      desc: 'Stopwatch Timer, Blind Nocking, Detik/Panah & Repetisi Cepat',
    },
    {
      id: 'DYNAMIC',
      name: 'DYNAMIC',
      badgeLabel: 'DYNAMIC COURSE',
      icon: Footprints,
      color: 'from-blue-600 to-cyan-600',
      bgHover: 'hover:border-blue-300',
      borderActive: 'border-blue-500 bg-blue-50/80 text-blue-700',
      desc: 'Tembak Berlari, Obstacle/Rintangan, 360° & Posisi Jongkok',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Sub-Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-pink-500/20">
              <Crosshair className="w-4 h-4" />
            </div>
            <span>Penilaian & Scoring Khusus Atlit HORSE BOW</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mendukung 6 topik penilaian spesifik: <strong>Latihan Rutin</strong>, <strong>Persiapan Lomba</strong>, <strong>HBA</strong>, <strong>Berkuda</strong>, <strong>FAST SHOOTING</strong>, dan <strong>DYNAMIC</strong>
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {canScore && (
            <button
              onClick={() => setActiveSubTab('input')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
                activeSubTab === 'input'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Penilaian Baru</span>
            </button>
          )}
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              activeSubTab === 'history'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isAthleteOnly ? 'Hasil Latihan Saya' : 'Riwayat & Rekap Nilai'}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'input' && canScore ? (
        /* SCORING INPUT SCREEN */
        <div className="space-y-6">
          {/* TOPIC SELECTOR BAR - 6 HORSE BOW TOPICS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-pink-600 flex items-center space-x-1.5">
                <Layers className="w-4 h-4" />
                <span>Pilih Topik Penilaian Horse Bow Yang Diuji:</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Topik Aktif: <strong className="text-slate-900">{selectedTopic}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {topicConfigs.map((topic) => {
                const IconComponent = topic.icon;
                const isSelected = selectedTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? `${topic.borderActive} shadow-sm ring-2 ring-pink-500/20`
                        : `bg-slate-50/70 border-slate-200 text-slate-700 ${topic.bgHover} hover:bg-white`
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-tr ${topic.color} shadow-xs`}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-white/80 font-mono' : 'bg-slate-200/60 text-slate-600'
                          }`}
                        >
                          {topic.badgeLabel}
                        </span>
                      </div>
                      <h4 className="text-xs font-black leading-snug">{topic.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {topic.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN FORM CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Common Settings & Dynamic Topic Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Athlete & Base Specs */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                  <Crosshair className="w-4 h-4 text-pink-600" />
                  <span>Identitas Atlet & Teknik Horse Bow</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Pilih Atlet Horsebow</label>
                    <select
                      value={selectedAthleteId}
                      onChange={(e) => setSelectedAthleteId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-pink-500"
                    >
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.division})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Gaya Tarikan (Draw Style)</label>
                    <select
                      value={techniqueStyle}
                      onChange={(e) => setTechniqueStyle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-pink-500"
                    >
                      <option value="Thumb Draw (Jempol / Thumb Ring)">Thumb Draw (Jempol / Thumb Ring)</option>
                      <option value="Slavic Draw">Slavic Draw</option>
                      <option value="Mediterranean (3 Jari)">Mediterranean (3 Jari)</option>
                      <option value="Index Draw">Index Draw</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Aksi Khatra Busur</label>
                    <select
                      value={khatraStyle}
                      onChange={(e) => setKhatraStyle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-pink-500"
                    >
                      <option value="Forward Khatra (Dorong Maju)">Forward Khatra (Dorong Maju)</option>
                      <option value="Side Khatra (Samping Luar)">Side Khatra (Samping Luar)</option>
                      <option value="Diagonal Khatra (Miring 45°)">Diagonal Khatra (Miring 45°)</option>
                      <option value="None / Tanpa Khatra">None / Tanpa Khatra</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DYNAMIC TOPIC-SPECIFIC MODULE */}
              {selectedTopic === 'Latihan Rutin' && (
                /* TOPIC 1: LATIHAN RUTIN */
                <div className="space-y-6">
                  {/* Routine Specs */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Pengaturan Jarak & Sasaran Latihan Rutin</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Jarak Tembak (Meter)</label>
                        <select
                          value={distanceMeters}
                          onChange={(e) => setDistanceMeters(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-pink-500"
                        >
                          <option value={10}>10 Meter (Drill Form / Pemula)</option>
                          <option value={15}>15 Meter (Latihan Rutin Dasar)</option>
                          <option value={20}>20 Meter (Standar Horsebow U-15)</option>
                          <option value={30}>30 Meter (Standar Horsebow Nasional On-Foot)</option>
                          <option value={40}>40 Meter (Standar Menengah)</option>
                          <option value={50}>50 Meter (Jarak Jauh Horsebow)</option>
                          <option value={70}>70 Meter (Tradisional Long Range)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Jenis Target Face</label>
                        <select
                          value={targetFaceType}
                          onChange={(e) => setTargetFaceType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-pink-500"
                        >
                          <option value="80cm (10-Ring)">80cm (10-Ring World Archery)</option>
                          <option value="122cm (10-Ring)">122cm (10-Ring)</option>
                          <option value="40cm Single Spot">40cm Single Spot</option>
                          <option value="Target Tradisional 3-Zone">Target Tradisional 3-Zone (Kuning/Merah/Biru)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Standard Scorecard */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                        <span>Lembar Skor Latihan Rutin (36 Panah)</span>
                      </h3>
                      <span className="text-xs text-pink-700 font-bold bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full">
                        Seri #{currentEndIndex + 1} Aktif
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                            <th className="p-2 text-left">Seri</th>
                            <th className="p-2">1</th>
                            <th className="p-2">2</th>
                            <th className="p-2">3</th>
                            <th className="p-2">4</th>
                            <th className="p-2">5</th>
                            <th className="p-2">6</th>
                            <th className="p-2 bg-slate-100 font-bold text-slate-700">Total</th>
                            <th className="p-2 bg-slate-200 font-bold text-slate-900">Kumulatif</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {calculatedEnds.map((end, idx) => {
                            const isActive = idx === currentEndIndex;
                            return (
                              <tr
                                key={idx}
                                onClick={() => setCurrentEndIndex(idx)}
                                className={`cursor-pointer transition ${
                                  isActive ? 'bg-pink-50/70 border-l-4 border-pink-500' : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="p-2 text-left font-bold text-slate-900">Seri #{idx + 1}</td>
                                {[0, 1, 2, 3, 4, 5].map((arrowIdx) => {
                                  const val = end.arrows[arrowIdx];
                                  const isGold = val === 10 || val === 'X' || val === 9;
                                  const isRed = val === 8 || val === 7;
                                  const isBlue = val === 6 || val === 5;
                                  const isMiss = val === 'M';

                                  return (
                                    <td key={arrowIdx} className="p-2">
                                      <span
                                        className={`inline-block w-7 h-7 leading-7 rounded-lg font-mono font-bold text-xs ${
                                          val === undefined
                                            ? 'bg-slate-100 text-slate-400'
                                            : isGold
                                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                                            : isRed
                                            ? 'bg-rose-600 text-white'
                                            : isBlue
                                            ? 'bg-sky-600 text-white'
                                            : isMiss
                                            ? 'bg-slate-100 text-rose-500 font-bold'
                                            : 'bg-slate-700 text-white'
                                        }`}
                                      >
                                        {val !== undefined ? val : '-'}
                                      </span>
                                    </td>
                                  );
                                })}
                                <td className="p-2 bg-slate-50 font-bold font-mono text-slate-900">
                                  {end.endTotal || 0}
                                </td>
                                <td className="p-2 bg-slate-100 font-bold font-mono text-slate-950">
                                  {end.runningTotal || 0}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {selectedTopic === 'Persiapan Lomba' && (
                /* TOPIC 2: PERSIAPAN LOMBA */
                <div className="space-y-6">
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      <span>Parameter Regulasi Kejuaraan & Kompetisi</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Format / Asosiasi Kejuaraan</label>
                        <select
                          value={championshipFormat}
                          onChange={(e) => setChampionshipFormat(e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                        >
                          <option value="WHAF World Championship Standard">WHAF (World Horseback Archery Federation)</option>
                          <option value="IHAA (International Horseback Archery Alliance)">IHAA Competition Standard</option>
                          <option value="KPBI / FESPATI / PERDANA On Foot">KPBI / FESPATI / PERDANA (Nasional)</option>
                          <option value="Kejurda Panahan Tradisional Jatim">Kejurda Panahan Tradisional Jatim</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Kategori Tanding</label>
                        <select
                          value={competitionCategory}
                          onChange={(e) => setCompetitionCategory(e.target.value)}
                          className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                        >
                          <option value="Horsebow On-Foot Putra (30m)">Horsebow On-Foot Putra (30m)</option>
                          <option value="Horsebow On-Foot Putri (30m)">Horsebow On-Foot Putri (30m)</option>
                          <option value="Horsebow Pelajar U-15 (20m)">Horsebow Pelajar U-15 (20m)</option>
                          <option value="Serial Fast Shooting 5 Arrows">Serial Fast Shooting 5 Arrows</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Scorecard Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                        <span>Scorecard Kualifikasi Lomba (36 Panah)</span>
                      </h3>
                      <span className="text-xs text-amber-800 font-bold bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        Seri #{currentEndIndex + 1} Aktif
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                            <th className="p-2 text-left">Seri</th>
                            <th className="p-2">1</th>
                            <th className="p-2">2</th>
                            <th className="p-2">3</th>
                            <th className="p-2">4</th>
                            <th className="p-2">5</th>
                            <th className="p-2">6</th>
                            <th className="p-2 bg-slate-100 font-bold text-slate-700">Total</th>
                            <th className="p-2 bg-slate-200 font-bold text-slate-900">Kumulatif</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {calculatedEnds.map((end, idx) => (
                            <tr
                              key={idx}
                              onClick={() => setCurrentEndIndex(idx)}
                              className={`cursor-pointer transition ${
                                idx === currentEndIndex ? 'bg-amber-50/70 border-l-4 border-amber-500' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="p-2 text-left font-bold text-slate-900">Seri #{idx + 1}</td>
                              {[0, 1, 2, 3, 4, 5].map((arrowIdx) => {
                                const val = end.arrows[arrowIdx];
                                return (
                                  <td key={arrowIdx} className="p-2">
                                    <span
                                      className={`inline-block w-7 h-7 leading-7 rounded-lg font-mono font-bold text-xs ${
                                        val === undefined
                                          ? 'bg-slate-100 text-slate-400'
                                          : val === 10 || val === 'X' || val === 9
                                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                                          : val === 8 || val === 7
                                          ? 'bg-rose-600 text-white'
                                          : val === 'M'
                                          ? 'bg-slate-100 text-rose-500'
                                          : 'bg-slate-700 text-white'
                                      }`}
                                    >
                                      {val !== undefined ? val : '-'}
                                    </span>
                                  </td>
                                );
                              })}
                              <td className="p-2 bg-slate-50 font-bold font-mono text-slate-900">{end.endTotal || 0}</td>
                              <td className="p-2 bg-slate-100 font-bold font-mono text-slate-950">{end.runningTotal || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {selectedTopic === 'HBA' && (
                /* TOPIC 3: HBA (HORSEBACK ARCHERY TRACK) */
                <div className="space-y-6">
                  <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-purple-800 uppercase tracking-widest flex items-center space-x-2">
                      <Compass className="w-4 h-4 text-purple-600" />
                      <span>Konfigurasi Lintasan Track HBA & Waktu Tempuh Kuda</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-bold mb-1">Jenis Lintasan HBA</label>
                        <select
                          value={hbaTrackType}
                          onChange={(e) => setHbaTrackType(e.target.value)}
                          className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                        >
                          <option value="Korean Style (90m - 3 Target: Front, Side, Back)">Korean Style (90m - 3 Target: Front, Side, Back)</option>
                          <option value="Turkish Qabaq (Tiang Tinggi 8-9m)">Turkish Qabaq (Tiang Tinggi 8-9m)</option>
                          <option value="Hungarian Kassai Track (99m)">Hungarian Kassai Track (99m Multiple Targets)</option>
                          <option value="Polish Style Meandering Track (200m)">Polish Style Meandering Track (200m)</option>
                          <option value="Serial 5 Target Fast Track">Serial 5 Target Fast Track</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Batas Waktu (Detik)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={hbaTimeLimitSeconds}
                          onChange={(e) => setHbaTimeLimitSeconds(Number(e.target.value))}
                          className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-purple-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Waktu Tempuh Lintasan (Detik)</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.1"
                            value={hbaTrackTimeSeconds}
                            onChange={(e) => setHbaTrackTimeSeconds(Number(e.target.value))}
                            className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-slate-900 font-black text-sm focus:outline-none focus:border-purple-500 font-mono"
                          />
                          <span className="text-slate-500 font-bold">Detik</span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-purple-200 flex flex-col justify-center text-center">
                        <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Bonus Kecepatan (Speed Bonus)</span>
                        <p className="text-lg font-black text-purple-700 font-mono">+{hbaSpeedBonus} Pts</p>
                      </div>
                    </div>
                  </div>

                  {/* Target Shots Breakdown */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span>Hasil Tembakan Target Lintasan HBA</span>
                      </h4>
                      <button
                        onClick={handleAddHBATarget}
                        className="text-xs text-purple-600 font-bold hover:underline flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Target</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {hbaTrackShots.map((shot, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                              {idx + 1}
                            </span>
                            <div>
                              <strong className="text-slate-900 block">{shot.targetName}</strong>
                              <span className="text-[10px] text-slate-500">Sudut: {shot.angle}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {[5, 4, 3, 2, 1, 'M'].map((scoreVal) => (
                              <button
                                key={scoreVal}
                                onClick={() => handleUpdateHBAShot(idx, scoreVal as any)}
                                className={`w-8 h-8 rounded-lg font-bold font-mono transition ${
                                  shot.score === scoreVal
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                {scoreVal}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span>Total Skor HBA (Target + Waktu):</span>
                      <span className="text-xl font-black text-purple-700 font-mono">
                        {hbaTotalScore} <span className="text-xs text-slate-400 font-normal">Poin</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedTopic === 'Berkuda' && (
                /* TOPIC 4: BERKUDA (HORSE RIDING & EQUITATION) */
                <div className="space-y-6">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>Data Kuda & Karakter Langkah (Gait)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Nama Kuda Tunggangan</label>
                        <input
                          type="text"
                          value={horseName}
                          onChange={(e) => setHorseName(e.target.value)}
                          placeholder="Misal: Bintang Timur, Ksatria Batu"
                          className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Gaya Langkah Kuda (Gait)</label>
                        <select
                          value={gaitType}
                          onChange={(e) => setGaitType(e.target.value as any)}
                          className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Canter (Canter)">Canter (Canter - Standar HBA)</option>
                          <option value="Gallop (Lari Kencang)">Gallop (Lari Kencang / Fast Speed)</option>
                          <option value="Trot (Trot)">Trot (Trot / Lari Kecil)</option>
                          <option value="Walk (Jalan)">Walk (Jalan Santai)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Equitation Rubric Sliders */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Rubrik Penilaian Kemahiran Berkuda (1 - 100)</span>
                    </h4>

                    <div className="space-y-4 text-xs">
                      {/* Seat Balance */}
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-slate-700">1. Keseimbangan Duduk di Pelana (Seat Balance & Pelvis)</span>
                          <strong className="text-emerald-700 font-mono">{seatBalanceScore}/100</strong>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={seatBalanceScore}
                          onChange={(e) => setSeatBalanceScore(Number(e.target.value))}
                          className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Reins Control */}
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-slate-700">2. Kendali Tali Kekang Satu Tangan (Reins Control with Bow)</span>
                          <strong className="text-emerald-700 font-mono">{reinsControlScore}/100</strong>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={reinsControlScore}
                          onChange={(e) => setReinsControlScore(Number(e.target.value))}
                          className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Gait & Rhythm Sync */}
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-slate-700">3. Sinkronisasi Irama Langkah Kuda dengan Pelepasan Panah</span>
                          <strong className="text-emerald-700 font-mono">{gaitRhythmSyncScore}/100</strong>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={gaitRhythmSyncScore}
                          onChange={(e) => setGaitRhythmSyncScore(Number(e.target.value))}
                          className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Posture */}
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-slate-700">4. Postur Tegak Tubuh & Ayunan Bahu (Posture Alignment)</span>
                          <strong className="text-emerald-700 font-mono">{postureScore}/100</strong>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={postureScore}
                          onChange={(e) => setPostureScore(Number(e.target.value))}
                          className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Indeks Kemahiran Berkuda:</span>
                      <span className="text-xl font-black text-emerald-700 font-mono">{berkudaAverageScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></span>
                    </div>
                  </div>
                </div>
              )}

              {selectedTopic === 'FAST SHOOTING' && (
                /* TOPIC 5: FAST SHOOTING */
                <div className="space-y-6">
                  {/* Stopwatch Module */}
                  <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest flex items-center space-x-2">
                        <Timer className="w-4 h-4 text-red-600" />
                        <span>Stopwatch Timer Tembak Cepat (Fast Nocking)</span>
                      </h4>
                      <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                        {fastShootingMode}
                      </span>
                    </div>

                    <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
                      <span className="text-4xl sm:text-5xl font-mono font-black text-amber-400 tracking-wider">
                        {timerSeconds.toFixed(1)} <span className="text-lg text-slate-400 font-sans">detik</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleStartStopTimer}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition ${
                            timerRunning
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{timerRunning ? 'Jeda Timer' : 'Mulai Timer'}</span>
                        </button>
                        <button
                          onClick={handleResetTimer}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Mode Uji Tembak Cepat</label>
                        <select
                          value={fastShootingMode}
                          onChange={(e) => setFastShootingMode(e.target.value)}
                          className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-red-500"
                        >
                          <option value="30 Detik Speed Test">30 Detik Speed Test</option>
                          <option value="60 Detik Speed Test">60 Detik Speed Test</option>
                          <option value="5 Arrows Blind Nocking Test">5 Arrows Blind Nocking Test</option>
                          <option value="Speed & Precision Duel">Speed & Precision Duel</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Rating Blind Nocking</label>
                        <select
                          value={blindNockingRating}
                          onChange={(e) => setBlindNockingRating(e.target.value as any)}
                          className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-red-500"
                        >
                          <option value="S">Grade S (Sangat Cepat & Mulus {'<'} 3.0s/panah)</option>
                          <option value="A">Grade A (Cepat & Konsisten 3.0s - 4.5s)</option>
                          <option value="B">Grade B (Cukup Baik 4.5s - 6.5s)</option>
                          <option value="C">Grade C (Perlu Drill Nocking {'>'} 6.5s)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Fast Shooting Results Input */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-red-600" />
                      <span>Hasil Jumlah Panah & Poin Akurasi</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Jumlah Panah Ditembak</label>
                        <input
                          type="number"
                          value={fastShootingArrowsCount}
                          onChange={(e) => setFastShootingArrowsCount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Jumlah Panah Mengenai Sasaran (Hit)</label>
                        <input
                          type="number"
                          value={fastShootingHitCount}
                          onChange={(e) => setFastShootingHitCount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Total Poin Skor Sasaran</label>
                        <input
                          type="number"
                          value={fastShootingTotalPoints}
                          onChange={(e) => setFastShootingTotalPoints(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Kecepatan Rata2/Panah</span>
                        <p className="text-base font-black text-red-600 font-mono">{speedPerArrowSeconds}s / panah</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Akurasi Hit</span>
                        <p className="text-base font-black text-emerald-600 font-mono">
                          {fastShootingArrowsCount > 0 ? Math.round((fastShootingHitCount / fastShootingArrowsCount) * 100) : 0}%
                        </p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Grade Blind Nock</span>
                        <p className="text-base font-black text-purple-600 font-mono">Grade {blindNockingRating}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTopic === 'DYNAMIC' && (
                /* TOPIC 6: DYNAMIC */
                <div className="space-y-6">
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest flex items-center space-x-2">
                      <Footprints className="w-4 h-4 text-blue-600" />
                      <span>Rute & Course Tembakan Dinamis (Tactical Dynamic)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-700 font-bold mb-1">Pilihan Course Dinamis</label>
                        <select
                          value={dynamicCourseName}
                          onChange={(e) => setDynamicCourseName(e.target.value)}
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                        >
                          <option value="Tactical Obstacle Course (3 Posisi + 5 Target)">Tactical Obstacle Course (3 Posisi + 5 Target)</option>
                          <option value="Running & Shooting Track 30m">Running & Shooting Track 30m</option>
                          <option value="360° Multi-Angle Hunt Simulation">360° Multi-Angle Hunt Simulation</option>
                          <option value="Kneeling & Behind Cover Speed Shoot">Kneeling & Behind Cover Speed Shoot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Jumlah Rintangan</label>
                        <input
                          type="number"
                          value={dynamicObstacleCount}
                          onChange={(e) => setDynamicObstacleCount(Number(e.target.value))}
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-blue-200/60">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Waktu Selesai Course (Detik)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={dynamicCourseTimeSeconds}
                          onChange={(e) => setDynamicCourseTimeSeconds(Number(e.target.value))}
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Target Berhasil Kena (Hit)</label>
                        <input
                          type="number"
                          value={dynamicTargetHits}
                          onChange={(e) => setDynamicTargetHits(Number(e.target.value))}
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Total Poin Skor Dynamic</label>
                        <input
                          type="number"
                          value={dynamicTargetPoints}
                          onChange={(e) => setDynamicTargetPoints(Number(e.target.value))}
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agility & Mobility Rating */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-blue-600" />
                      <span>Skor Kelincahan & Mobilitas (Agility)</span>
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-slate-700">Kelincahan Perpindahan Posisi & Stabilitas Menembak Saat Bergerak:</span>
                          <strong className="text-blue-700 font-mono">{dynamicAgilityScore}/100</strong>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={dynamicAgilityScore}
                          onChange={(e) => setDynamicAgilityScore(Number(e.target.value))}
                          className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coach Evaluation & Save Button */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan & Evaluasi Khusus Pelatih (Topik: {selectedTopic})
                  </label>
                  <textarea
                    rows={2}
                    value={coachEvaluation}
                    onChange={(e) => setCoachEvaluation(e.target.value)}
                    placeholder={`Misal untuk ${selectedTopic}: Pelepasan khatra stabil, kecepatan nocking terkontrol...`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSession}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-pink-500/20 transition transform active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Simpan Penilaian {selectedTopic}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Keypad / Plotting / Live Summary */}
            <div className="lg:col-span-5 space-y-6">
              {(selectedTopic === 'Latihan Rutin' || selectedTopic === 'Persiapan Lomba') && (
                <>
                  {/* Archery Keypad Controller */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Keypad Nilai Perkenaan Panah
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleUndo}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Undo</span>
                        </button>
                        <button
                          onClick={handleReset}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition"
                          title="Reset Form"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Buttons Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      <button
                        onClick={() => handleScoreInput('X')}
                        className="py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base shadow-xs transition transform active:scale-95 border border-amber-300"
                      >
                        X (10*)
                      </button>
                      <button
                        onClick={() => handleScoreInput(10)}
                        className="py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base shadow-xs transition transform active:scale-95 border border-amber-300"
                      >
                        10
                      </button>
                      <button
                        onClick={() => handleScoreInput(9)}
                        className="py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base shadow-xs transition transform active:scale-95 border border-amber-300"
                      >
                        9
                      </button>
                      <button
                        onClick={() => handleScoreInput(8)}
                        className="py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base shadow-xs transition transform active:scale-95"
                      >
                        8
                      </button>
                      <button
                        onClick={() => handleScoreInput(7)}
                        className="py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base shadow-xs transition transform active:scale-95"
                      >
                        7
                      </button>
                      <button
                        onClick={() => handleScoreInput(6)}
                        className="py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-base shadow-xs transition transform active:scale-95"
                      >
                        6
                      </button>
                      <button
                        onClick={() => handleScoreInput(5)}
                        className="py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-base shadow-xs transition transform active:scale-95"
                      >
                        5
                      </button>
                      <button
                        onClick={() => handleScoreInput(4)}
                        className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base shadow-xs transition transform active:scale-95"
                      >
                        4
                      </button>
                      <button
                        onClick={() => handleScoreInput(3)}
                        className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base shadow-xs transition transform active:scale-95"
                      >
                        3
                      </button>
                      <button
                        onClick={() => handleScoreInput(2)}
                        className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-base shadow-xs transition transform active:scale-95 border border-slate-300"
                      >
                        2
                      </button>
                      <button
                        onClick={() => handleScoreInput(1)}
                        className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-base shadow-xs transition transform active:scale-95 border border-slate-300"
                      >
                        1
                      </button>
                      <button
                        onClick={() => handleScoreInput('M')}
                        className="py-3.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 font-black text-base shadow-xs transition transform active:scale-95 border border-slate-200"
                      >
                        M (0)
                      </button>
                    </div>
                  </div>

                  {/* Target Face Visualizer */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col items-center">
                    <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
                      <Target className="w-4 h-4 text-pink-500" />
                      <span>Simulasi Plotting Target Face</span>
                    </h3>
                    <p className="text-xs text-slate-500 text-center mb-4">
                      Klik target face untuk merekam perkenaan panah & menganalisis grouping
                    </p>

                    <TargetFaceVisualizer
                      arrowHits={arrowHits}
                      onAddHit={handleAddTargetHit}
                      interactive={true}
                      currentEndNumber={currentEndIndex + 1}
                      currentArrowNumber={endsData[currentEndIndex].length + 1}
                      size={280}
                    />
                  </div>
                </>
              )}

              {/* Horse Bow Guidelines Card */}
              <div className="bg-slate-900 text-white border border-pink-500/30 rounded-2xl p-5 text-xs space-y-3 shadow-lg">
                <h4 className="font-black text-pink-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-pink-400" />
                  <span>Kriteria Penilaian Horse Bow ({selectedTopic})</span>
                </h4>

                {selectedTopic === 'Latihan Rutin' && (
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• <strong>Thumb Draw:</strong> Kunci ibu jari terkunci rapat di pangkal jari telunjuk.</li>
                    <li>• <strong>Khatra:</strong> Gerakan dorong & buang busur selaras arah panah.</li>
                    <li>• <strong>Konsistensi Anchor:</strong> Titik jangkar di sudut bibir / rahang stabil.</li>
                  </ul>
                )}

                {selectedTopic === 'Persiapan Lomba' && (
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• <strong>Regulasi WHAF:</strong> Penalti pelanggaran garis tembak ketat.</li>
                    <li>• <strong>Manajemen Waktu:</strong> Rilis di bawah batas waktu 10-14 detik/end.</li>
                    <li>• <strong>Standar Passing Grade:</strong> Target skor minimum 280+ / 360.</li>
                  </ul>
                )}

                {selectedTopic === 'HBA' && (
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• <strong>Korean Style 90m:</strong> Target 1 (Front), Target 2 (Side), Target 3 (Back/Kassai).</li>
                    <li>• <strong>Speed Bonus:</strong> 1 detik lebih cepat dari batas waktu = +1.0 poin bonus.</li>
                    <li>• <strong>Tembakan Kassai:</strong> Menembak sasaran belakang saat kuda melaju kencang.</li>
                  </ul>
                )}

                {selectedTopic === 'Berkuda' && (
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• <strong>Seat Balance:</strong> Panggul menyerap ketukan langkah kuda (canter sync).</li>
                    <li>• <strong>Reins Control:</strong> Memegang tali kekang bersamaan busur & anak panah di tangan kiri.</li>
                    <li>• <strong>Keamanan:</strong> Kuda tetap dalam track lintasan lurus tanpa deviasi.</li>
                  </ul>
                )}

                {selectedTopic === 'FAST SHOOTING' && (
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• <strong>Blind Nocking:</strong> Memasang anak panah ke string tanpa menoleh/melihat tangan.</li>
                    <li>• <strong>Speed Target:</strong> Lepaskan 6 anak panah akurat dalam {'<'} 30 detik.</li>
                    <li>• <strong>Holding Arrows:</strong> Menahan 3-5 panah cadangan di tangan busur (bow hand).</li>
                  </ul>
                )}

                {selectedTopic === 'DYNAMIC' && (
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    <li>• <strong>Mobilitas:</strong> Transisi cepat dari lari ke posisi menembak stabil.</li>
                    <li>• <strong>Variasi Sudut:</strong> Akurasi tinggi dari sudut rendah (kneeling) dan 360°.</li>
                    <li>• <strong>Agility:</strong> Melewati rintangan tanpa menurunkan kesiapan busur.</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* HISTORY & ANALYTICS SCREEN */
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-600">Atlet:</span>
                <select
                  value={filterAthleteHistory}
                  onChange={(e) => setFilterAthleteHistory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-pink-500"
                >
                  {!isAthleteOnly && <option value="ALL">Semua Atlet Klub</option>}
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.division})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-600">Topik Penilaian:</span>
                <select
                  value={filterTopicHistory}
                  onChange={(e) => setFilterTopicHistory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-pink-500"
                >
                  <option value="ALL">Semua 6 Topik Horse Bow</option>
                  <option value="Latihan Rutin">🎯 Latihan Rutin</option>
                  <option value="Persiapan Lomba">🏆 Persiapan Lomba</option>
                  <option value="HBA">🏇 HBA (Horseback Archery)</option>
                  <option value="Berkuda">🐎 Berkuda (Equitation)</option>
                  <option value="FAST SHOOTING">⚡ FAST SHOOTING</option>
                  <option value="DYNAMIC">🏃 DYNAMIC</option>
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Total {filteredHistory.length} sesi penilaian tercatat
            </span>
          </div>

          {/* Progression Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-pink-600" />
              <span>Grafik Perkembangan Skor Penilaian Horse Bow</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="skor"
                    name="Skor / Poin"
                    stroke="#EC4899"
                    strokeWidth={3}
                    dot={{ fill: '#EC4899', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History Score Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistory.map((session) => {
              const topic = session.topic || 'Latihan Rutin';
              const topicBadgeColor =
                topic === 'Persiapan Lomba'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : topic === 'HBA'
                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : topic === 'Berkuda'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : topic === 'FAST SHOOTING'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : topic === 'DYNAMIC'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-pink-100 text-pink-800 border-pink-200';

              return (
                <div
                  key={session.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-pink-300 transition"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-slate-900 text-base">{session.athleteName}</h4>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${topicBadgeColor}`}>
                            {topic}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDateIndo(session.date)} • {session.roundType || 'Sesi Horse Bow'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          {session.totalScore}
                        </span>
                        <span className="text-xs text-slate-400 font-mono"> Poin</span>
                      </div>
                    </div>

                    {/* TOPIC SPECIFIC METRICS BADGES */}
                    {topic === 'HBA' && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs bg-purple-50/70 border border-purple-100 p-2.5 rounded-xl">
                        <div>
                          <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">WAKTU TRACK</span>
                          <p className="font-bold text-slate-900 font-mono">{session.hbaTrackTimeSeconds || 11.8}s</p>
                        </div>
                        <div>
                          <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">SPEED BONUS</span>
                          <p className="font-bold text-purple-700 font-mono">+{session.hbaTimeBonus || 2.2} pts</p>
                        </div>
                        <div>
                          <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider">LINTASAN</span>
                          <p className="font-bold text-slate-800 text-[10px] truncate">{session.hbaTrackType ? session.hbaTrackType.split('(')[0] : 'Korean 90m'}</p>
                        </div>
                      </div>
                    )}

                    {topic === 'Berkuda' && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl">
                        <div>
                          <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">KUDA</span>
                          <p className="font-bold text-slate-900">{session.horseName || 'Bintang Timur'}</p>
                        </div>
                        <div>
                          <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">GAIT</span>
                          <p className="font-bold text-emerald-700">{session.gaitType ? session.gaitType.split('(')[0] : 'Canter'}</p>
                        </div>
                        <div>
                          <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">BALANCE</span>
                          <p className="font-bold text-slate-900 font-mono">{session.seatBalanceScore || 88}/100</p>
                        </div>
                      </div>
                    )}

                    {topic === 'FAST SHOOTING' && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs bg-red-50/70 border border-red-100 p-2.5 rounded-xl">
                        <div>
                          <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider">PANAH TEMBAK</span>
                          <p className="font-bold text-slate-900 font-mono">{session.fastShootingArrowsCount || 6} Panah</p>
                        </div>
                        <div>
                          <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider">BLIND NOCK</span>
                          <p className="font-bold text-red-600 font-mono">Grade {session.blindNockingRating || 'A'}</p>
                        </div>
                        <div>
                          <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider">WAKTU/PANAH</span>
                          <p className="font-bold text-slate-900 font-mono">{session.speedScorePerArrow || 4.1}s</p>
                        </div>
                      </div>
                    )}

                    {topic === 'DYNAMIC' && (
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs bg-blue-50/70 border border-blue-100 p-2.5 rounded-xl">
                        <div>
                          <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">WAKTU COURSE</span>
                          <p className="font-bold text-slate-900 font-mono">{session.dynamicCourseTimeSeconds || 34.5}s</p>
                        </div>
                        <div>
                          <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">TARGET HIT</span>
                          <p className="font-bold text-blue-700 font-mono">{session.dynamicTargetHits || 5} Hit</p>
                        </div>
                        <div>
                          <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">AGILITY</span>
                          <p className="font-bold text-slate-900 font-mono">{session.dynamicAgilityScore || 90}/100</p>
                        </div>
                      </div>
                    )}

                    {(topic === 'Latihan Rutin' || topic === 'Persiapan Lomba') && session.tensCount !== undefined && (
                      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">TOTAL X</span>
                          <p className="font-bold text-amber-600">{session.xCount || 0}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">10s + Xs</span>
                          <p className="font-bold text-slate-900">{session.tensCount || 0}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">GOLD %</span>
                          <p className="font-bold text-emerald-600">{session.goldPercentage || 0}%</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">RATA2/PANAH</span>
                          <p className="font-bold text-purple-600">{(session.averagePerArrow || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    )}

                    {/* Coach Evaluation */}
                    {session.coachEvaluation && (
                      <div className="mt-3 p-3 bg-pink-50/70 rounded-xl text-xs text-slate-700 italic border-l-3 border-pink-500">
                        "{session.coachEvaluation}"
                      </div>
                    )}
                  </div>

                  {!isAthleteOnly && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm('Hapus catatan sesi penilaian ini?')) {
                            onDeleteTrainingSession(session.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
                        title="Hapus Sesi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
