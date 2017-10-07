import { filter, append, Functor, map } from 'funcadelic';

import getReducerType from './get-reducer-type';

export default class Tree {

  constructor({ data = {}, children = {}}) {
    return Tree.create({
      data: () => data,
      children: () => children
    });
  }

  get collapsed() {
    return append(this.data, map(child => child.collapsed, this.children));
  }

  static create({data = ()=> ({}), children =  ()=> ({})}) {
    return Object.create(Tree.prototype, {
      data: {
        get: data
      },
      children: {
        get: children
      }
    });
  }

  static from(Type, path = []) {
    return Tree.create({
      data() {
        return { path, Type };
      },
      /**
       * children property is a map of composed types. When read, it will
       * evaluate to a map of instances of Tree nodes. For example,
       *
       * class Person {
       *  name = String;
       *  age = Number;
       * }
       *
       * `Tree.from(Person).children` will evaluate to { name: Tree, age: Tree }
       *
       * children property is a getter to prevent eager evaluation of children because
       * eager evaluation will cause Inifinte loop in self referencing recursive schemas.
       *
       * For example,
       *
       * class Person {
       *  parent = Person;
       * }
       *
       * Eager evaluation would cause infinite loop because parent would be evaluated recursively.
       */
      children() {
        let Reducer = getReducerType(Type);
        let childTypes = filter(({ value }) => !!value.call, new Reducer());

        return map((ChildType, key) => Tree.from(ChildType, append(path, key)), childTypes);
      }
    });
  }
}

Functor.instance(Tree, {
  /**
   * Lazily invoke callback on every proprerty of given tree,
   * the return value is assigned to property value.
   *
   * @param {*} fn (TypeTree, path) => any
   * @param {*} tree Tree
   */
  map(fn, tree) {
    return Object.create(Tree, {
      data: {
        get() { return fn(tree.data); }
      },
      children: {
        get() {
          return map(child => map(fn, child), tree.children);
        }
      }
    });
  }
});
