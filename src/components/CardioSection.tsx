import React, { useState, useEffect, useRef } from 'react';
import {
  Bike,
  Play,
  Pause,
  RotateCcw,
  Flame,
  Zap,
  Timer,
  CheckCircle2,
  ChevronRight,
  Maximize2,
  Minimize2,
  Plus,
  Activity,
  Info,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Award,
  FastForward,
  Heart,
  Sliders,
  Calendar,
  X,
  Download,
  ShieldCheck,
  FileSpreadsheet,
  Pencil
} from 'lucide-react';
import { CardioSession, CompletedWorkout, Routine, Exercise } from '../types';
import { soundFx } from '../utils/audio';
import { vibration } from '../utils/vibrationWrapper';
import { requestScreenWakeLock, releaseScreenWakeLock } from '../utils/backgroundTimer';
import { formatTimerDigits } from '../utils/calc';
import { downloadFile, exportWorkoutHistoryToCSV } from '../utils/routineTransfer';
import { EditCardioModal } from './EditCardioModal';
import confetti from 'canvas-confetti';

interface CardioSectionProps {
  onSessionLogged?: (session: CardioSession) => void;
  history?: CompletedWorkout[];
  routines?: Routine[];
  exercises?: Exercise[];
  cardioSessions?: CardioSession[];
  onUpdateCardioSession?: (session: CardioSession) => void;
  onDeleteCardioSession?: (id: string) => void;
  onAddCardioSession?: (session: CardioSession) => void;
}

type CardioTab = 'warmup' | 'moderate' | 'hiit' | 'tips' | 'history';
type HiitPhase = 'idle' | 'prep' | 'work' | 'rest' | 'finished';

interface HiitPreset {
  id: string;
  name: string;
  badge: string;
  workSec: number;
  restSec: number;
  rounds: number;
  description: string;
  targetRpm: string;
}

const HIIT_PRESETS: HiitPreset[] = [
  {
    id: 'tabata',
    name: 'Tabata Spinning Explosivo',
    badge: '4 min · 8 Rounds',
    workSec: 20,
    restSec: 10,
    rounds: 8,
    description: '20s tiro em potência máxima (>105 RPM) por 10s giro bem leve. Aquece o metabolismo por horas.',
    targetRpm: 'Tiro >100 RPM / Descanso 60 RPM'
  },
  {
    id: 'hiit15',
    name: 'HIIT Potência 15 Min',
    badge: '15 min · 15 Rounds',
    workSec: 30,
    restSec: 30,
    rounds: 15,
    description: '30s de carga média-alta com aceleração forte intercalados com 30s de pedalada de alívio na bike spinning.',
    targetRpm: 'Tiro 90-100 RPM / Descanso 65 RPM'
  },
  {
    id: 'burn20',
    name: 'Queima Ácida 20 Min',
    badge: '20 min · 10 Rounds',
    workSec: 45,
    restSec: 75,
    rounds: 10,
    description: 'Tiros mais longos com tempo suficiente de recuperação ativa. Excelente para capacidade aeróbica e anaeróbica.',
    targetRpm: 'Tiro 85-95 RPM / Descanso 60 RPM'
  }
];

const MODERATE_PRESET_MINUTES = [5, 15, 20, 30, 45, 60];

const STORAGE_KEY = 'thunder_cardio_sessions_v1';

export const CardioSection: React.FC<CardioSectionProps> = ({
  onSessionLogged,
  history = [],
  routines = [],
  exercises = [],
  cardioSessions: propCardioSessions,
  onUpdateCardioSession,
  onDeleteCardioSession,
  onAddCardioSession
}) => {
  const [activeTab, setActiveTab] = useState<CardioTab>('moderate');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [exportToastMsg, setExportToastMsg] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<CardioSession | null>(null);

  // Modal de animação e confirmação de exercício salvo
  const [savedConfirmation, setSavedConfirmation] = useState<{
    id: string;
    type: 'warmup' | 'moderate' | 'hiit';
    title: string;
    badge: string;
    durationText: string;
    calories: number;
    distanceKm?: number;
    cadenceRpm?: number;
    resistanceLevel?: string;
    notes?: string;
  } | null>(null);

  const [cardioHistory, setCardioHistory] = useState<CardioSession[]>(() => {
    if (propCardioSessions && propCardioSessions.length > 0) return propCardioSessions;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Keep in sync with parent props if provided
  useEffect(() => {
    if (propCardioSessions) {
      setCardioHistory(propCardioSessions);
    }
  }, [propCardioSessions]);

  // Save history on changes
  const saveSessions = (sessions: CardioSession[]) => {
    setCardioHistory(sessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore
    }
  };

  const handleStartEditSession = (session: CardioSession) => {
    soundFx.playTick();
    setEditingSession(session);
  };

  const handleSaveEditedSession = (updatedSession: CardioSession) => {
    const updated = cardioHistory.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    saveSessions(updated);
    if (onUpdateCardioSession) {
      onUpdateCardioSession(updatedSession);
    }
    setEditingSession(null);
    setExportToastMsg('Sessão de cardio atualizada com sucesso!');
    setTimeout(() => setExportToastMsg(null), 4000);
  };

  // Dispara animação visual, confetes, sons e modal de confirmação de cardio salvo
  const triggerSavedConfirmation = (session: CardioSession) => {
    if (soundEnabled) soundFx.playCelebration();
    vibration.trigger([150, 70, 250, 70, 400]);
    try {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#00D1C1', '#00FFE0', '#10B981', '#F59E0B', '#FFFFFF']
      });
    } catch {
      // Fallback
    }

    const isWarmup = session.type === 'warmup';
    const isHiit = session.type === 'hiit';

    const title = isWarmup
      ? 'Aquecimento Salvo com Sucesso!'
      : isHiit
      ? 'Treino HIIT Salvo com Sucesso!'
      : 'Cardio Moderado Salvo com Sucesso!';

    const badge = isWarmup
      ? 'Bicicleta Spinning · Aquecimento 5 min'
      : isHiit
      ? `Bicicleta Spinning · HIIT (${session.hiitRounds || 8} Rounds)`
      : 'Bicicleta Spinning · Moderado (LISS)';

    const mins = Math.floor(session.durationSeconds / 60);
    const secs = session.durationSeconds % 60;
    const durationText = mins > 0 ? (secs > 0 ? `${mins}m ${secs}s` : `${mins} min`) : `${secs}s`;

    setSavedConfirmation({
      id: session.id,
      type: session.type,
      title,
      badge,
      durationText,
      calories: session.estimatedCalories,
      distanceKm: session.estimatedDistanceKm,
      cadenceRpm: session.cadenceRpm,
      resistanceLevel: session.resistanceLevel,
      notes: session.notes
    });
  };

  // ----------------------------------------------------
  // AQUECIMENTO STATE (Opção de 5 Minutos na Bicicleta Spinning)
  // ----------------------------------------------------
  const [warmupMinutes, setWarmupMinutes] = useState<number>(5); // default: 5 min
  const [warmupSecondsElapsed, setWarmupSecondsElapsed] = useState(0);
  const [warmupIsRunning, setWarmupIsRunning] = useState(false);
  const [warmupShowCelebration, setWarmupShowCelebration] = useState(false);
  const warmupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const warmupTargetSeconds = warmupMinutes * 60; // 300 seconds for 5 min
  const warmupEstimatedKcal = Math.round(warmupSecondsElapsed * 0.12); // ~7.2 kcal/min no aquecimento
  const warmupEstimatedDistKm = parseFloat(((warmupSecondsElapsed / 3600) * 22).toFixed(2));

  // Warm-up Timer Loop
  useEffect(() => {
    if (warmupIsRunning) {
      requestScreenWakeLock();
      warmupTimerRef.current = setInterval(() => {
        setWarmupSecondsElapsed((prev) => {
          const next = prev + 1;
          if (warmupTargetSeconds > 0 && next >= warmupTargetSeconds) {
            handleCompleteWarmup(next);
            return next;
          }
          if (next % 60 === 0 && soundEnabled) {
            soundFx.playTick();
          }
          return next;
        });
      }, 1000);
    } else {
      if (warmupTimerRef.current) clearInterval(warmupTimerRef.current);
      if (!modIsRunning && !hiitIsRunning) {
        releaseScreenWakeLock();
      }
    }

    return () => {
      if (warmupTimerRef.current) clearInterval(warmupTimerRef.current);
    };
  }, [warmupIsRunning, warmupTargetSeconds, soundEnabled]);

  const toggleWarmupTimer = () => {
    if (soundEnabled) soundFx.playTick();
    setWarmupIsRunning((prev) => !prev);
  };

  const resetWarmupTimer = () => {
    if (soundEnabled) soundFx.playTick();
    setWarmupIsRunning(false);
    setWarmupSecondsElapsed(0);
    setWarmupShowCelebration(false);
  };

  const handleCompleteWarmup = (finalSeconds?: number) => {
    setWarmupIsRunning(false);
    // Permite salvar imediatamente mesmo sem iniciar o cronômetro (grava os 5 min de aquecimento)
    const totalSecs = finalSeconds !== undefined
      ? finalSeconds
      : warmupSecondsElapsed > 0
      ? warmupSecondsElapsed
      : warmupMinutes * 60;

    setWarmupShowCelebration(true);

    const newSession: CardioSession = {
      id: 'warmup_' + Date.now(),
      type: 'warmup',
      modality: 'Bicicleta Spinning',
      durationSeconds: totalSecs,
      completedAt: new Date().toISOString(),
      estimatedCalories: Math.max(15, Math.round(totalSecs * 0.12)),
      estimatedDistanceKm: parseFloat(((totalSecs / 3600) * 22).toFixed(2)),
      cadenceRpm: 75,
      resistanceLevel: 'Leve (Nível 2-3)',
      targetMinutes: warmupMinutes,
      notes: `Aquecimento de ${Math.round(totalSecs / 60) || warmupMinutes} min na Bicicleta Spinning concluído pré-treino.`
    };

    const updated = [newSession, ...cardioHistory];
    saveSessions(updated);
    if (onSessionLogged) onSessionLogged(newSession);
    if (onAddCardioSession) onAddCardioSession(newSession);
    triggerSavedConfirmation(newSession);
  };

  // ----------------------------------------------------
  // TREINO MODERADO STATE (LISS / Contínuo)
  // ----------------------------------------------------
  const [modSelectedMinutes, setModSelectedMinutes] = useState<number | null>(30); // null = livre
  const [modSecondsElapsed, setModSecondsElapsed] = useState(0);
  const [modIsRunning, setModIsRunning] = useState(false);
  const [modShowCelebration, setModShowCelebration] = useState(false);
  const modTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Moderate calculations
  const modTargetSeconds = modSelectedMinutes ? modSelectedMinutes * 60 : 0;
  const modEstimatedKcal = Math.round(modSecondsElapsed * 0.13); // ~7.8 kcal/min na bike moderada
  const modEstimatedDistKm = parseFloat(((modSecondsElapsed / 3600) * 23.5).toFixed(2)); // ~23.5 km/h

  // Moderate Timer Effect
  useEffect(() => {
    if (modIsRunning) {
      requestScreenWakeLock();
      modTimerRef.current = setInterval(() => {
        setModSecondsElapsed((prev) => {
          const next = prev + 1;
          // Check milestone or finish if preset exists
          if (modTargetSeconds > 0 && next >= modTargetSeconds) {
            handleCompleteModerate(next);
            return next;
          }
          // Soft tick every 5 mins
          if (next % 300 === 0 && soundEnabled) {
            soundFx.playTick();
          }
          return next;
        });
      }, 1000);
    } else {
      if (modTimerRef.current) clearInterval(modTimerRef.current);
      if (!warmupIsRunning && !hiitIsRunning) {
        releaseScreenWakeLock();
      }
    }

    return () => {
      if (modTimerRef.current) clearInterval(modTimerRef.current);
    };
  }, [modIsRunning, modTargetSeconds, soundEnabled]);

  const toggleModerateTimer = () => {
    if (soundEnabled) soundFx.playTick();
    setModIsRunning((prev) => !prev);
  };

  const resetModerateTimer = () => {
    if (soundEnabled) soundFx.playTick();
    setModIsRunning(false);
    setModSecondsElapsed(0);
    setModShowCelebration(false);
  };

  const handleCompleteModerate = (finalSeconds?: number) => {
    setModIsRunning(false);
    const defaultMins = modSelectedMinutes || 30;
    const totalSecs = finalSeconds !== undefined
      ? finalSeconds
      : modSecondsElapsed > 0
      ? modSecondsElapsed
      : defaultMins * 60;

    setModShowCelebration(true);

    const isFiveMinWarmup = totalSecs <= 360 && (modSelectedMinutes === 5 || totalSecs <= 300);

    const newSession: CardioSession = {
      id: 'cardio_' + Date.now(),
      type: isFiveMinWarmup ? 'warmup' : 'moderate',
      modality: 'Bicicleta Spinning',
      durationSeconds: totalSecs,
      completedAt: new Date().toISOString(),
      estimatedCalories: Math.max(20, Math.round(totalSecs * 0.13)),
      estimatedDistanceKm: parseFloat(((totalSecs / 3600) * 23.5).toFixed(2)),
      cadenceRpm: 80,
      resistanceLevel: 'Moderada (Nível 4-6)',
      targetMinutes: modSelectedMinutes || undefined,
      notes: isFiveMinWarmup
        ? 'Aquecimento de 5 min na Bicicleta Spinning concluído pré-treino.'
        : 'Pedalada contínua na Bicicleta Spinning em ritmo moderado aeróbico (Zona 2).'
    };

    const updated = [newSession, ...cardioHistory];
    saveSessions(updated);
    if (onSessionLogged) onSessionLogged(newSession);
    if (onAddCardioSession) onAddCardioSession(newSession);
    triggerSavedConfirmation(newSession);
  };

  // ----------------------------------------------------
  // TREINO HIIT STATE (Intervalado com Cronômetro)
  // ----------------------------------------------------
  const [selectedHiitPreset, setSelectedHiitPreset] = useState<string>('tabata');
  const [customWorkSec, setCustomWorkSec] = useState(30);
  const [customRestSec, setCustomRestSec] = useState(30);
  const [customRounds, setCustomRounds] = useState(10);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Active HIIT Execution State
  const [hiitPhase, setHiitPhase] = useState<HiitPhase>('idle');
  const [hiitIsRunning, setHiitIsRunning] = useState(false);
  const [hiitCurrentRound, setHiitCurrentRound] = useState(1);
  const [hiitPhaseSecondsLeft, setHiitPhaseSecondsLeft] = useState(0);
  const [hiitTotalSecondsElapsed, setHiitTotalSecondsElapsed] = useState(0);
  const [isHiitFullscreen, setIsHiitFullscreen] = useState(false);

  const hiitIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Current config values
  const currentPreset = HIIT_PRESETS.find((p) => p.id === selectedHiitPreset) || HIIT_PRESETS[0];
  const activeWorkSec = isCustomMode ? customWorkSec : currentPreset.workSec;
  const activeRestSec = isCustomMode ? customRestSec : currentPreset.restSec;
  const activeTotalRounds = isCustomMode ? customRounds : currentPreset.rounds;

  // Estimated HIIT totals
  const totalHiitDurationSeconds = (activeWorkSec + activeRestSec) * activeTotalRounds;

  // Start HIIT session
  const startHiit = () => {
    if (soundEnabled) soundFx.playTick();
    requestScreenWakeLock();
    setHiitCurrentRound(1);
    setHiitTotalSecondsElapsed(0);
    setHiitPhase('prep');
    setHiitPhaseSecondsLeft(3); // 3 seconds count-in
    setHiitIsRunning(true);
  };

  const toggleHiitPause = () => {
    if (soundEnabled) soundFx.playTick();
    setHiitIsRunning((prev) => !prev);
  };

  const resetHiit = () => {
    if (soundEnabled) soundFx.playTick();
    setHiitIsRunning(false);
    setHiitPhase('idle');
    setHiitCurrentRound(1);
    setHiitPhaseSecondsLeft(0);
    setHiitTotalSecondsElapsed(0);
    if (!modIsRunning && !warmupIsRunning) releaseScreenWakeLock();
  };

  const skipHiitPhase = () => {
    if (soundEnabled) soundFx.playTick();
    advanceHiitPhase();
  };

  // Logic to advance HIIT phase
  const advanceHiitPhase = () => {
    if (hiitPhase === 'prep') {
      // Transition from prep to first WORK sprint
      setHiitPhase('work');
      setHiitPhaseSecondsLeft(activeWorkSec);
      if (soundEnabled) soundFx.playTimerComplete();
      vibration.trigger([400, 100, 400]);
    } else if (hiitPhase === 'work') {
      // Work finished -> go to Rest or Finish if last round
      if (hiitCurrentRound >= activeTotalRounds) {
        finishHiit();
      } else {
        setHiitPhase('rest');
        setHiitPhaseSecondsLeft(activeRestSec);
        if (soundEnabled) soundFx.playTimerComplete();
        vibration.trigger([200, 100, 200]);
      }
    } else if (hiitPhase === 'rest') {
      // Rest finished -> go to next Work sprint
      setHiitCurrentRound((prev) => prev + 1);
      setHiitPhase('work');
      setHiitPhaseSecondsLeft(activeWorkSec);
      if (soundEnabled) soundFx.playTimerComplete();
      vibration.trigger([400, 100, 400]);
    }
  };

  const finishHiit = (overrideSeconds?: number) => {
    setHiitPhase('finished');
    setHiitIsRunning(false);

    const totalSecs = overrideSeconds !== undefined
      ? overrideSeconds
      : hiitTotalSecondsElapsed > 0
      ? hiitTotalSecondsElapsed
      : totalHiitDurationSeconds;

    const newSession: CardioSession = {
      id: 'hiit_' + Date.now(),
      type: 'hiit',
      modality: 'Bicicleta Spinning',
      durationSeconds: totalSecs,
      completedAt: new Date().toISOString(),
      estimatedCalories: Math.max(25, Math.round(totalSecs * 0.19)),
      hiitRounds: activeTotalRounds,
      workSeconds: activeWorkSec,
      restSeconds: activeRestSec,
      cadenceRpm: 95,
      resistanceLevel: 'Intensa (Tiro >100 RPM / Giro 65 RPM)',
      notes: `HIIT na Bicicleta Spinning (${activeTotalRounds} rounds · ${activeWorkSec}s tiro / ${activeRestSec}s descanso)`
    };

    const updated = [newSession, ...cardioHistory];
    saveSessions(updated);
    if (onSessionLogged) onSessionLogged(newSession);
    if (onAddCardioSession) onAddCardioSession(newSession);
    triggerSavedConfirmation(newSession);
  };

  // HIIT Clock Loop
  useEffect(() => {
    if (hiitIsRunning && hiitPhase !== 'idle' && hiitPhase !== 'finished') {
      requestScreenWakeLock();
      hiitIntervalRef.current = setInterval(() => {
        setHiitTotalSecondsElapsed((prev) => prev + 1);
        setHiitPhaseSecondsLeft((prev) => {
          if (prev <= 1) {
            advanceHiitPhase();
            return 0;
          }
          // Sound tick on last 3, 2, 1 seconds
          if (prev <= 4 && prev > 1 && soundEnabled) {
            soundFx.playTick();
            vibration.trigger(60);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (hiitIntervalRef.current) clearInterval(hiitIntervalRef.current);
      if (!modIsRunning && !warmupIsRunning) releaseScreenWakeLock();
    }

    return () => {
      if (hiitIntervalRef.current) clearInterval(hiitIntervalRef.current);
    };
  }, [hiitIsRunning, hiitPhase, activeWorkSec, activeRestSec, activeTotalRounds, soundEnabled, hiitCurrentRound]);

  // Export history handler directly from Cardio section
  const handleExportAllHistoryWithCardio = () => {
    soundFx.playTick();
    const csv = exportWorkoutHistoryToCSV(history, routines, exercises, cardioHistory);
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `historico_treinos_thunder_${today}.csv`, 'text/csv;charset=utf-8;');
    soundFx.playCelebration();

    setExportToastMsg(
      `Histórico baixado com sucesso! Salvos ${cardioHistory.length} treinos de cardio/spinning + ${history.length} sessões de musculação.`
    );
    setTimeout(() => {
      setExportToastMsg(null);
    }, 4500);
  };

  // Delete session handler
  const handleDeleteSession = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = cardioHistory.filter((s) => s.id !== id);
    saveSessions(updated);
    if (onDeleteCardioSession) {
      onDeleteCardioSession(id);
    }
    if (soundEnabled) soundFx.playTick();
  };

  // Weekly Stats calculation
  const totalMinutesAllTime = Math.round(
    cardioHistory.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );
  const totalKcalAllTime = cardioHistory.reduce((acc, s) => acc + s.estimatedCalories, 0);

  return (
    <div
      id="cardio-bike-section"
      className="bg-[#161616] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4"
    >
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#00D1C1]/10 border border-[#00D1C1]/20 flex items-center justify-center text-[#00D1C1]">
            <Bike size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                Cardio & Resistência
              </h2>
              <span className="text-[10px] font-black font-mono-numbers px-2 py-0.5 rounded-full bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30">
                Bicicleta Spinning
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Aquecimento articular 5m, queima calórica e condicionamento
            </p>
          </div>
        </div>

        {/* Sound toggle button */}
        <button
          onClick={() => {
            setSoundEnabled((prev) => !prev);
            soundFx.playTick();
          }}
          className={`p-2 rounded-xl border text-xs transition-colors flex items-center gap-1 ${
            soundEnabled
              ? 'bg-[#222222] border-white/10 text-[#00D1C1]'
              : 'bg-[#181818] border-white/5 text-neutral-500'
          }`}
          title={soundEnabled ? 'Sons ativados' : 'Sons desativados'}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
      </div>

      {/* TABS DE MODO DE CARDIO */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0f0f0f] rounded-2xl border border-white/5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            setActiveTab('warmup');
            soundFx.playTick();
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'warmup'
              ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame size={14} className={activeTab === 'warmup' ? 'text-black' : 'text-amber-400'} />
          <span>Aquecimento (5 min)</span>
          {warmupIsRunning && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('moderate');
            soundFx.playTick();
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'moderate'
              ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/20 font-black'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity size={14} />
          <span>Moderado (LISS)</span>
          {modIsRunning && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('hiit');
            soundFx.playTick();
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'hiit'
              ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/20 font-black'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap size={14} />
          <span>HIIT com Cronômetro</span>
          {hiitIsRunning && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('tips');
            soundFx.playTick();
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'tips'
              ? 'bg-white/10 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Info size={14} />
          <span>Dicas</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            soundFx.playTick();
          }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-white/10 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar size={14} />
          <span>Histórico ({cardioHistory.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 0. ABA: AQUECIMENTO 5 MINUTOS NA BICICLETA SPINNING                         */}
      {/* ========================================================================= */}
      {activeTab === 'warmup' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Preset warm-up duration options (Default 5 min) */}
          <div className="bg-[#111111] p-3 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold flex items-center gap-1.5 text-amber-400">
                <Flame size={14} /> Duração do Aquecimento Pré-Treino
              </span>
              <span className="text-[11px] text-neutral-300 font-mono-numbers">
                Cadência: 70–80 RPM (Giro Leve)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 5, label: '5 min (Recomendado)', desc: 'Ideal pré-musculação' },
                { mins: 3, label: '3 min (Expresso)', desc: 'Dia corrido' },
                { mins: 8, label: '8 min (Estendido)', desc: 'Treino de pernas ou frio' }
              ].map((item) => {
                const isSelected = warmupMinutes === item.mins;
                return (
                  <button
                    key={item.mins}
                    disabled={warmupIsRunning}
                    onClick={() => {
                      setWarmupMinutes(item.mins);
                      setWarmupSecondsElapsed(0);
                      soundFx.playTick();
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md shadow-amber-400/10'
                        : 'bg-[#181818] border-white/5 text-neutral-400 hover:text-white hover:bg-[#222222]'
                    } ${warmupIsRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-xs font-black">{item.label}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warmup Stopwatch Display Cockpit */}
          <div className="bg-gradient-to-b from-[#1c1917] via-[#161616] to-[#0f0f0f] border border-amber-500/30 rounded-3xl p-5 text-center relative overflow-hidden shadow-2xl">
            {/* Background glowing blur */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Bike size={14} /> Aquecimento na Bicicleta Spinning
              </span>
              <span className="font-mono-numbers px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                Meta: {warmupMinutes}:00 min
              </span>
            </div>

            {/* Giant Stopwatch Clock */}
            <div className="py-2">
              <div className="text-6xl sm:text-7xl font-black font-mono-numbers text-amber-400 tracking-tight drop-shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                {formatTimerDigits(Math.max(0, warmupTargetSeconds - warmupSecondsElapsed))}
              </div>
              <p className="text-xs text-neutral-300 mt-1 font-medium">
                {warmupSecondsElapsed >= warmupTargetSeconds
                  ? 'Tempo de aquecimento concluído!'
                  : `Tempo decorrido: ${formatTimerDigits(warmupSecondsElapsed)} · Faltam ${formatTimerDigits(
                      Math.max(0, warmupTargetSeconds - warmupSecondsElapsed)
                    )}`}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden mt-3 mb-4 border border-white/5">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (warmupSecondsElapsed / warmupTargetSeconds) * 100)}%`
                }}
              />
            </div>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
              <div className="p-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold">
                  <Flame size={13} /> Calorias
                </div>
                <div className="text-base font-black font-mono-numbers text-white mt-0.5">
                  ~{warmupEstimatedKcal} <span className="text-[10px] text-neutral-400 font-normal">kcal</span>
                </div>
              </div>

              <div className="p-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-center gap-1 text-[#00D1C1] text-xs font-bold">
                  <Activity size={13} /> Distância
                </div>
                <div className="text-base font-black font-mono-numbers text-white mt-0.5">
                  {warmupEstimatedDistKm} <span className="text-[10px] text-neutral-400 font-normal">km</span>
                </div>
              </div>

              <div className="p-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold">
                  <ShieldCheck size={13} /> Zona Alvo
                </div>
                <div className="text-xs font-extrabold text-white mt-1">
                  Zona 1 <span className="text-[10px] text-neutral-400 font-normal">(Leve)</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={resetWarmupTimer}
                disabled={warmupSecondsElapsed === 0 && !warmupIsRunning}
                className="p-3 rounded-2xl bg-[#222222] hover:bg-[#2a2a2a] text-neutral-400 hover:text-white border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Reiniciar aquecimento"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={toggleWarmupTimer}
                className={`flex-1 max-w-[240px] py-3.5 px-5 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                  warmupIsRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20'
                }`}
              >
                {warmupIsRunning ? (
                  <>
                    <Pause size={18} className="fill-black" />
                    <span>Pausar Aquecimento</span>
                  </>
                ) : (
                  <>
                    <Play size={18} className="fill-black" />
                    <span>{warmupSecondsElapsed > 0 ? 'Continuar' : `Iniciar Aquecimento (${warmupMinutes}m)`}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCompleteWarmup()}
                className="py-3 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                title="Concluir e Salvar Aquecimento na Bicicleta Spinning"
              >
                <CheckCircle2 size={16} />
                <span>Salvar Aquecimento</span>
              </button>
            </div>
          </div>

          {/* Celebration banner */}
          {warmupShowCelebration && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <Award size={20} className="text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white">Aquecimento finalizado com sucesso!</div>
                  <div className="text-[11px] text-neutral-300">
                    Articulações e temperatura prontas para bater recordes na musculação.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setWarmupShowCelebration(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Benefits Card */}
          <div className="bg-[#111111] p-3.5 rounded-2xl border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles size={13} /> Por que 5 minutos na Bicicleta Spinning antes do treino?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-1">
              <div className="bg-[#161616] p-2.5 rounded-xl border border-white/5">
                <span className="font-bold text-neutral-200">Lubrificação Articular:</span> Estimula a produção de líquido sinovial nos joelhos e quadris sem sobrecarregar tendões.
              </div>
              <div className="bg-[#161616] p-2.5 rounded-xl border border-white/5">
                <span className="font-bold text-neutral-200">Preserva o Glicogênio:</span> Mantém a frequência cardíaca baixa (Zona 1), poupando energia máxima para levantar cargas pesadas.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ABA: TREINO MODERADO (LISS / RITMO CONTÍNUO)                            */}
      {/* ========================================================================= */}
      {activeTab === 'moderate' && (
        <div className="space-y-4">
          {/* Target presets */}
          <div className="bg-[#111111] p-3 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Timer size={13} className="text-[#00D1C1]" /> Meta de Duração (Bicicleta Spinning)
              </span>
              <span className="text-[11px] text-neutral-400">Cadência Alvo: 75–85 RPM</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {MODERATE_PRESET_MINUTES.map((mins) => {
                const isSelected = modSelectedMinutes === mins;
                return (
                  <button
                    key={mins}
                    disabled={modIsRunning}
                    onClick={() => {
                      setModSelectedMinutes(mins);
                      soundFx.playTick();
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      isSelected
                        ? mins === 5
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-[#00D1C1]/20 border-[#00D1C1] text-[#00D1C1]'
                        : 'bg-[#181818] border-white/5 text-neutral-400 hover:text-white hover:bg-[#222222]'
                    } ${modIsRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {mins === 5 ? '5m🔥' : `${mins}m`}
                  </button>
                );
              })}
              <button
                disabled={modIsRunning}
                onClick={() => {
                  setModSelectedMinutes(null);
                  soundFx.playTick();
                }}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  modSelectedMinutes === null
                    ? 'bg-[#00D1C1]/20 border-[#00D1C1] text-[#00D1C1]'
                    : 'bg-[#181818] border-white/5 text-neutral-400 hover:text-white hover:bg-[#222222]'
                } ${modIsRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Livre
              </button>
            </div>
          </div>

          {/* Moderate Stopwatch Display */}
          <div className="bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-white/10 rounded-3xl p-5 text-center relative overflow-hidden">
            {/* Background glowing blur */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#00D1C1]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1 text-[#00D1C1] font-bold">
                <Bike size={14} /> Pedalada Contínua na Bike Spinning
              </span>
              <span className="font-mono-numbers">
                {modSelectedMinutes ? `Meta: ${modSelectedMinutes}:00 min` : 'Modo Livre'}
              </span>
            </div>

            {/* Giant Stopwatch Clock */}
            <div className="py-2">
              <div className="text-5xl sm:text-6xl font-black font-mono-numbers text-white tracking-tight">
                {formatTimerDigits(modSecondsElapsed)}
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-medium">
                {modTargetSeconds > 0
                  ? `Restante: ${formatTimerDigits(Math.max(0, modTargetSeconds - modSecondsElapsed))}`
                  : 'Tempo decorrido'}
              </p>
            </div>

            {/* Progress bar if preset */}
            {modTargetSeconds > 0 && (
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-3 mb-4">
                <div
                  className="bg-gradient-to-r from-[#00D1C1] to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (modSecondsElapsed / modTargetSeconds) * 100)}%`
                  }}
                />
              </div>
            )}

            {/* Live Metrics Row */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
              <div className="p-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold">
                  <Flame size={13} /> Calorias
                </div>
                <div className="text-base font-black font-mono-numbers text-white mt-0.5">
                  ~{modEstimatedKcal} <span className="text-[10px] text-neutral-400 font-normal">kcal</span>
                </div>
              </div>

              <div className="p-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-center gap-1 text-[#00D1C1] text-xs font-bold">
                  <Activity size={13} /> Distância
                </div>
                <div className="text-base font-black font-mono-numbers text-white mt-0.5">
                  {modEstimatedDistKm} <span className="text-[10px] text-neutral-400 font-normal">km</span>
                </div>
              </div>

              <div className="p-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold">
                  <Heart size={13} /> Zona Alvo
                </div>
                <div className="text-xs font-extrabold text-white mt-1">
                  Zona 2 <span className="text-[10px] text-neutral-400 font-normal">(65%)</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                onClick={resetModerateTimer}
                disabled={modSecondsElapsed === 0 && !modIsRunning}
                className="p-3 rounded-2xl bg-[#222222] hover:bg-[#2a2a2a] text-neutral-400 hover:text-white border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Reiniciar cronômetro"
              >
                <RotateCcw size={18} />
              </button>

              <button
                onClick={toggleModerateTimer}
                className={`flex-1 max-w-[220px] py-3 px-5 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                  modIsRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                    : 'bg-[#00D1C1] hover:bg-[#00b8a9] text-black shadow-[#00D1C1]/20'
                }`}
              >
                {modIsRunning ? (
                  <>
                    <Pause size={18} className="fill-black" />
                    <span>Pausar Pedalada</span>
                  </>
                ) : (
                  <>
                    <Play size={18} className="fill-black" />
                    <span>{modSecondsElapsed > 0 ? 'Continuar' : 'Iniciar Pedalada'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCompleteModerate()}
                className="py-3 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                title="Finalizar e Salvar Treino Moderado"
              >
                <CheckCircle2 size={16} />
                <span>Salvar Cardio</span>
              </button>
            </div>
          </div>

          {/* Celebration banner */}
          {modShowCelebration && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <Award size={20} className="text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white">Excelente pedalada! Sessão registrada.</div>
                  <div className="text-[11px] text-neutral-300">
                    {formatTimerDigits(modSecondsElapsed)} pedalados · ~{modEstimatedKcal} kcal queimadas.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModShowCelebration(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Quick Technical Guidelines for Moderate Bike */}
          <div className="bg-[#111111] p-3.5 rounded-2xl border border-white/5 space-y-1.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#00D1C1]" /> Parâmetros Ideais na Bike Spinning
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-1">
              <div className="bg-[#161616] p-2 rounded-xl border border-white/5">
                <span className="font-bold text-neutral-200">Cadência:</span> Mantenha 75 a 85 RPM para proteger os joelhos com fluidez no pedal.
              </div>
              <div className="bg-[#161616] p-2 rounded-xl border border-white/5">
                <span className="font-bold text-neutral-200">Intensidade:</span> Carga 4 a 6. Você deve conseguir falar frases completas (Zona 2).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ABA: TREINO HIIT COM CRONÔMETRO ESPECIAL                                */}
      {/* ========================================================================= */}
      {activeTab === 'hiit' && (
        <div className="space-y-4">
          {/* HIIT Preset Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Zap size={13} className="text-amber-400" /> Presets de HIIT para Bicicleta Spinning
              </span>
              <button
                onClick={() => {
                  setIsCustomMode((prev) => !prev);
                  soundFx.playTick();
                }}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                  isCustomMode
                    ? 'bg-[#00D1C1]/20 border-[#00D1C1] text-[#00D1C1]'
                    : 'bg-[#181818] border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                {isCustomMode ? 'Usar Presets' : 'Personalizar'}
              </button>
            </div>

            {!isCustomMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {HIIT_PRESETS.map((preset) => {
                  const isSelected = selectedHiitPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      disabled={hiitIsRunning}
                      onClick={() => {
                        setSelectedHiitPreset(preset.id);
                        soundFx.playTick();
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#00D1C1]/10 border-[#00D1C1] shadow-lg shadow-[#00D1C1]/10'
                          : 'bg-[#111111] border-white/5 hover:border-white/15'
                      } ${hiitIsRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-white">{preset.name}</span>
                        <span className="text-[10px] font-bold text-[#00D1C1] font-mono-numbers">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                        {preset.description}
                      </p>
                      <div className="text-[10px] font-bold text-amber-400 mt-2 flex items-center gap-1">
                        🎯 {preset.targetRpm}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Custom HIIT settings */
              <div className="bg-[#111111] p-3.5 rounded-2xl border border-white/10 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-rose-400 block mb-1">
                      🔥 Tiro (Segundos)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={180}
                      step={5}
                      value={customWorkSec}
                      disabled={hiitIsRunning}
                      onChange={(e) => setCustomWorkSec(Math.max(10, parseInt(e.target.value) || 10))}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-2.5 py-1.5 text-sm font-mono-numbers text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#00D1C1] block mb-1">
                      💨 Descanso (Segundos)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={300}
                      step={5}
                      value={customRestSec}
                      disabled={hiitIsRunning}
                      onChange={(e) => setCustomRestSec(Math.max(10, parseInt(e.target.value) || 10))}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-2.5 py-1.5 text-sm font-mono-numbers text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-400 block mb-1">
                      🔁 Nº de Rounds
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={customRounds}
                      disabled={hiitIsRunning}
                      onChange={(e) => setCustomRounds(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-2.5 py-1.5 text-sm font-mono-numbers text-white font-bold"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>Duração Total Estimada: {formatTimerDigits((customWorkSec + customRestSec) * customRounds)}</span>
                  <span>Ajustado para Bicicleta Spinning</span>
                </div>
              </div>
            )}
          </div>

          {/* HIIT DIGITAL TIMER COCKPIT */}
          <div
            className={`border rounded-3xl p-5 text-center relative overflow-hidden transition-all duration-300 ${
              hiitPhase === 'work'
                ? 'bg-gradient-to-b from-rose-950/40 via-[#181818] to-[#0f0f0f] border-rose-500/50 shadow-2xl shadow-rose-950/30'
                : hiitPhase === 'rest'
                ? 'bg-gradient-to-b from-teal-950/40 via-[#181818] to-[#0f0f0f] border-[#00D1C1]/50 shadow-2xl shadow-[#00D1C1]/20'
                : hiitPhase === 'prep'
                ? 'bg-gradient-to-b from-amber-950/40 via-[#181818] to-[#0f0f0f] border-amber-500/50 shadow-2xl shadow-amber-950/30'
                : 'bg-gradient-to-b from-[#181818] to-[#0f0f0f] border-white/10'
            }`}
          >
            {/* Top header with round counter & expand button */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono-numbers font-black px-2.5 py-1 rounded-xl bg-white/10 text-white border border-white/10">
                Round {hiitCurrentRound} de {activeTotalRounds}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono-numbers">
                  Total: {formatTimerDigits(hiitTotalSecondsElapsed)} / {formatTimerDigits(totalHiitDurationSeconds)}
                </span>
                <button
                  onClick={() => setIsHiitFullscreen(true)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg border border-white/5 transition-colors"
                  title="Modo Tela Cheia para Bike Spinning"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* Dynamic Phase Badge */}
            <div className="py-1">
              {hiitPhase === 'idle' && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <Timer size={13} className="text-[#00D1C1]" /> Pronto para Iniciar no Pedal
                </div>
              )}
              {hiitPhase === 'prep' && (
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300 bg-amber-500/20 px-3.5 py-1 rounded-full border border-amber-500/40 animate-pulse">
                  ⚡ PREPARE-SE PARA O TIRO!
                </div>
              )}
              {hiitPhase === 'work' && (
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-rose-300 bg-rose-500/25 px-4 py-1.5 rounded-full border border-rose-500/50 animate-bounce">
                  🔥 TIRO MÁXIMO! PEDALE FORTE (&gt;100 RPM)
                </div>
              )}
              {hiitPhase === 'rest' && (
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#00D1C1] bg-[#00D1C1]/20 px-4 py-1.5 rounded-full border border-[#00D1C1]/40">
                  💨 RECUPERAÇÃO ATIVA! GIRO SOLTO (60 RPM)
                </div>
              )}
              {hiitPhase === 'finished' && (
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/20 px-4 py-1.5 rounded-full border border-emerald-500/40">
                  🎉 PARABÉNS! HIIT CONCLUÍDO
                </div>
              )}
            </div>

            {/* Giant Countdown Clock */}
            <div className="py-3">
              <div
                className={`text-6xl sm:text-7xl font-black font-mono-numbers tracking-tight transition-colors duration-200 ${
                  hiitPhase === 'work'
                    ? 'text-rose-400 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    : hiitPhase === 'rest'
                    ? 'text-[#00D1C1] drop-shadow-[0_0_20px_rgba(0,209,193,0.4)]'
                    : hiitPhase === 'prep'
                    ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                    : 'text-white'
                }`}
              >
                {hiitPhase === 'idle'
                  ? formatTimerDigits(activeWorkSec)
                  : formatTimerDigits(hiitPhaseSecondsLeft)}
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-semibold">
                {hiitPhase === 'work'
                  ? `Sprint de ${activeWorkSec}s na bike spinning`
                  : hiitPhase === 'rest'
                  ? `Descanso ativo de ${activeRestSec}s`
                  : hiitPhase === 'prep'
                  ? 'Contagem regressiva inicial'
                  : 'Duração do 1º tiro'}
              </p>
            </div>

            {/* Rounds mini tracker dots */}
            <div className="flex items-center justify-center gap-1.5 max-w-sm mx-auto flex-wrap py-2">
              {Array.from({ length: activeTotalRounds }).map((_, idx) => {
                const roundNum = idx + 1;
                const isCompleted = roundNum < hiitCurrentRound || hiitPhase === 'finished';
                const isCurrent = roundNum === hiitCurrentRound && hiitPhase !== 'idle' && hiitPhase !== 'finished';
                return (
                  <div
                    key={idx}
                    className={`h-2.5 rounded-full transition-all ${
                      isCompleted
                        ? 'w-4 bg-emerald-400'
                        : isCurrent
                        ? 'w-6 bg-[#00D1C1] animate-pulse ring-2 ring-[#00D1C1]/50'
                        : 'w-2 bg-white/20'
                    }`}
                    title={`Round ${roundNum}`}
                  />
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={resetHiit}
                disabled={hiitPhase === 'idle'}
                className="p-3 rounded-2xl bg-[#222222] hover:bg-[#2a2a2a] text-neutral-400 hover:text-white border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Reiniciar HIIT"
              >
                <RotateCcw size={18} />
              </button>

              {hiitPhase === 'idle' ? (
                <button
                  onClick={startHiit}
                  className="flex-1 max-w-[220px] py-3.5 px-5 rounded-2xl font-black text-sm tracking-wide bg-gradient-to-r from-[#00D1C1] to-emerald-400 text-black shadow-lg shadow-[#00D1C1]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={18} className="fill-black" />
                  <span>Iniciar HIIT Spinning</span>
                </button>
              ) : (
                <button
                  onClick={toggleHiitPause}
                  className={`flex-1 max-w-[220px] py-3.5 px-5 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                    hiitIsRunning
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                      : 'bg-[#00D1C1] hover:bg-[#00b8a9] text-black shadow-[#00D1C1]/20'
                  }`}
                >
                  {hiitIsRunning ? (
                    <>
                      <Pause size={18} className="fill-black" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} className="fill-black" />
                      <span>Continuar</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={skipHiitPhase}
                disabled={hiitPhase === 'idle' || hiitPhase === 'finished'}
                className="p-3 rounded-2xl bg-[#222222] hover:bg-[#2a2a2a] text-neutral-400 hover:text-white border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Pular para próxima fase"
              >
                <FastForward size={18} />
              </button>

              <button
                onClick={() => finishHiit()}
                className="py-3 px-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
                title="Finalizar e Salvar Treino HIIT Agora"
              >
                <CheckCircle2 size={16} />
                <span>Salvar HIIT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ABA: GUIA & DICAS TÉCNICAS DE BICICLETA SPINNING                        */}
      {/* ========================================================================= */}
      {activeTab === 'tips' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="bg-[#111111] p-4 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Bike size={16} className="text-[#00D1C1]" />
              Ajuste Perfeito da Bicicleta Spinning
            </h3>

            <div className="space-y-2.5 text-xs text-neutral-300">
              <div className="p-3 bg-[#181818] rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-amber-400">1. Aquecimento de 5 Minutos (Regra de Ouro):</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Faça 5 minutos com cadência leve (70–80 RPM) antes de iniciar qualquer treino de musculação. O giro na bicicleta spinning lubrifica a cartilagem patelar e a fossa acetabular dos quadris com líquido sinovial, prevenindo dores em agachamentos e leg press.
                </p>
              </div>

              <div className="p-3 bg-[#181818] rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-[#00D1C1]">2. Altura do Selim (Banco):</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Em pé ao lado da bike spinning, alinhe o selim com o topo do osso da sua bacia (crista ilíaca). Ao pedalar, no ponto mais baixo do pedal, o joelho deve manter uma leve flexão (~150°), nunca totalmente travado nem hiperflexionado.
                </p>
              </div>

              <div className="p-3 bg-[#181818] rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-amber-400">3. Distância e Altura do Guidão:</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Ajuste a distância para não arredondar excessivamente a coluna lombar. Os cotovelos devem ficar ligeiramente soltos (flexionados), aliviando a tensão nos ombros e trapézio durante a pedalada de spinning.
                </p>
              </div>

              <div className="p-3 bg-[#181818] rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-rose-400">4. Apoio do Pé no Pedal (Firma-pé):</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Apoie a parte anterior do pé (metatarso / bola do pé) exatamente sobre o eixo do pedal e aperte a presilha. Isso permite uma pedalada circular completa (empurrar e puxar), recrutando posteriores e glúteos.
                </p>
              </div>

              <div className="p-3 bg-[#181818] rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-emerald-400">5. Cadência vs. Resistência:</span>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Evite pedalar excessivamente pesado (&lt;55 RPM), pois isso sobrecarrega a patela. Mantenha 75–85 RPM no treino moderado e &gt;95 RPM nos tiros de HIIT para máxima eficiência metabólica.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ABA: HISTÓRICO DE SESSÕES DE CARDIO (COM DOWNLOAD DE CSV)              */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-3 animate-fadeIn">
          {/* Action Bar with Download Button */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
            <span className="text-xs text-neutral-400 font-semibold">
              Registro de pedaladas e aquecimentos
            </span>
            <button
              onClick={handleExportAllHistoryWithCardio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00D1C1]/15 hover:bg-[#00D1C1]/25 text-[#00D1C1] border border-[#00D1C1]/30 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Baixar histórico completo de musculação e cardio em arquivo CSV"
            >
              <Download size={14} />
              <span>Baixar Histórico (CSV com Cardio)</span>
            </button>
          </div>

          {/* Export success banner */}
          {exportToastMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-300 font-bold animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{exportToastMsg}</span>
              </div>
              <button
                onClick={() => setExportToastMsg(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-[#111111] rounded-2xl border border-white/5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Tempo Total Acumulado
              </span>
              <div className="text-lg font-black font-mono-numbers text-white mt-0.5">
                {totalMinutesAllTime} <span className="text-xs font-normal text-neutral-400">minutos</span>
              </div>
            </div>

            <div className="p-3 bg-[#111111] rounded-2xl border border-white/5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Flame size={12} /> Queima Estimada
              </span>
              <div className="text-lg font-black font-mono-numbers text-amber-400 mt-0.5">
                {totalKcalAllTime} <span className="text-xs font-normal text-neutral-400">kcal</span>
              </div>
            </div>
          </div>

          {/* List of sessions */}
          {cardioHistory.length === 0 ? (
            <div className="p-6 text-center bg-[#111111] rounded-2xl border border-white/5 space-y-2">
              <Bike size={28} className="mx-auto text-neutral-600" />
              <p className="text-xs text-neutral-400">
                Nenhuma pedalada gravada ainda. Inicie um aquecimento de 5 minutos, treino moderado ou HIIT acima para registrar seu progresso!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {cardioHistory.map((session) => {
                const dateObj = new Date(session.completedAt);
                const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const isWarmup = session.type === 'warmup';
                const isHiit = session.type === 'hiit';

                return (
                  <div
                    key={session.id}
                    className="p-3 bg-[#111111] hover:bg-[#181818] border border-white/5 rounded-2xl flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isWarmup
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : isHiit
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30'
                        }`}
                      >
                        {isWarmup ? <Flame size={15} /> : isHiit ? <Zap size={15} /> : <Bike size={15} />}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>
                            {isWarmup
                              ? 'Aquecimento Spinning (5 min)'
                              : isHiit
                              ? 'HIIT Bicicleta Spinning'
                              : 'Moderado Bicicleta Spinning'}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono-numbers">
                            · {formatTimerDigits(session.durationSeconds)}
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>{formattedDate}</span>
                          <span>· ~{session.estimatedCalories} kcal</span>
                          {session.estimatedDistanceKm && (
                            <span>· {session.estimatedDistanceKm} km</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditSession(session)}
                        className="px-2 py-1.5 text-neutral-400 hover:text-[#00D1C1] hover:bg-white/5 transition-colors rounded-lg flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        title="Editar os dados desta sessão de cardio"
                      >
                        <Pencil size={12} />
                        <span className="hidden sm:inline">Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors rounded-lg cursor-pointer"
                        title="Excluir registro"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL EXPANSÍVEL TELA CHEIA (PARA USAR NO SUPORTE DA BIKE NA ACADEMIA) */}
      {/* ========================================================================= */}
      {isHiitFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 animate-fadeIn">
          {/* Modal Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00D1C1]/20 border border-[#00D1C1]/40 flex items-center justify-center text-[#00D1C1]">
                <Bike size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">HIIT na Bicicleta Spinning</h3>
                <p className="text-xs text-neutral-400 font-mono-numbers">
                  Round {hiitCurrentRound} de {activeTotalRounds} · Tempo: {formatTimerDigits(hiitTotalSecondsElapsed)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHiitFullscreen(false)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition-colors"
              title="Fechar tela cheia"
            >
              <Minimize2 size={20} />
            </button>
          </div>

          {/* Central Giant Phase & Clock */}
          <div className="text-center space-y-4 my-auto">
            {hiitPhase === 'work' && (
              <div className="inline-block px-6 py-2 rounded-full bg-rose-500 text-black font-black text-sm sm:text-base tracking-wider uppercase animate-bounce shadow-xl shadow-rose-500/30">
                🔥 TIRO MÁXIMO! PEDALE FORTE (&gt;100 RPM)
              </div>
            )}
            {hiitPhase === 'rest' && (
              <div className="inline-block px-6 py-2 rounded-full bg-[#00D1C1] text-black font-black text-sm sm:text-base tracking-wider uppercase shadow-xl shadow-[#00D1C1]/30">
                💨 RECUPERAÇÃO ATIVA! GIRO LEVE (60 RPM)
              </div>
            )}
            {hiitPhase === 'prep' && (
              <div className="inline-block px-6 py-2 rounded-full bg-amber-400 text-black font-black text-sm sm:text-base tracking-wider uppercase animate-pulse">
                ⚡ PREPARE-SE PARA PEDALAR!
              </div>
            )}
            {hiitPhase === 'idle' && (
              <div className="inline-block px-6 py-2 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-wider">
                Pronto para Iniciar
              </div>
            )}

            {/* Giant Digits for Bike View */}
            <div
              className={`text-8xl sm:text-9xl font-black font-mono-numbers tracking-tight ${
                hiitPhase === 'work'
                  ? 'text-rose-400 drop-shadow-[0_0_40px_rgba(244,63,94,0.5)]'
                  : hiitPhase === 'rest'
                  ? 'text-[#00D1C1] drop-shadow-[0_0_40px_rgba(0,209,193,0.5)]'
                  : hiitPhase === 'prep'
                  ? 'text-amber-400 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]'
                  : 'text-white'
              }`}
            >
              {hiitPhase === 'idle'
                ? formatTimerDigits(activeWorkSec)
                : formatTimerDigits(hiitPhaseSecondsLeft)}
            </div>

            <div className="flex items-center justify-center gap-2 max-w-md mx-auto pt-4 flex-wrap">
              {Array.from({ length: activeTotalRounds }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-3 rounded-full transition-all ${
                    idx + 1 < hiitCurrentRound || hiitPhase === 'finished'
                      ? 'w-6 bg-emerald-400'
                      : idx + 1 === hiitCurrentRound && hiitPhase !== 'idle'
                      ? 'w-8 bg-[#00D1C1] animate-pulse ring-4 ring-[#00D1C1]/40'
                      : 'w-3 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Fullscreen Bottom Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={resetHiit}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RotateCcw size={22} />
            </button>

            {hiitPhase === 'idle' ? (
              <button
                onClick={startHiit}
                className="py-4 px-10 rounded-2xl bg-[#00D1C1] text-black font-black text-lg shadow-xl shadow-[#00D1C1]/30 active:scale-95 transition-all flex items-center gap-3"
              >
                <Play size={22} className="fill-black" />
                <span>Começar Pedalada</span>
              </button>
            ) : (
              <button
                onClick={toggleHiitPause}
                className={`py-4 px-10 rounded-2xl font-black text-lg transition-all flex items-center gap-3 active:scale-95 ${
                  hiitIsRunning
                    ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/30'
                    : 'bg-[#00D1C1] text-black shadow-xl shadow-[#00D1C1]/30'
                }`}
              >
                {hiitIsRunning ? (
                  <>
                    <Pause size={22} className="fill-black" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play size={22} className="fill-black" />
                    <span>Continuar</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={skipHiitPhase}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Avançar para próxima fase"
            >
              <FastForward size={22} />
            </button>

            <button
              onClick={() => {
                setIsHiitFullscreen(false);
                finishHiit();
              }}
              className="p-4 rounded-2xl bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/40 transition-colors flex items-center gap-2 font-bold text-sm"
              title="Finalizar e Salvar Treino HIIT"
            >
              <CheckCircle2 size={20} />
              <span className="hidden sm:inline">Salvar</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ANIMAÇÃO E CONFIRMAÇÃO VISUAL DE EXERCÍCIO DE CARDIO SALVO                */}
      {/* ========================================================================= */}
      {savedConfirmation && (
        <div 
          id="cardio-saved-confirmation-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-sm bg-[#151518] border-2 border-[#00D1C1]/60 rounded-3xl p-6 shadow-2xl shadow-[#00D1C1]/25 text-center my-8 animate-in zoom-in-95 duration-200">
            {/* Ambient Glows */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#00D1C1]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setSavedConfirmation(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar confirmação"
            >
              <X size={18} />
            </button>

            {/* Animated Check Trophy/Badge */}
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#00D1C1] to-emerald-400 p-0.5 shadow-xl shadow-[#00D1C1]/40 mb-3 animate-bounce">
              <div className="w-full h-full bg-[#0D0D10] rounded-full flex items-center justify-center text-[#00D1C1]">
                <CheckCircle2 size={34} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Category Pill */}
            <span className="text-[10px] font-black tracking-widest text-[#00D1C1] uppercase bg-[#00D1C1]/10 px-3 py-1 rounded-full border border-[#00D1C1]/30 inline-block">
              EXERCÍCIO DE CARDIO SALVO!
            </span>

            {/* Title & Subtitle */}
            <h3 className="text-xl font-black text-white mt-2 tracking-tight">
              {savedConfirmation.title}
            </h3>
            <p className="text-xs text-neutral-300 mt-1">
              {savedConfirmation.badge}
            </p>

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 my-4 text-left">
              <div className="bg-[#1C1C22] p-2.5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                  <Timer size={11} className="text-[#00D1C1]" /> Duração
                </span>
                <p className="text-sm font-black font-mono-numbers text-white mt-0.5">
                  {savedConfirmation.durationText}
                </p>
              </div>

              <div className="bg-[#1C1C22] p-2.5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                  <Flame size={11} className="text-amber-400" /> Calorias
                </span>
                <p className="text-sm font-black font-mono-numbers text-amber-300 mt-0.5">
                  ~{savedConfirmation.calories} kcal
                </p>
              </div>

              <div className="bg-[#1C1C22] p-2.5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                  <Bike size={11} className="text-indigo-400" /> Distância
                </span>
                <p className="text-sm font-black font-mono-numbers text-white mt-0.5">
                  {savedConfirmation.distanceKm ? `${savedConfirmation.distanceKm} km` : '—'}
                </p>
              </div>

              <div className="bg-[#1C1C22] p-2.5 rounded-2xl border border-white/5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                  <Zap size={11} className="text-emerald-400" /> Cadência
                </span>
                <p className="text-sm font-black font-mono-numbers text-emerald-400 mt-0.5">
                  {savedConfirmation.cadenceRpm || 80} RPM
                </p>
              </div>
            </div>

            {/* Confirmation Banner for CSV Export */}
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-2.5 mb-4 text-left flex items-start gap-2">
              <FileSpreadsheet size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-300 leading-tight">
                <span className="font-bold text-emerald-200 block">Gravado no Histórico & Exportação</span>
                Esta sessão será incluída automaticamente em todas as exportações de arquivo CSV.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setSavedConfirmation(null)}
                className="w-full py-3.5 bg-gradient-to-r from-[#00D1C1] to-emerald-400 hover:from-[#15e8d7] hover:to-emerald-300 text-black font-black text-xs rounded-2xl shadow-xl shadow-[#00D1C1]/25 active:scale-95 transition-all cursor-pointer"
              >
                OK, CONTINUAR TREINANDO
              </button>

              <button
                type="button"
                onClick={() => {
                  setSavedConfirmation(null);
                  setActiveTab('history');
                }}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-bold text-xs rounded-xl border border-white/5 transition-all cursor-pointer"
              >
                Ver no Histórico de Cardio
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Edição de Sessão de Cardio */}
      <EditCardioModal
        isOpen={!!editingSession}
        session={editingSession}
        onClose={() => setEditingSession(null)}
        onSave={handleSaveEditedSession}
        onDelete={(id) => {
          handleDeleteSession(id);
          setEditingSession(null);
        }}
      />
    </div>
  );
};
