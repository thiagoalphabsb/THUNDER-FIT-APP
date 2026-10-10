export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Quadríceps'
  | 'Posteriores'
  | 'Glúteos'
  | 'Panturrilhas'
  | 'Abdômen';

export type SecondaryMuscle = MuscleGroup | 'Trapézio' | 'Antebraço' | 'Lombar' | 'Rombóides';

export type EquipmentType =
  | 'Barra'
  | 'Halteres'
  | 'Máquina'
  | 'Polia'
  | 'Peso Corporal'
  | 'Kettlebell'
  | 'Outro';

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: SecondaryMuscle[];
  equipment: EquipmentType;
  instructions: string[];
  tips?: string;
  defaultRestSeconds: number;
  isCustom?: boolean;
  isIsometric?: boolean; // Exercício medido por tempo de sustentação (ex: prancha, wall sit)
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number;
  reps: number; // For isometric exercises, stores hold duration in seconds
  completed: boolean;
  previousWeight?: number;
  previousReps?: number;
  isPersonalRecord?: boolean;
  completedAt?: string;
  isIsometric?: boolean;
  holdSeconds?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  restSeconds: number;
  notes?: string;
  sets: ExerciseSet[];
  isIsometric?: boolean;
}

export interface RoutineExerciseTemplate {
  exerciseId: string;
  exerciseName?: string;
  setsCount: number;
  targetReps: number;
  initialWeight: number;
  restSeconds: number;
  notes?: string;
  isIsometric?: boolean;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  targetMuscles: MuscleGroup[];
  exercises: RoutineExerciseTemplate[];
  lastPerformed?: string;
  createdAt: string;
  order?: number;
  daysOfWeek?: number[]; // 0=Segunda, 1=Terça, 2=Quarta, 3=Quinta, 4=Sexta, 5=Sábado, 6=Domingo
}

export interface PRRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  previousBest?: number;
  type: 'max_weight' | 'max_volume' | 'max_1rm' | 'max_hold_time';
}

export interface CompletedWorkout {
  id: string;
  routineId?: string;
  routineName: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  exercises: WorkoutExercise[];
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  totalIsometricSeconds?: number; // Total seconds in isometric holds
  personalRecords: PRRecord[];
  rating?: number; // 1 to 5 or RPE 1-10
  notes?: string;
  estimatedCalories?: number; // Estimated calorie expenditure (kcal) based on duration and volume
}

export interface RestTimerState {
  isActive: boolean;
  isPaused: boolean;
  totalSeconds: number;
  remainingSeconds: number;
  exerciseName?: string;
  startedAtTimestamp?: number;
  targetEndTimestamp?: number;
}

export interface ActiveWorkoutSession {
  id: string;
  routineId?: string;
  routineName: string;
  startedAt: string;
  exercises: WorkoutExercise[];
  notes?: string;
  durationSeconds: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxRepsAtMaxWeight: number;
  estimated1RM: number;
  maxVolumeSingleSet: number;
  achievedDate: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemeColor = 'tiffany' | 'emerald' | 'amber' | 'rose' | 'violet' | 'blue' | 'orange';

export interface UserProfile {
  name: string;
  weightKg: number;
  weeklyGoalWorkouts: number;
  defaultRestSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStartTimer: boolean;
  keepScreenAwake: boolean;
  useNativeClockTimer?: boolean;
  themeMode?: ThemeMode;
  themeColor?: ThemeColor;
}

export interface CardioSession {
  id: string;
  type: 'moderate' | 'hiit' | 'warmup';
  modality: string; // e.g. 'Bicicleta Spinning'
  durationSeconds: number;
  completedAt: string;
  estimatedCalories: number;
  estimatedDistanceKm?: number;
  // For HIIT
  hiitRounds?: number;
  workSeconds?: number;
  restSeconds?: number;
  // For Moderate / Warmup
  targetMinutes?: number;
  cadenceRpm?: number;
  resistanceLevel?: string;
  notes?: string;
}
