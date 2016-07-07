import assign from './utils/assign';
import prototypeFor from './utils/prototype-for';

const { defineProperty } = Object;

export default class MicroState {

  static extend(name, attrs = {}) {
    let Super = this;
    let constructor = attrs.constructor || (()=> {});

    let Class = class extends Super {
      constructor() {
        super(constructor.call(null, ...arguments));
        defineProperty(this, 'constructor', { value: Class });
      }
    };

    defineProperty(Class, 'name', {value: name });

    let ancestor = Object.create(Super.prototype, attrs.prototype || {});
    Class.prototype = prototypeFor(ancestor, attrs);

    return Class;
  }

  constructor(attrs = {}) {
    assign(this, attrs);
  }
};
