import 'jest';
import Microstate from '../src';
import { parameterized, params } from '../src/type-parameters';

describe('type parameters', () => {
  class Base {};
  it('has no parameters on something that has not been parameterized', () => {
    expect(params(Base)).toEqual({});
  });

  describe('parameterizing a class', function() {
    class Parametric extends parameterized(Base, {T: Object, V: Array}) {}

    it('can fetch the type parameters', function() {
      let { T, V } = params(Parametric);
      expect(T).toBe(Object);
      expect(V).toBe(Array);
    });

    describe('overiding the defaults of a parameterized type', () => {
      it('can override the first parameter', function() {
        let { T, V } = params(parameterized(Parametric, String));
        expect(T).toBe(String);
        expect(V).toBe(Array);
      });

      it('can override both parameters', function() {
        let { T, V } = params(parameterized(Parametric, String, Number));
        expect(T).toBe(String);
        expect(V).toBe(Number);
      });

      it('can override a single parameter by name', function() {
        let { T, V } = params(parameterized(Parametric, {V: Number}));
        expect(T).toBe(Object);
        expect(V).toBe(Number);
      });

      it('can override both parameters by name', function() {
        let { T, V } = params(parameterized(Parametric, {T: String, V: Number}));
        expect(T).toBe(String);
        expect(V).toBe(Number);
      });

      it('ignores parameters that are beyond the index', function() {
        expect(params(parameterized(Parametric, String, Number, Object))).toEqual({
          T: String,
          V: Number
        });
      });
    });

  });

});
