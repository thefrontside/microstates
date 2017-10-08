import { append, Functor, map } from 'funcadelic';

export default class Tree {
  constructor({ data = {}, children = {} }) {
    return Tree.create({
      data: () => data,
      children: () => children,
    });
  }

  get collapsed() {
    return append(this.data, map(child => child.collapsed, this.children));
  }

  static create({ data = () => ({}), children = () => ({}) }) {
    return Object.create(Tree.prototype, {
      data: {
        get: data,
      },
      children: {
        get: children,
      },
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
        get() {
          return fn(tree.data);
        },
      },
      children: {
        get() {
          return map(child => map(fn, child), tree.children);
        },
      },
    });
  },
});
