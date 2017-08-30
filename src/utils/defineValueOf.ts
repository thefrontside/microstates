import { IPath } from '../Interfaces';
import { get } from 'ioo';

export default function defineValueOf(target: any, path: IPath, state: any): any {
  return Object.defineProperty(target, 'valueOf', {
    configurable: false,
    writable: false,
    enumerable: false,
    value() {
      return get(path, state);
    },
  });
}
