import $ from './utils/chain';
import { map, append, pure } from 'funcadelic';
import { flatMap } from './monad';
import { view, set, lensTree, lensPath } from './lens';
import Tree from './utils/tree';
import transitionsFor from './utils/transitions-for';
import { reveal } from './utils/secret';
import types, { params, any, toType } from './types';
import isSimple  from './is-simple';
import desugar from './desugar';
import Microstate from './microstate';

const { assign } = Object;

export default function analyze(Type, value) {
  return flatMap(analyzeType(value), pure(Tree, new Node(Type, [])));
}

export function analyzeType(value) {
  return (node) => {
    let InitialType = desugar(node.Type);
    let valueAt = node.valueAt(value);
    let instance = new InitialType(valueAt);

    let Type;
    if (instance instanceof Microstate) {
      let { tree } = reveal(instance);
      Type = tree.data.Type;
    } else {
      Type  = toType(InitialType);
    }

    return new Tree({
      data: () => Type === node.Type ? node : append(node, { Type }),
      children() {
        if (isa(Type, types.Array)) {
          let { T } = params(Type);
          if (T !== any) {
            return map((child, i) => pure(Tree, new Node(T, append(node.path, i))), node.valueAt(value));
          }
        }
        if (isa(Type, types.Object)) {
          let { T } = params(Type);
          if (T !== any) {
            return map((child, name) => pure(Tree, new Node(T, append(node.path, name))), node.valueAt(value));
          }
        }
        return $(new Type())
          .map(desugar)
          .filter(({ value }) => !!value && value.call)
          .map((ChildType, key) => pure(Tree, new Node(ChildType, append(node.path, key))))
          .valueOf();
      }
    });
  };
}

function isa(Child, Ancestor) {
  return Child === Ancestor || Child.prototype instanceof Ancestor;
}

export function collapseState(tree, value) {
  return new $(tree)
      .flatMap(node => {
        if (node.isSimple) {
          if (isa(node.Type, types.Array)) {
            return analyzeType(value)(new Node(types.Array, node.path))
          }
          if (isa(node.Type, types.Object)) {
            return analyzeType(value)(new Node(types.Object, node.path));
          }
        }
        return analyzeType(value)(node);
      })
    .map(node => {
      return node.stateAt(value);
    }).valueOf().collapsed;
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
  constructor(Type, path) {
    assign(this, { Type, path });
  }

  get isSimple() {
    return isSimple(this.Type);
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
    } else if (isa(Type, types.Array)) {
      return [];
    } else if (isa(Type, types.Object)) {
      return {};
    } else if (nodeValue) {
      return append(instance, nodeValue);
    } else {
      return instance;
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
  }
}
