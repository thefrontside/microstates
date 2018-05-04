export default function thunk(fn) {
  let evaluated = false;
  let result = undefined;
  return function evaluate(...args) {
    if (evaluated) {
      return result;
    } else {
      result = fn(...args);
      evaluated = true;
      return result;
    }
  };
}
