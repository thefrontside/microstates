import curry from 'ramda/src/curry';
import set from 'ramda/src/set';
import view from 'ramda/src/view';
import valueOf from './value-of';

export default curry(function transition(fn, lens, value, ...args) {
  let current = view(lens, value);
  let next = set(lens, fn.bind(this)(current, ...args), value);
  return valueOf(next);
});
