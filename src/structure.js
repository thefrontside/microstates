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
    rootValue: { value },
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
  return map(node => Object.create(node, {
    state: {
      get() {
        let { Type, value } = node;
        // also don't know if this is the way to calculate state.
        if (isPrimitive(Type)) {
          return value;
        } else {
          // TODO:
          // reconsider scenario where user returned a POJO from constructor
          // decide if we want to merge POJOs into instantiated object
          // Case:
          //   1. No constructor specified
          //   2. Returning an instance of original specified type
          //   3. Returning a new type
          //   4. Return a POJO and merging in
          let instance = new Type(value).valueOf();
          let descriptors = append(getOwnPropertyDescriptors(value), getOwnPropertyDescriptors(instance));
          return Object.create(Type.prototype, descriptors);
        }
      }
    }
  }), values);
}

function analyzeTransitions(states) {
  let { data: { value: rootValue, Type: rootType } } = states;
  return map(node => Object.create(node, {
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
          
          let nextLocalType, nextLocalValue;
          if (transitionResult instanceof Microstate) {
            nextLocalValue = transitionResult.valueOf();
            nextLocalType = reveal(transitionResult).data.Type;
          } else {
            nextLocalValue = transitionResult;
            nextLocalType = Type;
          }


          let nextRootValue = set(lensPath(path), nextLocalValue, rootValue);
          
          let nextTree = analyze(rootType, nextRootValue);
          return nextTree;
        }, transitionsFor(node.Type));
      }
    }
  }), states);
}
