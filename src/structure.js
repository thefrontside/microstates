import $ from './utils/chain';
import { map, append, pure, foldl } from 'funcadelic';
import { flatMap } from './monad';
import { view, set, lensTree, lensPath, lensIndex } from './lens';
import Tree from './utils/tree';
import transitionsFor from './utils/transitions-for';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';
import { reveal } from './utils/secret';
import { toType } from './types';
import isSimple  from './is-simple';

const { assign } = Object;

export default function analyze(Type, value) {
  return flatMap(analyzeType(value), pure(Tree, new Node(Type, [])));
}

function analyzeType(value) {
  return (node) => {
    let InitialType = node.Type;
    let valueAt = node.valueAt(value);
    let instance = new InitialType(valueAt);
    let Type = toType(instance.constructor);

    return new Tree({
      data: () => Type === InitialType ? node : append(node, { Type }),
      children() {
        return $(new Type())
          .filter(({ value }) => !!value && value.call)
          .map((ChildType, key) => pure(Tree, new Node(ChildType, append(node.path, key))))
          .valueOf();
      }
    });
  };
}

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
function prune(tree) {
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
function graft(path, tree) {
  if (path.length === 0) {
    return tree;
  } else {
    return map(node => append(node, { path: [...path, ...node.path]}), tree);
  }
}

class Node {
  constructor(Type, path, tree) {
    assign(this, { Type, path });
  }

  valueAt(total) {
    return view(lensPath(this.path), total);
  }

  stateAt(value) {
    let { Type } = this;
    let nodeValue = this.valueAt(value);
    let instance = new Type(nodeValue).valueOf();
    if (isSimple(Type)) {
      return nodeValue || instance;
    } else {
      /**
       * TODO: reconsider scenario where user returned a POJO from constructor.
       * Decide if we want to merge POJOs into instantiated object.
       *
       * Cases:
       *  1. No constructor specified
       *  2. Returning an instance of original specified type
       *  3. Returning a new type
       *  4. Return a POJO and merging in
       *  5. Sharing complex objects between instances
       */
      let descriptors = getOwnPropertyDescriptors(instance);
      if (nodeValue) {
        descriptors = append(getOwnPropertyDescriptors(nodeValue), descriptors);
      }
      let state = Object.create(Object.getPrototypeOf(instance), descriptors);
      return state;
    }
  }

  transitionsAt(value, tree, invoke) {
    let { Type, path } = this;
    return map(method => (...args) => {
      let localValue = this.valueAt(value);
      let localTree = view(lensTree(path), tree);

      let transition = {
        method,
        args,
        value: localValue,
        tree: prune(localTree)
      };

      let {
        value: nextLocalValue,
        tree: nextLocalTree
      } = invoke(transition);

      let nextTree = set(lensTree(path), graft(path, nextLocalTree), tree);
      let nextValue = set(lensPath(path), nextLocalValue, value);
      return { tree: nextTree, value: nextValue };
    }, transitionsFor(Type));

    return transitions;
  }
}
