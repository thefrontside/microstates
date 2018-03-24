import { append, foldl, map } from 'funcadelic';
import set from 'ramda/src/set';
import indexOf from 'ramda/src/indexOf';
import lensPath from 'ramda/src/lensPath';
import $ from '../utils/chain';
import { reveal } from '../utils/secret';
import Tree, { prune, graft } from '../utils/tree';
import { parameterized, params, any } from './parameters0';

class ArrayType {
  constructor(value = []) {
    return value instanceof Array ? value : [value];
  }
  push(item) {
    return this.splice(this.state.length, 0, [item]);
  }
  pop() {
    return this.splice(this.state.length - 1, 1, []);
  }
  shift() {
    return this.splice(0, 1, []);
  }
  unshift(item) {
    return this.splice(0, 0, [item]);
  }
  filter(fn) {
    return foldl(({array, removed}, state, i) => {
      if (fn(state)) {
        return { array, removed };
      } else {
        return {
          array: array.splice(i - removed, 1, []),
          removed: removed + 1
        };
      }
    }, {array: this, removed: 0}, this.state).array;
  }
  map(callback) {
    return Array.prototype.map.call(this.state, callback);
  }

  splice(startIndex, length, values) {
    let Microstate = this.constructor;
    let { create } = Microstate;
    let tree = reveal(this);
    let value = (this.valueOf() || []).slice();
    value.splice(startIndex, length, ...values);

    let { T } = params(tree.data.Type);
    if (T === any) {
      return value;
    }

    let unchanged = tree.children.slice(0, startIndex);

    let added = $(values)
        .map(value => create(T, value))
        .map(reveal)
        .valueOf();

    let moved = map(prune, tree.children.slice(startIndex + length));

    function attach(index, tree) {
      return graft(append(tree.data.path, index), tree);
    }

    let children = $(unchanged)
        .append(map((child, i) => attach(i + unchanged.length, child), added))
        .append(map((child, i) => attach(i + unchanged.length + added.length, child), moved))
        .valueOf();

    let structure = new Tree({
      data: () => new tree.data.constructor(tree.data.Type, tree.data.path, map(tree => tree.data.value, children)),
      children: () => children
    });

    return new Microstate(structure);
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

export default parameterized(ArrayType, {T: any});
