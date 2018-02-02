import compose from 'ramda/src/compose';
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

//
// {
//   path: p,
//   Type: x,
//   value: v,
//   sate: s,
//   transitions: t[]
// }

export default function analyze(Type, value, path = []) {
  let types = analyzeType(Type);
  let values = analyzeValues(types, value);
  let states = analyzeStates(values);
  let transitions = analyzeTransitions(states);
  return transitions;
}

function analyzeType(Type, path = []) {
  return new Tree({
    data() {
      return { Type, path };
    },
    children() {
      return $(new Type())
        .filter(({ value }) => !!value && value.call)
        .map((ChildType, key) => analyzeType(ChildType, append(path, key)))
        .valueOf();
    }
  });
}

function analyzeValues(typeTree, value) {
  return map(node => Object.create(node, {
    rootValue: { 
      value, 
      enumerable: true 
    },
    value: {
      get() {
        let { path } = node;
        return view(lensPath(path), this.rootValue);
      },
      enumerable: true
    }
  }), typeTree);
}

function analyzeStates(values) {
  let statesTree = map(node => {
    let newNode = Object.create(node, {
      initialized: {
        get() {
          let { Type, value } = node;
          return new Type(value).valueOf();
        }
      },
      template: {
        get() {
          let { Type, value } = node;
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
          let descriptors = getOwnPropertyDescriptors(newNode.initialized);
          if (value) {
            descriptors = append(getOwnPropertyDescriptors(value), descriptors)
          }
          return Object.create(Type.prototype, descriptors);
        }
      },
      state: {
        get() {
          let { Type, path } = node;
          if (isPrimitive(Type)) {
            return newNode.initialized;
          } else {
            // we only want to map the children here not the node itself, so we take the children
            // off the statesTree
            let children = map(({ data: { state }}) => state, view(lensTree(path), statesTree).children);
            return append(newNode.template, children);
          }
        }
      },
    })
    return newNode;
  }, values);
  return statesTree;
}

function analyzeTransitions(states) {
  let { data: { rootValue, Type: rootType } } = states;
  let withTransitions = map(node => Object.create(node, {
    transitions: {
      get() {
        return map(method => (...args) => {
          let { Type, path, state } = node;
          /**
           * Create context for the transition. This context is a microstate
           * constructor that takes Type and value. If the user did not provide
           * a new type or value, the constructor will default to Type and value
           * of the current node.
           **/
          let context = (_Type = Type, value = node.value) => construct(_Type, value);

          let transitionResult = method.apply(context, [state, ...args]);

          if (transitionResult instanceof Microstate) {
            // 1. get next local value
            let nextLocalValue = transitionResult.valueOf();
            // 2. get next local type
            let nextLocalType = reveal(transitionResult).data.Type;
            if (nextLocalType === Type) {
              // custom transition
              // 3. get next local tree by analyzing next local type and value
              let nextLocalTree = analyze(nextLocalType, nextLocalValue, path);
              // 4. get next root value by lensing the next local value into the current root value
              let nextRootValue = set(lensPath(path), nextLocalValue, rootValue);
              // 5. get the next root tree by mapping the new root value onto the current root tree.
              let nextRootTree = map(node => Object.create(node, { 
                rootValue: { 
                  value: nextRootValue, 
                  enumerable: false 
                }
              }), withTransitions);
              // 6. lens in the next local tree to the root tree for the resulting tree.
              return set(lensTree(path), nextLocalTree, nextRootTree);
            } else {
              // type-shift here
            }
          } else {
            // 1. get next local value
            let nextLocalValue = transitionResult;
            // 2. get next local type
            let nextLocalType = Type;
            // 3. get next local tree by analyzing next local type and value
            let nextLocalTree = analyze(nextLocalType, nextLocalValue, path);
            // 4. get next root value by lensing the next local value into the current root value
            let nextRootValue = set(lensPath(path), nextLocalValue, rootValue);
            // 5. get the next root tree by mapping the new root value onto the current root tree.
            let nextRootTree = map(node => Object.create(node, { 
              rootValue: { 
                value: nextRootValue, 
                enumerable: false 
              }
            }), withTransitions);
            // 6. lens in the next local tree to the root tree for the resulting tree.
            return set(lensTree(path), nextLocalTree, nextRootTree);
          }
          // 7. :margarita:
        }, transitionsFor(node.Type));
      }
    }
  }), states);
  return withTransitions;
}
