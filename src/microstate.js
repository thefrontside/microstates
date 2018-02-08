import { map } from 'funcadelic';
import analyze from './structure';
import { keep, reveal } from './utils/secret';

const { assign } = Object;

export default class Microstate {
  constructor(tree, value) {
    keep(this, { tree, value });
    return assign(this, transitions(value, tree));
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
    return state(value, tree);
  }

  set state(value) {
    let message = typeof value === 'function'
      ? `You can not use 'state' as transition name because it'll conflict with state property on the microstate.`
      : `Setting state property will not do anything useful. Please don't do this.`;
    throw new Error(message);
  }

  /**
   * Return boxed in value for this microstates
   */
  valueOf() {
    let { value } = reveal(this);
    return value;
  }
}

function collapse(fn, tree) {
  return map(fn, tree).collapsed;
}

function transitions(value, tree) {
  return collapse(node => {
    let transitions = node.transitionsAt(value, tree, invoke);
    return map(transition => {
      return (...args) => {
        let { tree, value } = transition(...args);
        return new Microstate(tree, value);
      };
    }, transitions);
  }, tree);
}

function state(value, tree) {
  return collapse(node => {
    return node.stateAt(value);
  }, tree);
}

function invoke({ method, args, value, tree}) {

  let nextValue = method.apply(new Microstate(tree, value), [state(value, tree), ...args]);

  if (nextValue instanceof Microstate) {
    return reveal(nextValue);
  } else {
    return { tree, value: nextValue };
  }
}