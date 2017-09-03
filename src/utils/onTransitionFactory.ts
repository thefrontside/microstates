import { lensPath, set, view } from 'ramda';
import { ITransition } from '../Interfaces';
import { IPath } from '../Interfaces';

export default function onTransitionFactory(callback: (newState: any) => any | void) {
  return function reducerFactory(transition: ITransition, path: IPath) {
    return function reducer(...args: Array<any>) {
      return callback((state: any) => {
        let lens = lensPath(path);
        let current = view(lens, state);
        let next = transition(current, ...args);
        return set(lens, next, state);
      });
    };
  };
}
