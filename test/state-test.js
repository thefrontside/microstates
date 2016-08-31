import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import State from '../src/state';

describe("The Basic Opaque State", function() {
  let state, value, next;

  describe("wrapping a primitive value in a State", function() {
    beforeEach(function() {
      state = new State(5);
    });

    it("has that value as its primitive value", function() {
      expect(state.valueOf()).to.eq(5);
    });
    it("has no enumerable keys", function() {
      expect(Object.keys(state)).to.deep.equal([]);
    });
  });

  describe("wrapping an object value in a State", function() {
    let object;
    beforeEach(function() {
      object = { ohai: 'There', hello: 'World' };
      state = new State(object);
    });

    it("has that object as its primitive value", function() {
      expect(state.valueOf()).to.eq(object);
    });

    it("has the enumerable keys of the object value", function() {
      expect(Object.keys(state)).to.deep.equal(['ohai', 'hello']);
    });

    it("has the same property values as the object value", function() {
      expect(state.ohai).to.equal('There');
      expect(state.hello).to.equal('World');
    });

    describe("setting the value to a new object", function() {
      beforeEach(function() {
        next = state.set({totally: 'different'});
      });

      it("creates a completely new state", function() {
        expect(next).not.to.eq(state);
      });
      it("no longer has any of the old properties", function() {
        expect(next.ohai).to.equal(undefined);
        expect(next.hello).to.equal(undefined);
      });
      it("has the properties of the new object", function() {
        expect(next.totally).to.equal('different');
      });
      it("has the enumerable keys of the new object", function() {
        expect(Object.keys(next)).to.deep.equal(['totally']);
      });
    });

    describe("assigning new properties to the state", function() {
      beforeEach(function() {
        next = state.assign({ how: 'do you do?'});
      });
      it("maintains the list of old properties", function() {
        expect(next.ohai).to.equal('There');
        expect(next.hello).to.equal('World');
      });
      it("adds the new property", function() {
        expect(next.how).to.equal('do you do?');
      });
      it("has the new enumerable key", function() {
        expect(Object.keys(next)).to.deep.equal(['ohai', 'hello', 'how']);
      });
    });

    describe("putting a single property into the state", function() {
      beforeEach(function() {
        next = state.put('how', 'do you do?');
      });
      it("maintains the list of old properties", function() {
        expect(next.ohai).to.equal('There');
        expect(next.hello).to.equal('World');
      });
      it("adds the new property", function() {
        expect(next.how).to.equal('do you do?');
      });
      it("has the new enumerable key", function() {
        expect(Object.keys(next)).to.deep.equal(['ohai', 'hello', 'how']);
      });
    });

    describe("deleting a property", function() {
      beforeEach(function() {
        next = state.delete('ohai');
      });
      it("removes that property", function() {
        expect(next.ohai).to.equal(undefined);
      });
      it("maintains the other properties", function() {
        expect(next.hello).to.equal('World');
      });
      it("only has the remaining property name in its enumerable ", function() {
        expect(Object.keys(next)).to.deep.equal(['hello']);
      });
    });

    describe("with pre-defined properties", function() {
      const Thing = State.extend({
        one: 1,
        two: 2
      });
      let thing;
      beforeEach(function() {
        thing = new Thing();
      });

      it("has those properties by default", function() {
        expect(thing.one).to.equal(1);
        expect(thing.two).to.equal(2);
      });

      describe("assigning to one of the values", function() {
        let next;
        beforeEach(function() {
          next = thing.assign({ one: 'one'});
        });

        it("changes the value of the one property", function() {
          expect(next.one).to.equal('one');
        });
        it("leaves the unassigned value alone", function() {
          expect(next.two).to.equal(2);
        });
        it("does not change the original (of course)", function() {
          expect(thing.one).to.equal(1);
        });
      });
    });

    describe("trying to manipulate properties directly on a state", function() {
      let edit, add, remove;
      beforeEach(function() {
        try { state.ohai = 'blork'; } catch(e) { edit = e; }
        try { state.say = 'what?'; } catch(e) { add = e; }
        try { delete state.hello; } catch(e) { remove = e; }
      });
      it("fails because the state is immutable 🙌", function() {
        expect(edit).to.be.instanceof(TypeError);
        expect(add).to.be.instanceof(TypeError);
        expect(remove).to.be.instanceof(TypeError);
      });
    });
  });
});
