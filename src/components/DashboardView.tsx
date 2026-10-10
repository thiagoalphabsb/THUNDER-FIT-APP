import React, { useMemo, useState } from 'react';
import { 
  Play, 
  Flame, 
  Calendar, 
  TrendingUp, 
  Dumbbell, 
  Clock, 
  Zap, 
  ChevronRight, 
  ChevronDown,
  Sparkles,
  Trophy,
  Activity,
  Plus,
  ListChecks,
  Timer
} from 'lucide-react';
import { CompletedWorkout, Exercise, Routine, UserProfile, CardioSession } from '../types';
import { formatDatePT, formatWorkoutDuration } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { CardioSection } from './CardioSection';
import { MobilityTipsSection } from './MobilityTipsSection';
import { getRoutineForToday, WEEKDAYS, getRoutineEffectiveDays } from '../utils/weekday';
import { BeachRestDayCard } from './BeachRestDayCard';
import { getExerciseDisplayName } from '../utils/routineTransfer';

interface DashboardViewProps {
  profile: UserProfile;
  routines: Routine[];
  history: CompletedWorkout[];
  exercises?: Exercise[];
  cardioSessions?: CardioSession[];
  onStartRoutine: (routine: Routine) => void;
  onStartEmptyWorkout: () => void;
  onNavigateToRoutines: () => void;
  onNavigateToProgress: () => void;
  onNavigateToHistory: () => void;
  onUpdateCardioSession?: (session: CardioSession) => void;
  onDeleteCardioSession?: (id: string) => void;
  onAddCardioSession?: (session: CardioSession) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  routines,
  history,
  exercises = [],
  cardioSessions,
  onStartRoutine,
  onStartEmptyWorkout,
  onNavigateToRoutines,
  onNavigateToProgress,
  onNavigateToHistory,
  onUpdateCardioSession,
  onDeleteCardioSession,
  onAddCardioSession
}) => {
  const [showExercises, setShowExercises] = useState(false);

  // Determine today's scheduled routine or rest day
  const {
    routine: todayRoutine,
    todayIndex,
    todayInfo,
    isRestDay,
    nextScheduledRoutine
  } = useMemo(() => getRoutineForToday(routines), [routines]);

  // Calculate this week's workouts
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Seg, 6 = Dom
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - currentDayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const workoutsThisWeek = history.filter((w) => {
    const d = new Date(w.startedAt);
    return d >= weekStart;
  });

  const daysTrained = new Set<number>();
  workoutsThisWeek.forEach((w) => {
    const d = new Date(w.startedAt);
    const dayIdx = (d.getDay() + 6) % 7;
    daysTrained.add(dayIdx);
  });

  const totalVolumeWeek = workoutsThisWeek.reduce((acc, curr) => acc + (curr.totalVolumeKg || 0), 0);
  const totalSetsWeek = workoutsThisWeek.reduce((acc, curr) => acc + (curr.totalSets || 0), 0);
  const lastWorkout = history.length > 0 ? history[0] : null;

  // Day names abbreviation
  const weekDayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

  return (
    <div id="dashboard-view" className="space-y-5 pb-28 pt-1">
      {/* Hero Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-black tracking-widest text-[#00D1C1] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D1C1] shadow-[0_0_8px_#00D1C1]"></span>
            FOCO & PERFORMANCE
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
            <span>Olá, {profile.name.split(' ')[0]}</span>
            <Dumbbell className="text-[#00D1C1] inline-block shrink-0" size={22} />
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Treine. Registre. Descanse. Evolua.
          </p>
        </div>

        <button
          onClick={onStartEmptyWorkout}
          className="p-2.5 bg-[#161616] hover:bg-[#202020] border border-white/10 rounded-2xl text-neutral-300 hover:text-[#00D1C1] flex items-center gap-1.5 text-xs font-bold transition-all shadow-md active:scale-95"
          title="Treino livre sem rotina fixa"
        >
          <Plus size={16} className="text-[#00D1C1]" />
          <span>Treino Rápido</span>
        </button>
      </div>

      {/* Main Card: Treino de Hoje (Hero Highlight) OR Beach Rest Day */}
      {todayRoutine ? (
        <div className="relative overflow-hidden bg-[#161616] border border-[#00D1C1]/30 rounded-3xl p-5 shadow-2xl shadow-[#00D1C1]/5">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#00D1C1]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black tracking-widest text-[#00D1C1] uppercase bg-[#00D1C1]/10 px-3 py-1 rounded-full border border-[#00D1C1]/30 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#00D1C1]" />
                TREINO DE HOJE ({todayInfo.name.toUpperCase()})
              </span>

              <button
                onClick={onNavigateToRoutines}
                className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-0.5 transition-colors"
              >
                Trocar rotina <ChevronRight size={14} />
              </button>
            </div>

            {/* Clickable Routine Info Header */}
            <div
              id="today-routine-header"
              onClick={() => {
                soundFx.playTick();
                setShowExercises((prev) => !prev);
              }}
              className="cursor-pointer group select-none transition-all"
              title="Toque para ver a lista de exercícios"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-[#00D1C1] transition-colors flex items-center gap-2">
                  <span>{todayRoutine.name}</span>
                  <ChevronDown
                    size={20}
                    className={`text-neutral-400 group-hover:text-[#00D1C1] transition-transform duration-200 ${
                      showExercises ? 'rotate-180' : ''
                    }`}
                  />
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                {todayRoutine.description || 'Rotina focada em hipertrofia e progressão de carga.'}
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="flex items-center gap-2.5 my-4 flex-wrap">
              <button
                type="button"
                id="toggle-today-exercises-chip"
                onClick={() => {
                  soundFx.playTick();
                  setShowExercises((prev) => !prev);
                }}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer border ${
                  showExercises
                    ? 'bg-[#00D1C1]/15 border-[#00D1C1]/40 text-[#00D1C1]'
                    : 'bg-[#0A0A0A] hover:bg-[#181818] border-white/5 hover:border-[#00D1C1]/30 text-white'
                }`}
                title="Ver lista de exercícios"
              >
                <Dumbbell size={15} className="text-[#00D1C1]" />
                <span className="text-xs font-bold font-mono-numbers">
                  {todayRoutine.exercises.length} exercícios
                </span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${showExercises ? 'rotate-180 text-[#00D1C1]' : 'text-neutral-400'}`}
                />
              </button>

              <div className="bg-[#0A0A0A] border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Activity size={15} className="text-indigo-400" />
                <span className="text-xs font-bold text-white font-mono-numbers">
                  {todayRoutine.exercises.reduce((acc, curr) => acc + curr.setsCount, 0)} séries
                </span>
              </div>

              {lastWorkout && (
                <div className="bg-[#0A0A0A] border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <Clock size={15} className="text-amber-400" />
                  <span className="text-xs font-medium text-neutral-300">
                    Último: <strong className="text-white font-mono-numbers">{formatWorkoutDuration(lastWorkout.durationSeconds)}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Target Muscles Pills */}
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
              {todayRoutine.targetMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="text-[11px] font-semibold text-neutral-300 bg-[#0A0A0A] px-2.5 py-0.5 rounded-lg border border-white/5"
                >
                  {muscle}
                </span>
              ))}
            </div>

            {/* Dedicated Toggle Bar Button */}
            <button
              type="button"
              id="toggle-today-exercises-btn"
              onClick={() => {
                soundFx.playTick();
                setShowExercises((prev) => !prev);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all mb-4 border ${
                showExercises
                  ? 'bg-[#00D1C1]/10 text-[#00D1C1] border-[#00D1C1]/30 shadow-md shadow-[#00D1C1]/5'
                  : 'bg-[#0A0A0A] hover:bg-[#151518] text-neutral-300 hover:text-white border-white/10 hover:border-[#00D1C1]/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <ListChecks size={16} className={showExercises ? 'text-[#00D1C1]' : 'text-neutral-400'} />
                <span>
                  {showExercises ? 'Ocultar lista de exercícios' : 'Ver lista de exercícios do dia'}
                </span>
                <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                  {todayRoutine.exercises.length}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#00D1C1] font-semibold">
                <span>{showExercises ? 'Recolher' : 'Toque para ver'}</span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${showExercises ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Expanded List of Exercises of Today's Routine */}
            {showExercises && (
              <div className="mb-4 pt-3 pb-2 border-t border-white/10 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ListChecks size={14} className="text-[#00D1C1]" />
                    Exercícios do Treino ({todayRoutine.exercises.length})
                  </span>
                  <span className="text-[11px] font-mono-numbers text-neutral-400">
                    {todayRoutine.exercises.reduce((acc, curr) => acc + curr.setsCount, 0)} séries no total
                  </span>
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                  {todayRoutine.exercises.map((item, idx) => {
                    const displayName = getExerciseDisplayName(item, exercises);
                    const matchedEx = exercises.find((e) => e.id === item.exerciseId);

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-[#0A0A0A] hover:bg-[#121215] rounded-2xl border border-white/5 transition-all text-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-[#161616] text-[#00D1C1] font-mono-numbers font-black flex items-center justify-center text-xs shrink-0 border border-white/5">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-sm truncate">
                                {displayName}
                              </h4>
                              {matchedEx && (
                                <span className="text-[10px] text-neutral-400 font-medium">
                                  {matchedEx.muscleGroup} • {matchedEx.equipment}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Sets x Reps Pill */}
                          <div className="text-right shrink-0">
                            <div className="text-[#00D1C1] font-mono-numbers font-bold text-xs bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20">
                              {item.setsCount} × {item.targetReps} reps
                            </div>
                            {item.initialWeight !== undefined && item.initialWeight > 0 && (
                              <div className="text-neutral-400 font-mono-numbers text-[10px] mt-0.5">
                                {item.initialWeight} kg
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rest & Notes if present */}
                        <div className="flex items-center gap-2.5 text-[10px] text-neutral-400 pt-1 border-t border-white/5 flex-wrap">
                          {item.restSeconds ? (
                            <span className="flex items-center gap-1 font-mono-numbers text-neutral-300">
                              <Timer size={11} className="text-[#00D1C1]" /> {item.restSeconds}s descanso
                            </span>
                          ) : null}
                          {item.notes && (
                            <span className="text-neutral-300 italic truncate max-w-full">
                              💡 {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playTick();
                      setShowExercises(false);
                    }}
                    className="text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1"
                  >
                    <span>Ocultar lista</span>
                    <ChevronDown size={13} className="rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* Big Primary Start Button */}
            <button
              id="dashboard-start-workout-btn"
              onClick={() => {
                soundFx.playTick();
                onStartRoutine(todayRoutine);
              }}
              className="w-full py-3.5 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-base rounded-2xl shadow-xl shadow-[#00D1C1]/20 flex items-center justify-center gap-2 active:scale-98 transition-all tracking-wide"
            >
              <Play size={20} fill="currentColor" />
              INICIAR TREINO DE HOJE
            </button>
          </div>
        </div>
      ) : routines.length > 0 ? (
        /* Beach Rest Day Card when no routine is scheduled for today (e.g. Quinta or Domingo) */
        <BeachRestDayCard
          todayInfo={todayInfo}
          nextScheduledRoutine={nextScheduledRoutine}
          onNavigateToRoutines={onNavigateToRoutines}
          onStartEmptyWorkout={onStartEmptyWorkout}
          onStartRoutine={onStartRoutine}
        />
      ) : (
        <div className="bg-[#161616] border border-white/5 rounded-3xl p-6 text-center">
          <p className="text-neutral-400 text-sm mb-3">Nenhuma rotina cadastrada ainda.</p>
          <button
            onClick={onNavigateToRoutines}
            className="py-3 px-5 bg-[#00D1C1] text-black font-black rounded-2xl text-sm"
          >
            Criar Minha Primeira Rotina
          </button>
        </div>
      )}

      {/* Weekly Consistency & Goal Tracker */}
      <div className="bg-[#161616] border border-white/5 rounded-3xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#00D1C1]" />
            <h3 className="font-bold text-sm text-white tracking-wide">
              Progresso Semanal
            </h3>
          </div>
          <span className="text-xs font-mono-numbers font-black text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded border border-[#00D1C1]/30">
            {workoutsThisWeek.length} de {profile.weeklyGoalWorkouts} treinos
          </span>
        </div>

        {/* 7 Days of the Week Indicator */}
        <div className="grid grid-cols-7 gap-2 my-3">
          {weekDayLabels.map((dayLabel, idx) => {
            const isCompleted = daysTrained.has(idx);
            const isToday = idx === currentDayOfWeek;

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-[#00D1C1]/15 border-[#00D1C1]/50 text-[#00D1C1] shadow-md shadow-[#00D1C1]/10'
                    : isToday
                    ? 'bg-[#222222] border-white/20 text-white'
                    : 'bg-[#111111] border-white/5 text-neutral-500'
                }`}
              >
                <span className="text-[10px] font-bold uppercase mb-1">{dayLabel}</span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCompleted
                      ? 'bg-[#00D1C1] text-black font-black'
                      : isToday
                      ? 'border border-neutral-400 text-neutral-300'
                      : 'text-neutral-600'
                  }`}
                >
                  {isCompleted ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Stats Summary */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5">
          <div className="bg-[#0A0A0A] p-2.5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Volume na Semana</span>
            <p className="text-sm font-black font-mono-numbers text-[#00D1C1] mt-0.5">
              {totalVolumeWeek.toLocaleString('pt-BR')} kg
            </p>
          </div>

          <div className="bg-[#0A0A0A] p-2.5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Séries Concluídas</span>
            <p className="text-sm font-black font-mono-numbers text-white mt-0.5">
              {totalSetsWeek} séries
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards: Evolução & Último Treino */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={onNavigateToProgress}
          className="bg-[#161616] hover:bg-[#1E1E1E] border border-white/5 hover:border-[#00D1C1]/40 rounded-3xl p-4 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[#00D1C1]/10 text-[#00D1C1] rounded-xl">
              <TrendingUp size={18} />
            </div>
            <ChevronRight size={16} className="text-neutral-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase">Evolução</span>
            <h4 className="font-extrabold text-white text-sm">Progresso de Carga</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Gráficos de 1RM e histórico</p>
          </div>
        </div>

        <div
          onClick={onNavigateToHistory}
          className="bg-[#161616] hover:bg-[#1E1E1E] border border-white/5 hover:border-[#00D1C1]/40 rounded-3xl p-4 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Trophy size={18} />
            </div>
            <ChevronRight size={16} className="text-neutral-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-neutral-400 uppercase">Histórico</span>
            <h4 className="font-extrabold text-white text-sm">Treinos Anteriores</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {history.length} sessões registradas
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Mini Feed */}
      {lastWorkout && (
        <div className="bg-[#161616] border border-white/5 rounded-3xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock size={16} className="text-[#00D1C1]" />
              Último Treino Realizado
            </h3>
            <span className="text-xs font-semibold text-neutral-400">
              {formatDatePT(lastWorkout.completedAt || lastWorkout.startedAt)}
            </span>
          </div>

          <div className="bg-[#0A0A0A] rounded-2xl p-3 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-sm">
                {lastWorkout.routineName}
              </span>
              <span className="text-xs font-mono-numbers font-bold text-[#00D1C1]">
                {lastWorkout.totalVolumeKg.toLocaleString('pt-BR')} kg
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
              <span>⏱ {formatWorkoutDuration(lastWorkout.durationSeconds)}</span>
              <span>🏋️ {lastWorkout.totalSets} séries</span>
              {lastWorkout.personalRecords?.length > 0 && (
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  ⭐ {lastWorkout.personalRecords.length} PR(s)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sessão de Cardio (Bicicleta Spinning, Aquecimento 5m, Moderado e HIIT com Cronômetro) */}
      <CardioSection
        history={history}
        routines={routines}
        exercises={exercises}
        cardioSessions={cardioSessions}
        onUpdateCardioSession={onUpdateCardioSession}
        onDeleteCardioSession={onDeleteCardioSession}
        onAddCardioSession={onAddCardioSession}
      />

      {/* Dicas & Mobilidade Articular */}
      <MobilityTipsSection />
    </div>
  );
};
