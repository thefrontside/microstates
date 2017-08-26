import reduceActionDescriptors from './reduceActionDescriptors';
import { IClass, IOnChange, IPath } from '../Interfaces';
import getTypeDescriptors from './getTypeDescriptors';

export default function createActions(Class: IClass, path: IPath, onChange: IOnChange) {
  return reduceActionDescriptors(
    getTypeDescriptors(Class),
    (action, name: string) => {
      return (...args: Array<any>) => {
        return onChange(action, path, args);
      };
    },
    { enumerable: true }
  );
}
