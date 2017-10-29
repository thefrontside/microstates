import lensPath from 'ramda/src/lensPath';
import { map } from 'funcadelic';

import transitionsFor from './transitions-for';
import Context from './context';

export default function Transitions(tree, states) {
  return map(
    ({ Type, path, transitions }) =>
      map(t => (...args) => t.call(Context(Type), lensPath(path), states, ...args), transitions),
    // curried transitions
    map(({ Type, path }) => ({ Type, path, transitions: transitionsFor(Type) }), tree)
  );
}
