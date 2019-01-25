/* global describe, it, beforeEach */
import expect from 'expect';
import { create } from '../../index';

describe("number", () => {
  let zero, ten, str;
  beforeEach(() => {
    zero = create(Number);
    ten = create(Number, 10);
    str = create(Number, 'hello');
  });

  it("has transitions", () => {
    expect(zero).toMatchObject({
      set: expect.any(Function),
      increment: expect.any(Function),
      decrement: expect.any(Function)
    });
  });

  describe("without value", () => {
    it("has state", () => {
      expect(zero.state).toBe(0);
    });

    it("increment", () => {
      expect(zero.increment().state).toBe(1);
    });

    it("decrement", () => {
      expect(zero.decrement().state).toBe(-1);
    });

    it("increment passed a value", ()=> {
      expect(zero.increment(10).state).toBe(10);
    });
  });

  describe("with value", () => {
    it("has state", () => {
      expect(ten.state).toBe(10);
    });

    it("increment", () => {
      expect(ten.increment().state).toBe(11);
    });

    it("decrement", () => {
      expect(ten.decrement().state).toBe(9);
    });

    it("decrement passed a value", () => {
      expect(ten.decrement(10).state).toBe(0);
    });
  });

  describe("with a NaN value", () => {
    it("has state", () => {
      expect(str.state).toBe(NaN);
    });
  });
});
