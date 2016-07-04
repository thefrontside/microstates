import Primitive from './primitive';

export default Primitive.extend('NumberState', {
  constructor(value = 0) {
    return { value: Number(value) };
  },

  transitions: {
    add(current, amount) {
      return {
        value: current + Number(amount)
      };
    },

    subtract(current, amount) {
      return {
        value: current - Number(amount)
      };
    }
  }
});
