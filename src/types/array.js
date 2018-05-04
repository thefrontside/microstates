import { append, foldl, map, flatMap } from 'funcadelic';
import $ from '../utils/chain';
import { reveal } from '../utils/secret';
import Tree from '../tree';
import { parameterized, params } from './parameters0';
import Any from './any';

class ArrayType {
  constructor(value = []) {
    return value instanceof Array ? value : [value];
  }

  push(item) {
    return map(tree => flatMap(current => {
      if (tree.stable === current.stable) {
        let { T } = params(current.Type);
        return append(current, { 
          children: () => append(current.children, new Tree({ Type: T, value: item }))
        });
      }
      return current;
    }, tree), this);
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
    return map(tree => flatMap(current => {
      if (tree.stable === current.stable) {
        return append(current, { 
          children: () => current.children.filter(tree => fn(tree.state))
        });
      }
      return current;
    }, tree), this);
  }

  map(fn) {
    return map(tree => flatMap(current => {
      if (tree.stable === current.stable) {
        return append(current, { 
          children: () => current.children.map(tree => {
            let result = fn(tree.state);
            if (result === tree.state) {
              return tree;
            } else {
              return new Tree({ Type: tree.Type, value: result });
            }
          })
        });
      }
      return current;
    }, tree), this);
  }

  splice(startIndex, length, values) {
    let Microstate = this.constructor;
    let { create } = Microstate;
    let tree = reveal(this);

    let value = (this.valueOf() || []).slice();

    value.splice(startIndex, length, ...values);

    let { T } = params(tree.data.Type);
    if (T === Any) {
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
      data: () => new tree.data.constructor({path: [], root: map(tree => tree.data.value, children), Type: tree.data.Type }),
      children: () => children
    });

    return new Microstate(structure);
  }
}

export default parameterized(ArrayType, {T: Any});
