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

// return map(transition => {
//   return (...args) => {
//     let structure = transition(...args);
//     return new Microstate(structure);
//   };
// }, transitions);

function transitionsFor(value, tree, invoke) {
  return ;
}

export class Microstate {
  constructor(tree, value) {
    keep(this, tree);
    this.value = value;
    let invoke = this.invoke.bind(this);
    let transitions = collapse(node => map(transition => (...args) => {
      let { tree, value } = transition(...args);
      return new Microstate(tree, value);
    }, node.transitionsAt(value, tree, invoke)), tree);
    return assign(this, transitions);
  }
  
  invoke({ Type, method, args, value, tree, state}) {
    let next = method.apply(null, [state, ...args]);
    return { Type, value: next };
  }

  /**
   * Evaluates to state for this microstate.
   */
  get state() {
    let tree = reveal(this);
    return collapse(node => node.stateAt(this.value), tree);
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
    return this.value;
  }
}
