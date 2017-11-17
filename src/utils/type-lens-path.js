import curry from 'ramda/src/curry';
import lens from 'ramda/src/lens';

import Tree from './tree';
import overload from './overload';

const path = curry(function(paths, Type) {
  let val = Type;
  let idx = 0;
  while (idx < paths.length) {
    if (val == null) {
      return;
    }
    val = new val()[paths[idx]];
    idx += 1;
  }
  return val;
});

const assocPath = curry(function(paths, val, Type) {
  if (typeof Type !== 'function') {
    throw new Error(`treeLensPath expects Type class as 3rd argument, received ${typeof Type}`);
  }

  if (paths.length === 0) {
    return val;
  }

  let propName = paths[0];
  if (paths.length > 1) {
    let next = new Type()[propName];
    if (!next) {
      throw new Error(`${Type.name} doesn't have attribute ${propName}`);
    }
    val = assocPath(Array.prototype.slice.call(paths, 1), val, next);
  }

  return overload(Type, propName, val);
});

export default function treeLensPath(paths) {
  return lens(path(paths), assocPath(paths));
}
