import 'jest';

import microstates from '../../src/microstates';
import valueOf from '../../src/utils/valueOf';

describe('valueOf', () => {
  describe('on parameterized array', () => {
    it('is present', () => {
      let { state } = microstates([String]);
      expect(state.valueOf).toBeDefined();
    });
    it('returns null without initial value', () => {
      let { state } = microstates([String]);
      expect(state.valueOf()).toBeUndefined();
    });
    it('returns value with initial value', () => {
      let { state } = microstates([String], ['hello', 'world']);
      expect(state.valueOf()).toEqual(['hello', 'world']);
    });
  });
  describe('on composed state', () => {
    describe('shallow', () => {
      class Foo {
        name = String;
      }
      it('is present', () => {
        let { state } = microstates(Foo);
        expect(state.valueOf).toBeDefined();
      });
      it('returns null without initial value', () => {
        let { state } = microstates(Foo);
        expect(state.valueOf()).toBeUndefined();
      });
      it('returns initial value', () => {
        let { state } = microstates(Foo, { name: 'foo' });
        expect(state.valueOf()).toEqual({ name: 'foo' });
      });
    });
    describe('deep', () => {
      class Foo {
        name = String;
        foo = Foo;
      }
      it('is present', () => {
        let { state } = microstates(Foo);
        expect(state.foo.valueOf).toBeDefined();
      });
      it('returns null without initial value', () => {
        let { state } = microstates(Foo);
        expect(state.foo.valueOf()).toBeUndefined();
      });
      it('returns intial value', () => {
        let { state } = microstates(Foo, { name: 'foo', foo: { name: 'bar' } });
        expect(state.valueOf()).toEqual({ name: 'foo', foo: { name: 'bar' } });
        expect(state.foo.valueOf()).toEqual({ name: 'bar' });
      });
    });
  });
  describe('circular reference', () => {
    describe('parameterized array', () => {
      class Thing {
        name = String;
        related = [Thing];
      }
      let ms;
      beforeEach(() => {
        ms = microstates(Thing, { name: 'MacBook', related: [{ name: 'iPhone' }] });
      });
      it('deserializes circular reference in parameterized array', () => {
        expect(valueOf(ms.state)).toEqual({
          name: 'MacBook',
          related: [{ name: 'iPhone' }],
        });
      });
    });
    describe('composed state', () => {
      class Thing {
        name = String;
        related = Thing;
      }
      let ms;
      beforeEach(() => {
        ms = microstates(Thing, { name: 'MacBook', related: { name: 'iPhone' } });
      });
      it('deserializes circular reference to an object', () => {
        expect(valueOf(ms.state)).toEqual({
          name: 'MacBook',
          related: { name: 'iPhone' },
        });
      });
    });
  });
});
