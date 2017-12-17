import { map, append } from 'funcadelic';
import lensPath from 'ramda/src/lensPath';
import set from 'ramda/src/set';
import view from 'ramda/src/view';

import Tree from './tree';
import microstate from '../microstate';
import { reveal } from './secret';

import transitionsFor from './transitions-for';
import withoutGetters from './without-getters';
import initialize from './initialize';
import typeLensPath from './type-lens-path';

export default function state(root, value) {
  if (typeof root !== 'function' && value === undefined) {
    value = root;
  }

  let tree = Tree.from(root);

  let state = map(({ Type, path }) => initialize(Type, view(lensPath(path), value)), tree);

  let transitions = map(
    ({ Type, path }) =>
      map(
        t => (...args) => {
          let valueLens = lensPath(path);
          let typeLens = typeLensPath(path);

          let current = view(valueLens, state.collapsed);
          let slice = view(valueLens, value);

          let context = (_Type = Type, _value = slice) => microstate(_Type, _value);

          let val = t.call(context, current, ...args);

          // result can be a microstate if it was invoked with `return this(current)`
          // or it can be result if it was just returned without invoking the context
          let ms = reveal(val);
          if (val && ms) {
            return microstate(
              Type === ms.Type ? Type : set(typeLens, ms.Type, root),
              set(valueLens, withoutGetters(ms.value), value)
            );
          }

          return microstate(root, set(valueLens, withoutGetters(val), value));
        },
        transitionsFor(Type)
      ),
    tree
  );

  return {
    Type: root,
    value,
    transitions,
    state
  };
}
