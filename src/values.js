import { type } from 'funcadelic';

const Values = type(class Values {
  values(holder) {
    return this(holder).values(holder);
  }
})

Values.instance(Array, {
  values(array) { return array; }
});

Values.instance(Object, {
  values(object) { return Object.values(object); }
});

export const { values } = Values.prototype;