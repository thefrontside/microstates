import { type } from 'funcadelic';

export const Assemble = type(class Assemble {
  assemble(Type, microstate, value) {
    return this(microstate).assemble(Type, microstate, value);
  }
})

export const { assemble } = Assemble.prototype;
