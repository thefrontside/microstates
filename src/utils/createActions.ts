import reduceActionDescriptors from './reduceActionDescriptors';
import { IClass, IOnChange, IPath } from '../Interfaces';
import getTypeDescriptors from './getTypeDescriptors';
import { isMicrostateAction } from '../constants';

export default function createActions(Class: IClass, path: IPath, onChange: IOnChange) {
  return reduceActionDescriptors(
    getTypeDescriptors(Class),
    (action, name: string) => {
      let fn = (...args: Array<any>) => {
        return onChange(action, path, args);
      };
      fn['isMicrostateAction'] = isMicrostateAction;
      return fn;
    },
    { enumerable: true }
  );
}
