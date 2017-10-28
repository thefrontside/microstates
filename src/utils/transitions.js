import lensPath from 'ramda/src/lensPath';
import { map } from 'funcadelic';

import transitionsFor from './transitions-for';

export default function Transitions(tree, states) {
  return map(
    ({ path, transitions }) =>
      map(t => (...args) => t(lensPath(path), states, ...args), transitions),
    // curried transitions
    map(({ Type, path }) => ({ path, transitions: transitionsFor(Type) }), tree)
  ).collapsed;
}
