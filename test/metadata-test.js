import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import State from '../src/state';

describe("Metadata", function() {
  it("has a list of own transitions", function() {
    expect(Object.keys(State.metadata.transitions)).to.deep.equal(['set', 'assign', 'put', 'delete']);
  });

  describe("of a subtype", function() {
    let Type = State.extend({
      transitions: {
        one() { return 1; }
      }
    }).extend({
      transitions: {
        two() { return 2; }
      }
    });
    it("contains the transitions of all types", function() {
      expect(Object.keys(Type.metadata.transitions)).to.deep.equal(['two', 'one', 'set', 'assign', 'put', 'delete']);
    });

  });

});
