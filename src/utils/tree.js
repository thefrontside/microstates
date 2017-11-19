import { append, filter, Functor, map } from 'funcadelic';

let { keys } = Object;

export default class Tree {
  constructor({ data = () => ({}), children = () => ({}) }) {
    return Object.create(Tree.prototype, {
      data: {
        get: data,
      },
      children: {
        get: children,
      },
    });
  }

  get collapsed() {
    if (keys(this.children).length > 0) {
      return append(this.data, map(child => child.collapsed, this.children));
    } else {
      return this.data;
    }
  }

  static from(Type, path = []) {
    return new Tree({
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
        let childTypes = filter(({ value }) => !!value && value.call, new Type());

        return map((ChildType, key) => Tree.from(ChildType, append(path, key)), childTypes);
      },
    });
  }
}

Functor.instance(Tree, {
  /**
   * Lazily invoke callback on every property of given tree,
   * the return value is assigned to property value.
   *
   * @param {*} fn (TypeTree, path) => any
   * @param {*} tree Tree
   */
  map(fn, tree) {
    return new Tree({
      data() {
        return fn(tree.data);
      },
      children() {
        return map(child => map(fn, child), tree.children);
      },
    });
  },
});
