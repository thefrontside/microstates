import { map } from 'funcadelic';
import analyze from './structure';
import initialize from './utils/initialize';
import { keep, reveal } from './utils/secret';

const { assign } = Object;

/**
 * Returns a new Microstate instance. A microstate is an object that
 * wraps a type and a value and provides chainable transitions for
 * this value.
 *
 * @param {*} Type
 * @param {*} value
 */
export default function microstate(Type, value) {
  let tree = analyze(Type, value);
  return new Microstate(tree, value);
}

function collapse(fn, tree) {
  return map(fn, tree).collapsed;
}

function transitions(value, tree, invoke) {
  return collapse(node => {
    let transitions = node.transitionsAt(value, tree, invoke);
    return map(transition => {
      return (...args) => {
        let { tree, value } = transition(...args);
        return new Microstate(tree, value);
      }
    }, transitions) 
  }, tree);
}

function invoke({ Type, method, args, value, tree, state}) {
  let next = method.apply(null, [state, ...args]);
  return { Type, value: next };
}

export class Microstate {
  constructor(tree, value) {
    keep(this, { tree, value });
    return assign(this, transitions(value, tree, invoke));
  }
  
  /**
   * Evaluates to state for this microstate.
   */
  get state() {
    let { tree, value } = reveal(this);
    return collapse(node => {
      return node.stateAt(value);
    }, tree);
  }

  set state(value) {
    let { tree } = reveal(this);
    let message = tree.data.transitions.state
      ? `You can not use 'state' as transition name because it'll conflict with state property on the microstate.`
      : `Setting state property will not do anything useful. Please don't do this.`;
    throw Error(message);
  }

  /**
   * Return boxed in value for this microstates
   */
  valueOf() {
    let { value } = reveal(this);
    return value;
  }
}
