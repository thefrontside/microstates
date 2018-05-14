import 'jest';

import { create } from 'microstates';

describe('boolean', () => {
  let boolean;
  beforeEach(() => {
    boolean = create(Boolean);
  });

  it('has state', () => {
    expect(boolean.state).toBe(false);
  });

  it('has value', () => {
    expect(boolean.valueOf()).toBe(false);
  });

  describe('toggle', () => {
    let toggled;
    beforeEach(() => {
      toggled = boolean.toggle();
    });

    it('has state', () => {
      expect(toggled.state).toBe(true);
    });    

    it('has value', () => {
      expect(toggled.valueOf()).toBe(true);
    });
  });

});
