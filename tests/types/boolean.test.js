import expect from 'expect';
import { create } from '../../src/microstates';

describe('boolean', () => {
  let boolean;
  beforeEach(() => {
    boolean = create(Boolean);
  });

  it('has state', () => {
    expect(boolean.state).toBe(false);
  });

  describe('toggle', () => {
    let toggled;
    beforeEach(() => {
      toggled = boolean.toggle();
    });

    it('has state', () => {
      expect(toggled.state).toBe(true);
    });
  });

  it('converts falsy values into false', function() {
    expect(boolean.set(null).state).toBe(false)
    expect(boolean.set('').state).toBe(false)
    expect(boolean.set(undefined).state).toBe(false)
    expect(boolean.set(0).state).toBe(false)
  });

  it('converts truthy values into true', function() {
    expect(boolean.set('foo').state).toBe(true);
    expect(boolean.set(1).state).toBe(true);
    expect(boolean.set({}).state).toBe(true);
  });
});
