import { IClass, IOnChange, IPath, IState, IActionsObject } from '../Interfaces';
import { lensPath, set, view } from 'ramda';
import mapStaticProps from './mapStaticProps';
import wrapProps from './wrapProps';
import string from '../primitives/string';
import number from '../primitives/number';
import boolean from '../primitives/boolean';
import object from '../primitives/object';
import array from '../primitives/array';

export default function traverseActions(
  Class: IClass,
  path: IPath,
  state: IState,
  onChange: IOnChange
): {} {
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

export function wrapActions(
  actions: IActionsObject,
  path: IPath,
  state: IState,
  onChange: IOnChange
) {
  return wrapProps(
    actions as IActionsObject,
    (action, name) => {
      return (...args: Array<any>) => {
        let lens = lensPath(path);
        let current = view(lens, state);
        let next = action(current, ...args);
        let newState = set(lens, next, state);
        return onChange(newState);
      };
    },
    { enumerable: true }
  );
}
