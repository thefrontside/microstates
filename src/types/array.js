import set from 'ramda/src/set';
import indexOf from 'ramda/src/indexOf';
import lensPath from 'ramda/src/lensPath';

export default class ArrayType {
  constructor(value = []) {
    return value instanceof Array ? value : [value];
  }
  push(...args) {
    return [...this.state, ...args];
  }
  filter(callback) {
    return Array.prototype.filter.call(this.state, callback);
  }
  map(callback) {
    return Array.prototype.map.call(this.state, callback);
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
   * @param {any} item
   * @param {any} replacement
   */
  replace(item, replacement) {
    let index = indexOf(item, this.state);
    if (index === -1) {
      return this.state;
    } else {
      return set(lensPath([index]), replacement, this.state);
    }
  }
}
