export default function overload(Type, property, value) {
  return class extends Type {
    constructor(...args) {
      let tmp = super(...args);
      this[property] = value;
      return tmp;
    }
  };
}
