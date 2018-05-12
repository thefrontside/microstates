import { append, map, flatMap, foldl, foldr, Functor, Monad } from 'funcadelic';
import getPrototypeDescriptors from 'get-prototype-descriptors';
import SymbolObservable from "symbol-observable";
import stabilizeClass from 'memoize-getters';
import lens from 'ramda/src/lens';
import lensPath from 'ramda/src/lensPath';
import lset from 'ramda/src/set';
import view from 'ramda/src/view';
import over from 'ramda/src/over';

import types, { toType, params } from './types';
import thunk from './thunk';
import $ from './utils/chain';
import desugar from './desugar';
import { reveal, keep } from './utils/secret';
export { reveal } from './utils/secret';
import isSimple from './is-simple';
import keys from './keys';
import shallowDiffers from './shallow-differs';

const { assign, defineProperty, defineProperties } = Object;

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
    return next instanceof Microstate ? reveal(next) : focus.assign({ data: { value: next }});
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
        return reveal(this).root.data.middleware(this, descriptor.value, args);
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
    return flatMap(tree => {
      if (tree.Type.prototype.hasOwnProperty("initialize")) {
        let initialized = tree.microstate.initialize(tree.value);
        if (initialized) {
          return reveal(initialized);
        } else {
          return tree;
        }
      }
      return tree;
    }, new Tree({ Type, value })).microstate;
  }

  valueOf() {
    return reveal(this).value;
  }

  get state() {
    return reveal(this).state;
  }

  [SymbolObservable]() {
    let microstate = this;
    return {
      subscribe(observer) {
        let next = observer.call ? observer : observer.next.bind(observer);

        let mapped = map(tree => tree.use(middleware => (...args) => {
          let microstate = middleware(...args);
          next(microstate);
          return microstate;
        }), microstate);

        next(mapped);
      },
      [SymbolObservable]() {
        return this;
      }
    };
  }
}

Functor.instance(Microstate, {
  map(fn, microstate) {
    return fn(reveal(microstate)).microstate;
  }
})

export default class Tree {
  // value can be either a function or a value.
  constructor({ Type: InitialType = types.Any, value, path = [], root, middleware = defaultMiddleware, constructorFactory = defaultConstructorFactory}) {

    let Type = toType(desugar(InitialType));

    this.meta = {
      InitialType,
      Type,
      path,
      root: root || this,
      StabilizedClass: stabilizeClass(class extends Type {}),
      Constructor: constructorFactory(Type),
      children: new Children(this, childrenFromTree),
    }

    this.data = {
      value: new Value(value),
      state: new State(this, stateFromTree),
      middleware
    }
  }

  get Type() {
    return this.meta.Type;
  }

  get path() {
    return this.meta.path;
  }

  get root() {
    return this.meta.root;
  }

  get isSimple() {
    return isSimple(this.Type);
  }

  get isRoot() {
    return this.root === this;
  }

  get hasChildren() {
    return keys(this.children).length > 0
  }

  get microstate() {
    let { meta: { Constructor } } = this;
    return new Constructor(this);
  }

  get state() {
    return this.data.state.value;
  }

  get value() {
    return this.data.value.value;
  }

  get children() {
    return this.meta.children.value;
  }

  is(tree) {
    return this.data === tree.data;
  }

  isEqual(tree) {

    if (this.is(tree)) {
      return true;
    }

    if (this.Type !== tree.Type || this.value !== tree.value) {
      return false;
    }

    if (shallowDiffers(map(c => c.Type, this.children), map(c => c.Type, tree.children))) {
      return false;
    }

    return true;
  }

  /**
   * Wrap middleware over this tree's middlware and return a new tree.
   * @param {*} fn 
   */
  use(fn) {
    let assigned = this.assign({
      data: { middleware: fn(this.data.middleware) }
    });
    return map(tree => tree, assigned);
  }

  assign(attrs) {
    let tree = this;

    let { data, meta } = attrs;

    return this.derive(function deriveCallbackInAssign(instance) {
      // instance here is only to be used as a reference
      // do not read properties off this instance

      if (data && data.hasOwnProperty('value')) {
        let { value, state = stateFromTree } = data;
        let valueFn = typeof value === 'function' ? () => value(instance) : value;
        data = assign({}, data, {
          value: new Value(valueFn),
          state: new State(instance, state)
        });

        if (!meta || meta && !meta.hasOwnProperty('children')) {
          meta = assign({}, meta, {
            children() {
              let newValueTree = new Tree({ Type: tree.Type, value: valueFn });
              return map((childTree) => {
                return map(child => {
                  let existing = tree.treeAt(child.path);
                  if (existing && existing.isEqual(child)) {
                    return existing;
                  } else {
                    return child;
                  }
                }, childTree);
              }, newValueTree.children);
            }
          });
        }
      }

      if (meta && meta.hasOwnProperty('children')) {
        meta = assign({}, meta, {
          children: new Children(instance, meta.children)
        });
      }

      if (meta && meta.hasOwnProperty('root') && typeof meta.root === 'function') {
        meta = assign({}, meta, {
          root: meta.root(instance)
        });
      }

      return {
        meta: meta ? assign({}, tree.meta, meta) : tree.meta,
        data: data && data !== tree.data ? assign({}, tree.data, data) : tree.data
      }
    });
  }

  derive(fn) {
    let thunked = thunk(instance => fn(instance));

    return Object.create(Tree.prototype, {
      meta: {
        enumerable: true,
        configurable: true,
        get() {
          return thunked(this).meta;
        }
      },
      data: {
        enumerable: true,
        configurable: true,
        get() {
          return thunked(this).data;
        }
      }
    });
  }

  /**
   * Returns a new root tree with after applying the function argument to the current tree.
   * Apply will backup the middleware on this tree to ensure that context specific middleware
   * is not applied when the tree is pruned.
   */
  apply(fn) {
    // overload custom middleware to allow context free transitions
    let root = this.root.assign({ data: { middleware: defaultMiddleware } });
    // focus on current tree and apply the function to it
    let nextRoot = over(this.lens, fn, root);
    // put the original middleware into the next root tree so the middleware will    
    let withMiddlware = nextRoot.assign({ data: { middleware: this.root.data.middleware } });
    // ensure that the tree has correct root
    return map(tree => tree, withMiddlware);
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
      return foldr(({ tree, parentPath }, name) => {
        let parent = root.treeAt(parentPath);
        return {
          parentPath: parentPath.slice(0, -1),
          tree: parent.assign({
            meta: {
              children() {
                return map((child, key) => key === name ? tree : child, parent.children);
              }
            },
            data: {
              value() {
                return view(lensPath(parentPath), nextValue);
              }
            }
          })
        }
      }, bottom, this.path).tree;
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
    return map(tree => tree.assign({
      meta: {
        path: tree.path.slice(this.path.length)
      }
    }), this);
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
      return map(tree => tree.assign({
        meta: { 
          path: [...path, ...tree.path], 
          root 
        }
      }), this);
    }
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
  constructor(tree, resolveState) {
    this.tree = tree;
    this.resolveState = resolveState;
  }

  @stable
  get value() {
    return this.resolveState(this.tree);
  }
}

class Children {
  constructor(tree, resolveChildren) {
    this.tree = tree;
    this.resolveChildren = resolveChildren;
  }
  
  @stable
  get value() {
    return this.resolveChildren(this.tree);
  } 
}

function stateFromTree(tree) {
  let { meta: { StabilizedClass } } = tree;

    if (tree.isSimple || tree.value === undefined) {
      return tree.value;
    } else {
      if (Array.isArray(tree.children)) {
        return map(child => child.state, tree.children);
      } else {
        return append(new StabilizedClass(tree.value), map(child => child.state, tree.children));
      }
    }
}

/**
 * When a microstate is created with create(Object) or create(Array) value is undefined. 
 * We need a default value so the map will know which functor to use. Ideally, we
 * would allow `initialize` to provide a default value but this is not possible currently
 * because children are used to create a microstate which is used to create initialize.
 */
function ensureDefault(Type, value) {
  if (value === undefined) {
    if (Type === types.Object || Type.prototype instanceof types.Object) {
      return {};
    }
    if (Type === types.Array || Type.prototype instanceof types.Array) {
      return [];
    }
  }
  return value;
}

function childrenFromTree({ Type, value, path, root }) {
  let childTypes = childTypesAt(Type, value);

  return map((ChildType, childPath) => new Tree({
    Type: ChildType,
    value: () => value && value[childPath] ? value[childPath] : undefined,
    path: append(path, childPath),
    root
  }), childTypes);
}

function childTypesAt(Type, value) {
  if (Type === types.Object || Type.prototype instanceof types.Object || Type === types.Array || Type.prototype instanceof types.Array) {
    let { T } = params(Type);
    return map(() => T, ensureDefault(Type, value));
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
      // TODO: make this a thunk
      return fn(tree).assign({
        meta: {
          Type: tree.Type,
          root(instance) { 
            return root || instance 
          },
          children(instance) {
            return map(child => remap(fn, child, root || instance), tree.children);
          }
        }
      });
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
    return new Tree({ value, Type: types.Any });
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
    function reflatmap(fn, tree, root) {
      return tree.derive(function deriveInMonad(instance) {
        let mapped = fn(tree);

        return mapped.assign({
          meta: { 
            root: root || instance,
            children() {
              return map(child => {
                return reflatmap(tree => {
                  return fn(tree.prune()).graft(tree.path, root || instance);
                }, child, root || instance);
              }, mapped.children);
            }
          },
          data: {
              value() {
                let { value } = mapped;
                if (instance.hasChildren && value !== undefined) {
                  if (Array.isArray(instance.children)) {
                    return map(child => child.value, instance.children);
                  } else {
                    return keys(instance.children).reduce((value, key) => {
                      let oldValue = tree.children[key] && tree.children[key].value;
                      let newValue = instance.children[key].value;
                      if (oldValue === newValue) {
                        return value;
                      } else {
                        return lset(lensPath([key]), newValue, value);
                      }
                    }, value);
                  }
                }
                return value;
              },
              state(instance) {
                if (instance.isEqual(tree)) {
                  return tree.state;
                } else {
                  return stateFromTree(instance);
                }
              }
            }
        });
      });
    }

    return reflatmap(fn, tree);
  }
});