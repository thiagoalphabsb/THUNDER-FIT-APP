import { CompletedWorkout } from '../types';

export const INITIAL_HISTORY: CompletedWorkout[] = [
  {
    id: 'workout-2026-08-20',
    routineId: 'routine-push-a',
    routineName: 'Push A — Peito, Ombros e Tríceps',
    startedAt: '2026-08-20T17:30:00.000Z',
    completedAt: '2026-08-20T18:32:00.000Z',
    durationSeconds: 3720, // 1h 02min
    totalVolumeKg: 7840,
    totalSets: 18,
    totalReps: 168,
    rating: 9,
    notes: 'Treino excelente! Consegui subir carga no supino reto na última série.',
    personalRecords: [
      {
        exerciseId: 'supino-reto-barra',
        exerciseName: 'Supino Reto com Barra',
        weight: 67,
        reps: 8,
        previousBest: 65,
        type: 'max_weight'
      }
    ],
    exercises: [
      {
        id: 'we-1',
        exerciseId: 'supino-reto-barra',
        exerciseName: 'Supino Reto com Barra',
        muscleGroup: 'Peito',
        equipment: 'Barra',
        restSeconds: 120,
        sets: [
          { id: 's1', setNumber: 1, type: 'normal', weight: 60, reps: 10, completed: true, previousWeight: 58, previousReps: 10 },
          { id: 's2', setNumber: 2, type: 'normal', weight: 62.5, reps: 9, completed: true, previousWeight: 60, previousReps: 10 },
          { id: 's3', setNumber: 3, type: 'normal', weight: 65, reps: 8, completed: true, previousWeight: 62.5, previousReps: 8 },
          { id: 's4', setNumber: 4, type: 'normal', weight: 67, reps: 8, completed: true, isPersonalRecord: true, previousWeight: 65, previousReps: 7 }
        ]
      },
      {
        id: 'we-2',
        exerciseId: 'supino-inclinado-halteres',
        exerciseName: 'Supino Inclinado com Halteres',
        muscleGroup: 'Peito',
        equipment: 'Halteres',
        restSeconds: 120,
        sets: [
          { id: 's5', setNumber: 1, type: 'normal', weight: 26, reps: 10, completed: true, previousWeight: 24, previousReps: 10 },
          { id: 's6', setNumber: 2, type: 'normal', weight: 26, reps: 10, completed: true, previousWeight: 26, previousReps: 9 },
          { id: 's7', setNumber: 3, type: 'normal', weight: 28, reps: 8, completed: true, isPersonalRecord: true, previousWeight: 26, previousReps: 8 }
        ]
      },
      {
        id: 'we-3',
        exerciseId: 'desenvolvimento-halteres',
        exerciseName: 'Desenvolvimento com Halteres',
        muscleGroup: 'Ombros',
        equipment: 'Halteres',
        restSeconds: 120,
        sets: [
          { id: 's8', setNumber: 1, type: 'normal', weight: 18, reps: 10, completed: true, previousWeight: 16, previousReps: 10 },
          { id: 's9', setNumber: 2, type: 'normal', weight: 18, reps: 10, completed: true, previousWeight: 18, previousReps: 10 },
          { id: 's10', setNumber: 3, type: 'normal', weight: 20, reps: 8, completed: true, isPersonalRecord: true, previousWeight: 18, previousReps: 9 }
        ]
      },
      {
        id: 'we-4',
        exerciseId: 'elevacao-lateral-polia',
        exerciseName: 'Elevação Lateral na Polia',
        muscleGroup: 'Ombros',
        equipment: 'Polia',
        restSeconds: 90,
        sets: [
          { id: 's11', setNumber: 1, type: 'normal', weight: 8, reps: 12, completed: true, previousWeight: 7, previousReps: 12 },
          { id: 's12', setNumber: 2, type: 'normal', weight: 8, reps: 12, completed: true, previousWeight: 8, previousReps: 11 },
          { id: 's13', setNumber: 3, type: 'normal', weight: 9, reps: 10, completed: true, isPersonalRecord: true, previousWeight: 8, previousReps: 10 }
        ]
      },
      {
        id: 'we-5',
        exerciseId: 'triceps-pulley-corda',
        exerciseName: 'Tríceps Corda no Pulley',
        muscleGroup: 'Tríceps',
        equipment: 'Polia',
        restSeconds: 90,
        sets: [
          { id: 's14', setNumber: 1, type: 'normal', weight: 25, reps: 12, completed: true, previousWeight: 22.5, previousReps: 12 },
          { id: 's15', setNumber: 2, type: 'normal', weight: 25, reps: 12, completed: true, previousWeight: 25, previousReps: 11 },
          { id: 's16', setNumber: 3, type: 'normal', weight: 27.5, reps: 10, completed: true, previousWeight: 25, previousReps: 10 }
        ]
      }
    ]
  },
  {
    id: 'workout-2026-08-18',
    routineId: 'routine-pull-a',
    routineName: 'Pull A — Costas, Bíceps e Ombros',
    startedAt: '2026-08-18T18:00:00.000Z',
    completedAt: '2026-08-18T18:58:00.000Z',
    durationSeconds: 3480, // 58 min
    totalVolumeKg: 8120,
    totalSets: 17,
    totalReps: 165,
    rating: 8,
    notes: 'Dorsais com pump monstro. Puxada alta subiu para 60kg.',
    personalRecords: [
      {
        exerciseId: 'puxada-alta-aberta',
        exerciseName: 'Puxada Alta Aberta (Lat Pulldown)',
        weight: 60,
        reps: 9,
        previousBest: 55,
        type: 'max_weight'
      }
    ],
    exercises: [
      {
        id: 'we-pull-1',
        exerciseId: 'puxada-alta-aberta',
        exerciseName: 'Puxada Alta Aberta (Lat Pulldown)',
        muscleGroup: 'Costas',
        equipment: 'Polia',
        restSeconds: 120,
        sets: [
          { id: 'p1', setNumber: 1, type: 'normal', weight: 50, reps: 12, completed: true },
          { id: 'p2', setNumber: 2, type: 'normal', weight: 55, reps: 10, completed: true },
          { id: 'p3', setNumber: 3, type: 'normal', weight: 60, reps: 9, completed: true, isPersonalRecord: true },
          { id: 'p4', setNumber: 4, type: 'normal', weight: 60, reps: 8, completed: true }
        ]
      },
      {
        id: 'we-pull-2',
        exerciseId: 'remada-curvada-barra',
        exerciseName: 'Remada Curvada com Barra',
        muscleGroup: 'Costas',
        equipment: 'Barra',
        restSeconds: 120,
        sets: [
          { id: 'p5', setNumber: 1, type: 'normal', weight: 55, reps: 10, completed: true },
          { id: 'p6', setNumber: 2, type: 'normal', weight: 60, reps: 8, completed: true },
          { id: 'p7', setNumber: 3, type: 'normal', weight: 60, reps: 8, completed: true },
          { id: 'p8', setNumber: 4, type: 'normal', weight: 62.5, reps: 6, completed: true }
        ]
      },
      {
        id: 'we-pull-3',
        exerciseId: 'remada-serrote-halteres',
        exerciseName: 'Remada Unilateral com Halter (Serrote)',
        muscleGroup: 'Costas',
        equipment: 'Halteres',
        restSeconds: 90,
        sets: [
          { id: 'p9', setNumber: 1, type: 'normal', weight: 24, reps: 10, completed: true },
          { id: 'p10', setNumber: 2, type: 'normal', weight: 24, reps: 10, completed: true },
          { id: 'p11', setNumber: 3, type: 'normal', weight: 26, reps: 8, completed: true }
        ]
      },
      {
        id: 'we-pull-4',
        exerciseId: 'rosca-direta-barra-w',
        exerciseName: 'Rosca Direta com Barra W',
        muscleGroup: 'Bíceps',
        equipment: 'Barra',
        restSeconds: 90,
        sets: [
          { id: 'p12', setNumber: 1, type: 'normal', weight: 22, reps: 10, completed: true },
          { id: 'p13', setNumber: 2, type: 'normal', weight: 24, reps: 8, completed: true },
          { id: 'p14', setNumber: 3, type: 'normal', weight: 24, reps: 8, completed: true }
        ]
      }
    ]
  },
  {
    id: 'workout-2026-08-16',
    routineId: 'routine-legs-focus',
    routineName: 'Legs — Membros Inferiores',
    startedAt: '2026-08-16T18:15:00.000Z',
    completedAt: '2026-08-16T19:20:00.000Z',
    durationSeconds: 3900, // 1h 05min
    totalVolumeKg: 10450,
    totalSets: 19,
    totalReps: 184,
    rating: 10,
    notes: 'Agachamento com 85kg bateu recorde!',
    personalRecords: [
      {
        exerciseId: 'agachamento-livre-barra',
        exerciseName: 'Agachamento Livre com Barra',
        weight: 85,
        reps: 8,
        previousBest: 80,
        type: 'max_weight'
      }
    ],
    exercises: [
      {
        id: 'we-leg-1',
        exerciseId: 'agachamento-livre-barra',
        exerciseName: 'Agachamento Livre com Barra',
        muscleGroup: 'Quadríceps',
        equipment: 'Barra',
        restSeconds: 180,
        sets: [
          { id: 'l1', setNumber: 1, type: 'normal', weight: 70, reps: 10, completed: true },
          { id: 'l2', setNumber: 2, type: 'normal', weight: 80, reps: 8, completed: true },
          { id: 'l3', setNumber: 3, type: 'normal', weight: 85, reps: 8, completed: true, isPersonalRecord: true },
          { id: 'l4', setNumber: 4, type: 'normal', weight: 85, reps: 6, completed: true }
        ]
      },
      {
        id: 'we-leg-2',
        exerciseId: 'leg-press-45',
        exerciseName: 'Leg Press 45º',
        muscleGroup: 'Quadríceps',
        equipment: 'Máquina',
        restSeconds: 120,
        sets: [
          { id: 'l5', setNumber: 1, type: 'normal', weight: 160, reps: 12, completed: true },
          { id: 'l6', setNumber: 2, type: 'normal', weight: 180, reps: 10, completed: true },
          { id: 'l7', setNumber: 3, type: 'normal', weight: 200, reps: 8, completed: true }
        ]
      },
      {
        id: 'we-leg-3',
        exerciseId: 'mesa-flexora',
        exerciseName: 'Mesa Flexora',
        muscleGroup: 'Posteriores',
        equipment: 'Máquina',
        restSeconds: 90,
        sets: [
          { id: 'l8', setNumber: 1, type: 'normal', weight: 35, reps: 12, completed: true },
          { id: 'l9', setNumber: 2, type: 'normal', weight: 40, reps: 10, completed: true },
          { id: 'l10', setNumber: 3, type: 'normal', weight: 40, reps: 10, completed: true }
        ]
      }
    ]
  },
  {
    id: 'workout-2026-08-14',
    routineId: 'routine-push-a',
    routineName: 'Push A — Peito, Ombros e Tríceps',
    startedAt: '2026-08-14T17:40:00.000Z',
    completedAt: '2026-08-14T18:40:00.000Z',
    durationSeconds: 3600,
    totalVolumeKg: 7350,
    totalSets: 17,
    totalReps: 160,
    rating: 8,
    personalRecords: [],
    exercises: [
      {
        id: 'we-old-1',
        exerciseId: 'supino-reto-barra',
        exerciseName: 'Supino Reto com Barra',
        muscleGroup: 'Peito',
        equipment: 'Barra',
        restSeconds: 120,
        sets: [
          { id: 'o1', setNumber: 1, type: 'normal', weight: 58, reps: 10, completed: true },
          { id: 'o2', setNumber: 2, type: 'normal', weight: 60, reps: 10, completed: true },
          { id: 'o3', setNumber: 3, type: 'normal', weight: 62.5, reps: 8, completed: true },
          { id: 'o4', setNumber: 4, type: 'normal', weight: 65, reps: 7, completed: true }
        ]
      }
    ]
  },
  {
    id: 'workout-2026-08-11',
    routineId: 'routine-push-a',
    routineName: 'Push A — Peito, Ombros e Tríceps',
    startedAt: '2026-08-11T17:00:00.000Z',
    completedAt: '2026-08-11T18:00:00.000Z',
    durationSeconds: 3600,
    totalVolumeKg: 6900,
    totalSets: 16,
    totalReps: 155,
    rating: 8,
    personalRecords: [],
    exercises: [
      {
        id: 'we-old-0',
        exerciseId: 'supino-reto-barra',
        exerciseName: 'Supino Reto com Barra',
        muscleGroup: 'Peito',
        equipment: 'Barra',
        restSeconds: 120,
        sets: [
          { id: 'o0-1', setNumber: 1, type: 'normal', weight: 55, reps: 10, completed: true },
          { id: 'o0-2', setNumber: 2, type: 'normal', weight: 57.5, reps: 10, completed: true },
          { id: 'o0-3', setNumber: 3, type: 'normal', weight: 60, reps: 8, completed: true }
        ]
      }
    ]
  }
];
