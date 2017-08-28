import actionFactory from './actionFactory';
import getReducerType from './getReducerType';
import valueOf from './valueOf';
import { IAttributeOverrides, IClass, IOnChange } from '../Interfaces';
import isPrimitive from './isPrimitive';
import { IPath } from '../Interfaces';

export default function setAction(type: IClass, path: IPath, onChange: IOnChange) {
  return actionFactory(
    (current: any, newState: any) => {
      if (newState === null) {
        return newState;
      }

      let { constructor } = newState;

      if (constructor === type || constructor === getReducerType(type)) {
        return valueOf(newState);
      } else {
        throw new Error(`set expected ${type.name}, got ${constructor.name}`);
      }
    },
    path,
    onChange
  );
}
