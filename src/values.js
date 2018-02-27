import { type, map } from 'funcadelic';

const { keys } = Object;

const Values = type(class Values {
  values(holder) {
    return this(holder).values(holder);
  }
})

Values.instance(Array, {
  values(array) { return array; }
});

Values.instance(Object, {
  values(object) { return map(key => object[key], keys(object)); }
});

export const { values } = Values.prototype;