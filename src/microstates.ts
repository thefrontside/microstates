import traverseState from './utils/traverseState';
import traverseActions from './utils/traverseActions';
import { IClass, IMicrostate, IObserver, IState, IStateObject } from './Interfaces';

export default function microstates(Class: IClass, initial: IStateObject = {}): IMicrostate {
  if (typeof Class !== 'function') {
    throw new Error(
      `microstates() expects first argument to be a class, instead received ${typeof Class}`
    );
  }

  let observer: IObserver;

  let unsubscribe = (): void => (observer = null);

  let subscribe = (_observer: IObserver) => {
    observer = _observer;
    return {
      unsubscribe,
    };
  };

  let onChange = (newState: IState) => {
    if (observer) {
      observer.next(microstate(Class, newState));
    } else {
      return microstate(Class, newState);
    }
  };

  let microstate = (Class: IClass, initial: {}): IMicrostate => {
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
