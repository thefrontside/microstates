import Primitive from '../microstate';

export default Primitive.extend('List', {
  constructor(value = []) {
    return { value };
  },

  get length() { return this.value.length; },

  forEach() {
    return this.value.forEach(...arguments);
  },

  valueOf() {
    return this.value.valueOf();
  },
  
  transitions: {
    fill(current, ...args) {
      return {
        value: current.slice().fill(...args)
      };
    }, 

    sort(current, ...args) {
      return {
        value: current.slice().sort(...args)
      };
    },

    slice(current, ...args) {
      return {
        value: current.slice(...args)
      };
    },

    unshift(current, ...args) {
      return {
        value: args.concat(current)
      };
    },

    concat(current, ...args) {
      return {
        value: current.concat(...args)
      };
    },

    map(current, ...args) {
      return {
        value: current.map(...args)
      };
    },

    reverse(current) {
      return {
        value: current.slice().reverse()
      };
    },

    pop() {
      return this.slice(0, -1);
    },
    
    push(current, ...args) {
      return this.concat(...args);
    },

    shift() {
      return this.slice(1);
    }
  }

});
