import 'jest';
import { create } from 'microstates';

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
