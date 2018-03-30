import { map, append } from "funcadelic";
import analyze, { collapseState } from "./structure";
import { keep, reveal } from "./utils/secret";
import SymbolObservable from "symbol-observable";

export default class Microstate {
  constructor(tree, value) {

    keep(this, { tree, value });

    return append(map(transition => transition, this), {
      get state() {
        return collapseState(tree, value);
      }
    });
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
    value = value != null ? value.valueOf() : value;
    let tree = analyze(Type, value);
    return new Microstate(tree, value);
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
