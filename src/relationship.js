import { Any } from './types';
import { view, Path } from './lens';
import { valueOf } from './meta';

export class Relationship {

  constructor(traverse) {
    this.traverse = traverse;
  }

  flatMap(sequence) {
    return new Relationship(edge => {
      let cell = this.traverse(edge);
      let next = sequence(cell);
      return next.traverse(edge);
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
    return relationship(({ value }) => {
      if (value != null) {
        return { Type: Any, value };
      } else {
        return { Type: Any, value: definition };
      }
    });
  }
}

export class Edge {
  constructor(parent, path) {
    this.parent = parent;
    this.path = path;
  }

  get name() {
    let [ name ] = this.path.slice(-1);
    return name;
  }

  get value() {
    return view(Path(this.path), this.parentValue);
  }

  get parentValue() {
    return valueOf(this.parent);
  }
}
