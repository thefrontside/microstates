import isPrimitive from './isPrimitive';
import { ISchema, IStateObject, IPath } from '../Interfaces';
import { curry } from 'ramda';
import reduceTypeToCachedTree from './reduceTypeToCachedTree';
import matchStateType from './matchStateType';

export default curry(function traverseState(
  type: ISchema,
  path: IPath,
  state: IStateObject
): IStateObject {
  if (isPrimitive(type) || Array.isArray(type)) {
    return matchStateType(type, path, state);
  } else {
    return reduceTypeToCachedTree(
      type,
      (descriptor, name) => {
        let { value: type } = descriptor;
        return matchStateType(type, [...path, name], state);
      },
      { enumerable: true }
    );
  }
});
