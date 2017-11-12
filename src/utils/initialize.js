import lensPath from 'ramda/src/lensPath';
import view from 'ramda/src/view';

export default function initialize({ Type, path }, value) {
  let current = view(lensPath(path), value);
  return new Type(current).valueOf();
}
