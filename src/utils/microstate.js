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
import typeLensPath from './type-lens-path';
import constantsFor from './constants-for';

export default function Microstate(root, value) {
  let tree = Tree.from(root);

  let states = map(
    ({ Type, value }) =>
      isPrimitive(Type) ? value : append(value, append(gettersFor(Type), constantsFor(Type))),
    map(data => append(data, { value: initialize(data, value) }), tree)
  );

  let transitions = map(
    ({ Type, path, transitions }) =>
      map(
        t => (...args) => {
          let valueLens = lensPath(path);
          let typeLens = typeLensPath(path);

          let current = view(valueLens, states.collapsed);

          let context = (_Type = Type, value = current) => Microstates(_Type, value);

          let val = t.call(context, current, ...args);

          // result can be a microstate if it was invoked with `return this(current)`
          // or it can be result if it was just returned without invoking the context
          if (val && val.microstate) {
            return Microstates(
              Type === val.Type ? Type : set(typeLens, val.Type, root),
              set(valueLens, withoutGetters(val.valueOf()), value)
            );
          }

          return Microstates(root, set(valueLens, withoutGetters(val), value));
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
    Type: root,
    value,
    valueOf() {
      return value;
    },
    transitions,
    states,
  };
}
