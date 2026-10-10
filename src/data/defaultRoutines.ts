import { Routine } from '../types';

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'routine-push-a',
    name: 'Push A — Peito, Ombros e Tríceps',
    description: 'Foco no desenvolvimento do peitoral clavicular, deltóide anterior/lateral e tríceps.',
    targetMuscles: ['Peito', 'Ombros', 'Tríceps'],
    createdAt: '2026-08-01T10:00:00.000Z',
    lastPerformed: '2026-08-20T14:30:00.000Z',
    exercises: [
      {
        exerciseId: 'supino-reto-barra',
        setsCount: 4,
        targetReps: 8,
        initialWeight: 65,
        restSeconds: 120,
        notes: 'Aquecer bem manguito. Controlar a descida em 2s.'
      },
      {
        exerciseId: 'supino-inclinado-halteres',
        setsCount: 3,
        targetReps: 10,
        initialWeight: 26,
        restSeconds: 120,
        notes: 'Inclinação de 30º para peitoral superior.'
      },
      {
        exerciseId: 'crossover-polia',
        setsCount: 3,
        targetReps: 12,
        initialWeight: 20,
        restSeconds: 90,
        notes: 'Pico de contração de 1s no meio.'
      },
      {
        exerciseId: 'desenvolvimento-halteres',
        setsCount: 3,
        targetReps: 10,
        initialWeight: 18,
        restSeconds: 120,
        notes: 'Travar o core e não arquear excessivamente a lombar.'
      },
      {
        exerciseId: 'elevacao-lateral-polia',
        setsCount: 4,
        targetReps: 12,
        initialWeight: 8,
        restSeconds: 90,
        notes: 'Movimento estrito sem impulso corporal.'
      },
      {
        exerciseId: 'triceps-pulley-corda',
        setsCount: 3,
        targetReps: 12,
        initialWeight: 25,
        restSeconds: 90,
        notes: 'Abrir a corda no final para pico lateral.'
      },
      {
        exerciseId: 'triceps-testa-barra-w',
        setsCount: 3,
        targetReps: 10,
        initialWeight: 24,
        restSeconds: 90,
        notes: 'Cotovelos firmes e apontando para trás.'
      }
    ]
  },
  {
    id: 'routine-pull-a',
    name: 'Pull A — Costas, Bíceps e Deltóide Posterior',
    description: 'Foco na espessura e densidade das costas, bíceps e trapézio/posteriorde ombro.',
    targetMuscles: ['Costas', 'Bíceps', 'Ombros'],
    createdAt: '2026-08-01T10:00:00.000Z',
    lastPerformed: '2026-08-18T16:00:00.000Z',
    exercises: [
      {
        exerciseId: 'puxada-alta-aberta',
        setsCount: 4,
        targetReps: 10,
        initialWeight: 55,
        restSeconds: 120,
        notes: 'Puxar com os cotovelos apontando para baixo.'
      },
      {
        exerciseId: 'remada-curvada-barra',
        setsCount: 4,
        targetReps: 8,
        initialWeight: 60,
        restSeconds: 120,
        notes: 'Tronco a 45º, coluna neutra.'
      },
      {
        exerciseId: 'remada-serrote-halteres',
        setsCount: 3,
        targetReps: 10,
        initialWeight: 24,
        restSeconds: 90,
        notes: 'Alongar bem a dorsal na descida.'
      },
      {
        exerciseId: 'face-pull-polia',
        setsCount: 3,
        targetReps: 15,
        initialWeight: 20,
        restSeconds: 90,
        notes: 'Rotação externa dos ombros no topo.'
      },
      {
        exerciseId: 'rosca-direta-barra-w',
        setsCount: 3,
        targetReps: 10,
        initialWeight: 22,
        restSeconds: 90,
        notes: 'Não balançar a coluna.'
      },
      {
        exerciseId: 'rosca-martelo-halteres',
        setsCount: 3,
        targetReps: 12,
        initialWeight: 14,
        restSeconds: 90,
        notes: 'Foco no braquial e antebraço.'
      }
    ]
  },
  {
    id: 'routine-legs-focus',
    name: 'Legs — Quadríceps, Isquiotibiais e Panturrilha',
    description: 'Dia completo e pesado de membros inferiores com agachamento e flexores.',
    targetMuscles: ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas'],
    createdAt: '2026-08-01T10:00:00.000Z',
    lastPerformed: '2026-08-16T18:00:00.000Z',
    exercises: [
      {
        exerciseId: 'agachamento-livre-barra',
        setsCount: 4,
        targetReps: 8,
        initialWeight: 80,
        restSeconds: 180,
        notes: 'Profundidade paralela ou além. Travar abdômen.'
      },
      {
        exerciseId: 'leg-press-45',
        setsCount: 4,
        targetReps: 10,
        initialWeight: 180,
        restSeconds: 120,
        notes: 'Não deixar a lombar descolar.'
      },
      {
        exerciseId: 'cadeira-extensora',
        setsCount: 3,
        targetReps: 12,
        initialWeight: 45,
        restSeconds: 90,
        notes: '1s de isometria no topo.'
      },
      {
        exerciseId: 'mesa-flexora',
        setsCount: 4,
        targetReps: 10,
        initialWeight: 40,
        restSeconds: 90,
        notes: 'Manter o quadril colado no banco.'
      },
      {
        exerciseId: 'stiff-barra',
        setsCount: 3,
        targetReps: 10,
        initialWeight: 50,
        restSeconds: 120,
        notes: 'Empurrar o quadril para trás sentindo os posteriores.'
      },
      {
        exerciseId: 'gemeos-em-pe-smith',
        setsCount: 4,
        targetReps: 15,
        initialWeight: 60,
        restSeconds: 60,
        notes: 'Máxima amplitude de tornozelo.'
      }
    ]
  }
];
