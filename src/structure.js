import $ from './utils/chain';
import { type, map, append, pure, flatMap } from 'funcadelic';
import { view, set, over, lensTree, lensPath, lensTreeValue } from './lens';
import Tree, { prune } from './utils/tree';
import transitionsFor from './utils/transitions-for';
import { reveal } from './utils/secret';
import types, { params, any, toType } from './types';
import isSimple  from './is-simple';
import desugar from './desugar';
import thunk from './thunk';
import Microstate from './microstate';
import { collapse } from './typeclasses/collapse';
import logTree from './utils/log-tree';
import { stateAt, childrenAt } from './typeclasses/location';


const { assign } = Object;

export default function analyze(Type, rootValue) {
  let value = rootValue != null ? rootValue.valueOf() : rootValue;
  let tree = pure(Tree, new Node({ Type, path: [], root: rootValue}));

  return flatMap((node) => {
    let { Type, value } = node;

    return new Tree({
      data: () => node,
      children() {
        let childTypes = childrenAt(Type, value);
        return map((ChildType, path) => pure(Tree, node.createChild(ChildType, path)), childTypes);
      }
    });
  }, tree);
}


class Node {
  constructor({path, root, Type: InitialType }) {
    this.InitialType = InitialType;

    Object.defineProperty(this, 'value', {
      enumerable: true,
      get: thunk(() => view(lensPath(path), root))
    });

  }
  get Type() {
    return toType(desugar(this.InitialType));
  }

  get isSimple() {
    return isSimple(this.Type);
  }

  get state() {
    let { Type } = this;
    let valueAt = this.value;
    let instance = new Type(valueAt).valueOf();
    if (isSimple(Type)) {
      return valueAt || instance;
    } else {
      return stateAt(Type, instance, valueAt);
    }
  }

  get transitions() {
    let { Type, path } = this;

    return $(transitionsFor(Type))
      .map(method => {
        return (tree) => {
          return (...args) => {
            return over(lensTreeValue(path), (tree) => {
              return reveal(method.apply(new Microstate(prune(tree)), args));
            });
          };
        };
      }).valueOf();
  }

  createChild(Type, name) {
    return new Node({path: append(this.path, name), Type, root: this.root});
  }

  replaceValue(key, childValue) {
    let { Type, path } = this;
    return append(this, {
      get value() {
        return set(lensPath([key]), childValue, this.value);
      }
    });
  }
}
