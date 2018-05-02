import { append, map, flatMap, foldl, foldr, Functor, Monad, Semigroup } from 'funcadelic';
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

/**
 * Apply a transition to a microstate and return the next
 * microstate. 
 * @param {Microstate} localMicrostate 
 * @param {Function} transition 
 * @param {Array<any>} args 
 */
const defaultMiddleware = (localMicrostate, transition, args) => {
  let tree = reveal(localMicrostate);

  let { microstate } = tree.apply(focus => {
    let next = transition.apply(focus.microstate, args);
    return next instanceof Microstate ? reveal(next) : new Tree({ Type: focus.Type, value: next })
  });

  return microstate;
};

const defaultConstructorFactory = Type => {
  class MicrostateWithTransitions extends Microstate {}
  
  let descriptors = Type === types.Any ? getPrototypeDescriptors(types.Any) : assign(getPrototypeDescriptors(toType(Type)), getPrototypeDescriptors(types.Any))

  let transitions = $(descriptors)
    .filter(({ key, value }) => typeof value.value === 'function' && key !== 'constructor')
    .map(descriptor => ({
      enumerable: true,
      configurable: true,
      value(...args) {
        // transition that the user is invoking
        return reveal(this).root.stable.middleware(this, descriptor.value, args);
      }
    }))
    .valueOf();

  defineProperties(MicrostateWithTransitions.prototype, transitions);

  return MicrostateWithTransitions;
}

export class Microstate {

  constructor(tree) {
    keep(this, tree);

    return append(this, map(child => child.microstate, tree.children));    
  }

  static create(Type, value) {
    return new Tree({ Type, value }).microstate;
  }

  valueOf() {
    return reveal(this).value;
  }

  get state() {
    return reveal(this).state;
  }
}

Functor.instance(Microstate, {
  map(fn, microstate) {
    return fn(reveal(microstate)).microstate;
  }
})

export default class Tree {
  // value can be either a function or a value.
  constructor({ Type = types.Any, value, path = [], root, middleware = defaultMiddleware, constructorFactory = defaultConstructorFactory}) {
    this.Type = Type;
    this.path = path;
    this.root = root || this;
    // stable object has all of the data that will be
    // copied to a new tree when mapping trees.
    this.stable = {
      value: new Value(value),
      state: new State(this),
      Constructor: constructorFactory(Type),
      middleware
    }
  }

  use(fn) {
    return append(this, { middleware: fn(this.stable.middleware) });
  }

  /**
   * Returns a new root tree with after applying the function argument to the current tree.
   * Apply will backup the middleware on this tree to ensure that context specific middleware
   * is not applied when the tree is pruned.
   */
  apply(fn) {
    let { middleware } = this.root.stable;
    // overload custom middleware to allow context free transitions
    let root = append(this.root, { middleware: defaultMiddleware });
    // focus on current tree and apply the function to it
    let nextRoot = over(this.lens, fn, root);
    // put the original middleware into the next root tree so the middleware will
    // carry into the next microstate
    return append(nextRoot, { middleware });
  }
  
  /**
   * Evaluates to a lens that can be used with ramda lenses to view/set/over value
   * of other trees. Think about this as a branch that you overlap on another tree,
   * the place where the branch ends is the focus point.
   */
  get lens() {
    let get = tree => tree.treeAt(this.path).prune()

    let set = (tree, root) => {
      let nextValue = lset(lensPath(this.path), tree.value, root.value);
      let bottom = { tree: tree.graft(this.path, root), parentPath: this.path.slice(0, -1) };
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
        });
        defineStable(replacement, 'children', function stableChildren() {
          return map((child, key) => key === name ? tree : child, parent.children);
        }, false);
        return {
          parentPath: parentPath.slice(0, -1),
          tree: replacement
        }
      }, bottom, this.path);

      // this ensures that every node receives the root
      return map(tree => tree, top.tree);
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
    return map(tree => ({ path: tree.path.slice(this.path.length) }), this);
  }

  /**
   * Change the path of a tree.
   *
   * This lets you take any tree, sitting at any context and
   * prefix the context with additional path.
   */
  graft(path = [], root) {
    if (path.length === 0) {
      return this;
    } else {
      return map(tree => ({ path: [...path, ...tree.path], root }), this);
    }
  }

  get isRoot() {
    return this.root === this;
  }

  get hasChildren() {
    return keys(this.children).length > 0
  }

  get microstate() {
    let { stable: { Constructor } } = this;
    return new Constructor(this);
  }

  // state is stable across mapped trees
  get state() {
    return this.stable.state.value;
  }

  // value is stable across mapped trees
  get value() {
    return this.stable.value.value;
  }

  @stable
  // children are stable for a tree instance
  get children() {
    let { Type, value, path, root } = this;
    let childTypes = childTypesAt(Type, value);
    return map((ChildType, childPath) => new Tree({
      Type: ChildType,
      value: () => value && value[childPath] ? value[childPath] : undefined,
      path: append(path, childPath),
      root
    }), childTypes);
  }
}

/**
 * Tree Semigroup allows to add data to stable object on the root
 * of the tree. 
 */
Semigroup.instance(Tree, {
  append(tree, stable = {}) {
    return map(current => {
      if (current.stable === tree.stable) {
        return  {
          stable: assign({}, tree.stable, stable)
        };
      } else {
        return current;
      }
    }, tree);
  }
})

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

/**
 * Define a stable getter on target object at specified key.
 */
function defineStable(target, key, fn, enumerable = true, configurable = true) {
  return defineProperty(target, key, {
    configurable,
    enumerable,
    get: stabilizeOn(key, fn)
  })
}

function stabilizeOn(key, fn) {
  return function stabilized() {
    let value = fn.call(this);
    defineProperty(this, key, { value });
    return value;
  }
}

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

    function remap(fn, tree, root) {
      let mapped = thunk(() => fn(tree));

      let next = Object.create(Tree.prototype, {
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
        root: {
          enumerable: true,
          get() { return root; }
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
            return map(child => remap(fn, child, root), tree.children);
          })
        }
      });
      root = root || next;
      return next;
    }
    return remap(fn, tree);
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
