import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Dumbbell, 
  Shield, 
  Crown, 
  Zap, 
  Target, 
  Layers, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Lock, 
  Unlock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CompletedWorkout, Exercise } from '../types';
import { calculate1RM, formatDatePT } from '../utils/calc';
import { soundFx } from '../utils/audio';

export interface Achievement {
  id: string;
  title: string;
  category: 'carga' | 'volume' | 'especial';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  unlocked: boolean;
  unlockedAt?: string;
  unlockedTimestamp?: number;
  unlockedDetail?: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercent: number;
  colorTone: 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose';
}

interface AchievementsSectionProps {
  history: CompletedWorkout[];
  exercises: Exercise[];
  last7DaysVolume?: number;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  history,
  exercises,
  last7DaysVolume = 0
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'carga' | 'volume' | 'especial' | 'unlocked'>('all');
  const [activeModalAchievement, setActiveModalAchievement] = useState<Achievement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Analyze all PRs and volume statistics across user history
  const achievementsData = useMemo(() => {
    // 1. Explicit PR records count
    let totalExplicitPRs = 0;
    const distinctExercisesWithPR = new Set<string>();
    const distinctMusclesWithPR = new Set<string>();
    const workoutsWithPRs = new Set<string>();
    let latestPRDate: string | null = null;
    let latestPRExercise = '';

    // 2. Load metrics
    let highestSingleWeight = 0;
    let highestWeightExercise = '';
    let highestWeightDate = '';
    let highestEstimated1RM = 0;
    let highest1RMExercise = '';

    // 3. Volume metrics
    let highestSingleSetVolume = 0;
    let highestSetVolumeExercise = '';
    let maxWorkoutVolume = 0;
    let maxWorkoutVolumeName = '';
    let maxWorkoutVolumeDate = '';
    let totalCumulativeVolume = 0;

    // Specific milestone unlock timestamps (to show the most recent first)
    let pr1Time = 0;
    let pr5Time = 0;
    let pr10Time = 0;
    let weight50Time = 0;
    let weight80Time = 0;
    let weight100Time = 0;
    let est1RM100Time = 0;
    let multiMusclesTime = 0;
    let vol1tonTime = 0;
    let vol3tonTime = 0;
    let vol5tonTime = 0;
    let vol10tonTime = 0;
    let setVol500Time = 0;
    let setVol1000Time = 0;
    let vol25kTime = 0;
    let vol50kTime = 0;
    let streakTime = 0;

    // Track PRs by exercise over time
    const exerciseMaxMap = new Map<string, number>();

    // Process sorted history chronologically
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );

    sortedHistory.forEach((workout) => {
      const wTime = new Date(workout.completedAt || workout.startedAt).getTime();
      const workoutDate = formatDatePT(workout.completedAt || workout.startedAt);
      const workoutVol = workout.totalVolumeKg || 0;
      totalCumulativeVolume += workoutVol;

      if (workoutVol >= 1000 && !vol1tonTime) vol1tonTime = wTime;
      if (workoutVol >= 3000 && !vol3tonTime) vol3tonTime = wTime;
      if (workoutVol >= 5000 && !vol5tonTime) vol5tonTime = wTime;
      if (workoutVol >= 10000 && !vol10tonTime) vol10tonTime = wTime;
      if (totalCumulativeVolume >= 25000 && !vol25kTime) vol25kTime = wTime;
      if (totalCumulativeVolume >= 50000 && !vol50kTime) vol50kTime = wTime;

      if (workoutVol > maxWorkoutVolume) {
        maxWorkoutVolume = workoutVol;
        maxWorkoutVolumeName = workout.routineName || 'Treino';
        maxWorkoutVolumeDate = workoutDate;
      }

      let workoutHadPR = false;

      // Count workout.personalRecords
      if (workout.personalRecords && workout.personalRecords.length > 0) {
        workout.personalRecords.forEach((pr) => {
          totalExplicitPRs++;
          workoutHadPR = true;
          distinctExercisesWithPR.add(pr.exerciseId);
          latestPRDate = workoutDate;
          latestPRExercise = pr.exerciseName;

          if (totalExplicitPRs >= 1 && !pr1Time) pr1Time = wTime;
          if (totalExplicitPRs >= 5 && !pr5Time) pr5Time = wTime;
          if (totalExplicitPRs >= 10 && !pr10Time) pr10Time = wTime;

          // Find muscle group
          const matchedEx = exercises.find((e) => e.id === pr.exerciseId);
          if (matchedEx) {
            distinctMusclesWithPR.add(matchedEx.muscleGroup);
            if (distinctMusclesWithPR.size >= 3 && !multiMusclesTime) multiMusclesTime = wTime;
          }
        });
      }

      // Check each exercise and set
      workout.exercises.forEach((wEx) => {
        const exId = wEx.exerciseId;
        const currentBest = exerciseMaxMap.get(exId) || 0;

        wEx.sets.forEach((set) => {
          if (set.completed && set.weight > 0 && set.reps > 0) {
            // Check highest weight
            if (set.weight > highestSingleWeight) {
              highestSingleWeight = set.weight;
              highestWeightExercise = wEx.exerciseName;
              highestWeightDate = workoutDate;
            }
            if (set.weight >= 50 && !weight50Time) weight50Time = wTime;
            if (set.weight >= 80 && !weight80Time) weight80Time = wTime;
            if (set.weight >= 100 && !weight100Time) weight100Time = wTime;

            // Check estimated 1RM
            const est1RM = calculate1RM(set.weight, set.reps);
            if (est1RM > highestEstimated1RM) {
              highestEstimated1RM = est1RM;
              highest1RMExercise = wEx.exerciseName;
            }
            if (est1RM >= 100 && !est1RM100Time) est1RM100Time = wTime;

            // Check single set volume
            const setVol = set.weight * set.reps;
            if (setVol > highestSingleSetVolume) {
              highestSingleSetVolume = setVol;
              highestSetVolumeExercise = `${wEx.exerciseName} (${set.weight}kg × ${set.reps})`;
            }
            if (setVol >= 500 && !setVol500Time) setVol500Time = wTime;
            if (setVol >= 1000 && !setVol1000Time) setVol1000Time = wTime;

            // Track if this set broke exercise PR
            if (currentBest > 0 && set.weight > currentBest) {
              if (!workoutHadPR) {
                totalExplicitPRs++;
                workoutHadPR = true;
                distinctExercisesWithPR.add(exId);
                distinctMusclesWithPR.add(wEx.muscleGroup);
                latestPRDate = workoutDate;
                latestPRExercise = wEx.exerciseName;
                if (totalExplicitPRs >= 1 && !pr1Time) pr1Time = wTime;
                if (totalExplicitPRs >= 5 && !pr5Time) pr5Time = wTime;
                if (totalExplicitPRs >= 10 && !pr10Time) pr10Time = wTime;
                if (distinctMusclesWithPR.size >= 3 && !multiMusclesTime) multiMusclesTime = wTime;
              }
            }

            if (set.isPersonalRecord && !workoutHadPR) {
              totalExplicitPRs++;
              workoutHadPR = true;
              distinctExercisesWithPR.add(exId);
              distinctMusclesWithPR.add(wEx.muscleGroup);
              latestPRDate = workoutDate;
              latestPRExercise = wEx.exerciseName;
              if (totalExplicitPRs >= 1 && !pr1Time) pr1Time = wTime;
              if (totalExplicitPRs >= 5 && !pr5Time) pr5Time = wTime;
              if (totalExplicitPRs >= 10 && !pr10Time) pr10Time = wTime;
              if (distinctMusclesWithPR.size >= 3 && !multiMusclesTime) multiMusclesTime = wTime;
            }

            if (set.weight > currentBest) {
              exerciseMaxMap.set(exId, set.weight);
            }
          }
        });
      });

      if (workoutHadPR) {
        workoutsWithPRs.add(workout.id);
        if (workoutsWithPRs.size >= 2 && !streakTime) streakTime = wTime;
      }
    });

    // Ensure totalExplicitPRs is at least the number of distinct exercises with PRs or records
    const finalPRCount = Math.max(totalExplicitPRs, distinctExercisesWithPR.size);
    const workoutsWithPRCount = workoutsWithPRs.size;

    // Define all 18 structured achievements
    const list: Achievement[] = [
      // ----------------- CATEGORIA: CARGA & PRs -----------------
      {
        id: 'pr-primeiro',
        title: 'Primeiro Recorde (PR)',
        category: 'carga',
        categoryLabel: 'Recorde de Carga',
        description: 'Supere sua marca anterior em qualquer exercício pela primeira vez.',
        icon: Trophy,
        unlocked: finalPRCount >= 1,
        unlockedAt: latestPRDate || undefined,
        unlockedTimestamp: pr1Time || 0,
        unlockedDetail: latestPRExercise ? `Conquistado com ${latestPRExercise}` : undefined,
        currentValue: Math.min(finalPRCount, 1),
        targetValue: 1,
        unit: 'PR',
        progressPercent: finalPRCount >= 1 ? 100 : 0,
        colorTone: 'cyan'
      },
      {
        id: 'pr-sobrecarga-5',
        title: 'Mestre da Sobrecarga',
        category: 'carga',
        categoryLabel: 'Sobrecarga Progressiva',
        description: 'Bata 5 recordes pessoais de carga ao longo da sua jornada de treinos.',
        icon: Flame,
        unlocked: finalPRCount >= 5,
        unlockedAt: finalPRCount >= 5 ? latestPRDate || undefined : undefined,
        unlockedTimestamp: pr5Time || 0,
        unlockedDetail: `${finalPRCount} recordes batidos até agora`,
        currentValue: finalPRCount,
        targetValue: 5,
        unit: 'PRs',
        progressPercent: Math.min(100, Math.round((finalPRCount / 5) * 100)),
        colorTone: 'amber'
      },
      {
        id: 'pr-lenda-10',
        title: 'Lenda dos Pesos Livres',
        category: 'carga',
        categoryLabel: 'Recordes Acumulados',
        description: 'Atinja a marca de 10 recordes pessoais de carga batidos na sua carreira.',
        icon: Crown,
        unlocked: finalPRCount >= 10,
        unlockedAt: finalPRCount >= 10 ? latestPRDate || undefined : undefined,
        unlockedTimestamp: pr10Time || 0,
        unlockedDetail: `${finalPRCount} recordes registrados`,
        currentValue: finalPRCount,
        targetValue: 10,
        unit: 'PRs',
        progressPercent: Math.min(100, Math.round((finalPRCount / 10) * 100)),
        colorTone: 'purple'
      },
      {
        id: 'carga-50kg',
        title: 'Clube dos 50 kg',
        category: 'carga',
        categoryLabel: 'Marca de Carga',
        description: 'Levante 50 kg ou mais de carga em qualquer exercício de musculação.',
        icon: Dumbbell,
        unlocked: highestSingleWeight >= 50,
        unlockedAt: highestWeightDate || undefined,
        unlockedTimestamp: weight50Time || 0,
        unlockedDetail: highestWeightExercise ? `${highestSingleWeight} kg em ${highestWeightExercise}` : undefined,
        currentValue: highestSingleWeight,
        targetValue: 50,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((highestSingleWeight / 50) * 100)),
        colorTone: 'cyan'
      },
      {
        id: 'carga-80kg',
        title: 'Clube dos 80 kg',
        category: 'carga',
        categoryLabel: 'Marca de Carga',
        description: 'Atinja ou supere a marca de 80 kg de carga máxima individual.',
        icon: Award,
        unlocked: highestSingleWeight >= 80,
        unlockedAt: highestWeightDate || undefined,
        unlockedTimestamp: weight80Time || 0,
        unlockedDetail: highestWeightExercise ? `${highestSingleWeight} kg em ${highestWeightExercise}` : undefined,
        currentValue: highestSingleWeight,
        targetValue: 80,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((highestSingleWeight / 80) * 100)),
        colorTone: 'amber'
      },
      {
        id: 'carga-100kg',
        title: 'Clube dos 100 kg (Centurião)',
        category: 'carga',
        categoryLabel: 'Marco Lendário',
        description: 'Supere a lendária marca de 100 kg em um exercício de ferro puro.',
        icon: Shield,
        unlocked: highestSingleWeight >= 100,
        unlockedAt: highestWeightDate || undefined,
        unlockedTimestamp: weight100Time || 0,
        unlockedDetail: highestWeightExercise ? `${highestSingleWeight} kg em ${highestWeightExercise}` : undefined,
        currentValue: highestSingleWeight,
        targetValue: 100,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((highestSingleWeight / 100) * 100)),
        colorTone: 'rose'
      },
      {
        id: 'carga-1rm-100',
        title: '1RM de Três Dígitos',
        category: 'carga',
        categoryLabel: 'Potência Máxima',
        description: 'Alcance uma estimativa de 1RM (repetição máxima) superior a 100 kg.',
        icon: Sparkles,
        unlocked: highestEstimated1RM >= 100,
        unlockedAt: highestEstimated1RM >= 100 ? latestPRDate || undefined : undefined,
        unlockedTimestamp: est1RM100Time || 0,
        unlockedDetail: highest1RMExercise ? `${highestEstimated1RM} kg estimado em ${highest1RMExercise}` : undefined,
        currentValue: highestEstimated1RM,
        targetValue: 100,
        unit: 'kg 1RM',
        progressPercent: Math.min(100, Math.round((highestEstimated1RM / 100) * 100)),
        colorTone: 'emerald'
      },
      {
        id: 'carga-multigrupos',
        title: 'Força Balanceada',
        category: 'carga',
        categoryLabel: 'Desenvolvimento Completo',
        description: 'Bata recordes pessoais em pelo menos 3 grupos musculares distintos.',
        icon: Layers,
        unlocked: distinctMusclesWithPR.size >= 3,
        unlockedAt: distinctMusclesWithPR.size >= 3 ? latestPRDate || undefined : undefined,
        unlockedTimestamp: multiMusclesTime || 0,
        unlockedDetail: Array.from(distinctMusclesWithPR).slice(0, 3).join(', '),
        currentValue: distinctMusclesWithPR.size,
        targetValue: 3,
        unit: 'músculos',
        progressPercent: Math.min(100, Math.round((distinctMusclesWithPR.size / 3) * 100)),
        colorTone: 'cyan'
      },

      // ----------------- CATEGORIA: VOLUME & TONELADAS -----------------
      {
        id: 'vol-1ton',
        title: 'Primeira Tonelada',
        category: 'volume',
        categoryLabel: 'Volume de Sessão',
        description: 'Acumule mais de 1.000 kg de volume total levantado em um treino.',
        icon: TrendingUp,
        unlocked: maxWorkoutVolume >= 1000,
        unlockedAt: maxWorkoutVolumeDate || undefined,
        unlockedTimestamp: vol1tonTime || 0,
        unlockedDetail: `${maxWorkoutVolume.toLocaleString('pt-BR')} kg em ${maxWorkoutVolumeName}`,
        currentValue: maxWorkoutVolume,
        targetValue: 1000,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((maxWorkoutVolume / 1000) * 100)),
        colorTone: 'cyan'
      },
      {
        id: 'vol-3ton',
        title: 'Carga Pesada (3 Toneladas)',
        category: 'volume',
        categoryLabel: 'Volume de Sessão',
        description: 'Atinja 3.000 kg de volume total levantado em um único treino.',
        icon: Zap,
        unlocked: maxWorkoutVolume >= 3000,
        unlockedAt: maxWorkoutVolumeDate || undefined,
        unlockedTimestamp: vol3tonTime || 0,
        unlockedDetail: `${maxWorkoutVolume.toLocaleString('pt-BR')} kg em ${maxWorkoutVolumeName}`,
        currentValue: maxWorkoutVolume,
        targetValue: 3000,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((maxWorkoutVolume / 3000) * 100)),
        colorTone: 'amber'
      },
      {
        id: 'vol-5ton',
        title: 'Máquina de 5 Toneladas',
        category: 'volume',
        categoryLabel: 'Volume de Sessão',
        description: 'Atinja o recorde de 5.000 kg de volume total levantado num único treino.',
        icon: Target,
        unlocked: maxWorkoutVolume >= 5000,
        unlockedAt: maxWorkoutVolumeDate || undefined,
        unlockedTimestamp: vol5tonTime || 0,
        unlockedDetail: `${maxWorkoutVolume.toLocaleString('pt-BR')} kg em ${maxWorkoutVolumeName}`,
        currentValue: maxWorkoutVolume,
        targetValue: 5000,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((maxWorkoutVolume / 5000) * 100)),
        colorTone: 'emerald'
      },
      {
        id: 'vol-10ton',
        title: 'Monstro de 10 Toneladas',
        category: 'volume',
        categoryLabel: 'Volume Épico',
        description: 'Atingir a marca épica de 10.000 kg de volume em uma única sessão.',
        icon: Trophy,
        unlocked: maxWorkoutVolume >= 10000,
        unlockedAt: maxWorkoutVolumeDate || undefined,
        unlockedTimestamp: vol10tonTime || 0,
        unlockedDetail: `${maxWorkoutVolume.toLocaleString('pt-BR')} kg em ${maxWorkoutVolumeName}`,
        currentValue: maxWorkoutVolume,
        targetValue: 10000,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((maxWorkoutVolume / 10000) * 100)),
        colorTone: 'purple'
      },
      {
        id: 'vol-serie-500',
        title: 'Super Série de Volume',
        category: 'volume',
        categoryLabel: 'Intensidade em 1 Série',
        description: 'Atinja 500 kg de volume em uma única série (Carga × Repetições).',
        icon: Layers,
        unlocked: highestSingleSetVolume >= 500,
        unlockedAt: highestSingleSetVolume >= 500 ? latestPRDate || undefined : undefined,
        unlockedTimestamp: setVol500Time || 0,
        unlockedDetail: highestSetVolumeExercise ? `${highestSingleSetVolume} kg (${highestSetVolumeExercise})` : undefined,
        currentValue: highestSingleSetVolume,
        targetValue: 500,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((highestSingleSetVolume / 500) * 100)),
        colorTone: 'cyan'
      },
      {
        id: 'vol-serie-1000',
        title: 'Série Titânica de 1.000 kg',
        category: 'volume',
        categoryLabel: 'Intensidade Extrema',
        description: 'Alcance 1.000 kg de volume acumulado em apenas 1 série.',
        icon: Flame,
        unlocked: highestSingleSetVolume >= 1000,
        unlockedAt: highestSingleSetVolume >= 1000 ? latestPRDate || undefined : undefined,
        unlockedTimestamp: setVol1000Time || 0,
        unlockedDetail: highestSetVolumeExercise ? `${highestSingleSetVolume} kg (${highestSetVolumeExercise})` : undefined,
        currentValue: highestSingleSetVolume,
        targetValue: 1000,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((highestSingleSetVolume / 1000) * 100)),
        colorTone: 'rose'
      },
      {
        id: 'vol-total-25k',
        title: 'Acumulador de 25 Toneladas',
        category: 'volume',
        categoryLabel: 'Carreira Acumulada',
        description: 'Acumule 25.000 kg de volume somando todo o seu histórico de treinos.',
        icon: Award,
        unlocked: totalCumulativeVolume >= 25000,
        unlockedAt: totalCumulativeVolume >= 25000 ? latestPRDate || undefined : undefined,
        unlockedTimestamp: vol25kTime || 0,
        unlockedDetail: `${totalCumulativeVolume.toLocaleString('pt-BR')} kg acumulados`,
        currentValue: totalCumulativeVolume,
        targetValue: 25000,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((totalCumulativeVolume / 25000) * 100)),
        colorTone: 'amber'
      },
      {
        id: 'vol-total-50k',
        title: 'Lenda das 50 Toneladas',
        category: 'volume',
        categoryLabel: 'Carreira de Aço',
        description: 'Atinja 50.000 kg de ferro total movimentado na sua trajetória.',
        icon: Crown,
        unlocked: totalCumulativeVolume >= 50000,
        unlockedAt: totalCumulativeVolume >= 50000 ? latestPRDate || undefined : undefined,
        unlockedTimestamp: vol50kTime || 0,
        unlockedDetail: `${totalCumulativeVolume.toLocaleString('pt-BR')} kg levantados`,
        currentValue: totalCumulativeVolume,
        targetValue: 50000,
        unit: 'kg',
        progressPercent: Math.min(100, Math.round((totalCumulativeVolume / 50000) * 100)),
        colorTone: 'purple'
      },

      // ----------------- CATEGORIA: ESPECIAIS & CONSISTÊNCIA -----------------
      {
        id: 'consist-sequencia',
        title: 'Sequência Imparável',
        category: 'especial',
        categoryLabel: 'Consistência de PRs',
        description: 'Bata recordes pessoais de carga em pelo menos 2 treinos registrados.',
        icon: CheckCircle2,
        unlocked: workoutsWithPRCount >= 2,
        unlockedAt: workoutsWithPRCount >= 2 ? latestPRDate || undefined : undefined,
        unlockedTimestamp: streakTime || 0,
        unlockedDetail: `${workoutsWithPRCount} treinos com novos recordes batidos`,
        currentValue: workoutsWithPRCount,
        targetValue: 2,
        unit: 'treinos',
        progressPercent: Math.min(100, Math.round((workoutsWithPRCount / 2) * 100)),
        colorTone: 'emerald'
      },
      {
        id: 'consist-semanal',
        title: 'Semana de Elite',
        category: 'especial',
        categoryLabel: 'Volume Semanal',
        description: 'Acumule mais de 15.000 kg de volume total nos últimos 7 dias.',
        icon: Sparkles,
        unlocked: last7DaysVolume >= 15000,
        unlockedAt: last7DaysVolume >= 15000 ? 'Últimos 7 dias' : undefined,
        unlockedTimestamp: last7DaysVolume >= 15000 ? Date.now() : 0,
        unlockedDetail: `${last7DaysVolume.toLocaleString('pt-BR')} kg movimentados nesta semana`,
        currentValue: last7DaysVolume,
        targetValue: 15000,
        unit: 'kg 7d',
        progressPercent: Math.min(100, Math.round((last7DaysVolume / 15000) * 100)),
        colorTone: 'cyan'
      }
    ];

    // Sort achievements so that the most recent ones appear at the beginning!
    const sortedList = [...list].sort((a, b) => {
      // 1. Both unlocked: newest timestamp first (mais recentes primeiro)
      if (a.unlocked && b.unlocked) {
        const timeDiff = (b.unlockedTimestamp || 0) - (a.unlockedTimestamp || 0);
        if (timeDiff !== 0) return timeDiff;
        return b.progressPercent - a.progressPercent;
      }
      // 2. Unlocked comes before locked
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;

      // 3. Both locked: sort by highest progress percentage (closest to unlock)
      return b.progressPercent - a.progressPercent;
    });

    const unlockedCount = sortedList.filter((a) => a.unlocked).length;
    const totalCount = sortedList.length;
    const overallProgress = Math.round((unlockedCount / totalCount) * 100);

    return {
      list: sortedList,
      unlockedCount,
      totalCount,
      overallProgress,
      finalPRCount,
      highestSingleWeight,
      highestWeightExercise,
      maxWorkoutVolume,
      maxWorkoutVolumeName,
      totalCumulativeVolume
    };
  }, [history, exercises, last7DaysVolume]);

  // Filter list based on selected tab
  const filteredAchievements = useMemo(() => {
    if (selectedFilter === 'all') return achievementsData.list;
    if (selectedFilter === 'unlocked') return achievementsData.list.filter((a) => a.unlocked);
    return achievementsData.list.filter((a) => a.category === selectedFilter);
  }, [achievementsData.list, selectedFilter]);

  // Display only first row (3 items) when minimized, or all when clicked
  const displayedAchievements = useMemo(() => {
    if (isExpanded) return filteredAchievements;
    return filteredAchievements.slice(0, 3);
  }, [filteredAchievements, isExpanded]);

  // Handle achievement card click
  const handleAchievementClick = (achievement: Achievement) => {
    setActiveModalAchievement(achievement);

    if (achievement.unlocked) {
      soundFx.playCelebration();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback
      }
    } else {
      soundFx.playTick();
    }
  };

  // Tone colors mapping
  const toneMap = {
    cyan: {
      bgGlow: 'bg-[#00D1C1]/15',
      border: 'border-[#00D1C1]/40',
      text: 'text-[#00D1C1]',
      badgeBg: 'bg-[#00D1C1]/10',
      progressBar: 'bg-[#00D1C1]'
    },
    amber: {
      bgGlow: 'bg-amber-400/15',
      border: 'border-amber-400/40',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-400/10',
      progressBar: 'bg-amber-400'
    },
    emerald: {
      bgGlow: 'bg-emerald-400/15',
      border: 'border-emerald-400/40',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-400/10',
      progressBar: 'bg-emerald-400'
    },
    purple: {
      bgGlow: 'bg-purple-400/15',
      border: 'border-purple-400/40',
      text: 'text-purple-400',
      badgeBg: 'bg-purple-400/10',
      progressBar: 'bg-purple-400'
    },
    rose: {
      bgGlow: 'bg-rose-400/15',
      border: 'border-rose-400/40',
      text: 'text-rose-400',
      badgeBg: 'bg-rose-400/10',
      progressBar: 'bg-rose-400'
    }
  };

  return (
    <section 
      id="achievements-section"
      className="bg-[#161616] border border-white/5 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-20 -left-20 w-52 h-52 bg-[#00D1C1]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00D1C1]/15 text-[#00D1C1] flex items-center justify-center border border-[#00D1C1]/30 shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Conquistas
              </h2>
              <span className="text-[11px] font-mono-numbers font-black px-2.5 py-0.5 rounded-full bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30">
                {achievementsData.unlockedCount} / {achievementsData.totalCount}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Desbloqueie ícones ao bater seus recordes pessoais (PRs) de carga e volume
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full sm:w-56 bg-[#111114] border border-white/5 rounded-2xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-neutral-400 uppercase">Progresso Geral</span>
            <span className="text-[#00D1C1] font-mono-numbers font-black">
              {achievementsData.overallProgress}% Concluído
            </span>
          </div>
          <div className="w-full h-2 bg-[#222226] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00D1C1] to-[#00FFE0] transition-all duration-500 rounded-full"
              style={{ width: `${achievementsData.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick PR Highlights Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 relative z-10">
        <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">PRs de Carga Batidos</span>
          <p className="text-sm font-black font-mono-numbers text-[#00D1C1] mt-0.5">
            {achievementsData.finalPRCount} recordes
          </p>
        </div>

        <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Maior Carga Levantada</span>
          <p className="text-sm font-black font-mono-numbers text-white mt-0.5 truncate" title={achievementsData.highestWeightExercise}>
            {achievementsData.highestSingleWeight > 0 ? `${achievementsData.highestSingleWeight} kg` : '—'}
          </p>
        </div>

        <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Recorde de Volume / Treino</span>
          <p className="text-sm font-black font-mono-numbers text-amber-400 mt-0.5">
            {achievementsData.maxWorkoutVolume > 0 ? `${achievementsData.maxWorkoutVolume.toLocaleString('pt-BR')} kg` : '—'}
          </p>
        </div>

        <div className="bg-[#111114] border border-white/5 rounded-2xl p-2.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase">Volume Total Carreira</span>
          <p className="text-sm font-black font-mono-numbers text-purple-400 mt-0.5">
            {achievementsData.totalCumulativeVolume > 0 ? `${achievementsData.totalCumulativeVolume.toLocaleString('pt-BR')} kg` : '—'}
          </p>
        </div>
      </div>

      {/* Interactive Category Filter Tabs (Zero-pill functional buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
        <button
          type="button"
          onClick={() => {
            setSelectedFilter('all');
            soundFx.playTick();
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
            selectedFilter === 'all'
              ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20'
              : 'bg-[#1e1e22] text-neutral-400 hover:text-white border border-white/5'
          }`}
        >
          Todas ({achievementsData.totalCount})
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedFilter('carga');
            soundFx.playTick();
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            selectedFilter === 'carga'
              ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20'
              : 'bg-[#1e1e22] text-neutral-400 hover:text-white border border-white/5'
          }`}
        >
          <Dumbbell size={13} />
          Cargas & PRs (8)
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedFilter('volume');
            soundFx.playTick();
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            selectedFilter === 'volume'
              ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20'
              : 'bg-[#1e1e22] text-neutral-400 hover:text-white border border-white/5'
          }`}
        >
          <TrendingUp size={13} />
          Volume & Toneladas (8)
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedFilter('especial');
            soundFx.playTick();
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            selectedFilter === 'especial'
              ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20'
              : 'bg-[#1e1e22] text-neutral-400 hover:text-white border border-white/5'
          }`}
        >
          <Sparkles size={13} />
          Consistência (2)
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedFilter('unlocked');
            soundFx.playTick();
          }}
          className={`shrink-0 px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
            selectedFilter === 'unlocked'
              ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20'
              : 'bg-[#1e1e22] text-neutral-400 hover:text-white border border-white/5'
          }`}
        >
          <Unlock size={13} />
          Desbloqueadas ({achievementsData.unlockedCount})
        </button>
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
        {displayedAchievements.map((item) => {
          const Icon = item.icon;
          const tone = toneMap[item.colorTone] || toneMap.cyan;

          return (
            <div
              key={item.id}
              onClick={() => handleAchievementClick(item)}
              role="button"
              tabIndex={0}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer active:scale-[0.98] select-none flex flex-col justify-between group relative overflow-hidden ${
                item.unlocked
                  ? `bg-[#18181c] hover:bg-[#202026] ${tone.border} shadow-lg hover:shadow-xl`
                  : 'bg-[#121214] hover:bg-[#16161a] border-white/5 opacity-70 hover:opacity-90'
              }`}
            >
              {/* Subtle Ambient Backlight when Unlocked */}
              {item.unlocked && (
                <div className={`absolute top-0 right-0 w-24 h-24 ${tone.bgGlow} rounded-full blur-2xl pointer-events-none -mr-8 -mt-8`} />
              )}

              <div>
                {/* Card Top: Icon + Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      item.unlocked
                        ? `${tone.bgGlow} ${tone.text} border ${tone.border}`
                        : 'bg-white/5 text-neutral-500 border border-white/5'
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  {item.unlocked ? (
                    <div className="flex items-center gap-1 text-[10px] font-black text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-full border border-[#00D1C1]/30">
                      <CheckCircle2 size={11} />
                      <span>Desbloqueada</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                      <Lock size={11} className="text-neutral-500" />
                      <span>{item.progressPercent}%</span>
                    </div>
                  )}
                </div>

                {/* Title & Category */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    {item.categoryLabel}
                  </span>
                  <h3
                    className={`text-sm font-extrabold tracking-tight transition-colors ${
                      item.unlocked ? 'text-white group-hover:text-[#00D1C1]' : 'text-neutral-300'
                    }`}
                  >
                    {item.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Card Footer: Progress Bar or Unlock Detail */}
              <div className="pt-3 mt-2 border-t border-white/5">
                {item.unlocked ? (
                  <div className="flex items-center justify-between text-[10px] font-mono-numbers">
                    <span className="text-neutral-400">
                      {item.unlockedAt ? `Data: ${item.unlockedAt}` : 'Conquistado!'}
                    </span>
                    <span className={`font-black ${tone.text} flex items-center gap-0.5`}>
                      Recorde batido <Sparkles size={11} />
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono-numbers">
                      <span className="text-neutral-400">Progresso</span>
                      <span className="text-white font-bold">
                        {item.currentValue.toLocaleString('pt-BR')} / {item.targetValue.toLocaleString('pt-BR')} {item.unit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#202026] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${tone.progressBar} transition-all duration-300 rounded-full`}
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand / Minimize Toggle Button (Mostra só a 1ª fila, minimiza o resto) */}
      {filteredAchievements.length > 3 && (
        <div className="pt-2 flex flex-col items-center justify-center gap-1.5 relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(!isExpanded);
              soundFx.playTick();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1e1e24] hover:bg-[#262630] text-neutral-200 hover:text-white border border-white/10 hover:border-[#00D1C1]/40 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer group"
          >
            {isExpanded ? (
              <>
                <span>Mostrar Menos</span>
                <ChevronUp size={16} className="text-[#00D1C1] group-hover:-translate-y-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>Ver Todas as Conquistas ({filteredAchievements.length})</span>
                <ChevronDown size={16} className="text-[#00D1C1] group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
          {!isExpanded && (
            <span className="text-[10px] text-neutral-500 font-mono-numbers">
              Primeira fila exibida ({displayedAchievements.length} de {filteredAchievements.length}) · Mais recentes no início
            </span>
          )}
        </div>
      )}

      {/* Achievement Detail Modal */}
      {activeModalAchievement && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setActiveModalAchievement(null)}
        >
          <div
            className="bg-[#18181c] border border-white/10 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalAchievement(null)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Icon Container */}
            <div className="flex justify-center pt-2">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
                  activeModalAchievement.unlocked
                    ? 'bg-[#00D1C1]/20 text-[#00D1C1] border border-[#00D1C1]/40'
                    : 'bg-white/5 text-neutral-400 border border-white/10'
                }`}
              >
                {React.createElement(activeModalAchievement.icon, { size: 32 })}
              </div>
            </div>

            {/* Modal Title & Status */}
            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {activeModalAchievement.unlocked ? (
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#00D1C1] flex items-center gap-1">
                    <CheckCircle2 size={13} /> CONQUISTA DESBLOQUEADA!
                  </span>
                ) : (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Lock size={13} /> EM PROGRESSO ({activeModalAchievement.progressPercent}%)
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-white">
                {activeModalAchievement.title}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {activeModalAchievement.description}
              </p>
            </div>

            {/* Stats Breakdown Box */}
            <div className="bg-[#111114] border border-white/5 rounded-2xl p-3.5 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Meta Necessária:</span>
                <span className="text-white font-mono-numbers font-bold">
                  {activeModalAchievement.targetValue.toLocaleString('pt-BR')} {activeModalAchievement.unit}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Sua Marca Atual:</span>
                <span className="text-[#00D1C1] font-mono-numbers font-extrabold">
                  {activeModalAchievement.currentValue.toLocaleString('pt-BR')} {activeModalAchievement.unit}
                </span>
              </div>

              {activeModalAchievement.unlockedDetail && (
                <div className="pt-2 border-t border-white/5 text-[11px] text-neutral-300">
                  <span className="text-neutral-400">Detalhe: </span>
                  {activeModalAchievement.unlockedDetail}
                </div>
              )}

              {activeModalAchievement.unlockedAt && (
                <div className="text-[10px] text-neutral-400">
                  <span>Conquistada em: </span>
                  <span className="text-white font-bold">{activeModalAchievement.unlockedAt}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-1">
              {activeModalAchievement.unlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playCelebration();
                    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
                  }}
                  className="w-full py-2.5 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-xl shadow-lg shadow-[#00D1C1]/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} /> Celebrar Conquista Novamente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveModalAchievement(null)}
                  className="w-full py-2.5 bg-[#222228] hover:bg-[#282830] text-white font-bold text-xs rounded-xl active:scale-95 transition-all"
                >
                  Continuar Treinando
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
