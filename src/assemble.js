import { type } from 'funcadelic';

export const Assemble = type(class Assemble {
  assemble(Type, picostate, value) {
    return this(picostate).assemble(Type, picostate, value);
  }
})

export const { assemble } = Assemble.prototype;
