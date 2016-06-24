import Primitive from './primitive';

export default Primitive.extend('NumberState', {
  constructor(value = 0) {
    return { value: Number(value) };
  },

  add(amount) {
    return this.value + Number(amount);
  },

  subtract(amount) {
    return this.value - Number(amount);
  }
});
