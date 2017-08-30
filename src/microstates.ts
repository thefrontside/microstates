import { lensPath, set, view } from 'ramda';
import symbolObservable from 'symbol-observable';

import traverseState from './utils/traverseState';
import traverseActions from './utils/traverseActions';
import {
  IAction,
  IMicrostate,
  IObserver,
  IPath,
  ISchema,
  IState,
  IStateObject,
  IStateType,
} from './Interfaces';

export default function microstates(Class: ISchema, initial: any = undefined): IMicrostate {
  if (!(typeof Class === 'function' || Array.isArray(Class))) {
    throw new Error(
      `microstates() expects first argument to be a class, instead received ${typeof Class}`
    );
  }

  let observer: IObserver;

  let subscribe = (_observer: IObserver) => {
    observer = _observer;
    return {
      unsubscribe: (): void => (observer = null),
    };
  };

  let actions = traverseActions(Class, [], onChange);

  function transition(Class: ISchema, initial: {}): IState {
    return traverseState(Class, [], initial);
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

  let state = transition(Class, initial);

  return {
    state,
    actions,
    [symbolObservable]() {
      return {
        subscribe,
      };
    },
  };
}
