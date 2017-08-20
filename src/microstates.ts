import traverseState from './utils/traverseState';
import traverseActions from './utils/traverseActions';
import { IMicrostate, IObserver } from './Interfaces';

export default function microstates(Class, initial = {}) {
  if (typeof Class !== 'function') {
    throw new Error(
      `microstates() expects first argument to be a class, instead received ${typeof Class}`
    );
  }

  let observer;

  let unsubscribe = () => (observer = null);

  let subscribe = (_observer: IObserver) => {
    observer = _observer;
    return {
      unsubscribe,
    };
  };

  let onChange = newState => {
    if (observer) {
      observer.next(microstate(Class, newState));
    } else {
      return microstate(Class, newState);
    }
  };

  let microstate = (Class, initial) => {
    let state = traverseState(Class, [], initial);
    let actions = traverseActions(Class, [], state, onChange);
    return {
      state,
      actions,
    };
  };

  return {
    ...microstate(Class, initial),
    subscribe,
  };
}
