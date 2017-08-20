import { lensPath, set, view } from 'ramda';
import mapStaticProps from './mapStaticProps';
import wrapProps from './wrapProps';
import * as string from '../primitives/string';
import * as number from '../primitives/number';
import * as boolean from '../primitives/boolean';
import * as object from '../primitives/object';
import * as array from '../primitives/array';

export default function traverseActions(Class, path, state, onChange) {
  return mapStaticProps(Class, (descriptor, name) => {
    let descendant = [...path, name];
    switch (descriptor.value) {
      case String:
        return wrapActions(string, descendant, state, onChange);
      case Number:
        return wrapActions(number, descendant, state, onChange);
      case Boolean:
        return wrapActions(boolean, descendant, state, onChange);
      case Object:
        return wrapActions(object, descendant, state, onChange);
      case Array:
        return wrapActions(array, descendant, state, onChange);
      default:
        return traverseActions(descriptor.value, descendant, state, onChange);
    }
  });
}

export function wrapActions(actions, path, state, onChange) {
  return wrapProps(
    actions,
    (action, name) => {
      return (...args) => {
        let lens = lensPath(path);
        let current = view(lens, state);
        let next = action(current, ...args);
        let newState = set(lens, next, state);
        onChange(newState);
      };
    },
    { enumerable: true }
  );
}
