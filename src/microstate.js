import { map } from "funcadelic";
import analyze from "./structure";
import { keep, reveal } from "./utils/secret";
import SymbolObservable from "symbol-observable";
import { collapse } from './typeclasses/collapse';
import State from './typeclasses/state';

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
   * @param {*} initialValue
   */
  static create(Type, initialValue) {
    let { tree, value } = analyze(Type, initialValue);
    return new Microstate(tree, value);
  }

  /**
   * Evaluates to state for this microstate.
   */
  get state() {
    let { tree, value } = reveal(this);
    return collapse(new State(tree, value));
  }

  /**
   * Return boxed in value for this microstates
   */
  valueOf() {
    let { value } = reveal(this);
    return value;
  }

  [SymbolObservable]() {
    let microstate = this;
    return {
      subscribe(observer) {
        let next = observer.call ? observer : observer.next.bind(observer);

        function nextOnTransition(transition) {
          return function invoke(...args) {
            let nextable = map(nextOnTransition, transition(...args));
            next(nextable);
            return nextable;
          };
        }

        next(map(nextOnTransition, microstate));
      },
      [SymbolObservable]() {
        return this;
      }
    };
  }
}
