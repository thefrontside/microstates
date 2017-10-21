export default class NumberType {
  constructor(value = 0) {
    return new Number(value);
  }
  sum(current, ...args) {
    return args.reduce((accumulator, value) => accumulator + value, current);
  }
  subtract(current, ...args) {
    return args.reduce((accumulator, value) => accumulator - value, current);
  }
  increment(current, step = 1) {
    return current + step;
  }
  decrement(current, step = 1) {
    return current - step;
  }
}
