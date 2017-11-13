import { map } from 'funcadelic';

import lensPath from 'ramda/src/lensPath';
import set from 'ramda/src/set';
import view from 'ramda/src/view';

import Microstates from '../microstates';
import transitionsFor from './transitions-for';
import withoutGetters from './without-getters';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

/**
 * Return a tree of transitions for a given transition tree. States are used to provide 
 * values for transitions to use calculating state transitions.
 * 
 * @param {Tree} tree 
 * @param {States} states 
 */
export default function Transitions(tree, states, value) {
  let withTransitions = map(
    ({ Type, path }) => ({
      Type,
      path,
      transitions: transitionsFor(Type),
    }),
    tree
  );

  return map(
    ({ Type, path, transitions }) =>
      map(
        (t, name) => (...args) => {
          let lens = lensPath(path);

          let current = view(lens, states);

          let context = Microstates(Type);

          let result = valueOf(t.call(context, current, ...args));

          let next = set(lens, withoutGetters(result), value);

          return next;
        },
        transitions
      ),
    // curried transitions
    withTransitions
  );
}

function valueOf(o) {
  return o && o.valueOf && o.valueOf.call ? o.valueOf() : o;
}
