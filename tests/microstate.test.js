import 'jest';
import Microstate, { create, map } from 'microstates';

it('exports create', function() {
  expect(create).toBeInstanceOf(Function);
});

describe('create', () => {
  class Person {
    name = String;
  }
  let value = { name: "Homer" };
  let homer;
  beforeEach(() => {
    homer = create(Person, value);
  });
  it('uses valueOf microstates instance that\'s passed to it', () => {
    expect(homer.valueOf()).toEqual(value);
  });
  describe('calling create with microstate', () => {
    class AgingPerson {
      name = String;
      age = Number;
    }
    let homerWithAge;
    beforeEach(() => {
      homerWithAge = create(AgingPerson, homer);
    });
    it('has values for both composed types', () => {
      expect(homerWithAge.name.state).toBe('Homer');
      expect(homerWithAge.age.state).toBe(0);
    });
  })
});

describe('valueOf', () => {
  let ms;
  beforeEach(() => {
    ms = create(Number, 10);
  });
  it('returns passed in value of', () => {
    expect(ms.valueOf()).toBe(10);
  });
  it('is not enumerable', () => {
    expect(Object.keys(ms).indexOf('valueOf')).toBe(-1);
  });
});

describe('map array', () => {
  let items, mapped;
  beforeEach(() => {
    items = create([Number], [1, 2, 3]);
    mapped = map(microstate => microstate, items);
  });
  it('returns an array', () => {
    expect(Array.isArray(mapped)).toBe(true);
  });
  it('has a microstate as each item', () => {
    expect(mapped[0]).toBeInstanceOf(Microstate);
    expect(mapped[1]).toBeInstanceOf(Microstate);
    expect(mapped[2]).toBeInstanceOf(Microstate);        
  });
  it('has a microstate has a state', () => {
    expect(mapped[0].state).toBe(1);
    expect(mapped[1].state).toBe(2);
    expect(mapped[2].state).toBe(3);        
  });
});

describe('map object', () => {
  let items, mapped;
  beforeEach(() => {
    items = create({Number}, { one: 1, two: 2, three: 3 });
    mapped = map(microstate => microstate, items);
  });
  it('returns a regular object, not microstate', () => {
    expect(mapped).not.toBeInstanceOf(Microstate);
  });
  it('has composed states', () => {
    expect(mapped.one).toBeInstanceOf(Microstate);
    expect(mapped.two).toBeInstanceOf(Microstate);
    expect(mapped.three).toBeInstanceOf(Microstate);
  });
  it('has values', () => {
    expect(mapped.one.state).toBe(1);
    expect(mapped.two.state).toBe(2);
    expect(mapped.three.state).toBe(3);
  });
});

describe('transitions', () => {
  let number, increment;
  beforeEach(() => {
    number = create(Number, 42);
    increment = number.increment;
  });
  it('allows to use increment without original object', () => {
    let result = increment();
    expect(result).toBeInstanceOf(Microstate);
    expect(result.valueOf()).toBe(43);
  });
  it('has name of the function', () => {
    expect(increment.name).toBe('increment');
  });
});