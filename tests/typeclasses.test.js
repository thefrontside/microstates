import "jest";
import { map } from "funcadelic";
import create, * as MS from "../src";
import { flatMap } from '../src/monad';
import { Microstate } from "../src/microstate";

describe("typeclasses", () => {
  class Home {
    city = MS.String;
  }

  class Person {
    name = MS.String;
    home = Home;
  }

  let simple, complex;
  beforeEach(() => {
    simple = create(MS.Number, 10);
    complex = create(Person, { name: "Taras", home: { city: "Toronto" } });
  })

  describe("functor", function() {  
    let simpleUnchanged, complexUnchanged;
    beforeEach(() => {  
      simpleUnchanged = map(node => node, simple);
      complexUnchanged = map(node => node, complex);
    });
  
    it("is different than original object", () => {
      expect(simpleUnchanged).not.toBe(simple);
      expect(complexUnchanged).not.toBe(complex);
    });
  
    it("returns an instance of microstate", () => {
      expect(simpleUnchanged).toBeInstanceOf(Microstate);
      expect(complexUnchanged).toBeInstanceOf(Microstate);
    });
  
    it("unchangd maintains same value", function() {
      expect(simpleUnchanged.state).toBe(10);
      expect(complexUnchanged.state).toEqual({
        name: "Taras",
        home: { city: "Toronto" }
      });
    });
  });

});
