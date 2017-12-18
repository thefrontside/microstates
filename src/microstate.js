import state from './utils/state';
import { keep, reveal } from './utils/secret';
import { Functor, map } from 'funcadelic';

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
  return new Microstate(Type, value);
}

export class Microstate {
  constructor(Type, value) {
    let ms = state(Type, value);
    keep(this, ms);
    return assign(this, ms.transitions.collapsed);
  }
  /**
   * Evaluates to state for this microstate.
   */
  get state() {
    return reveal(this).state.collapsed;
  }

  set state(value) {
    let message = reveal(this).transitions.collapsed.state
      ? `You can not use 'state' as transition name because it'll conflict with state property on the microstate.`
      : `Setting state property will not do anything useful. Please don't do this.`;
    throw Error(message);
  }

  /**
   * Return boxed in value for this microstates
   */
  valueOf() {
    return reveal(this).value;
  }
}

Functor.instance(Microstate, {
  map(fn, microstate) {
    let { transitions } = reveal(microstate);
    return map(transitions => map(transition => fn(transition), transitions), transitions)
      .collapsed;
  },
});
