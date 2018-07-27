import expect from 'expect';
import { Hash, Dictionary, equals } from '../src/hash';

describe('hash dictionary', () => {
  class OneValue {
    constructor(value) {
      this.value = value;
    }
  }

  Hash.instance(OneValue, {
    digest(object) {
      return [object.value];
    }
  })

  class TwoValues {
    constructor(one, two) {
      this.one = one;
      this.two = two;
    }
  }

  class TwoValuesPlus extends TwoValues {
    static Type = TwoValues;
  }

  Hash.instance(TwoValues, {
    digest(object) {
      return [object.one, object.two]
    }
  })

  let dictionary;
  beforeEach(function() {
    dictionary = new Dictionary();
  });


  it("does not have anythingin in it by default", function() {
    expect(dictionary.get(new OneValue())).toBeUndefined();
  });

  it("lets you put in a value and get the same value", function() {
    let single = new OneValue(5);
    let double = new TwoValues("hi", "mom");
    dictionary.set(single, 1)
    dictionary.set(double, 2);
    expect(dictionary.get(single)).toEqual(1);
    expect(dictionary.get(double)).toEqual(2);
  });

  it('partions by type', function() {
    let single = new OneValue(5);
    let double = new TwoValues(5,6);

    dictionary.set(single, 10);
    dictionary.set(double, "rad");

    expect(dictionary.get(single)).toEqual(10);
    expect(dictionary.get(double)).toEqual("rad");
  });

  it('looks up the same value on two separate objects provided they hash to the same value', function() {
    let one = {some: 'object'};
    let two = ['an', 'array'];
    dictionary.set(new TwoValues(one, two), "some value");
    expect(dictionary.get(new TwoValues(one, two))).toEqual("some value");
  });


  it('uses the Type property of the constructor (if present) to determine how it partitions', function() {
    dictionary.set(new TwoValues(5, 42), "some value");
    expect(dictionary.get(new TwoValuesPlus(5, 42))).toEqual("some value");
  });

  it('can test equivalence between two hashable things', function() {
    expect(equals(new OneValue(5), new OneValue(5))).toEqual(true);
    expect(equals(new OneValue(5), new OneValue(6))).toEqual(false);
    expect(equals(new TwoValues(5, 10), new TwoValuesPlus(5, 10))).toEqual(true);
  });
})
