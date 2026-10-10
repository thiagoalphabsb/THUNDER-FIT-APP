import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  CompletedWorkout,
  Routine,
  Exercise,
  UserProfile,
  ActiveWorkoutSession
} from '../types';
import { INITIAL_EXERCISES } from '../data/exercisesData';
import { DEFAULT_ROUTINES } from '../data/defaultRoutines';
import { INITIAL_HISTORY } from '../data/initialHistory';
import { DEFAULT_PROFILE } from '../utils/storage';

// Collection references
export const getUserDocRef = (userId: string) => doc(db, 'users', userId);
export const getWorkoutsCollectionRef = (userId: string) => collection(db, 'users', userId, 'workouts');
export const getRoutinesCollectionRef = (userId: string) => collection(db, 'users', userId, 'routines');
export const getExercisesCollectionRef = (userId: string) => collection(db, 'users', userId, 'exercises');
export const getActiveSessionDocRef = (userId: string) => doc(db, 'users', userId, 'activeSession', 'current');

/**
 * Recursively removes all keys whose values are `undefined` from objects and arrays.
 * Preserves Firestore FieldValues (like serverTimestamp()) and other non-plain objects.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object') {
    // If not a plain Javascript Object (e.g. FieldValue, Date, RegExp), keep as-is
    const isPlainObject = Object.prototype.toString.call(data) === '[object Object]';
    if (!isPlainObject) {
      return data;
    }
    const clean: Record<string, any> = {};
    for (const key of Object.keys(data as any)) {
      const val = (data as any)[key];
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    }
    return clean as any;
  }
  return data;
}

/**
 * Real-time listener for user profile
 */
export function subscribeToUserProfile(
  userId: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = getUserDocRef(userId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onData({
          name: data.name || DEFAULT_PROFILE.name,
          weightKg: typeof data.weightKg === 'number' ? data.weightKg : DEFAULT_PROFILE.weightKg,
          weeklyGoalWorkouts: data.weeklyGoalWorkouts || DEFAULT_PROFILE.weeklyGoalWorkouts,
          defaultRestSeconds: data.defaultRestSeconds || DEFAULT_PROFILE.defaultRestSeconds,
          soundEnabled: data.soundEnabled !== undefined ? data.soundEnabled : DEFAULT_PROFILE.soundEnabled,
          vibrationEnabled: data.vibrationEnabled !== undefined ? data.vibrationEnabled : DEFAULT_PROFILE.vibrationEnabled,
          autoStartTimer: data.autoStartTimer !== undefined ? data.autoStartTimer : DEFAULT_PROFILE.autoStartTimer,
          keepScreenAwake: data.keepScreenAwake !== undefined ? data.keepScreenAwake : DEFAULT_PROFILE.keepScreenAwake
        });
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Firestore profile sync error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / Update user profile
 */
export async function saveUserProfileToCloud(userId: string, profile: UserProfile): Promise<void> {
  try {
    const docRef = getUserDocRef(userId);
    await setDoc(docRef, sanitizeForFirestore({
      ...profile,
      userId,
      updatedAt: new Date().toISOString(),
      _serverUpdatedAt: serverTimestamp()
    }), { merge: true });
  } catch (err) {
    console.error('Failed to save user profile to Firestore', err);
    throw err;
  }
}

/**
 * Real-time listener for user workouts (History)
 */
export function subscribeToWorkouts(
  userId: string,
  onData: (workouts: CompletedWorkout[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = getWorkoutsCollectionRef(userId);
  const q = query(colRef, orderBy('completedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const workouts: CompletedWorkout[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        workouts.push({
          id: docSnap.id,
          routineId: data.routineId,
          routineName: data.routineName || 'Treino',
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          durationSeconds: data.durationSeconds || 0,
          exercises: data.exercises || [],
          totalVolumeKg: data.totalVolumeKg || 0,
          totalSets: data.totalSets || 0,
          totalReps: data.totalReps || 0,
          personalRecords: data.personalRecords || [],
          rating: data.rating,
          notes: data.notes
        });
      });
      onData(workouts);
    },
    (err) => {
      console.warn('Firestore workouts sync error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save Completed Workout to Cloud
 */
export async function saveWorkoutToCloud(userId: string, workout: CompletedWorkout): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'workouts', workout.id);
    await setDoc(docRef, sanitizeForFirestore({
      ...workout,
      userId,
      savedAt: new Date().toISOString(),
      _serverTimestamp: serverTimestamp()
    }));
  } catch (err) {
    console.error('Failed to save workout to Firestore', err);
    throw err;
  }
}

/**
 * Delete Workout from Cloud
 */
export async function deleteWorkoutFromCloud(userId: string, workoutId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'workouts', workoutId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete workout from Firestore', err);
    throw err;
  }
}

/**
 * Real-time listener for Routines
 */
export function subscribeToRoutines(
  userId: string,
  onData: (routines: Routine[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = getRoutinesCollectionRef(userId);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const routines: Routine[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        routines.push({
          id: docSnap.id,
          name: data.name,
          description: data.description,
          targetMuscles: data.targetMuscles || [],
          exercises: data.exercises || [],
          lastPerformed: data.lastPerformed,
          createdAt: data.createdAt || new Date().toISOString(),
          order: typeof data.order === 'number' ? data.order : undefined
        });
      });

      // Sort by order ascending if specified, otherwise keep createdAt order
      routines.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      onData(routines);
    },
    (err) => {
      console.warn('Firestore routines sync error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save / Update Routine Order in Cloud
 */
export async function saveRoutinesOrderToCloud(userId: string, reorderedRoutines: Routine[]): Promise<void> {
  try {
    for (let i = 0; i < reorderedRoutines.length; i++) {
      const routine = reorderedRoutines[i];
      const docRef = doc(db, 'users', userId, 'routines', routine.id);
      await setDoc(docRef, sanitizeForFirestore({ order: i }), { merge: true });
    }
  } catch (err) {
    console.warn('Failed to update routines order on cloud:', err);
  }
}

/**
 * Save Routine to Cloud
 */
export async function saveRoutineToCloud(userId: string, routine: Routine): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'routines', routine.id);
    await setDoc(docRef, sanitizeForFirestore({
      ...routine,
      userId,
      updatedAt: new Date().toISOString(),
      _serverTimestamp: serverTimestamp()
    }), { merge: true });
  } catch (err) {
    console.error('Failed to save routine to Firestore', err);
    throw err;
  }
}

/**
 * Delete Routine from Cloud
 */
export async function deleteRoutineFromCloud(userId: string, routineId: string): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'routines', routineId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete routine from Firestore', err);
    throw err;
  }
}

/**
 * Real-time listener for Custom Exercises
 */
export function subscribeToCustomExercises(
  userId: string,
  onData: (exercises: Exercise[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = getExercisesCollectionRef(userId);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const customExercises: Exercise[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        customExercises.push({
          id: docSnap.id,
          name: data.name,
          muscleGroup: data.muscleGroup,
          secondaryMuscles: data.secondaryMuscles,
          equipment: data.equipment,
          instructions: data.instructions || [],
          tips: data.tips,
          defaultRestSeconds: data.defaultRestSeconds || 120,
          isCustom: true
        });
      });
      onData(customExercises);
    },
    (err) => {
      console.warn('Firestore custom exercises sync error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save Custom Exercise to Cloud
 */
export async function saveCustomExerciseToCloud(userId: string, exercise: Exercise): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'exercises', exercise.id);
    await setDoc(docRef, sanitizeForFirestore({
      ...exercise,
      userId,
      isCustom: true,
      createdAt: new Date().toISOString()
    }));
  } catch (err) {
    console.error('Failed to save custom exercise to Firestore', err);
    throw err;
  }
}

/**
 * Real-time listener for Active Workout Session
 */
export function subscribeToActiveSession(
  userId: string,
  onData: (session: ActiveWorkoutSession | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = getActiveSessionDocRef(userId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onData({
          id: data.id || snapshot.id,
          routineId: data.routineId,
          routineName: data.routineName || 'Treino Ativo',
          startedAt: data.startedAt || new Date().toISOString(),
          durationSeconds: data.durationSeconds || 0,
          exercises: data.exercises || [],
          notes: data.notes
        });
      } else {
        onData(null);
      }
    },
    (err) => {
      console.warn('Firestore active session sync error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or Clear Active Session in Cloud
 */
export async function saveActiveSessionToCloud(
  userId: string,
  session: ActiveWorkoutSession | null
): Promise<void> {
  try {
    const docRef = getActiveSessionDocRef(userId);
    if (!session) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, sanitizeForFirestore({
        ...session,
        userId,
        lastHeartbeat: new Date().toISOString()
      }));
    }
  } catch (err) {
    console.error('Failed to save active session to Firestore', err);
    throw err;
  }
}

/**
 * Initialize user data on cloud if not exists (seeds default routines & user profile).
 * Workout history is NOT seeded with fake data, ensuring every new user starts with a clean 0 history.
 */
export async function initializeUserDataOnCloud(
  userId: string,
  localRoutines: Routine[],
  localProfile: UserProfile
): Promise<void> {
  try {
    const routinesCol = getRoutinesCollectionRef(userId);
    const routinesSnap = await getDocs(routinesCol);

    // If cloud routines are empty, seed with workout routines templates
    if (routinesSnap.empty) {
      const routinesToSeed = localRoutines.length > 0 ? localRoutines : DEFAULT_ROUTINES;
      for (let idx = 0; idx < routinesToSeed.length; idx++) {
        const r = routinesToSeed[idx];
        await setDoc(doc(db, 'users', userId, 'routines', r.id), sanitizeForFirestore({
          ...r,
          order: typeof r.order === 'number' ? r.order : idx,
          userId,
          createdAt: r.createdAt || new Date().toISOString()
        }));
      }
    }

    // Save profile if not set
    await saveUserProfileToCloud(userId, localProfile || DEFAULT_PROFILE);
  } catch (err) {
    console.warn('Initial cloud seed / check warning:', err);
  }
}
