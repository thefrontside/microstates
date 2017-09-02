import { lensPath, set, view, curry, __ } from 'ramda';
import {
  IAction,
  IMicrostate,
  IObserver,
  IPath,
  ISchema,
  IState,
  IStateObject,
  IStateType,
  ITypeTree,
} from './Interfaces';
import TypeTree from './utils/TypeTree';
import mapState from './utils/mapState';
import mapTransitions from './utils/mapTransitions';

export default function microstates(Class: ISchema, initial: any = undefined): IMicrostate {
  if (!(typeof Class === 'function' || Array.isArray(Class))) {
    throw new Error(
      `microstates() expects first argument to be a class, instead received ${typeof Class}`
    );
  }

  let tree = new TypeTree(Class);

  let getValue = curry(function getValue(initialize: IAction, path: IPath, state: any) {
    let lens = lensPath(path);
    let value = view(lens, state);

    return value || initialize(value);
  });

  let onTransition = curry((transition: IAction, path: IPath, state: any) => {
    return (...args: Array<any>) => {
      let lens = lensPath(path);
      let current = view(lens, state);
      let next = transition(current, ...args);
      let newState = set(lens, next, state);

      return mapState(tree, [], getValue(__, __, newState));
    };
  });

  let state = mapState(tree, [], getValue(__, __, initial));
  let transitions = mapTransitions(tree, [], onTransition(__, __, state));

  return {
    state,
    transitions,
  };
}
