import { Applicative, type } from 'funcadelic';

export const Monad = type(
  class Monad extends Applicative {
    flatMap(fn, m) {
      return this(m).flatMap(fn, m);
    }
  }
);

export const { flatMap } = Monad.prototype;