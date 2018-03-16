export default function thunk(fn) {
  let evaluated = false;
  let result = undefined;
  return function evaluate() {
    if (evaluated) {
      return result;
    } else {
      result = fn.call(this);
      evaluated = true;
      return result;
    }
  };
}
