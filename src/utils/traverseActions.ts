import { IActionsObject, IClass, IDescriptor, IOnChange, IPath } from '../Interfaces';
import createActions from './createActions';
import reduceCallableInstanceDescriptors from './reduceCallableInstanceDescriptors';
import MicrostateString from '../primitives/string';
import MicrostateNumber from '../primitives/number';
import MicrostateBoolean from '../primitives/boolean';
import MicrostateObject from '../primitives/object';
import MicrostateArray from '../primitives/array';
import ComputedProperty from './ComputedProperty';

export default function traverseActions(
  Class: IClass,
  path: IPath,
  onChange: IOnChange
): IActionsObject {
  return reduceCallableInstanceDescriptors(Class, (descriptor: IDescriptor, name: string) => {
    let descendant = [...path, name];
    switch (descriptor.value) {
      case String:
        return createActions(MicrostateString, descendant, onChange);
      case Number:
        return createActions(MicrostateNumber, descendant, onChange);
      case Boolean:
        return createActions(MicrostateBoolean, descendant, onChange);
      case Object:
        return createActions(MicrostateObject, descendant, onChange);
      case Array:
        return createActions(MicrostateArray, descendant, onChange);
      default:
        return traverseActions(descriptor.value, descendant, onChange);
    }
  });
}
