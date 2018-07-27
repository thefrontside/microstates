import { type } from 'funcadelic';

export const Hash = type(class Hash {
  digest(object) {
    let hash = this(object).digest(object);
    return [object.constructor.Type || object.constructor].concat(hash);
  }

  equals(left, right) {
    let lh = digest(left);
    let rh = digest(right);
    return lh.length === rh.length && lh.every((element, index) => element === rh[index])
  }
})
export const { digest, equals } = Hash.prototype;

export class Dictionary {
  constructor() {
    this.types = new Map();
  }

  get(key) {
    return getValueAtHash(this.types, digest(key));
  }

  set(key, value) {
    setValueAtHash(this.types, digest(key), value);
    return this;
  }
}

function getValueAtHash(map, hash) {
  let [current, ...rest] = hash;
  let last = map.get(current)
  if (rest.length === 0) {
    return last;
  } else {
    if (last == null) {
      last = new Map();
      map.set(current, last);
    }
    return getValueAtHash(last, rest);
  }
}

function setValueAtHash(map, hash, value) {
  let [current, ...rest] = hash;
  if (rest.length === 0) {
    map.set(current, value);
  } else {
    let next = map.get(current);
    if (next == null) {
      next = new Map();
      map.set(current, next);
    }
    setValueAtHash(next, rest, value);
  }
}
