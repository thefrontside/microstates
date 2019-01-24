export default function objectOf(value) {
  if (value === null) {
    return new Null();
  } else if (typeof value === 'undefined') {
    return new Undefined();
  } else {
    return Object(value);
  }
}

function Constant(value) {
  return class {
    valueOf() { return value; }
  };
}

class Null extends Constant(null) {}
class Undefined extends Constant(undefined) {}
