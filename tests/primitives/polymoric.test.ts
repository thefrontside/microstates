import 'jest';

import Polymorphic from '../../src/primitives/polymorphic';

describe('Polymorphic', () => {
  it('exports', () => {
    expect(Polymorphic).toBeDefined();
  });
  describe('inheritance', () => {
    it('throws exception when match is not implemented on child', () => {
      expect(() => {
        (class extends Polymorphic {}.match(null));
      }).toThrowError(/You must implement static match method on a Polymorpic class/);
    });
    it('does not throw when match is impelemented', () => {
      expect(() => {
        class MyClass extends Polymorphic {
          static match(o) {
            return class {};
          }
        }
      }).not.toThrow();
    });
    describe('static `of` method', () => {
      class Item {}
      describe('extends Polymorphic', () => {
        let direct, child, sugar;
        beforeEach(() => {
          direct = Polymorphic.of(Item);
          child = class extends Polymorphic {}.of(Item);
          sugar = class extends Polymorphic {}.of([Item]);
        });
        it('Polymorphic.of returns decendant of Polymorphic class', () => {
          expect(direct.prototype).toBeInstanceOf(Polymorphic);
        });
        it('child class instance of Polymorphic', () => {
          expect(child.prototype).toBeInstanceOf(Polymorphic);
        });
        it('sugar class extends from Polymorphic', () => {
          expect(sugar.prototype).toBeInstanceOf(Polymorphic);
        });
      });
      describe('extends descendant of Polymorphic', () => {
        let direct, child, sugar;
        class Descendant extends Polymorphic {}
        beforeEach(() => {
          direct = Descendant.of(Item);
          child = class extends Descendant {}.of(Item);
          sugar = class extends Descendant {}.of([Item]);
        });
        it('Descendant.of returns decendant of Descendant class', () => {
          expect(direct.prototype).toBeInstanceOf(Descendant);
        });
        it('child class instance of Descendant', () => {
          expect(child.prototype).toBeInstanceOf(Descendant);
        });
        it('sugar class extends from Descendant', () => {
          expect(sugar.prototype).toBeInstanceOf(Descendant);
        });
      });
    });
  });
  describe('of', () => {
    it('has static `of` function', () => {
      expect(Polymorphic.of).toBeDefined();
    });
    it('returns class that extends from current class', () => {});
    describe('sugar for [Type]', () => {
      class Item {}
      let p, matched;
      beforeEach(() => {
        p = Polymorphic.of([Item]);
        matched = p.match({});
      });
      it('automatically creates match static method', () => {
        expect(matched).toBe(Item);
      });
    });
  });
});
