import { Exercise } from '../types';
import { CHEST_EXERCISES } from './exercises/chest';
import { BACK_EXERCISES } from './exercises/back';
import { SHOULDER_EXERCISES } from './exercises/shoulders';
import { BICEPS_EXERCISES } from './exercises/biceps';
import { TRICEPS_EXERCISES } from './exercises/triceps';
import { QUADS_EXERCISES } from './exercises/quads';
import { HAMSTRING_EXERCISES } from './exercises/hamstrings';
import { GLUTE_EXERCISES } from './exercises/glutes';
import { CALVES_EXERCISES } from './exercises/calves';
import { ABS_EXERCISES } from './exercises/abs';
import { FUNCTIONAL_EXERCISES } from './exercises/functional';

// Helper to guarantee unique IDs while assembling the mega-catalog of 340+ exercises
const combineAndDeduplicate = (...exerciseLists: Exercise[][]): Exercise[] => {
  const seenIds = new Set<string>();
  const combined: Exercise[] = [];

  for (const list of exerciseLists) {
    for (const ex of list) {
      if (!seenIds.has(ex.id)) {
        seenIds.add(ex.id);
        combined.push(ex);
      }
    }
  }

  return combined;
};

export const INITIAL_EXERCISES: Exercise[] = combineAndDeduplicate(
  CHEST_EXERCISES,
  BACK_EXERCISES,
  SHOULDER_EXERCISES,
  BICEPS_EXERCISES,
  TRICEPS_EXERCISES,
  QUADS_EXERCISES,
  HAMSTRING_EXERCISES,
  GLUTE_EXERCISES,
  CALVES_EXERCISES,
  ABS_EXERCISES,
  FUNCTIONAL_EXERCISES
);

export {
  CHEST_EXERCISES,
  BACK_EXERCISES,
  SHOULDER_EXERCISES,
  BICEPS_EXERCISES,
  TRICEPS_EXERCISES,
  QUADS_EXERCISES,
  HAMSTRING_EXERCISES,
  GLUTE_EXERCISES,
  CALVES_EXERCISES,
  ABS_EXERCISES,
  FUNCTIONAL_EXERCISES
};
