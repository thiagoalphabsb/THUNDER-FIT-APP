// Background Timer, Notifications, WakeLock, Audio Keep-Alive & Haptic Management for THUNDER
import { soundFx } from './audio';
import { formatTimerDigits } from './calc';
import {
  vibration,
  PERSISTENT_ALARM_PATTERN,
  EXTENDED_ALERT_PATTERN,
  HEAVY_SINGLE_PATTERN,
  type VibrationOptions
} from './vibrationWrapper';

export {
  vibration,
  PERSISTENT_ALARM_PATTERN,
  EXTENDED_ALERT_PATTERN,
  HEAVY_SINGLE_PATTERN,
  type VibrationOptions
};

// Manage Web Wake Lock API to prevent phone screen from going to sleep while resting
// Implements a persistent WakeLockSentinel that automatically re-acquires across navigation and backgrounding
let persistentWakeLockSentinel: any = null;
let isWakeLockDesired = false;
let wakeLockReacquireTimeout: any = null;

export function isScreenWakeLockActive(): boolean {
  return !!persistentWakeLockSentinel && !persistentWakeLockSentinel.released;
}

export function isScreenWakeLockDesired(): boolean {
  return isWakeLockDesired;
}

export function getPersistentWakeLockSentinel(): any {
  return persistentWakeLockSentinel;
}

/**
 * Requests or re-requests a persistent Screen Wake Lock.
 * If the lock was previously released (e.g. by screen off, tab backgrounding, or navigation),
 * it re-acquires a fresh WakeLockSentinel and re-attaches the release listener.
 */
export async function requestScreenWakeLock(): Promise<boolean> {
  isWakeLockDesired = true;

  if (typeof window === 'undefined' || !('navigator' in window) || !('wakeLock' in navigator)) {
    return false;
  }

  // Already active and not released
  if (persistentWakeLockSentinel && !persistentWakeLockSentinel.released) {
    return true;
  }

  try {
    // Only attempt if document is currently visible; Chromium rejects request with NotAllowedError if hidden
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return false;
    }

    persistentWakeLockSentinel = await (navigator as any).wakeLock.request('screen');

    persistentWakeLockSentinel.addEventListener('release', () => {
      persistentWakeLockSentinel = null;

      // If wake lock is still desired (e.g., active timer still running),
      // schedule an immediate re-acquisition attempt when possible
      if (isWakeLockDesired) {
        if (wakeLockReacquireTimeout) clearTimeout(wakeLockReacquireTimeout);
        wakeLockReacquireTimeout = setTimeout(() => {
          if (isWakeLockDesired && typeof document !== 'undefined' && document.visibilityState === 'visible') {
            requestScreenWakeLock().catch(() => {});
          }
        }, 300);
      }
    });

    return true;
  } catch {
    // Battery saver, system policy or transient failure; retry gracefully if still desired
    if (isWakeLockDesired) {
      if (wakeLockReacquireTimeout) clearTimeout(wakeLockReacquireTimeout);
      wakeLockReacquireTimeout = setTimeout(() => {
        if (isWakeLockDesired && typeof document !== 'undefined' && document.visibilityState === 'visible') {
          requestScreenWakeLock().catch(() => {});
        }
      }, 1000);
    }
    return false;
  }
}

/**
 * Explicitly releases the persistent Screen Wake Lock and stops re-acquisition attempts
 */
export function releaseScreenWakeLock() {
  isWakeLockDesired = false;
  if (wakeLockReacquireTimeout) {
    clearTimeout(wakeLockReacquireTimeout);
    wakeLockReacquireTimeout = null;
  }

  try {
    if (persistentWakeLockSentinel) {
      persistentWakeLockSentinel.release().catch(() => {});
      persistentWakeLockSentinel = null;
    }
  } catch {
    // Ignore
  }
}

// 1. Service Worker Message Handler: Automatically re-requests persistent Wake Lock on SW pings & ticks
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (!event.data) return;
    if (
      event.data.type === 'ENSURE_WAKE_LOCK' ||
      event.data.type === 'REACQUIRE_WAKE_LOCK' ||
      event.data.type === 'UPDATE_REST_COUNTDOWN' ||
      event.data.type === 'REST_TIMER_TICK'
    ) {
      if (isWakeLockDesired && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        requestScreenWakeLock().catch(() => {});
      }
    }
  });
}

// 2. Navigation, Focus, PageShow & Visibility Listeners to survive navigation and brief backgrounding
if (typeof window !== 'undefined') {
  const triggerReacquireIfDesired = () => {
    if (isWakeLockDesired && typeof document !== 'undefined' && document.visibilityState === 'visible') {
      requestScreenWakeLock().catch(() => {});
    }
  };

  // Visibility changes (user turns on screen, switches back to app tab)
  document.addEventListener('visibilitychange', triggerReacquireIfDesired);

  // Survives page show / navigation bfcache
  window.addEventListener('pageshow', triggerReacquireIfDesired);

  // Regained window focus
  window.addEventListener('focus', triggerReacquireIfDesired);

  // Survives client-side route navigation / history transitions
  window.addEventListener('popstate', triggerReacquireIfDesired);
}

// Post message to Service Worker safely
async function postMessageToServiceWorker(message: any) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    if (reg && reg.active) {
      reg.active.postMessage(message);
    }
  } catch (err) {
    console.debug('Failed to postMessage to Service Worker:', err);
  }
}

// Register service worker if available
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.debug('Service Worker register skipped or unsupported:', err);
      });
    });
  }
}

// Check if notification permission is granted
export function isNotificationPermissionGranted(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

// Request Notification Permission on user gesture
export async function requestTimerNotificationPermission(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch {
    // Ignore
  }
  return false;
}

// Open native Android / Xiaomi POCO / Google Clock app countdown timer via system intent
export function openNativePhoneTimer(seconds: number, exerciseName = 'Descanso'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const cleanSeconds = Math.max(1, Math.round(seconds));
    const label = `Descanso ${cleanSeconds}s: ${exerciseName}`;
    const encLabel = encodeURIComponent(label);

    // Provide immediate tactile & audio feedback to the user on tap
    try {
      if ('vibrate' in navigator) navigator.vibrate([80, 50, 80]);
      soundFx.playTick();
    } catch {}

    // Intent 1: Android standard SET_TIMER with SKIP_UI=true (starts countdown immediately)
    const intentUrl = `intent:#Intent;action=android.intent.action.SET_TIMER;i.android.intent.extra.length=${cleanSeconds};S.android.intent.extra.message=${encLabel};B.android.intent.extra.SKIP_UI=true;end`;

    // Intent 2: Standard Android SET_TIMER without SKIP_UI (MIUI / HyperOS compatible)
    const fallbackIntentUrl = `intent:#Intent;action=android.intent.action.SET_TIMER;i.android.intent.extra.length=${cleanSeconds};S.android.intent.extra.message=${encLabel};end`;

    // Execute direct navigation in the same tab (safest method in Chrome Android)
    try {
      window.location.href = intentUrl;
    } catch {
      window.location.href = fallbackIntentUrl;
    }

    // Also trigger via an anchor click for maximum browser/ROM compatibility
    setTimeout(() => {
      try {
        const a = document.createElement('a');
        a.href = intentUrl;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          try {
            document.body.removeChild(a);
          } catch {}
        }, 150);
      } catch {}
    }, 50);

    return true;
  } catch (err) {
    console.debug('Failed to launch native timer intent:', err);
    return false;
  }
}

// Schedule rest timer directly inside Service Worker for foreground service notification & vibration
export function scheduleServiceWorkerRestTimer(
  targetEndTimestamp: number,
  exerciseName?: string,
  totalSeconds?: number
) {
  postMessageToServiceWorker({
    type: 'SCHEDULE_REST_TIMER',
    targetEndTimestamp,
    exerciseName,
    totalSeconds
  });
}

// Cancel scheduled rest timer in Service Worker
export function cancelServiceWorkerRestTimer() {
  postMessageToServiceWorker({
    type: 'CANCEL_REST_TIMER'
  });
}

// Trigger enhanced persistent vibration pattern (4.0s heavy pulses)
// Returns true if hardware motor accepted the vibration call
export function triggerTripleVibration(): boolean {
  try {
    if (typeof window === 'undefined') return false;

    // Use enhanced vibration wrapper with persistent pattern and discrete fallback
    return vibration.vibratePattern(PERSISTENT_ALARM_PATTERN, {
      soundHaptic: true,
      fallbackToDiscrete: true
    });
  } catch (err) {
    console.debug('Vibration trigger error:', err);
    return false;
  }
}

// Start repeating persistent vibration loop for deep sleep / noisy gym
export function triggerPersistentVibrationLoop(maxDurationMs = 8000): void {
  vibration.startPersistentLoop(PERSISTENT_ALARM_PATTERN, maxDurationMs);
}

// Cancel any active continuous vibration
export function cancelActiveVibration(): void {
  vibration.cancel();
}

export interface VibrationDiagnostics {
  supported: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isXiaomiOrPoco: boolean;
  isDesktop: boolean;
  isInIframe: boolean;
  permissionGranted: boolean;
  serviceWorkerActive: boolean;
  osName: string;
  label: string;
}

// Inspect vibration hardware & notification status for diagnostic feedback
export function getVibrationDiagnostics(): VibrationDiagnostics {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      isIOS: false,
      isAndroid: false,
      isXiaomiOrPoco: false,
      isDesktop: false,
      isInIframe: false,
      permissionGranted: false,
      serviceWorkerActive: false,
      osName: 'Desconhecido',
      label: 'Carregando...'
    };
  }

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isXiaomiOrPoco = /POCO|Xiaomi|Redmi|MIUI|HyperOS|2312|240|241/i.test(ua) || (isAndroid && /MIUI/i.test(ua));
  const isDesktop = !isIOS && !isAndroid;

  let isInIframe = false;
  try {
    isInIframe = window.self !== window.top;
  } catch {
    isInIframe = true;
  }

  const supported = 'vibrate' in navigator && typeof navigator.vibrate === 'function';
  const permissionGranted = 'Notification' in window && Notification.permission === 'granted';
  const serviceWorkerActive = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

  let osName = 'Navegador Web';
  if (isIOS) osName = 'Apple iOS (iPhone/iPad)';
  else if (isXiaomiOrPoco) osName = 'Xiaomi / POCO (HyperOS/MIUI)';
  else if (isAndroid) osName = 'Android';
  else if (isDesktop) osName = 'Computador / Desktop';

  let label = '';
  if (isInIframe) {
    label = 'Você está na janela de prévia (iframe). Os navegadores bloqueiam o motor de vibração em iframes por segurança. Abra em uma aba direta no celular.';
  } else if (isIOS) {
    label = 'Dispositivo Apple iOS: A Apple restringe o motor de vibração para páginas web (Safari/Chrome). O THUNDER ativa som e ressonância acústica sub-grave.';
  } else if (isXiaomiOrPoco) {
    label = 'Aparelho Xiaomi / POCO detectado. A Xiaomi restringe tela de bloqueio e segundo plano por padrão. Veja as instruções abaixo para liberar ou use o Relógio Nativo!';
  } else if (isDesktop) {
    label = 'Computadores não possuem motor físico de vibração. Teste em um celular Android.';
  } else if (!supported) {
    label = 'Motor de vibração não suportado pelo navegador atual.';
  } else if (!permissionGranted) {
    label = 'Motor suportado! Ative as notificações acima para vibrar mesmo com a tela bloqueada.';
  } else {
    label = 'Motor de vibração e notificações prontos para disparar!';
  }

  return {
    supported,
    isIOS,
    isAndroid,
    isXiaomiOrPoco,
    isDesktop,
    isInIframe,
    permissionGranted,
    serviceWorkerActive,
    osName,
    label
  };
}

export interface VibrationTestResult {
  accepted: boolean;
  mode: string;
  message: string;
  details: string;
  type: 'success' | 'info' | 'warning';
}

// Run targeted vibration tests with instant technical diagnosis
export async function runVibrationTest(mode: 'single' | 'long' | 'triple' | 'persistent' | 'notification'): Promise<VibrationTestResult> {
  const diag = getVibrationDiagnostics();

  // Test notification mode
  if (mode === 'notification') {
    try {
      if ('Notification' in window) {
        if (Notification.permission !== 'granted') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            return {
              accepted: false,
              mode: 'Notificação',
              type: 'warning',
              message: 'Permissão de notificação negada no navegador.',
              details: 'Para o celular vibrar com a tela bloqueada, é obrigatório permitir as notificações do site no Chrome.'
            };
          }
        }
      }

      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          const notifTag = 'test-rest-' + Date.now();
          await reg.showNotification('⚡ THUNDER: Teste de Notificação', {
            body: 'Se o seu celular tremeu agora, a notificação com vibração está 100% funcionando!',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            vibrate: PERSISTENT_ALARM_PATTERN,
            tag: notifTag,
            renotify: true,
            requireInteraction: true,
            silent: false,
            data: { url: '/' }
          } as any);

          return {
            accepted: true,
            mode: 'Notificação do Sistema',
            type: 'success',
            message: 'Notificação enviada ao sistema com padrão de vibração persistente de 4.0s!',
            details: 'Se a notificação apareceu mas não vibrou: abra as configurações do Android > Aplicativos > Chrome > Notificações > e garanta que "Vibrar" esteja ativo.'
          };
        }
      }

      return {
        accepted: false,
        mode: 'Notificação',
        type: 'warning',
        message: 'Service Worker ainda não está ativo.',
        details: 'Recarregue a página uma vez para registrar o Service Worker.'
      };
    } catch (err: any) {
      return {
        accepted: false,
        mode: 'Notificação',
        type: 'warning',
        message: 'Erro ao disparar notificação: ' + (err?.message || 'Falha'),
        details: 'Verifique se as notificações do site estão permitidas nas configurações do Chrome.'
      };
    }
  }

  // Check iOS
  if (diag.isIOS) {
    soundFx.resumeContext();
    soundFx.playHapticRumble();
    return {
      accepted: false,
      mode: 'Apple iOS (iPhone/iPad)',
      type: 'info',
      message: 'Dispositivo Apple iOS detectado: A Apple não permite que sites web acessem o motor físico de vibração (Taptic Engine).',
      details: 'Essa é uma restrição do iOS para qualquer navegador (Safari/Chrome). O THUNDER acionou o pulso de ressonância tátil sub-grave nos alto-falantes para você sentir fisicamente o alarme.'
    };
  }

  // Check Desktop
  if (diag.isDesktop) {
    return {
      accepted: false,
      mode: 'Computador',
      type: 'warning',
      message: 'Computadores e notebooks não possuem motor de vibração mecânica.',
      details: 'Abra o link do app diretamente no seu celular Android para testar a vibração física.'
    };
  }

  // Check Iframe
  if (diag.isInIframe) {
    return {
      accepted: false,
      mode: 'Janela de Prévia (Iframe)',
      type: 'warning',
      message: 'Você está testando na prévia embutida do AI Studio.',
      details: 'O navegador bloqueia o comando de vibração dentro de iframes por política de segurança. Abra em uma aba direta no Chrome do celular usando o botão "Abrir em Nova Aba".'
    };
  }

  // Check support
  if (!diag.supported) {
    return {
      accepted: false,
      mode: 'API Não Suportada',
      type: 'warning',
      message: 'O navegador atual não disponibiliza navigator.vibrate.',
      details: 'Experimente abrir no Google Chrome oficial para Android.'
    };
  }

  // Execute hardware vibration
  try {
    soundFx.resumeContext();
    soundFx.playHapticRumble();

    let accepted = false;
    let desc = '';

    if (mode === 'single') {
      desc = 'Pulso Único (450ms)';
      accepted = navigator.vibrate(450);
    } else if (mode === 'long') {
      desc = 'Pulso Longo (800ms)';
      accepted = navigator.vibrate(800);
    } else if (mode === 'persistent') {
      desc = 'Vibração Persistente [800, 250, 800, 250, 1000, 300, 1200] (4.0s)';
      accepted = vibration.vibratePattern(PERSISTENT_ALARM_PATTERN, {
        soundHaptic: true,
        fallbackToDiscrete: true
      });
    } else {
      // triple
      desc = '3 Pulsos [400, 180, 400, 180, 400]';
      accepted = navigator.vibrate([400, 180, 400, 180, 400]);
      if (!accepted) {
        accepted = navigator.vibrate(450);
        setTimeout(() => { try { navigator.vibrate(450); } catch {} }, 650);
        setTimeout(() => { try { navigator.vibrate(450); } catch {} }, 1300);
      }
    }

    if (accepted) {
      return {
        accepted: true,
        mode: desc,
        type: 'success',
        message: `Comando de vibração (${desc}) aceito pelo navegador!`,
        details: 'Se o celular não tremeu fisicamente na mão: vá em Configurações do Android > Som e vibração > Resposta tátil / Vibração do sistema e certifique-se de que "Vibração ao tocar" está LIGADA e o modo Economia de Bateria DESLIGADO.'
      };
    } else {
      return {
        accepted: false,
        mode: desc,
        type: 'warning',
        message: 'O navegador recusou o comando de vibração (retornou false).',
        details: 'Toque na tela do aparelho antes de testar ou verifique se o Chrome não está em modo silencioso/não perturbe.'
      };
    }
  } catch (err: any) {
    return {
      accepted: false,
      mode: 'Erro de Execução',
      type: 'warning',
      message: 'Erro ao acionar motor: ' + (err?.message || 'Falha'),
      details: 'Verifique as permissões do navegador.'
    };
  }
}

// Send system notification (works when screen is locked or in another app)
export async function sendTimerCompleteNotification(exerciseName?: string) {
  try {
    if (typeof window === 'undefined') return;

    const title = '⚡ Descanso Concluído!';
    const body = exerciseName
      ? `Hora da próxima série de ${exerciseName}! Bora pra cima!`
      : 'Seu tempo de descanso acabou. Hora da próxima série!';

    // Dispatch via Service Worker message
    postMessageToServiceWorker({
      type: 'SHOW_TIMER_NOTIFICATION',
      title,
      exerciseName,
      body
    });

    // Direct registration.showNotification (Android Chrome standard)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: PERSISTENT_ALARM_PATTERN, // Long persistent pattern for Android / Xiaomi / POCO
          tag: 'thunder-rest-' + Date.now(),
          renotify: true,
          requireInteraction: true,
          silent: false,
          data: { url: '/' }
        } as any);
      }
    }
  } catch (err) {
    console.debug('Notification trigger error:', err);
  }
}

/**
 * Sends a native push notification when a workout is completed (via Service Worker API)
 */
export async function sendWorkoutCompleteNotification(details: {
  routineName?: string;
  totalVolumeKg?: number;
  totalSets?: number;
  durationSeconds?: number;
  estimatedCalories?: number;
}) {
  try {
    if (typeof window === 'undefined') return;

    // Check / request notification permission if supported
    if ('Notification' in window && Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch {}
    }

    const title = '🏆 Treino Concluído com Sucesso!';
    const routine = details.routineName || 'Treino';
    const volume = details.totalVolumeKg ? `${details.totalVolumeKg.toLocaleString('pt-BR')} kg levantados` : '';
    const sets = details.totalSets ? `${details.totalSets} séries` : '';
    const kcal = details.estimatedCalories ? `~${details.estimatedCalories} kcal` : '';
    const statsList = [volume, sets, kcal].filter(Boolean).join(' • ');

    const body = statsList
      ? `${routine} finalizado! Parabéns: ${statsList}. Excelente evolução!`
      : `${routine} finalizado com sucesso! Parabéns pela dedicação no treino de hoje!`;

    // 1. Send to Service Worker via postMessage
    postMessageToServiceWorker({
      type: 'WORKOUT_COMPLETED_NOTIFICATION',
      title,
      body,
      details
    });

    // 2. Direct Service Worker registration showNotification
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: [350, 150, 350, 150, 600],
          tag: 'thunder-workout-finish-' + Date.now(),
          renotify: true,
          requireInteraction: true,
          silent: false,
          actions: [
            { action: 'open', title: 'Ver Histórico' }
          ],
          data: { url: '/', type: 'WORKOUT_COMPLETED' }
        } as any);
      }
    }
  } catch (err) {
    console.debug('Workout complete notification error:', err);
  }
}

// Silent Audio Track to keep Android/iOS audio session active in background & screen off
let silentAudioElement: HTMLAudioElement | null = null;
let silentAudioUrl: string | null = null;
let alarmAudioUrl: string | null = null;

function getAlarmAudioWavBlobUrl(): string {
  if (alarmAudioUrl) return alarmAudioUrl;
  try {
    const sampleRate = 16000;
    const duration = 1.8; // 1.8 seconds
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples);
    const view = new DataView(buffer);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + numSamples, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // fmt subchunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate, true);
    view.setUint16(32, 1, true);
    view.setUint16(34, 8, true); // 8-bit

    // data subchunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, numSamples, true);

    const bytes = new Uint8Array(buffer, 44, numSamples);
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let val = 0;

      // Pulse 1: 0.0 - 0.22s (880Hz)
      if (t >= 0 && t < 0.22) {
        val = 0.9 * Math.sin(2 * Math.PI * 880 * t);
      }
      // Pulse 2: 0.32 - 0.54s (880Hz)
      else if (t >= 0.32 && t < 0.54) {
        val = 0.9 * Math.sin(2 * Math.PI * 880 * (t - 0.32));
      }
      // Pulse 3: 0.64 - 1.50s (1318.5Hz - triumphant high E6 note with decay)
      else if (t >= 0.64 && t < 1.50) {
        const decay = Math.exp(-(t - 0.64) * 3);
        val = 0.95 * decay * Math.sin(2 * Math.PI * 1318.5 * (t - 0.64));
      }

      bytes[i] = Math.round(128 + val * 124);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    alarmAudioUrl = URL.createObjectURL(blob);
  } catch {
    alarmAudioUrl = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  }
  return alarmAudioUrl;
}

function getSilentAudioBlobUrl(): string {
  if (silentAudioUrl) return silentAudioUrl;
  try {
    const sampleRate = 8000;
    const numSamples = sampleRate; // 1 second of silence
    const buffer = new ArrayBuffer(44 + numSamples);
    const view = new DataView(buffer);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + numSamples, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // fmt subchunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate, true);
    view.setUint16(32, 1, true);
    view.setUint16(34, 8, true);

    // data subchunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, numSamples, true);

    // 8-bit PCM center value with 20Hz sub-audible carrier to prevent Qualcomm/MediaTek drivers on POCO from sleeping
    const bytes = new Uint8Array(buffer, 44, numSamples);
    for (let i = 0; i < numSamples; i++) {
      const angle = (2 * Math.PI * 20 * i) / sampleRate;
      bytes[i] = Math.round(128 + 2 * Math.sin(angle));
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    silentAudioUrl = URL.createObjectURL(blob);
  } catch {
    silentAudioUrl = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  }
  return silentAudioUrl;
}

export interface MediaSessionTimerParams {
  remainingSeconds: number;
  totalSeconds: number;
  exerciseName?: string;
  isPaused?: boolean;
}

export interface MediaSessionActionHandlers {
  onTogglePause?: () => void;
  onSkip?: () => void;
  onAddSeconds?: (seconds: number) => void;
  onReset?: () => void;
}

let registeredActionHandlers: MediaSessionActionHandlers | null = null;
let lastNotificationSentTime = 0;

export function registerMediaSessionActions(handlers: MediaSessionActionHandlers) {
  registeredActionHandlers = handlers;
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

  const safeSetHandler = (action: MediaSessionAction, fn: () => void) => {
    try {
      navigator.mediaSession.setActionHandler(action, fn);
    } catch {
      // Action not supported in this browser version
    }
  };

  safeSetHandler('play', () => {
    registeredActionHandlers?.onTogglePause?.();
  });
  safeSetHandler('pause', () => {
    registeredActionHandlers?.onTogglePause?.();
  });
  safeSetHandler('nexttrack', () => {
    registeredActionHandlers?.onSkip?.();
  });
  safeSetHandler('previoustrack', () => {
    registeredActionHandlers?.onReset?.();
  });
  safeSetHandler('seekforward', () => {
    registeredActionHandlers?.onAddSeconds?.(30);
  });
  safeSetHandler('seekbackward', () => {
    registeredActionHandlers?.onAddSeconds?.(-30);
  });
  safeSetHandler('stop', () => {
    registeredActionHandlers?.onSkip?.();
  });
}

export function updateMediaSessionTimer(params: MediaSessionTimerParams) {
  const { remainingSeconds, totalSeconds, exerciseName, isPaused = false } = params;

  if (typeof window === 'undefined') return;

  const timeFormatted = formatTimerDigits(remainingSeconds);
  const name = exerciseName || 'Descanso';

  // 1. Update Document Title
  if (remainingSeconds > 0) {
    document.title = `⏱️ ${timeFormatted} - ${name} | THUNDER`;
  } else {
    document.title = 'THUNDER | Musculação & Progressão de Carga';
  }

  // 2. Update MediaSession Lock Screen Widget
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `⏱️ ${timeFormatted} • ${name}`,
        artist: isPaused ? '⏸️ Cronômetro Pausado • THUNDER' : '⚡ THUNDER • Descanso Ativo',
        album: 'Cronômetro de Recuperação',
        artwork: [
          { src: '/favicon.svg', sizes: '96x96', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      });

      navigator.mediaSession.playbackState = isPaused ? 'paused' : 'playing';

      if ('setPositionState' in navigator.mediaSession && totalSeconds > 0) {
        const position = Math.max(0, Math.min(totalSeconds, totalSeconds - remainingSeconds));
        navigator.mediaSession.setPositionState({
          duration: Math.max(1, totalSeconds),
          playbackRate: isPaused ? 0 : 1,
          position
        });
      }
    } catch {
      // Ignore
    }
  }

  // 3. Update Service Worker Lock-Screen Ongoing Notification
  const now = Date.now();
  if (remainingSeconds > 0 && (now - lastNotificationSentTime >= 850 || isPaused)) {
    lastNotificationSentTime = now;
    postMessageToServiceWorker({
      type: 'UPDATE_REST_COUNTDOWN',
      remainingSeconds,
      totalSeconds,
      exerciseName: name,
      isPaused
    });
  }
}

export function startBackgroundAudioKeepAlive(
  exerciseName?: string,
  totalSeconds = 120,
  remainingSeconds = 120
) {
  try {
    if (typeof window === 'undefined') return;

    if (!silentAudioElement) {
      silentAudioElement = new Audio(getSilentAudioBlobUrl());
      silentAudioElement.loop = true;
      silentAudioElement.volume = 0.05; // Audible-level volume keeps Android/MIUI audio session active
      silentAudioElement.setAttribute('playsinline', 'true');
    }

    silentAudioElement.play().catch(() => {
      // Ignored if autoplay restricted
    });

    updateMediaSessionTimer({
      remainingSeconds,
      totalSeconds,
      exerciseName,
      isPaused: false
    });
  } catch {
    // Ignore
  }
}

// Keep audio session alive when screen turns off / hidden
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      try {
        if (silentAudioElement && !silentAudioElement.paused) {
          silentAudioElement.play().catch(() => {});
        }
      } catch {}
    }
  });
}

export function stopBackgroundAudioKeepAlive() {
  try {
    if (silentAudioElement) {
      silentAudioElement.pause();
      silentAudioElement.currentTime = 0;
    }
    if (typeof window !== 'undefined') {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
      document.title = 'THUNDER | Musculação & Progressão de Carga';
    }
    // Cancel active countdown notification in Service Worker
    postMessageToServiceWorker({
      type: 'CANCEL_REST_COUNTDOWN'
    });
  } catch {
    // Ignore
  }
}

// Sound & Haptic Alarm with Debounce Guard (prevent duplicate alarms)
let lastAlertTimestamp = 0;

export function triggerRestCompleteAlert(exerciseName?: string, soundEnabled = true, vibrationEnabled = true) {
  const now = Date.now();
  if (now - lastAlertTimestamp < 3500) {
    return; // Prevent duplicate rapid firing
  }
  lastAlertTimestamp = now;

  // 1. Hardware Audio Alarm via active Audio element (crucial for Android/POCO with screen off!)
  if (soundEnabled) {
    try {
      if (silentAudioElement) {
        silentAudioElement.loop = false;
        silentAudioElement.volume = 1.0;
        silentAudioElement.src = getAlarmAudioWavBlobUrl();
        silentAudioElement.play().catch(() => {});
      }
    } catch {}

    // Also fire Web Audio API synthesizer
    soundFx.resumeContext();
    soundFx.playTimerComplete();
  }

  // 2. Vibrate 3 Times (hardware motor + sub-bass acoustic rumble)
  if (vibrationEnabled) {
    triggerTripleVibration();
  }

  // 3. System Notification with vibration (essential for Android screen off / background)
  if (vibrationEnabled || soundEnabled) {
    sendTimerCompleteNotification(exerciseName);
  }

  // 4. Release screen wake lock & clean up background audio session after full persistent alarm pattern ends (4.5s)
  setTimeout(() => {
    stopBackgroundAudioKeepAlive();
    releaseScreenWakeLock();
  }, 4500);
}

// High-priority Web Worker for background heartbeat countdown
// Browsers throttle main-thread setInterval when hidden, but dedicated workers run in a separate OS thread
// This worker loop maintains high-frequency ticks (250ms) and continuously re-asserts Wake Lock and Keep-Alive
let workerInstance: Worker | null = null;

export function startBackgroundWorkerTimer(
  targetEndTimestamp: number,
  onTick: (remainingSeconds: number) => void,
  onComplete: () => void
) {
  stopBackgroundWorkerTimer();

  try {
    const workerScript = `
      var timer = null;
      var lastRemaining = -1;

      self.onmessage = function(e) {
        if (e.data.type === 'START') {
          if (timer) clearInterval(timer);
          var targetEnd = e.data.targetEnd;
          
          // High-frequency 250ms loop ensures continuous CPU priority and unthrottled countdown
          timer = setInterval(function() {
            var now = Date.now();
            var remaining = Math.max(0, Math.ceil((targetEnd - now) / 1000));
            
            self.postMessage({ type: 'TICK', remaining: remaining, timestamp: now });
            
            if (remaining <= 0) {
              clearInterval(timer);
              timer = null;
              self.postMessage({ type: 'COMPLETE' });
            }
          }, 250);
        } else if (e.data.type === 'STOP') {
          if (timer) clearInterval(timer);
          timer = null;
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerInstance = new Worker(workerUrl);

    workerInstance.onmessage = (e) => {
      if (e.data.type === 'TICK') {
        const remaining = e.data.remaining;

        // Ensure Wake Lock is held within this high-priority worker loop
        if (
          isWakeLockDesired &&
          typeof document !== 'undefined' &&
          document.visibilityState === 'visible' &&
          (!persistentWakeLockSentinel || persistentWakeLockSentinel.released)
        ) {
          requestScreenWakeLock().catch(() => {});
        }

        onTick(remaining);
      } else if (e.data.type === 'COMPLETE') {
        onComplete();
        stopBackgroundWorkerTimer();
      }
    };

    workerInstance.postMessage({
      type: 'START',
      targetEnd: targetEndTimestamp
    });
  } catch {
    // If Web Workers are blocked, fallback to timestamp interval in App.tsx
  }
}

export function stopBackgroundWorkerTimer() {
  if (workerInstance) {
    try {
      workerInstance.postMessage({ type: 'STOP' });
      workerInstance.terminate();
    } catch {
      // Ignore
    }
    workerInstance = null;
  }
}
