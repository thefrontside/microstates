import Identity from './identity';
import SymbolObservable from 'symbol-observable';

export default function Observable(Microstate) {
  return class extends Microstate {
    [SymbolObservable]() { return this['@@observable'](); }
    ['@@observable']() {
      return {
        subscribe: (observer) => {
          let next = observer.call ? observer : observer.next.bind(observer);
          return Identity(this, next);
        },
        [SymbolObservable]() {
          return this;
        }
      };
    }
  };
}
