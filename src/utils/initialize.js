import { lensPath, view } from 'ramda';

export default function initialize({ Type, path }, value) {
  let current = view(lensPath(path), value);
  return new Type(current).valueOf();
}
