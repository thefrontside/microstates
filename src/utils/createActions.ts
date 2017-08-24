import reduceActionDescriptors from './reduceActionDescriptors';
import { IClass, IOnChange, IPath } from '../Interfaces';
import getCallableDescriptors from './getCallableDescriptors';

export default function createActions(Class: IClass, path: IPath, onChange: IOnChange) {
  return reduceActionDescriptors(
    getCallableDescriptors(Class),
    (action, name: string) => {
      return (...args: Array<any>) => {
        return onChange(action, path, args);
      };
    },
    { enumerable: true }
  );
}
