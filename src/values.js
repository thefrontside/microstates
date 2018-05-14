import { type } from 'funcadelic';

const Values = type(class Values {
  values(holder) {
    return this(holder).values(holder);
  }
})

Values.instance(Array, {
  values(array) { return array.slice(); }
});

Values.instance(Object, {
  values(object) {
    let values = [];
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        values.push(object[key]);
      }
    }
    return values;
  }
});

const { values } = Values.prototype;

export default values;