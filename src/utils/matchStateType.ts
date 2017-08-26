import { IPath, IStateObject, IStateType } from '../Interfaces';
import { get } from 'ioo';
import traverseState from './traverseState';

export default function matchStateType(type: IStateType, path: IPath, state: IStateObject): any {
  if (Array.isArray(type)) {
    let data = get(path, state) || [];
    let [composedType] = type;
    return new Proxy(data, {
      get(target, property) {
        return matchStateType(composedType, [...path, property], state);
      },
    });
  }

  switch (type) {
    case String:
      return get(path, state) || '';
    case Number:
      return get(path, state) || 0;
    case Boolean:
      return get(path, state) || false;
    case Object:
      return get(path, state) || {};
    case Array:
      return get(path, state) || [];
  }

  return traverseState(type, path, state);
}
