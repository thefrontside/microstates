import { map, pure } from 'funcadelic';
import analyze, { analyzeType, Node, isa } from './structure';
import types from './types';
import { keep, reveal } from './utils/secret';
import { flatMap } from './monad';
import Tree from './utils/tree';
import $ from './utils/chain';

const { assign } = Object;

export default class Microstate {
  constructor(tree, value) {
    keep(this, { tree, value });
    return map(transition => transition, this);
  }

  /**
   * Returns a new Microstate instance. A microstate is an object that
   * wraps a type and a value and provides chainable transitions for
   * this value.
   *
   * @param {*} Type
   * @param {*} value
   */
  static create(Type, value) {
    let tree = analyze(Type, value);
    return new Microstate(tree, value);
  }

  /**
   * Evaluates to state for this microstate.
   */
  get state() {
    let { tree, value } = reveal(this);

    return new $(tree)
      .flatMap(node => {
        if (node.isSimple) {
          if (isa(node.Type, types.Array)) {
            return analyzeType(value)(new Node(types.Array, node.path))
          }
          if (isa(node.Type, types.Object)) {
            return analyzeType(value)(new Node(types.Object, node.path));
          }
        }
        return analyzeType(value)(node);
      })
    .map(node => {
      if (node.isSimple) {
        return node.valueAt(value) || new node.Type(node.valueAt(value)).valueOf();
      } else {
        return node.stateAt(value);
      }
    }).valueOf().collapsed;
  }

  /**
   * Return boxed in value for this microstates
   */
  valueOf() {
    let { value } = reveal(this);
    return value;
  }
}
