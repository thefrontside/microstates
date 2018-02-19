import 'jest';
import { parameterized, params } from '../src/types/parameters';
import isSimple from '../src/is-simple';

describe('Type "Complexity"', () => {
  it('Number is simple', function() {
    expect(isSimple(Number)).toBe(true);
  });
  it('Boolean is simple', function() {
    expect(isSimple(Boolean)).toBe(true);
  });
  it('String is simple', function() {
    expect(isSimple(String)).toBe(true);
  });
  it('a user-defined class is not simple', function() {
    expect(isSimple(class {})).toBe(false);
  });
  it('an array without parameters is simple', function() {
    expect(isSimple(Array)).toBe(true);
  });
  it('an array with nothing but simple types is simple', function() {
    expect(isSimple(parameterized(Array, parameterized(Array, Boolean)))).toBe(true);
  });
  it('an array with non-simple constitunents is not simple', function() {
    expect(isSimple(parameterized(Array, class Foo {}))).toBe(false);
  });
  it('an array parameterized by a simple array is simple', function() {
    expect(isSimple(parameterized(Array, Array))).toBe(true);
  });
  it('an object without parameters is simple', function() {
    expect(isSimple(Object)).toBe(true);
  });
  it('an object with nothing but simple parameters is simple', function() {
    expect(isSimple(parameterized(Object, parameterized(Array, Boolean)))).toBe(true);
  });
  it('an object with non-simple parameter', function() {
    expect(isSimple(parameterized(Object, class {}))).toBe(false);
  });
  it('an object parameterized by a simple object is simple', function() {
    expect(isSimple(parameterized(Object, Object))).toBe(true);
  });
});
