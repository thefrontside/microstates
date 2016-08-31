/**
 * Property Descriptor that computes its value once and then permanently caches
 * the result.
 *
 * In order to make the computation of microstate properties easy to
 * reason about, we want them to be as lazy as possible. However, in
 * order to make sure that we don't do any extra computation than
 * necessary.
 */
export default class ComputedProperty {
  get writeable() { return false; }

  get enumerable() { return false; }

  constructor(compute) {
    let property = this;
    this.get = function() {
      let value = compute.call(this);
      property.get = ()=> value;
      return value;
    };
  }
}
