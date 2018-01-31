import compose from 'ramda/src/compose';
import $ from './utils/chain';
import { map, append } from 'funcadelic';
import { view, set, lensTree, lensPath, lensIndex } from './lens';
import Tree from './utils/tree';
import isPrimitive from './utils/is-primitive';
import initialize from './utils/initialize';
import transitionsFor from './utils/transitions-for';
import getOwnPropertyDescriptors from 'object.getownpropertydescriptors';

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
    value: {
      get: () => {
        let { Type, path } = node;
        var nodeValue = view(lensPath(path), value);

        // init crap of which I am totally unsure.
        let instance = new Type(nodeValue).valueOf();
        if (isPrimitive(Type)) {
          return instance;
        } else {
          return nodeValue;
        }
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
          return Object.create(Type.prototype, getOwnPropertyDescriptors(value));
        }
      }
    }
  }), values);
}

function analyzeTransitions(states) {
  let { data: { value, Type: RootType } } = states;
  return map(node => Object.create(node, {
    transitions: {
      get() {
        return map(method => (...args) => {
          let { Type, path, state } = node;
          let nextLocalValue = method.apply(null, [node.value, ...args]);
          let nextLocalType = Type;
          let nextRootType = RootType;
          let nextRootValue = set(lensPath(path), nextLocalValue, value);

          let nextTree = analyze(RootType, nextRootValue);
          return nextTree;
        }, transitionsFor(node.Type));
      }
    }
  }), states);
}
