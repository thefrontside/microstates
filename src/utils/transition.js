import curry from 'ramda/src/curry';
import set from 'ramda/src/set';
import view from 'ramda/src/view';

export default curry(function transition(fn, lens, value, ...args) {
  let current = view(lens, value);
  return set(lens, fn(current, ...args), value);
});
