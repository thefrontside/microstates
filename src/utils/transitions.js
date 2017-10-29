import lensPath from 'ramda/src/lensPath';
import { map } from 'funcadelic';

import transitionsFor from './transitions-for';
import ContextFactory from './context';

/**
 * Return a tree of transitions for a given transition tree. States are used to provide 
 * values for transitions to use calculating state transitions.
 * 
 * @param {Tree} tree 
 * @param {States} states 
 */
export default function Transitions(tree, states) {
  return map(
    ({ Type, path, transitions }) =>
      map(
        (t, name) => (...args) =>
          t.call(ContextFactory(Type, name), lensPath(path), states, ...args),
        transitions
      ),
    // curried transitions
    map(({ Type, path }) => ({ Type, path, transitions: transitionsFor(Type) }), tree)
  );
}
