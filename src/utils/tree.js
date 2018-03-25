import { append, filter, map } from 'funcadelic';
import $ from './chain';
import thunk from '../thunk';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';
import { Collapse, collapse } from '../typeclasses/collapse';

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

Collapse.instance(Tree, {
  collapse(tree) {
    let hasChildren = !!keys(tree.children).length;
    if (hasChildren) {
      return append(tree.data, map(child => collapse(child), tree.children));
    } else {
      return tree.data;
    }
  }
})

/**
 * Turn any structure tree into a root tree.
 *
 * Every node in a tree knows its path. This path is what identifies
 * its context in the containing tree.
 *
 * This lets you take any tree, sitting at any context and make it
 * "context free". I.e. converts it into a root.
 *
 * @param {Tree} tree - the tree to isolate
 * @returns {Tree} - a tree just like `tree`, but now a root.
 */
export function prune(tree) {
  let prefix = tree.data.path;
  return map(node => append(node, { path: node.path.slice(prefix.length)}), tree);
}

/**
 * Change the path of a tree.
 *
 * This lets you take any tree, sitting at any context and prefix the context with
 * additional path.
 *
 * @param {*} tree
 * @param {*} path
 */
export function graft(path, tree) {
  // console.log('graft=', path, tree.data.value);
  if (path.length === 0) {
    return tree;
  } else {
    return map(node => append(node, { path: [...path, ...node.path]}), tree);
  }
}

