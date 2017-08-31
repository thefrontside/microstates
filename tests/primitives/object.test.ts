import 'jest';
import MicrostateString from '../../src/primitives/string';
import MicrostateObject from '../../src/primitives/object';
import microstates from '../../src/microstates';
import { isMicrostateAction } from '../../src/constants';

describe('object', () => {
  describe('as root', () => {
    it('can be created without default', () => {
      let { state, actions } = microstates(Object);
      expect(state).toEqual({});
      expect(actions.assign.isMicrostateAction).toBe(isMicrostateAction);
    });
    it('can be created with default', () => {
      let { state } = microstates(Object, { foo: 'bar' });
      expect(state).toEqual({ foo: 'bar' });
    });
  });

  describe('set action', () => {
    let ms;
    beforeEach(() => {
      ms = microstates(Object);
    });
    it('does not throw on null', () => {
      expect(() => {
        ms.actions.set(null);
        ms.actions.set('');
        ms.actions.set(new MicrostateString('foo'));
        ms.actions.set(new MicrostateObject({ foo: 'bar' }));
      }).not.toThrow();
    });
  });
});
