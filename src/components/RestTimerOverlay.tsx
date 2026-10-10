import React, { useEffect, useState, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  X, 
  Plus, 
  Minus, 
  RotateCcw, 
  Sparkles, 
  ChevronDown, 
  Maximize2, 
  Moon,
  SunMedium
} from 'lucide-react';
import { formatTimerDigits } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { 
  triggerRestCompleteAlert
} from '../utils/backgroundTimer';

interface RestTimerOverlayProps {
  remainingSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  exerciseName?: string;
  onAddSeconds: (seconds: number) => void;
  onTogglePause: () => void;
  onSkip: () => void;
  onReset: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  keepScreenAwake?: boolean;
  onToggleKeepScreenAwake?: () => void;
  useNativeClockTimer?: boolean;
  onToggleUseNativeClockTimer?: () => void;
}

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
  remainingSeconds,
  totalSeconds,
  isPaused,
  exerciseName = 'Descanso',
  onAddSeconds,
  onTogglePause,
  onSkip,
  onReset,
  isMinimized,
  onToggleMinimize,
  soundEnabled = true,
  vibrationEnabled = true,
  keepScreenAwake = true,
  onToggleKeepScreenAwake,
  useNativeClockTimer = false,
  onToggleUseNativeClockTimer
}) => {
  const [completedAnimation, setCompletedAnimation] = useState(false);
  const [isAodMode, setIsAodMode] = useState(false);

  // Trigger celebration visual, triple vibration, sound and background notification when time hits 0
  useEffect(() => {
    if (remainingSeconds === 0 && totalSeconds > 0) {
      setCompletedAnimation(true);
      triggerRestCompleteAlert(exerciseName, soundEnabled, vibrationEnabled);
      const t = setTimeout(() => {
        setCompletedAnimation(false);
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [remainingSeconds, totalSeconds, soundEnabled, vibrationEnabled, exerciseName]);

  // Audio countdown ticks on last 3 seconds
  useEffect(() => {
    if (!isPaused && remainingSeconds > 0 && remainingSeconds <= 3 && soundEnabled) {
      soundFx.playTick();
    }
  }, [remainingSeconds, isPaused, soundEnabled]);

  // Progress percentage (0% at start, 100% at end)
  const progressPercent = totalSeconds > 0 
    ? Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
    : 0;

  // Elapsed seconds
  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);

  // SVG Geometry Constants for 260x260 circular gauge
  const center = 130;
  const radius = 100;
  const circumference = 2 * Math.PI * radius; // ~628.318
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  // Leading Glowing Dot calculation
  const leadingAngleRad = ((progressPercent * 3.6) - 90) * (Math.PI / 180);
  const leadingDotX = center + radius * Math.cos(leadingAngleRad);
  const leadingDotY = center + radius * Math.sin(leadingAngleRad);

  // 60 Chronograph Dial Ticks (6 degrees each, starting at 12 o'clock)
  const dialTicks = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const deg = i * 6 - 90;
      const rad = (deg * Math.PI) / 180;
      const isMajor = i % 5 === 0;
      const rOuter = 120;
      const rInner = isMajor ? 111 : 115;
      const x1 = center + rOuter * Math.cos(rad);
      const y1 = center + rOuter * Math.sin(rad);
      const x2 = center + rInner * Math.cos(rad);
      const y2 = center + rInner * Math.sin(rad);
      const percentAtTick = (i / 60) * 100;
      const isPassed = progressPercent >= percentAtTick;

      return { i, x1, y1, x2, y2, isMajor, isPassed };
    });
  }, [progressPercent]);

  // Floating Minimized Bar at the bottom
  if (isMinimized) {
    return (
      <div 
        id="rest-timer-dock"
        className="fixed bottom-16 left-0 right-0 z-50 px-3 max-w-lg mx-auto pointer-events-auto"
      >
        <div className="bg-[#121214]/95 backdrop-blur-2xl border border-[#00D1C1]/40 rounded-2xl p-2.5 shadow-2xl shadow-[#00D1C1]/15 flex items-center justify-between">
          <div 
            onClick={onToggleMinimize}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-11 h-11 -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#1c1c1f"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#00D1C1"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray="113.1"
                  strokeDashoffset={113.1 - (113.1 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-300 drop-shadow-[0_0_6px_rgba(0,209,193,0.6)]"
                />
              </svg>
              <span className="absolute text-[11px] font-mono-numbers font-black text-white">
                {Math.ceil(remainingSeconds)}s
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00D1C1]">
                  DESCANSO • {Math.round(progressPercent)}%
                </span>
                {isPaused && (
                  <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold">
                    PAUSADO
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-200 font-bold truncate max-w-[130px]">
                {exerciseName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onAddSeconds(30)}
              className="px-2 py-1.5 bg-[#1e1e24] hover:bg-[#282830] text-neutral-200 rounded-lg text-xs font-mono font-bold border border-white/10 active:scale-95 transition-all"
              title="+30s"
            >
              +30s
            </button>

            <button
              onClick={onTogglePause}
              className="p-2 bg-[#1e1e24] hover:bg-[#282830] text-white rounded-lg border border-white/10 active:scale-95 transition-all"
            >
              {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
            </button>

            <button
              onClick={onSkip}
              className="p-2 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-bold rounded-lg active:scale-95 transition-all shadow-md shadow-[#00D1C1]/20"
              title="Pular descanso"
            >
              <X size={16} strokeWidth={3} />
            </button>

            <button
              onClick={onToggleMinimize}
              className="p-1.5 text-neutral-400 hover:text-white"
              title="Expandir"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen AOD Mode (Ultra-dark minimal Always-On Display for gym bench)
  if (isAodMode) {
    return (
      <div 
        onClick={() => setIsAodMode(false)}
        className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-between p-6 cursor-pointer select-none text-center animate-in fade-in duration-300"
      >
        <div className="w-full flex items-center justify-between text-neutral-500 text-xs">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#00D1C1]/70">
            MODO AOD • SEMPRE ACESA
          </span>
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <SunMedium size={13} className="text-[#00D1C1]" /> Toque para sair
          </span>
        </div>

        <div className="flex flex-col items-center justify-center my-auto space-y-4">
          <span className="text-sm font-bold text-neutral-400 tracking-wide uppercase">
            Próxima Série: <strong className="text-white">{exerciseName}</strong>
          </span>

          {/* Glowing Minimal Circular Stopwatch */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
              <circle
                cx="130"
                cy="130"
                r="100"
                stroke="#151515"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="130"
                cy="130"
                r="100"
                stroke="#00D1C1"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="628.3"
                strokeDashoffset={628.3 - (628.3 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 drop-shadow-[0_0_16px_rgba(0,209,193,0.7)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-6xl font-mono-numbers font-black tracking-tight text-white drop-shadow-[0_0_24px_rgba(0,209,193,0.4)]">
                {formatTimerDigits(remainingSeconds)}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#00D1C1] mt-1 font-bold">
                {Math.round(progressPercent)}% • {elapsedSeconds}s / {totalSeconds}s
              </span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500 font-mono">
          Tela acesa sem apagar no banco • Toque em qualquer lugar para voltar
        </div>
      </div>
    );
  }

  // Expanded Fullscreen / Modal Drawer with Premium Dark Aesthetics & Circular Progress Filling
  return (
    <div 
      id="rest-timer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm bg-[#111114] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Subtle Ambient Background Neon Glow */}
        <div 
          className="absolute -top-20 -left-20 w-48 h-48 bg-[#00D1C1]/10 rounded-full blur-3xl pointer-events-none" 
        />
        <div 
          className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#00A3FF]/10 rounded-full blur-3xl pointer-events-none" 
        />

        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between mb-3 z-10">
          <button
            onClick={onToggleMinimize}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition-all"
            title="Minimizar para acompanhar séries"
          >
            <ChevronDown size={22} />
          </button>

          <div className="flex items-center gap-1.5 bg-[#00D1C1]/10 px-3 py-1 rounded-full border border-[#00D1C1]/20">
            <Sparkles size={13} className="text-[#00D1C1]" />
            <span className="text-[11px] font-black tracking-widest text-[#00D1C1] uppercase">
              TEMPO DE DESCANSO
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAodMode(true)}
              className="p-2 text-neutral-400 hover:text-[#00D1C1] rounded-xl hover:bg-white/5 active:scale-95 transition-all"
              title="Modo Tela AOD (Always-On Display para o banco)"
            >
              <Moon size={18} />
            </button>
            <button
              onClick={onSkip}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 active:scale-95 transition-all"
              title="Pular descanso"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Exercise Context */}
        <div className="w-full mb-2 z-10 text-center">
          <p className="text-xs font-semibold text-neutral-400 truncate max-w-full">
            Próxima série: <span className="text-white font-extrabold">{exerciseName}</span>
          </p>
        </div>

        {/* ======================================================== */}
        {/* PREMIUM CIRCULAR STOPWATCH DISPLAY WITH FILLING ANIMATION */}
        {/* ======================================================== */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2 select-none">
          {/* Subtle Outer Pulsing Wave on Completion */}
          <div className={`absolute inset-0 rounded-full ${completedAnimation ? 'bg-[#00D1C1]/20 animate-ping' : ''}`} />

          {/* Fluid Conic Filling Background Glow (Efeito de Preenchimento Dinâmico) */}
          <div 
            className="absolute inset-5 rounded-full overflow-hidden pointer-events-none transition-all duration-500 ease-out"
            style={{
              background: `conic-gradient(from -90deg, rgba(0, 209, 193, 0.22) 0%, rgba(0, 163, 255, 0.14) ${progressPercent}%, rgba(14, 14, 18, 0.9) ${progressPercent}% 100%)`,
              maskImage: 'radial-gradient(circle, rgba(0,0,0,0.88) 55%, transparent 72%)',
              WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,0.88) 55%, transparent 72%)'
            }}
          />

          {/* SVG Circular Dial with Gradient and Chronograph Ticks */}
          <svg className="w-full h-full -rotate-90 transform z-10" viewBox="0 0 260 260">
            <defs>
              {/* Electric Tiffany to Cyan to Blue Gradient */}
              <linearGradient id="thunderProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00FFE0" />
                <stop offset="50%" stopColor="#00D1C1" />
                <stop offset="100%" stopColor="#0088FF" />
              </linearGradient>

              {/* High-visibility Neon Glow Filter */}
              <filter id="thunderGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00D1C1" floodOpacity="0.8" />
                <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#00D1C1" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* 60 Chronograph Dial Notch Ticks around the rim */}
            <g className="opacity-90">
              {dialTicks.map((tick) => (
                <line
                  key={tick.i}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={tick.isPassed ? '#00D1C1' : '#222228'}
                  strokeWidth={tick.isMajor ? 2.2 : 1.2}
                  strokeLinecap="round"
                  className="transition-colors duration-200"
                />
              ))}
            </g>

            {/* Background Track Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#1a1a20"
              strokeWidth="11"
              fill="transparent"
            />

            {/* Secondary Track Inset Line */}
            <circle
              cx={center}
              cy={center}
              r={radius - 7.5}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="1"
              fill="transparent"
            />

            {/* Foreground Animated Progress Arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#thunderProgressGrad)"
              strokeWidth="11"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#thunderGlow)"
              className="transition-all duration-300 ease-out"
            />

            {/* Moving Pulsing Orb / Glowing Tip at the Arc End */}
            {progressPercent > 0.5 && progressPercent < 99.5 && (
              <circle
                cx={leadingDotX}
                cy={leadingDotY}
                r="5.5"
                fill="#FFFFFF"
                filter="drop-shadow(0 0 6px #00FFE0)"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Central Digits & Context Feedback */}
          <div className="absolute z-20 flex flex-col items-center justify-center pointer-events-none">
            {/* Big Monospace Digits */}
            <span className="text-5xl sm:text-6xl font-mono-numbers font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(0,209,193,0.35)]">
              {formatTimerDigits(remainingSeconds)}
            </span>

            {/* Progress Percentage Badge */}
            <div className="mt-1 flex items-center gap-1.5 bg-black/60 border border-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-md">
              <span className="text-[10px] font-mono font-black text-[#00D1C1]">
                {Math.round(progressPercent)}%
              </span>
              <span className="text-[9px] text-neutral-400 font-mono">
                {elapsedSeconds}s / {totalSeconds}s
              </span>
            </div>

            {/* Status Label */}
            <span className={`text-[10px] uppercase tracking-widest font-black mt-1 ${
              isPaused 
                ? 'text-amber-400 animate-pulse' 
                : remainingSeconds === 0 
                ? 'text-[#00D1C1]' 
                : 'text-neutral-400'
            }`}>
              {isPaused ? 'Pausado' : remainingSeconds === 0 ? 'Concluído!' : 'Tempo Restante'}
            </span>
          </div>
        </div>

        {/* Time Adjust Steppers (-30s, Reset, +30s) */}
        <div className="flex items-center justify-center gap-2.5 w-full my-4 z-10">
          <button
            onClick={() => onAddSeconds(-30)}
            disabled={remainingSeconds <= 30}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 bg-[#18181c] hover:bg-[#222228] disabled:opacity-30 disabled:pointer-events-none text-neutral-200 rounded-xl border border-white/5 font-mono font-bold text-xs active:scale-95 transition-all shadow-md"
          >
            <Minus size={14} /> 30s
          </button>

          <button
            onClick={onReset}
            className="p-2.5 bg-[#18181c] hover:bg-[#222228] text-neutral-300 rounded-xl border border-white/5 active:scale-95 transition-all shadow-md"
            title="Reiniciar tempo padrão"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={() => onAddSeconds(30)}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 bg-[#18181c] hover:bg-[#222228] text-neutral-200 rounded-xl border border-white/5 font-mono font-bold text-xs active:scale-95 transition-all shadow-md"
          >
            <Plus size={14} /> 30s
          </button>
        </div>

        {/* Main Action Buttons (Pausar/Continuar & Pular) */}
        <div className="flex items-center gap-2.5 w-full z-10">
          <button
            onClick={onTogglePause}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
              isPaused
                ? 'bg-[#00D1C1] hover:bg-[#15e8d7] text-black shadow-[#00D1C1]/20'
                : 'bg-[#1e1e24] hover:bg-[#26262e] text-white border border-white/10'
            }`}
          >
            {isPaused ? (
              <>
                <Play size={16} fill="currentColor" /> CONTINUAR
              </>
            ) : (
              <>
                <Pause size={16} fill="currentColor" /> PAUSAR
              </>
            )}
          </button>

          <button
            onClick={onSkip}
            className="flex-1 py-3 px-4 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#00D1C1]/20 active:scale-95 transition-all"
          >
            PULAR DESCANSO →
          </button>
        </div>
      </div>
    </div>
  );
};
