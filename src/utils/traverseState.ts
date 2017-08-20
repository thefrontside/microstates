import { IClass, IStateObject, IPath } from '../Interfaces';
import { get } from 'ioo';
import mapInstanceProps from './mapInstanceProps';

export default function traverseState(
  Class: IClass,
  path: IPath,
  state: IStateObject
): IStateObject {
  return mapInstanceProps(
    Class,
    (descriptor, name) => {
      let descendant = [...path, name];
      switch (descriptor.value) {
        case String:
          return get(descendant, state) || '';
        case Number:
          return get(descendant, state) || 0;
        case Boolean:
          return get(descendant, state) || false;
        case Object:
          return get(descendant, state) || {};
        case Array:
          return get(descendant, state) || [];
        default:
          return traverseState(descriptor.value, descendant, state);
      }
    },
    { enumerable: true }
  );
}
