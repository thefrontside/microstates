export default class NumberType {
  initialize(value = 0) {
    return new Number(value).valueOf();
  }
  increment(step = 1) {
    return this.state + step;
  }
  decrement(step = 1) {
    return this.state - step;
  }
}
