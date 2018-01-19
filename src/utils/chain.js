import { map, filter, append } from 'funcadelic';

class Chain {
  constructor(value) {
    Object.defineProperty(this, 'valueOf', {
      value() {
        return value;
      },
    });
  }
  map(fn) {
    return new Chain(map(fn, this.valueOf()));
  }
  filter(fn) {
    return new Chain(filter(fn, this.valueOf()));
  }

  append(thing) {
    return new Chain(append(this.valueOf(), thing));
  }
}

export default function chain(value) {
  return new Chain(value);
}
