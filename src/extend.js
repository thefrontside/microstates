import assign from './assign';
import ComputedProperty from './computed-property';
import { eachProperty, reduceObject, mapObject } from './object-utils';
import box from './box';

const { keys, defineProperty, defineProperties, getOwnPropertyDescriptors } = Object;

/**
 * Holds the transition methods, the properties and the prototype for
 * a microstate constructor. In actuality, most of what makes a
 * microstate a microstate is contained in this class, including the
 * constructor.
 *
 * @constructor Metadata
 * @param {function} Microstate - the root constructor
 * @param {function} type - the root constructor
 * @param {object|boolean|number|string|function} value - the represented value
 */
const Metadata = cached(class Metadata {
  constructor(Microstate, type, supertype, definition) {
    this.type = type;
    this.supertype = supertype;
    this.definition = definition;
    this.Microstate = Microstate;
  }

  /**
   * The Microstate constructor actually delegates to the metadata,
   * and so this is the where most of the construction logic takes
   * place.
   *
   * It "decorates" the state with properties corresponding to the
   * properties of `value` which is the value that the microstate
   * wraps. So, if value is
   *
   *   {
   *     hello: 'World',
   *     how: 'are you?'
   *   }
   *
   * then a `hello` property and a `how` property will be defined on
   * the state instance coresponding to their values in the `value`
   * param.
   *
   * @param {Microstate} state - the state being constructed.
   * @param {object|function|number|boolean} value - the boxed value
   * @see ValueProperty
   * @see ValueOfMethod
   */
  construct(state, value = {}) {
    let constants = mapObject(this.constants, (key, descriptor)=> {
      return new ChildProperty(this, state, key, ()=> descriptor.value );
    });

    let values = mapObject(value, (key)=> {
      return new ChildProperty(this, state, key, () => {
        if (this.constants.hasOwnProperty(key)) {
          let constant = this.constants[key].value;
          return this.isMicrostate(constant) ? constant.set(value[key].valueOf()) : value[key];
        } else {
          return value[key];
        }
      });
    });

    let descriptors = assign(constants, values);

    defineProperties(state, descriptors);
    defineProperty(state, 'valueOf', new ValueOfMethod(this, state, value, descriptors));
  }

  get constants() {
    let properties = Object.getOwnPropertyDescriptors(this.definition);
    return reduceObject(properties, (descriptors, name, descriptor)=> {
      if (name !== 'transitions' && name !== 'valueOf') {
        return assign(descriptors, {[name]: descriptor});
      } else {
        return descriptors;
      }
    });
  }

  /**
   * Tests if any object is a microstate.
   *
   * Microstates get special treatment throughout the process of
   * transitions, and so you need a way to check if an object is a
   * microstate. When metadata is created for a microstate
   * constructor, a reference to the very root of the microstate tree
   * is captured in order to make this check easy.
   *
   * @method isMicrostate
   * @param {object} object - the object to check
   * @returns {boolean} if `object` is a microstate
   */
  isMicrostate(object) {
    return object instanceof this.Microstate;
  }

  /**
   * Defines a microstate prototype.
   *
   * This collects all of the transitions defined for the microstate
   * and pops them onto a new object that will serve as the prototype.
   *
   * @type {object}
   */
  get prototype() {
    let descriptors = assign({}, this.ownTransitions);
    return Object.create(this.supertype.prototype, descriptors);
  }

  get ownTransitions() {
    let metadata = this;
    return mapObject(this.definition.transitions, function(name, method) {
      return new ComputedProperty(function() {
        return function(...args) {
          let Type = this.constructor;
          let result = method.call(this, this.valueOf(), ...args);
          if (result instanceof Type) {
            return result;
          } else if (result instanceof Object) {
            let merged = mapObject(result, (key, value)=> {
              var child = this[key];
              if (child) {
                return new child.constructor(value.valueOf());
              } else {
                return value;
              }
            });
            return new Type(assign({}, this, merged));
          } else {
            return new Type(result.valueOf());
          }
        };
      });
    });
  }

  get transitions() {
    let transitions = {};
    for (let metadata = this; metadata; metadata = metadata.supertype.metadata) {
      assign(transitions, metadata.ownTransitions);
    }
    return transitions;
  }

});

function contextualize(state, holder, key) {
  let metadata = state.constructor.metadata;

  let transitions = mapObject(metadata.transitions, function(name, descriptor) {
    return new ComputedProperty(function() {
      return function(...args) {
        let transition = descriptor.get.call(state);
        let result = transition.call(state, ...args);
        return holder.put(key, result);
      };
    });
  });

  let attributes = mapObject(state, function(name) {
    let descriptor = new ComputedProperty(function() {
      return contextualize(state[name], this, name);
    }, {enumerable: true});

    return descriptor;
  });

  return Object.create(state, assign(attributes, transitions));
}

export default function extend(Microstate, Super, properties) {
  let Type = class State extends Super {};
  let metadata = new Metadata(Microstate, Type, Super, properties);
  Type.metadata = metadata;
  Type.prototype = metadata.prototype;
  Type.prototype.constructor = Type;
  return Type;
}

class ChildProperty extends ComputedProperty {
  get enumerable() { return true; }

  constructor(metadata, state, name, resolve) {
    super(function() {
      let child = resolve();
      let substate = metadata.isMicrostate(child) ? child : box(child);
      return contextualize(substate, state, name);
    });
  }
}

class ValueOfMethod extends ComputedProperty {
  constructor(metadata, state, value, descriptors) {
    super(function() {

      if (metadata.definition.hasOwnProperty('valueOf')) {
        let valueOf = metadata.definition.valueOf.call(state, value);
        return function() {
          return valueOf;
        };
      } else {
        let valueOf = compute();
        function compute() {
          if (keys(descriptors).length > 0) {
            let properties = keys(descriptors).reduce((result, key)=> {
              return assign(result, {
                [key]: new ComputedProperty(function() {
                  return state[key].valueOf();
                }, { enumerable: true })
              });
            }, {});
            return Object.create(typeof value === 'undefined' ? null : value, properties);
          } else {
            return value;
          }
        }
        return function() {
          return valueOf;
        };
      }
    });
  }
}

function cached(constructor) {
  let prototype = constructor.prototype;

  eachProperty(getOwnPropertyDescriptors(prototype), function(key, descriptor) {
    if (descriptor.get) {
      defineProperty(prototype, key, {
        get() {
          let value = descriptor.get.call(this);
          let { writeable, enumerable } = descriptor;
          defineProperty(this, key, { value, writeable, enumerable });
          return value;
        }
      });
    }
  });
  return constructor;

}
