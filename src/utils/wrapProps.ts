import { IActionsObject } from '../Interfaces';
import { reduceObject } from 'ioo';
import ComputedProperty from './ComputedProperty';

export default function wrapProps(
  props: IActionsObject,
  callback: (value: any, name: string) => any,
  attributes = {}
) {
  return reduceObject(
    props,
    (object, action, name: string) => {
      let cached = new ComputedProperty(() => {
        return callback(action, name);
      }, attributes);
      Object.defineProperty(object, name, cached);
      return object;
    },
    {}
  );
}
