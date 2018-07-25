import Any from './types/any';

export default function parameterized(fn) {

  function initialize(...args) {
    let Type = fn(...args);
    if (Type.initialize) {
      Type.initialize();
    }
    return Type;
  }

  let defaultTypeParameters = new Array(fn.length);
  defaultTypeParameters.fill(Any);
  let DefaultType = initialize(...defaultTypeParameters);
  DefaultType.of = (...args) => initialize(...args);
  return DefaultType;
}
