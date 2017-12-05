import { map, append } from 'funcadelic';
import lensPath from 'ramda/src/lensPath';
import set from 'ramda/src/set';
import view from 'ramda/src/view';

import Microstates from '../microstates';
import Tree from './tree';

import transitionsFor from './transitions-for';
import withoutGetters from './without-getters';
import initialize from './initialize';
import typeLensPath from './type-lens-path';

export default function Microstate(root, initial) {
  let tree = Tree.from(root);

  let state = map(({ Type, path }) => initialize(Type, view(lensPath(path), initial)), tree);

  let transitions = map(
    ({ Type, path }) =>
      map(
        t => (...args) => {
          let valueLens = lensPath(path);
          let typeLens = typeLensPath(path);

          let current = view(valueLens, state.collapsed);

          let context = (_Type = Type, value = current) => Microstates(_Type, value);

          let val = t.call(context, current, ...args);

          // result can be a microstate if it was invoked with `return this(current)`
          // or it can be result if it was just returned without invoking the context
          if (val && val.microstate) {
            return Microstates(
              Type === val.Type ? Type : set(typeLens, val.Type, root),
              set(valueLens, withoutGetters(val.valueOf()), initial)
            );
          }

          return Microstates(root, set(valueLens, withoutGetters(val), initial));
        },
        transitionsFor(Type)
      ),
    tree
  );

  return {
    Type: root,
    value: initial,
    valueOf() {
      return initial;
    },
    transitions,
    state,
  };
}
