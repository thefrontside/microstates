import { get } from 'ioo';

import matchStateType from './matchStateType';
import { IPath, IStateObject, IStateType } from '../Interfaces';

export default function stateArrayProxyFactory(
  type: Array<IStateType>,
  path: IPath,
  state: IStateObject
): any {
  let [composedType] = type;
  let value = get(path, state) as any[];
  let data = value || [];

  return new Proxy(data, {
    get(target, property) {
      if (property === 'length') {
        return data.length;
      } else if (property === 'valueOf') {
        return () => value;
      } else if (data.hasOwnProperty(property)) {
        return matchStateType(composedType, [...path, property], state);
      } else {
        return data[property];
      }
    },
  });
}
