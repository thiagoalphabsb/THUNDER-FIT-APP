import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  Trash2, 
  Clock, 
  Zap, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Star, 
  Sparkles, 
  Minus, 
  RotateCcw,
  ArrowRight,
  MoreVertical,
  Timer,
  Play,
  Square
} from 'lucide-react';
import { Exercise, ExerciseSet, MuscleGroup, PRRecord, WorkoutExercise } from '../types';
import { 
  calculateCompletedSetsCount, 
  calculateTotalVolume, 
  calculateTotalIsometricSeconds,
  isIsometricExercise,
  formatHoldDuration,
  formatTimerDigits, 
  formatWorkoutDuration 
} from '../utils/calc';
import { soundFx } from '../utils/audio';

interface ActiveWorkoutProps {
  routineName: string;
  exercises: WorkoutExercise[];
  startedAt: string;
  onUpdateExercises: (exercises: WorkoutExercise[]) => void;
  onTriggerRestTimer: (seconds: number, exerciseName: string) => void;
  onFinishWorkout: () => void;
  onCancelWorkout: () => void;
  onOpenAddExerciseModal: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  routineName,
  exercises,
  startedAt,
  onUpdateExercises,
  onTriggerRestTimer,
  onFinishWorkout,
  onCancelWorkout,
  onOpenAddExerciseModal,
  soundEnabled = true,
  vibrationEnabled = true
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeNoteExerciseId, setActiveNoteExerciseId] = useState<string | null>(null);
  const [activeHoldSet, setActiveHoldSet] = useState<{ exerciseId: string; setId: string; elapsed: number } | null>(null);

  // Live Hold Stopwatch interval
  useEffect(() => {
    if (!activeHoldSet) return;
    const interval = setInterval(() => {
      setActiveHoldSet((prev) => {
        if (!prev) return null;
        return { ...prev, elapsed: prev.elapsed + 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeHoldSet?.exerciseId, activeHoldSet?.setId]);

  // Start live hold stopwatch on a set
  const handleStartHoldTimer = (exerciseId: string, setId: string, initialSeconds: number = 0) => {
    soundFx.playTick();
    setActiveHoldSet({ exerciseId, setId, elapsed: initialSeconds });
  };

  // Stop and save live hold stopwatch on a set
  const handleStopAndSaveHoldTimer = (exerciseId: string, setId: string) => {
    if (!activeHoldSet) return;
    const elapsed = Math.max(1, activeHoldSet.elapsed);
    const targetEx = exercises.find((e) => e.id === exerciseId);
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s) => {
          if (s.id === setId) {
            return {
              ...s,
              reps: elapsed,
              holdSeconds: elapsed,
              completed: true,
              completedAt: new Date().toISOString()
            };
          }
          return s;
        })
      };
    });
    onUpdateExercises(updated);
    setActiveHoldSet(null);
    if (soundEnabled) soundFx.playSetComplete();
    if (vibrationEnabled) soundFx.vibrate(80);
    if (targetEx) {
      onTriggerRestTimer(targetEx.restSeconds || 60, targetEx.exerciseName);
    }
  };

  // Calculate live workout duration
  useEffect(() => {
    const startMs = new Date(startedAt).getTime();
    const updateTime = () => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((now - startMs) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const totalVolume = calculateTotalVolume(exercises);
  const totalSetsCompleted = calculateCompletedSetsCount(exercises);
  const totalIsometricSeconds = calculateTotalIsometricSeconds(exercises);

  // Set toggle completion
  const handleToggleSetComplete = (exerciseId: string, setId: string) => {
    const targetExercise = exercises.find((e) => e.id === exerciseId);
    if (!targetExercise) return;

    let justCompleted = false;

    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;

      const newSets = ex.sets.map((s) => {
        if (s.id === setId) {
          const nextCompleted = !s.completed;
          if (nextCompleted) justCompleted = true;
          return {
            ...s,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined
          };
        }
        return s;
      });

      return { ...ex, sets: newSets };
    });

    onUpdateExercises(updated);

    if (justCompleted) {
      if (soundEnabled) soundFx.playSetComplete();
      if (vibrationEnabled) soundFx.vibrate(80);
      // Auto trigger rest timer
      onTriggerRestTimer(targetExercise.restSeconds || 120, targetExercise.exerciseName);
    }
  };

  // Update Weight for a specific set
  const handleUpdateWeight = (exerciseId: string, setId: string, newWeight: number) => {
    const validWeight = Math.max(0, Math.round(newWeight * 10) / 10);
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s) => (s.id === setId ? { ...s, weight: validWeight } : s))
      };
    });
    onUpdateExercises(updated);
  };

  // Update Reps (or Hold Seconds) for a specific set
  const handleUpdateReps = (exerciseId: string, setId: string, newReps: number) => {
    const validReps = Math.max(0, Math.floor(newReps));
    const targetEx = exercises.find((e) => e.id === exerciseId);
    const isIso = targetEx ? (targetEx.isIsometric || isIsometricExercise(targetEx)) : false;

    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s) => (s.id === setId ? { 
          ...s, 
          reps: validReps,
          holdSeconds: isIso ? validReps : s.holdSeconds,
          isIsometric: isIso || s.isIsometric
        } : s))
      };
    });
    onUpdateExercises(updated);
  };

  // Add Set to Exercise
  const handleAddSet = (exerciseId: string) => {
    const targetEx = exercises.find((e) => e.id === exerciseId);
    const isIso = targetEx ? (targetEx.isIsometric || isIsometricExercise(targetEx)) : false;

    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNumber = ex.sets.length + 1;
      const initialReps = lastSet ? lastSet.reps : (isIso ? 45 : 10);
      const initialWeight = lastSet ? lastSet.weight : (isIso ? 0 : 20);

      const newSet: ExerciseSet = {
        id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        setNumber: newSetNumber,
        type: 'normal',
        weight: initialWeight,
        reps: initialReps,
        completed: false,
        previousWeight: lastSet?.previousWeight,
        previousReps: lastSet?.previousReps,
        isIsometric: isIso,
        holdSeconds: isIso ? initialReps : undefined
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    });
    onUpdateExercises(updated);
  };

  // Delete Set from Exercise
  const handleDeleteSet = (exerciseId: string, setId: string) => {
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      if (ex.sets.length <= 1) return ex; // Keep at least one
      const filtered = ex.sets.filter((s) => s.id !== setId);
      const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...ex, sets: renumbered };
    });
    onUpdateExercises(updated);
  };

  // Remove Exercise from workout
  const handleRemoveExercise = (exerciseId: string) => {
    if (confirm('Remover este exercício do treino atual?')) {
      const updated = exercises.filter((ex) => ex.id !== exerciseId);
      onUpdateExercises(updated);
    }
  };

  // Reorder exercise up/down
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= exercises.length) return;
    const newOrder = [...exercises];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIdx, 0, moved);
    onUpdateExercises(newOrder);
  };

  // Update exercise notes
  const handleUpdateNotes = (exerciseId: string, notes: string) => {
    const updated = exercises.map((ex) => (ex.id === exerciseId ? { ...ex, notes } : ex));
    onUpdateExercises(updated);
  };

  return (
    <div id="active-workout-screen" className="min-h-screen pb-32 bg-[#0A0A0A] text-neutral-100 max-w-lg mx-auto">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-widest text-[#00D1C1] uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D1C1] animate-pulse"></span>
              TREINO EM TEMPO REAL
            </span>
            <h1 className="text-base font-black text-white tracking-tight truncate max-w-[200px]">
              {routineName || 'Treino Ativo'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="cancel-workout-btn"
              onClick={onCancelWorkout}
              className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors font-semibold"
              title="Descartar treino"
            >
              Cancelar
            </button>

            <button
              id="finish-workout-header-btn"
              onClick={onFinishWorkout}
              className="px-4 py-1.5 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-xl shadow-lg shadow-[#00D1C1]/20 active:scale-95 transition-all flex items-center gap-1"
            >
              <Check size={16} strokeWidth={3} />
              FINALIZAR
            </button>
          </div>
        </div>

        {/* Live Counters Banner */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Clock size={14} className="text-[#00D1C1]" />
            <span className="font-mono-numbers font-bold text-white text-sm">
              {formatTimerDigits(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-300">
            <Zap size={14} className="text-amber-400" />
            <span className="text-neutral-400 font-medium">Volume:</span>
            <span className="font-mono-numbers font-bold text-[#00D1C1] text-sm">
              {totalVolume.toLocaleString('pt-BR')} kg
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-neutral-300">
            <span className="text-neutral-400 font-medium">Séries:</span>
            <span className="font-mono-numbers font-bold text-white">
              {totalSetsCompleted} concluídas
            </span>
          </div>

          {totalIsometricSeconds > 0 && (
            <div className="flex items-center gap-1.5 text-neutral-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <Timer size={12} className="text-amber-400" />
              <span className="text-neutral-400 font-medium">Isometria:</span>
              <span className="font-mono-numbers font-bold text-amber-300 text-xs">
                {formatHoldDuration(totalIsometricSeconds)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Exercises List */}
      <main className="p-3 space-y-4">
        {exercises.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#161616] rounded-3xl border border-dashed border-white/10">
            <p className="text-neutral-400 text-sm mb-4">Nenhum exercício adicionado a este treino.</p>
            <button
              onClick={onOpenAddExerciseModal}
              className="px-5 py-3 bg-[#00D1C1] text-black font-extrabold text-sm rounded-2xl shadow-lg shadow-[#00D1C1]/20"
            >
              + Adicionar Primeiro Exercício
            </button>
          </div>
        ) : (
          exercises.map((exercise, exIndex) => {
            const isNoteOpen = activeNoteExerciseId === exercise.id;
            const isIso = exercise.isIsometric || isIsometricExercise(exercise);

            return (
              <div
                key={exercise.id}
                id={`exercise-card-${exercise.id}`}
                className={`bg-[#161616] border rounded-3xl p-4 shadow-xl relative transition-all ${
                  isIso ? 'border-amber-500/20' : 'border-white/5'
                }`}
              >
                {/* Exercise Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-black uppercase text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20">
                        {exercise.muscleGroup}
                      </span>
                      {isIso && (
                        <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1 shadow-sm">
                          ⏱️ ISOMETRIA (TEMPO)
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-neutral-400 bg-[#0A0A0A] px-2 py-0.5 rounded-md border border-white/5">
                        {exercise.equipment}
                      </span>
                      <button
                        onClick={() => onTriggerRestTimer(exercise.restSeconds || (isIso ? 60 : 120), exercise.exerciseName)}
                        className="text-[10px] font-bold text-neutral-300 hover:text-[#00D1C1] bg-[#0A0A0A] px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1 transition-colors"
                      >
                        <Timer size={10} className="text-[#00D1C1]" />
                        {Math.floor((exercise.restSeconds || (isIso ? 60 : 120)) / 60)}:{(exercise.restSeconds || (isIso ? 60 : 120)) % 60 === 0 ? '00' : '30'}
                      </button>
                    </div>
                    <h2 className="font-extrabold text-white text-base tracking-tight">
                      {exercise.exerciseName}
                    </h2>
                  </div>

                  {/* Reorder and options buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveExercise(exIndex, 'up')}
                      disabled={exIndex === 0}
                      className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 transition-opacity"
                      title="Mover para cima"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveExercise(exIndex, 'down')}
                      disabled={exIndex === exercises.length - 1}
                      className="p-1.5 text-neutral-400 hover:text-white disabled:opacity-20 transition-opacity"
                      title="Mover para baixo"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      onClick={() => setActiveNoteExerciseId(isNoteOpen ? null : exercise.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        exercise.notes ? 'text-[#00D1C1] bg-[#00D1C1]/10' : 'text-neutral-400 hover:text-white'
                      }`}
                      title="Notas do exercício"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleRemoveExercise(exercise.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Excluir exercício"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Notes drawer if active */}
                {isNoteOpen ? (
                  <div className="mb-3 p-2.5 bg-[#0A0A0A] rounded-xl border border-white/10 animate-in fade-in">
                    <label className="text-[11px] font-bold text-neutral-400 block mb-1">
                      Observação / Dica de execução:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Foco no alongamento 3s, cotovelo fechado..."
                      value={exercise.notes || ''}
                      onChange={(e) => handleUpdateNotes(exercise.id, e.target.value)}
                      className="w-full bg-[#161616] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00D1C1]"
                    />
                  </div>
                ) : (
                  exercise.notes && (
                    <div
                      onClick={() => setActiveNoteExerciseId(exercise.id)}
                      className="mb-3 px-3 py-1.5 bg-[#00D1C1]/5 border border-[#00D1C1]/20 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-[#00D1C1]/10 transition-colors"
                    >
                      <span className="text-[11px] text-[#00D1C1] italic">
                        📝 {exercise.notes}
                      </span>
                    </div>
                  )
                )}

                {/* Sets Header Table */}
                <div className="grid grid-cols-12 gap-1.5 text-[11px] font-black uppercase text-neutral-400 mb-2 px-1 text-center items-center">
                  <div className="col-span-2 text-left">SÉRIE</div>
                  <div className="col-span-3 text-neutral-500">ANTERIOR</div>
                  <div className="col-span-3">{isIso ? 'CARGA (KG)' : 'CARGA (KG)'}</div>
                  <div className="col-span-2">{isIso ? 'TEMPO' : 'REPS'}</div>
                  <div className="col-span-2 text-right pr-1">STATUS</div>
                </div>

                {/* Sets Rows */}
                <div className="space-y-2">
                  {exercise.sets.map((set) => {
                    const isTimingThisSet = activeHoldSet?.exerciseId === exercise.id && activeHoldSet?.setId === set.id;

                    return (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 gap-1.5 items-center p-2 rounded-2xl transition-all ${
                          isTimingThisSet
                            ? 'bg-amber-500/20 border-2 border-amber-400 shadow-lg shadow-amber-500/20'
                            : set.completed
                            ? 'bg-[#00D1C1]/10 border border-[#00D1C1]/40'
                            : 'bg-[#1A1A1A] border border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Set Badge */}
                        <div className="col-span-2 flex items-center gap-1">
                          <span
                            className={`w-6 h-6 rounded-lg font-mono-numbers font-black text-xs flex items-center justify-center ${
                              isTimingThisSet
                                ? 'bg-amber-400 text-black font-black animate-pulse'
                                : set.completed
                                ? 'bg-[#00D1C1] text-black font-black'
                                : 'bg-[#222222] text-neutral-300'
                            }`}
                          >
                            {set.setNumber}
                          </span>
                        </div>

                        {/* Previous weight & reps indicator */}
                        <div className="col-span-3 text-center">
                          <span className="text-[11px] font-mono-numbers text-neutral-400 font-medium">
                            {set.previousReps !== undefined
                              ? isIso
                                ? `${set.previousWeight && set.previousWeight > 0 ? `+${set.previousWeight}kg ` : ''}${formatHoldDuration(set.previousReps)}`
                                : `${set.previousWeight ? `${set.previousWeight}kg × ` : ''}${set.previousReps || 10}`
                              : '—'}
                          </span>
                        </div>

                        {/* Weight Controller with Stepper */}
                        <div className="col-span-3 flex items-center justify-center">
                          <div className="flex items-center bg-[#222222] rounded-xl border border-white/10 p-0.5 w-full justify-between">
                            <button
                              onClick={() => handleUpdateWeight(exercise.id, set.id, set.weight - (isIso ? 1 : 2.5))}
                              className="w-5 h-7 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs active:scale-90"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              value={set.weight === 0 ? '' : set.weight}
                              placeholder="0"
                              onChange={(e) =>
                                handleUpdateWeight(
                                  exercise.id,
                                  set.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-9 bg-transparent text-center font-mono-numbers font-black text-sm text-white focus:outline-none"
                            />
                            <button
                              onClick={() => handleUpdateWeight(exercise.id, set.id, set.weight + (isIso ? 1 : 2.5))}
                              className="w-5 h-7 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs active:scale-90"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Reps or Hold Time Controller with Stepper */}
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="flex items-center bg-[#222222] rounded-xl border border-white/10 p-0.5 w-full justify-between">
                            <button
                              onClick={() => handleUpdateReps(exercise.id, set.id, Math.max(isIso ? 5 : 0, set.reps - (isIso ? 5 : 1)))}
                              className="w-4 h-7 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs active:scale-90"
                              title={isIso ? '-5 segundos' : '-1 rep'}
                            >
                              -
                            </button>
                            <div className="flex items-baseline justify-center">
                              <input
                                type="number"
                                value={set.reps === 0 ? '' : set.reps}
                                placeholder={isIso ? '45' : '0'}
                                onChange={(e) =>
                                  handleUpdateReps(
                                    exercise.id,
                                    set.id,
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className={`${isIso ? 'w-6' : 'w-7'} bg-transparent text-center font-mono-numbers font-black text-sm text-white focus:outline-none`}
                              />
                              {isIso && <span className="text-[9px] text-neutral-400 font-bold -ml-0.5">s</span>}
                            </div>
                            <button
                              onClick={() => handleUpdateReps(exercise.id, set.id, set.reps + (isIso ? 5 : 1))}
                              className="w-4 h-7 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs active:scale-90"
                              title={isIso ? '+5 segundos' : '+1 rep'}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Completion / Live Stopwatch Action */}
                        <div className="col-span-2 flex items-center justify-end gap-1">
                          {isTimingThisSet ? (
                            <button
                              onClick={() => handleStopAndSaveHoldTimer(exercise.id, set.id)}
                              className="px-2 h-8 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1 shadow-lg shadow-amber-400/30 animate-pulse active:scale-95 transition-all"
                              title="Parar e Salvar sustentação"
                            >
                              <Square size={11} className="fill-black" />
                              <span className="font-mono-numbers font-bold">{activeHoldSet.elapsed}s</span>
                            </button>
                          ) : (
                            <>
                              {isIso && !set.completed && (
                                <button
                                  onClick={() => handleStartHoldTimer(exercise.id, set.id, set.reps || 0)}
                                  className="w-8 h-8 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 flex items-center justify-center transition-all active:scale-90"
                                  title="Iniciar Cronômetro de Sustentação ao vivo"
                                >
                                  <Play size={13} className="fill-amber-400" />
                                </button>
                              )}
                              <button
                                id={`check-set-${exercise.id}-${set.id}`}
                                onClick={() => handleToggleSetComplete(exercise.id, set.id)}
                                className={`w-9 h-8 rounded-xl flex items-center justify-center font-black transition-all active:scale-90 ${
                                  set.completed
                                    ? 'bg-[#00D1C1] text-black shadow-lg shadow-[#00D1C1]/30 hover:bg-[#15e8d7]'
                                    : 'bg-[#222222] hover:bg-[#2c2c2c] text-neutral-400 hover:text-white border border-white/10'
                                }`}
                                title={set.completed ? 'Desfazer série' : 'Concluir série'}
                              >
                                <Check
                                  size={18}
                                  strokeWidth={set.completed ? 3.5 : 2}
                                  className={set.completed ? 'text-black' : 'text-neutral-400'}
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Isometric Quick Hold Preset Shortcuts */}
                {isIso && (
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span className="text-neutral-400 font-bold uppercase text-[9px]">Ajuste rápido de tempo:</span>
                    {[30, 45, 60, 90].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => {
                          const targetSet = exercise.sets.find((s) => !s.completed) || exercise.sets[exercise.sets.length - 1];
                          if (targetSet) {
                            handleUpdateReps(exercise.id, targetSet.id, sec);
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-white border border-white/5 active:scale-95 transition-colors font-mono-numbers"
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Increment Load Pills & + Set Button */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleAddSet(exercise.id)}
                    className="py-1.5 px-3 bg-[#0A0A0A] hover:bg-[#202020] text-xs font-bold text-neutral-200 rounded-xl border border-white/10 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Plus size={14} className="text-[#00D1C1]" />
                    Adicionar Série
                  </button>

                  {/* Delete last set if more than 1 */}
                  {exercise.sets.length > 1 && (
                    <button
                      onClick={() => handleDeleteSet(exercise.id, exercise.sets[exercise.sets.length - 1].id)}
                      className="text-[11px] text-neutral-500 hover:text-rose-400 transition-colors px-2 py-1"
                    >
                      Remover série
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Big Add Exercise Button */}
        <button
          id="active-add-exercise-btn"
          onClick={onOpenAddExerciseModal}
          className="w-full py-4 bg-[#161616] hover:bg-[#1f1f1f] border border-dashed border-white/10 hover:border-[#00D1C1]/50 rounded-3xl text-sm font-extrabold text-neutral-200 hover:text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
        >
          <Plus size={18} className="text-[#00D1C1]" strokeWidth={3} />
          ADICIONAR EXERCÍCIO AO TREINO
        </button>

        {/* Finish workout footer button */}
        <div className="pt-4">
          <button
            onClick={onFinishWorkout}
            className="w-full py-4 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-base rounded-2xl shadow-xl shadow-[#00D1C1]/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Check size={20} strokeWidth={3.5} />
            FINALIZAR TREINO ({totalSetsCompleted} séries)
          </button>
        </div>
      </main>
    </div>
  );
};
