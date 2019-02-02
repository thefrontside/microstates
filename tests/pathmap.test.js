/* global describe, beforeEach, it */

import expect from 'expect';

import Pathmap from '../src/pathmap';
import { valueOf, BooleanType, ArrayType, NumberType } from '../index';

describe('pathmap', ()=> {

  let pathmap;
  let LightSwitch;
  let ref;
  let id;
  let hall;
  let closet;

  let current;
  beforeEach(()=> {
    ref = Ref({});
    LightSwitch = class LightSwitch {
      hall = Boolean;
      closet = Boolean;
    };
    pathmap = Pathmap(LightSwitch, ref);
    id = pathmap.get();
    hall = id.hall;
    closet = id.closet;

    current = pathmap.get;
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
      expect(pathmap.get(id).hall).not.toBe(hall);
    });
    it('changes the root reference if you fetch it again from the pathmap', ()=> {
      expect(pathmap.get()).not.toBe(id);
    });
    it('leaves the object representing the un-touched switch to be the same', ()=> {
      expect(id.closet).toBe(closet);
    });

    it('can fetch the current value based off of the old one.', ()=> {
      expect(current(hall)).toBe(current(id).hall);
      expect(current(id)).toBe(pathmap.get());
    });

    it('keeps all the methods stable at each location.', ()=> {
      expect(hall.set).toBe(id.hall.set);
    });
  });

  describe('working with arrays', ()=> {
    beforeEach(()=> {
      pathmap = Pathmap(ArrayType.of(Number), Ref([1, 2, 3]));
      id = pathmap.get();
    });
    it('creates a proxy object for all of its children', ()=> {
      let [ one, two, three ] = id;
      expect(one).toBeInstanceOf(NumberType);
      expect(one.constructor.name).toBe('Ref<Number>');
      expect(two).toBeInstanceOf(NumberType);
      expect(two.constructor.name).toBe('Ref<Number>');
      expect(three).toBeInstanceOf(NumberType);
      expect(three.constructor.name).toBe('Ref<Number>');
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
