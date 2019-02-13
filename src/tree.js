import { type } from 'funcadelic';

export const Tree = type(class {
  childAt(key, parent) {
    if (parent[Tree.symbol]) {
      return this(parent).childAt(key, parent);
    } else {
      return parent[key];
    }
  }
});

export const { childAt } = Tree.prototype;
