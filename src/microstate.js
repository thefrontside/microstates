import { append } from 'funcadelic';

import state from './utils/state';
import { keep, reveal } from './utils/secret';

/**
 * Returns a new Microstate instance. A microstate is an object that
 * wraps a type and a value and provides chainable transitions for
 * this value.
 *
 * @param {*} Type
 * @param {*} value
 */
export default function microstate(Type, value) {
  return new Microstate(Type, value);
}

export class Microstate {
  constructor(Type, value) {
    let ms = state(Type, value);
    let transitions = append(this, ms.transitions.collapsed);
    return keep(transitions, ms);
  }
  /**
   * Evaluates to state for this microstate.
   */
  get state() {
    return reveal(this).state.collapsed;
  }
  /**
   * Return boxed in value for this microstates
   */
  valueOf() {
    return reveal(this).value;
  }
}
