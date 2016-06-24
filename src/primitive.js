import MicroState from './microstate';

export default MicroState.extend('Primitive', {
  valueOf() {
    return this.value;
  },

  toString() {
    return String(this.value);
  }
});
