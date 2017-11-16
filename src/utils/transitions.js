import { map } from 'funcadelic';

import lensPath from 'ramda/src/lensPath';
import set from 'ramda/src/set';
import view from 'ramda/src/view';

import Microstates from '../microstates';
import transitionsFor from './transitions-for';
import withoutGetters from './without-getters';

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
        t => (...args) => {
          let lens = lensPath(path);

          let current = view(lens, states);

          let context = (_Type = Type, _value = current) => {
            return Microstates(_Type, _value);
          };

          let result = t.call(context, current, ...args);

          // result can be a microstate if it was invoked with `return this(current)`
          // or it can be result if it was just returned without invoking the context
          if (result && result.isMicrostate) {
            result = result.valueOf();
          }

          let next = set(lens, withoutGetters(result), value);

          return next;
        },
        transitions
      ),
    // curried transitions
    withTransitions
  );
}
