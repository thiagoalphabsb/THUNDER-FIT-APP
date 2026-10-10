import { CompletedWorkout, PRRecord, WorkoutExercise } from '../types';

/**
 * Checks whether an exercise is isometric (measured by hold time/duration and series, rather than conventional reps)
 */
export function isIsometricExercise(exercise?: {
  id?: string;
  name?: string;
  exerciseId?: string;
  exerciseName?: string;
  isIsometric?: boolean;
} | null): boolean {
  if (!exercise) return false;
  if (exercise.isIsometric === true) return true;
  const id = (exercise.exerciseId || exercise.id || '').toLowerCase();
  const name = (exercise.exerciseName || exercise.name || '').toLowerCase();
  if (id.includes('isometr') || id.includes('wall-sit') || id.includes('hollow-body')) return true;
  if (
    id === 'prancha-isometrica' ||
    id === 'prancha-lateral-solo-side-plank' ||
    id === 'agachamento-parede-wall-sit-isometrico' ||
    id === 'panturrilha-isometria-topo-degrau'
  ) {
    return true;
  }
  if (
    name.includes('isométr') ||
    name.includes('isometric') ||
    name.includes('wall sit') ||
    name.includes('hollow body') ||
    name.includes('canoa isométrica')
  ) {
    return true;
  }
  if (name.startsWith('prancha') && !name.includes('dinâmica') && !name.includes('toque') && !name.includes('commandos')) {
    return true;
  }
  return false;
}

/**
 * Formats seconds into human-readable hold duration, e.g. "45s" or "1m 30s"
 */
export function formatHoldDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  }
  return `${secs}s`;
}

// Calculate estimated 1-Rep Max using the Epley formula: Weight * (1 + Reps / 30)
export function calculate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  const val = weightKg * (1 + reps / 30);
  return Math.round(val * 10) / 10;
}

// Calculate total volume for dynamic weightlifting exercises (excludes isometric holds from multiplying seconds * kg)
export function calculateTotalVolume(exercises: WorkoutExercise[]): number {
  let volume = 0;
  exercises.forEach((ex) => {
    if (isIsometricExercise(ex)) return;
    ex.sets.forEach((s) => {
      if (s.completed && s.weight > 0 && s.reps > 0) {
        volume += s.weight * s.reps;
      }
    });
  });
  return Math.round(volume);
}

// Count total completed sets across all exercises (including isometric sets)
export function calculateCompletedSetsCount(exercises: WorkoutExercise[]): number {
  let count = 0;
  exercises.forEach((ex) => {
    ex.sets.forEach((s) => {
      if (s.completed) count++;
    });
  });
  return count;
}

// Count total dynamic repetitions (does NOT count hold seconds as reps)
export function calculateTotalReps(exercises: WorkoutExercise[]): number {
  let reps = 0;
  exercises.forEach((ex) => {
    if (isIsometricExercise(ex)) return;
    ex.sets.forEach((s) => {
      if (s.completed && s.reps > 0) {
        reps += s.reps;
      }
    });
  });
  return reps;
}

// Count total seconds in isometric holds across completed sets
export function calculateTotalIsometricSeconds(exercises: WorkoutExercise[]): number {
  let totalSecs = 0;
  exercises.forEach((ex) => {
    if (isIsometricExercise(ex)) {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalSecs += (s.holdSeconds || s.reps || 0);
        }
      });
    }
  });
  return totalSecs;
}

// Count completed sets of isometric exercises
export function calculateIsometricSetsCount(exercises: WorkoutExercise[]): number {
  let count = 0;
  exercises.forEach((ex) => {
    if (isIsometricExercise(ex)) {
      ex.sets.forEach((s) => {
        if (s.completed) count++;
      });
    }
  });
  return count;
}

/**
 * Calculates estimated calorie expenditure (in kcal) based on workout duration (seconds),
 * total volume lifted (kg), and isometric hold duration (seconds), taking into account user body weight.
 *
 * Formula based on exercise physiology (MET ~5.2-6.0 for resistance training + EPOC/volume factor):
 * - Duration component: (durationSeconds / 60) * 5.2 * (bodyWeightKg / 75)
 * - Volume component: totalVolumeKg * 0.018 (mechanical & metabolic work per kg moved)
 * - Isometric component: (totalIsometricSeconds / 60) * 4.5 * (bodyWeightKg / 75) (sustained muscular tension)
 */
export function calculateEstimatedCalories(
  durationSeconds: number,
  totalVolumeKg: number,
  bodyWeightKg: number = 78,
  totalIsometricSeconds: number = 0
): number {
  if (durationSeconds <= 0 && totalVolumeKg <= 0 && totalIsometricSeconds <= 0) return 0;

  const validWeight = bodyWeightKg > 0 ? bodyWeightKg : 78;
  const weightFactor = validWeight / 75;

  const durationMinutes = Math.max(0, durationSeconds) / 60;
  const durationKcal = durationMinutes * 5.2 * weightFactor;
  const volumeKcal = Math.max(0, totalVolumeKg) * 0.018;
  const isometricKcal = (Math.max(0, totalIsometricSeconds) / 60) * 4.5 * weightFactor;

  const total = Math.round(durationKcal + volumeKcal + isometricKcal);
  return total > 0 ? total : 0;
}

// Format seconds to mm:ss or hh:mm:ss
export function formatTimerDigits(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format workout duration to "58 min" or "1h 12min"
export function formatWorkoutDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  }
  return `${minutes} min`;
}

// Format date in Portuguese (e.g., "22 AGO", "Hoje, 14:30")
export function formatDatePT(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    return `${day} ${month}`;
  } catch {
    return dateStr;
  }
}

export function formatDateTimePT(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const dateFormatted = formatDatePT(dateStr);
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${dateFormatted} às ${hours}:${mins}`;
  } catch {
    return dateStr;
  }
}

// Find historical records for an exercise from completed workouts
export function getExerciseStatsFromHistory(
  exerciseId: string,
  history: CompletedWorkout[],
  exerciseName?: string
) {
  let maxWeight = 0;
  let maxRepsAtMaxWeight = 0;
  let best1RM = 0;
  let maxVolumeSet = 0;
  let totalSetsPerformed = 0;
  let maxHoldSeconds = 0;
  const historyPoints: { date: string; weight: number; reps: number; estimated1RM: number; volume: number }[] = [];

  // Sort history ascending by date for progressive chart
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  const normTargetName = exerciseName ? exerciseName.trim().toLowerCase() : '';

  sortedHistory.forEach((workout) => {
    const matchedEx = workout.exercises.find((e) => {
      if (e.exerciseId === exerciseId) return true;
      if (normTargetName && e.exerciseName && e.exerciseName.trim().toLowerCase() === normTargetName) return true;
      return false;
    });
    if (matchedEx) {
      const isIso = isIsometricExercise(matchedEx);
      let workoutMaxWeight = 0;
      let workoutMaxReps = 0;
      let workoutBest1RM = 0;
      let workoutTotalVolume = 0;

      matchedEx.sets.forEach((set) => {
        if (!set.completed) return;

        if (isIso) {
          const hold = set.holdSeconds || set.reps || 0;
          if (hold > 0) {
            totalSetsPerformed++;
            if (hold > maxHoldSeconds) maxHoldSeconds = hold;
            if (set.weight > maxWeight) maxWeight = set.weight;
            if (hold > workoutMaxReps) workoutMaxReps = hold;
            if (set.weight > workoutMaxWeight) workoutMaxWeight = set.weight;
          }
        } else if (set.weight > 0 && set.reps > 0) {
          totalSetsPerformed++;
          const est1RM = calculate1RM(set.weight, set.reps);
          const setVol = set.weight * set.reps;
          workoutTotalVolume += setVol;

          if (set.weight > maxWeight) {
            maxWeight = set.weight;
            maxRepsAtMaxWeight = set.reps;
          }
          if (est1RM > best1RM) {
            best1RM = est1RM;
          }
          if (setVol > maxVolumeSet) {
            maxVolumeSet = setVol;
          }

          if (set.weight > workoutMaxWeight) {
            workoutMaxWeight = set.weight;
            workoutMaxReps = set.reps;
            workoutBest1RM = est1RM;
          }
        }
      });

      if (isIso && workoutMaxReps > 0) {
        historyPoints.push({
          date: formatDatePT(workout.completedAt || workout.startedAt),
          weight: workoutMaxWeight,
          reps: workoutMaxReps,
          estimated1RM: 0,
          volume: 0
        });
      } else if (workoutMaxWeight > 0) {
        historyPoints.push({
          date: formatDatePT(workout.completedAt || workout.startedAt),
          weight: workoutMaxWeight,
          reps: workoutMaxReps,
          estimated1RM: workoutBest1RM,
          volume: workoutTotalVolume
        });
      }
    }
  });

  return {
    maxWeight,
    maxRepsAtMaxWeight,
    best1RM,
    maxVolumeSet,
    totalSetsPerformed,
    maxHoldSeconds,
    historyPoints
  };
}

// Find previous workout load & reps for an exercise to auto-fill current workout
export function getPreviousPerformance(
  exerciseId: string,
  history: CompletedWorkout[],
  exerciseName?: string
) {
  const normTargetName = exerciseName ? exerciseName.trim().toLowerCase() : '';
  // Find the most recent workout containing this exercise
  for (const workout of history) {
    const ex = workout.exercises.find((e) => {
      if (e.exerciseId === exerciseId) return true;
      if (normTargetName && e.exerciseName && e.exerciseName.trim().toLowerCase() === normTargetName) return true;
      return false;
    });
    if (ex) {
      const isIso = isIsometricExercise(ex);
      const completedSets = ex.sets.filter((s) => s.completed && (isIso ? s.reps > 0 : (s.weight > 0 || s.reps > 0)));
      if (completedSets.length > 0) {
        const topSet = isIso
          ? [...completedSets].sort((a, b) => (b.holdSeconds || b.reps) - (a.holdSeconds || a.reps))[0]
          : [...completedSets].sort((a, b) => b.weight - a.weight)[0];
        return {
          workoutDate: workout.completedAt || workout.startedAt,
          sets: completedSets,
          topWeight: topSet ? topSet.weight : 0,
          topReps: topSet ? (topSet.holdSeconds || topSet.reps) : 0,
          isIsometric: isIso
        };
      }
    }
  }
  return null;
}

// Detect new Personal Records achieved in a workout
export function detectNewPersonalRecords(
  activeExercises: WorkoutExercise[],
  history: CompletedWorkout[]
): PRRecord[] {
  const newPRs: PRRecord[] = [];

  activeExercises.forEach((ex) => {
    const isIso = isIsometricExercise(ex);
    const stats = getExerciseStatsFromHistory(ex.exerciseId, history, ex.exerciseName);

    if (isIso) {
      const previousMaxHold = stats.maxHoldSeconds;
      ex.sets.forEach((s) => {
        const hold = s.holdSeconds || s.reps || 0;
        if (s.completed && hold > 0) {
          if (previousMaxHold > 0 && hold > previousMaxHold) {
            const existing = newPRs.find((pr) => pr.exerciseId === ex.exerciseId);
            if (!existing) {
              newPRs.push({
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                weight: s.weight || 0,
                reps: hold,
                previousBest: previousMaxHold,
                type: 'max_hold_time'
              });
            } else if (hold > existing.reps) {
              existing.reps = hold;
              existing.weight = s.weight || 0;
            }
          }
        }
      });
    } else {
      const previousMaxWeight = stats.maxWeight;
      ex.sets.forEach((s) => {
        if (s.completed && s.weight > 0 && s.reps > 0) {
          if (previousMaxWeight > 0 && s.weight > previousMaxWeight) {
            // Check if already pushed for this exercise
            const existing = newPRs.find((pr) => pr.exerciseId === ex.exerciseId);
            if (!existing) {
              newPRs.push({
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                weight: s.weight,
                reps: s.reps,
                previousBest: previousMaxWeight,
                type: 'max_weight'
              });
            } else if (s.weight > existing.weight) {
              existing.weight = s.weight;
              existing.reps = s.reps;
            }
          }
        }
      });
    }
  });

  return newPRs;
}
