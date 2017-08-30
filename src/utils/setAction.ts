import MicrostateArray from '../primitives/array';
import actionFactory from './actionFactory';
import getReducerType from './getReducerType';
import valueOf from './valueOf';
import { IAttributeOverrides, ISchema, IOnChange, IPath } from '../Interfaces';
import isPrimitive from './isPrimitive';

export default function setAction(type: ISchema, path: IPath, onChange: IOnChange) {
  return actionFactory(
    (current: any, newState: any) => {
      // console.log({ current, newState });
      if (newState === null) {
        return newState;
      }

      let { constructor } = newState;

      if (constructor === type || getReducerType(constructor) === getReducerType(type)) {
        return valueOf(newState);
      } else {
        throw new Error(`set expected ${type.name}, got ${constructor.name}`);
      }
    },
    path,
    onChange
  );
}
