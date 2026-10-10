// THUNDER PWA Service Worker - Foreground Service-like persistent notification & vibration
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Enhanced persistent vibration pattern for Android & Xiaomi/POCO devices (HyperOS/MIUI)
// Total 4.0s of heavy high-contrast pulses to spin up hardware motors and penetrate pockets
const PERSISTENT_VIBRATION_PATTERN = [800, 250, 800, 250, 1000, 300, 1200];

// Foreground Service-like Active Timer State
let foregroundTimerState = {
  intervalId: null,
  resolvePromise: null,
  targetEndTimestamp: 0,
  totalSeconds: 0,
  exerciseName: 'Descanso',
  isPaused: false
};

// Helper to format mm:ss
function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Generate visual text progress bar for the lock screen notification body
function generateProgressBar(remaining, total) {
  if (!total || total <= 0) return '';
  const elapsed = Math.max(0, total - remaining);
  const ratio = Math.min(1, Math.max(0, elapsed / total));
  const percent = Math.round(ratio * 100);
  const totalBlocks = 8;
  const filledBlocks = Math.round(ratio * totalBlocks);
  const emptyBlocks = Math.max(0, totalBlocks - filledBlocks);
  const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  return `[${bar}] ${percent}%`;
}

// Close any active countdown notification
async function closeCountdownNotification() {
  try {
    const notifications = await self.registration.getNotifications({ tag: 'thunder-rest-countdown' });
    notifications.forEach((n) => n.close());
  } catch (e) {
    // Ignore
  }
}

// Broadcast message to all connected window clients
async function broadcastToClients(msg) {
  try {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach((c) => {
      try {
        c.postMessage(msg);
      } catch (e) {}
    });
  } catch (e) {
    // Ignore
  }
}

// Render persistent lock-screen notification (ongoing = foreground service on Android)
async function renderForegroundNotification(remainingSeconds, isPaused = false) {
  if (remainingSeconds <= 0) {
    await closeCountdownNotification();
    return;
  }

  const timeFormatted = formatTime(remainingSeconds);
  const name = foregroundTimerState.exerciseName || 'Descanso';
  const progressText = generateProgressBar(remainingSeconds, foregroundTimerState.totalSeconds);

  const title = `⏱️ ${timeFormatted} • ${name}`;
  const body = isPaused
    ? `⏸️ Descanso pausado em ${timeFormatted} • Toque para retomar`
    : `${progressText} • Próxima série em ${timeFormatted}`;

  try {
    await self.registration.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'thunder-rest-countdown', // Re-uses exact same slot silently in place
      renotify: false,              // Prevents noisy repeated alerts on 1-second ticks
      silent: true,                 // Silent tick
      requireInteraction: false,
      ongoing: true,                // Sticky notification: Android treats as foreground service
      actions: [
        { action: 'add30', title: '+30s' },
        { action: 'skip', title: 'Pular' }
      ],
      data: {
        url: '/',
        type: 'COUNTDOWN',
        remainingSeconds
      }
    });
  } catch (e) {
    // Ignore transient notification error
  }
}

// Stop the active foreground service interval
function stopForegroundService() {
  if (foregroundTimerState.intervalId) {
    clearInterval(foregroundTimerState.intervalId);
    foregroundTimerState.intervalId = null;
  }
  if (foregroundTimerState.resolvePromise) {
    foregroundTimerState.resolvePromise();
    foregroundTimerState.resolvePromise = null;
  }
}

// Start active 1-second foreground ticker inside Service Worker
function startForegroundService(targetEndTimestamp, totalSeconds, exerciseName) {
  stopForegroundService();

  const now = Date.now();
  const initialRemaining = Math.max(0, Math.ceil((targetEndTimestamp - now) / 1000));
  const finalTotal = totalSeconds || Math.max(initialRemaining, 1);

  foregroundTimerState.targetEndTimestamp = targetEndTimestamp;
  foregroundTimerState.totalSeconds = finalTotal;
  foregroundTimerState.exerciseName = exerciseName || 'Descanso';
  foregroundTimerState.isPaused = false;

  // Immediate initial render
  renderForegroundNotification(initialRemaining, false);

  return new Promise((resolve) => {
    foregroundTimerState.resolvePromise = resolve;

    // Active 1000ms loop running directly in the Service Worker thread
    // This tells Android OS the process has active foreground work and prevents CPU freezing
    foregroundTimerState.intervalId = setInterval(async () => {
      if (foregroundTimerState.isPaused) {
        return;
      }

      const currentNow = Date.now();
      const remaining = Math.max(0, Math.ceil((foregroundTimerState.targetEndTimestamp - currentNow) / 1000));

      if (remaining <= 0) {
        stopForegroundService();
        await closeCountdownNotification();

        // Trigger loud persistent alarm notification with vibration
        const title = '⚡ Descanso Concluído!';
        const name = foregroundTimerState.exerciseName || '';
        const body = name 
          ? `Hora da próxima série de ${name}! Bora pra cima!`
          : 'Seu tempo de descanso acabou. Hora da próxima série!';

        await self.registration.showNotification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          vibrate: PERSISTENT_VIBRATION_PATTERN,
          tag: 'thunder-rest-alarm-' + Date.now(),
          renotify: true,
          requireInteraction: true,
          silent: false,
          actions: [
            { action: 'open', title: 'Abrir Treino' }
          ],
          data: {
            url: '/',
            type: 'ALARM',
            exerciseName: name
          }
        });

        // Broadcast completion to all open client windows
        broadcastToClients({ type: 'REST_TIMER_COMPLETED', exerciseName: name });
        return;
      }

      // Update persistent notification every second
      await renderForegroundNotification(remaining, false);

      // Broadcast tick & ensure wake lock to client windows
      broadcastToClients({
        type: 'REST_TIMER_TICK',
        remainingSeconds: remaining,
        totalSeconds: foregroundTimerState.totalSeconds,
        exerciseName: foregroundTimerState.exerciseName
      });
      broadcastToClients({ type: 'ENSURE_WAKE_LOCK' });
    }, 1000);
  });
}

// High-priority Push Event Listener
self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || '⚡ THUNDER: Descanso Concluído!';
  const exerciseName = data.exerciseName || '';
  const body = data.body || (exerciseName 
    ? `Hora da próxima série de ${exerciseName}! Bora pra cima!`
    : 'Seu tempo de descanso acabou. Hora da próxima série!');

  const notifTag = 'thunder-rest-alarm-' + Date.now();
  const options = {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: PERSISTENT_VIBRATION_PATTERN,
    tag: notifTag,
    renotify: true,
    requireInteraction: true,
    silent: false,
    actions: [
      { action: 'open', title: 'Abrir Treino' }
    ],
    data: {
      url: '/',
      type: 'ALARM',
      exerciseName
    }
  };

  const pushPromise = (async () => {
    stopForegroundService();
    await closeCountdownNotification();
    await self.registration.showNotification(title, options);
    broadcastToClients({ type: 'REST_TIMER_COMPLETED', exerciseName });
    broadcastToClients({ type: 'ENSURE_WAKE_LOCK' });
  })();

  event.waitUntil(pushPromise);
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Re-assert persistent Screen Wake Lock in client windows on timer messages
  if (event.data.type === 'SCHEDULE_REST_TIMER' || event.data.type === 'UPDATE_REST_COUNTDOWN') {
    if (event.source && event.source.postMessage) {
      try {
        event.source.postMessage({ type: 'ENSURE_WAKE_LOCK' });
      } catch (e) {}
    }
  }

  // 1. Update Live Lock-Screen Countdown Notification from Window
  if (event.data.type === 'UPDATE_REST_COUNTDOWN') {
    const { remainingSeconds, totalSeconds, exerciseName, isPaused } = event.data;

    if (remainingSeconds <= 0) {
      stopForegroundService();
      event.waitUntil(closeCountdownNotification());
      return;
    }

    if (totalSeconds) foregroundTimerState.totalSeconds = totalSeconds;
    if (exerciseName) foregroundTimerState.exerciseName = exerciseName;
    foregroundTimerState.isPaused = !!isPaused;

    if (!isPaused) {
      foregroundTimerState.targetEndTimestamp = Date.now() + remainingSeconds * 1000;
    }

    event.waitUntil(renderForegroundNotification(remainingSeconds, isPaused));
    return;
  }

  // 2. Cancel Countdown Notification
  if (event.data.type === 'CANCEL_REST_COUNTDOWN' || event.data.type === 'CANCEL_REST_TIMER') {
    stopForegroundService();
    event.waitUntil(closeCountdownNotification());
    return;
  }

  // 3. Schedule / Start Foreground Service Rest Timer
  if (event.data.type === 'SCHEDULE_REST_TIMER') {
    const { targetEndTimestamp, exerciseName, totalSeconds } = event.data;
    const timerPromise = startForegroundService(targetEndTimestamp, totalSeconds, exerciseName);
    event.waitUntil(timerPromise);
    return;
  }

  // 4. Explicit Alert Notification
  if (event.data.type === 'SHOW_TIMER_NOTIFICATION') {
    const title = event.data.title || '⚡ Descanso Concluído!';
    const exerciseName = event.data.exerciseName || '';
    const body = event.data.body || (exerciseName 
      ? `Hora da próxima série de ${exerciseName}! Bora pra cima!`
      : 'Seu tempo de descanso acabou. Hora da próxima série!');

    const notifTag = 'thunder-rest-alarm-' + Date.now();
    const options = {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: PERSISTENT_VIBRATION_PATTERN,
      tag: notifTag,
      renotify: true,
      requireInteraction: true,
      silent: false,
      actions: [
        { action: 'open', title: 'Abrir Treino' }
      ],
      data: {
        url: '/',
        type: 'ALARM'
      }
    };

    event.waitUntil(
      (async () => {
        stopForegroundService();
        await closeCountdownNotification();
        await self.registration.showNotification(title, options);
      })()
    );
    return;
  }

  // 5. Native Push Notification for Finished Workout (via Service Worker)
  if (event.data.type === 'WORKOUT_COMPLETED_NOTIFICATION') {
    const title = event.data.title || '🏆 Treino Concluído com Sucesso!';
    const body = event.data.body || 'Parabéns pelo treino de hoje! Excelente trabalho e evolução constante!';

    const notifTag = 'thunder-workout-finish-' + Date.now();
    const options = {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      vibrate: [350, 150, 350, 150, 600],
      tag: notifTag,
      renotify: true,
      requireInteraction: true,
      silent: false,
      actions: [
        { action: 'open', title: 'Ver Histórico' }
      ],
      data: {
        url: '/',
        type: 'WORKOUT_COMPLETED',
        details: event.data.details
      }
    };

    event.waitUntil(
      (async () => {
        stopForegroundService();
        await closeCountdownNotification();
        await self.registration.showNotification(title, options);
        broadcastToClients({ type: 'WORKOUT_NOTIFICATION_DISPATCHED' });
      })()
    );
    return;
  }
});

// Handle clicks on notification & notification action buttons (+30s, Pular)
self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notif = event.notification;

  if (action === 'skip') {
    notif.close();
    stopForegroundService();
    event.waitUntil(
      (async () => {
        await closeCountdownNotification();
        await broadcastToClients({ type: 'TIMER_ACTION_SKIP' });
      })()
    );
    return;
  }

  if (action === 'add30') {
    event.waitUntil(
      (async () => {
        // Extend Service Worker internal foreground timer by 30 seconds
        if (foregroundTimerState.intervalId) {
          foregroundTimerState.targetEndTimestamp += 30000;
          foregroundTimerState.totalSeconds += 30;
          const now = Date.now();
          const rem = Math.max(0, Math.ceil((foregroundTimerState.targetEndTimestamp - now) / 1000));
          await renderForegroundNotification(rem, foregroundTimerState.isPaused);
        }
        await broadcastToClients({ type: 'TIMER_ACTION_ADD_SECONDS', seconds: 30 });
      })()
    );
    return;
  }

  // Default click: Close notification and bring app to foreground
  notif.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
