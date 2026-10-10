import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ShieldCheck, 
  Zap, 
  Dumbbell, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ArrowRight,
  BatteryCharging,
  Activity,
  Flame,
  Clock
} from 'lucide-react';
import { CompletedWorkout, Routine, UserProfile } from '../types';
import { soundFx } from '../utils/audio';

export interface VolumeAdjustment {
  target: string;
  type: 'increase' | 'maintain' | 'decrease' | 'deload';
  adjustmentBadge: string;
  recommendation: string;
  rationale: string;
}

export interface StrengthCoachData {
  readinessScore: number;
  recoveryLevel: 'plena' | 'moderada' | 'fadiga_residual' | 'deload_recomendado';
  recoveryLabel: string;
  recoverySummary: string;
  volumeTrend: {
    direction: 'up' | 'stable' | 'down';
    percentageChange: number;
    description: string;
  };
  coachSummary: string;
  suggestedAdjustments: VolumeAdjustment[];
  proTips: string[];
}

interface StrengthCoachCardProps {
  history: CompletedWorkout[];
  routines: Routine[];
  todayRoutine?: Routine | null;
  nextScheduledRoutine?: Routine | null;
  profile: UserProfile;
  onStartRoutine?: (routine: Routine) => void;
  onNavigateToRoutines?: () => void;
}

const STRENGTH_COACH_CACHE_KEY = 'thunder_strength_coach_analysis_v1';

export const StrengthCoachCard: React.FC<StrengthCoachCardProps> = ({
  history,
  routines,
  todayRoutine,
  nextScheduledRoutine,
  profile,
  onStartRoutine,
  onNavigateToRoutines
}) => {
  const [data, setData] = useState<StrengthCoachData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Determine the next target routine to analyze for volume prescription
  const nextTargetRoutine = useMemo(() => {
    return todayRoutine || nextScheduledRoutine || routines[0] || null;
  }, [todayRoutine, nextScheduledRoutine, routines]);

  // Load cached insight on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STRENGTH_COACH_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.data) {
          setData(parsed.data);
          if (parsed.timestamp) {
            setLastUpdated(new Date(parsed.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
          }
        }
      }
    } catch {
      // Ignore cache parse error
    }
  }, []);

  // Fetch or trigger analysis via Gemini AI
  const handleFetchAnalysis = useCallback(async (isManualRefresh = false) => {
    setLoading(true);
    setErrorMsg(null);
    if (isManualRefresh) {
      soundFx.playTick();
    }

    try {
      const res = await fetch('/api/strength-coach-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          history: history.slice(0, 10),
          nextRoutine: nextTargetRoutine,
          routines,
          profile: {
            weightKg: profile.weightKg,
            weeklyGoalWorkouts: profile.weeklyGoalWorkouts,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Erro na conexão com o Strength Coach (${res.status})`);
      }

      const json = await res.json();
      if (json.data) {
        setData(json.data);
        const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setLastUpdated(timeStr);

        try {
          localStorage.setItem(
            STRENGTH_COACH_CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              data: json.data,
            })
          );
        } catch {
          // Ignore local storage error
        }

        if (isManualRefresh) {
          soundFx.playSuccess();
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch Strength Coach analysis:', err);
      setErrorMsg('Não foi possível atualizar a análise agora. Exibindo última recomendação.');
    } finally {
      setLoading(false);
    }
  }, [history, nextTargetRoutine, routines, profile]);

  // Initial fetch on mount if no cached data
  useEffect(() => {
    if (!data && !loading && history.length > 0) {
      handleFetchAnalysis(false);
    }
  }, [data, history.length, loading, handleFetchAnalysis]);

  // Readiness color theme
  const readinessColor = useMemo(() => {
    const score = data?.readinessScore ?? 85;
    if (score >= 85) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' };
    if (score >= 70) return { text: 'text-[#00D1C1]', bg: 'bg-[#00D1C1]/15', border: 'border-[#00D1C1]/30' };
    if (score >= 55) return { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' };
  }, [data?.readinessScore]);

  const getAdjustmentStyle = (type: VolumeAdjustment['type']) => {
    switch (type) {
      case 'increase':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
          iconColor: 'text-emerald-400',
        };
      case 'decrease':
      case 'deload':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          badgeBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
          iconColor: 'text-amber-400',
        };
      case 'maintain':
      default:
        return {
          bg: 'bg-[#1a1a20]',
          border: 'border-white/5',
          badgeBg: 'bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30',
          iconColor: 'text-[#00D1C1]',
        };
    }
  };

  return (
    <div 
      id="strength-coach-card"
      className="bg-gradient-to-b from-[#18181f] via-[#141418] to-[#121215] border border-[#00D1C1]/30 rounded-3xl p-5 shadow-2xl shadow-[#00D1C1]/5 relative overflow-hidden transition-all"
    >
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00D1C1]/15 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 relative z-10 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00D1C1] to-[#009b8f] p-0.5 shadow-lg shadow-[#00D1C1]/20 shrink-0">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[14px] flex items-center justify-center text-[#00D1C1]">
              <Dumbbell size={20} className="rotate-[-10deg]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                <span>'Strength Coach'</span>
              </h2>
              <span className="text-[10px] font-mono-numbers font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00D1C1]/20 to-purple-500/20 text-[#00D1C1] border border-[#00D1C1]/40 flex items-center gap-1">
                <Sparkles size={11} className="text-[#00D1C1]" />
                Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Tendências de volume, recuperação e ajustes para sua próxima rotina
            </p>
          </div>
        </div>

        {/* Readiness Pill & Refresh Button */}
        <div className="flex items-center gap-2">
          {data && (
            <div 
              className={`px-3 py-1 rounded-full text-xs font-black font-mono-numbers flex items-center gap-1.5 border shadow-sm ${readinessColor.bg} ${readinessColor.text} ${readinessColor.border}`}
              title="Índice de Prontidão baseado na frequência e descanso neuromuscular"
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
              <span>{data.readinessScore}% Prontidão</span>
            </div>
          )}

          <button
            type="button"
            id="refresh-strength-coach-btn"
            onClick={() => handleFetchAnalysis(true)}
            disabled={loading}
            className="p-2 rounded-xl bg-[#202026] hover:bg-[#282832] text-neutral-300 hover:text-[#00D1C1] border border-white/10 hover:border-[#00D1C1]/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
            title="Recalcular análise de volume com o Gemini AI"
          >
            <RotateCcw size={14} className={loading ? 'animate-spin text-[#00D1C1]' : ''} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 p-2.5 rounded-xl mb-3">
          {errorMsg}
        </div>
      )}

      {loading && !data ? (
        /* Loading Skeleton */
        <div className="space-y-3 py-4 animate-pulse">
          <div className="h-16 bg-white/5 rounded-2xl w-full" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-12 bg-white/5 rounded-xl" />
            <div className="h-12 bg-white/5 rounded-xl" />
          </div>
          <div className="h-20 bg-white/5 rounded-2xl" />
        </div>
      ) : data ? (
        <div className="space-y-3.5 relative z-10">
          {/* Next Routine Badge & Coach Golden Prescription Quote */}
          <div className="bg-[#0e0e12]/90 border border-[#00D1C1]/20 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] flex-wrap gap-1.5">
              <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
                <Flame size={13} className="text-amber-400" />
                <span>Próximo Treino Avaliado:</span>
                <strong className="text-white">
                  {nextTargetRoutine?.name || 'Rotina Sugerida'}
                </strong>
              </span>
              {nextTargetRoutine?.targetMuscles && nextTargetRoutine.targetMuscles.length > 0 && (
                <span className="text-[10px] font-bold text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20">
                  {nextTargetRoutine.targetMuscles.join(', ')}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed italic border-l-2 border-[#00D1C1] pl-2.5 py-0.5">
              "{data.coachSummary}"
            </p>
          </div>

          {/* 2 Big Stat Badges: Volume Trend & Recovery Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Volume Trend Card */}
            <div className="bg-[#181820] border border-white/5 rounded-2xl p-3 flex items-start gap-2.5">
              <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                data.volumeTrend.direction === 'up'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : data.volumeTrend.direction === 'down'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-[#00D1C1]/15 text-[#00D1C1]'
              }`}>
                {data.volumeTrend.direction === 'up' ? (
                  <TrendingUp size={18} />
                ) : data.volumeTrend.direction === 'down' ? (
                  <TrendingDown size={18} />
                ) : (
                  <Activity size={18} />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider">
                    Tendência de Volume
                  </span>
                  <span className="text-xs font-black font-mono-numbers text-white">
                    {data.volumeTrend.percentageChange >= 0
                      ? `+${data.volumeTrend.percentageChange}%`
                      : `${data.volumeTrend.percentageChange}%`}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 font-medium leading-tight mt-0.5">
                  {data.volumeTrend.description}
                </p>
              </div>
            </div>

            {/* Recovery Level Card */}
            <div className="bg-[#181820] border border-white/5 rounded-2xl p-3 flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 mt-0.5 shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block">
                  Status de Recuperação
                </span>
                <span className="text-xs font-black text-white block truncate">
                  {data.recoveryLabel}
                </span>
                <p className="text-xs text-neutral-300 font-medium leading-tight mt-0.5 line-clamp-2">
                  {data.recoverySummary}
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Volume Adjustments Section Header & Toggle */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} className="text-[#00D1C1]" />
                Ajustes de Volume Sugeridos para a Próxima Rotina ({data.suggestedAdjustments?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFx.playTick();
                  setIsExpanded(!isExpanded);
                }}
                className="text-[11px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>{isExpanded ? 'Recolher' : 'Expandir'}</span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* List of Volume Adjustments */}
            {isExpanded && (
              <div className="space-y-2 animate-in fade-in duration-200">
                {data.suggestedAdjustments && data.suggestedAdjustments.length > 0 ? (
                  data.suggestedAdjustments.map((adj, idx) => {
                    const style = getAdjustmentStyle(adj.type);

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all text-xs space-y-1 ${style.bg} ${style.border}`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-extrabold text-white text-xs sm:text-sm">
                            {adj.target}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg font-mono-numbers uppercase tracking-wider ${style.badgeBg}`}>
                            {adj.adjustmentBadge}
                          </span>
                        </div>

                        <p className="font-bold text-neutral-200 text-xs">
                          {adj.recommendation}
                        </p>

                        <p className="text-[11px] text-neutral-400 italic">
                          💡 <span className="font-semibold text-neutral-300">Justificativa:</span> {adj.rationale}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-neutral-400 italic py-2">
                    Mantenha a programação padrão. Todos os grupos musculares estão equilibrados.
                  </p>
                )}

                {/* Pro Tips Bullets */}
                {data.proTips && data.proTips.length > 0 && (
                  <div className="mt-2.5 p-3 bg-black/40 rounded-2xl border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-[#00D1C1] tracking-wider block">
                      Diretrizes do Strength Coach:
                    </span>
                    {data.proTips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-neutral-300">
                        <CheckCircle2 size={13} className="text-[#00D1C1] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Start with Adjustments Button */}
          {todayRoutine && onStartRoutine && (
            <button
              type="button"
              id="start-workout-with-adjustments-btn"
              onClick={() => {
                soundFx.playTick();
                onStartRoutine(todayRoutine);
              }}
              className="w-full mt-2 py-3 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-[#00D1C1]/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer tracking-wide"
            >
              <Dumbbell size={16} />
              <span>INICIAR {todayRoutine.name.toUpperCase()} COM AJUSTES RECOMENDADOS</span>
              <ArrowRight size={15} />
            </button>
          )}

          {lastUpdated && (
            <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
              <span>Análise gerada via Gemini 3.8 Flash</span>
              <span className="font-mono-numbers">Atualizado às {lastUpdated}</span>
            </div>
          )}
        </div>
      ) : (
        /* Empty / initial state when no workouts in history yet */
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 text-center text-xs text-neutral-400 space-y-2">
          <p className="text-neutral-300 font-semibold">
            Inicie seus primeiros treinos para ativar a análise do Strength Coach!
          </p>
          <p className="text-neutral-500 text-[11px]">
            Conforme você registra seus treinos e cargas, o Gemini analisa sua curva de volume, fadiga neuromuscular e sugere progressões automáticas.
          </p>
        </div>
      )}
    </div>
  );
};
