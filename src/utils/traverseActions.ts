import {
  IAction,
  IActionsObject,
  IClass,
  IDescriptor,
  IDescriptorHash,
  IOnChange,
  IPath,
  IState,
} from '../Interfaces';
import wrapStaticDescriptors from './wrapStaticDescriptors';
import mapInstanceProps from './mapInstanceProps';
import MicrostateString from '../primitives/string';
import MicrostateNumber from '../primitives/number';
import MicrostateBoolean from '../primitives/boolean';
import MicrostateObject from '../primitives/object';
import MicrostateArray from '../primitives/array';
import ComputedProperty from './ComputedProperty';

export default function traverseActions(
  Class: IClass,
  path: IPath,
  state: IState,
  onChange: IOnChange
): IActionsObject {
  return mapInstanceProps(Class, (descriptor, name) => {
    let descendant = [...path, name];
    switch (descriptor.value) {
      case String:
        return wrapStaticDescriptors(MicrostateString, descendant, state, onChange);
      case Number:
        return wrapStaticDescriptors(MicrostateNumber, descendant, state, onChange);
      case Boolean:
        return wrapStaticDescriptors(MicrostateBoolean, descendant, state, onChange);
      case Object:
        return wrapStaticDescriptors(MicrostateObject, descendant, state, onChange);
      case Array:
        return wrapStaticDescriptors(MicrostateArray, descendant, state, onChange);
      default:
        return traverseActions(descriptor.value, descendant, state, onChange);
    }
  });
}
