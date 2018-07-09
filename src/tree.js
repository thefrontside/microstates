import { Functor, foldl, map } from 'funcadelic';
import { Meta, isPicostate } from './picostates';
import { over, set, ValuePath, ValueAt } from './lens';

class Tree {
  constructor(object) {
    this.object = object;
  }
}

Functor.instance(Tree, {
  map(fn, tree) {
    let { object } = tree;
    let result = fn(object)

    //TODO: worried this fold is not lazy.
    return new Tree(foldl((result, { key, value }) => {
      if (isPicostate(value)) {
        let { path } = Meta.get(value);
        return over(ValueAt(key), () => map(fn, new Tree(value)).object, result);
      } else {
        return result;
      }
    }, result, object));
  }
})

export default (picostate) => new Tree(picostate);
