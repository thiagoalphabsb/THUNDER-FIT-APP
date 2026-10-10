import { CompletedWorkout, Exercise, Routine, UserProfile, ActiveWorkoutSession, CardioSession } from '../types';
import { INITIAL_EXERCISES } from '../data/exercisesData';
import { DEFAULT_ROUTINES } from '../data/defaultRoutines';
import { INITIAL_HISTORY } from '../data/initialHistory';

const STORAGE_KEYS = {
  EXERCISES: 'thunder_exercises_v1',
  ROUTINES: 'thunder_routines_v1',
  HISTORY: 'thunder_history_v1',
  ACTIVE_WORKOUT: 'thunder_active_workout_v1',
  PROFILE: 'thunder_profile_v1',
  CARDIO: 'thunder_cardio_sessions_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Atleta Thunder',
  weightKg: 78,
  weeklyGoalWorkouts: 4,
  defaultRestSeconds: 120,
  soundEnabled: true,
  vibrationEnabled: true,
  autoStartTimer: true,
  keepScreenAwake: true,
  useNativeClockTimer: false,
  themeMode: 'dark',
  themeColor: 'tiffany'
};

export function loadExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (!raw) {
      saveExercises(INITIAL_EXERCISES);
      return INITIAL_EXERCISES;
    }
    const parsed: Exercise[] = JSON.parse(raw);
    const existingIds = new Set(parsed.map((e) => e.id));
    const missingBase = INITIAL_EXERCISES.filter((e) => !existingIds.has(e.id));
    if (missingBase.length > 0) {
      const merged = [...parsed, ...missingBase];
      saveExercises(merged);
      return merged;
    }
    return parsed;
  } catch {
    return INITIAL_EXERCISES;
  }
}

export function saveExercises(exercises: Exercise[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  } catch (e) {
    console.error('Failed to save exercises', e);
  }
}

export function loadRoutines(): Routine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (!raw) {
      saveRoutines(DEFAULT_ROUTINES);
      return DEFAULT_ROUTINES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ROUTINES;
  }
}

export function saveRoutines(routines: Routine[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  } catch (e) {
    console.error('Failed to save routines', e);
  }
}

export function loadHistory(): CompletedWorkout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      saveHistory([]);
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHistory(history: CompletedWorkout[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function loadActiveWorkout(): ActiveWorkoutSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveWorkout(active: ActiveWorkoutSession | null) {
  try {
    if (active === null) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(active));
    }
  } catch (e) {
    console.error('Failed to save active workout', e);
  }
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadCardioSessions(): CardioSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARDIO);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCardioSessions(sessions: CardioSession[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDIO, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save cardio sessions', e);
  }
}

export function exportBackupJSON(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile: loadProfile(),
    exercises: loadExercises(),
    routines: loadRoutines(),
    history: loadHistory(),
    cardio: loadCardioSessions()
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    if (typeof jsonStr !== 'string' || jsonStr.trim().length === 0) {
      return false;
    }
    // Limit max backup size to 10MB to avoid local storage quota exhaustion attacks
    if (jsonStr.length > 10 * 1024 * 1024) {
      console.warn('Backup file exceeds maximum allowed size (10MB)');
      return false;
    }

    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return false;
    }

    if (Array.isArray(parsed.exercises)) {
      const validExercises = parsed.exercises.filter(
        (e: any) => e && typeof e === 'object' && typeof e.id === 'string' && typeof e.name === 'string'
      );
      if (validExercises.length > 0) {
        saveExercises(validExercises);
      }
    }

    if (Array.isArray(parsed.routines)) {
      const validRoutines = parsed.routines.filter(
        (r: any) => r && typeof r === 'object' && typeof r.id === 'string' && typeof r.name === 'string'
      );
      if (validRoutines.length > 0) {
        saveRoutines(validRoutines);
      }
    }

    if (Array.isArray(parsed.history)) {
      const validHistory = parsed.history.filter(
        (h: any) => h && typeof h === 'object' && typeof h.id === 'string'
      );
      saveHistory(validHistory);
    }

    if (Array.isArray(parsed.cardio)) {
      const validCardio = parsed.cardio.filter(
        (c: any) => c && typeof c === 'object' && typeof c.id === 'string'
      );
      saveCardioSessions(validCardio);
    }

    if (parsed.profile && typeof parsed.profile === 'object' && !Array.isArray(parsed.profile)) {
      const p = parsed.profile;
      saveProfile({
        name: typeof p.name === 'string' ? p.name.slice(0, 60) : DEFAULT_PROFILE.name,
        weightKg: typeof p.weightKg === 'number' && !isNaN(p.weightKg) ? Math.max(20, Math.min(350, p.weightKg)) : DEFAULT_PROFILE.weightKg,
        weeklyGoalWorkouts: typeof p.weeklyGoalWorkouts === 'number' && !isNaN(p.weeklyGoalWorkouts) ? Math.max(1, Math.min(14, p.weeklyGoalWorkouts)) : DEFAULT_PROFILE.weeklyGoalWorkouts,
        defaultRestSeconds: typeof p.defaultRestSeconds === 'number' && !isNaN(p.defaultRestSeconds) ? Math.max(5, Math.min(900, p.defaultRestSeconds)) : DEFAULT_PROFILE.defaultRestSeconds,
        soundEnabled: typeof p.soundEnabled === 'boolean' ? p.soundEnabled : DEFAULT_PROFILE.soundEnabled,
        vibrationEnabled: typeof p.vibrationEnabled === 'boolean' ? p.vibrationEnabled : DEFAULT_PROFILE.vibrationEnabled,
        autoStartTimer: typeof p.autoStartTimer === 'boolean' ? p.autoStartTimer : DEFAULT_PROFILE.autoStartTimer,
        keepScreenAwake: typeof p.keepScreenAwake === 'boolean' ? p.keepScreenAwake : DEFAULT_PROFILE.keepScreenAwake
      });
    }

    return true;
  } catch (err) {
    console.error('Error importing backup:', err);
    return false;
  }
}

export function resetAllDataToDemo() {
  saveExercises(INITIAL_EXERCISES);
  saveRoutines(DEFAULT_ROUTINES);
  saveHistory([]);
  saveCardioSessions([]);
  saveProfile(DEFAULT_PROFILE);
  saveActiveWorkout(null);
}
