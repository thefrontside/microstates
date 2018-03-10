import { append, filter, map } from 'funcadelic';
import $ from './chain';
import thunk from '../thunk';
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
}
