import set from 'ramda/src/set';
import indexOf from 'ramda/src/indexOf';
import lensPath from 'ramda/src/lensPath';

export default class ArrayType {
  constructor(value = []) {
    return value instanceof Array ? value : [value];
  }
  push(current, ...args) {
    return [...current, ...args];
  }
  filter(current, callback) {
    return Array.prototype.filter.call(current, callback);
  }
  map(current, callback) {
    return Array.prototype.map.call(current, callback);
  }
  /**
   * Return a new array with first occurance of found item
   * replaced with the replacement. It is very optimistic and
   * will not throw even when item is not found.
   *
   * ```js
   * let ms = microstate(MS.Array, ['a', 'b', 'c']);
   * // => [ d, b, c ]
   * ```
   * @param {Array} current
   * @param {any} item
   * @param {any} replacement
   */
  replace(current, item, replacement) {
    let index = indexOf(item, current);
    if (index === -1) {
      return current;
    } else {
      return set(lensPath([index]), replacement, current);
    }
  }
}
