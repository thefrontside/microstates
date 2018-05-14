import 'jest';

import { create } from 'microstates';

describe('string without value', () => {
  let string;
  beforeEach(() => {
    string = create(String);
  });

  it('has state', () => {
    expect(string.state).toBe('');
  });

  it('has value', () => {
    expect(string.valueOf()).toBe('');
  });

  describe('concat', () => {
    let concatted;
    beforeEach(() => {
      concatted = string.concat('hello world');
    });

    it('has state', () => {
      expect(concatted.state).toBe('hello world');
    });    

    it('has value', () => {
      expect(concatted.valueOf()).toBe('hello world');
    });
  });
});

describe('string with value', () => {
  let string;
  beforeEach(() => {
    string = create(String, 'hello world');
  });

  it('has state', () => {
    expect(string.state).toBe('hello world');
  });

  it('has value', () => {
    expect(string.valueOf()).toBe('hello world');
  });

  describe('concat', () => {
    let concatted;
    beforeEach(() => {
      concatted = string.concat('!!!');
    });

    it('has state', () => {
      expect(concatted.state).toBe('hello world!!!');
    });    

    it('has value', () => {
      expect(concatted.valueOf()).toBe('hello world!!!');
    });
  });

});

