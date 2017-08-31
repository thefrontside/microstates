import MicrostateArray from '../primitives/array';
import actionFactory from './actionFactory';
import { IAttributeOverrides, ISchema, IOnChange, IPath } from '../Interfaces';
import isPrimitive from './isPrimitive';
import isSameType from './isSameType';

export default function setAction(type: ISchema, path: IPath, onChange: IOnChange) {
  return actionFactory(
    (current: any, newState: any) => {
      if (newState == null) {
        return newState;
      } else {
        return newState.valueOf();
      }
    },
    path,
    onChange
  );
}
