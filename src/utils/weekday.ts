import { Routine } from '../types';

export interface WeekdayInfo {
  index: number; // 0 = Segunda, 6 = Domingo
  name: string; // "Segunda-feira"
  shortName: string; // "Seg"
  letter: string; // "S"
}

export const WEEKDAYS: WeekdayInfo[] = [
  { index: 0, name: 'Segunda-feira', shortName: 'Seg', letter: 'S' },
  { index: 1, name: 'Terça-feira', shortName: 'Ter', letter: 'T' },
  { index: 2, name: 'Quarta-feira', shortName: 'Qua', letter: 'Q' },
  { index: 3, name: 'Quinta-feira', shortName: 'Qui', letter: 'Q' },
  { index: 4, name: 'Sexta-feira', shortName: 'Sex', letter: 'S' },
  { index: 5, name: 'Sábado', shortName: 'Sáb', letter: 'S' },
  { index: 6, name: 'Domingo', shortName: 'Dom', letter: 'D' },
];

/**
 * Returns today's weekday index (0 = Segunda, 1 = Terça, ..., 6 = Domingo)
 */
export function getTodayWeekdayIndex(date: Date = new Date()): number {
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return (day + 6) % 7; // Convert to 0 = Monday, ..., 6 = Sunday
}

/**
 * Returns weekday info for today
 */
export function getTodayWeekdayInfo(date: Date = new Date()): WeekdayInfo {
  const idx = getTodayWeekdayIndex(date);
  return WEEKDAYS[idx];
}

/**
 * Parses days of week from routine name or description if not explicitly set
 */
export function detectDaysOfWeekFromName(name: string, description: string = ''): number[] {
  const text = `${name} ${description}`.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove accents (terca -> terca, sabado -> sabado)

  const detected = new Set<number>();

  // Word boundary or token check patterns
  const patterns: { day: number; regexes: RegExp[] }[] = [
    {
      day: 0, // Segunda
      regexes: [/\bsegunda(-feira)?\b/i, /\bseg\b/i, /\bmonday\b/i, /\bmon\b/i]
    },
    {
      day: 1, // Terça
      regexes: [/\bterca(-feira)?\b/i, /\bter\b/i, /\btuesday\b/i, /\btue\b/i]
    },
    {
      day: 2, // Quarta
      regexes: [/\bquarta(-feira)?\b/i, /\bqua\b/i, /\bwednesday\b/i, /\bwed\b/i]
    },
    {
      day: 3, // Quinta
      regexes: [/\bquinta(-feira)?\b/i, /\bqui\b/i, /\bthursday\b/i, /\bthu\b/i]
    },
    {
      day: 4, // Sexta
      regexes: [/\bsexta(-feira)?\b/i, /\bsex\b/i, /\bfriday\b/i, /\bfri\b/i]
    },
    {
      day: 5, // Sábado
      regexes: [/\bsabado(-feira)?\b/i, /\bsab\b/i, /\bsaturday\b/i, /\bsat\b/i]
    },
    {
      day: 6, // Domingo
      regexes: [/\bdomingo\b/i, /\bdom\b/i, /\bsunday\b/i, /\bsun\b/i]
    }
  ];

  for (const { day, regexes } of patterns) {
    if (regexes.some((r) => r.test(text))) {
      detected.add(day);
    }
  }

  return Array.from(detected);
}

/**
 * Returns effective days of week for a routine (explicit or detected)
 */
export function getRoutineEffectiveDays(routine: Routine): number[] {
  if (routine.daysOfWeek && Array.isArray(routine.daysOfWeek) && routine.daysOfWeek.length > 0) {
    return routine.daysOfWeek;
  }
  return detectDaysOfWeekFromName(routine.name, routine.description);
}

/**
 * Finds the routine specifically mapped to today's weekday (or null if today is a rest day)
 */
export function getRoutineForToday(routines: Routine[], date: Date = new Date()): {
  routine: Routine | null;
  todayIndex: number;
  todayInfo: WeekdayInfo;
  isRestDay: boolean;
  nextScheduledRoutine: { routine: Routine; dayInfo: WeekdayInfo; daysUntil: number } | null;
} {
  const todayIndex = getTodayWeekdayIndex(date);
  const todayInfo = WEEKDAYS[todayIndex];

  if (!routines || routines.length === 0) {
    return {
      routine: null,
      todayIndex,
      todayInfo,
      isRestDay: true,
      nextScheduledRoutine: null
    };
  }

  // Find exact match for today
  let todayRoutine: Routine | null = null;

  for (const r of routines) {
    const days = getRoutineEffectiveDays(r);
    if (days.includes(todayIndex)) {
      todayRoutine = r;
      break;
    }
  }

  // If no routine has any day configured at all across all routines,
  // we check if user has traditional day mapping or just unassigned routines.
  const anyRoutineHasDay = routines.some((r) => getRoutineEffectiveDays(r).length > 0);

  // If ANY routine has a day assigned (or name mentions day), strict day filtering applies!
  // If NO routine has any day assigned, we treat them as unassigned (could fall back to first routine or let user set days).
  // But per prompt: "no treino de hoje coloque sempre o treino do dia da semana, exemplo Segunda, na segunda feira, dias que não tem cadastro de treino como quinta e domingo, aparecer descanso"
  const isRestDay = !todayRoutine;

  // Find next scheduled workout in the week
  let nextScheduledRoutine: { routine: Routine; dayInfo: WeekdayInfo; daysUntil: number } | null = null;

  if (isRestDay && anyRoutineHasDay) {
    for (let offset = 1; offset <= 6; offset++) {
      const nextDayIdx = (todayIndex + offset) % 7;
      for (const r of routines) {
        const days = getRoutineEffectiveDays(r);
        if (days.includes(nextDayIdx)) {
          nextScheduledRoutine = {
            routine: r,
            dayInfo: WEEKDAYS[nextDayIdx],
            daysUntil: offset
          };
          break;
        }
      }
      if (nextScheduledRoutine) break;
    }
  }

  return {
    routine: todayRoutine,
    todayIndex,
    todayInfo,
    isRestDay,
    nextScheduledRoutine
  };
}
