/* global describe, beforeEach, it */

import expect from 'expect';

import Pathmap, { idOf, current } from '../src/pathmap';
import { valueOf, BooleanType, ArrayType, NumberType } from '../index';

describe('pathmap', ()=> {

  let pathmap;
  let LightSwitch;
  let ref;
  let id;
  let hall;
  let closet;

  beforeEach(()=> {
    ref = Ref({});
    LightSwitch = class LightSwitch {
      hall = Boolean;
      closet = Boolean;
    };
    pathmap = Pathmap(LightSwitch, ref);
    id = idOf(pathmap);
    hall = id.hall;
    closet = id.closet;
  });

  it('exists', () => {
    expect(pathmap).toBeDefined();
  });
  it('has an id delegate which is represents the microstate at the base path', ()=> {
    expect(id).toBeInstanceOf(LightSwitch);
    expect(valueOf(id)).toBe(ref.get());
  });

  it('has children corresponding to the shit to the substates', ()=> {
    expect(id.hall).toBeInstanceOf(BooleanType);
    expect(id.closet).toBeInstanceOf(BooleanType);
  });

  describe('transitioning a substate', ()=> {
    beforeEach(()=> {
      id.hall.set(true);
    });
    it('updates the reference', ()=> {
      expect(ref.get()).toEqual({
        hall: true
      });
    });
    it('changes the object representing the reference to the toggled switch', ()=> {
      expect(current(id).hall).not.toBe(hall);
    });
    it('changes the root reference if you fetch it again from the pathmap', ()=> {
      expect(idOf(pathmap)).not.toBe(id);
    });
    it('leaves the object representing the un-touched switch to be the same', ()=> {
      expect(id.closet).toBe(closet);
    });

    it('can fetch the current value based off of the old one.', ()=> {
      expect(current(hall)).toBe(current(id).hall);
      expect(current(id)).toBe(idOf(pathmap));
    });

    it('keeps all the methods stable at each location.', ()=> {
      expect(hall.set).toBe(id.hall.set);
    });
  });

  describe('working with arrays', ()=> {
    beforeEach(()=> {
      pathmap = Pathmap(ArrayType.of(Number), Ref([1, 2, 3]));
      id = idOf(pathmap);
    });
    it('creates a proxy object for all of its children', ()=> {
      let [ one, two, three ] = id;
      expect(one).toBeInstanceOf(NumberType);
      expect(one.constructor.name).toBe('Id<Number>');
      expect(two).toBeInstanceOf(NumberType);
      expect(two.constructor.name).toBe('Id<Number>');
      expect(three).toBeInstanceOf(NumberType);
      expect(three.constructor.name).toBe('Id<Number>');
    });

    describe('transitioning one of the contents', ()=> {
      let first, second, third;
      beforeEach(()=> {
        let [one, two, three] = id;
        first = one;
        second = two;
        third = three;
        two.increment();
      });
      it('changes the root id', ()=> {
        expect(current(id)).not.toBe(id);
      });
      it('changes the array member that changed.', ()=> {
        expect(current(second)).not.toBe(second);
      });
      it('leaves the remaining children that did not change alone', ()=> {
        expect(current(first)).toBe(first);
        expect(current(third)).toBe(third);
      });
    });

  });

});

function Ref(value) {
  let ref = {
    get() { return value; },
    set(newValue) {
      value = newValue;
      return ref;
    }
  };
  return ref;
}
