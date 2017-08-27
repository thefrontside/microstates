import { IActions, IClass, IDescriptor, IOnChange, IPath } from '../Interfaces';
import reduceTypeInstanceDescriptors from './reduceTypeInstanceDescriptors';

import matchActionType from './matchActionType';

export default function traverseActions(type: IClass, path: IPath, onChange: IOnChange): IActions {
  switch (type) {
    case String:
    case Number:
    case Boolean:
    case Array:
    case Object:
      return matchActionType(type, path, onChange);
    default:
      return reduceTypeInstanceDescriptors(type, (descriptor: IDescriptor, name: string) => {
        return matchActionType(descriptor.value, [...path, name], onChange);
      });
  }
}
