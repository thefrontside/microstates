import assign from './assign';
import ComputedProperty from './computed-property';
import { eachProperty, reduceObject, mapObject } from './object-utils';

const { keys, defineProperty, getOwnPropertyDescriptors } = Object;

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
  construct(state, value) {
    value = value == null ? {} : value;

    //TODO: this should probaby collect all properties, not just own
    // properties
    //
    // merge in any existing properties on the prototype into this
    // state instance.
    if (keys(this.ownProperties).length > 0) {
      value = this.merge(this.ownProperties, value);
    }

    // add a lazily computed property for each property of `value`
    keys(value).forEach((key)=> {
      defineProperty(state, key, new ValueProperty(this, state, key, value));
    });

    // add the `valueOf`
    defineProperty(state, 'valueOf', new ValueOfMethod(this, value));
  }

  /**
   * Merges in a set of JavaScript values into a set of microstate
   * properties.
   *
   * Microstates accept simple POJOs both in their constructors and when
   * merging in values from a state transition. However, the properties
   * of a microstate can be composed of other microstates, and so when
   * merging in properties into a microstate, we don't want to
   * overwrite them with their POJO equivalents. Instead, we want to pass
   * the pojo equivalents to the microstate constructor if they occupy
   * the same slot. So, if we had a hash with some microstates:
   *
   *   {
   *     one: [Bool: true]
   *     two: "Plain String"
   *   }
   *
   * and we wanted to merge in the hash:
   *
   *   {
   *     one: false,
   *     two: "Another String"
   *   }
   *
   * when we use this method, we'll end up with the `false` value from
   * the second hash getting passed to the constructor of the `Bool`
   * microstate, so we'll end up with:
   *
   *   {
   *     one: [Bool: false],
   *     two: "Another String"
   *   }
   * @method merge
   * @param {object} state - a hash potentially containing microstates
   * @param {object} attrs - a hash of simple JavaScript values.
   */
  merge(state, attrs) {
    return reduceObject(attrs, (merged, name, value)=> {
      let current = state[name];
      let next = this.isMicrostate(current)
            ? new current.constructor(value.valueOf())
            : value;
      return assign({}, merged, { [name]: next });
    }, state.valueOf());
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

  get ownProperties() {
    return reduceObject(this.definition, function(properties, name, value) {
      if (name === 'transitions') {
        return properties;
      } else {
        return assign(properties, { [name]: value });
      }
    });
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
            return new Type(metadata.merge(this, result));
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
      let value = state[name];
      if (metadata.isMicrostate(value)) {
        return contextualize(value, this, name);
      } else {
        return value;
      }
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

class ValueProperty extends ComputedProperty {
  enumerable() { return true; }

  constructor(metadata, container, key, attributes) {
    super(function() {
      let value = attributes[key];
      if (metadata.isMicrostate(value)) {
        return contextualize(value, container, key);
      } else {
        return value;
      }
    });
  }
}

class ValueOfMethod extends ComputedProperty {
  constructor(metadata, value) {
    super(function() {
      let result;
      return function() {
        if (result) { return result; }
        let unboxed = value.valueOf();

        result = Object.keys(unboxed).reduce(function(valueOf, key) {
          let prop = unboxed[key];
          if (metadata.isMicrostate(prop)) {
            return assign({}, valueOf, { [key]: prop.valueOf() });
          } else {
            return valueOf;
          }
        }, unboxed);

        return result;
      };
    });
  }
}

function cached(constructor) {
  let prototype = constructor.prototype;

  eachProperty(getOwnPropertyDescriptors(prototype), function(key, descriptor) {
    if (descriptor.get) {
      defineProperty(prototype, key, new ComputedProperty(function() {
        return descriptor.get.call(this);
      }));
    }
  });
  return constructor;
}
