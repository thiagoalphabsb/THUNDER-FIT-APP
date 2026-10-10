import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ThunderLogo } from './components/ThunderLogo';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { RoutinesView } from './components/RoutinesView';
import { ProgressView } from './components/ProgressView';
import { ExercisesView } from './components/ExercisesView';
import { ProfileView } from './components/ProfileView';
import { HistoryView } from './components/HistoryView';
import { ActiveWorkout } from './components/ActiveWorkout';
import { RestTimerOverlay } from './components/RestTimerOverlay';
import { WorkoutCompleteModal } from './components/WorkoutCompleteModal';
import { QuickAddExerciseModal } from './components/QuickAddExerciseModal';
import { 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  RefreshCw, 
  User as UserIcon, 
  ArrowLeft,
  LogIn,
  Sun,
  Moon
} from 'lucide-react';

import {
  ActiveWorkoutSession,
  CompletedWorkout,
  Exercise,
  PRRecord,
  RestTimerState,
  Routine,
  UserProfile,
  WorkoutExercise,
  ExerciseSet,
  CardioSession
} from './types';

import {
  exportBackupJSON,
  importBackupJSON,
  loadActiveWorkout,
  loadExercises,
  loadHistory,
  loadProfile,
  loadRoutines,
  loadCardioSessions,
  saveCardioSessions,
  resetAllDataToDemo,
  saveActiveWorkout,
  saveExercises,
  saveHistory,
  saveProfile,
  saveRoutines,
  DEFAULT_PROFILE
} from './utils/storage';

import { autoHealRoutines, getExerciseDisplayName } from './utils/routineTransfer';
import { 
  applyTheme, 
  getStoredThemeMode, 
  getStoredThemeColor, 
  THEME_COLOR_PRESETS,
  type ThemeMode
} from './utils/theme';

import {
  calculateCompletedSetsCount,
  calculateTotalReps,
  calculateTotalVolume,
  calculateTotalIsometricSeconds,
  isIsometricExercise,
  calculateEstimatedCalories,
  detectNewPersonalRecords,
  getPreviousPerformance
} from './utils/calc';

import { soundFx } from './utils/audio';
import {
  registerServiceWorker,
  requestTimerNotificationPermission,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  startBackgroundWorkerTimer,
  stopBackgroundWorkerTimer,
  triggerRestCompleteAlert,
  startBackgroundAudioKeepAlive,
  stopBackgroundAudioKeepAlive,
  scheduleServiceWorkerRestTimer,
  cancelServiceWorkerRestTimer,
  updateMediaSessionTimer,
  registerMediaSessionActions,
  openNativePhoneTimer,
  sendWorkoutCompleteNotification
} from './utils/backgroundTimer';

import {
  auth,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type User
} from './lib/firebase';

import {
  subscribeToUserProfile,
  saveUserProfileToCloud,
  subscribeToWorkouts,
  saveWorkoutToCloud,
  deleteWorkoutFromCloud,
  subscribeToRoutines,
  saveRoutineToCloud,
  saveRoutinesOrderToCloud,
  deleteRoutineFromCloud,
  subscribeToCustomExercises,
  saveCustomExerciseToCloud,
  subscribeToActiveSession,
  saveActiveSessionToCloud,
  initializeUserDataOnCloud
} from './services/dbService';

export default function App() {
  // Authentication & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Application Data State (initialized from local storage, synced with Firestore)
  const [exercises, setExercises] = useState<Exercise[]>(() => loadExercises());
  const [history, setHistory] = useState<CompletedWorkout[]>(() => loadHistory());
  const [routines, setRoutines] = useState<Routine[]>(() =>
    autoHealRoutines(loadRoutines(), loadExercises())
  );
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [cardioSessions, setCardioSessions] = useState<CardioSession[]>(() => loadCardioSessions());
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutSession | null>(() =>
    loadActiveWorkout()
  );

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<TabType | 'history'>('home');
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [pendingPRs, setPendingPRs] = useState<PRRecord[]>([]);

  // Rest Timer State
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    isPaused: false,
    totalSeconds: 120,
    remainingSeconds: 120,
    exerciseName: 'Descanso'
  });
  const [isTimerMinimized, setIsTimerMinimized] = useState(false);

  // Active Theme Accent Color Hex (derived from profile or presets)
  const activeAccentHex = useMemo(() => {
    const colorId = profile.themeColor || getStoredThemeColor();
    const preset = THEME_COLOR_PRESETS.find((p) => p.id === colorId);
    return preset ? preset.hex : '#00D1C1';
  }, [profile.themeColor]);

  // Apply Theme Mode and Color whenever profile or preferences update
  useEffect(() => {
    const mode = profile.themeMode || getStoredThemeMode();
    const color = profile.themeColor || getStoredThemeColor();
    applyTheme(mode, color);
  }, [profile.themeMode, profile.themeColor]);

  // Ref to prevent initial overwrite loops
  const isCloudLoadedRef = useRef(false);

  // 1. Firebase Auth listener & auto-guest login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsSyncing(false);
      } else {
        // Auto sign in anonymously so there is ALWAYS a valid user & Firestore connection
        try {
          setIsSyncing(true);
          const cred = await signInAnonymously(auth);
          setCurrentUser(cred.user);
        } catch (err: any) {
          console.warn('Anonymous sign in error, fallback to local storage:', err);
          setSyncError('Conectando em modo local...');
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Register Service Worker
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // 2. Real-time Firestore Subscriptions when currentUser is available
  useEffect(() => {
    if (!currentUser) return;
    const userId = currentUser.uid;
    setIsSyncing(true);

    // Initialize cloud data if empty (default routines & profile, history remains clean at 0)
    initializeUserDataOnCloud(userId, routines, profile)
      .catch((e) => console.warn('Cloud initial seed notice:', e));

    // If user has a Google display name and profile is still default, update profile name
    if (currentUser.displayName && profile.name === DEFAULT_PROFILE.name) {
      const updatedProfile = { ...profile, name: currentUser.displayName };
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
      saveUserProfileToCloud(userId, updatedProfile).catch(() => {});
    }

    // Subscribe to User Profile
    const unsubProfile = subscribeToUserProfile(
      userId,
      (cloudProfile) => {
        if (cloudProfile) {
          setProfile(cloudProfile);
          saveProfile(cloudProfile);
        }
      },
      (err) => setSyncError('Erro ao sincronizar perfil')
    );

    // Subscribe to Workouts (History) - starts at 0 for new users
    const unsubWorkouts = subscribeToWorkouts(
      userId,
      (cloudWorkouts) => {
        setHistory(cloudWorkouts);
        saveHistory(cloudWorkouts);
        setIsSyncing(false);
      },
      (err) => setSyncError('Erro ao sincronizar histórico')
    );

    // Subscribe to Routines
    const unsubRoutines = subscribeToRoutines(
      userId,
      (cloudRoutines) => {
        if (cloudRoutines.length > 0) {
          const healed = autoHealRoutines(cloudRoutines, exercises, history);
          setRoutines(healed);
          saveRoutines(healed);

          // Check if any routines were healed and need cloud persistence
          healed.forEach((r, idx) => {
            const raw = cloudRoutines[idx];
            if (raw && JSON.stringify(raw.exercises) !== JSON.stringify(r.exercises)) {
              saveRoutineToCloud(userId, r).catch(() => {});
            }
          });
        }
        setIsSyncing(false);
      },
      (err) => setSyncError('Erro ao sincronizar rotinas')
    );

    // Subscribe to Custom Exercises
    const unsubExercises = subscribeToCustomExercises(
      userId,
      (customExs) => {
        setExercises((prev) => {
          const customMap = new Map<string, Exercise>();
          const base = prev.filter((e) => !e.isCustom);
          // Keep existing local custom exercises
          prev.filter((e) => e.isCustom).forEach((e) => customMap.set(e.id, e));
          // Merge cloud custom exercises
          customExs.forEach((e) => customMap.set(e.id, e));

          const merged = [...Array.from(customMap.values()), ...base];
          saveExercises(merged);
          return merged;
        });
      },
      (err) => setSyncError('Erro ao sincronizar exercícios')
    );

    // Subscribe to Active In-Progress Session
    const unsubActive = subscribeToActiveSession(
      userId,
      (cloudSession) => {
        if (cloudSession && !activeWorkout) {
          setActiveWorkout(cloudSession);
          saveActiveWorkout(cloudSession);
        }
      },
      (err) => console.warn('Active session sync notice:', err)
    );

    isCloudLoadedRef.current = true;

    return () => {
      unsubProfile();
      unsubWorkouts();
      unsubRoutines();
      unsubExercises();
      unsubActive();
    };
  }, [currentUser?.uid]);

  // Auth actions
  const handleGoogleLogin = async () => {
    try {
      setIsSyncing(true);
      setSyncError(null);
      setHistory([]);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setSyncError('Falha no login com Google. Tente novamente.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      setHistory([]);
      setActiveWorkout(null);
      await signOut(auth);
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Rest Timer Ticker with timestamp precision & lock screen media sync
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (restTimer.isActive && !restTimer.isPaused && restTimer.remainingSeconds > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (!prev.isActive || prev.isPaused) return prev;

          let remaining = prev.remainingSeconds - 1;
          if (prev.targetEndTimestamp) {
            remaining = Math.max(0, Math.ceil((prev.targetEndTimestamp - Date.now()) / 1000));
          }

          if (remaining <= 0) {
            triggerRestCompleteAlert(
              prev.exerciseName,
              profile.soundEnabled ?? true,
              profile.vibrationEnabled ?? true
            );
            return {
              ...prev,
              remainingSeconds: 0,
              isActive: false
            };
          }

          // Live sync with Lock Screen Media Player widget & ongoing notification
          updateMediaSessionTimer({
            remainingSeconds: remaining,
            totalSeconds: prev.totalSeconds,
            exerciseName: prev.exerciseName,
            isPaused: false
          });

          return {
            ...prev,
            remainingSeconds: remaining
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [restTimer.isActive, restTimer.isPaused, restTimer.remainingSeconds, profile.soundEnabled, profile.vibrationEnabled]);

  // Synchronize timer and re-acquire screen wake lock when phone screen turns on or user returns
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      soundFx.resumeContext();
      if (document.visibilityState === 'visible') {
        if (restTimer.isActive && !restTimer.isPaused && profile.keepScreenAwake !== false) {
          requestScreenWakeLock().catch(() => {});
        }
        setRestTimer((prev) => {
          if (!prev.isActive || prev.isPaused || !prev.targetEndTimestamp) {
            return prev;
          }
          const now = Date.now();
          if (now >= prev.targetEndTimestamp) {
            triggerRestCompleteAlert(
              prev.exerciseName,
              profile.soundEnabled ?? true,
              profile.vibrationEnabled ?? true
            );
            return {
              ...prev,
              remainingSeconds: 0,
              isActive: false
            };
          }
          const remaining = Math.max(0, Math.ceil((prev.targetEndTimestamp - now) / 1000));
          updateMediaSessionTimer({
            remainingSeconds: remaining,
            totalSeconds: prev.totalSeconds,
            exerciseName: prev.exerciseName,
            isPaused: false
          });
          return {
            ...prev,
            remainingSeconds: remaining
          };
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [profile.soundEnabled, profile.vibrationEnabled, profile.keepScreenAwake, restTimer.isActive, restTimer.isPaused]);

  // Start a workout from a routine template
  const handleStartRoutine = (routine: Routine) => {
    const workoutExercises: WorkoutExercise[] = routine.exercises.map((template) => {
      const exerciseDetails = exercises.find((e) => e.id === template.exerciseId);
      const previousPerf = getPreviousPerformance(template.exerciseId, history);
      const isIso = template.isIsometric || exerciseDetails?.isIsometric || isIsometricExercise(template) || isIsometricExercise(exerciseDetails);

      const sets: ExerciseSet[] = [];
      for (let i = 1; i <= template.setsCount; i++) {
        const prevSet = previousPerf?.sets[i - 1];
        const weight = prevSet ? prevSet.weight : template.initialWeight || (isIso ? 0 : 20);
        const reps = prevSet ? (prevSet.holdSeconds || prevSet.reps) : template.targetReps || (isIso ? 45 : 10);

        sets.push({
          id: `set-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          setNumber: i,
          type: 'normal',
          weight,
          reps,
          completed: false,
          previousWeight: prevSet?.weight,
          previousReps: prevSet ? (prevSet.holdSeconds || prevSet.reps) : undefined,
          isIsometric: isIso,
          holdSeconds: isIso ? reps : undefined
        });
      }

      const exerciseName = getExerciseDisplayName(template, exercises);

      return {
        id: `we-${Date.now()}-${template.exerciseId}`,
        exerciseId: template.exerciseId,
        exerciseName,
        muscleGroup: exerciseDetails?.muscleGroup || 'Peito',
        equipment: exerciseDetails?.equipment || 'Halteres',
        restSeconds: template.restSeconds || profile.defaultRestSeconds || 120,
        notes: template.notes || '',
        sets,
        isIsometric: isIso
      };
    });

    const session: ActiveWorkoutSession = {
      id: `workout-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      exercises: workoutExercises
    };

    setActiveWorkout(session);
    saveActiveWorkout(session);
    if (currentUser?.uid) {
      saveActiveSessionToCloud(currentUser.uid, session).catch((e) =>
        console.warn('Failed to save active session to cloud', e)
      );
    }
    soundFx.playSetComplete();
  };

  // Start an empty quick workout
  const handleStartEmptyWorkout = () => {
    const session: ActiveWorkoutSession = {
      id: `workout-${Date.now()}`,
      routineName: 'Treino Rápido / Livre',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      exercises: []
    };
    setActiveWorkout(session);
    saveActiveWorkout(session);
    if (currentUser?.uid) {
      saveActiveSessionToCloud(currentUser.uid, session).catch((e) =>
        console.warn('Failed to save active session to cloud', e)
      );
    }
    soundFx.playSetComplete();
  };

  // Update active workout exercises in-progress
  const handleUpdateActiveExercises = (updated: WorkoutExercise[]) => {
    if (!activeWorkout) return;
    const newSession = { ...activeWorkout, exercises: updated };
    setActiveWorkout(newSession);
    saveActiveWorkout(newSession);
    if (currentUser?.uid) {
      saveActiveSessionToCloud(currentUser.uid, newSession).catch((e) =>
        console.warn('Failed to update active session in cloud', e)
      );
    }
  };

  // Trigger Rest Timer
  const handleTriggerRestTimer = (seconds: number, exerciseName: string) => {
    // 1. Pre-warm / unlock Web Audio API on this user interaction
    soundFx.resumeContext();

    // 2. Request Notification permission if not yet granted
    requestTimerNotificationPermission().catch(() => {});

    // 3. Keep screen awake while resting if configured
    if (profile.keepScreenAwake !== false) {
      requestScreenWakeLock().catch(() => {});
    }

    const now = Date.now();
    const targetEndTimestamp = now + seconds * 1000;

    // 4. Activate native background audio keep-alive & lock screen media player widget
    startBackgroundAudioKeepAlive(exerciseName, seconds, seconds);

    // 5. Schedule guaranteed lock-screen notification & vibration in Service Worker
    scheduleServiceWorkerRestTimer(targetEndTimestamp, exerciseName, seconds);

    // 5b. Synchronize with phone's native Clock app if user enabled it in settings
    if (profile.useNativeClockTimer) {
      openNativePhoneTimer(seconds, exerciseName);
    }

    setRestTimer({
      isActive: true,
      isPaused: false,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      exerciseName,
      startedAtTimestamp: now,
      targetEndTimestamp
    });
    setIsTimerMinimized(false);

    // 6. Start background web worker for unthrottled countdown even when app is hidden
    startBackgroundWorkerTimer(
      targetEndTimestamp,
      (remaining) => {
        setRestTimer((prev) => {
          if (!prev.isActive || prev.isPaused) return prev;
          updateMediaSessionTimer({
            remainingSeconds: remaining,
            totalSeconds: prev.totalSeconds,
            exerciseName: prev.exerciseName,
            isPaused: false
          });
          return { ...prev, remainingSeconds: remaining };
        });
      },
      () => {
        setRestTimer((prev) => {
          if (!prev.isActive) return prev;
          return {
            ...prev,
            remainingSeconds: 0,
            isActive: false
          };
        });
        triggerRestCompleteAlert(
          exerciseName,
          profile.soundEnabled ?? true,
          profile.vibrationEnabled ?? true
        );
      }
    );
  };

  // Timer controls
  const handleAddTimerSeconds = (secs: number) => {
    soundFx.resumeContext();
    setRestTimer((prev) => {
      const newTotal = Math.max(10, prev.totalSeconds + secs);
      const newRemaining = Math.max(0, prev.remainingSeconds + secs);
      const newTarget = Date.now() + newRemaining * 1000;

      if (prev.isActive && !prev.isPaused) {
        // Keep background audio active and update service worker schedule
        startBackgroundAudioKeepAlive(prev.exerciseName, newTotal, newRemaining);
        scheduleServiceWorkerRestTimer(newTarget, prev.exerciseName, newTotal);

        startBackgroundWorkerTimer(
          newTarget,
          (rem) => {
            setRestTimer((p) => {
              if (!p.isActive || p.isPaused) return p;
              updateMediaSessionTimer({
                remainingSeconds: rem,
                totalSeconds: p.totalSeconds,
                exerciseName: p.exerciseName,
                isPaused: false
              });
              return { ...p, remainingSeconds: rem };
            });
          },
          () => {
            setRestTimer((p) => ({ ...p, remainingSeconds: 0, isActive: false }));
            triggerRestCompleteAlert(prev.exerciseName, profile.soundEnabled ?? true, profile.vibrationEnabled ?? true);
          }
        );
      } else {
        updateMediaSessionTimer({
          remainingSeconds: newRemaining,
          totalSeconds: newTotal,
          exerciseName: prev.exerciseName,
          isPaused: prev.isPaused
        });
      }

      return {
        ...prev,
        totalSeconds: newTotal,
        remainingSeconds: newRemaining,
        targetEndTimestamp: newTarget
      };
    });
  };

  const handleToggleTimerPause = () => {
    soundFx.resumeContext();
    setRestTimer((prev) => {
      const isNowPaused = !prev.isPaused;
      if (isNowPaused) {
        stopBackgroundAudioKeepAlive();
        cancelServiceWorkerRestTimer();
        stopBackgroundWorkerTimer();
        releaseScreenWakeLock();
        updateMediaSessionTimer({
          remainingSeconds: prev.remainingSeconds,
          totalSeconds: prev.totalSeconds,
          exerciseName: prev.exerciseName,
          isPaused: true
        });
        return {
          ...prev,
          isPaused: true
        };
      } else {
        if (profile.keepScreenAwake !== false) {
          requestScreenWakeLock().catch(() => {});
        }
        const newTarget = Date.now() + prev.remainingSeconds * 1000;
        startBackgroundAudioKeepAlive(prev.exerciseName, prev.totalSeconds, prev.remainingSeconds);
        scheduleServiceWorkerRestTimer(newTarget, prev.exerciseName, prev.totalSeconds);

        startBackgroundWorkerTimer(
          newTarget,
          (rem) => {
            setRestTimer((p) => {
              if (!p.isActive || p.isPaused) return p;
              updateMediaSessionTimer({
                remainingSeconds: rem,
                totalSeconds: p.totalSeconds,
                exerciseName: p.exerciseName,
                isPaused: false
              });
              return { ...p, remainingSeconds: rem };
            });
          },
          () => {
            setRestTimer((p) => ({ ...p, remainingSeconds: 0, isActive: false }));
            triggerRestCompleteAlert(prev.exerciseName, profile.soundEnabled ?? true, profile.vibrationEnabled ?? true);
          }
        );
        return {
          ...prev,
          isPaused: false,
          targetEndTimestamp: newTarget
        };
      }
    });
  };

  const handleSkipTimer = () => {
    stopBackgroundAudioKeepAlive();
    cancelServiceWorkerRestTimer();
    stopBackgroundWorkerTimer();
    releaseScreenWakeLock();
    setRestTimer((prev) => ({
      ...prev,
      isActive: false,
      remainingSeconds: 0
    }));
  };

  const handleResetTimer = () => {
    soundFx.resumeContext();
    if (profile.keepScreenAwake !== false) {
      requestScreenWakeLock().catch(() => {});
    }
    const newTarget = Date.now() + restTimer.totalSeconds * 1000;

    startBackgroundAudioKeepAlive(restTimer.exerciseName, restTimer.totalSeconds, restTimer.totalSeconds);
    scheduleServiceWorkerRestTimer(newTarget, restTimer.exerciseName, restTimer.totalSeconds);

    startBackgroundWorkerTimer(
      newTarget,
      (rem) => {
        setRestTimer((p) => {
          if (!p.isActive || p.isPaused) return p;
          updateMediaSessionTimer({
            remainingSeconds: rem,
            totalSeconds: p.totalSeconds,
            exerciseName: p.exerciseName,
            isPaused: false
          });
          return { ...p, remainingSeconds: rem };
        });
      },
      () => {
        setRestTimer((p) => ({ ...p, remainingSeconds: 0, isActive: false }));
        triggerRestCompleteAlert(restTimer.exerciseName, profile.soundEnabled ?? true, profile.vibrationEnabled ?? true);
      }
    );
    setRestTimer((prev) => ({
      ...prev,
      remainingSeconds: prev.totalSeconds,
      targetEndTimestamp: newTarget,
      isPaused: false
    }));
  };

  // Register MediaSession lock-screen widget action handlers & Service Worker message listener
  useEffect(() => {
    registerMediaSessionActions({
      onTogglePause: handleToggleTimerPause,
      onSkip: handleSkipTimer,
      onAddSeconds: (secs) => handleAddTimerSeconds(secs),
      onReset: handleResetTimer
    });

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (!event.data) return;
        if (event.data.type === 'ENSURE_WAKE_LOCK' || event.data.type === 'REACQUIRE_WAKE_LOCK') {
          if (profile.keepScreenAwake !== false && restTimer.isActive && !restTimer.isPaused) {
            requestScreenWakeLock().catch(() => {});
          }
        } else if (event.data.type === 'REST_TIMER_TICK') {
          if (typeof event.data.remainingSeconds === 'number') {
            setRestTimer((prev) => {
              if (!prev.isActive || prev.isPaused) return prev;
              return {
                ...prev,
                remainingSeconds: event.data.remainingSeconds
              };
            });
          }
        } else if (event.data.type === 'REST_TIMER_COMPLETED') {
          setRestTimer((prev) => ({
            ...prev,
            remainingSeconds: 0,
            isActive: false
          }));
        } else if (event.data.type === 'TIMER_ACTION_SKIP') {
          handleSkipTimer();
        } else if (event.data.type === 'TIMER_ACTION_ADD_SECONDS') {
          handleAddTimerSeconds(event.data.seconds || 30);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, [restTimer.isActive, restTimer.isPaused, restTimer.remainingSeconds, restTimer.totalSeconds, restTimer.exerciseName]);

  // Add Exercise to Active Workout
  const handleSelectExerciseForActiveWorkout = (exercise: Exercise) => {
    if (!activeWorkout) return;

    const previousPerf = getPreviousPerformance(exercise.id, history, exercise.name);
    const isIso = exercise.isIsometric || isIsometricExercise(exercise);
    const setsCount = 3;
    const sets: ExerciseSet[] = [];

    for (let i = 1; i <= setsCount; i++) {
      const prevSet = previousPerf?.sets[i - 1];
      const weight = prevSet ? prevSet.weight : (isIso ? 0 : 20);
      const reps = prevSet ? (prevSet.holdSeconds || prevSet.reps) : (isIso ? 45 : 10);

      sets.push({
        id: `set-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        setNumber: i,
        type: 'normal',
        weight,
        reps,
        completed: false,
        previousWeight: prevSet?.weight,
        previousReps: prevSet ? (prevSet.holdSeconds || prevSet.reps) : undefined,
        isIsometric: isIso,
        holdSeconds: isIso ? reps : undefined
      });
    }

    const newWorkoutEx: WorkoutExercise = {
      id: `we-${Date.now()}-${exercise.id}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      restSeconds: exercise.defaultRestSeconds || profile.defaultRestSeconds || (isIso ? 60 : 120),
      notes: '',
      sets,
      isIsometric: isIso
    };

    const newSession = {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newWorkoutEx]
    };
    setActiveWorkout(newSession);
    saveActiveWorkout(newSession);
    if (currentUser?.uid) {
      saveActiveSessionToCloud(currentUser.uid, newSession).catch((e) =>
        console.warn('Failed to sync added exercise to cloud', e)
      );
    }
  };

  // Open the finish modal
  const handleOpenFinishModal = () => {
    if (!activeWorkout) return;
    const prs = detectNewPersonalRecords(activeWorkout.exercises, history);
    setPendingPRs(prs);
    setIsFinishModalOpen(true);
  };

  // Confirm Finish and Save Workout
  const handleConfirmFinishWorkout = async (rating: number, notes: string) => {
    if (!activeWorkout) return;

    const startMs = new Date(activeWorkout.startedAt).getTime();
    const durationSeconds = Math.max(60, Math.floor((Date.now() - startMs) / 1000));

    const totalVolume = calculateTotalVolume(activeWorkout.exercises);
    const totalSets = calculateCompletedSetsCount(activeWorkout.exercises);
    const totalReps = calculateTotalReps(activeWorkout.exercises);
    const totalIsometricSeconds = calculateTotalIsometricSeconds(activeWorkout.exercises);
    const estimatedCalories = calculateEstimatedCalories(durationSeconds, totalVolume, profile.weightKg, totalIsometricSeconds);

    const completed: CompletedWorkout = {
      id: activeWorkout.id,
      routineId: activeWorkout.routineId,
      routineName: activeWorkout.routineName,
      startedAt: activeWorkout.startedAt,
      completedAt: new Date().toISOString(),
      durationSeconds,
      exercises: activeWorkout.exercises,
      totalVolumeKg: totalVolume,
      totalSets,
      totalReps,
      totalIsometricSeconds,
      personalRecords: pendingPRs,
      rating,
      notes,
      estimatedCalories
    };

    // Update routine lastPerformed date if matching
    if (activeWorkout.routineId) {
      const updatedRoutines = routines.map((r) =>
        r.id === activeWorkout.routineId
          ? { ...r, lastPerformed: new Date().toISOString() }
          : r
      );
      setRoutines(updatedRoutines);
      saveRoutines(updatedRoutines);
      const matchedRoutine = updatedRoutines.find((r) => r.id === activeWorkout.routineId);
      if (matchedRoutine && currentUser?.uid) {
        saveRoutineToCloud(currentUser.uid, matchedRoutine).catch((e) =>
          console.warn('Failed to update routine in cloud', e)
        );
      }
    }

    // Save to local & Firestore cloud
    const newHistory = [completed, ...history];
    setHistory(newHistory);
    saveHistory(newHistory);

    if (currentUser?.uid) {
      try {
        await saveWorkoutToCloud(currentUser.uid, completed);
        await saveActiveSessionToCloud(currentUser.uid, null);
      } catch (err) {
        console.error('Error saving workout to cloud:', err);
      }
    }

    // Trigger native Push Notification via Service Worker API for finished workout
    sendWorkoutCompleteNotification({
      routineName: activeWorkout.routineName,
      totalVolumeKg: totalVolume,
      totalSets: totalSets,
      durationSeconds: durationSeconds,
      estimatedCalories: estimatedCalories
    }).catch((e) => console.debug('Failed to dispatch workout complete notification', e));

    setActiveWorkout(null);
    saveActiveWorkout(null);
    setIsFinishModalOpen(false);
    setRestTimer((prev) => ({ ...prev, isActive: false }));
    setCurrentTab('history');
  };

  // Cancel / Discard active workout
  const handleCancelWorkout = async () => {
    if (confirm('Tem certeza que deseja cancelar e descartar este treino?')) {
      setActiveWorkout(null);
      saveActiveWorkout(null);
      if (currentUser?.uid) {
        await saveActiveSessionToCloud(currentUser.uid, null).catch((e) =>
          console.warn('Cancel active session error', e)
        );
      }
      setRestTimer((prev) => ({ ...prev, isActive: false }));
    }
  };

  // Repeat past workout
  const handleRepeatWorkout = (workout: CompletedWorkout) => {
    const workoutExercises: WorkoutExercise[] = workout.exercises.map((ex) => {
      const exerciseDetails = exercises.find((e) => e.id === ex.exerciseId);
      const sets: ExerciseSet[] = ex.sets.map((s) => ({
        id: `set-${Date.now()}-${s.setNumber}-${Math.random().toString(36).substr(2, 4)}`,
        setNumber: s.setNumber,
        type: s.type,
        weight: s.weight,
        reps: s.reps,
        completed: false,
        previousWeight: s.weight,
        previousReps: s.reps
      }));

      return {
        id: `we-${Date.now()}-${ex.exerciseId}`,
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        restSeconds: ex.restSeconds || 120,
        notes: ex.notes || '',
        sets
      };
    });

    const session: ActiveWorkoutSession = {
      id: `workout-${Date.now()}`,
      routineId: workout.routineId,
      routineName: workout.routineName,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      exercises: workoutExercises
    };

    setActiveWorkout(session);
    saveActiveWorkout(session);
    if (currentUser?.uid) {
      saveActiveSessionToCloud(currentUser.uid, session).catch((e) =>
        console.warn('Repeat workout cloud save notice', e)
      );
    }
    soundFx.playSetComplete();
  };

  // Delete workout from history & Firestore
  const handleDeleteHistoryItem = async (workoutId: string) => {
    const updated = history.filter((w) => w.id !== workoutId);
    setHistory(updated);
    saveHistory(updated);

    if (currentUser?.uid) {
      try {
        await deleteWorkoutFromCloud(currentUser.uid, workoutId);
      } catch (err) {
        console.error('Failed to delete workout from cloud:', err);
      }
    }
  };

  // Cardio history handlers
  const handleUpdateCardioSession = (updatedSession: CardioSession) => {
    const updated = cardioSessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    setCardioSessions(updated);
    saveCardioSessions(updated);
  };

  const handleDeleteCardioSession = (sessionId: string) => {
    const updated = cardioSessions.filter((s) => s.id !== sessionId);
    setCardioSessions(updated);
    saveCardioSessions(updated);
  };

  const handleAddCardioSession = (newSession: CardioSession) => {
    const updated = [newSession, ...cardioSessions];
    setCardioSessions(updated);
    saveCardioSessions(updated);
  };

  // Routines save / delete
  const handleSaveRoutine = async (routine: Routine) => {
    const exists = routines.some((r) => r.id === routine.id);
    const updated = exists
      ? routines.map((r) => (r.id === routine.id ? routine : r))
      : [routine, ...routines];

    setRoutines(updated);
    saveRoutines(updated);

    if (currentUser?.uid) {
      try {
        await saveRoutineToCloud(currentUser.uid, routine);
      } catch (err) {
        console.error('Failed to save routine to cloud:', err);
      }
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    const updated = routines.filter((r) => r.id !== routineId);
    setRoutines(updated);
    saveRoutines(updated);

    if (currentUser?.uid) {
      try {
        await deleteRoutineFromCloud(currentUser.uid, routineId);
      } catch (err) {
        console.error('Failed to delete routine from cloud:', err);
      }
    }
  };

  const handleReorderRoutines = async (newRoutines: Routine[]) => {
    const indexedRoutines = newRoutines.map((r, idx) => ({
      ...r,
      order: idx
    }));
    setRoutines(indexedRoutines);
    saveRoutines(indexedRoutines);

    if (currentUser?.uid) {
      saveRoutinesOrderToCloud(currentUser.uid, indexedRoutines).catch((err) =>
        console.warn('Failed to sync routines order to cloud:', err)
      );
    }
  };

  const handleImportRoutines = async (
    importedRoutines: Routine[],
    mode: 'append' | 'replace',
    newExercises?: Exercise[]
  ) => {
    // 1. If any new exercises were created, merge and save
    if (newExercises && newExercises.length > 0) {
      setExercises((prev) => {
        const exMap = new Map<string, Exercise>();
        prev.forEach((e) => exMap.set(e.id, e));
        newExercises.forEach((e) => exMap.set(e.id, e));
        const updated = Array.from(exMap.values());
        saveExercises(updated);
        return updated;
      });

      if (currentUser?.uid) {
        await Promise.all(
          newExercises.map((ex) =>
            saveCustomExerciseToCloud(currentUser.uid, ex).catch((err) =>
              console.warn('Failed to save imported custom exercise to cloud:', ex.name, err)
            )
          )
        );
      }
    }

    // 2. Process routines list ensuring exerciseName is attached to every template and auto-healed
    const allKnownExercises = [...exercises, ...(newExercises || [])];
    const sanitizedImported = autoHealRoutines(
      importedRoutines.map((r) => ({
        ...r,
        exercises: r.exercises.map((template) => ({
          ...template,
          exerciseName: getExerciseDisplayName(template, allKnownExercises)
        }))
      })),
      allKnownExercises,
      history
    );

    let finalRoutines: Routine[];
    if (mode === 'replace') {
      if (currentUser?.uid) {
        for (const r of routines) {
          await deleteRoutineFromCloud(currentUser.uid, r.id).catch(() => {});
        }
      }
      finalRoutines = sanitizedImported.map((r, idx) => ({ ...r, order: idx }));
    } else {
      const currentMaxOrder = routines.reduce((max, r) => Math.max(max, r.order ?? 0), -1);
      const newItems = sanitizedImported.map((r, idx) => ({
        ...r,
        order: currentMaxOrder + 1 + idx
      }));
      finalRoutines = [...routines, ...newItems];
    }

    setRoutines(finalRoutines);
    saveRoutines(finalRoutines);

    if (currentUser?.uid) {
      for (const r of finalRoutines) {
        await saveRoutineToCloud(currentUser.uid, r).catch(() => {});
      }
    }
  };

  // Custom Exercise
  const handleAddCustomExercise = async (newEx: Exercise) => {
    const updated = [newEx, ...exercises];
    setExercises(updated);
    saveExercises(updated);

    if (currentUser?.uid) {
      try {
        await saveCustomExerciseToCloud(currentUser.uid, newEx);
      } catch (err) {
        console.error('Failed to save custom exercise to cloud:', err);
      }
    }
  };

  // Update Profile
  const handleUpdateProfile = async (updated: UserProfile) => {
    setProfile(updated);
    saveProfile(updated);

    if (currentUser?.uid) {
      try {
        await saveUserProfileToCloud(currentUser.uid, updated);
      } catch (err) {
        console.error('Failed to save profile to cloud:', err);
      }
    }
  };

  // Backup export / import
  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thunder_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          const lEx = loadExercises();
          const lRo = loadRoutines();
          const lHi = loadHistory();
          const lPr = loadProfile();
          const lCardio = loadCardioSessions();

          setExercises(lEx);
          setRoutines(lRo);
          setHistory(lHi);
          setProfile(lPr);
          setCardioSessions(lCardio);

          if (currentUser?.uid) {
            await initializeUserDataOnCloud(currentUser.uid, lRo, lPr);
            for (const w of lHi) {
              await saveWorkoutToCloud(currentUser.uid, w);
            }
          }
          alert('Backup importado e sincronizado com o banco de dados com sucesso!');
        } else {
          alert('Erro ao importar arquivo. Verifique o formato JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    resetAllDataToDemo();
    setExercises(loadExercises());
    setRoutines(loadRoutines());
    setHistory(loadHistory());
    setCardioSessions([]);
    setProfile(loadProfile());
    setActiveWorkout(null);
    alert('Dados de demonstração restaurados com sucesso!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 flex flex-col font-sans selection:bg-[#00D1C1]/20 selection:text-[#00D1C1]">
      {/* If active workout is running, show full active workout screen */}
      {activeWorkout ? (
        <ActiveWorkout
          routineName={activeWorkout.routineName}
          exercises={activeWorkout.exercises}
          startedAt={activeWorkout.startedAt}
          onUpdateExercises={handleUpdateActiveExercises}
          onTriggerRestTimer={handleTriggerRestTimer}
          onFinishWorkout={handleOpenFinishModal}
          onCancelWorkout={handleCancelWorkout}
          onOpenAddExerciseModal={() => setIsQuickAddModalOpen(true)}
          soundEnabled={profile.soundEnabled}
          vibrationEnabled={profile.vibrationEnabled}
        />
      ) : (
        <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-3">
          {/* Main Top Header with Database Sync Badge & Quick Login */}
          <header className="flex items-center justify-between py-2.5 border-b border-white/5 mb-4">
            <div 
              onClick={() => setCurrentTab('home')}
              className="cursor-pointer"
            >
              <ThunderLogo size="md" />
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Theme Mode Toggle (Dark / Light) */}
              <button
                type="button"
                onClick={() => {
                  soundFx.playTick();
                  const currentMode = profile.themeMode || 'dark';
                  const nextMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
                  applyTheme(nextMode, profile.themeColor || 'tiffany');
                  handleUpdateProfile({ ...profile, themeMode: nextMode });
                }}
                className="p-1.5 bg-[#161616] hover:bg-[#202020] border border-white/10 rounded-full cursor-pointer transition-all active:scale-95 text-neutral-300 hover:text-white"
                title={(profile.themeMode || 'dark') === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
              >
                {(profile.themeMode || 'dark') === 'light' ? (
                  <Moon size={14} className="text-indigo-400" />
                ) : (
                  <Sun size={14} className="text-amber-400" />
                )}
              </button>

              {/* Cloud Sync Status Indicator */}
              <div 
                onClick={() => setCurrentTab('profile')}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161616] hover:bg-[#202020] border border-white/10 rounded-full cursor-pointer transition-colors"
                title={currentUser?.isAnonymous ? 'Modo Online (Convidado) - Clique para conectar Google' : 'Sincronizado na Nuvem'}
              >
                <span className="w-2 h-2 rounded-full bg-[#00D1C1] shadow-[0_0_6px_#00D1C1] animate-pulse"></span>
                <span className="text-[10px] font-black font-mono-numbers text-neutral-300">
                  {isSyncing ? 'SYNC...' : 'FIRESTORE'}
                </span>
              </div>

              {/* User Avatar / Quick Login Button */}
              {currentUser && !currentUser.isAnonymous && currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Avatar'}
                  onClick={() => setCurrentTab('profile')}
                  className="w-7 h-7 rounded-full border border-[#00D1C1]/50 cursor-pointer object-cover"
                />
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="p-1.5 bg-[#00D1C1]/10 hover:bg-[#00D1C1]/20 text-[#00D1C1] rounded-full border border-[#00D1C1]/30 transition-all active:scale-95"
                  title="Conectar Conta Google"
                >
                  <UserIcon size={14} />
                </button>
              )}
            </div>
          </header>

          {/* Current Tab Screen View */}
          <main>
            {currentTab === 'home' && (
              <DashboardView
                profile={profile}
                routines={routines}
                history={history}
                exercises={exercises}
                cardioSessions={cardioSessions}
                onStartRoutine={handleStartRoutine}
                onStartEmptyWorkout={handleStartEmptyWorkout}
                onNavigateToRoutines={() => setCurrentTab('routines')}
                onNavigateToProgress={() => setCurrentTab('progress')}
                onNavigateToHistory={() => setCurrentTab('history')}
                onUpdateCardioSession={handleUpdateCardioSession}
                onDeleteCardioSession={handleDeleteCardioSession}
                onAddCardioSession={handleAddCardioSession}
              />
            )}

            {currentTab === 'routines' && (
              <RoutinesView
                routines={routines}
                exercises={exercises}
                history={history}
                onStartRoutine={handleStartRoutine}
                onSaveRoutine={handleSaveRoutine}
                onDeleteRoutine={handleDeleteRoutine}
                onReorderRoutines={handleReorderRoutines}
                onImportRoutines={handleImportRoutines}
                onRepeatWorkout={handleRepeatWorkout}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onNavigateToFullHistory={() => setCurrentTab('history')}
                onOpenAddExerciseModal={() => setIsQuickAddModalOpen(true)}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressView 
                exercises={exercises} 
                history={history} 
                routines={routines}
                cardioSessions={cardioSessions}
                athleteName={profile.name}
                accentHex={activeAccentHex}
              />
            )}

            {currentTab === 'exercises' && (
              <ExercisesView
                exercises={exercises}
                history={history}
                onAddCustomExercise={handleAddCustomExercise}
              />
            )}

            {currentTab === 'history' && (
              <div>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="mb-2 text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Voltar ao Painel
                </button>
                <HistoryView
                  history={history}
                  cardioSessions={cardioSessions}
                  onRepeatWorkout={handleRepeatWorkout}
                  onDeleteHistoryItem={handleDeleteHistoryItem}
                  onDeleteCardioSession={handleDeleteCardioSession}
                  onUpdateCardioSession={handleUpdateCardioSession}
                  athleteName={profile.name}
                />
              </div>
            )}

            {currentTab === 'profile' && (
              <ProfileView
                profile={profile}
                currentUser={currentUser}
                isSyncing={isSyncing}
                syncError={syncError}
                onLoginGoogle={handleGoogleLogin}
                onLogout={handleLogout}
                onUpdateProfile={handleUpdateProfile}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                onResetDemoData={handleResetDemoData}
                history={history}
                routines={routines}
                onStartRoutine={handleStartRoutine}
                onNavigateToRoutines={() => setCurrentTab('routines')}
              />
            )}
          </main>
        </div>
      )}

      {/* Persistent Rest Timer (Floating Dock & Fullscreen Modal) */}
      {restTimer.isActive && (
        <RestTimerOverlay
          remainingSeconds={restTimer.remainingSeconds}
          totalSeconds={restTimer.totalSeconds}
          isPaused={restTimer.isPaused}
          exerciseName={restTimer.exerciseName}
          onAddSeconds={handleAddTimerSeconds}
          onTogglePause={handleToggleTimerPause}
          onSkip={handleSkipTimer}
          onReset={handleResetTimer}
          isMinimized={isTimerMinimized}
          onToggleMinimize={() => setIsTimerMinimized(!isTimerMinimized)}
          soundEnabled={profile.soundEnabled}
          vibrationEnabled={profile.vibrationEnabled}
          keepScreenAwake={profile.keepScreenAwake ?? true}
          onToggleKeepScreenAwake={() => {
            const nextVal = !(profile.keepScreenAwake ?? true);
            handleUpdateProfile({ ...profile, keepScreenAwake: nextVal });
            if (nextVal) {
              requestScreenWakeLock().catch(() => {});
            } else {
              releaseScreenWakeLock();
            }
          }}
          useNativeClockTimer={profile.useNativeClockTimer ?? false}
          onToggleUseNativeClockTimer={() => {
            handleUpdateProfile({ ...profile, useNativeClockTimer: !profile.useNativeClockTimer });
          }}
        />
      )}

      {/* Quick Add Exercise Modal */}
      <QuickAddExerciseModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        exercises={exercises}
        onSelectExercise={handleSelectExerciseForActiveWorkout}
        alreadyAddedIds={activeWorkout?.exercises.map((e) => e.exerciseId) || []}
        title="Adicionar Exercício ao Treino"
      />

      {/* Workout Complete Celebration Modal */}
      {activeWorkout && (
        <WorkoutCompleteModal
          isOpen={isFinishModalOpen}
          routineName={activeWorkout.routineName}
          durationSeconds={
            Math.max(
              60,
              Math.floor((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000)
            )
          }
          exercises={activeWorkout.exercises}
          personalRecords={pendingPRs}
          athleteName={profile.name}
          onConfirmFinish={handleConfirmFinishWorkout}
          onCancel={() => setIsFinishModalOpen(false)}
        />
      )}

      {/* Bottom Navigation (Hidden only during full active workout screen) */}
      {!activeWorkout && (
        <BottomNav
          currentTab={currentTab === 'history' ? 'home' : (currentTab as TabType)}
          onSelectTab={(tab) => setCurrentTab(tab)}
          hasActiveWorkout={!!activeWorkout}
        />
      )}
    </div>
  );
}
