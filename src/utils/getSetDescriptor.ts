import { IAttributeOverrides, IClass } from '../Interfaces';
import markMicrostateAction from './markMicrostateAction';

export default function getSetDescriptor(type: IClass, attributes: IAttributeOverrides = {}) {
  return {
    set: {
      configurable: false,
      enumerable: true,
      writable: false,
      value: markMicrostateAction(function(current: any, newState: any) {
        return newState;
      }),
      ...attributes,
    },
  };
}
