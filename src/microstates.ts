import { lensPath, set, view, curry, __ } from 'ramda';
import {
  ITransition,
  IMicrostate,
  IPath,
  ISchema
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

  let getValue = curry(function getValue(initialize: ITransition, path: IPath, state: any) {
    let lens = lensPath(path);
    let value = view(lens, state);

    if (initialize) {
      return value || initialize(value);
    } else {
      return value;
    }
  });

  let onTransition = curry((transition: ITransition, path: IPath, state: any) => {
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
