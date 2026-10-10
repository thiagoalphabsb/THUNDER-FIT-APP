import React, { useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Dumbbell, Repeat, Zap, Star, ArrowRight, CheckCircle2, Share2, Flame } from 'lucide-react';
import { CompletedWorkout, PRRecord, WorkoutExercise } from '../types';
import { 
  formatWorkoutDuration, 
  calculateTotalVolume, 
  calculateCompletedSetsCount, 
  calculateTotalReps, 
  calculateTotalIsometricSeconds,
  calculateIsometricSetsCount,
  formatHoldDuration,
  calculateEstimatedCalories 
} from '../utils/calc';
import { soundFx } from '../utils/audio';
import { WorkoutShareModal } from './WorkoutShareModal';

interface WorkoutCompleteModalProps {
  isOpen: boolean;
  routineName: string;
  durationSeconds: number;
  exercises: WorkoutExercise[];
  personalRecords: PRRecord[];
  athleteName?: string;
  onConfirmFinish: (rating: number, notes: string) => void;
  onCancel: () => void;
}

export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  isOpen,
  routineName,
  durationSeconds,
  exercises,
  personalRecords,
  athleteName,
  onConfirmFinish,
  onCancel
}) => {
  const [rating, setRating] = useState<number>(9);
  const [notes, setNotes] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const totalVolume = calculateTotalVolume(exercises);
  const totalSets = calculateCompletedSetsCount(exercises);
  const totalReps = calculateTotalReps(exercises);
  const totalIsometricSeconds = calculateTotalIsometricSeconds(exercises);
  const totalIsometricSets = calculateIsometricSetsCount(exercises);
  const estimatedCalories = calculateEstimatedCalories(durationSeconds, totalVolume, 78, totalIsometricSeconds);

  const previewWorkout: CompletedWorkout = useMemo(() => ({
    id: 'active-preview-' + Date.now(),
    routineId: '',
    routineName: routineName || 'Treino Concluído',
    startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
    completedAt: new Date().toISOString(),
    durationSeconds,
    exercises,
    totalVolumeKg: totalVolume,
    totalSets,
    totalReps,
    totalIsometricSeconds,
    personalRecords,
    rating,
    notes,
    estimatedCalories
  }), [routineName, durationSeconds, exercises, totalVolume, totalSets, totalReps, totalIsometricSeconds, personalRecords, rating, notes, estimatedCalories]);

  useEffect(() => {
    if (isOpen) {
      soundFx.playCelebration();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00e5c0', '#ffffff', '#10f3ce', '#38bdf8']
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#161616] border border-[#00D1C1]/50 rounded-3xl p-6 shadow-2xl shadow-[#00D1C1]/20 my-8">
        {/* Top badge */}
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00D1C1] to-[#009b8f] p-0.5 shadow-xl shadow-[#00D1C1]/30 mb-3 animate-bounce">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[14px] flex items-center justify-center text-[#00D1C1]">
              <Trophy size={32} />
            </div>
          </div>

          <span className="text-xs font-black tracking-widest text-[#00D1C1] uppercase bg-[#00D1C1]/10 px-3 py-1 rounded-full border border-[#00D1C1]/30">
            TREINO FINALIZADO COM SUCESSO
          </span>

          <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
            {routineName || 'Treino Concluído'}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Treine. Registre. Descanse. Evolua.
          </p>
        </div>

        {/* Estimated Calorie Burn Highlight Card */}
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-[#00D1C1]/15 border border-amber-500/30 rounded-2xl p-3.5 my-4 flex items-center justify-between shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame size={20} className="fill-amber-400/40 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                Gasto Calórico Estimado
              </span>
              <span className="text-[11px] text-neutral-300">
                Baseado em {formatWorkoutDuration(durationSeconds)} e {totalVolume.toLocaleString('pt-BR')} kg levantados
              </span>
            </div>
          </div>
          <div className="text-right pl-2">
            <span className="text-2xl font-black text-amber-300 font-mono-numbers">
              ~{estimatedCalories}
            </span>
            <span className="text-xs text-amber-400 font-bold ml-1">kcal</span>
          </div>
        </div>

        {/* 4 Big Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-[#222222] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-blue-400">
              <Clock size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Duração</span>
              <span className="text-base font-black text-white font-mono-numbers">
                {formatWorkoutDuration(durationSeconds)}
              </span>
            </div>
          </div>

          <div className="bg-[#222222] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-[#00D1C1]">
              <Dumbbell size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Séries</span>
              <span className="text-base font-black text-white font-mono-numbers">
                {totalSets} séries
              </span>
            </div>
          </div>

          <div className="bg-[#222222] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-indigo-400">
              <Repeat size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Repetições</span>
              <span className="text-base font-black text-white font-mono-numbers">
                {totalReps} reps
              </span>
            </div>
          </div>

          <div className="bg-[#222222] border border-white/5 rounded-2xl p-3 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 text-amber-400">
              <Zap size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Volume</span>
              <span className="text-base font-black text-[#00D1C1] font-mono-numbers">
                {totalVolume.toLocaleString('pt-BR')} kg
              </span>
            </div>
          </div>
        </div>

        {/* Isometric Highlight if present */}
        {totalIsometricSeconds > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 my-2 flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Clock size={16} className="text-amber-400" />
              <span>Isometria Concluída ({totalIsometricSets} séries)</span>
            </div>
            <span className="font-mono-numbers font-black text-amber-300 text-sm">
              {formatHoldDuration(totalIsometricSeconds)}
            </span>
          </div>
        )}

        {/* PR Section */}
        {personalRecords.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/15 via-[#00D1C1]/15 to-transparent border border-amber-500/30 rounded-2xl p-3.5 mb-5">
            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Star size={16} className="fill-amber-400" />
              <span>Recordes Pessoais Superados! (PR)</span>
            </div>
            <div className="space-y-1.5">
              {personalRecords.map((pr, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {pr.exerciseName}
                  </span>
                  <span className="font-mono-numbers font-black text-[#00D1C1]">
                    {pr.type === 'max_hold_time'
                      ? `${formatHoldDuration(pr.reps)} de sustentação`
                      : `${pr.weight} kg × ${pr.reps} reps`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Effort & Rating */}
        <div className="space-y-3 mb-6 bg-[#0A0A0A] p-3.5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-300">
              Nível de Intensidade / RPE (1 a 10)
            </label>
            <span className="text-xs font-mono-numbers font-black text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded border border-[#00D1C1]/30">
              {rating}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full accent-[#00D1C1] bg-[#222222] h-2 rounded-lg cursor-pointer"
          />

          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-1">
              Observações do Treino (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Treino muito produtivo, boa progressão no supino..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#222222] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00D1C1]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            id="finish-workout-confirm-btn"
            onClick={() => onConfirmFinish(rating, notes)}
            className="w-full py-4 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-base rounded-2xl shadow-xl shadow-[#00D1C1]/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 size={20} />
            FINALIZAR E SALVAR TREINO
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playTick();
              setIsShareModalOpen(true);
            }}
            className="w-full py-3 bg-[#222226] hover:bg-[#2b2b32] border border-white/10 hover:border-[#00D1C1]/40 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Share2 size={16} className="text-[#00D1C1]" />
            GERAR RESUMO (FOTO OU TEXTO)
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2.5 text-neutral-400 hover:text-white text-xs font-bold tracking-wide"
          >
            Voltar e Continuar Treinando
          </button>
        </div>
      </div>

      {/* Workout Share Modal */}
      <WorkoutShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        workout={previewWorkout}
        athleteName={athleteName}
      />
    </div>
  );
};
