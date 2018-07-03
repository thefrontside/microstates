import { stable } from 'funcadelic';
import { Microstate, Tree } from './tree';

const { map } = Microstate;

export class Query {
  map(fn) {
    return new Thunk(() => map(fn, this.state));
  }

  filter(fn) {
    // return new Thunk(() => );
  }
}

class Value extends Query {
  constructor(value) {
    super();
    this.value = value;
  }

  get state() {
    return this.value;
  }
}

class Thunk extends Query {
  constructor(fn) {
    super();
    this.fn = stable(fn);
  }

  get state() {
    return this.fn();
  }
}

export default function query(value) {
  return new Value(value);
}