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

    it("has an equivalent object as its valueOf()", function() {
      expect(state.valueOf()).to.deep.equal(object);
    });

    it('maintains the valueOf across subsequent invocations', function() {
      expect(state.valueOf()).to.equal(state.valueOf());
    });

    it("has the enumerable keys of the object value", function() {
      expect(Object.keys(state)).to.deep.equal(['ohai', 'hello']);
    });

    it("has the same property values as the object value", function() {
      expect(state.ohai).to.be.instanceof(State);
      expect(state.hello).to.be.instanceof(State);
      expect(state.ohai.valueOf()).to.equal('There');
      expect(state.hello.valueOf()).to.equal('World');
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
        expect(next.totally.valueOf()).to.equal('different');
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
        expect(next.ohai.valueOf()).to.equal('There');
        expect(next.hello.valueOf()).to.equal('World');
      });
      it("adds the new property", function() {
        expect(next.how.valueOf()).to.equal('do you do?');
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
        expect(next.ohai.valueOf()).to.equal('There');
        expect(next.hello.valueOf()).to.equal('World');
      });
      it("adds the new property", function() {
        expect(next.how.valueOf()).to.equal('do you do?');
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
        expect(next.hello.valueOf()).to.equal('World');
      });
      it("only has the remaining property name in its enumerable ", function() {
        expect(Object.keys(next)).to.deep.equal(['hello']);
      });
    });

    describe("with pre-defined properties", function() {

      let Thing, thing, value;
      beforeEach(function() {
        Thing = State.extend({
          one: 1,
          two: 2
        });
        thing = new Thing();
      });

      it("has those properties by default", function() {
        expect(thing.one).to.be.instanceOf(State);
        expect(thing.two).to.be.instanceOf(State);
        expect(thing.one.valueOf()).to.equal(1);
        expect(thing.two.valueOf()).to.equal(2);
      });

      it("has those values in its valueOf()", function() {
        expect(thing.valueOf()).to.deep.equal({one: 1, two: 2});
      });

      describe("assigning to one of the values", function() {
        let next;
        beforeEach(function() {
          next = thing.assign({ one: 'one'}).valueOf();
        });

        it("changes the value of the one property", function() {
          expect(next.one.valueOf()).to.equal('one');
        });
        it("leaves the unassigned value alone", function() {
          expect(next.two.valueOf()).to.equal(2);
        });
        it("does not change the original (of course)", function() {
          expect(thing.one.valueOf()).to.equal(1);
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

    describe("overloading valueOf", function() {
      let Speaker, LolSpeaker, said, lols;
      beforeEach(function(){
        Speaker = State.extend({
          message: 'hello world'
        });

        LolSpeaker = Speaker.extend({
          valueOf() {
            return {
              message: `hehe ${this.message} hehe`
            };
          }
        });

        said = new Speaker().valueOf();
        lols = new LolSpeaker().valueOf();
      });

      it.only('has different valueOf', function(){
        expect(said.valueOf()).to.deep.equal({ meesage: 'hello world' }); 
        expect(lols.valueOf()).to.deep.equal({ message: 'hehe hello world hehe'});
      });
    });
  });
});
