import { append, foldl, map } from 'funcadelic';
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

    let result = foldl(({array, removed}, state, i) => {
      if (fn(state)) {
        return { array, removed };
      } else {
        return {
          array: array.splice(i - removed, 1, []),
          removed: removed + 1
        };
      }
    }, {array: this, removed: 0}, this.state).array;

    return this.set(result);
  }

  map(callback) {
    return this.set(Array.prototype.map.call(this.state, callback));
  }

  splice(startIndex, length, values) {
    let Microstate = this.constructor;
    let { create } = Microstate;
    let tree = reveal(this);
    let value = (this.valueOf() || []).slice();
    value.splice(startIndex, length, ...values);

    let { T } = params(tree.data.Type);
    if (T === any) {
      return this.set(value);
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
      data: () => new tree.data.constructor({path: [], root: map(tree => tree.data.value, children), Type: tree.data.Type }),
      children: () => children
    });

    return new Microstate(structure);
  }
}

export default parameterized(ArrayType, {T: any});
