import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import { StringState } from 'microstates';
import { MicroState } from 'microstates';

describe("StringState", function() {
  it("is a microstate", function() {
    expect(new StringState()).to.be.instanceOf(MicroState);
  });
  it("is an instance of StringState", function() {
    expect(new StringState()).to.be.instanceOf(StringState);
  });

  describe("with an initial value", function() {
    beforeEach(function() {
      this.string = new StringState('Hello World');
    });

    it("works", function() {
      expect(this.string.valueOf()).to.equal('Hello World');
    });
  });
});