import "jest";
import { map, flatMap } from "funcadelic";
import Microstate, { create }  from "microstates";

describe("typeclasses", () => {
  class Home {
    city = String;
    population = Number;

    grow(size) {
      return this.population.set(size);
    }
  }

  class Person {
    name = String;
    home = Home;
  }

  describe('mapped object', () => {
    let fn, mapped;
    beforeEach(() => {
      fn = jest.fn().mockImplementation(v => v);
      let ms = create(Person, { name: "Taras", home: { city: "Toronto" } });
      mapped = map(fn, ms);
    });
  
    it('has composed objects', () => {
      // console.log(typeof mapped.home)/
      expect(mapped.home).toBeDefined()
      expect(mapped.home.set).toBeDefined();
    });
  
    it('kept the valueOf', () => {
      expect(mapped.valueOf()).toEqual({ name: "Taras", home: { city: "Toronto" } });
    });
  })

  describe('callback', function() {
    let fn, mapped, m1, m2;
    beforeEach(() => {
      fn = jest.fn(transition => (...args) => {
        let next = transition(...args);
        return map(fn, next);
      });

      let ms = create(Person, { name: "Taras", home: { city: "Toronto" } });

      mapped = map(fn, ms);

      m1 = mapped.home.city.set('Austin');
      m2 = m1.name.set('Charles');
    });

    it('invoked callback for each transition', () => {
      expect(fn.mock.calls[0][0]).toBeInstanceOf(Function);
      expect(fn.mock.calls[1][0]).toBeInstanceOf(Function);
    });
  });

  describe('setState', function() {
    let last, setState = ms => last = ms;

    beforeEach(() => {
      last = null;

      let ms = create(Person, { name: "Taras", home: { city: "Toronto" } });

      let setStateOnTransition = transition => (...args) => {
        let next = transition(...args);
        let mapped = map(setStateOnTransition, next);
        setState(mapped);
        return mapped;
      };

      setState(map(setStateOnTransition, ms));

      last.name.set('Charles');
      last.home.city.set('Austin');
      last.home.grow(1);
    });

    it('accumulated changed', function() {
      expect(last.valueOf()).toEqual({ name: 'Charles', home: { city: 'Austin', population: 1 }});
    });
  });
});
