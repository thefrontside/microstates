import { append } from 'funcadelic';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

const { getPrototypeOf } = Object;

export default function getPrototypeDescriptors(Class) {
  let prototype = getPrototypeOf(Class);
  if (prototype && prototype !== getPrototypeOf(Object)) {
    return append(getPrototypeDescriptors(prototype), getOwnPropertyDescriptors(Class.prototype));
  } else {
    return getOwnPropertyDescriptors(Class.prototype);
  }
}
