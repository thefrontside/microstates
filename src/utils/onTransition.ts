import { lensPath, set, view } from 'ramda';
import { ITransition } from '../Interfaces';
import { IPath } from '../Interfaces';

export default function onTransition(callback: (newState: any) => any, state: any) {
  return (transition: ITransition, path: IPath) => {
    return (...args: Array<any>) => {
      let lens = lensPath(path);
      let current = view(lens, state);
      let next = transition(current, ...args);
      let newState = set(lens, next, state);

      return callback(newState);
    };
  };
}
