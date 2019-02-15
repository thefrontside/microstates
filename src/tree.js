import { type } from 'funcadelic';

import CachedProperty from './cached-property';

export const Tree = type(class {
  static name = 'Tree';

  childAt(key, parent) {
    if (parent[Tree.symbol]) {
      return this(parent).childAt(key, parent);
    } else {
      return parent[key];
    }
  }

  defineChildren(fn, parent) {
    if (parent[Tree.symbol]) {
      return this(parent).defineChildren(fn, parent);
    } else {
      for (let property of Object.keys(parent)) {
        Object.defineProperty(parent, property, CachedProperty(property, () => fn(property, parent)));
      }
    }
  }
});

export const { childAt, defineChildren } = Tree.prototype;
