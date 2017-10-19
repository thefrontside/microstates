import { lensPath, view } from 'ramda';

import getType from './get-type';

export default function initialize({ Type, path }, value) {
  let next = view(lensPath(path), value);
  let Class = getType(Type);
  let current = new Class(next);

  return current.valueOf();
}
