/* global describe, it, beforeEach */
import expect from 'expect';
import { create } from '../../index';

describe("number", () => {
  let zero, ten;
  beforeEach(() => {
    zero = create(Number);
    ten = create(Number, 10);
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
  });
});
