export default function thunk(fn) {
  let evaluated = false;
  let result = undefined;
  return function evaluate() {
    if (evaluated) {
      return result;
    } else {
      result = fn();
      evaluated = true;
      return result;
    }
  };
}
