/* global describe, it, beforeEach */
import expect from 'expect';
import { create } from '../src/microstates';
import { valueOf } from '../src/meta';

import Any from '../src/types/any';

describe("Microstates", () => {
  describe("default", () => {
    let def;
    beforeEach(function() {
      def = create();
    });

    it('is an instance of Any', function() {
      expect(def).toBeInstanceOf(Any);
    });

    it('has an undefined state', function() {
      expect(def.state).toBeUndefined();
    });
  });

  describe('Any', function() {
    let any;
    beforeEach(function() {
      any = create(Any, 'ohai');
    });

    it('has the value as its state', function() {
      expect(any.state).toBe('ohai');
    });

    describe('setting the value to a different value', function() {
      let next;
      beforeEach(function() {
        next = any.set('ohai there');
      });

      it('returns a new object', function() {
        expect(next).not.toBe(any);
      });

      it('has the new value as its state', function() {
        expect(next.state).toBe('ohai there');
      });
    });

    describe('setting the value to the same value', function() {
      let next;
      beforeEach(function() {
        next = any.set('ohai');
      });

      it('returns the same object', function() {
        expect(next).toBe(any);
      });
    });
  });

  describe('Something containing something else', function() {
    class Something {
      any = create(Any, "ohai");
    }

    describe('when created with something else', function() {
      let something;
      beforeEach(function() {
        something = create(Something, { any: "ohai there" });
      });

      it('properly initializes substates', function() {
        expect(something.any.state).toBe("ohai there");
      });

      describe('setting the nested object', function() {
        let next;
        beforeEach(function() {
          next = something.any.set("ohai boss");
        });

        it('returns a new instance of the something', function() {
          expect(next).toBeInstanceOf(Something);
        });

        it('contains a fully realized state with the update', function() {
          expect(next.any.state).toEqual("ohai boss");
        });

        it('updates the state of the nested object', function() {
          expect(next.any.state).toBe('ohai boss');
        });
      });

      describe('setting the nested object to the same value', function() {
        let next;
        beforeEach(function() {
          next = something.any.set(5).any.set(5);
        });

        it('maintains its shape', function() {
          expect(next.any.state).toEqual(5);
        });

        it('preserves its === equivalence', function() {
          expect(next.any.set(5).any.set(5)).toBe(next);
        });
      });
    });
  });

  describe('Nested Microstates with Custom transitions', function() {
    class Modal {
      isOpen = create(Boolean, false);

      show() {
        return this.isOpen.set(true);
      }

      hide() {
        return this.isOpen.set(false);
      }
    }

    class App {
      error = create(Modal, { isOpen: false })
      warning = create(Modal, { isOpen: false})

      openAll() {
        return this
          .error.show()
          .warning.show();
      }
    }

    let modal;
    beforeEach(function() {
      modal = create(Modal, { isOpen: false });
    });

    it('can transition', function() {
      let next = modal.show();
      expect(next).toBeInstanceOf(Modal);
      expect(next.isOpen.state).toEqual(true);
    });

    describe('nested within nested transitions', function() {
      let app;
      beforeEach(function() {
        app = create(App).openAll();
      });

      it('returns an App', function() {
        expect(app).toBeInstanceOf(App);
      });

      it('has the right state', function() {
        expect(valueOf(app)).toEqual({ error: { isOpen: true }, warning: { isOpen: true }});
      });
    });
  });
});
