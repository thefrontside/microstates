import { lensPath, set, view } from 'ramda';

import traverseState from './utils/traverseState';
import traverseActions from './utils/traverseActions';
import { IAction, IClass, IMicrostate, IObserver, IPath, IState, IStateObject } from './Interfaces';

export default function microstates(Class: IClass, initial: any = null): IMicrostate {
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

  let actions = traverseActions(Class, [], onChange);

  function transition(Class: IClass, initial: {}): IMicrostate {
    let state = traverseState(Class, [], initial);
    return {
      state,
      actions,
    };
  }

  function onChange(action: IAction, path: IPath, args: Array<any>) {
    let lens = lensPath(path);
    let current = view(lens, state);
    let next = action(current, ...args);
    let newState = set(lens, next, state);

    if (observer) {
      observer.next(transition(Class, newState));
    } else {
      return transition(Class, newState);
    }
  }

  let { state } = transition(Class, initial);

  return {
    state,
    actions,
    subscribe,
  };
}
