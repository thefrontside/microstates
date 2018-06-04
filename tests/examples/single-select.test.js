import "jest";
import { create, types, parameterized, Tree } from "microstates";
import { map, foldl } from "funcadelic";
import over from 'ramda/src/over';
import values from '../../src/values';
class Color {}

function selectMiddleware(next, tree) {
  return (microstate, transition, args) => {
    let focus = Tree.from(microstate);

    let isChildFocused = foldl((isChild, child) => {
      return isChild ? true : focus.is(child);
    }, false, values(tree.children));

    if (transition.name === 'choose' && isChildFocused) {
      return tree.microstate.map(selectable => {
        let current = Tree.from(selectable);
        if (current.is(focus)) {
          return current.microstate.isSelected.set(true);
        } else if (current.microstate.isSelected.state) {
          return current.microstate.isSelected.set(false);
        } else {
          return current.microstate;
        }
      });
    } else {
      return next(microstate, transition, args);
    }
  };
}

class SingleSelect {
  static of(Type) {
    class Selectable {
      isSelected = Boolean;
      item = Type;

      choose() {
        return this.isSelected.toggle();
      }

      static get toString() {
        return `Selectable<${Type.name}>`;
      }
    }

    class SingleSelectList extends parameterized(Array, Selectable) {
      initialize() {
        return map(root => root.use(selectMiddleware), this);
      }
    }

    return SingleSelectList;
  }
}

class Form {
  colors = SingleSelect.of(Color);
}

describe("single select", () => {
  let form;
  beforeEach(() => {
    form = create(Form, {
      colors: [
        {
          item: { value: "red" }
        },
        {
          item: { value: "green" }
        },
        {
          item: { value: "blue" }
        }
      ]
    });
  });

  it("has 3 options", () => {
    expect(form.colors.length).toBe(3);
  });

  it("has colors", () => {
    expect(form.colors[0].item.state).toBeInstanceOf(Color);
  });

  it("none are selected", () => {
    expect(form.colors[0].isSelected.state).toBe(false);
    expect(form.colors[1].isSelected.state).toBe(false);
    expect(form.colors[2].isSelected.state).toBe(false);
  });

  describe("call choose", () => {
    let chosen;
    beforeEach(() => {
      chosen = form.colors[1].choose();
    });

    it("2nd item is chosen", () => {
      expect(chosen.colors[0].isSelected.state).toBe(false);
      expect(chosen.colors[1].isSelected.state).toBe(true);
      expect(chosen.colors[2].isSelected.state).toBe(false);
    });

    describe('call choose on 2nd item', () => {
      let chosen2;
      beforeEach(() => {
        chosen2 = chosen.colors[2].choose();
      });

      it("3nd item is chosen, 2nd is not chosen", () => {
        expect(chosen2.colors[0].isSelected.state).toBe(false);
        expect(chosen2.colors[1].isSelected.state).toBe(false);
        expect(chosen2.colors[2].isSelected.state).toBe(true);
      });

      it('has stable state on unmodifed item', () => {
        expect(chosen.colors[0].state).toBe(chosen2.colors[0].state);
      });

      it('has stable state on modifed item', () => {
        expect(chosen.colors[1].item.state).toBe(chosen2.colors[1].item.state);
        expect(chosen.colors[2].item.state).toBe(chosen2.colors[2].item.state);
      });
    });
  });
});
