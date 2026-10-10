import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Clock, 
  Target, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Zap, 
  ShieldCheck,
  Cloud,
  CloudCheck,
  CloudOff,
  LogIn,
  LogOut,
  Sparkles,
  Database,
  Bell,
  Lock,
  Sun,
  Moon,
  Laptop,
  Palette,
  Eye
} from 'lucide-react';
import { UserProfile, CompletedWorkout, Routine } from '../types';
import { soundFx } from '../utils/audio';
import { StrengthCoachCard } from './StrengthCoachCard';
import { 
  ThemeMode, 
  ThemeColor, 
  THEME_COLOR_PRESETS, 
  applyTheme 
} from '../utils/theme';
import { 
  requestTimerNotificationPermission, 
  triggerRestCompleteAlert,
  triggerTripleVibration,
  runVibrationTest,
  startBackgroundAudioKeepAlive,
  scheduleServiceWorkerRestTimer,
  updateMediaSessionTimer,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  sendWorkoutCompleteNotification
} from '../utils/backgroundTimer';
import type { User } from 'firebase/auth';

interface ProfileViewProps {
  profile: UserProfile;
  currentUser: User | null;
  isSyncing: boolean;
  syncError: string | null;
  onLoginGoogle: () => void;
  onLogout: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetDemoData: () => void;
  history?: CompletedWorkout[];
  routines?: Routine[];
  onStartRoutine?: (routine: Routine) => void;
  onNavigateToRoutines?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  currentUser,
  isSyncing,
  syncError,
  onLoginGoogle,
  onLogout,
  onUpdateProfile,
  onExportBackup,
  onImportBackup,
  onResetDemoData,
  history = [],
  routines = [],
  onStartRoutine,
  onNavigateToRoutines
}) => {
  const [name, setName] = useState(profile.name);
  const [weightInput, setWeightInput] = useState<string>(
    profile.weightKg ? String(profile.weightKg) : ''
  );
  const [weeklyGoal, setWeeklyGoal] = useState(profile.weeklyGoalWorkouts);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isTestingLockScreen, setIsTestingLockScreen] = useState(false);
  const [lockScreenCountdown, setLockScreenCountdown] = useState(5);
  const [vibrationFeedback, setVibrationFeedback] = useState<{ message: string; type: 'success' | 'info' | 'warning'; details?: string } | null>(null);

  // Sync state if profile prop updates (e.g. from cloud)
  useEffect(() => {
    setName(profile.name);
    setWeightInput(profile.weightKg ? String(profile.weightKg) : '');
    setWeeklyGoal(profile.weeklyGoalWorkouts);
  }, [profile.name, profile.weightKg, profile.weeklyGoalWorkouts]);

  const handleSavePreferences = () => {
    const cleanWeight = weightInput.replace(',', '.').trim();
    const parsedWeight = parseFloat(cleanWeight);
    const validWeight = !isNaN(parsedWeight) && parsedWeight > 0 
      ? Math.round(parsedWeight * 10) / 10 
      : profile.weightKg;

    onUpdateProfile({
      ...profile,
      name: name.trim() || profile.name,
      weightKg: validWeight,
      weeklyGoalWorkouts: weeklyGoal
    });
    soundFx.playSetComplete();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleTestSound = () => {
    soundFx.resumeContext();
    triggerRestCompleteAlert('Teste de Alarme', profile.soundEnabled ?? true, profile.vibrationEnabled ?? true);
    setVibrationFeedback({
      message: 'Alarme sonoro e sinal de vibração disparados!',
      type: 'success'
    });
    setTimeout(() => setVibrationFeedback(null), 4000);
  };

  const handleRunVibeMode = async (mode: 'single' | 'long' | 'triple' | 'persistent' | 'notification') => {
    const res = await runVibrationTest(mode);
    setVibrationFeedback({
      message: res.message,
      type: res.type
    });
    setTimeout(() => setVibrationFeedback(null), 4000);
  };

  const handleStartLockScreenTest = async () => {
    soundFx.resumeContext();
    await requestTimerNotificationPermission();

    setIsTestingLockScreen(true);
    const total = 10;
    setLockScreenCountdown(total);

    const target = Date.now() + total * 1000;
    startBackgroundAudioKeepAlive('Teste Tela Bloqueada', total, total);
    scheduleServiceWorkerRestTimer(target, 'Teste Tela Bloqueada');

    setVibrationFeedback({
      message: 'Cronômetro de Teste Iniciado (10s)!',
      type: 'info',
      details: 'Pressione o botão liga/desliga para travar a tela agora! Você verá o Widget de Mídia com o cronômetro na tela de bloqueio e Always-On Display.'
    });

    const interval = setInterval(() => {
      const rem = Math.max(0, Math.ceil((target - Date.now()) / 1000));
      setLockScreenCountdown(rem);

      updateMediaSessionTimer({
        remainingSeconds: rem,
        totalSeconds: total,
        exerciseName: 'Teste Tela Bloqueada',
        isPaused: false
      });

      if (rem <= 0) {
        clearInterval(interval);
        setIsTestingLockScreen(false);
        triggerRestCompleteAlert('Teste Tela Bloqueada', profile.soundEnabled ?? true, profile.vibrationEnabled ?? true);
        setVibrationFeedback({
          message: 'Teste concluído com sucesso!',
          type: 'success',
          details: 'O cronômetro foi sincronizado com a tela de bloqueio e acionou o alarme + 3 vibrações ao zerar.'
        });
      }
    }, 500);
  };

  const isAnonymous = currentUser?.isAnonymous ?? true;

  return (
    <div id="profile-view" className="space-y-4 pb-28 pt-2">
      {/* Header */}
      <div>
        <span className="text-[11px] font-black tracking-widest text-[#00D1C1] uppercase">
          CONFIGURAÇÕES & PREFERÊNCIAS
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Perfil & Banco de Dados
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* PERSONALIZAÇÃO DE TEMA & CORES (MODO CLARO/ESCURO & PALETA DE CORES)      */}
      {/* ========================================================================= */}
      <div 
        id="theme-customizer-card" 
        className="bg-[#161616] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00D1C1]">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base">Aparência & Cores do App</h2>
              <p className="text-xs text-neutral-400">Modo de visualização e cor de destaque</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
            {profile.themeMode === 'light' ? 'Modo Claro' : profile.themeMode === 'system' ? 'Sistema' : 'Modo Escuro'}
          </span>
        </div>

        {/* 1. SELETOR DE MODO (Escuro / Claro / Sistema) */}
        <div>
          <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-2">
            Modo de Exibição
          </label>
          <div className="grid grid-cols-3 gap-2 bg-[#222222] p-1.5 rounded-2xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                soundFx.playTick();
                const newMode: ThemeMode = 'dark';
                applyTheme(newMode, profile.themeColor || 'tiffany');
                onUpdateProfile({ ...profile, themeMode: newMode });
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                (profile.themeMode || 'dark') === 'dark'
                  ? 'bg-black text-white shadow-md border border-white/10 font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Moon size={14} className="text-indigo-400" />
              <span>Escuro</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playTick();
                const newMode: ThemeMode = 'light';
                applyTheme(newMode, profile.themeColor || 'tiffany');
                onUpdateProfile({ ...profile, themeMode: newMode });
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                profile.themeMode === 'light'
                  ? 'bg-white text-black shadow-md border border-neutral-200 font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sun size={14} className="text-amber-500" />
              <span>Claro</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playTick();
                const newMode: ThemeMode = 'system';
                applyTheme(newMode, profile.themeColor || 'tiffany');
                onUpdateProfile({ ...profile, themeMode: newMode });
              }}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                profile.themeMode === 'system'
                  ? 'bg-neutral-800 text-white shadow-md border border-white/10 font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Laptop size={14} className="text-sky-400" />
              <span>Sistema</span>
            </button>
          </div>
        </div>

        {/* 2. SELETOR DE CORES DO TEMA */}
        <div className="pt-1">
          <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-2">
            Cores de Destaque do App
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {THEME_COLOR_PRESETS.map((preset) => {
              const isSelected = (profile.themeColor || 'tiffany') === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    soundFx.playTick();
                    const activeMode = profile.themeMode || 'dark';
                    applyTheme(activeMode, preset.id);
                    onUpdateProfile({ ...profile, themeColor: preset.id });
                  }}
                  style={isSelected ? {
                    borderColor: preset.hex,
                    boxShadow: `0 0 14px ${preset.hex}40`
                  } : undefined}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 scale-[1.02] bg-white/10'
                      : 'bg-[#222222] border-white/5 hover:border-white/15 hover:bg-[#282828]'
                  }`}
                  title={`${preset.name} — ${preset.label}`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span
                      className="w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check size={13} className="text-black stroke-[3]" />}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-white block leading-tight truncate">
                      {preset.name}
                    </span>
                    <span className="text-[9px] text-neutral-400 block leading-tight truncate mt-0.5">
                      {preset.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Info Card - Atleta Thunder */}
      <div id="athlete-profile-card" className="bg-[#161616] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00D1C1] to-[#008f77] p-0.5 shadow-lg shadow-[#00D1C1]/20">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[14px] flex items-center justify-center text-[#00D1C1]">
              <UserIcon size={28} />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">{profile.name}</h3>
            <span className="text-xs text-[#00D1C1] font-semibold flex items-center gap-1">
              <Zap size={13} className="fill-[#00D1C1]" /> Atleta THUNDER Pro
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1">Seu Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#222222] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00D1C1]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 block mb-1">Peso Corporal (kg)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ex: 75.5"
              value={weightInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                  setWeightInput(val);
                }
              }}
              className="w-full bg-[#222222] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:border-[#00D1C1]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-neutral-400">Meta Semanal de Treinos</label>
            <span className="text-xs font-mono-numbers font-bold text-[#00D1C1]">{weeklyGoal} dias/semana</span>
          </div>
          <input
            type="range"
            min="1"
            max="7"
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(parseInt(e.target.value, 10))}
            className="w-full accent-[#00D1C1] bg-[#222222] h-2 rounded-lg cursor-pointer"
          />
        </div>

        <button
          id="save-profile-btn"
          onClick={handleSavePreferences}
          className="w-full py-3 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-2xl shadow-lg shadow-[#00D1C1]/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Check size={16} strokeWidth={3} />
          {savedFeedback ? 'DADOS ATUALIZADOS NA NUVEM!' : 'SALVAR ALTERAÇÕES'}
        </button>
      </div>

      {/* Cloud Database Status & Google Login Card */}
      <div id="cloud-auth-status-card" className="bg-[#161616] border border-[#00D1C1]/20 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00D1C1]/10 border border-[#00D1C1]/20 flex items-center justify-center text-[#00D1C1]">
              <Database size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                Firebase Firestore
                <span className="w-2 h-2 rounded-full bg-[#00D1C1] animate-pulse"></span>
              </span>
              <span className="text-[11px] text-neutral-400">
                {isSyncing ? 'Sincronizando dados em tempo real...' : 'Conectado e 100% sincronizado'}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono-numbers font-bold text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-1 rounded-md border border-[#00D1C1]/20">
            ONLINE
          </span>
        </div>

        {/* Account Info / Google Auth */}
        <div className="bg-[#0A0A0A] rounded-2xl p-3 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Usuário'}
                  className="w-9 h-9 rounded-xl border border-[#00D1C1]/30 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#222222] flex items-center justify-center text-neutral-400">
                  <UserIcon size={18} />
                </div>
              )}

              <div>
                <span className="text-xs font-extrabold text-white block">
                  {currentUser?.displayName || (isAnonymous ? 'Sessão Conectada (Convidado)' : 'Atleta Registrado')}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono-numbers">
                  {currentUser?.email || `UID: ${currentUser?.uid?.slice(0, 10)}...`}
                </span>
              </div>
            </div>

            {isAnonymous ? (
              <button
                id="login-google-btn"
                onClick={onLoginGoogle}
                className="px-3 py-1.5 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all"
              >
                <LogIn size={13} strokeWidth={2.5} />
                Entrar com Google
              </button>
            ) : (
              <button
                id="logout-btn"
                onClick={onLogout}
                className="px-2.5 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 hover:text-rose-400 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1 transition-colors"
                title="Desconectar conta"
              >
                <LogOut size={13} />
                Sair
              </button>
            )}
          </div>

          {isAnonymous && (
            <p className="text-[11px] text-neutral-400 bg-white/5 px-2.5 py-1.5 rounded-xl">
              💡 Conecte sua conta do <strong>Google</strong> para salvar seus treinos e PRs permanentemente em qualquer celular ou computador.
            </p>
          )}

          {syncError && (
            <p className="text-[11px] text-rose-400 bg-rose-500/10 px-2.5 py-1.5 rounded-xl border border-rose-500/20">
              ⚠️ {syncError}
            </p>
          )}
        </div>
      </div>

      {/* Timer & Feedback Preferences */}
      <div className="bg-[#161616] border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
          <Clock size={16} className="text-[#00D1C1]" />
          Cronômetro de Descanso
        </h3>

        {/* Default rest time chips */}
        <div>
          <label className="text-xs font-bold text-neutral-400 block mb-2">
            Tempo Padrão de Descanso:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[60, 90, 120, 180].map((sec) => (
              <button
                key={sec}
                onClick={() => onUpdateProfile({ ...profile, defaultRestSeconds: sec })}
                className={`py-2 rounded-xl text-xs font-mono-numbers font-bold transition-all ${
                  profile.defaultRestSeconds === sec
                    ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/20 font-black'
                    : 'bg-[#222222] text-neutral-300 border border-white/5 hover:bg-[#2a2a2a]'
                }`}
              >
                {Math.floor(sec / 60)}:{(sec % 60).toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            {profile.soundEnabled ? <Volume2 size={18} className="text-[#00D1C1]" /> : <VolumeX size={18} className="text-neutral-500" />}
            <div>
              <span className="text-xs font-bold text-white block">Sons do Cronômetro & PR</span>
              <span className="text-[10px] text-neutral-400">Emite alertas sonoros ao zerar o descanso</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={profile.soundEnabled}
            onChange={(e) => onUpdateProfile({ ...profile, soundEnabled: e.target.checked })}
            className="w-5 h-5 accent-[#00D1C1] rounded cursor-pointer"
          />
        </div>

        {/* Keep Screen Awake (Wake Lock) Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Sun size={18} className="text-[#00D1C1]" />
            <div>
              <span className="text-xs font-bold text-white block">Manter Tela Acesa no Descanso</span>
              <span className="text-[10px] text-neutral-400">Impede que a tela do celular apague enquanto você descansa</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={profile.keepScreenAwake ?? true}
            onChange={(e) => {
              const val = e.target.checked;
              onUpdateProfile({ ...profile, keepScreenAwake: val });
              if (val) {
                requestScreenWakeLock().catch(() => {});
              } else {
                releaseScreenWakeLock();
              }
            }}
            className="w-5 h-5 accent-[#00D1C1] rounded cursor-pointer"
          />
        </div>

        {/* Native Phone Timer Sync Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#00D1C1]" />
            <div>
              <span className="text-xs font-bold text-white block">
                Usar Relógio do Celular (POCO M8 • Tela Desligada)
              </span>
              <span className="text-[10px] text-neutral-400">
                Dispara o temporizador no app oficial de Relógio do Poco M8, garantindo alarme e vibração com a tela desligada
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={profile.useNativeClockTimer ?? false}
            onChange={(e) => onUpdateProfile({ ...profile, useNativeClockTimer: e.target.checked })}
            className="w-5 h-5 accent-[#00D1C1] rounded cursor-pointer"
          />
        </div>

        {/* Vibration Toggle & Diagnostic Hub */}
        <div className="pt-3 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-[#00D1C1]" />
              <div>
                <span className="text-xs font-bold text-white block">Vibração Háptica</span>
                <span className="text-[10px] text-neutral-400">Vibra o celular ao concluir a série e o descanso</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.vibrationEnabled}
              onChange={(e) => onUpdateProfile({ ...profile, vibrationEnabled: e.target.checked })}
              className="w-5 h-5 accent-[#00D1C1] rounded cursor-pointer"
            />
          </div>

            {/* Test Section - Minimalist & Clean */}
          <div className="pt-3 border-t border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 block">
                Notificações Nativas (Service Worker) & Vibração
              </span>
              <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full bg-[#00D1C1]/10 text-[#00D1C1] border border-[#00D1C1]/20 font-bold">
                API Service Worker
              </span>
            </div>

            <p className="text-[11px] text-neutral-400">
              Notificações nativas do sistema disparam automaticamente pelo Service Worker quando o <strong>descanso terminar</strong> ou quando o <strong>treino for finalizado</strong>, inclusive com a tela bloqueada.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                id="test-rest-notif-btn"
                onClick={async () => {
                  soundFx.resumeContext();
                  await requestTimerNotificationPermission();
                  await runVibrationTest('notification');
                  setVibrationFeedback({
                    message: 'Notificação nativa de fim de descanso disparada via Service Worker!',
                    type: 'success'
                  });
                  setTimeout(() => setVibrationFeedback(null), 4000);
                }}
                className="py-2.5 px-2 bg-[#1e1e1e] hover:bg-[#282828] text-neutral-200 text-xs font-bold rounded-xl border border-white/10 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                title="Disparar notificação nativa de descanso do Service Worker"
              >
                ⏱️ Notif. Descanso
              </button>

              <button
                id="test-workout-notif-btn"
                onClick={async () => {
                  soundFx.resumeContext();
                  await requestTimerNotificationPermission();
                  await sendWorkoutCompleteNotification({
                    routineName: 'Treino A (Peitoral & Tríceps)',
                    totalVolumeKg: 14250,
                    totalSets: 16,
                    durationSeconds: 3240,
                    estimatedCalories: 420
                  });
                  setVibrationFeedback({
                    message: 'Notificação nativa de Treino Concluído disparada via Service Worker!',
                    type: 'success'
                  });
                  setTimeout(() => setVibrationFeedback(null), 4000);
                }}
                className="py-2.5 px-2 bg-[#1e1e1e] hover:bg-[#282828] text-neutral-200 text-xs font-bold rounded-xl border border-white/10 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                title="Disparar notificação nativa de conclusão de treino do Service Worker"
              >
                🏆 Notif. Treino Fim
              </button>

              <button
                id="test-triple-vibe-btn"
                onClick={() => handleRunVibeMode('triple')}
                className="py-2.5 px-2 bg-[#1e1e1e] hover:bg-[#282828] text-neutral-200 text-xs font-bold rounded-xl border border-white/10 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
              >
                📳 Vibração
              </button>

              <button
                id="test-lock-screen-btn"
                onClick={handleStartLockScreenTest}
                disabled={isTestingLockScreen}
                className={`py-2.5 px-2 rounded-xl text-xs font-black active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 ${
                  isTestingLockScreen
                    ? 'bg-amber-500 text-black animate-pulse'
                    : 'bg-[#00D1C1] hover:bg-[#15e8d7] text-black shadow-md shadow-[#00D1C1]/20'
                }`}
              >
                <Lock size={13} />
                {isTestingLockScreen ? `${lockScreenCountdown}s` : 'Bloqueio (10s)'}
              </button>
            </div>

            {vibrationFeedback && (
              <div className={`p-2.5 rounded-xl border text-xs animate-in fade-in flex items-center gap-2 ${
                vibrationFeedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-[#00D1C1]/15 border-[#00D1C1]/30 text-[#00D1C1]'
              }`}>
                <span>{vibrationFeedback.type === 'success' ? '✅' : '⚡'}</span>
                <span className="font-semibold">{vibrationFeedback.message}</span>
              </div>
            )}

            {isTestingLockScreen && (
              <div className="p-2.5 bg-amber-500/15 border border-amber-400/30 rounded-xl text-center space-y-0.5 animate-in fade-in">
                <p className="text-xs font-bold text-amber-300">
                  🔒 Bloqueie a tela do celular agora pelo botão lateral!
                </p>
                <p className="text-[10px] text-amber-200/80">
                  O alarme e as vibrações soarão em {lockScreenCountdown}s.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="bg-[#161616] border border-white/5 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#00D1C1]" />
          Backup & Segurança dos Dados
        </h3>
        <p className="text-xs text-neutral-400">
          Seus dados são sincronizados no Firebase Firestore e também salvos localmente para funcionamento 100% offline.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onExportBackup}
            className="py-3 px-3 bg-[#222222] hover:bg-[#2c2c2c] border border-white/10 rounded-2xl text-xs font-bold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={15} className="text-[#00D1C1]" />
            Exportar Backup (JSON)
          </button>

          <label className="py-3 px-3 bg-[#222222] hover:bg-[#2c2c2c] border border-white/10 rounded-2xl text-xs font-bold text-neutral-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-center">
            <Upload size={15} className="text-[#00D1C1]" />
            Importar Backup
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportBackup(file);
              }}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={() => {
            if (confirm('Tem certeza que deseja restaurar os dados de demonstração iniciais?')) {
              onResetDemoData();
            }
          }}
          className="w-full py-2.5 text-neutral-500 hover:text-rose-400 text-xs font-semibold rounded-xl hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-1 mt-2"
        >
          <RotateCcw size={14} /> Restaurar dados de demonstração
        </button>
      </div>

      {/* 'Strength Coach' no rodapé da aba Perfil */}
      <div className="pt-2">
        <StrengthCoachCard
          history={history}
          routines={routines}
          profile={profile}
          onStartRoutine={onStartRoutine}
          onNavigateToRoutines={onNavigateToRoutines}
        />
      </div>

      {/* Brand Footer */}
      <div className="text-center py-6 text-neutral-500 text-xs space-y-1">
        <p className="font-extrabold text-neutral-400 tracking-widest uppercase">
          THUNDER PERFORMANCE v1.0
        </p>
        <p className="italic text-neutral-500">
          "Treine. Registre. Descanse. Evolua."
        </p>
        <p className="font-extrabold text-neutral-400 tracking-widest uppercase text-[10px] pt-1">
          Desenvolvido por Thiago Silva. since 2026
        </p>
      </div>
    </div>
  );
};
