import { Monoid } from 'funcadelic';

import * as MS from '..';
import overload from './overload';
import descriptorsFor from './descriptors-for';

let Class = Monoid.create(
  class {
    empty() {
      return class {};
    }
    append({ name, value }, Class) {
      return overload(Class, name, toTypeClass(value));
    }
  }
);

export function toClass(value) {
  return Class.reduce(descriptorsFor(value));
}

/**
 * Converts a value into a type.
 */
export default function toTypeClass(value) {
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
      return toClass(value);
  }
  return value;
}
