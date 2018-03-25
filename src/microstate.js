import { map } from "funcadelic";
import analyze from "./structure";
import { keep, reveal } from "./utils/secret";
import SymbolObservable from "symbol-observable";
import { collapse } from './typeclasses/collapse';
import State from './state';

export default class Microstate {
  constructor(tree) {
    keep(this, tree);
    return append(map(transition => transition, this), {
      get state() {
        return collapse(new State(tree));
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
    let tree = analyze(Type, value);
    return new Microstate(tree);
  }

  /**
   * Return boxed in value for this microstates
   */
  valueOf() {
    return reveal(this).data.value;
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
