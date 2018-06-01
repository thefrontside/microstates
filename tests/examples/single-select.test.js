import "jest";
import { create, types, parameterized, reveal } from "microstates";
import { map } from "funcadelic";

class Color {}

function selectMiddleware(next) {
  return (microstate, transition, args) => {
    console.log(reveal(microstate).root.value, transition.name);
    return next(microstate, transition, args);
  };
}

class SingleSelect {
  static of(Type) {
    class ChoosableType extends Type {
      isSelected = Boolean;
      value = types.Any;

      choose() {
        return this.isSelected.toggle();
      }
    }

    class SingleSelectList extends parameterized(Array, ChoosableType) {
      initialize() {
        return map(root => {
          return map(child => {
            return map(tree => {
              if (tree.meta.InitialType === ChoosableType) {
                return tree.use(selectMiddleware);
              } else {
                return tree;
              }
            }, child);
          }, root);
        }, this);
      }
    }

    return SingleSelectList;
  }
}

// return map(root => {
//   return map(child => {
//     return map(tree => {
//       if (tree.meta.InitialType === ChoosableType) {
//         return tree.use(selectMiddleware);
//       } else {
//         return tree;
//       }
//     }, child);
//   }, root);
// }, this);

class Form {
  colors = SingleSelect.of(Color);
}

describe("single select", () => {
  let form;
  beforeEach(() => {
    form = create(Form, {
      colors: [{ value: "red" }, { value: "green" }, { value: "blue" }]
    });
  });

  it("has 3 options", () => {
    expect(form.colors.length).toBe(3);
  });

  it("has colors", () => {
    expect(form.colors[0].state).toBeInstanceOf(Color);
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
  });
});
