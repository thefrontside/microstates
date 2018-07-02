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

const { assign, defineProperties, defineProperty } = Object;

/**
 * Apply a transition to a microstate and return the next
 * microstate.
 * @param {Microstate} microstate
 * @param {Function} transition
 * @param {Array<any>} args
 */
const defaultMiddleware = (microstate, transition, args) => {
  let target = Tree.from(microstate);

  let next = target.over(focus => {
    let next = transition.apply(focus.microstate, args);    
    if (next instanceof Microstate) {
      return Tree.from(next);
    } else {
      return focus.assign({ data: { value: next }});
    }
  });
  
  return map(tree => {
    if (target.root.meta.middleware.length > 0 && tree === next) {
      return tree.assign({
        meta: {
          middleware: target.root.meta.middleware
        }
      });
    } else {
      return tree;
    }
  }, next).microstate;  
};

function makeMiddleware(tree) {
  let { root, path } = tree;

  // transition that the user is invoking
  let { middlewares } = foldl((acc, childName) => {
    let tree = acc.tree.children[childName];
    invariant(tree, `Could not find a ${childName} in [${path.join()}]`);
    let middleware = tree.meta.middleware.map(fn => next => fn(next, tree));
    return {
      middlewares: [...acc.middlewares, ...middleware],
      tree
    }
  }, { tree: root, middlewares: root.meta.middleware }, path);

  return middlewares
    .reduce((fn, middleware) => middleware(fn), defaultMiddleware);
}

export const transitionsClass = stable(function transitionsClass(Type) {

  let descriptors = Type === types.Any ? getPrototypeDescriptors(types.Any) : assign(getPrototypeDescriptors(resolveType(Type)), getPrototypeDescriptors(types.Any))

  let queries = $(descriptors)
    .filter(({ value: { get } }) => get)
    .map(({ get }) => get)
    .valueOf();
    
  let transitions = $(descriptors)
    .filter(({ key, value: { value } }) => typeof value === 'function' && key !== 'constructor')
    .map(({ value }) => value)
    .valueOf(); 
    
  class Transitions extends Microstate {
    static get name() {
      return `Transitions<${Type.name}>`;
    }

    static get queries() {
      return queries;
    }

    static get transitions() {
      return transitions;
    }
  }

  defineProperties(Transitions.prototype, map((query, name) => ({
    enumerable: false,
    configurable: true,
    get() {
      let { queries } = Tree.from(this);
  
      // invoke the query to compute the derived microstate
      let queriedTree = Tree.from(queries[name]);
    
      /**
       * This middleware redirects the transition to the original microstate
       */
      let middleware = next => {
        return (microstate, transition, args) => {
          let { path, meta: { origin } } = Tree.from(microstate);
          invariant(origin, `Could not find an microstate at [${path.join(',')}]. You might have tried to modify a microstate that does not exist in original microstate.`);
          return makeMiddleware(origin)(origin.microstate, transition, args);
        };
      }
    
      /**
       * Put the middleware into the queried tree to allow redirecting transitions to the original microstate
       */
      let withMiddleware = map(tree => { 
        if (tree.isRoot) {
          return tree.assign({
            meta: {
              middleware: [middleware]
            }
          })
        } else {
          return tree; 
        }
      }, queriedTree.root);
    
      // return the same part of the microstate that was returned by the query
      let value = withMiddleware.treeAt(queriedTree.path).microstate;

      // once the property is computed, 
      // replace the getter with the value to prevent getter from re-evaluating.
      defineProperty(this, name, {
        enumerable: false,
        configurable: true,
        value
      });

      return value;
    }
  }), queries));

  defineProperties(Transitions.prototype, map((transition, name) => ({
    enumerable: false,
    configurable: true,
    get() {
      let tree = Tree.from(this);
      let applyMiddleware = makeMiddleware(tree);

      let bound = (...args) => applyMiddleware(this, transition, args);
    
      Object.defineProperty(bound, 'name', {
        value: name,
        configurable: true,
        enumerable: false
      });
    
      return bound;
    }
  }), transitions));

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

  /**
   * # Middleware
   * 
   * Middleware makes it possible to modify what occurs before a transition is 
   * performed and what is ultimately returned by a transition. You can use it 
   * to change the outcome of a transition or emit side effects.
   * 
   * Installation of a middleware is done in an immutable fashion as with all 
   * other operations in Microstates. To install a middleware, you must map a 
   * microstate to create a new microstate that uses the given middleware.
   * Let's create logging middleware that will log every transition:
   * 
   * ```js
   * import { create, map } from "microstates";
   * 
   * class Person {
   *   firstName = String;
   *   lastName = String;
   * }
   * 
   * let homer = create(Person, { firstName: "Homer", lastName: "Simpson" });
   * 
   * function loggingMiddleware(next) {
   *   return (microstate, transition, args) => {
   *     console.log(`before ${transition.name} value is`, microstate.valueOf());
   *     let result = next(microstate, transition, args);
   *     console.log(`after ${transition.name} value is`, result.valueOf());
   *     return result;
   *   };
   * }
   * let homerWithMiddleware = use(loggingMiddleware, homer)
   * ```
   * 
   * The middleware will be invoked on any transition that you call on this Microstate. 
   * The middleware will be carried over on every consequent transition as it is now part 
   * of the Microstate. We use this mechanism to create Observable Microstates.
   * 
   * @param {*} middleware 
   * @param {*} microstate 
   */
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
          return Tree.from(initialized);
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
        let stream = observer.call ? observer : observer.next.bind(observer);

        let notifyObserver = next => (...args) => {
          let microstate = next(...args);
          stream(microstate);
          return microstate;
        };

        let installed = Microstate.use(notifyObserver, microstate);

        stream(installed);
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
      queries: new CachedValue(this, queriesForTree),
      children: new Children(this, childrenFromTree),
      middleware: []
    }

    this.data = {
      value: new Value(value),
      state: new State(this, stateFromTree)
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
    return isSimple(this.Type) && values(this.children).every(tree => tree.isSimple);
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

  get queries() {
    return this.meta.queries.value;
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
      if (tree.isRoot) {
        return tree.assign({
          meta: { middleware: [...tree.meta.middleware, middleware] },
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

      if (meta && (meta.hasOwnProperty('root') || meta.hasOwnProperty('children')) || data && data.hasOwnProperty('value')) {
        meta = assign({}, meta, {
          queries: new CachedValue(instance, queriesForTree)
        });
      }

      return {
        meta: meta ? assign({}, tree.meta, meta) : tree.meta,
        data: data && data !== tree.data ? assign({}, tree.data, data) : tree.data
      }
    });
  }

  over(fn) {
    return over(this.lens, fn, this.root);
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
      let top = foldr(({ tree, parentPath }, name) => {
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

      return top;
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
        path: tree.path.slice(this.path.length),
        middleware: []
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
  let { meta: { Type, TransitionsClass } } = tree;

  if (tree.isSimple || tree.value === undefined) {
    return tree.value;
  } else {
    if (Array.isArray(tree.children)) {
      return map(child => child.state, tree.children);
    } else {
      let queries = map((query, key) => tree.microstate[key], TransitionsClass.queries);
      let properties = map(({ state }) => state, append(queries, tree.children));
      return append(Object.create(Type.prototype), properties);
    }
  }
}

export function queriesForTree(tree) {
  let { meta: { TransitionsClass} } = tree; 

  /**
   * Create a copy of the tree and store a reference to the original tree objects
   * in the meta property. Also, remove any middleware from the root node because
   * we don't want transitions inside of the query to emit any side effects.
   */
  let context = map(tree => {
    return tree.assign({
      meta: { 
        origin: tree,  
        middleware: [] 
      }
    })
  }, tree).prune();

  return map(query => {
    return Tree.from(query.call(context.microstate)).microstate;
  }, TransitionsClass.queries);
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
