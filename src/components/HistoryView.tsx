import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Dumbbell, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Trophy, 
  Trash2, 
  Play, 
  Star,
  Repeat,
  Layers,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Sparkles,
  Flame,
  Minus,
  SlidersHorizontal,
  Filter,
  RotateCcw,
  X,
  Share2,
  Download,
  CheckCircle2,
  Bike,
  Pencil,
  Gauge
} from 'lucide-react';
import { CompletedWorkout, WorkoutExercise, MuscleGroup, CardioSession } from '../types';
import { 
  formatDatePT, 
  formatWorkoutDuration, 
  calculateEstimatedCalories, 
  formatTimerDigits,
  isIsometricExercise,
  formatHoldDuration,
  calculateTotalIsometricSeconds
} from '../utils/calc';
import { exportWorkoutHistoryToCSV, downloadFile } from '../utils/routineTransfer';
import { loadCardioSessions, saveCardioSessions } from '../utils/storage';
import { soundFx } from '../utils/audio';
import { WorkoutShareModal } from './WorkoutShareModal';
import { EditCardioModal } from './EditCardioModal';

interface HistoryViewProps {
  history: CompletedWorkout[];
  cardioSessions?: CardioSession[];
  onRepeatWorkout: (workout: CompletedWorkout) => void;
  onDeleteHistoryItem: (workoutId: string) => void;
  onDeleteCardioSession?: (id: string) => void;
  onUpdateCardioSession?: (updatedSession: CardioSession) => void;
  onShareWorkout?: (workout: CompletedWorkout) => void;
  athleteName?: string;
}

interface ExerciseComparisonData {
  hasPrevious: boolean;
  prevDate?: string;
  prevWorkoutName?: string;
  
  currentMaxWeight: number;
  prevMaxWeight: number;
  weightDiff: number;
  hasWeightIncrease: boolean;
  
  currentTotalReps: number;
  prevTotalReps: number;
  repsDiff: number;
  hasRepsIncrease: boolean;

  currentTotalVolume: number;
  prevTotalVolume: number;
  volumeDiff: number;
  hasVolumeIncrease: boolean;

  currentTopSetDesc: string;
  prevTopSetDesc?: string;

  statusType: 'double_increase' | 'weight_increase' | 'reps_increase' | 'maintained' | 'decreased' | 'first_time';
  statusLabel: string;
}

/**
 * Computes side-by-side progression metrics between the current workout's exercise
 * and the immediately preceding workout in history for the exact same exercise.
 */
function computeExerciseComparison(
  currentEx: WorkoutExercise,
  currentWorkout: CompletedWorkout,
  allWorkouts: CompletedWorkout[]
): ExerciseComparisonData {
  const isIso = isIsometricExercise(currentEx);
  const completedSets = currentEx.sets.filter((s) => s.completed);
  const activeSets = completedSets.length > 0 ? completedSets : currentEx.sets || [];

  const currentMaxWeight = activeSets.length > 0 ? Math.max(...activeSets.map((s) => s.weight || 0), 0) : 0;
  const currentTotalReps = isIso
    ? activeSets.reduce((sum, s) => sum + (s.holdSeconds || s.reps || 0), 0)
    : activeSets.reduce((sum, s) => sum + (s.reps || 0), 0);
  const currentTotalVolume = isIso
    ? 0
    : activeSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);

  // Identify current top set
  const currentTopSet = activeSets.reduce((best, s) => {
    if (!best) return s;
    if (isIso) {
      const bestHold = best.holdSeconds || best.reps || 0;
      const sHold = s.holdSeconds || s.reps || 0;
      return sHold > bestHold ? s : best;
    }
    if ((s.weight || 0) > (best.weight || 0)) return s;
    if ((s.weight || 0) === (best.weight || 0) && (s.reps || 0) > (best.reps || 0)) return s;
    return best;
  }, activeSets[0]);

  const currentTopSetDesc = currentTopSet
    ? isIso
      ? `${currentTopSet.weight > 0 ? `+${currentTopSet.weight}kg • ` : ''}${formatHoldDuration(currentTopSet.holdSeconds || currentTopSet.reps)}`
      : `${currentTopSet.weight}kg × ${currentTopSet.reps}r`
    : '0';

  // 1. Find previous instance of this exercise in chronologically older workouts
  const currentWorkoutTime = new Date(currentWorkout.completedAt || currentWorkout.startedAt).getTime();

  const pastWorkouts = allWorkouts
    .filter((w) => {
      if (w.id === currentWorkout.id) return false;
      const wTime = new Date(w.completedAt || w.startedAt).getTime();
      if (!isNaN(currentWorkoutTime) && !isNaN(wTime)) {
        return wTime < currentWorkoutTime;
      }
      return false;
    })
    .sort((a, b) => {
      const aTime = new Date(a.completedAt || a.startedAt).getTime();
      const bTime = new Date(b.completedAt || b.startedAt).getTime();
      return bTime - aTime; // Newest past workout first
    });

  let matchedPastEx: WorkoutExercise | null = null;
  let matchedPastWorkout: CompletedWorkout | null = null;

  const currentTargetName = currentEx.exerciseName ? currentEx.exerciseName.trim().toLowerCase() : '';
  const currentTargetId = currentEx.exerciseId ? currentEx.exerciseId.trim().toLowerCase() : '';

  for (const pw of pastWorkouts) {
    const found = pw.exercises.find((e) => {
      const eId = e.exerciseId ? e.exerciseId.trim().toLowerCase() : '';
      const eName = e.exerciseName ? e.exerciseName.trim().toLowerCase() : '';
      return (currentTargetId && eId === currentTargetId) || (currentTargetName && eName === currentTargetName);
    });

    if (found) {
      matchedPastEx = found;
      matchedPastWorkout = pw;
      break;
    }
  }

  let prevMaxWeight = 0;
  let prevTotalReps = 0;
  let prevTotalVolume = 0;
  let prevTopSetDesc: string | undefined = undefined;
  let prevDate: string | undefined = undefined;
  let prevWorkoutName: string | undefined = undefined;
  let hasPrevious = false;

  if (matchedPastEx && matchedPastWorkout) {
    hasPrevious = true;
    prevDate = formatDatePT(matchedPastWorkout.completedAt || matchedPastWorkout.startedAt);
    prevWorkoutName = matchedPastWorkout.routineName;

    const pastCompletedSets = matchedPastEx.sets.filter((s) => s.completed);
    const pastActiveSets = pastCompletedSets.length > 0 ? pastCompletedSets : matchedPastEx.sets || [];

    prevMaxWeight = pastActiveSets.length > 0 ? Math.max(...pastActiveSets.map((s) => s.weight || 0), 0) : 0;
    prevTotalReps = isIso
      ? pastActiveSets.reduce((sum, s) => sum + (s.holdSeconds || s.reps || 0), 0)
      : pastActiveSets.reduce((sum, s) => sum + (s.reps || 0), 0);
    prevTotalVolume = isIso ? 0 : pastActiveSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);

    const pastTopSet = pastActiveSets.reduce((best, s) => {
      if (!best) return s;
      if (isIso) {
        const bestHold = best.holdSeconds || best.reps || 0;
        const sHold = s.holdSeconds || s.reps || 0;
        return sHold > bestHold ? s : best;
      }
      if ((s.weight || 0) > (best.weight || 0)) return s;
      if ((s.weight || 0) === (best.weight || 0) && (s.reps || 0) > (best.reps || 0)) return s;
      return best;
    }, pastActiveSets[0]);

    if (pastTopSet) {
      prevTopSetDesc = isIso
        ? `${pastTopSet.weight > 0 ? `+${pastTopSet.weight}kg • ` : ''}${formatHoldDuration(pastTopSet.holdSeconds || pastTopSet.reps)}`
        : `${pastTopSet.weight}kg × ${pastTopSet.reps}r`;
    }
  } else {
    // Fallback: check if individual sets record historical previousWeight / previousReps
    const setsWithPrev = activeSets.filter(
      (s) =>
        (s.previousWeight !== undefined && s.previousWeight > 0) ||
        (s.previousReps !== undefined && s.previousReps > 0)
    );

    if (setsWithPrev.length > 0) {
      hasPrevious = true;
      prevDate = 'Sessão anterior';
      prevMaxWeight = Math.max(...setsWithPrev.map((s) => s.previousWeight || 0), 0);
      prevTotalReps = isIso
        ? setsWithPrev.reduce((sum, s) => sum + (s.previousReps || s.reps || 0), 0)
        : setsWithPrev.reduce((sum, s) => sum + (s.previousReps || s.reps || 0), 0);
      prevTotalVolume = isIso
        ? 0
        : setsWithPrev.reduce(
            (sum, s) => sum + (s.previousWeight || s.weight || 0) * (s.previousReps || s.reps || 0),
            0
          );
      const topSetWithPrev = setsWithPrev[setsWithPrev.length - 1];
      if (topSetWithPrev) {
        prevTopSetDesc = isIso
          ? `${formatHoldDuration(topSetWithPrev.previousReps || topSetWithPrev.reps)}`
          : `${topSetWithPrev.previousWeight || topSetWithPrev.weight}kg × ${topSetWithPrev.previousReps || topSetWithPrev.reps}r`;
      }
    }
  }

  if (!hasPrevious) {
    return {
      hasPrevious: false,
      currentMaxWeight,
      prevMaxWeight: 0,
      weightDiff: 0,
      hasWeightIncrease: false,
      currentTotalReps,
      prevTotalReps: 0,
      repsDiff: 0,
      hasRepsIncrease: false,
      currentTotalVolume,
      prevTotalVolume: 0,
      volumeDiff: 0,
      hasVolumeIncrease: false,
      currentTopSetDesc,
      statusType: 'first_time',
      statusLabel: isIso ? 'Primeiro registro de sustentação' : 'Primeiro registro'
    };
  }

  const weightDiff = parseFloat((currentMaxWeight - prevMaxWeight).toFixed(1));
  const repsDiff = currentTotalReps - prevTotalReps;
  const volumeDiff = currentTotalVolume - prevTotalVolume;

  const hasWeightIncrease = weightDiff > 0;
  const hasRepsIncrease = repsDiff > 0;
  const hasVolumeIncrease = volumeDiff > 0;

  let statusType: ExerciseComparisonData['statusType'] = 'maintained';
  let statusLabel = 'Carga e Reps mantidas';

  if (isIso) {
    if (hasWeightIncrease && hasRepsIncrease) {
      statusType = 'double_increase';
      statusLabel = `Progresso Duplo (+${weightDiff}kg e +${formatHoldDuration(repsDiff)})`;
    } else if (hasWeightIncrease) {
      statusType = 'weight_increase';
      statusLabel = `Aumento de Carga (+${weightDiff} kg)`;
    } else if (hasRepsIncrease) {
      statusType = 'reps_increase';
      statusLabel = `Mais Sustentação (+${formatHoldDuration(repsDiff)})`;
    } else if (weightDiff === 0 && repsDiff === 0) {
      statusType = 'maintained';
      statusLabel = 'Tempo e Carga mantidos';
    } else {
      statusType = 'decreased';
      statusLabel = 'Ajuste de sustentação';
    }
  } else if (hasWeightIncrease && hasRepsIncrease) {
    statusType = 'double_increase';
    statusLabel = `Aumento Duplo (+${weightDiff}kg e +${repsDiff}r)`;
  } else if (hasWeightIncrease) {
    statusType = 'weight_increase';
    statusLabel = `Aumento de Carga (+${weightDiff} kg)`;
  } else if (hasRepsIncrease) {
    statusType = 'reps_increase';
    statusLabel = `Mais Repetições (+${repsDiff} reps)`;
  } else if (weightDiff === 0 && repsDiff === 0) {
    statusType = 'maintained';
    statusLabel = 'Carga e Reps mantidas';
  } else {
    statusType = 'decreased';
    statusLabel = 'Ajuste de volume';
  }

  return {
    hasPrevious: true,
    prevDate,
    prevWorkoutName,
    currentMaxWeight,
    prevMaxWeight,
    weightDiff,
    hasWeightIncrease,
    currentTotalReps,
    prevTotalReps,
    repsDiff,
    hasRepsIncrease,
    currentTotalVolume,
    prevTotalVolume,
    volumeDiff,
    hasVolumeIncrease,
    currentTopSetDesc,
    prevTopSetDesc,
    statusType,
    statusLabel
  };
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  cardioSessions: propCardioSessions,
  onRepeatWorkout,
  onDeleteHistoryItem,
  onDeleteCardioSession,
  onUpdateCardioSession,
  onShareWorkout,
  athleteName
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(history[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'workouts' | 'cardio'>('all');
  const [internalShareWorkout, setInternalShareWorkout] = useState<CompletedWorkout | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // Cardio sessions state (synced with parent prop or local storage)
  const [cardioList, setCardioList] = useState<CardioSession[]>(() => {
    if (propCardioSessions && propCardioSessions.length > 0) return propCardioSessions;
    return loadCardioSessions();
  });
  const [editingCardioSession, setEditingCardioSession] = useState<CardioSession | null>(null);

  useEffect(() => {
    if (propCardioSessions) {
      setCardioList(propCardioSessions);
    }
  }, [propCardioSessions]);

  const handleStartEditCardio = (session: CardioSession) => {
    soundFx.playTick();
    setEditingCardioSession(session);
  };

  const handleSaveEditedCardio = (updatedSession: CardioSession) => {
    const updated = cardioList.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    setCardioList(updated);
    saveCardioSessions(updated);
    if (onUpdateCardioSession) {
      onUpdateCardioSession(updatedSession);
    }
    setEditingCardioSession(null);
    setExportToast('Sessão de cardio atualizada com sucesso!');
    setTimeout(() => setExportToast(null), 4000);
  };

  const handleDeleteCardio = (sessionId: string) => {
    const updated = cardioList.filter((s) => s.id !== sessionId);
    setCardioList(updated);
    saveCardioSessions(updated);
    if (onDeleteCardioSession) {
      onDeleteCardioSession(sessionId);
    }
    soundFx.playTick();
    setExportToast('Sessão de cardio removida do histórico.');
    setTimeout(() => setExportToast(null), 3500);
  };

  // Export complete history (weight workouts + all cardio & warm-up sessions)
  const handleExportHistory = () => {
    soundFx.playTick();
    const freshCardio = loadCardioSessions();
    const activeCardio = freshCardio.length > 0 ? freshCardio : cardioList;
    const csv = exportWorkoutHistoryToCSV(history, [], [], activeCardio);
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `historico_treinos_thunder_${today}.csv`, 'text/csv;charset=utf-8;');
    soundFx.playCelebration();
    const cardioMsg = activeCardio.length > 0 ? ` + ${activeCardio.length} sessões de cardio/spinning` : '';
    setExportToast(`Histórico completo (${history.length} musculação${cardioMsg}) exportado com sucesso em CSV!`);
    setTimeout(() => {
      setExportToast(null);
    }, 4500);
  };

  // Compute available muscle groups with counts from workouts in history
  const availableMuscleGroups = useMemo(() => {
    const map = new Map<string, number>();
    history.forEach((w) => {
      const muscles = new Set<string>();
      w.exercises.forEach((e) => {
        if (e.muscleGroup) muscles.add(e.muscleGroup);
      });
      muscles.forEach((m) => {
        map.set(m, (map.get(m) || 0) + 1);
      });
    });

    const standardOrder: MuscleGroup[] = [
      'Peito',
      'Costas',
      'Ombros',
      'Bíceps',
      'Tríceps',
      'Quadríceps',
      'Posteriores',
      'Glúteos',
      'Panturrilhas',
      'Abdômen'
    ];

    const presentStandard = standardOrder
      .filter((m) => map.has(m))
      .map((m) => ({ name: m, count: map.get(m)! }));

    const others: { name: string; count: number }[] = [];
    map.forEach((count, name) => {
      if (!standardOrder.includes(name as MuscleGroup)) {
        others.push({ name, count });
      }
    });

    return [...presentStandard, ...others];
  }, [history]);

  // Combined filter: text search query + muscle group
  const filteredHistory = useMemo(() => {
    return history.filter((workout) => {
      // 1. Muscle group filter
      if (selectedMuscle !== 'ALL') {
        const matchesMuscle = workout.exercises.some(
          (e) => e.muscleGroup === selectedMuscle
        );
        if (!matchesMuscle) return false;
      }

      // 2. Search query filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesRoutine = workout.routineName.toLowerCase().includes(term);
        const matchesExercise = workout.exercises.some(
          (e) =>
            (e.exerciseName && e.exerciseName.toLowerCase().includes(term)) ||
            (e.muscleGroup && e.muscleGroup.toLowerCase().includes(term))
        );
        const matchesNotes = workout.notes ? workout.notes.toLowerCase().includes(term) : false;

        if (!matchesRoutine && !matchesExercise && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [history, selectedMuscle, searchTerm]);

  // Filtered cardio sessions based on search query
  const filteredCardio = useMemo(() => {
    return cardioList.filter((c) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      const matchesModality = c.modality?.toLowerCase().includes(term);
      const matchesType = c.type?.toLowerCase().includes(term);
      const matchesNotes = c.notes ? c.notes.toLowerCase().includes(term) : false;
      const matchesDate = new Date(c.completedAt).toLocaleDateString('pt-BR').includes(term);
      const matchesSpinning = term.includes('cardio') || term.includes('spinning') || term.includes('bike');
      return matchesModality || matchesType || matchesNotes || matchesDate || matchesSpinning;
    });
  }, [cardioList, searchTerm]);

  // Combined chronologically sorted items when "all" is active
  type CombinedItem = 
    | { itemType: 'workout'; timestamp: number; workout: CompletedWorkout }
    | { itemType: 'cardio'; timestamp: number; cardio: CardioSession };

  const combinedItems = useMemo<CombinedItem[]>(() => {
    const items: CombinedItem[] = [];
    filteredHistory.forEach((w) => {
      items.push({
        itemType: 'workout',
        timestamp: new Date(w.completedAt || w.startedAt || 0).getTime(),
        workout: w
      });
    });
    filteredCardio.forEach((c) => {
      items.push({
        itemType: 'cardio',
        timestamp: new Date(c.completedAt || 0).getTime(),
        cardio: c
      });
    });
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredHistory, filteredCardio]);

  const renderCardioCard = (session: CardioSession) => {
    const isWarmup = session.type === 'warmup';
    const isHiit = session.type === 'hiit';
    const dateObj = new Date(session.completedAt);
    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div
        key={`cardio-${session.id}`}
        id={`history-cardio-${session.id}`}
        className="bg-[#161616] border border-white/5 hover:border-white/10 rounded-3xl p-4.5 shadow-xl transition-all space-y-3"
      >
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isWarmup
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : isHiit
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30'
              }`}
            >
              {isWarmup ? <Flame size={19} /> : isHiit ? <Zap size={19} /> : <Bike size={19} />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                  isWarmup
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : isHiit
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    : 'bg-[#00D1C1]/15 text-[#00D1C1] border-[#00D1C1]/30'
                }`}>
                  {isWarmup ? 'Aquecimento Spinning' : isHiit ? 'HIIT Spinning' : 'Cardio Moderado'}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono-numbers">
                  {formattedDate}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">
                {session.modality || 'Bicicleta Spinning'}
              </h3>
            </div>
          </div>

          {/* Action buttons: Editar & Excluir */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => handleStartEditCardio(session)}
              className="px-2.5 py-1.5 bg-[#202024] hover:bg-[#28282e] text-[#00D1C1] border border-[#00D1C1]/30 hover:border-[#00D1C1]/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Editar dados desta sessão de cardio"
            >
              <Pencil size={13} />
              <span>Editar</span>
            </button>

            <button
              type="button"
              onClick={() => handleDeleteCardio(session.id)}
              className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors rounded-xl cursor-pointer"
              title="Excluir sessão de cardio"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/5">
          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">Duração</span>
            <span className="text-xs font-black font-mono-numbers text-white flex items-center gap-1 mt-0.5">
              <Clock size={11} className="text-[#00D1C1]" />
              {formatTimerDigits(session.durationSeconds)}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">Calorias</span>
            <span className="text-xs font-black font-mono-numbers text-amber-400 flex items-center gap-1 mt-0.5">
              <Flame size={11} />
              ~{session.estimatedCalories} kcal
            </span>
          </div>

          {session.estimatedDistanceKm !== undefined && (
            <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">Distância</span>
              <span className="text-xs font-black font-mono-numbers text-white flex items-center gap-1 mt-0.5">
                <Gauge size={11} className="text-[#00D1C1]" />
                {session.estimatedDistanceKm} km
              </span>
            </div>
          )}

          {(session.cadenceRpm || session.resistanceLevel) && (
            <div className="p-2.5 rounded-2xl bg-black/30 border border-white/5">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 block font-bold">Ritmo / Carga</span>
              <span className="text-xs font-bold text-neutral-300 mt-0.5 block truncate">
                {session.cadenceRpm ? `${session.cadenceRpm} RPM` : ''}
                {session.cadenceRpm && session.resistanceLevel ? ' · ' : ''}
                {session.resistanceLevel || ''}
              </span>
            </div>
          )}
        </div>

        {/* Notes if any */}
        {session.notes && (
          <div className="text-[11px] text-neutral-300 bg-white/5 p-2 rounded-xl border border-white/5 italic">
            "{session.notes}"
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="history-view" className="space-y-4 pb-28 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-[11px] font-black tracking-widest text-[#00D1C1] uppercase">
            REGISTRO HISTÓRICO ({history.length + cardioList.length})
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Histórico de Treinos & Cardio
          </h1>
        </div>

        <button
          type="button"
          onClick={handleExportHistory}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-[#161616] hover:bg-[#202024] text-white border border-white/10 hover:border-[#00D1C1]/50 shadow-md transition-all active:scale-95 cursor-pointer"
          title="Exportar histórico completo de musculação e cardio (Bicicleta Spinning) em CSV"
        >
          <Download size={14} className="text-[#00D1C1]" />
          <span>Baixar CSV (com Cardio)</span>
        </button>
      </div>

      {/* Category Tab Selector: Todos / Musculação / Cardio */}
      <div className="flex items-center gap-1.5 p-1 bg-[#161616] border border-white/5 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            soundFx.playTick();
            setSelectedCategory('all');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#00D1C1]/20 text-[#00D1C1] border border-[#00D1C1]/40 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers size={13} />
          <span>Todos ({history.length + cardioList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playTick();
            setSelectedCategory('workouts');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'workouts'
              ? 'bg-[#00D1C1]/20 text-[#00D1C1] border border-[#00D1C1]/40 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Dumbbell size={13} />
          <span>Musculação ({history.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx.playTick();
            setSelectedCategory('cardio');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedCategory === 'cardio'
              ? 'bg-[#00D1C1]/20 text-[#00D1C1] border border-[#00D1C1]/40 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bike size={13} />
          <span>Cardio ({cardioList.length})</span>
        </button>
      </div>

      {/* Export Feedback Toast */}
      {exportToast && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-fadeIn text-xs text-emerald-300 font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{exportToast}</span>
          </div>
          <button onClick={() => setExportToast(null)} className="text-neutral-400 hover:text-white p-1">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search Bar & Muscle Group Filters */}
      {(history.length > 0 || cardioList.length > 0) && (
        <div className="space-y-2.5">
          {/* Search Input Bar */}
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por treino, exercício, músculo ou observação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 bg-[#161616] text-white placeholder-neutral-500 rounded-2xl border border-white/5 focus:outline-none focus:border-[#00D1C1] text-xs shadow-md transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Muscle Group Filters (Hidden when viewing Cardio only) */}
          {selectedCategory !== 'cardio' && history.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 px-0.5">
                <span className="flex items-center gap-1.5 font-bold text-neutral-300">
                  <SlidersHorizontal size={12} className="text-[#00D1C1]" />
                  Filtrar por Grupo Muscular:
                </span>

                {(selectedMuscle !== 'ALL' || searchTerm.trim()) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMuscle('ALL');
                      setSearchTerm('');
                    }}
                    className="text-[#00D1C1] hover:underline flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  >
                    <RotateCcw size={11} /> Limpar Filtros
                  </button>
                )}
              </div>

              {/* Filter Pills - horizontal scrollable */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedMuscle('ALL')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedMuscle === 'ALL'
                      ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/20 font-black'
                      : 'bg-[#161616] text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  <Dumbbell size={13} />
                  <span>Todos</span>
                  <span
                    className={`text-[10px] font-mono-numbers px-1.5 py-0.2 rounded-md ${
                      selectedMuscle === 'ALL' ? 'bg-black/20 text-black font-black' : 'bg-white/5 text-neutral-400'
                    }`}
                  >
                    {history.length}
                  </span>
                </button>

                {availableMuscleGroups.map((group) => {
                  const isSelected = selectedMuscle === group.name;
                  return (
                    <button
                      key={group.name}
                      type="button"
                      onClick={() => setSelectedMuscle(isSelected ? 'ALL' : group.name)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/20 font-black'
                          : 'bg-[#161616] text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5'
                      }`}
                    >
                      <span>{group.name}</span>
                      <span
                        className={`text-[10px] font-mono-numbers px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-black/20 text-black font-black' : 'bg-white/5 text-neutral-400'
                        }`}
                      >
                        {group.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Filter Status Indicator */}
          {selectedCategory !== 'cardio' && (selectedMuscle !== 'ALL' || searchTerm.trim()) && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Filter size={12} className="text-[#00D1C1]" />
                <span>
                  Exibindo <strong className="text-white">{filteredHistory.length}</strong> de {history.length} treino(s)
                  {selectedMuscle !== 'ALL' && (
                    <> com foco em <strong className="text-[#00D1C1]">{selectedMuscle}</strong></>
                  )}
                  {searchTerm.trim() && (
                    <> para "<strong>{searchTerm.trim()}</strong>"</>
                  )}
                </span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedMuscle('ALL');
                  setSearchTerm('');
                }}
                className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                title="Limpar filtros"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* List of past workouts & cardio sessions */}
      <div className="space-y-3">
        {(selectedCategory === 'all'
          ? combinedItems.length === 0
          : selectedCategory === 'workouts'
          ? filteredHistory.length === 0
          : filteredCardio.length === 0) ? (
          <div className="bg-[#161616] border border-dashed border-white/10 rounded-3xl p-8 text-center text-neutral-400 text-xs space-y-3">
            <p>
              {searchTerm || (selectedCategory !== 'cardio' && selectedMuscle !== 'ALL')
                ? `Nenhum treino ou cardio encontrado para ${
                    selectedCategory !== 'cardio' && selectedMuscle !== 'ALL' ? `o grupo muscular "${selectedMuscle}"` : ''
                  }${selectedCategory !== 'cardio' && selectedMuscle !== 'ALL' && searchTerm ? ' e ' : ''}${
                    searchTerm ? `a busca "${searchTerm}"` : ''
                  }.`
                : selectedCategory === 'cardio'
                ? 'Nenhuma sessão de cardio salva ainda. Inicie seu aquecimento de 5 min, moderado ou HIIT no painel!'
                : selectedCategory === 'workouts'
                ? 'Nenhum treino de musculação concluído registrado ainda. Inicie seu primeiro treino!'
                : 'Nenhum treino de musculação ou cardio concluído registrado ainda.'}
            </p>
            {(searchTerm || (selectedCategory !== 'cardio' && selectedMuscle !== 'ALL')) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMuscle('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} /> Limpar Filtros e Busca
              </button>
            )}
          </div>
        ) : (
          (() => {
            const renderWorkoutCard = (workout: CompletedWorkout) => {
            const isExpanded = expandedId === workout.id;

            // Pre-calculate workout-level progression summaries across all its exercises
            const exerciseComparisons = workout.exercises.map((ex) =>
              computeExerciseComparison(ex, workout, history)
            );

            const weightIncreasesCount = exerciseComparisons.filter((c) => c.hasWeightIncrease).length;
            const repsIncreasesCount = exerciseComparisons.filter(
              (c) => c.hasRepsIncrease && !c.hasWeightIncrease
            ).length;

            const workoutCalories = workout.estimatedCalories || calculateEstimatedCalories(workout.durationSeconds, workout.totalVolumeKg);

            return (
              <div
                key={workout.id}
                id={`history-item-${workout.id}`}
                className="bg-[#161616] border border-white/5 hover:border-white/10 rounded-3xl p-4 shadow-xl transition-all"
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-black font-mono-numbers text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20">
                        {formatDatePT(workout.completedAt || workout.startedAt)}
                      </span>

                      {/* Calorie burn badge */}
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25 flex items-center gap-1 font-mono-numbers shadow-sm">
                        <Flame size={11} className="fill-amber-400" />
                        ~{workoutCalories} kcal
                      </span>

                      {/* Progression summary pill on the workout card */}
                      {weightIncreasesCount > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25 flex items-center gap-1 shadow-sm">
                          <TrendingUp size={11} className="stroke-[2.5]" />
                          {weightIncreasesCount} {weightIncreasesCount === 1 ? 'exercício com +Carga' : 'com +Carga'}
                        </span>
                      )}

                      {repsIncreasesCount > 0 && (
                        <span className="text-[10px] font-bold text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/25 flex items-center gap-1">
                          <Zap size={11} />
                          {repsIncreasesCount} com +Reps
                        </span>
                      )}

                      {workout.personalRecords && workout.personalRecords.length > 0 && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                          <Star size={11} className="fill-amber-400" />
                          {workout.personalRecords.length} PR(s)
                        </span>
                      )}

                      {workout.rating && (
                        <span className="text-[10px] font-mono-numbers text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                          RPE: {workout.rating}/10
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-white text-base tracking-tight">
                      {workout.routineName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (onShareWorkout) {
                          onShareWorkout(workout);
                        } else {
                          setInternalShareWorkout(workout);
                        }
                      }}
                      className="p-2 text-neutral-400 hover:text-[#00D1C1] rounded-xl hover:bg-[#00D1C1]/10 transition-colors cursor-pointer"
                      title="Compartilhar resumo (Imagem ou Texto)"
                    >
                      <Share2 size={15} />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Deseja excluir este treino do histórico e da nuvem?')) {
                          onDeleteHistoryItem(workout.id);
                        }
                      }}
                      className="p-2 text-neutral-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Excluir histórico"
                    >
                      <Trash2 size={15} />
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : workout.id)}
                      className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                      title={isExpanded ? 'Recolher detalhes' : 'Expandir comparação'}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Metrics Summary Strip with Estimated Calories */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-center text-xs">
                  <div className="bg-[#222222] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-neutral-400 uppercase block">Duração</span>
                    <span className="font-mono-numbers font-bold text-white">
                      {formatWorkoutDuration(workout.durationSeconds)}
                    </span>
                  </div>

                  {(() => {
                    const totalIsoSec = workout.totalIsometricSeconds || calculateTotalIsometricSeconds(workout.exercises);
                    return (
                      <div className="bg-[#222222] p-2 rounded-xl border border-white/5">
                        <span className="text-[10px] text-neutral-400 uppercase block">Séries / Reps</span>
                        <span className="font-mono-numbers font-bold text-white">
                          {workout.totalSets}s • {workout.totalReps > 0 ? `${workout.totalReps}r` : totalIsoSec > 0 ? formatHoldDuration(totalIsoSec) : '0r'}
                        </span>
                        {totalIsoSec > 0 && workout.totalReps > 0 && (
                          <span className="text-[10px] text-amber-300 font-mono-numbers block -mt-0.5">
                            ⏱️ {formatHoldDuration(totalIsoSec)}
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  <div className="bg-[#222222] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-neutral-400 uppercase block">Volume</span>
                    <span className="font-mono-numbers font-bold text-[#00D1C1]">
                      {workout.totalVolumeKg.toLocaleString('pt-BR')} kg
                    </span>
                  </div>

                  <div className="bg-[#222222] p-2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-neutral-400 uppercase block flex items-center justify-center gap-1">
                      <Flame size={10} className="text-amber-400" /> Gasto Estimado
                    </span>
                    <span className="font-mono-numbers font-bold text-amber-300">
                      ~{workoutCalories} kcal
                    </span>
                  </div>
                </div>

                {/* Notes if any */}
                {workout.notes && (
                  <p className="text-xs text-neutral-300 italic bg-[#222222]/80 px-3 py-2 rounded-xl border border-white/5 mb-2">
                    "{workout.notes}"
                  </p>
                )}

                {/* Expanded Detailed Breakdown with Exercise Progression Comparison */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase">
                      <span>Exercícios & Comparação de Evolução:</span>
                      <span className="text-[10px] text-neutral-500 lowercase font-normal">
                        (vs. treino anterior do mesmo exercício)
                      </span>
                    </div>

                    {workout.exercises.map((ex, exIdx) => {
                      const completedSets = ex.sets.filter((s) => s.completed);
                      const activeSets = completedSets.length > 0 ? completedSets : ex.sets || [];
                      const comp = exerciseComparisons[exIdx];
                      const isMuscleMatch = selectedMuscle !== 'ALL' && ex.muscleGroup === selectedMuscle;
                      const isExIso = isIsometricExercise(ex);

                      return (
                        <div
                          key={ex.id || exIdx}
                          className={`rounded-2xl p-3.5 space-y-2.5 shadow-sm transition-all ${
                            isMuscleMatch
                              ? 'bg-[#222222] border-2 border-[#00D1C1]/50 shadow-[#00D1C1]/5'
                              : 'bg-[#202020] border border-white/5'
                          }`}
                        >
                          {/* Exercise Card Title & Highlights */}
                          <div className="flex items-center justify-between flex-wrap gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {ex.exerciseName}
                              </span>

                              {isExIso && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-sm">
                                  ⏱️ ISOMETRIA
                                </span>
                              )}

                              {/* Progression Mini-Badge in Exercise Header */}
                              {comp.hasWeightIncrease && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                  <TrendingUp size={11} className="stroke-[2.5]" />
                                  +{comp.weightDiff} kg Carga
                                </span>
                              )}

                              {comp.hasRepsIncrease && !comp.hasWeightIncrease && (
                                <span className="px-2 py-0.5 rounded-full bg-[#00D1C1]/15 border border-[#00D1C1]/30 text-[10px] font-black text-[#00D1C1] flex items-center gap-1">
                                  <Zap size={11} />
                                  {isExIso ? `+${formatHoldDuration(comp.repsDiff)} Sustentação` : `+${comp.repsDiff} Reps`}
                                </span>
                              )}
                            </div>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                                isMuscleMatch
                                  ? 'bg-[#00D1C1] text-black font-black border-[#00D1C1]'
                                  : 'text-[#00D1C1] bg-[#00D1C1]/10 border-[#00D1C1]/20'
                              }`}
                            >
                              {ex.muscleGroup}
                            </span>
                          </div>

                          {/* ========================================================= */}
                          {/* VISUALIZAÇÃO DE COMPARAÇÃO COM O TREINO ANTERIOR          */}
                          {/* ========================================================= */}
                          {comp.hasPrevious ? (
                            <div className="bg-[#161616] rounded-xl p-2.5 border border-white/5 space-y-2">
                              {/* Comparison Header with Date & Status Badge */}
                              <div className="flex items-center justify-between flex-wrap gap-1 text-[11px]">
                                <div className="flex items-center gap-1.5 text-neutral-400">
                                  <History size={12} className="text-[#00D1C1]" />
                                  <span className="font-semibold text-neutral-300">Vs. Treino Anterior:</span>
                                  {comp.prevDate && (
                                    <span className="text-neutral-400 font-mono-numbers text-[10px]">
                                      {comp.prevDate}
                                    </span>
                                  )}
                                </div>

                                {/* Status Chip */}
                                {comp.statusType === 'double_increase' && (
                                  <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40 flex items-center gap-1">
                                    <Flame size={11} className="text-emerald-400" />
                                    {comp.statusLabel}
                                  </span>
                                )}

                                {comp.statusType === 'weight_increase' && (
                                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                                    <TrendingUp size={11} />
                                    {comp.statusLabel}
                                  </span>
                                )}

                                {comp.statusType === 'reps_increase' && (
                                  <span className="text-[10px] font-black text-[#00D1C1] bg-[#00D1C1]/15 px-2 py-0.5 rounded-md border border-[#00D1C1]/30 flex items-center gap-1">
                                    <Zap size={11} />
                                    {comp.statusLabel}
                                  </span>
                                )}

                                {comp.statusType === 'maintained' && (
                                  <span className="text-[10px] font-medium text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 flex items-center gap-1">
                                    <Minus size={11} />
                                    {comp.statusLabel}
                                  </span>
                                )}

                                {comp.statusType === 'decreased' && (
                                  <span className="text-[10px] font-medium text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-md border border-white/5">
                                    {comp.statusLabel}
                                  </span>
                                )}
                              </div>

                              {/* Comparison Metric Columns */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {/* 1. Carga Máxima (Peak Working Weight) */}
                                <div
                                  className={`p-2 rounded-xl border text-xs transition-colors ${
                                    comp.hasWeightIncrease
                                      ? 'bg-emerald-500/10 border-emerald-500/30'
                                      : 'bg-[#1b1b1b] border-white/5'
                                  }`}
                                >
                                  <div className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center justify-between">
                                    <span>{isExIso ? 'Carga Máx' : 'Carga Máxima'}</span>
                                    {comp.hasWeightIncrease ? (
                                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                        <ArrowUpRight size={12} className="stroke-[2.5]" />
                                        +{comp.weightDiff} kg
                                      </span>
                                    ) : comp.weightDiff < 0 ? (
                                      <span className="text-neutral-400 flex items-center gap-0.5">
                                        <ArrowDownRight size={12} />
                                        {comp.weightDiff} kg
                                      </span>
                                    ) : (
                                      <span className="text-neutral-400 font-mono-numbers text-[9px]">= Mantida</span>
                                    )}
                                  </div>

                                  <div className="font-mono-numbers font-black text-sm mt-1 flex items-baseline gap-1.5">
                                    <span className={comp.hasWeightIncrease ? 'text-emerald-300' : 'text-white'}>
                                      {comp.currentMaxWeight} kg
                                    </span>
                                    <span className="text-[10px] text-neutral-400 line-through">
                                      {comp.prevMaxWeight} kg
                                    </span>
                                  </div>
                                </div>

                                {/* 2. Repetições Totais ou Tempo de Sustentação */}
                                <div
                                  className={`p-2 rounded-xl border text-xs transition-colors ${
                                    comp.hasRepsIncrease
                                      ? 'bg-[#00D1C1]/10 border-[#00D1C1]/30'
                                      : 'bg-[#1b1b1b] border-white/5'
                                  }`}
                                >
                                  <div className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center justify-between">
                                    <span>{isExIso ? 'Tempo Sustentação' : 'Total de Reps'}</span>
                                    {comp.hasRepsIncrease ? (
                                      <span className="text-[#00D1C1] font-bold flex items-center gap-0.5">
                                        <ArrowUpRight size={12} className="stroke-[2.5]" />
                                        +{isExIso ? formatHoldDuration(comp.repsDiff) : `${comp.repsDiff} r`}
                                      </span>
                                    ) : comp.repsDiff < 0 ? (
                                      <span className="text-neutral-400 flex items-center gap-0.5">
                                        <ArrowDownRight size={12} />
                                        {isExIso ? `-${formatHoldDuration(Math.abs(comp.repsDiff))}` : `${comp.repsDiff} r`}
                                      </span>
                                    ) : (
                                      <span className="text-neutral-400 font-mono-numbers text-[9px]">= Mantido</span>
                                    )}
                                  </div>

                                  <div className="font-mono-numbers font-black text-sm mt-1 flex items-baseline gap-1.5">
                                    <span className={comp.hasRepsIncrease ? 'text-[#00D1C1]' : 'text-white'}>
                                      {isExIso ? formatHoldDuration(comp.currentTotalReps) : `${comp.currentTotalReps} reps`}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 line-through">
                                      {isExIso ? formatHoldDuration(comp.prevTotalReps) : `${comp.prevTotalReps} r`}
                                    </span>
                                  </div>
                                </div>

                                {/* 3. Volume Total de Carga ou Carga Adicional */}
                                <div
                                  className={`p-2 rounded-xl border text-xs col-span-2 sm:col-span-1 transition-colors ${
                                    comp.hasVolumeIncrease && !isExIso
                                      ? 'bg-amber-500/10 border-amber-500/25'
                                      : 'bg-[#1b1b1b] border-white/5'
                                  }`}
                                >
                                  <div className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center justify-between">
                                    <span>{isExIso ? 'Carga Adicional' : 'Volume Total'}</span>
                                    {!isExIso && comp.hasVolumeIncrease && (
                                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                        <ArrowUpRight size={12} />
                                        +{comp.volumeDiff.toLocaleString('pt-BR')} kg
                                      </span>
                                    )}
                                  </div>

                                  <div className="font-mono-numbers font-black text-sm mt-1 flex items-baseline gap-1.5">
                                    {isExIso ? (
                                      <span className="text-white">
                                        {comp.currentMaxWeight > 0 ? `+${comp.currentMaxWeight} kg` : 'Peso Corporal'}
                                      </span>
                                    ) : (
                                      <>
                                        <span className={comp.hasVolumeIncrease ? 'text-amber-300' : 'text-white'}>
                                          {comp.currentTotalVolume.toLocaleString('pt-BR')} kg
                                        </span>
                                        <span className="text-[10px] text-neutral-400 line-through">
                                          {comp.prevTotalVolume.toLocaleString('pt-BR')} kg
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* First time performing exercise */
                            <div className="bg-[#161616] rounded-xl px-3 py-2 border border-dashed border-white/10 flex items-center justify-between text-xs text-neutral-400">
                              <span className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                                <Sparkles size={13} /> Primeiro registro deste exercício no histórico
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono-numbers">
                                Base: {isExIso ? formatHoldDuration(comp.currentTotalReps) : `${comp.currentMaxWeight}kg · ${comp.currentTotalReps} reps`}
                              </span>
                            </div>
                          )}

                          {/* Sets List */}
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                              Séries Realizadas ({activeSets.length}):
                            </span>

                            {activeSets.length === 0 ? (
                              <p className="text-[11px] text-neutral-500 italic">
                                Nenhuma série marcada como concluída.
                              </p>
                            ) : (
                              activeSets.map((s, sIdx) => {
                                const hasSetWeightIncrease =
                                  s.previousWeight !== undefined && s.weight > s.previousWeight;
                                const hasSetRepsIncrease =
                                  s.previousReps !== undefined && s.reps > s.previousReps;

                                return (
                                  <div
                                    key={s.id || sIdx}
                                    className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg font-mono-numbers transition-colors ${
                                      s.isPersonalRecord
                                        ? 'bg-amber-500/10 border border-amber-500/25 text-amber-300'
                                        : 'bg-[#181818] text-neutral-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 font-sans text-[11px]">
                                      <span className="text-neutral-400">
                                        Série {s.setNumber}:
                                      </span>
                                      {s.isPersonalRecord && (
                                        <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
                                          <Trophy size={10} /> {isExIso ? 'Recorde de Tempo (PR)' : 'PR'}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white">
                                        {isExIso
                                          ? `${s.weight > 0 ? `+${s.weight} kg • ` : ''}${formatHoldDuration(s.holdSeconds || s.reps)} sustentação`
                                          : `${s.weight} kg × ${s.reps} reps`}
                                      </span>

                                      {/* Mini set delta indicator if available */}
                                      {hasSetWeightIncrease && (
                                        <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                                          +{parseFloat((s.weight - (s.previousWeight || 0)).toFixed(1))}kg
                                        </span>
                                      )}
                                      {!hasSetWeightIncrease && hasSetRepsIncrease && (
                                        <span className="text-[10px] font-bold text-[#00D1C1] flex items-center">
                                          +{isExIso ? formatHoldDuration(s.reps - (s.previousReps || 0)) : `${s.reps - (s.previousReps || 0)}r`}
                                        </span>
                                      )}
                                    </div>

                                    <span className={`text-[11px] ${isExIso ? 'text-amber-400 font-mono-numbers' : 'text-[#00D1C1]'}`}>
                                      {isExIso ? `⏱️ ${formatHoldDuration(s.holdSeconds || s.reps)}` : `${s.weight * s.reps} kg vol`}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Action: Share & Repeat Workout */}
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (onShareWorkout) {
                            onShareWorkout(workout);
                          } else {
                            setInternalShareWorkout(workout);
                          }
                        }}
                        className="w-full py-3 bg-[#1A1A22] hover:bg-[#252530] border border-white/10 hover:border-[#00D1C1]/50 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Share2 size={14} className="text-[#00D1C1]" />
                        COMPARTILHAR
                      </button>

                      <button
                        onClick={() => onRepeatWorkout(workout)}
                        className="w-full py-3 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-2xl shadow-lg shadow-[#00D1C1]/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <Repeat size={15} />
                        REPETIR TREINO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          };

          if (selectedCategory === 'workouts') {
            return filteredHistory.map((workout) => renderWorkoutCard(workout));
          }
          if (selectedCategory === 'cardio') {
            return filteredCardio.map((session) => renderCardioCard(session));
          }
          return combinedItems.map((item) =>
            item.itemType === 'workout'
              ? renderWorkoutCard(item.workout)
              : renderCardioCard(item.cardio)
          );
        })()
      )}
    </div>

    {/* Workout Share Modal */}
    <WorkoutShareModal
      isOpen={!!internalShareWorkout}
      onClose={() => setInternalShareWorkout(null)}
      workout={internalShareWorkout}
      athleteName={athleteName}
    />

    {/* Cardio Edit Modal */}
    <EditCardioModal
      isOpen={!!editingCardioSession}
      session={editingCardioSession}
      onClose={() => setEditingCardioSession(null)}
      onSave={handleSaveEditedCardio}
      onDelete={(id) => {
        handleDeleteCardio(id);
        setEditingCardioSession(null);
      }}
    />
  </div>
);
};
