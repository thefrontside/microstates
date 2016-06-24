import Primitive from './primitive';

export default Primitive.extend('BooleanState', {
  constructor(value) {
    return  { value: !!value };
  },

  toggle() {
    return this.replace(!this.value);
  }
});
