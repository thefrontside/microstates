import $ from './utils/chain';
import { type, map, append, pure, flatMap } from 'funcadelic';
import { view, set, lensTree, lensPath } from './lens';
import Tree, { graft, prune } from './utils/tree';
import transitionsFor from './utils/transitions-for';
import { reveal } from './utils/secret';
import types, { params, any, toType } from './types';
import isSimple  from './is-simple';
import desugar from './desugar';
import Microstate from './microstate';
import { collapse } from './typeclasses/collapse';

const { assign } = Object;

export default function analyze(Type, value) {
  return flatMap(analyzeType(value), pure(Tree, new PrimaryValue(Type, [], value)));
}

export function collapseState(tree, value) {
  if (tree.data.value !== value) {
    // console.warn("tree.data.value !== value", tree.data.value, value);
  }
  let truncated = truncate(node => node.isSimple, tree);
  return collapse(map(node => node.stateAt(value), truncated));
}

function analyzeType(rootValue) {
  return (node) => {
    let { Type, value } = node;
    let instance = Type.hasOwnProperty('create') ? Type.create(value) : undefined;

    if (instance instanceof Microstate) {
      let { tree } = reveal(instance);

      let shift = new PrimaryValue(tree.data.Type, tree.data.path, tree.data.value);
      return graft(node.path, new Tree({
        data: () => shift,
        children: () => tree.children
      }));
    }

    return new Tree({
      data: () => node,
      children() {
        let childTypes = childrenAt(Type, value);
        return map((ChildType, path) => pure(Tree, new NestedValue(ChildType, append(node.path, path), rootValue)), childTypes);
      }
    });
  };
}

const Location = type(class Location {
  stateAt(Type, instance, value) {
    return this(Type.prototype).stateAt(instance, value);
  }
  childrenAt(Type, value) {
    return this(Type.prototype).childrenAt(Type, value);
  }
});

const { stateAt, childrenAt } = Location.prototype;

Location.instance(Object, {
  stateAt(instance, value) {
    if (value) {
      return append(instance, value);
    } else {
      return instance;
    }
  },

  childrenAt(Type, value) {
    return $(new Type())
      .map(desugar)
      .filter(({ value }) => !!value && value.call)
      .valueOf();
  }
});

Location.instance(types.Object, {
  stateAt: _ => ({}),
  childrenAt(Type, value) {
    let { T } = params(Type);
    if (T !== any) {
      return map(_ => T, value);
    } else {
      return Location.for(Object).childrenAt(Type, value);
    }
  }
});

Location.instance(types.Array, {
  stateAt: _ => [],
  childrenAt(...args) {
    return Location.for(types.Object.prototype).childrenAt(...args);
  }
});

function truncate(fn, tree) {
  return flatMap(node => {
    let subtree = view(lensTree(node.path), tree);
    if (fn(node)) {
      return append(subtree, { children: [] });
    } else {
      return subtree;
    }
  }, tree);
}

import logTree from './utils/log-tree';

class Node {
  constructor(InitialType, path) {
    assign(this, { Type: toType(desugar(InitialType)), path });
  }

  get isSimple() {
    return isSimple(this.Type);
  }

  stateAt(value) {
    let { Type } = this;
    let valueAt = this.value;
    let instance = new Type(valueAt).valueOf();
    if (isSimple(Type)) {
      return valueAt || instance;
    } else {
      return stateAt(Type, instance, valueAt);
    }
  }

  transitionsAt(valueX, tree, invoke) {
    let { Type, path } = this;

    return map(method => (...args) => {
      let localValue = this.value;
      let localTree = view(lensTree(path), tree);

      let pruned = map(node => {
        if (node.isNested) {
          return append(node, { root: localValue });
        } else {
          return node;
        }
      }, prune(localTree));

      let transition = {
        method,
        args,
        value: localValue,
        tree: pruned
      };

      let {
        value: nextLocalValue,
        tree: nextLocalTree
      } = invoke(transition);

      let { data: node } = nextLocalTree;


      let nextTree = set(lensTree(path), graft(path, nextLocalTree), tree);
      let nextValue = set(lensPath(path), nextLocalValue, tree.data.value);

      
      let next = map(node => {
        if (node === nextTree.data) {
          //it's the root. Update its primary vaule
          return append(node, { value: nextValue });
        } else if (node instanceof NestedValue) {
          //it's a nested value that reads from the root
          return new NestedValue(node.Type, node.path, nextValue);
        } else {
          //it's a primary value
          return node;
        }
      }, nextTree);

      if (nextValue !== next.data.value) {
        throw new Error('nope!');
      }
      return { tree: next, value: next.data.value };
    }, transitionsFor(Type));
  }
}

class PrimaryValue extends Node {
  constructor(Type, path, value) {
    super(Type, path);
    assign(this, { value });
  }

  get isPrimary() { return true; }

  valueAt(root) {
    if (root !== this.value) {
      console.warn('primary value not equal to itself?? WAT', root, this.value);
    }
    return super.valueAt(root);
  }
}

class NestedValue extends Node {
  constructor(Type, path, root) {
    super(Type, path);
    assign(this, { root });
  }

  get isNested() { return true; }
}

// This value is computed, but I want it to be enumerable.
// Is there a better way to do this?
Object.defineProperty(NestedValue.prototype, 'value', {
  enumerable: true,
  configurable: false,
  get() {
    if (!this._value) {
      this._value = view(lensPath(this.path), this.root);
    }
    return this._value;
  }
});
