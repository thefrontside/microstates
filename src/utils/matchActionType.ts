import { IClass, IOnChange, IPath } from '../Interfaces';
import MicrostateString from '../primitives/string';
import MicrostateNumber from '../primitives/number';
import MicrostateBoolean from '../primitives/boolean';
import MicrostateObject from '../primitives/object';
import MicrostateArray from '../primitives/array';
import createActions from './createActions';
import traverseActions from './traverseActions';
import isNumeric from './isNumeric';
import { reduceObject } from 'ioo';

export default function matchActionType(type: IClass, path: IPath, onChange: IOnChange): Object {
  if (Array.isArray(type)) {
    let [composedType] = type;
    let actions = createActions(MicrostateArray, path, onChange);
    return new Proxy([], {
      get(target, property: string) {
        if (actions[property]) {
          return actions[property];
        }
        if (isNumeric(property)) {
          // TODO(taras): make it possible to verify that this property index is within range of data
          return traverseActions(composedType, [...path, parseInt(property)], onChange);
        }
        return target[property];
      },
    });
  }

  switch (type) {
    case String:
      return createActions(MicrostateString, path, onChange);
    case Number:
      return createActions(MicrostateNumber, path, onChange);
    case Boolean:
      return createActions(MicrostateBoolean, path, onChange);
    case Object:
      return createActions(MicrostateObject, path, onChange);
    case Array:
      return createActions(MicrostateArray, path, onChange);
  }

  return traverseActions(type, path, onChange);
}
