import { lensPath, set, view, curry } from 'ramda';
import { ITransition } from '../Interfaces';
import { IPath } from 'ioo/dist/Interfaces';

export default function onTransitionFactory(callback: (newState: any) => any | void) {
  return curry((transition: ITransition, path: IPath, state: any) => {
    return (...args: Array<any>) => {
      let lens = lensPath(path);
      let current = view(lens, state);
      let next = transition(current, ...args);
      let newState = set(lens, next, state);

      return callback(newState);
    };
  });
}
