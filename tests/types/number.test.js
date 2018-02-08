import "jest";

import Microstate from "../../src";

describe("number", () => {
  let zero, ten;
  beforeEach(() => {
    zero = Microstate.create(Number);
    ten = Microstate.create(Number, 10);
  });
  it("has transitions", () => {
    expect(zero).toMatchObject({
      set: expect.any(Function),
      increment: expect.any(Function),
    });
  });
  describe("without value", () => {
    it("has state", () => {
      expect(zero.state).toBe(0);
    });
    it("subtract", () => {
      expect(zero.subtract(5).valueOf()).toBe(-5);
    });
    it("sum", () => {
      expect(zero.sum(5).valueOf()).toBe(5);
    });
    it("increment", () => {
      expect(zero.increment().valueOf()).toBe(1);
    });
    it("decrement", () => {
      expect(zero.decrement().valueOf()).toBe(-1);
    });
  });

  describe("with value", () => {
    it("has state", () => {
      expect(ten.state).toBe(10);
    });
    it("subtract", () => {
      expect(ten.subtract(5).valueOf()).toBe(5);
    });
    it("sum", () => {
      expect(ten.sum(5).valueOf()).toBe(15);
    });
    it("increment", () => {
      expect(ten.increment().valueOf()).toBe(11);
    });
    it("decrement", () => {
      expect(ten.decrement().valueOf()).toBe(9);
    });
  });
});
