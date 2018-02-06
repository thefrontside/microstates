import $ from './utils/chain';
import { map, append } from 'funcadelic';
import { view, set, lensTree, lensPath, lensIndex } from './lens';
import Tree from './utils/tree';
import isPrimitive from './utils/is-primitive';
import initialize from './utils/initialize';
import transitionsFor from './utils/transitions-for';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';
import construct, { Microstate } from './microstate';
import { reveal } from './utils/secret';

const { assign } = Object;

export default function analyze(Type, path = []) {
  return new Tree({
    data() {
      return new Node(Type, path);
    },
    children() {
      return $(new Type())
        .filter(({ value }) => !!value && value.call)
        .map((ChildType, key) => analyze(ChildType, append(path, key)))
        .valueOf();
    }
  });
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
function isolate(tree) {
  let prefix = tree.data.path;
  return map(node => append(node, { path: node.path.slice(prefix.length)}), tree);
}

class Node {
  constructor(Type, path) {
    assign(this, { Type, path });
  }

  valueAt(total) {
    return view(lensPath(this.path), total);
  }

  stateAt(value) {
    let { Type } = this;
    let nodeValue = this.valueAt(value);
    let instance = new Type(nodeValue).valueOf();
    // also don't know if this is the way to calculate state.
    if (isPrimitive(Type)) {
      return instance;
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
      let state = Object.create(Type.prototype, descriptors);
      return state;
    }
  }

  transitionsAt(value, tree, invoke) {
    let { Type, path } = this;

    return map(method => (...args) => {
      let localValue = this.valueAt(value);
      let localTree = view(lensTree(path), tree);
      let localState = this.stateAt(value);

      let transition = {
        Type,
        method,
        args,
        state: localState,
        value: localValue,
        tree: isolate(localTree)
      };

      let { Type: nextLocalType, value: nextLocalValue } = invoke(transition);

      let nextLocalTree = analyze(nextLocalType, path);

      let nextTree = set(lensTree(path), nextLocalTree, tree);
      let nextValue = set(lensPath(path), nextLocalValue, value);
      return { tree: nextTree, value: nextValue };
    }, transitionsFor(Type));
  }
}
