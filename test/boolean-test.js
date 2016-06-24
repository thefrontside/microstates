import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import BooleanState from '../src/boolean';
import MicroState from '../src/microstate';

describe("BooleanState", function() {
  it("is a microstate", function() {
    expect(new BooleanState()).to.be.instanceOf(MicroState);
  });
  it("is an instance of BooleanState", function() {
    expect(new BooleanState()).to.be.instanceOf(BooleanState);
  });

  let bool;
  describe("constructed with `false`", function() {
    beforeEach(function() {
      bool = new BooleanState(false);
    });
    it("has a valueOf `false`", function() {
      expect(bool.valueOf()).to.equal(false);
    });
  });
  describe("constructed with `true`", function() {
    beforeEach(function() {
      bool = new BooleanState(true);
    });
    it("has a valueOf `false`", function() {
      expect(bool.valueOf()).to.equal(true);
    });
  });
  describe("with default constructor", function() {
    beforeEach(function() {
      bool = new BooleanState();
    });
    it("has a string representation of `'false'`", function() {
      expect(bool.toString(), 'false');
    });
    it("has a valueOf `false`", function() {
      expect(bool.valueOf()).to.equal(false);
    });

    describe("toggling", function() {
      beforeEach(function() {
        bool = bool.toggle();
      });

      it("remains an instance of boolean state", function() {
        expect(bool).to.be.instanceOf(BooleanState);
      });

      it("swaps it", function() {
        expect(bool.valueOf()).to.equal(true);
      });
    });

  });
});
