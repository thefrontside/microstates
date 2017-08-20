import { lensPath, set, view } from 'ramda';
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

export default function wrapStaticDescriptors(
  Class: IClass,
  path: IPath,
  state: IState,
  onChange: IOnChange
) {
  return wrapDescriptorProps(
    Class,
    (action, name: string) => {
      return (...args: Array<any>) => {
        let lens = lensPath(path);
        let current = view(lens, state);
        let next = action(current, ...args);
        let newState = set(lens, next, state);
        return onChange(newState);
      };
    },
    { enumerable: true }
  );
}
