import { lensPath, view } from 'ramda';

import initializerFor from './initializer-for';

export default function initialize({ Type, path }, value) {
  let initializer = initializerFor(Type);
  let lens = lensPath(path);
  let current = view(lens, value);

  return initializer(current);
}
