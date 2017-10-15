export default class NumberState {
  initialize(current = 0) {
    return current;
  }
  sum(current = 0, ...args) {
    return args.reduce((accumulator, value) => accumulator + value, current);
  }
  subtract(current = 0, ...args) {
    return args.reduce((accumulator, value) => accumulator - value, current);
  }
  increment(current = 0, step = 1) {
    return current + step;
  }
  decrement(current = 0, step = 1) {
    return current - step;
  }
}
