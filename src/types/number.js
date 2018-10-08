import Primitive from './primitive';

export default class NumberType extends Primitive {
  static name = "Number";

  initialize(value) {
    if (value == null) {
      return 0;
    } else if (isNaN(value)) {
      return this
    } else {
      return Number(value);
    }
  }
  increment(step = 1) {
    return this.state + step;
  }

  decrement(step = 1) {
    return this.state - step;
  }
}
