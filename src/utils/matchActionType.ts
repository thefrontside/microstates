import actionArrayProxyFactory from './actionArrayProxyFactory';
import { IClass, IOnChange, IPath, IActions } from '../Interfaces';
import MicrostateString from '../primitives/string';
import MicrostateNumber from '../primitives/number';
import MicrostateBoolean from '../primitives/boolean';
import MicrostateObject from '../primitives/object';
import MicrostateArray from '../primitives/array';
import createActions from './createActions';
import traverseActions from './traverseActions';

export default function matchActionType(type: IClass, path: IPath, onChange: IOnChange): IActions {
  if (Array.isArray(type)) {
    return actionArrayProxyFactory(type, path, onChange);
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
