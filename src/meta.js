import { type, append } from 'funcadelic';
import { At, compose, transparent, over, view } from './lens';

export class Meta {
  static symbol = Symbol('Meta');
  static data = At(Meta.symbol);
  static context = compose(Meta.data, At('context'));
  static lens = compose(Meta.data, At('lens'));
  static path = compose(Meta.data, At('path'));
  static value = compose(Meta.data, At('value'));
  static source = compose(Meta.data, At('source'));
  static Type = compose(Meta.data, At('Type'));

  constructor(object, value) {
    this.root = object;
    this.lens = transparent;
    this.path = [];
    this.value = value;
    this.source = object;
  }
}

export function metaOf(object) {
  return view(Meta.data, object);
}

export function valueOf(object) {
  let meta = metaOf(object);
  return meta != null ? meta.value : object;
}

export function pathOf(object) {
  return view(Meta.path, object);
}

export function sourceOf(object) {
  return view(Meta.source, object);
}

export function mount(microstate, substate, key) {
  let parent = view(Meta.data, microstate);
  let prefix = compose(parent.lens, At(key, parent.value));

  return over(Meta.data, meta => ({
    get root() {
      return parent.root;
    },
    get lens() {
      return compose(prefix, meta.lens);
    },
    get path() {
      return parent.path.concat([key]).concat(meta.path);
    },
    get value() {
      return meta.value;
    },
    get source() {
      return meta.source;
    }
  }), substate);
}

export const Profunctor = type(class {
  static name = 'Profunctor';

  promap(input, output, object) {
    if (metaOf(object) == null) {
      return object;
    } else {
      return this(object).promap(input, output, object);
    }
  }
});

export const { promap } = Profunctor.prototype;

Profunctor.instance(Object, {
  promap(input, output, object) {
    let next = input(object);
    let keys = Object.keys(object);
    if (next === object || keys.length === 0) {
      return output(next);
    } else {
      return output(append(next, keys.reduce((properties, key) => {
        return append(properties, {
          get [key]() {
            return promap(input, output, object[key]);
          }
        });
      }, {})));
    }
  }
});
