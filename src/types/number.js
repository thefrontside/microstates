import Primitive from './primitive';

export default class NumberType extends Primitive {
  static name = "Number";

  initialize(value) {
    if (value instanceof Number) {
      return value;
    } else if (value.valueOf() === undefined) {
      return new Number(0);
    } else {
      return new Number(Number(value.valueOf()));
    }
  }
  increment(step = 1) {
    return this.state + step;
  }

  decrement(step = 1) {
    return this.state - step;
  }
}
