import { IActionsObject, IClass, IDescriptor, IOnChange, IPath } from '../Interfaces';
import reduceTypeInstanceDescriptors from './reduceTypeInstanceDescriptors';

import matchActionType from './matchActionType';

export default function traverseActions(
  type: IClass,
  path: IPath,
  onChange: IOnChange
): IActionsObject {
  return reduceTypeInstanceDescriptors(type, (descriptor: IDescriptor, name: string) => {
    return matchActionType(descriptor.value, [...path, name], onChange);
  });
}
