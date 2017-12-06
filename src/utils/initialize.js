import { append } from 'funcadelic';

import isPrimitive from './is-primitive';
import gettersFor from './getters-for';
import constantsFor from './constants-for';

export default function initialize(Type, value) {
  let instance = new Type(value).valueOf();
  if (isPrimitive(Type)) {
    return instance;
  } else {
    return append(instance, append(gettersFor(Type), constantsFor(Type)));
  }
}
