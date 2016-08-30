import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import State from '../src/state';

describe("Composition", function() {

  const Switch = State.extend({
    transitions: {
      toggle(current) {
        return !current;
      }
    }
  });

  let _true = new Switch(true);
  let _false = new Switch(false);

  let switchboard = new State({
    left: _true,
    right: _false
  });

  it("starts out with the left true and the right false", function() {
    expect(switchboard.valueOf()).to.deep.equal({
      left: true,
      right: false
    });
  });

  it("lets you toggle switches individually", function() {
    expect(_true.toggle().valueOf()).to.equal(false);
    expect(_false.toggle().valueOf()).to.equal(true);
  });

  describe("toggling the left switch", function() {
    let next;
    beforeEach(function() {
      next = switchboard.left.toggle();
    });
    it("returns a new switchboard with the left toggled", function() {
      expect(next.valueOf()).to.deep.equal({
        left: false,
        right: false
      });
    });
    it("did not change _true", function() {
      expect(_true.valueOf()).to.equal(true);
    });
  });
});
