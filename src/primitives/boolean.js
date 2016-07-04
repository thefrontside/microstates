import Primitive from './primitive';

export default Primitive.extend('BooleanState', {
  constructor(value) {
    return  { value: !!value };
  },

  transitions: {
    toggle(current) {
      return {
        value: !current
      };
    }
  }
});
