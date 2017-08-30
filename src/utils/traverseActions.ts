import defineComputedProperty from './defineComputedProperty';
import isPrimitive from './isPrimitive';
import { IActions, ISchema, IDescriptor, IOnChange, IPath } from '../Interfaces';
import reduceTypeToCachedTree from './reduceTypeToCachedTree';

import matchActionType from './matchActionType';
import setAction from './setAction';
import mergeAction from './mergeAction';

export default function traverseActions(type: ISchema, path: IPath, onChange: IOnChange): IActions {
  if (isPrimitive(type) || Array.isArray(type)) {
    return matchActionType(type, path, onChange);
  } else {
    let actions = reduceTypeToCachedTree(type, (descriptor: IDescriptor, name: string) => {
      return matchActionType(descriptor.value, [...path, name], onChange);
    });

    let withSet = defineComputedProperty(actions, 'set', () => setAction(type, path, onChange), {
      enumerable: true,
    });

    return defineComputedProperty(actions, 'merge', () => mergeAction(type, path, onChange), {
      enumerable: true,
    });
  }
}
