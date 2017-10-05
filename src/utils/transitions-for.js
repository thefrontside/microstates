import getReducerType from './get-reducer-type';
import transition from './transition';

import { append, map, filter } from 'funcadelic';

const set = transition(function set(current, state) {
  return state && state.valueOf ? state.valueOf() : state;
});

export default function transitionsFor(Type) {
  let type = getReducerType(Type);
  let transitionFns = filter(({ key }) => !['constructor', 'initialize'].includes(key), type.prototype);
  return append({ set }, map(fn => transition(fn), transitionFns));
}
