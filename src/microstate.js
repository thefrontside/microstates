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
  return new Microstate(tree);
}

function collapse(fn, tree) {
  return map(fn, tree).collapsed;
}

function transitions(tree) {
  return collapse(({ transitions }) => {
    return map(transition => {
      return (...args) => {
        let structure = transition(...args);
        return new Microstate(structure);
      };
    }, transitions);
  }, tree);
}

export class Microstate {
  constructor(tree) {
    keep(this, tree);
    return assign(this, transitions(tree));
  }
  /**
   * Evaluates to state for this microstate.
   */
  get state() {
    let tree = reveal(this);
    return collapse(({ state }) => state, tree);
  }

  set state(value) {
    let message = reveal(this).data.transitions.state
      ? `You can not use 'state' as transition name because it'll conflict with state property on the microstate.`
      : `Setting state property will not do anything useful. Please don't do this.`;
    throw Error(message);
  }

  /**
   * Return boxed in value for this microstates
   */
  valueOf() {
    return reveal(this).data.value;
  }
}
