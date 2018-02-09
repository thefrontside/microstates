import { map } from 'funcadelic';
import analyze from './structure';
import { keep, reveal } from './utils/secret';

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
    if (tree.data.isSimple) {
      return value || new tree.data.Type(value).valueOf();
    }
    return map(node => {
      return node.stateAt(value);
    }, tree).collapsed;
  }

  /**
   * Return boxed in value for this microstates
   */
  valueOf() {
    let { value } = reveal(this);
    return value;
  }
}
