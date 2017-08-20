export function sum(current, ...args) {
  return args.reduce((accumulator, value) => accumulator + value, current);
}

export function subtract(current, ...args) {
  return args.reduce((accumulator, value) => accumulator - value, current);
}

export function increment(current, step = 1) {
  return current + step;
}

export function decrement(current, step = 1) {
  return current - step;
}
