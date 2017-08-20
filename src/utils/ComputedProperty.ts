/**
 * Property Descriptor that computes its value once and then permanently caches
 * the result.
 *
 * In order to make the computation of microstate properties easy to
 * reason about, we want them to be as lazy as possible. However, in
 * order to make sure that we don't do any extra computation than
 * necessary we want to permanently cache the result of those lazy
 * computations. That's where `ComputedProperty` comes in.
 *
 * Every instance of `ComputedProperty` is a valid instance of a
 * JavaScript property descriptor, which, by default,  is
 * is _not_ enumerable. It can be used in any API that expects a property
 * descriptor. For example:
 *
 *   let object = {};
 *   Object.defineProperty('constant', new ComputedProperty(function() {
 *     return {};
 *   }))
 *
 *   object.constant === object.constant //=> true
 *
 * In order to change the configuration of the property descriptor,
 * you can pass a set of overrides to the constructor to do things
 * like make it an enumerable property.
 *
 *   let object = {}
 *   Object.defineProperty('constant', new ComputedProperty(function() {
 *     return {}
 *   }, { enumerable: true }));
 *
 *   Object.keys(object) //=> ['constant']
 *
 * The value of `this` inside the computed property evaluation function will be
 * the object on which this property resides.
 *
 *   let object = {one: 1, two: 2};
 *   Object.defineProperty('info', new ComputedProperty(function() {
 *     return { type: typeof this, keys: Object.keys(this) };
 *   }));
 *
 *   object.info //=> { type: 'object', keys: ['one', 'two'] }
 *
 * Note that it's totally ok to permanently cache the results of computations
 * since the objects to which these properties will be attached are
 * immutable.
 *
 * @constructor ComputedProperty
 * @param {function} compute - evaluates the property value
 * @param {Object} [attributes] - extra attributes for the descriptor.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description
 */
export default class ComputedProperty {
  writeable = false;
  configurable = false;
  enumerable = false;
  isComputed = false;
  cache = null;
  get = null;

  constructor(compute, attributes = {}) {
    let property = this;
    this.get = function() {
      if (!property.isComputed) {
        property.cache = compute.call(this);
        property.isComputed = true;
      }
      return property.cache;
    };
    Object.assign(this, attributes);
  }
}
