import { append, map, flatMap } from 'funcadelic';
import Tree from '../tree';
import { parameterized, params } from './parameters0';
import Any from './any';

function flatMapTree(fn, tree) {
  return map(tree => flatMap(current => current.is(tree) ? fn(current) : current, tree), tree);
}

class ArrayType {
  constructor(value = []) {
    return value instanceof Array ? value : [value];
  }

  push(item) {
    return flatMapTree(current => {
      let { T } = params(current.Type);
      return append(current, { 
        children: () => append(current.children, new Tree({ Type: T, value: item }))
      });
    }, this);
  }

  pop() {
    return flatMapTree(current => {
      return append(current, {
        children: () => {
          let children = current.children.slice();
          children.pop();
          return children;
        }
      })
    }, this)
  }

  shift() {
    return flatMapTree(current => {
      return append(current, {
        children: () => {
          let children = current.children.slice();
          children.shift();
          return children;
        }
      })
    }, this);
  }

  unshift(value) {
    let values = Array.isArray(value) ? value : [value];

    return flatMapTree(current => {
      return append(current, {
        children: () => {
          let children = current.children.slice();
          let { T } = params(current.Type);
          let trees = map(value => new Tree({ Type: T, value }), values);
          return trees.concat(children);
        }
      })
    }, this);
  }

  filter(fn) {
    return flatMapTree(current => {
      return append(current, { 
        children: () => current.children.filter(tree => fn(tree.state))
      });
    }, this);
  }

  map(fn) {
    return flatMapTree(current => {
      return append(current, { 
        children: () => current.children.map(tree => {
          let value = fn(tree.state);
          if (value === tree.state) {
            return tree;
          } else {
            return new Tree({ Type: tree.Type, value });
          }
        })
      })
    }, this);
  }

  splice(startIndex, length, value) {
    return flatMapTree(current => {
      return append(current, { 
        children: () => {
          let children = current.children.slice();
          let { T } = params(current.Type);
          children.splice(startIndex, length, new Tree({ Type: T, value }));
          return children;
        }
      })
    }, this);
  }
}

export default parameterized(ArrayType, {T: Any});
