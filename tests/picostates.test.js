import { expect } from 'chai';
import { create, Any, Meta } from '../src/picostates';

describe("Picostates", () => {
  describe("default", () => {
    let def;
    beforeEach(function() {
      def = create();
    });
    it('is an instance of Any', function() {
      expect(def).to.be.instanceof(Any);
    });
    it('has an undefined state', function() {
      expect(def.state).to.be.undefined;
    });
  })
  describe('Any', function() {
    let any;
    beforeEach(function() {
      any = create(Any, 'ohai');
    });
    it('has the value as its state', function() {
      expect(any.state).to.equal('ohai');
    });
    describe('setting the value to a different value', function() {
      let next;
      beforeEach(function() {
        next = any.set('ohai there');
      });
      it('returns a new object', function() {
        expect(next).not.to.equal(any);
      });
      it('has the new value as its state', function() {
        expect(next.state).to.equal('ohai there');
      });
    });
    describe('setting the value to the same value', function() {
      let next;
      beforeEach(function() {
        next = any.set('ohai');
      });
      it('returns the same object', function() {
        expect(next).to.equal(any);
      });
    });
  });
  describe('Something containing something else', function() {
    class Something extends Any {
      any = create(Any, "ohai");
    }
    describe('when created with something else', function() {
      let something
      beforeEach(function() {
        something = create(Something, { any: "ohai there" });
      });
      it('properly initializes substates', function() {
        expect(something.any.state).to.equal("ohai there");
      });

      describe('setting the nested object', function() {
        let next;

        beforeEach(function() {
          next = something.any.set("ohai boss");
        });
        it('returns a new instance of the something', function() {
          expect(next).to.be.instanceof(Something);
        });
        it('contains a fully realized state with the update', function() {
          expect(next.state).to.deep.equal({any: "ohai boss"});
        });
        it('updates the state of the nested object', function() {
          expect(next.any.state).to.equal('ohai boss');
        });
      });
    });
  });

  describe('Nested Picostates with Custom transitions', function() {
    class BooleanType extends Any {
      toggle() {
        return this.set(!this.state);
      }
    }

    class Modal extends Any {
      isOpen = create(BooleanType, false);

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
          .warning.show()
      }
    }

    let modal;
    beforeEach(function() {
      modal = create(Modal, { isOpen: false });
    });
    it('can transition', function() {
      let next = modal.show();
      expect(next).to.be.instanceof(Modal);
      expect(next.state).to.deep.equal({ isOpen: true });
    });

    describe('nested within nested transitions', function() {
      let app;
      beforeEach(function() {
        app = create(App).openAll();
      });
      it('returns an App', function() {
        expect(app).to.be.instanceof(App);
      });
      it('has the right state', function() {
        expect(app.state).to.deep.equal({ error: { isOpen: true }, warning: { isOpen: true }});
      });
    });
  });

})

function context(object) {
  return Meta.get(object).context
}
