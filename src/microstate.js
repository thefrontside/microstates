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
export default function create(Type, value) {
  return new Microstate(analyze(Type), value);
}

function collapse(fn, tree) {
  return map(fn, tree).collapsed;
}

function transitions(value, tree) {
  return collapse(node => {
    let transitions = node.transitionsAt(value, tree, invoke);
    // console.log({ value, data: tree.data, transitions })
    return map(transition => {
      return (...args) => {
        let { tree, value } = transition(...args);
        return new Microstate(tree, value);
      };
    }, transitions);
  }, tree);
}

function context(tree, value) {
  return function transitionContext(nextType, nextValue) {
    // context is invoked with arguments
    if (nextType) {
      // TODO
    } else {
      let ms = new Microstate(tree, value);
      // console.log('context=', { data: tree.data, ms, transitions: transitions(value, tree) })
      return ms;
    }
  }
}

function invoke({ Type, method, args, value, tree, state}) {

  // console.log({ Type, data: tree.data, value });
  let transitionContext = context(tree, value);
  let next = method.apply(transitionContext, [state, ...args]);

  if (next instanceof Microstate) {
    return reveal(next);
  }

  return { Type, tree, value: next };
}

export class Microstate {
  constructor(tree, value) {
    keep(this, { tree, value });
    return assign(this, transitions(value, tree));
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
    let message = typeof value === 'function'
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
