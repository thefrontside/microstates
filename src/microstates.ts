import traverseState from './utils/traverseState';
import traverseActions from './utils/traverseActions';

export default function microstates(Class, initial = {}) {
  if (typeof Class !== 'function') {
    throw new Error(
      `microstates() expects first argument to be a class, instead received ${typeof Class}`
    );
  }

  let state = traverseState(Class, [], initial);

  let actions = traverseActions(Class, [], initial);

  return {
    state,
    actions,
  };
}
