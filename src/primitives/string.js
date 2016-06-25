import Primitive from './primitive';

export default Primitive.extend('StringState', {
  constructor(value = '') {
    return { value: String(value) };
  }
});