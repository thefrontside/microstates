import Primitive from './microstate';

export default Primitive.extend('List', {
  constructor(value = []) {
    return { value };
  },

  get length() { return this.value.length; },

  fill() {
    return this.replace(this.value.slice().fill(...arguments));
  },

  pop() {
    return this.slice(0, -1);
  },

  push() {
    return this.concat(...arguments);
  },

  reverse() {
    return this.replace(this.value.slice().reverse());
  },

  shift() {
    return this.slice(1);
  },

  sort() {
    return this.replace(this.value.slice().sort(...arguments));
  },

  slice() {
    return this.replace(this.value.slice(...arguments));
  },

  unshift(...args) {
    return this.replace(args.concat(this.value));
  },

  concat() {
    return this.replace(this.value.concat(...arguments));
  },

  map() {
    return this.replace(this.value.map(...arguments));
  },

  prototype: {
    forEach: { value() { return this.value.forEach(...arguments); }},
    valueOf: { value() { return this.value.valueOf(); }}
  }

});
