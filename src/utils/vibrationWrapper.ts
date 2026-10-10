// Enhanced Vibration API Wrapper for Android & Xiaomi/POCO Devices (THUNDER)
// Solves Android Chromium restrictions, driver throttling, pattern dropping & screen-off blocks

import { soundFx } from './audio';

export interface VibrationOptions {
  /** If true, fires the sub-bass acoustic haptic rumble alongside the hardware motor */
  soundHaptic?: boolean;
  /** Fallback to chained single-pulse vibrations if array pattern returns false */
  fallbackToDiscrete?: boolean;
  /** Repeat count for persistent loop */
  loopCount?: number;
  /** Interval in ms between loop repetitions */
  loopIntervalMs?: number;
}

/**
 * Long, persistent multi-burst vibration pattern specifically engineered for Android / POCO / Xiaomi.
 * Mid-range and linear resonant actuators (LRA / ERM) require initial pulse momentum (800ms)
 * to spin up inside pockets and gym shorts, followed by high-contrast pauses and an escalating crescendo.
 * Total pattern duration: 4.0 seconds
 */
export const PERSISTENT_ALARM_PATTERN = [800, 250, 800, 250, 1000, 300, 1200];

/**
 * Extended triple pulse pattern: 600ms on, 200ms off, 600ms on, 200ms off, 800ms on (2.4s total)
 */
export const EXTENDED_ALERT_PATTERN = [600, 200, 600, 200, 800];

/**
 * Single long heavy pulse (1000ms)
 */
export const HEAVY_SINGLE_PATTERN = [1000];

class EnhancedVibrationManager {
  private activeLoopTimer: any = null;
  private isLoopRunning = false;
  private pendingDeferredVibration: number[] | null = null;
  private visibilityListenerAttached = false;

  constructor() {
    this.initVisibilityListener();
  }

  /**
   * Listen for document visibility changes:
   * Chromium intentionally blocks `navigator.vibrate` when the document is hidden/screen off.
   * If an alarm triggered while hidden, we register it to fire the exact millisecond the user wakes the screen.
   */
  private initVisibilityListener() {
    if (typeof window === 'undefined' || this.visibilityListenerAttached) return;
    this.visibilityListenerAttached = true;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.pendingDeferredVibration) {
        const patternToRun = this.pendingDeferredVibration;
        this.pendingDeferredVibration = null;
        // Small delay to ensure browser thread has fully unlocked the haptic channel
        setTimeout(() => {
          this.vibratePattern(patternToRun, { soundHaptic: true, fallbackToDiscrete: true });
        }, 80);
      }
    });
  }

  /**
   * Check if Vibration API is available in current browser environment
   */
  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'navigator' in window &&
      'vibrate' in navigator &&
      typeof navigator.vibrate === 'function'
    );
  }

  /**
   * Stop any active vibration loop or continuous pulses
   */
  public cancel(): void {
    this.isLoopRunning = false;
    if (this.activeLoopTimer) {
      clearTimeout(this.activeLoopTimer);
      clearInterval(this.activeLoopTimer);
      this.activeLoopTimer = null;
    }
    this.pendingDeferredVibration = null;

    if (this.isSupported()) {
      try {
        navigator.vibrate(0);
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Quick trigger helper accepting single number or array pattern
   */
  public trigger(pattern: number | number[] = 200, options: VibrationOptions = {}): boolean {
    const arrayPattern = Array.isArray(pattern) ? pattern : [pattern];
    return this.vibratePattern(arrayPattern, options);
  }

  /**
   * Execute an enhanced vibration pattern with automatic fallbacks and sub-bass haptics
   */
  public vibratePattern(
    pattern: number[] = PERSISTENT_ALARM_PATTERN,
    options: VibrationOptions = {}
  ): boolean {
    const { soundHaptic = true, fallbackToDiscrete = true } = options;

    // 1. Acoustic Sub-Bass Chassis Rumble (physical speaker diaphragm vibration)
    // Works reliably across ALL platforms (iOS, Android, POCO) even when hardware motor is gated
    if (soundHaptic) {
      try {
        soundFx.playHapticRumble();
      } catch {
        // Ignore
      }
    }

    // 2. If screen is off/hidden, queue deferred execution for the moment the screen lights up
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      this.pendingDeferredVibration = pattern;
    }

    // 3. Hardware motor call
    if (!this.isSupported()) {
      return false;
    }

    try {
      // Primary: standard array pattern
      const success = navigator.vibrate(pattern);

      // If Android ROM (Xiaomi HyperOS / Samsung / Huawei) returns false for multi-element array,
      // fallback to discrete single-pulse timers to ensure motor physically activates
      if (!success && fallbackToDiscrete) {
        this.executeDiscreteFallback(pattern);
        return true;
      }

      return success;
    } catch {
      if (fallbackToDiscrete) {
        this.executeDiscreteFallback(pattern);
        return true;
      }
      return false;
    }
  }

  /**
   * Fallback for custom Android ROMs where array vibration signatures are blocked by the OS driver.
   * Dispatches discrete single pulses spaced by silence intervals.
   */
  private executeDiscreteFallback(pattern: number[]) {
    if (!this.isSupported()) return;

    let cumulativeDelay = 0;
    for (let i = 0; i < pattern.length; i += 2) {
      const pulseDuration = pattern[i];
      const pauseDuration = pattern[i + 1] || 0;

      const delay = cumulativeDelay;
      setTimeout(() => {
        try {
          if (this.isSupported()) {
            navigator.vibrate(pulseDuration);
          }
        } catch {
          // Ignore
        }
      }, delay);

      cumulativeDelay += pulseDuration + pauseDuration;
    }
  }

  /**
   * Start a persistent, repeating vibration loop until user dismisses it or max duration is reached.
   * Essential for deep sleeper gym sessions and noisy fitness environments.
   *
   * @param pattern The pulse pattern to repeat (default: PERSISTENT_ALARM_PATTERN)
   * @param maxDurationMs Maximum duration in ms (default: 8000ms = 8 seconds)
   */
  public startPersistentLoop(
    pattern: number[] = PERSISTENT_ALARM_PATTERN,
    maxDurationMs = 8000
  ): void {
    this.cancel();
    this.isLoopRunning = true;

    // Calculate total duration of one pattern cycle
    const patternDuration = pattern.reduce((acc, val) => acc + val, 0);
    const loopInterval = Math.max(patternDuration + 300, 2500);

    // Initial blast
    this.vibratePattern(pattern, { soundHaptic: true, fallbackToDiscrete: true });

    const startTime = Date.now();

    this.activeLoopTimer = setInterval(() => {
      if (!this.isLoopRunning || Date.now() - startTime >= maxDurationMs) {
        this.cancel();
        return;
      }

      this.vibratePattern(pattern, { soundHaptic: true, fallbackToDiscrete: true });
    }, loopInterval);
  }
}

// Export singleton instance
export const vibration = new EnhancedVibrationManager();
