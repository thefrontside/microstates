import { map, append } from 'funcadelic';
import lensPath from 'ramda/src/lensPath';
import set from 'ramda/src/set';
import view from 'ramda/src/view';

import Microstates from '../microstates';
import Tree from './tree';

import transitionsFor from './transitions-for';
import withoutGetters from './without-getters';
import initialize from './initialize';
import isPrimitive from './is-primitive';
import gettersFor from './getters-for';

export default function Microstate(Type, value) {
  let tree = Tree.from(Type);

  let states = map(
    ({ Type, value }) => (isPrimitive(Type) ? value : append(value, gettersFor(Type))),
    map(data => append(data, { value: initialize(data, value) }), tree)
  );

  let transitions = map(
    ({ Type, path, transitions }) =>
      map(
        t => (...args) => {
          let lens = lensPath(path);

          let current = view(lens, states.collapsed);

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
    map(
      ({ Type, path }) => ({
        Type,
        path,
        transitions: transitionsFor(Type),
      }),
      tree
    )
  );

  return {
    transitions,
    states,
  };
}
