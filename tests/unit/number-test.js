import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import { NumberState } from 'microstates';
import { MicroState } from 'microstates';

describe("NumberState", function() {
  let state;
  beforeEach(function() {
    state = new NumberState();
  });
  it("is an instanceof MicroState", function() {
    expect(state).to.be.instanceOf(NumberState);
  });
  it("is an instanceof NumberState", function() {
    expect(state).to.be.instanceOf(MicroState);
  });
  it("defaults to zero", function() {
    expect(state.valueOf()).to.equal(0);
  });
  it("has a string value of zero", function() {
    expect(state.toString()).to.equal('0');
  });

  describe("adding a number", function() {
    beforeEach(function() {
      state = state.add(5);
    });
    it("contains the new value", function() {
      expect(state.valueOf()).to.equal(5);
    });
    it("can also be added to other primitive numbers", function() {
      expect(state + 5).to.equal(10);
      expect(5 + state).to.equal(10);
    });
  });

  describe("subtracting", function() {
    beforeEach(function() {
      state = state.subtract(5);
    });
    it("works", function() {
      expect(state.valueOf()).to.equal(-5);
    });
    it("works as a primitive", function() {
      expect(state - 5).to.equal(-10);
      expect(5 - state).to.equal(10);
    });
  });

});
