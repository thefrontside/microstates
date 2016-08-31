import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import State from '../src/state';

describe("Transitions", function() {
  describe("transitions that only 'patch' an object", function() {
    let switchboard;
    beforeEach(function() {
      const Switchboard = State.extend({
        transitions: {
          toggleLeft(current) {
            return { left: !current.left };
          },
          toggleRight(current) {
            return { right: !current.right };
          }
        }
      });
      switchboard = new Switchboard({left: false, right: false});
    });
    it("applies the 'patch', and leaves the other properties in place", function() {
      expect(switchboard.toggleLeft().valueOf()).to.deep.equal({left: true, right: false});
    });
  });
});
