import { Any } from './types';

export class Relationship {

  constructor(traverse) {
    this.traverse = traverse;
  }

  flatMap(sequence) {
    return new Relationship((value, parent) => {
      let cell = this.traverse(value, parent);
      let next = sequence(cell);
      return next.traverse(value, parent);
    });
  }

  map(fn) {
    return this.flatMap(cell => new Relationship(() => {
      return fn(cell);
    }));
  }
}

export function relationship(definition) {
  if (typeof definition === 'function') {
    return new Relationship(definition);
  } else {
    return relationship(value => {
      if (value != null) {
        return { Type: Any, value };
      } else {
        return { Type: Any, value: definition };
      }
    });
  }
}
