import MicrostateArray from '../primitives/array';
import actionFactory from './actionFactory';
import { IAttributeOverrides, ISchema, IOnChange, IPath } from '../Interfaces';
import isPrimitive from './isPrimitive';
import isSameType from './isSameType';

export default function setAction(type: ISchema, path: IPath, onChange: IOnChange) {
  return actionFactory(
    (current: any, newState: any) => {
      // console.log({ current, newState });
      if (newState === null) {
        return newState;
      }

      let { constructor } = newState;

      if (isSameType(type, constructor)) {
        return newState.valueOf();
      } else {
        throw new Error(`set expected ${type.name}, got ${constructor.name}`);
      }
    },
    path,
    onChange
  );
}
