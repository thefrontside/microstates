import { append, flatMap, foldl, foldr, map, stable } from 'funcadelic';
import getPrototypeDescriptors from 'get-prototype-descriptors';
import lens from 'ramda/es/lens';
import lensPath from 'ramda/es/lensPath';
import over from 'ramda/es/over';
import lset from 'ramda/es/set';
import view from 'ramda/es/view';
import SymbolObservable from "symbol-observable";
import desugar from './desugar';
import isSimple from './is-simple';
import keys from './keys';
import shallowDiffers from './shallow-differs';
import thunk from './thunk';
import types, { params, toType } from './types';
import $ from './utils/chain';
import { keep, reveal } from './utils/secret';
import values from './values';
import invariant from 'invariant';

const { assign, defineProperties } = Object;

/**
 * Apply a transition to a microstate and return the next
 * microstate.
 * @param {Microstate} localMicrostate
 * @param {Function} transition
 * @param {Array<any>} args
 */
const defaultMiddleware = (localMicrostate, transition, args) => {
  let { lens, root } = reveal(localMicrostate);

  let applyTransition = focus => {
    let next = transition.apply(focus.microstate, args);
    if (next instanceof Microstate) {
      return reveal(next);
    } else {
      return focus.assign({ data: { value: next }});
    }
  };

  // transition is applied to the end of the path
  // it returns the next tree which is returned
  let nextTree = over(lens, applyTransition, root);

  // map tree to make sure that it gets the root applied
  return map(tree => tree, nextTree).microstate;
};

function makeMiddleware(tree) {
  let { root, path } = tree;

  // transition that the user is invoking
  let { middlewares } = foldl((acc, childName) => {
    let tree = acc.tree.children[childName];
    let middleware = tree.data.middleware.map(fn => next => fn(next, tree));
    return {
      middlewares: [...acc.middlewares, ...middleware],
      tree
    }
  }, { tree: root, middlewares: [ ...root.data.middleware ] }, path);

  return middlewares
    .reduce((fn, middleware) => middleware(fn), defaultMiddleware);
}

function setupTransition(transition, name) {
  let middleware = makeMiddleware(reveal(this));
  let bound = (...args) => middleware(this, transition, args);

  Object.defineProperty(bound, 'name', {
    value: name,
    configurable: true,
    enumerable: false
  });

  return bound;
}

function setupQuery(query, name) {
  /**
   * Create a copy of the tree and store a reference to the original tree objects
   * in the meta property. Also, remove any middleware from the root node because
   * we don't want transitions inside of the query to emit any side effects.
   */
  let context = map(tree => {
    return tree.assign({
      meta: { origin: tree },
      data: { middleware: tree.isRoot ? [] : tree.data.middleware }
    })
  }, Tree.from(this));

  // invoke the query to compute the derived microstate
  let queried = query.call(context.microstate);
  
  invariant(queried instanceof Microstate, `Microstate queries must return microstates. Query called ${name} returned ${queried}`)
  
  let queriedTree = Tree.from(queried);
  
  /**
   * This middleware redirects the transition to the original microstate
   */
  let middleware = next => {
    return (microstate, transition, args) => {
      let { path, meta: { origin } } = Tree.from(microstate);
      invariant(origin, `Could not find an microstate at [${path.join(',')}]. You might have tried to modify a microstate that does not exist in original microstate.`)
      return makeMiddleware(origin)(origin.microstate, transition, args);
    }
  }

  /**
   * Put the middleware into the queried tree to allow redirecting transitions to the original microstate
   */
  let withMiddleware = map(tree => { 
    if (tree.isRoot) {
      return tree.assign({
        data: {
          middleware: [middleware]
        }
      })
    } else {
      return tree; 
    }
  }, queriedTree.root);

  // return the same part of the microstate that was returned by the query
  return withMiddleware.treeAt(queriedTree.path).microstate;
}

export const transitionsClass = stable(function transitionsClass(Type) {
  class Transitions extends Microstate {
    static get name() {
      return `Transitions<${Type.name}>`;
    }
  }

  let descriptors = Type === types.Any ? getPrototypeDescriptors(types.Any) : assign(getPrototypeDescriptors(resolveType(Type)), getPrototypeDescriptors(types.Any))

  let transitions = $(descriptors)
    .filter(({ key, value }) => (typeof value.value === 'function' || typeof value.get === 'function') && key !== 'constructor')
    .map((descriptor, key) => ({
      enumerable: false,
      configurable: true,
      get() { return descriptor.get ? 
        setupQuery.call(this, descriptor.get, key) : 
        setupTransition.call(this, descriptor.value, key) }
    }))
    .valueOf();

  defineProperties(Transitions.prototype, transitions);

  return Transitions;
});

export const resolveType = stable(function resolveType(Type) {
  return toType(desugar(Type));
});

export class Microstate {

  constructor(tree) {
    keep(this, tree);

    return append(this, map(child => child.microstate, tree.children));
  }

  static map(fn, microstate) {
    return map(tree => fn(tree.microstate), reveal(microstate).children);
  }

  static use(middleware, microstate) {
    return map(tree => tree.use(middleware), microstate);
  }

  static from(value) {
    return flatMap(tree => tree.assign({
      meta: {
        children() {
          return map((child, key) => {
            if (child.value instanceof Microstate) {
              return reveal(child.value).graft([key]);
            } else {
              return child;
            }
          }, tree.children);
        }
      }
    }), Tree.from(value)).microstate
  }

  static create(Type, value) {
    value = value ? value.valueOf() : value;
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

  [SymbolObservable]() { return this['@@observable'](); }
  ['@@observable']() {
    let microstate = this;
    return {
      subscribe(observer) {
        let next = observer.call ? observer : observer.next.bind(observer);

        let mapped = Microstate.use(middleware => (...args) => {
          let microstate = middleware(...args);
          next(microstate);
          return microstate;
        }, microstate);

        next(mapped);
      },
      [SymbolObservable]() {
        return this;
      }
    };
  }
}

export default class Tree {

  static from(value, T = types.Any) {
    if (value && value instanceof Microstate) {
      return reveal(value);
    } else if (value != null) {
      return new Tree({ value, Type: T === types.Any ? value.constructor : T});
    } else {
      return new Tree({ value });
    }
  }

  // value can be either a function or a value.
  constructor({ Type = types.Any, value, path = [], root = this }) {
    this.meta = {
      InitialType: Type,
      Type: resolveType(Type),
      path,
      root,
      TransitionsClass: transitionsClass(Type),
      children: new Children(this, childrenFromTree),
    }

    this.data = {
      value: new Value(value),
      state: new State(this, stateFromTree),
      middleware: []
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
    return isSimple(this.Type) && !values(this.children).some(tree => tree.isSimple);
  }

  get isRoot() {
    return this.root === this;
  }

  get hasChildren() {
    return keys(this.children).length > 0
  }

  get microstate() {
    let { meta: { TransitionsClass } } = this;
    return new TransitionsClass(this);
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
  use(middleware) {
    return map(tree => {
      if (tree.is(this)) {
        return tree.assign({
          data: { middleware: [...tree.data.middleware, middleware] },
        });
      } else {
        return tree;
      }
    }, this);
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
   * Evaluates to a lens that can be used with ramda lenses to view/set/over value
   * of other trees. Think about this as a branch that you overlap on another tree,
   * the place where the branch ends is the focus point.
   */
  get lens() {
    let get = tree => {
      let found = tree.treeAt(this.path);
      invariant(found instanceof Tree, `Tree at path [${this.path.join(', ')}] does not exist. Is path wrong?`);
      return found.prune();
    }

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

class CachedValue {
  constructor(tree, resolve) {
    this.cached = thunk(() => resolve(tree));
  }

  get value() {
    return this.cached();
  }
}

class Value extends CachedValue {
  constructor(valueOrFn) {
    let resolve = typeof valueOrFn === 'function' ? valueOrFn : () => valueOrFn;
    super(null, resolve);
  }
}

class State extends CachedValue {}
class Children extends CachedValue {}

export function stateFromTree(tree) {
  let { meta: { Type } } = tree;

    if (tree.isSimple || tree.value === undefined) {
      return tree.value;
    } else {
      if (Array.isArray(tree.children)) {
        return map(child => child.state, tree.children);
      } else {
        return append(new Type(tree.value), map(child => child.state, tree.children));
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
    return map(({ constructor } = { constructor: types.Any }) => T === types.Any ? constructor : T, ensureDefault(Type, value));
  }
  return $(new Type())
    .map(desugar)
    .filter(({ value }) => !!value && value.call)
    .valueOf();
}
