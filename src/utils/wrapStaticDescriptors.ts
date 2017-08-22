import wrapDescriptorProps from './wrapDescriptorProps';
import {
  IActionsObject,
  IClass,
  IDescriptor,
  IDescriptorHash,
  IOnChange,
  IPath,
  IState,
  IAction,
} from '../Interfaces';

export default function wrapStaticDescriptors(Class: IClass, path: IPath, onChange: IOnChange) {
  return wrapDescriptorProps(
    Class,
    (action, name: string) => {
      return (...args: Array<any>) => {
        return onChange(action, path, args);
      };
    },
    { enumerable: true }
  );
}
