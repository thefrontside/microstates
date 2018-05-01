import { append, map, flatMap, foldl, foldr, Functor, Monad } from 'funcadelic';
import types, { Any, toType, params } from './types';
import thunk from './thunk';
import $ from './utils/chain';
import getPrototypeDescriptors from './utils/get-prototype-descriptors';
import lens from 'ramda/src/lens';
import lensPath from 'ramda/src/lensPath';
import lset from 'ramda/src/set';
import view from 'ramda/src/view';
import over from 'ramda/src/over';
import desugar from './desugar';
import { reveal, keep } from './utils/secret';
export { reveal } from './utils/secret';

const { assign, keys, defineProperty, defineProperties } = Object;

const noop = () => { throw new Error(/noop invoke was called/) }

export class Microstate {

  constructor(tree) {
    keep(this, tree);

    return append(this, map(transition => (...args) => new Microstate(transition(tree, args)), tree.transitions));
  }

  static create(Type, value) {

    let invoke = (focus, method, args) => {
      let next = method.apply(new Microstate(focus), args);
      if (next instanceof Microstate) {
        return reveal(next);
      } else {
        return new Tree({ Type: focus.Type, value: next, invoke: focus.invoke });
      }
    }

    return new Microstate(new Tree({ Type, value, invoke }))
  }

  valueOf() {
    return reveal(this).value;
  }

  get state() {
    return reveal(this).state;
  }
}

// Functor.instance(Microstate, {
//   map(fn, microstate) {
//     let tree = reveal(microstate);

//     return new Microstate(new Tree({ Type: tree.Type, value: tree.value, stable: tree.stable, invoke: (...args) => fn(tree.invoke)(...args)}))
//   }
// })

export default class Tree {
  // value can be either a function or a value.
  constructor({ Type, value, path = [], invoke = noop }) {
    this.Type = Type;
    this.path = path;
    // stable object has all of the data that will be
    // copied to a new tree when mapping trees.
    this.stable = {
      value: new Value(value),
      state: new State(this),
      invoke
    }
  }

  /**
   * Evaluates to a lens that can be used with ramda lenses to view/set/over value
   * of other trees. Think about this as a branch that you overlap on another tree,
   * the place where the branch ends is the focus point.
   */
  get lens() {
    let get = tree => tree.treeAt(this.path).prune();

    let set = (tree, root) => {
      let nextValue = lset(lensPath(this.path), tree.value, root.value);
      let bottom = { tree: tree.graft(this.path), parentPath: this.path.slice(0, -1) };
      /**
       * Navigate the tree from bottom to the top and update
       * value of each tree in the path. Does not 
       * change the children that are uneffected by this change.
       */
      let top = foldr(({ tree, parentPath }, name) => {
        let parent = root.treeAt(parentPath);
        let replacement = new Tree({
          Type: parent.Type,
          path: parentPath,
          value: () => view(lensPath(parentPath), nextValue)
        })
        defineProperty(replacement, 'children', {
          enumerable: false,
          configurable: true,
          get: stabilizeOn('children', function stableChildren() {
            return map((child, key) => key === name ? tree : child, parent.children);
          })
        });
        return {
          parentPath: parentPath.slice(0, -1),
          tree: replacement
        }
      }, bottom, this.path);

      return top.tree;
    }

    return lens(get, set);
  }

  /**
   * Lookup a subtree in this tree at `path`.
   */
  treeAt(path) {
    return foldl((subtree, key) => subtree ? subtree.children[key]: undefined, this, path);
  }

  /**
   * Returns a new tree where the current tree is the root. The stable
   * values are carried over to the new tree.
   */
  prune() {
    return map(tree => ({ path: tree.path.slice(this.path.length)}), this);
  }

  /**
   * Change the path of a tree.
   *
   * This lets you take any tree, sitting at any context and
   * prefix the context with additional path.
   */
  graft(path = []) {
    if (path.length === 0) {
      return this;
    } else {
      return map(tree => ({ path: [...path, ...tree.path]}), this);
    }
  }

  get hasChildren() {
    return keys(this.children).length > 0
  }

  get TransitionsConstructor() {
    return Transitions.for(this.Type);
  }

  @stable
  get transitions() {
    let { TransitionsConstructor } = this;
    return new TransitionsConstructor(this);
  }

  // state is stable across mapped trees
  get state() {
    return this.stable.state.value;
  }

  // value is stable across mapped trees
  get value() {
    return this.stable.value.value;
  }

  get invoke() {
    // here we could wrap context provided invoke function
    // the function returned from here will be passed to children
    return this.stable.invoke
  }

  @stable
  // children are stable for a tree instance
  get children() {
    let { Type, value, path, invoke } = this;
    let childTypes = childTypesAt(Type, value);
    return map((ChildType, childPath) => new Tree({
      Type: ChildType,
      value: () => value && value[childPath] ? value[childPath] : undefined,
      path: append(path, childPath),
      invoke
    }), childTypes);
  }
}

class Value {
  constructor(valueOrFn) {
    this.valueOrFn = valueOrFn;
  }

  @stable
  get value() {
    let { valueOrFn } = this;
    if (typeof valueOrFn === 'function') {
      return valueOrFn();
    } else {
      return valueOrFn;
    }
  }
}

class State {
  constructor(tree) {
    this.tree = tree;
  }

  @stable
  get value() {
    let { tree } = this;
    let { Type, value } = this.tree;
    let initial = new Type(value);
    if (tree.hasChildren) {
      return append(initial, map(child => child.state, tree.children));
    } else {
      return initial.valueOf();
    }
  }
}

function childTypesAt(Type, value) {
  if (Type === types.Object || Type.prototype instanceof types.Object || Type === types.Array || Type.prototype instanceof types.Array) {
    let { T } = params(Type);
    return map(() => T, value);
  }
  return $(new Type())
    .map(desugar)
    .filter(({ value }) => !!value && value.call)
    .valueOf();
}

/**
 * This descriptor can be applied to a getter. When applied to a getter,
 * the result of the getter's computation will be cached on first read
 * and reused on consequent reads.
 */
function stable(target, key, descriptor) {
  let { get } = descriptor;
  descriptor.get = stabilizeOn(key, get);
  return descriptor;
}

function stabilizeOn(key, fn) {
  return function stabilized() {
    let value = fn.call(this);
    defineProperty(this, key, { value });
    return value;
  }
}

function transition(method) {
  return function(root, args) {
    let { lens, invoke } = reveal(this);
    return over(lens, focus => invoke(focus, method, args), root);
  }
}

export class Transitions {
  constructor(tree) {
    keep(this, tree);
  }

  /**
   * Transitions.for takes a class and returns a class. The returned classes
   * has each method wrapped in `transition` function. Ideally, this constructor
   * would return an object that is aware of composed types but this is not
   * possible without a proxy to allow the composed types to be dynamically
   * looked up.
   */
  static for(Class) {

    let transitions = $(assign({}, getPrototypeDescriptors(toType(Class)), getPrototypeDescriptors(types.Any)))
        .filter(({ key, value }) => typeof value.value === 'function' && key !== 'constructor')
        .map(descriptor => transition(descriptor.value))
        .valueOf();

    class TypeTransitions extends Transitions {
      static transitions = transitions;
    }

    defineProperties(TypeTransitions.prototype, map(transition => ({ enumerable: true, configurable: true, value: transition }), transitions));

    return TypeTransitions;
  }
}

Functor.instance(Transitions, {
  map(fn, transitions) {
    let tree = reveal(transitions);

    let mapped = new Transitions(tree);

    for (let name in tree.TransitionsConstructor.transitions) {
      defineProperty(mapped, name, {
        configurable: true,
        enumerable: true,
        get: stabilizeOn(name, function stableMappedTransition() {
          return fn(transitions[name].bind(transitions));
        })
      })
    }
    
    for (let childName in tree.children) {
      defineProperty(mapped, childName, {
        configurable: true,
        enumerable: true,
        get: stabilizeOn(childName, function stableMappedTransitionsChild() {
          return map(fn, tree.children[childName].transitions)
        })
      });
    }

    return mapped;
  }
})

/**
 * Tree Functor allows a developer to map a tree without changing
 * the tree's structure. The functor instance will enforce maintaing
 * the structure by copying over Type and overriding returned chidren.
 *
 * The purpose of this mechanism is to allow a developer to change the
 * path of a tree and cary over the stable value or change the value
 * for a tree of the same structure.
 *
 * To change the path and keep stable values,
 * ```
 * map(tree => ({ path: compute(tree.path) }), tree)
 * ```
 *
 * To change the stable values,
 * ```
 * map(tree => new Tree({ Type: tree.Type, value }), tree)
 * ```
 */
Functor.instance(Tree, {
  map(fn, tree) {

    let mapped = thunk(() => fn(tree));

    return Object.create(Tree.prototype, {
      Type: {
        enumerable: true,
        value: tree.Type
      },
      path: {
        enumerable: true,
        get() {
          let { path } = mapped();
          return path ? path : tree.path;
        }
      },
      stable: {
        enumerable: true,
        get() {
          let { stable } = mapped();
          return stable ? stable : tree.stable;
        }
      },
      children: {
        enumerable: false,
        configurable: true,
        get: stabilizeOn('children', function stableChildren() {
          return map(child => map(fn, child), tree.children);
        })
      }
    })
  }
});


Monad.instance(Tree, {

  /**
   * Enclose any value into the most essential Type tree.
   * In this instance, it takes any value, and places it in a tree
   * whose  type is `Any` (which is basically an id type).
   */
  pure(value) {
    return new Tree({ value, Type: Any});
  },

  /**
   * Recursively alter the structure of a Tree.
   *
   * The flat mapping function is invoked on each node in the tree's
   * graph. The returned Tree's `Type`, `value`, `stable` and
   * `children` properties will replace the existing tree in the
   * return vlaue. However, the `path` attribute may not be
   * altered. This is because the flat mapped node must _necessarily_
   * occupy the exact same position in the tree as the node it was
   * mapped from.
   *
   * The flat mapping function is applied recursively to the
   * children of the Tree _returned_ by the mapping function, not the
   * children of the original tree.
   *
   * TODO: Since the mapping function can alter the value of a
   * node in the tree, is it the responsibility of `flatMap` to
   * percolate that value change all the way up to the root of the
   * ultimately returned tree?
   */
  flatMap(fn, tree) {
    let next = thunk(() => fn(tree));
    return Object.create(Tree.prototype, {
      Type: {
        enumerable: true,
        value: next().Type
      },
      value: {
        enumerable: true,
        get: () => next().value
      },
      path: {
        enumerable: true,
        value: tree.path
      },
      stable: {
        enumerable: true,
        get() {
          let { stable } = next();
          return stable ? stable : tree.stable;
        }
      },
      children: {
        enumerable: false,
        configurable: true,
        get: stabilizeOn('children', function stableChildren() {
          return map(child => flatMap(fn, child), next().children);
        })
      }
    })
  }
})
