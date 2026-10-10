import React, { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Trophy, 
  Zap, 
  Layers,
  Award,
  ChevronDown,
  Sparkles,
  BookmarkCheck,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Activity
} from 'lucide-react';
import { CompletedWorkout, Exercise, Routine, CardioSession } from '../types';
import { getExerciseStatsFromHistory, formatWorkoutDuration } from '../utils/calc';
import { downloadFile, exportWorkoutHistoryToCSV } from '../utils/routineTransfer';
import { loadCardioSessions } from '../utils/storage';
import { soundFx } from '../utils/audio';
import { AchievementsSection } from './AchievementsSection';
import { MonthlyWrappedModal } from './MonthlyWrappedModal';
import { calculateMonthlyWrappedData } from '../utils/monthlyWrappedGenerator';

interface ProgressViewProps {
  exercises: Exercise[];
  history: CompletedWorkout[];
  routines?: Routine[];
  cardioSessions?: CardioSession[];
  athleteName?: string;
  accentHex?: string;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  exercises,
  history,
  routines = [],
  cardioSessions: propCardioSessions,
  athleteName = 'Atleta Thunder',
  accentHex = '#00D1C1'
}) => {
  // Extract and index all exercises that exist in user's saved routines
  const routineExercisesInfo = useMemo(() => {
    if (!routines || routines.length === 0) return [];
    
    const map = new Map<string, {
      exercise: Exercise;
      routineNames: string[];
      targetSets?: number;
      targetReps?: number;
      initialWeight?: number;
      notes?: string;
    }>();

    routines.forEach((routine) => {
      routine.exercises.forEach((item) => {
        // Look for matching exercise in library or construct an exercise object
        const found = exercises.find((e) => e.id === item.exerciseId);
        const exObj: Exercise = found || {
          id: item.exerciseId,
          name: item.exerciseName || 'Exercício',
          muscleGroup: routine.targetMuscles[0] || 'Peito',
          equipment: 'Outro',
          instructions: [],
          defaultRestSeconds: item.restSeconds || 90,
          isCustom: item.exerciseId.startsWith('custom-ex-')
        };

        if (!map.has(exObj.id)) {
          map.set(exObj.id, {
            exercise: exObj,
            routineNames: [routine.name],
            targetSets: item.setsCount,
            targetReps: item.targetReps,
            initialWeight: item.initialWeight,
            notes: item.notes
          });
        } else {
          const existing = map.get(exObj.id)!;
          if (!existing.routineNames.includes(routine.name)) {
            existing.routineNames.push(routine.name);
          }
        }
      });
    });

    return Array.from(map.values());
  }, [routines, exercises]);

  // Determine initial default exercise ID prioritizing user's routines
  const defaultExerciseId = useMemo(() => {
    if (routineExercisesInfo.length > 0) {
      // 1. Try to find a routine exercise that has been performed in history
      const sortedHistory = [...history].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );

      for (const workout of sortedHistory) {
        for (const rEx of routineExercisesInfo) {
          const inWorkout = workout.exercises.some(
            (e) => e.exerciseId === rEx.exercise.id || 
                  (rEx.exercise.name && e.exerciseName && e.exerciseName.trim().toLowerCase() === rEx.exercise.name.trim().toLowerCase())
          );
          if (inWorkout) {
            return rEx.exercise.id;
          }
        }
      }

      // 2. Otherwise pick the first exercise of the first routine
      return routineExercisesInfo[0].exercise.id;
    }

    // 3. If no routines, pick most recent from history
    if (history.length > 0 && history[0].exercises.length > 0) {
      return history[0].exercises[0].exerciseId;
    }

    // 4. Fallback to catalog
    return exercises.find((e) => e.id === 'supino-reto-barra')?.id || exercises[0]?.id || '';
  }, [routineExercisesInfo, history, exercises]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(defaultExerciseId);
  const [filterMode, setFilterMode] = useState<'all' | 'routines_only'>('routines_only');
  const [chartMetric, setChartMetric] = useState<'weight' | '1rm' | 'volume'>('weight');

  // Keep selection synchronized if current selection is empty or invalidated
  useEffect(() => {
    if (!selectedExerciseId && defaultExerciseId) {
      setSelectedExerciseId(defaultExerciseId);
    }
  }, [defaultExerciseId, selectedExerciseId]);

  // Identify current selected exercise object (either from library or from routineExercisesInfo)
  const currentRoutineInfo = useMemo(() => {
    return routineExercisesInfo.find((r) => r.exercise.id === selectedExerciseId);
  }, [routineExercisesInfo, selectedExerciseId]);

  const selectedExercise = useMemo(() => {
    return currentRoutineInfo?.exercise || exercises.find((e) => e.id === selectedExerciseId);
  }, [currentRoutineInfo, exercises, selectedExerciseId]);

  // Other exercises not currently in any routine
  const otherExercises = useMemo(() => {
    const routineIdSet = new Set(routineExercisesInfo.map((r) => r.exercise.id));
    return exercises.filter((e) => !routineIdSet.has(e.id));
  }, [exercises, routineExercisesInfo]);

  // Get historical progressive stats for the selected exercise (with ID and name fallback)
  const stats = useMemo(() => {
    if (!selectedExerciseId) return null;
    return getExerciseStatsFromHistory(selectedExerciseId, history, selectedExercise?.name);
  }, [selectedExerciseId, selectedExercise?.name, history]);

  // General global workout statistics
  const globalStats = useMemo(() => {
    const totalVolumeAll = history.reduce((acc, curr) => acc + curr.totalVolumeKg, 0);
    const totalSetsAll = history.reduce((acc, curr) => acc + curr.totalSets, 0);
    const totalWorkouts = history.length;

    // Muscle group distribution
    const muscleCount: Record<string, number> = {};
    history.forEach((w) => {
      w.exercises.forEach((ex) => {
        muscleCount[ex.muscleGroup] = (muscleCount[ex.muscleGroup] || 0) + 1;
      });
    });

    let topMuscle = 'Geral';
    let topCount = 0;
    Object.entries(muscleCount).forEach(([muscle, count]) => {
      if (count > topCount) {
        topCount = count;
        topMuscle = muscle;
      }
    });

    return { totalVolumeAll, totalSetsAll, totalWorkouts, topMuscle };
  }, [history]);

  // 7-day total volume progression data for Recharts
  const [weeklyChartType, setWeeklyChartType] = useState<'bar' | 'area'>('bar');

  const last7DaysVolumeData = useMemo(() => {
    const days: {
      dateStr: string;
      dayLabel: string;
      shortDay: string;
      formattedDate: string;
      volumeKg: number;
      setsCount: number;
      workoutNames: string[];
      isToday: boolean;
    }[] = [];

    const now = new Date();
    // Build array for the last 7 days ending today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const shortDay = weekdayNames[d.getDay()];
      const formattedDate = `${day}/${month}`;
      const dayLabel = `${shortDay}, ${formattedDate}`;

      // Filter completed workouts on this date
      const dayWorkouts = history.filter((w) => {
        const rawDate = w.completedAt || w.startedAt;
        if (!rawDate) return false;
        const wDate = new Date(rawDate);
        const wYear = wDate.getFullYear();
        const wMonth = String(wDate.getMonth() + 1).padStart(2, '0');
        const wDay = String(wDate.getDate()).padStart(2, '0');
        return `${wYear}-${wMonth}-${wDay}` === dateStr;
      });

      const volumeKg = Math.round(dayWorkouts.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0));
      const setsCount = dayWorkouts.reduce((sum, w) => sum + (w.totalSets || 0), 0);
      const workoutNames = dayWorkouts.map((w) => w.routineName).filter(Boolean);

      days.push({
        dateStr,
        dayLabel,
        shortDay,
        formattedDate,
        volumeKg,
        setsCount,
        workoutNames,
        isToday: i === 0
      });
    }

    const totalVolume7d = days.reduce((sum, d) => sum + d.volumeKg, 0);
    const activeDaysCount = days.filter((d) => d.volumeKg > 0).length;
    const avgDailyVolume = activeDaysCount > 0 ? Math.round(totalVolume7d / activeDaysCount) : 0;
    const peakDay = days.reduce((prev, curr) => (curr.volumeKg > prev.volumeKg ? curr : prev), days[0]);

    return {
      days,
      totalVolume7d,
      activeDaysCount,
      avgDailyVolume,
      peakDay
    };
  }, [history]);

  // Reference line toggle for session volume chart
  const [showAvgReferenceLine, setShowAvgReferenceLine] = useState(true);

  // ----------------------------------------------------
  // EVOLUÇÃO DO VOLUME POR SESSÃO (Gráfico de Linha Recharts)
  // ----------------------------------------------------
  const sessionVolumeChartData = useMemo(() => {
    if (!history || history.length === 0) {
      return {
        data: [],
        totalSessions: 0,
        avgVolume: 0,
        peakVolume: 0,
        firstVolume: 0,
        latestVolume: 0,
        percentChange: 0,
        peakSessionName: ''
      };
    }

    // Sort chronologically ascending (oldest first to newest)
    const sorted = [...history].sort((a, b) => {
      const timeA = new Date(a.completedAt || a.startedAt).getTime();
      const timeB = new Date(b.completedAt || b.startedAt).getTime();
      return timeA - timeB;
    });

    const data = sorted.map((workout, index) => {
      const dateObj = new Date(workout.completedAt || workout.startedAt);
      const shortDate = isNaN(dateObj.getTime())
        ? `T${index + 1}`
        : dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      const fullDate = isNaN(dateObj.getTime())
        ? ''
        : dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

      return {
        id: workout.id,
        sessionNum: index + 1,
        shortDate,
        fullDate,
        routineName: workout.routineName || 'Treino Livre',
        volumeKg: workout.totalVolumeKg || 0,
        durationSeconds: workout.durationSeconds || 0,
        totalSets: workout.totalSets || 0,
        totalReps: workout.totalReps || 0,
        prCount: workout.personalRecords?.length || 0
      };
    });

    const volumes = data.map((d) => d.volumeKg);
    const totalVolume = volumes.reduce((sum, v) => sum + v, 0);
    const avgVolume = data.length > 0 ? Math.round(totalVolume / data.length) : 0;
    const peakVolume = volumes.length > 0 ? Math.max(...volumes) : 0;
    const peakSession = data.find((d) => d.volumeKg === peakVolume);
    const firstVolume = data[0]?.volumeKg || 0;
    const latestVolume = data[data.length - 1]?.volumeKg || 0;
    const percentChange = firstVolume > 0
      ? Math.round(((latestVolume - firstVolume) / firstVolume) * 100)
      : 0;

    return {
      data,
      totalSessions: data.length,
      avgVolume,
      peakVolume,
      firstVolume,
      latestVolume,
      percentChange,
      peakSessionName: peakSession?.routineName || ''
    };
  }, [history]);

  // Export Feedback Notification State
  const [exportToast, setExportToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null);
  const [isWrappedModalOpen, setIsWrappedModalOpen] = useState(false);

  // Load cardio sessions dynamically from prop or localStorage for accurate monthly wrapped stats & export
  const cardioSessions = useMemo(() => {
    if (propCardioSessions && propCardioSessions.length > 0) return propCardioSessions;
    return loadCardioSessions();
  }, [propCardioSessions]);

  const currentMonthKey = useMemo(() => {
    return new Date().toISOString().slice(0, 7);
  }, []);

  const currentMonthWrapped = useMemo(() => {
    return calculateMonthlyWrappedData(history, currentMonthKey, cardioSessions);
  }, [history, currentMonthKey, cardioSessions]);

  const handleExportHistory = () => {
    soundFx.playTick();

    // Always load fresh cardio sessions from storage to guarantee all edits are included
    const freshCardio = loadCardioSessions();
    const effectiveCardio = freshCardio.length > 0 ? freshCardio : cardioSessions;

    const hasWorkouts = history && history.length > 0;
    const hasCardio = effectiveCardio && effectiveCardio.length > 0;

    if (!hasWorkouts && !hasCardio) {
      if (routines && routines.length > 0) {
        const csv = exportWorkoutHistoryToCSV([], routines, exercises, []);
        const today = new Date().toISOString().slice(0, 10);
        downloadFile(csv, `historico_treinos_thunder_${today}.csv`, 'text/csv;charset=utf-8;');
        soundFx.playSuccess();
        setExportToast({
          type: 'info',
          message: 'Histórico de treinos vazio: exportada a base das rotinas configuradas!'
        });
      } else {
        setExportToast({
          type: 'info',
          message: 'Nenhum treino de musculação ou cardio no histórico para exportar ainda.'
        });
      }
      return;
    }

    const csv = exportWorkoutHistoryToCSV(history, routines, exercises, effectiveCardio);
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `progresso_historico_treinos_cardio_${today}.csv`, 'text/csv;charset=utf-8;');
    soundFx.playCelebration();

    const cardioMsg = hasCardio ? ` + ${effectiveCardio.length} sessões de cardio/spinning` : '';
    setExportToast({
      type: 'success',
      message: `Progresso e histórico exportados com sucesso! (${history.length} treinos de musculação${cardioMsg} salvos em CSV)`
    });
  };

  return (
    <div id="progress-view" className="space-y-5 pb-28 pt-2">
      {/* Header with Title, Wrapped Button & Export Button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-[11px] font-black tracking-widest text-[#00D1C1] uppercase">
            ANÁLISE DE DESEMPENHO
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Progresso & Cargas
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="open-monthly-wrapped-btn"
            onClick={() => {
              soundFx.playCelebration();
              setIsWrappedModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-purple-900/40 to-[#00D1C1]/20 hover:from-purple-900/60 hover:to-[#00D1C1]/30 text-white border border-[#00D1C1]/40 transition-all shadow-lg active:scale-95 cursor-pointer group"
            title="Gerar card estilo Spotify Wrapped com a carga total acumulada e treinos no mês"
          >
            <Sparkles size={15} className="text-[#00D1C1] group-hover:rotate-12 transition-transform" />
            <span>Wrapped do Mês</span>
          </button>

          <button
            type="button"
            id="export-workout-history-header-btn"
            onClick={handleExportHistory}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black bg-[#161616] hover:bg-[#222226] text-white hover:text-[#00D1C1] border border-white/10 hover:border-[#00D1C1]/40 transition-all shadow-md active:scale-95 cursor-pointer group"
            title="Exportar histórico completo de treinos de musculação e cardio (Bicicleta Spinning) em CSV"
          >
            <Download size={15} className="text-[#00D1C1] group-hover:scale-110 transition-transform" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportToast && (
        <div
          id="export-toast-banner"
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
            exportToast.type === 'success'
              ? 'bg-[#00D1C1]/10 border-[#00D1C1]/30 text-[#00D1C1]'
              : 'bg-amber-400/10 border-amber-400/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5 font-bold">
            {exportToast.type === 'success' ? (
              <CheckCircle2 size={17} className="shrink-0 text-[#00D1C1]" />
            ) : (
              <AlertCircle size={17} className="shrink-0 text-amber-300" />
            )}
            <span>{exportToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportToast(null)}
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SPOTIFY WRAPPED MENSAL HERO CARD (DESTAQUE VISUAL PARA COMPARTILHAMENTO)   */}
      {/* ========================================================================= */}
      <div
        id="monthly-wrapped-hero-card"
        className="relative overflow-hidden bg-gradient-to-br from-[#12131A] via-[#161722] to-[#0D0E14] border border-[#00D1C1]/40 rounded-3xl p-5 shadow-2xl space-y-4"
      >
        {/* Glow ambient blurs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00D1C1]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D1C1] animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00D1C1]">
              RETROSPECTIVA DO MÊS · ESTILO SPOTIFY WRAPPED
            </span>
          </div>
          <span className="text-xs font-black font-mono-numbers text-white px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10">
            {currentMonthWrapped.monthNamePT.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
          {/* Card 1: Volume Acumulado */}
          <div className="bg-[#181922] p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block">
              Carga Total Acumulada
            </span>
            <div className="text-2xl font-black font-mono-numbers text-white mt-1">
              {currentMonthWrapped.totalVolumeKg.toLocaleString('pt-BR')} <span className="text-xs text-neutral-400 font-bold">kg</span>
            </div>
            <p className="text-[11px] text-[#00D1C1] font-medium mt-1 truncate" title={currentMonthWrapped.comparisonText}>
              {currentMonthWrapped.comparisonIcon} {currentMonthWrapped.comparisonText}
            </p>
          </div>

          {/* Card 2: Treinos no Mês */}
          <div className="bg-[#181922] p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block">
              Treinos no Mês
            </span>
            <div className="text-2xl font-black font-mono-numbers text-[#00D1C1] mt-1">
              {currentMonthWrapped.workoutsCount} <span className="text-xs text-white font-bold">sessões</span>
            </div>
            <p className="text-[11px] text-neutral-300 font-medium mt-1">
              Média de {currentMonthWrapped.averageWeeklyFrequency} treinos / semana
            </p>
          </div>

          {/* Card 3: Tempo & Calorias */}
          <div className="bg-[#181922] p-3.5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase block">
              Dedicado & Calorias
            </span>
            <div className="text-2xl font-black font-mono-numbers text-amber-300 mt-1">
              ~{currentMonthWrapped.estimatedCalories.toLocaleString('pt-BR')} <span className="text-xs text-amber-400 font-bold">kcal</span>
            </div>
            <p className="text-[11px] text-neutral-300 font-medium mt-1">
              ⏱ {formatWorkoutDuration(currentMonthWrapped.totalDurationSeconds)} no ferro
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="pt-1 flex items-center justify-between flex-wrap gap-3 relative z-10">
          <p className="text-xs text-neutral-300">
            Gere o card vertical para Instagram Stories ou Feed com seus números acumulados do mês.
          </p>
          <button
            type="button"
            id="generate-wrapped-card-btn"
            onClick={() => {
              soundFx.playCelebration();
              setIsWrappedModalOpen(true);
            }}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-[#00D1C1] via-[#00f0de] to-emerald-400 hover:from-[#14e8d8] hover:to-emerald-300 text-black font-black text-xs shadow-xl shadow-[#00D1C1]/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={16} />
            <span>GERAR CARD WRAPPED DO MÊS</span>
          </button>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportToast && (
        <div
          id="export-toast-banner"
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
            exportToast.type === 'success'
              ? 'bg-[#00D1C1]/10 border-[#00D1C1]/30 text-[#00D1C1]'
              : 'bg-amber-400/10 border-amber-400/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5 font-bold">
            {exportToast.type === 'success' ? (
              <CheckCircle2 size={17} className="shrink-0 text-[#00D1C1]" />
            ) : (
              <AlertCircle size={17} className="shrink-0 text-amber-300" />
            )}
            <span>{exportToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportToast(null)}
            className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Global Highlights Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-3">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Volume Total</span>
          <p className="text-base font-black font-mono-numbers text-[#00D1C1] mt-0.5">
            {globalStats.totalVolumeAll.toLocaleString('pt-BR')} kg
          </p>
        </div>

        <div className="bg-[#161616] border border-white/5 rounded-2xl p-3">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Treinos Realizados</span>
          <p className="text-base font-black font-mono-numbers text-white mt-0.5">
            {globalStats.totalWorkouts} sessões
          </p>
        </div>

        <div className="bg-[#161616] border border-white/5 rounded-2xl p-3">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Séries Totais</span>
          <p className="text-base font-black font-mono-numbers text-indigo-400 mt-0.5">
            {globalStats.totalSetsAll} séries
          </p>
        </div>

        <div className="bg-[#161616] border border-white/5 rounded-2xl p-3">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Foco Principal</span>
          <p className="text-base font-black text-amber-400 mt-0.5 truncate">
            {globalStats.topMuscle}
          </p>
        </div>
      </div>

      {/* 7-Day Total Volume Progression Chart (Recharts) */}
      <div 
        id="weekly-volume-progression-card"
        className="bg-[#161616] border border-white/5 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden"
      >
        {/* Subtle Ambient Background Gradient Glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#00D1C1]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00D1C1]/15 text-[#00D1C1] flex items-center justify-center border border-[#00D1C1]/30">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                Volume dos Últimos 7 Dias
                <span className="text-[10px] font-mono-numbers font-black px-2 py-0.5 rounded-full bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30">
                  {last7DaysVolumeData.totalVolume7d.toLocaleString('pt-BR')} kg
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Carga acumulada dia a dia para visualização da progressão
              </p>
            </div>
          </div>

          {/* Chart Display Type Switcher (Buttons) */}
          <div className="flex items-center gap-1 p-1 bg-[#101012] rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                setWeeklyChartType('bar');
                soundFx.playTick();
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                weeklyChartType === 'bar'
                  ? 'bg-[#00D1C1] text-black font-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Barras
            </button>
            <button
              type="button"
              onClick={() => {
                setWeeklyChartType('area');
                soundFx.playTick();
              }}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                weeklyChartType === 'area'
                  ? 'bg-[#00D1C1] text-black font-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Curva
            </button>
          </div>
        </div>

        {/* 7-Day Metrics Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 relative z-10">
          <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Volume 7 Dias</span>
            <p className="text-sm font-black font-mono-numbers text-[#00D1C1] mt-0.5">
              {last7DaysVolumeData.totalVolume7d.toLocaleString('pt-BR')} kg
            </p>
          </div>

          <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Média / Dia Ativo</span>
            <p className="text-sm font-black font-mono-numbers text-white mt-0.5">
              {last7DaysVolumeData.avgDailyVolume.toLocaleString('pt-BR')} kg
            </p>
          </div>

          <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Dia Mais Intenso</span>
            <p className="text-sm font-black font-mono-numbers text-amber-400 mt-0.5 truncate">
              {last7DaysVolumeData.peakDay.volumeKg > 0 
                ? `${last7DaysVolumeData.peakDay.shortDay} (${last7DaysVolumeData.peakDay.volumeKg.toLocaleString('pt-BR')} kg)` 
                : '—'}
            </p>
          </div>

          <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Consistência</span>
            <p className="text-sm font-black font-mono-numbers text-indigo-400 mt-0.5">
              {last7DaysVolumeData.activeDaysCount} de 7 dias
            </p>
          </div>
        </div>

        {/* Recharts Chart Container */}
        <div className="h-56 w-full pt-1 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            {weeklyChartType === 'bar' ? (
              <BarChart
                data={last7DaysVolumeData.days}
                margin={{ top: 12, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="shortDay"
                  stroke="#737373"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                  tickFormatter={(val: number) => {
                    if (val >= 1000) return `${Math.round(val / 1000)}k`;
                    return String(val);
                  }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1C1C20] border border-[#00D1C1]/40 p-2.5 rounded-xl shadow-2xl text-xs space-y-1 font-sans">
                          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1">
                            <span className="font-extrabold text-white">
                              {data.dayLabel} {data.isToday && <span className="text-[#00D1C1] text-[10px] font-bold">(Hoje)</span>}
                            </span>
                            <span className="text-[10px] font-mono-numbers text-neutral-400">
                              {data.setsCount > 0 ? `${data.setsCount} séries` : 'Descanso'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Volume:</span>
                            <span className="text-sm font-black font-mono-numbers text-[#00D1C1]">
                              {data.volumeKg.toLocaleString('pt-BR')} kg
                            </span>
                          </div>
                          {data.workoutNames.length > 0 && (
                            <div className="text-[11px] text-neutral-300 pt-0.5">
                              <span className="text-neutral-400">Treino:</span> {data.workoutNames.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="volumeKg"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                >
                  {last7DaysVolumeData.days.map((entry, index) => (
                    <Cell
                      key={`weekly-bar-${index}`}
                      fill={entry.volumeKg > 0 ? (entry.isToday ? '#00FFE0' : '#00D1C1') : '#222226'}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart
                data={last7DaysVolumeData.days}
                margin={{ top: 12, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="weeklyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D1C1" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#00D1C1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="shortDay"
                  stroke="#737373"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                  tickFormatter={(val: number) => {
                    if (val >= 1000) return `${Math.round(val / 1000)}k`;
                    return String(val);
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1C1C20] border border-[#00D1C1]/40 p-2.5 rounded-xl shadow-2xl text-xs space-y-1 font-sans">
                          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1">
                            <span className="font-extrabold text-white">
                              {data.dayLabel} {data.isToday && <span className="text-[#00D1C1] text-[10px] font-bold">(Hoje)</span>}
                            </span>
                            <span className="text-[10px] font-mono-numbers text-neutral-400">
                              {data.setsCount > 0 ? `${data.setsCount} séries` : 'Descanso'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Volume:</span>
                            <span className="text-sm font-black font-mono-numbers text-[#00D1C1]">
                              {data.volumeKg.toLocaleString('pt-BR')} kg
                            </span>
                          </div>
                          {data.workoutNames.length > 0 && (
                            <div className="text-[11px] text-neutral-300 pt-0.5">
                              <span className="text-neutral-400">Treino:</span> {data.workoutNames.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volumeKg"
                  stroke="#00D1C1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#weeklyAreaGrad)"
                  dot={{ fill: '#00D1C1', r: 4, strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#00FFE0', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Linha: Evolução do Volume Total por Sessão de Treino (Recharts) */}
      <div 
        id="session-volume-progression-card"
        className="bg-[#161616] border border-white/5 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#00D1C1]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00D1C1]/15 text-[#00D1C1] flex items-center justify-center border border-[#00D1C1]/30">
              <Activity size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-white text-sm sm:text-base">
                  Evolução do Volume por Sessão
                </h3>
                <span className="text-[10px] font-mono-numbers font-black px-2 py-0.5 rounded-full bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30">
                  {sessionVolumeChartData.totalSessions} sessões
                </span>
                {sessionVolumeChartData.percentChange !== 0 && (
                  <span className={`text-[10px] font-black font-mono-numbers px-2 py-0.5 rounded-full flex items-center gap-0.5 border ${
                    sessionVolumeChartData.percentChange > 0 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {sessionVolumeChartData.percentChange > 0 ? (
                      <TrendingUp size={10} className="stroke-[3]" />
                    ) : (
                      <TrendingUp size={10} className="stroke-[3] rotate-180" />
                    )}
                    {sessionVolumeChartData.percentChange > 0 ? `+${sessionVolumeChartData.percentChange}%` : `${sessionVolumeChartData.percentChange}%`} total
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                Carga total acumulada (kg) sessão a sessão ao longo do tempo
              </p>
            </div>
          </div>

          {/* Toggle Reference Line button */}
          {sessionVolumeChartData.totalSessions > 1 && (
            <button
              type="button"
              onClick={() => {
                setShowAvgReferenceLine(!showAvgReferenceLine);
                soundFx.playTick();
              }}
              className={`text-xs px-2.5 py-1 rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer font-bold ${
                showAvgReferenceLine
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-[#101012] border-white/5 text-neutral-400 hover:text-white'
              }`}
              title="Exibir ou ocultar linha de média de volume"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Média Geral ({sessionVolumeChartData.avgVolume.toLocaleString('pt-BR')} kg)</span>
            </button>
          )}
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative z-10">
          <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Média / Sessão</span>
            <p className="text-sm font-black font-mono-numbers text-white mt-0.5">
              {sessionVolumeChartData.avgVolume.toLocaleString('pt-BR')} kg
            </p>
          </div>

          <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Recorde em Sessão</span>
            <p className="text-sm font-black font-mono-numbers text-amber-400 mt-0.5 truncate" title={sessionVolumeChartData.peakSessionName}>
              {sessionVolumeChartData.peakVolume.toLocaleString('pt-BR')} kg
            </p>
          </div>

          <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Primeira Sessão</span>
            <p className="text-sm font-black font-mono-numbers text-neutral-300 mt-0.5">
              {sessionVolumeChartData.firstVolume.toLocaleString('pt-BR')} kg
            </p>
          </div>

          <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Última Sessão</span>
            <p className="text-sm font-black font-mono-numbers text-[#00D1C1] mt-0.5">
              {sessionVolumeChartData.latestVolume.toLocaleString('pt-BR')} kg
            </p>
          </div>
        </div>

        {/* Recharts LineChart */}
        {sessionVolumeChartData.totalSessions === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-neutral-500 text-xs text-center p-4 bg-[#111114] rounded-2xl border border-dashed border-white/5">
            <Activity size={32} className="opacity-30 mb-2 text-[#00D1C1]" />
            <p>Nenhum treino registrado ainda para gerar a linha de evolução de volume.</p>
          </div>
        ) : sessionVolumeChartData.totalSessions === 1 ? (
          <div className="h-52 flex flex-col items-center justify-center text-neutral-400 text-xs text-center p-4 bg-[#111114] rounded-2xl border border-white/5 space-y-1">
            <div className="text-base font-black font-mono-numbers text-[#00D1C1]">
              {sessionVolumeChartData.latestVolume.toLocaleString('pt-BR')} kg
            </div>
            <p className="text-white font-bold">1ª sessão registrada!</p>
            <p className="text-[11px] text-neutral-500 max-w-sm">
              Complete seu próximo treino para traçar a linha contínua de progressão de carga total entre sessões.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full pt-2 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sessionVolumeChartData.data}
                margin={{ top: 12, right: 14, left: -14, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis
                  dataKey="shortDate"
                  stroke="#737373"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                  tickFormatter={(val: number) => {
                    if (val >= 1000) return `${Math.round(val / 1000)}k`;
                    return String(val);
                  }}
                  domain={['dataMin - 300', 'dataMax + 300']}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(0, 209, 193, 0.25)', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#1C1C20] border border-[#00D1C1]/50 p-3 rounded-2xl shadow-2xl text-xs space-y-1.5 font-sans min-w-[200px]">
                          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                            <span className="font-mono-numbers text-[10px] text-[#00D1C1] font-bold">
                              Sessão #{item.sessionNum} · {item.shortDate}
                            </span>
                            {item.prCount > 0 && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                ⭐ {item.prCount} PR
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="font-extrabold text-white text-xs leading-tight">
                              {item.routineName}
                            </p>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="text-base font-black font-mono-numbers text-[#00D1C1]">
                                {item.volumeKg.toLocaleString('pt-BR')}
                              </span>
                              <span className="text-[11px] text-neutral-400">kg de volume</span>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-white/5 text-[11px] text-neutral-400 flex items-center justify-between font-mono-numbers">
                            <span>{item.totalSets} séries • {item.totalReps} reps</span>
                            {item.durationSeconds > 0 && (
                              <span>⏱ {Math.round(item.durationSeconds / 60)} min</span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {showAvgReferenceLine && sessionVolumeChartData.avgVolume > 0 && (
                  <ReferenceLine
                    y={sessionVolumeChartData.avgVolume}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="volumeKg"
                  name="Volume Total (kg)"
                  stroke="#00D1C1"
                  strokeWidth={3}
                  dot={{
                    fill: '#121214',
                    stroke: '#00D1C1',
                    strokeWidth: 2,
                    r: 4
                  }}
                  activeDot={{
                    fill: '#00FFE0',
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                    r: 6
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Seção Conquistas & Recordes Pessoais (PRs de Carga ou Volume) */}
      <AchievementsSection
        history={history}
        exercises={exercises}
        last7DaysVolume={last7DaysVolumeData.totalVolume7d}
      />

      {/* Exercise Selector */}
      <div className="bg-[#161616] border border-white/5 rounded-3xl p-4 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
            <span>Exercício Selecionado:</span>
            {currentRoutineInfo && (
              <span className="text-[10px] font-extrabold text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-full border border-[#00D1C1]/30 flex items-center gap-1">
                <BookmarkCheck size={11} /> Minhas Rotinas
              </span>
            )}
          </label>
          
          {selectedExercise && (
            <span className="text-[#00D1C1] font-mono-numbers text-[11px] font-bold">
              {selectedExercise.muscleGroup}
            </span>
          )}
        </div>

        {/* Quick horizontal carousel of exercises in user's routines */}
        {routineExercisesInfo.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-[#00D1C1]" />
              Exercícios das suas Rotinas ({routineExercisesInfo.length}):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-white/10">
              {routineExercisesInfo.map((rInfo) => {
                const isSelected = rInfo.exercise.id === selectedExerciseId;
                return (
                  <button
                    key={rInfo.exercise.id}
                    onClick={() => setSelectedExerciseId(rInfo.exercise.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20 scale-[1.02]'
                        : 'bg-[#222222] text-neutral-300 hover:text-white border border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span>{rInfo.exercise.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-black/20 text-black font-bold' : 'bg-black/40 text-neutral-400'
                    }`}>
                      {rInfo.routineNames[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Select Dropdown */}
        <div className="relative">
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full bg-[#222222] text-white border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold appearance-none focus:outline-none focus:border-[#00D1C1]"
          >
            {routineExercisesInfo.length > 0 && (
              <optgroup label={`⭐ EXERCÍCIOS DAS MINHAS ROTINAS (${routineExercisesInfo.length})`}>
                {routineExercisesInfo.map((rInfo) => (
                  <option key={rInfo.exercise.id} value={rInfo.exercise.id} className="bg-[#161616] text-white">
                    {rInfo.exercise.name} ({rInfo.exercise.muscleGroup}) • {rInfo.routineNames.join(', ')}
                  </option>
                ))}
              </optgroup>
            )}

            {otherExercises.length > 0 && (
              <optgroup label={`📚 OUTROS EXERCÍCIOS DA BIBLIOTECA (${otherExercises.length})`}>
                {otherExercises.map((ex) => (
                  <option key={ex.id} value={ex.id} className="bg-[#161616] text-neutral-300">
                    {ex.name} ({ex.muscleGroup})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={18} />
        </div>

        {/* Routine Meta Info Card when Selected Exercise belongs to routines */}
        {currentRoutineInfo && (
          <div className="p-2.5 bg-[#00D1C1]/5 border border-[#00D1C1]/20 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between text-[#00D1C1] font-bold text-[11px]">
              <span>Treinos vinculados: {currentRoutineInfo.routineNames.join(' • ')}</span>
              {(currentRoutineInfo.targetSets || currentRoutineInfo.targetReps) && (
                <span className="font-mono-numbers text-neutral-300">
                  Meta: {currentRoutineInfo.targetSets}x{currentRoutineInfo.targetReps}
                  {currentRoutineInfo.initialWeight ? ` @ ${currentRoutineInfo.initialWeight}kg` : ''}
                </span>
              )}
            </div>
            {currentRoutineInfo.notes && (
              <p className="text-[10px] text-neutral-400 italic">
                "{currentRoutineInfo.notes}"
              </p>
            )}
          </div>
        )}

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => setChartMetric('weight')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartMetric === 'weight'
                ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20'
                : 'bg-[#222222] text-neutral-300 border border-white/5'
            }`}
          >
            Carga Máx (kg)
          </button>
          <button
            onClick={() => setChartMetric('1rm')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartMetric === '1rm'
                ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20'
                : 'bg-[#222222] text-neutral-300 border border-white/5'
            }`}
          >
            1RM Estimado
          </button>
          <button
            onClick={() => setChartMetric('volume')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartMetric === 'volume'
                ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20'
                : 'bg-[#222222] text-neutral-300 border border-white/5'
            }`}
          >
            Volume Total
          </button>
        </div>
      </div>

      {/* Selected Exercise Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#161616] border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Recorde (PR)</span>
                <Trophy size={14} />
              </div>
              <p className="text-xl font-black font-mono-numbers text-[#00D1C1] mt-2">
                {stats.maxWeight > 0 ? `${stats.maxWeight} kg` : '—'}
              </p>
              <span className="text-[10px] text-neutral-500">
                {stats.maxRepsAtMaxWeight > 0 ? `com ${stats.maxRepsAtMaxWeight} reps` : 'Sem registros'}
              </span>
            </div>

            <div className="bg-[#161616] border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#00D1C1]">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">1RM Estimado</span>
                <Award size={14} />
              </div>
              <p className="text-xl font-black font-mono-numbers text-white mt-2">
                {stats.best1RM > 0 ? `${stats.best1RM} kg` : '—'}
              </p>
              <span className="text-[10px] text-neutral-500">Fórmula de Epley</span>
            </div>

            <div className="bg-[#161616] border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-400">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Maior Série</span>
                <Zap size={14} />
              </div>
              <p className="text-xl font-black font-mono-numbers text-indigo-300 mt-2">
                {stats.maxVolumeSet > 0 ? `${stats.maxVolumeSet} kg` : '—'}
              </p>
              <span className="text-[10px] text-neutral-500">Volume em 1 série</span>
            </div>

            <div className="bg-[#161616] border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Séries Totais</span>
                <Layers size={14} />
              </div>
              <p className="text-xl font-black font-mono-numbers text-white mt-2">
                {stats.totalSetsPerformed}
              </p>
              <span className="text-[10px] text-neutral-500">Execuções salvas</span>
            </div>
          </div>

          {/* Interactive Progression Chart */}
          <div className="bg-[#161616] border border-white/5 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-white text-sm">
                  {chartMetric === 'weight'
                    ? 'Evolução da Carga Máxima (kg)'
                    : chartMetric === '1rm'
                    ? 'Curva de 1RM Estimado (kg)'
                    : 'Volume Total por Treino (kg)'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {selectedExercise?.name} ao longo do tempo
                </p>
              </div>
              <span className="text-xs font-bold text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded border border-[#00D1C1]/30">
                {stats.historyPoints.length} pontos
              </span>
            </div>

            {stats.historyPoints.length < 2 ? (
              <div className="h-52 flex flex-col items-center justify-center text-neutral-500 text-xs text-center p-4">
                <TrendingUp size={32} className="opacity-40 mb-2" />
                <p>Complete mais treinos com este exercício para gerar a curva comparativa de evolução.</p>
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.historyPoints}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="tiffanyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D1C1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00D1C1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#737373"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#262626' }}
                    />
                    <YAxis
                      stroke="#737373"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#262626' }}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const val = payload[0].value;
                          return (
                            <div className="bg-[#222222] border border-[#00D1C1]/40 p-2.5 rounded-xl shadow-xl text-xs font-mono-numbers">
                              <span className="text-neutral-400 block mb-1 font-sans">{label}</span>
                              <div className="text-white font-bold">
                                {chartMetric === 'weight' && `Carga Máx: ${val} kg`}
                                {chartMetric === '1rm' && `1RM Estimado: ${val} kg`}
                                {chartMetric === 'volume' && `Volume: ${val} kg`}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={
                        chartMetric === 'weight'
                          ? 'weight'
                          : chartMetric === '1rm'
                          ? 'estimated1RM'
                          : 'volume'
                      }
                      stroke="#00D1C1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#tiffanyGrad)"
                      dot={{ fill: '#00D1C1', r: 4, strokeWidth: 1, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#15e8d7', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Historical Table Log */}
          <div className="bg-[#161616] border border-white/5 rounded-3xl p-4">
            <h3 className="font-extrabold text-white text-sm mb-3">
              Histórico Detalhado do Exercício
            </h3>

            {stats.historyPoints.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">
                Nenhum registro encontrado no histórico.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-neutral-400 border-b border-white/5 text-[10px] font-black uppercase">
                      <th className="pb-2">Data</th>
                      <th className="pb-2">Carga Máx</th>
                      <th className="pb-2">Reps</th>
                      <th className="pb-2">1RM Est.</th>
                      <th className="pb-2 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...stats.historyPoints].reverse().map((pt, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 font-medium text-white">{pt.date}</td>
                        <td className="py-2.5 font-mono-numbers font-bold text-[#00D1C1]">
                          {pt.weight} kg
                        </td>
                        <td className="py-2.5 font-mono-numbers text-neutral-300">
                          {pt.reps}
                        </td>
                        <td className="py-2.5 font-mono-numbers text-white">
                          {pt.estimated1RM} kg
                        </td>
                        <td className="py-2.5 font-mono-numbers text-right text-neutral-400">
                          {pt.volume.toLocaleString('pt-BR')} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Dedicated Workout History Export Card */}
          <div
            id="export-history-summary-card"
            className="bg-[#161616] border border-white/5 rounded-3xl p-4.5 space-y-3.5 shadow-lg"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00D1C1]/10 text-[#00D1C1] flex items-center justify-center border border-[#00D1C1]/20 shrink-0">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">
                    Exportar Progresso & Treinos (com Histórico de Cardio)
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Planilha CSV compatível com Excel e Google Sheets com todas as séries de musculação e sessões de spinning/cardio
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="export-history-bottom-btn"
                onClick={handleExportHistory}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-[#00D1C1] text-black hover:bg-[#15e8d7] transition-all shadow-md shadow-[#00D1C1]/15 active:scale-95 cursor-pointer"
              >
                <Download size={15} />
                <span>Baixar Histórico Completo</span>
              </button>
            </div>

            {/* Column Badges List */}
            <div className="pt-3 border-t border-white/5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Colunas e Dados Mantidos no CSV:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Data',
                  'Duração',
                  'Rotina',
                  'Descricao',
                  'Grupos_Musculares',
                  'Exercício',
                  'Series',
                  'Repetições',
                  'Carga_Kg',
                  'Descanso_Seg',
                  'Notas',
                  'Musculo_Principal'
                ].map((col) => (
                  <span
                    key={col}
                    className="text-[10px] font-mono-numbers font-bold text-neutral-300 bg-[#202022] hover:bg-[#28282c] px-2.5 py-1 rounded-lg border border-white/5 transition-colors"
                  >
                    {col}
                  </span>
                ))}
                <span className="text-[10px] font-bold text-[#00D1C1] bg-[#00D1C1]/10 px-2.5 py-1 rounded-lg border border-[#00D1C1]/20">
                  + Pedaladas Spinning (Aquecimento, Moderado e HIIT)
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spotify Wrapped Monthly Modal */}
      <MonthlyWrappedModal
        isOpen={isWrappedModalOpen}
        onClose={() => setIsWrappedModalOpen(false)}
        history={history}
        cardioSessions={cardioSessions}
        athleteName={athleteName}
        accentHex={accentHex}
      />
    </div>
  );
};
