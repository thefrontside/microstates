import curry from 'ramda/src/curry';
import set from 'ramda/src/set';
import view from 'ramda/src/view';
import withoutGetters from './without-getters';

export default curry(function transition(fn, lens, value, ...args) {
  let current = view(lens, value);
  // ensures that Context objects are converted into their value
  let transitioned = valueOf(fn.call(this, current, ...args));
  let next = set(lens, transitioned, value);
  return withoutGetters(next);
});

function valueOf(o) {
  return o && o.valueOf && o.valueOf.call ? o.valueOf() : o;
}
