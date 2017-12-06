const symbol = Symbol('🙈');

const { getOwnPropertySymbols } = Object;

export function keep(object, value) {
  return Object.defineProperty(object, symbol, {
    value,
    enumerable: false,
  });
}

export function reveal(object) {
  if (object && getOwnPropertySymbols(object).includes(symbol)) {
    return object[symbol];
  }
}
