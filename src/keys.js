import { type } from 'funcadelic';

const Keys = type(class Keys {
  keys(holder) {
    return this(holder).keys(holder);
  }
})

Keys.instance(Array, {
  keys(array) { return [...array.keys()] }
});

Keys.instance(Object, {
  keys(object) { return Object.keys(object); }
});

const { keys } = Keys.prototype;

export default keys;