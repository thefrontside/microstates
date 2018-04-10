export default class NumberType {
  constructor(value = 0) {
    return new Number(value);
  }
  increment(step = 1) {
    return this.set(this.state + step);
  }
  decrement(step = 1) {
    return this.set(this.state - step);
  }
}
