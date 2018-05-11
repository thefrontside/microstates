import { append, map, flatMap } from 'funcadelic';
import Tree from '../tree';
import { parameterized, params } from './parameters0';
import Any from './any';

class ArrayType {
  constructor(value = []) {
    return value instanceof Array ? value : [value];
  }

  push(value) {
    return transform((children, T) => append(children, new Tree({ Type: T, value })), this);
  }

  pop() {
    return transform(children => children.slice(0, -1), this);
  }

  shift() {
    return transform(children => children.slice(1), this);
  }

  unshift(value) {
    return transform((children, T) => append([new Tree({ Type: T, value })], children), this);
  }

  filter(fn) {
    return transform(children => children.filter(tree => fn(tree.state)), this);
  }

  map(fn) {
    return transform(children => {
      return children.map(tree => {
        let value = fn(tree.state);
        if (value === tree.state) {
          return tree;
        } else {
          return new Tree({ Type: tree.Type, value });
        }
      })
    }, this);
  }

  splice(startIndex, length, value) {
    return transform((children, T) => {
      return children.splice(startIndex, length, new Tree({ Type: T, value}));
    });
  }
}

function transform(fn, microstate) {
  return map(tree => flatMap(current => {
    if (current.is(tree)) {
      return current.assign({
        meta: {
          children() {
            let { T } = params(current.Type);
            return fn(current.children.slice(), T);
          }
        }
      })
    } else {
      return current;
    }
  }, tree), microstate);
}

export default parameterized(ArrayType, {T: Any});
