import { create } from './microstates';

class Literal {
  initialize(value) {
    value = value.valueOf();
    if (value == null) {
      return this;
    }
    switch (typeof value) {
      case "number":
        return create(Number, value);
      case "string":
        return create(String, value);
      case "boolean":
        return create(Boolean, value);
      default:
        if (Array.isArray(value)) {
          return create([Literal], value);
        } else {
          return create({Literal}, value);
        }
    }
  }
}

export default (value) => create(Literal, value);
