import React from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Moon, 
  Droplets, 
  Utensils, 
  Dumbbell, 
  Calendar 
} from 'lucide-react';
import { Routine } from '../types';
import { WeekdayInfo } from '../utils/weekday';

interface BeachRestDayCardProps {
  todayInfo: WeekdayInfo;
  nextScheduledRoutine: { routine: Routine; dayInfo: WeekdayInfo; daysUntil: number } | null;
  onNavigateToRoutines: () => void;
  onStartEmptyWorkout: () => void;
  onStartRoutine?: (routine: Routine) => void;
}

export const BeachRestDayCard: React.FC<BeachRestDayCardProps> = ({
  todayInfo,
  nextScheduledRoutine,
  onNavigateToRoutines,
  onStartEmptyWorkout,
  onStartRoutine
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#18181b] via-[#141417] to-[#0d0d0f] border border-cyan-500/25 rounded-3xl p-5 shadow-2xl space-y-4">
      {/* Tropical / Sunset Ambient Glow */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#00D1C1]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-xs font-black tracking-widest text-[#00D1C1] uppercase bg-[#00D1C1]/10 px-3 py-1 rounded-full border border-[#00D1C1]/30 flex items-center gap-1.5 shadow-sm">
          <Sparkles size={12} className="text-[#00D1C1] animate-pulse" />
          HOJE: {todayInfo.name.toUpperCase()}
        </span>

        <span className="text-[11px] font-bold text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
          🌴 DIA DE DESCANSO
        </span>
      </div>

      {/* Animated Beach & Hammock Scene */}
      <div className="relative z-10 bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Animated Background Sun & Sky */}
        <div className="absolute top-2 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 blur-md opacity-30 animate-pulse pointer-events-none" />

        {/* Tropical Beach Illustration with Animated Hammock */}
        <div className="relative w-full max-w-[280px] h-32 flex items-center justify-center select-none my-1">
          {/* Left Palm Tree */}
          <div className="absolute left-2 bottom-2 text-3xl animate-[bounce_4s_ease-in-out_infinite] origin-bottom">
            🌴
          </div>

          {/* Right Palm Tree */}
          <div className="absolute right-2 bottom-2 text-3xl animate-[bounce_4.5s_ease-in-out_infinite] origin-bottom delay-300">
            🌴
          </div>

          {/* Floating Sunset Cloud / Bird */}
          <div className="absolute top-1 left-6 text-sm opacity-70 animate-[pulse_3s_ease-in-out_infinite]">
            🌤️
          </div>
          <div className="absolute top-2 right-8 text-xs opacity-60">
            🕊️
          </div>

          {/* Beach Base with Sand & Sea Waves */}
          <div className="absolute bottom-0 w-full flex items-center justify-between text-base px-2 opacity-90">
            <span className="animate-[pulse_2s_infinite]">🌊</span>
            <span className="text-xl">🏖️</span>
            <span className="animate-[bounce_3s_infinite]">🥥</span>
            <span className="animate-[pulse_2.5s_infinite]">🍹</span>
            <span className="animate-[pulse_2s_infinite]">🌊</span>
          </div>

          {/* Swaying Hammock & Sleeping Athlete Mascot */}
          <div className="relative z-10 flex flex-col items-center animate-[sway_3s_ease-in-out_infinite] origin-top">
            {/* Hammock Rope Curve */}
            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-900/60 via-amber-800/80 to-amber-900/60 px-4 py-2 rounded-3xl border border-amber-500/30 shadow-lg backdrop-blur-sm">
              <span className="text-2xl animate-[spin_6s_linear_infinite]">🦥</span>
              <span className="text-3xl">😴</span>
              <span className="text-xl">🕶️</span>
            </div>

            {/* Floating zZz animation */}
            <div className="absolute -top-3 right-0 flex items-center gap-0.5 text-cyan-300 font-black font-mono animate-bounce">
              <span className="text-xs">z</span>
              <span className="text-sm">Z</span>
              <span className="text-base">Z</span>
            </div>
          </div>
        </div>

        {/* Humorous and motivating message */}
        <h3 className="text-lg font-black text-white tracking-tight mt-1 flex items-center gap-1.5">
          <span>Hoje o treino é na rede!</span>
          <span>⛱️</span>
        </h3>
        <p className="text-xs text-neutral-300 max-w-xs mt-1 leading-relaxed">
          Nenhum treino agendado para <strong>{todayInfo.name}</strong>. É no descanso que as fibras musculares se regeneram e os ganhos acontecem!
        </p>
      </div>

      {/* Recovery Pillars */}
      <div className="relative z-10 grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#1c1c20] border border-white/5 p-2.5 rounded-xl flex flex-col items-center">
          <Droplets size={16} className="text-cyan-400 mb-1" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Hidratação</span>
          <span className="text-[11px] font-black text-white font-mono-numbers mt-0.5">35-40ml/kg</span>
        </div>

        <div className="bg-[#1c1c20] border border-white/5 p-2.5 rounded-xl flex flex-col items-center">
          <Moon size={16} className="text-indigo-400 mb-1" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Sono</span>
          <span className="text-[11px] font-black text-white font-mono-numbers mt-0.5">7h - 9h</span>
        </div>

        <div className="bg-[#1c1c20] border border-white/5 p-2.5 rounded-xl flex flex-col items-center">
          <Utensils size={16} className="text-emerald-400 mb-1" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Proteína</span>
          <span className="text-[11px] font-black text-white font-mono-numbers mt-0.5">1.6-2.2g/kg</span>
        </div>
      </div>

      {/* Next Scheduled Routine Highlight (if available) */}
      {nextScheduledRoutine && (
        <div className="relative z-10 bg-[#17171a] border border-white/10 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-[#00D1C1]/10 border border-[#00D1C1]/20 flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-[#00D1C1]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                Próximo Treino ({nextScheduledRoutine.dayInfo.name})
              </span>
              <p className="text-xs font-black text-white truncate">
                {nextScheduledRoutine.routine.name}
              </p>
            </div>
          </div>

          {onStartRoutine && (
            <button
              onClick={() => onStartRoutine(nextScheduledRoutine.routine)}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-[#00D1C1] hover:text-black text-neutral-200 text-[11px] font-bold rounded-xl transition-all shrink-0"
            >
              Adiantar
            </button>
          )}
        </div>
      )}

      {/* Action Buttons for User Freedom */}
      <div className="relative z-10 flex items-center gap-2 pt-1">
        <button
          onClick={onNavigateToRoutines}
          className="flex-1 py-3 bg-[#222226] hover:bg-[#2c2c32] border border-white/10 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
        >
          <Dumbbell size={14} className="text-[#00D1C1]" />
          <span>Ver Todas as Rotinas</span>
          <ChevronRight size={14} className="text-neutral-400" />
        </button>

        <button
          onClick={onStartEmptyWorkout}
          className="py-3 px-4 bg-[#00D1C1]/15 hover:bg-[#00D1C1] hover:text-black border border-[#00D1C1]/30 text-[#00D1C1] font-black text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all active:scale-98"
          title="Fazer um treino livre avulso hoje"
        >
          <Plus size={15} />
          <span>Treino Livre</span>
        </button>
      </div>

      {/* Custom Keyframes for hammock sway */}
      <style>{`
        @keyframes sway {
          0%, 100% {
            transform: rotate(-3.5deg) translateY(0px);
          }
          50% {
            transform: rotate(3.5deg) translateY(3px);
          }
        }
      `}</style>
    </div>
  );
};
