import { append, map } from 'funcadelic';
import transform from '../transform';
import Tree from '../tree';
import Any from './any';
import { parameterized } from './parameters0';
class ArrayType {
  initialize(value = []) {
    return value;
  }

  /**
   * The push() transition adds one element to the end of the array.
   * Returns the next microstate.
   * @param {*} value 
   * @returns {Microstate}
   */
  push(value) {
    return transform((children, T) => {
      return append(children, Tree.from(value, T).graft([children.length]));
    }, this);
  }

  /**
   * The pop() transition removes the last element from an array. 
   * Returns the next microstate.
   * @returns {Microstate}
   */
  pop() {
    return transform(children => children.slice(0, -1), this);
  }

  /**
   * The shift() transition removes the first element from an array.
   * Returns the next microstate.
   * @returns {Microstate}
   */
  shift() {
    return transform(children => {
      return map((shifted, index) => {
        return map(tree => {
          let [, ...rest] = tree.path;
          return tree.assign({
            meta: {
              path: [index, ...rest]
            }
          })
        }, shifted);
      }, children.slice(1));
    }, this);
  }

  /**
   * The unshift() transition adds one element to the beginning of an array.
   * Returns the next microstate.
   * @returns {Microstate}
   */
  unshift(value) {
    return transform((children, T) => {
      return append([Tree.from(value, T).graft([0])], map((child, index) => {
        return map(tree => {
          let [, ...rest] = tree.path;
          return tree.assign({
            meta: {
              path: [index + 1, ...rest]
            }
          });
        }, child);
      }, children))
    }, this);
  }

  /**
   * The filter() transition creates a new array with all elements 
   * that pass the test implemented by the provided function.
   * Returns the next microstate.
   * @param {*} fn 
   * @returns {Microstate}
   */
  filter(fn) {
    return transform(children => {
      return map((child, index) => {
        return map(tree => {
          let [, ...rest] = tree.path;
          return tree.assign({
            meta: {
              path: [index, ...rest]
            }
          })
        }, child);
      }, children.filter(tree => fn(tree.state)));
    }, this);
  }

  /**
   * The map() transition creates a new array with the results of calling 
   * a provided function on every element in the calling array.
   * Returns the next microstate.
   * @param {*} fn 
   * @returns {Microstate}
   */
  map(fn) {
    return transform((children, T) => {
      return map((tree, index) => {
        let { microstate } = tree.prune();
        let mapped = Tree.from(fn(microstate, index), T);
        if (tree.isEqual(mapped)) {
          return tree;
        } else {
          return mapped.graft([index]);
        }
      }, children);
    }, this);
  }

  /**
   * This clear() transition replaces the array with an empty array.
   * Returns the next microstate.
   * @returns {Microstate}
   */
  clear() {
    return this.set([]);
  }
}

export default parameterized(ArrayType, {T: Any});
