import defineComputedProperty from './defineComputedProperty';
import isPrimitive from './isPrimitive';
import { IActions, IClass, IDescriptor, IOnChange, IPath } from '../Interfaces';
import reduceTypeInstanceDescriptors from './reduceTypeInstanceDescriptors';

import matchActionType from './matchActionType';
import setAction from './setAction';

export default function traverseActions(type: IClass, path: IPath, onChange: IOnChange): IActions {
  if (isPrimitive(type)) {
    return matchActionType(type, path, onChange);
  } else {
    let actions = reduceTypeInstanceDescriptors(type, (descriptor: IDescriptor, name: string) => {
      return matchActionType(descriptor.value, [...path, name], onChange);
    });

    return defineComputedProperty(actions, 'set', () => setAction(type, path, onChange), {
      enumerable: true,
    });
  }
}
