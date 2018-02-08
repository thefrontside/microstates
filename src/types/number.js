export default class NumberType {
  constructor(value = 0) {
    return new Number(value);
  }
  sum(...args) {
    return args.reduce((accumulator, value) => accumulator + value, this.state);
  }
  subtract(...args) {
    return args.reduce((accumulator, value) => accumulator - value, this.state);
  }
  increment(step = 1) {
    return this.state + step;
  }
  decrement(step = 1) {
    return this.state - step;
  }
}
