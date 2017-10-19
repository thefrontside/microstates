import { lensPath, view } from 'ramda';

import getType from './get-type';
import isPrimitive from './is-primitive';

export default function initialize({ Type, path }, value) {
  let lens = lensPath(path);
  let Class = getType(Type);
  let current = new Class(view(lens, value));

  if (isPrimitive(Type)) {
    return current.valueOf();
  } else {
    return current;
  }
}
