/* global describe, beforeEach, it */

import expect from 'expect';

import Pathmap, { idOf, current } from '../src/pathmap';
import { valueOf, BooleanType } from '../index';

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
      expect(id.hall).not.toBe(hall);
    });
    it('changes the root reference if you fetch it again from the pathmap', ()=> {
      expect(idOf(pathmap)).not.toBe(id);
    });
    it('leaves the object representing the un-touched switch to be the same', ()=> {
      expect(id.closet).toBe(closet);
    });

    it('can fetch the current value based off of the old one.', ()=> {
      expect(current(hall)).toBe(id.hall);
      expect(current(id)).toBe(idOf(pathmap));
    });

    it('keeps all the methods stable at each location.', ()=> {
      expect(hall.set).toBe(id.hall.set);
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
