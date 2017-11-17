import 'jest';

import * as MS from '../../src';
import overload from '../../src/utils/overload';

describe('Type system', () => {
  class Car {
    color = MS.String;
  }
  class Person {
    firstName = MS.String;
  }
  class State {
    count = MS.Number;
    thing = Car;
  }

  describe('overloading', () => {
    it('staticly with class extend', () => {
      expect(
        new class extends State {
          thing = Person;
        }()
      ).toMatchObject({
        count: MS.Number,
        thing: Person,
      });
    });
    it('programatically with extend function', () => {
      let StateWithPerson = overload(State, 'thing', Person);
      expect(new StateWithPerson()).toMatchObject({
        count: MS.Number,
        thing: Person,
      });
    });
  });
});
