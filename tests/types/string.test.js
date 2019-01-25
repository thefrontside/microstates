/* global describe, it, beforeEach */
import expect from 'expect';
import { create } from '../../index';

describe('string without value', () => {
  let string;
  beforeEach(() => {
    string = create(String);
  });

  it('has state', () => {
    expect(string.state).toEqual('');
  });

  describe('concat', () => {
    let concatted;
    beforeEach(() => {
      concatted = string.concat('hello world');
    });

    it('has state', () => {
      expect(concatted.state).toBe('hello world');
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

  describe('concat', () => {
    let concatted;
    beforeEach(() => {
      concatted = string.concat('!!!');
    });

    it('has state', () => {
      expect(concatted.state).toBe('hello world!!!');
    });
  });
});
