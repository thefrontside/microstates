const symbol = Symbol('🙈 microstate');

export function keep(object, value) {
  return Object.defineProperty(object, symbol, {
    value,
    enumerable: false,
  });
}

export function reveal(object) {
  if (object) {
    return object[symbol];
  } else {
    return object;
  }
}
