import * as MS from '../index';

const { getPrototypeOf } = Object;

/**
 * Returns microstate type for a value.
 */
export default function getType(value) {
  if (Array.isArray(value)) {
    return MS.Array;
  }
  switch (typeof value) {
    case 'number':
      return MS.Number;
    case 'string':
      return MS.String;
    case 'boolean':
      return MS.Boolean;
    case 'object':
      let constructor = getPrototypeOf(value).constructor;
      if (constructor === Object) {
        return MS.Object;
      } else {
        return constructor;
      }
  }
}
