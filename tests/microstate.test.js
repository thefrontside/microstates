import 'jest';
import Microstate, { create, map } from 'microstates';

it('exports create', function() {
  expect(create).toBeInstanceOf(Function);
});

describe('create', () => {
  it(`uses valueOf microstates instance that's passed to it`, () => {
    class Person {
      name = String;
    }
    let value = { name: "Taras" };
    let m1 = create(Person, value);
    expect(m1.valueOf()).toEqual(value);
  });
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

describe('map', () => {
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
