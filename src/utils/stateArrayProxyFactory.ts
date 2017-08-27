import { get } from 'ioo';

import matchStateType from './matchStateType';
import { IPath, IStateObject, IStateType } from '../Interfaces';

export default function stateArrayProxyFactory(
  type: Array<IStateType>,
  path: IPath,
  state: IStateObject
): any {
  let [composedType] = type;
  let data = (get(path, state) as any[]) || [];

  return new Proxy(data, {
    get(target, property) {
      if (property === 'length') {
        return data.length;
      } else if (data.hasOwnProperty(property)) {
        return matchStateType(composedType, [...path, property], state);
      } else {
        return data[property];
      }
    },
  });
}
