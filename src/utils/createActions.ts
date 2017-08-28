import getTypeDescriptors from './getTypeDescriptors';
import markMicrostateAction from './markMicrostateAction';
import reduceActionDescriptors from './reduceActionDescriptors';
import { IAction, IClass, IOnChange, IPath } from '../Interfaces';
import getSetDescriptor from './getSetDescriptor';

export default function createActions(type: IClass, path: IPath, onChange: IOnChange) {
  let typeDescriptors = {
    ...getTypeDescriptors(type),
    ...getSetDescriptor(type),
  };
  return reduceActionDescriptors(
    typeDescriptors,
    (action, name: string) => {
      return markMicrostateAction((...args: Array<any>) => {
        return onChange(action, path, args);
      });
    },
    { enumerable: true }
  );
}
