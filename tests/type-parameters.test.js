import 'jest';

import { parameterized, params, any } from '../src/types/parameters';
import types from '../src/types';

describe('type parameters', () => {
  class Base {};
  it('has no parameters on something that has not been parameterized', () => {
    expect(params(Base)).toEqual({});
  });

  describe('parameterizing an array', function () {
    let ParameterizedArray = parameterized(Array, Base);

    it('has the `T` parameter set to `any` by default', function() {
      expect(params(Array).T).toBe(any);
    });

    it('transparently converts it to ArrayType', function() {
      expect(ParameterizedArray.prototype).toBeInstanceOf(types.Array);
    });
    it('has the `T` parameter set to Base', function() {
      let { T } = params(ParameterizedArray);
      expect(T).toBe(Base);
    });
  });

  describe('parameterizing an object', function() {
    let ParameterizedObject = parameterized(Object, Base);

    it('has the `T` parameter set to `any` by default', function() {
      let { T } = params(Object);
      expect(T).toBe(any);
    });

    it('transparently converts it to ObjectType', function() {
      expect(ParameterizedObject.prototype).toBeInstanceOf(types.Object);
    });
  });


  describe('parameterizing a class', function() {
    class Parametric extends parameterized(Base, { T: Object }) {}

    it('can fetch the type parameters', function() {
      let { T } = params(Parametric);
      expect(T).toBe(types.Object);
    });

    describe('overiding the defaults of a parameterized type', () => {
      it('can override the first parameter', function() {
        let { T } = params(parameterized(Parametric, String));
        expect(T).toBe(types.String);
      });

      it('can override a single parameter by name', function() {
        let { T } = params(parameterized(Parametric, {T: Number}));
        expect(T).toBe(types.Number);
      });

      it('ignores parameters that are beyond the index', function() {
        expect(params(parameterized(Parametric, String))).toEqual({
          T: types.String
        });
      });
    });

  });

});
