export default class MicrostateNumber {
  initialize(current = 0) {
    return current;
  }

  sum(current: number, ...args: Array<number>) {
    return args.reduce((accumulator, value) => accumulator + value, current);
  }

  subtract(current: number, ...args: Array<number>) {
    return args.reduce((accumulator, value) => accumulator - value, current);
  }

  increment(current: number, step = 1) {
    return current + step;
  }

  decrement(current: number, step = 1) {
    return current - step;
  }
}
