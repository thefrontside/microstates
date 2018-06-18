import { append, Applicative, applyOne, map } from 'funcadelic';

import { view, lensPath } from 'ramda';

export const A = Object.freeze([]);

export default class Tree {
  constructor(content = {}) {
    this.content = content;
    if (typeof content.Type !== 'function') {
      this.content = append(content, { Type: Any });
    }
    if (content.children == null) {
      this.content = append(this.content, { get children() { return A }});
    }
    if (content.path == null) {
      this.content = append(this.content, { path: [] });
    }
    if (content.stable == null) {
      this.content = append(this.content, {
        stable: new Stable(this)
      });
    }
  }

  get path() {
    return this.content.path;
  }

  get Type() {
    return this.content.Type;
  }

  get basis() {
    return this.content.basis;
  }

  get state() {
    return this.content.stable.state;
  }

  get value() {
    return view(lensPath(this.path), this.basis);
  }

  get children() {
    return this.content.children;
  }
}

class Stable {
  constructor(tree) {
    this.tree = tree;
  }

  get state() {
    let { Type } = this.tree;
    return Object.create(Type.prototype);
  }
}

export class Any {
  set(value) {
    return value;
  }
}
