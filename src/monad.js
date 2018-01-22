import { Applicative } from 'funcadelic';
import { type } from 'funcadelic/src/typeclasses';

export const Monad = type(
  class Monad extends Applicative {
    flatMap(fn, m) {
      return this(m).flatMap(fn, m);
    }
  }
);

export const { flatMap } = Monad.prototype;
