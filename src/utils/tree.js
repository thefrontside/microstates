import $ from './chain';
import thunk from '../thunk';
import { append, filter, reduce, map } from 'funcadelic';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

let { keys } = Object;

export default class Tree {
  constructor(props = {}) {
    let { data = () => ({}), children = () => ({}) } = props;
    return Object.create(Tree.prototype, {
      data: {
        get: thunk(data),
        enumerable: true,
      },
      children: {
        get: thunk(children),
        enumerable: true,
      },
    });
  }

  get hasChildren() {
    return !!keys(this.children).length;
  }

  get collapsed() {
    if (this.hasChildren) {
      return append(this.data, map(child => child.collapsed, this.children));
    } else {
      return this.data;
    }
  }
}
