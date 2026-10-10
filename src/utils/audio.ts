// Audio synthesizer using Web Audio API for timer and PR celebrations
class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play short soft tick for countdown (3, 2, 1)
  playTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore audio failure
    }
  }

  // Ensure audio context is ready on user interaction
  resumeContext() {
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {
      // Ignore
    }
  }

  // Play vibrant 3-stage alarm chime when rest timer completes (cuts through background)
  playTimerComplete() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // 3 punchy, resonant alert pulses
      const pulses = [
        { time: now, freq1: 659.25, freq2: 880 },        // E5 -> A5
        { time: now + 0.26, freq1: 659.25, freq2: 880 }, // E5 -> A5
        { time: now + 0.52, freq1: 880, freq2: 1318.51 } // A5 -> E6 (Triumph chord)
      ];

      pulses.forEach(({ time, freq1, freq2 }, idx) => {
        // Main Tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = idx === 2 ? 'triangle' : 'sine';
        osc1.frequency.setValueAtTime(freq1, time);
        osc1.frequency.exponentialRampToValueAtTime(freq2, time + 0.12);
        gain1.gain.setValueAtTime(0.35, time);
        gain1.gain.exponentialRampToValueAtTime(0.001, time + (idx === 2 ? 0.6 : 0.22));

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(time);
        osc1.stop(time + (idx === 2 ? 0.6 : 0.22));

        // Harmonic Tone for richness
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq2 * 1.25, time);
        gain2.gain.setValueAtTime(0.15, time);
        gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(time);
        osc2.stop(time + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  // Play triumph fanfare for PR or Workout Finish
  playCelebration() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const startTime = ctx.currentTime + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {
      // Ignore
    }
  }

  // Play quick pleasant tap sound when completing a set
  playSetComplete() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.09);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore
    }
  }

  // Play pleasant upward affirmative tone for saves/exports
  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  // Deep tactile sub-bass acoustic pulse (vibrates phone speaker coil/chassis physically)
  // Essential for iOS (where Safari disables navigator.vibrate) and as haptic reinforcement
  playHapticRumble() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      // 3 distinct bass punch waves matching the 3 vibration pulses
      [0, 0.45, 0.90].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 55Hz sub-bass square/triangle wave physically vibrates device speakers
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(58, now + offset);
        osc.frequency.exponentialRampToValueAtTime(36, now + offset + 0.32);

        gain.gain.setValueAtTime(0.9, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // Trigger device vibration if supported
  vibrate(pattern: number | number[] = [100, 50, 150]) {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore
    }
  }

  // Vibrate exactly 3 times with solid pulses without self-cancelling
  vibrateThreeTimes(): boolean {
    try {
      // Always play physical acoustic sub-bass rumble
      this.playHapticRumble();

      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        // Standard Android 3-pulse pattern: 350ms vibration, 150ms rest
        const didVibrate = navigator.vibrate([350, 150, 350, 150, 350]);
        if (didVibrate) return true;
        // Fallback to single pulse if array pattern was rejected
        return navigator.vibrate(400);
      }
    } catch {
      // Ignore
    }
    return false;
  }
}

export const soundFx = new SoundEffects();
