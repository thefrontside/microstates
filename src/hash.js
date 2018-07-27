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
