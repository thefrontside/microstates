import expect from 'expect';
import { create } from "../index";

describe("type-shifting", () => {
  class Shape {
    initialize({ a, b, c } = {}) {
      if (a && b && c) {
        return create(Triangle, { a, b, c });
      }
      if (a && b) {
        return create(Angle, { a, b });
      }
      if (a) {
        return create(Line, { a });
      }
      return this;
    }
  }

  class Line extends Shape {
    a = Number;
    add(b) {
      let { a } = this.state;
      return create(Angle, { a, b });
    }
  }

  class Angle extends Line {
    a = Number;
    b = Number;
    add(c) {
      let { a, b } = this.state;
      return create(Triangle, { a, b, c });
    }
  }

  class Triangle extends Angle {
    c = Number;
  }

  class Glass {
    shape = Shape;
  }

  describe("create", function() {
    it("can initialize to itself", () => {
      let shape = create(Shape, {});
      expect(shape).toBeInstanceOf(Shape);
    });

    it("initializes to first type", () => {
      let triangle = create(Shape, { a: 10, b: 20, c: 30 });
      expect(triangle).toBeInstanceOf(Triangle);
      expect(triangle.state).toMatchObject({
        a: 10,
        b: 20,
        c: 30,
      });
    });

    it("initializes to second type", () => {
      let angle = create(Shape, { a: 10, b: 20 });
      expect(angle).toBeInstanceOf(Angle);
      expect(angle.state).toMatchObject({
        a: 10,
        b: 20,
      });
    });

    it(`can be initialized from descendant's create`, function() {
      let line = create(Line, { a: 10 });
      expect(line).toBeInstanceOf(Line);
      expect(line.state).toMatchObject({
        a: 10,
      });
    });

    it("is used to initialize composed object", function() {
      let composed = create(Glass, { shape: { a: 10, b: 20, c: 30 } });
      expect(composed.shape).toBeInstanceOf(Triangle);
      expect(composed.state).toMatchObject({
        shape: {
          a: 10,
          b: 20,
          c: 30,
        },
      });
    });

    it("supports being initialized in parameterized arrays", () => {
      class Drawing {
        shapes = [Shape];
      }
      let drawing = create(Drawing, { shapes: [{ a: 10 }, { a: 20, b: 30 }, { a: 100, b: 200, c: 300 }] });
      expect(drawing.shapes[0]).toBeInstanceOf(Line);
      expect(drawing.shapes[1]).toBeInstanceOf(Angle);
      expect(drawing.shapes[2]).toBeInstanceOf(Triangle);
    });

    describe("can type-shift into a parameterized type", () => {
      class Container {
        static create(content) {
          if (Array.isArray(content)) {
            return create([String], content);
          } else {
            return create({ String }, content);
          }
        }
      }
      it("can initialize into a parameterized array", () => {
        let array = Container.create(["a", "b", "c"]);
        expect(array.state).toMatchObject(["a", "b", "c"]);
        expect(array[0].concat).toBeInstanceOf(Function);
      });
      it("can initialize into a parameterized object", () => {
        let object = Container.create({ a: "A", b: "B", c: "C" });
        expect(object.state).toMatchObject({ a: "A", b: "B", c: "C" });
        expect(object.a.concat).toBeInstanceOf(Function);
      });
    });
  });

  describe("transitions", function() {
    let ms = create(Line);
    let line, corner, triangle;
    beforeEach(() => {
      line = ms.a.set(10);
      corner = line.add(20);
      triangle = corner.add(30);
    });
    it("constructs a line", () => {
      expect(line).toBeInstanceOf(Line);
      expect(line.state).toMatchObject({
        a: 10,
      });
    });
    it("constructs a Corner", () => {
      expect(corner).toBeInstanceOf(Angle);
      expect(corner.state).toMatchObject({
        a: 10,
        b: 20,
      });
    });
    it("constructs a Triangle", () => {
      expect(triangle).toBeInstanceOf(Triangle);
      expect(triangle.state).toMatchObject({
        a: 10,
        b: 20,
        c: 30,
      });
    });
    it("can be done down tree", () => {
      let string = create(String, "100");
      let cString = triangle.c.set(string);
      expect(cString.state.c).toBe("100");
      expect(cString.c.concat).toBeDefined();
    });
  });
});

describe("type-shifting with constant values", () => {
  class Async {
    content = null;
    isLoaded = false;
    isLoading = false;
    isError = false;

    loading() {
      return create(AsyncLoading, {});
    }
  }

  class AsyncError extends Async {
    isError = true;
    isLoading = false;
    isLoaded = true;
  }

  class AsyncLoading extends Async {
    isLoading = true;

    loaded(content) {
      return create(
        class extends AsyncLoaded {
          content = content;
        }, {}
      );
    }

    error(msg) {
      return create(
        class extends AsyncError {
          error = msg;
        }, {}
      );
    }
  }

  class AsyncLoaded extends Async {
    isLoaded = true;
    isLoading = false;
    isError = false;
  }
  describe("successful loading siquence", () => {
    let async;
    beforeEach(function() {
      async = create(Async);
    });

    it("can transition to loading", () => {
      let loading = async.loading();
      expect(loading.content.state).toEqual(null);
      expect(loading.isLoaded.state).toEqual(false);
      expect(loading.isLoading.state).toEqual(true);
      expect(loading.isError.state).toEqual(false);
    });
    it("can transition from loading to loaded", () => {
      let loaded = async.loading().loaded("GREAT SUCCESS");
      expect(loaded.content.state).toEqual("GREAT SUCCESS");
      expect(loaded.isLoaded.state).toEqual(true);
      expect(loaded.isLoading.state).toEqual(false);
      expect(loaded.isError.state).toEqual(false);
    });
  });
  describe("error loading sequence", () => {
    it("can transition from loading to error", () => {
      let errored = create(Async).loading().error(":(");
      expect(errored.content.state).toEqual(null);
      expect(errored.isLoaded.state).toEqual(true);
      expect(errored.isLoading.state).toEqual(false);
      expect(errored.isError.state).toEqual(true);
      expect(errored.error.state).toEqual(":(");
    });
  });
});

describe.skip("type-shifting into a deeply composed microstate", () => {
  class Node {
    name = String;
    node = Node;
  }

  let root;
  beforeEach(() => {
    root = create(Node);
  });

  describe("shifting the root node", () => {
    let shiftedRoot;
    beforeEach(() => {
      shiftedRoot = root.set(create(Node, { name: "n1", node: { name: "n2", node: { name: "n3" } } }));
    });

    it("preserves type shifting value", () => {
      expect(shiftedRoot.state).toMatchObject({
        name: "n1",
        node: { name: "n2", node: { name: "n3" } },
      });
    });

    it("preserves valueOf", () => {
      expect(shiftedRoot.valueOf()).toEqual({
        name: "n1",
        node: { name: "n2", node: { name: "n3" } },
      });
    });
  });

  describe("shifting deeply composted state with new value", () => {
    let shiftedDeeply;
    beforeEach(() => {
      shiftedDeeply = root.node.node.node.set({ name: "soooo deep", node: { name: "one more" } });
    });

    it("preserves type shifting value", () => {
      expect(shiftedDeeply.state).toMatchObject({
        name: "",
        node: {
          name: "",
          node: {
            name: "",
            node: {
              name: "soooo deep",
              node: { name: "one more" }
            },
          },
        },
      });
    });

    it("preserves valueOf", () => {
      expect(shiftedDeeply.valueOf()).toEqual({
        node: { node: { node: { name: "soooo deep", node: { name: "one more" } } } },
      });
    });
  });
});

describe("type-shifting from create to parameterized array", () => {
  class Person {
    name = String;
  }

  class Group {
    members = [Person];

    initialize({ members } = {}) {
      if (!members) {
        return this.members.set([{ name: "Taras" }, { name: "Charles" }, { name: "Siva" }]);
      }
      return this;
    }
  }

  let group;
  let state;

  beforeEach(() => {
    group = create(Group, {});
    state = group.state;
  });

  it("initializes to value", () => {
    expect(state).toMatchObject({
      members: [{ name: "Taras" }, { name: "Charles" }, { name: "Siva" }],
    });
  });

  it("provides data to parameterized array", () => {
    expect(group.state.members).toHaveLength(3);
    expect(group.state).toMatchObject({
      members: [{ name: "Taras" }, { name: "Charles" }, { name: "Siva" }],
    });
    expect(group.members[0]).toBeInstanceOf(Person);
  });

  describe("transitioning shifted value", () => {
    let acclaimed;
    let state;

    beforeEach(() => {
      acclaimed = group.members[1].name.set("!!Charles!!");
      state = acclaimed.state;
    });

    it("has the transitioned state", () => {
      expect(acclaimed.state).toMatchObject({
        members: [{ name: "Taras" }, { name: "!!Charles!!" }, { name: "Siva" }],
      });
    });

    it("carries the value of", () => {
      expect(state).toEqual({
        members: [{ name: "Taras" }, { name: "!!Charles!!" }, { name: "Siva" }],
      });
    });

    it("has a POJO as value", () => {
      let descriptor = Object.getOwnPropertyDescriptor(state, "members");
      expect(descriptor).toHaveProperty("value", [{ name: "Taras" }, { name: "!!Charles!!" }, { name: "Siva" }]);
      expect(descriptor.get).toBeUndefined();
    });
  });
});

describe("type-shifting from create to parameterized object", () => {
  class Parent {
    name = String;
  }
  class Person {
    parents = { Parent };

    initialize({ parents } = {}) {
      if (!parents) {
        return create(Person, {
          parents: {
            father: {
              name: "John Doe",
            },
            mother: {
              name: "Jane Doe",
            },
          },
        });
      }
      return this;
    }
  }

  let person;
  beforeEach(() => {
    person = create(Person);
  });

  it("has name with initial values", () => {
    expect(person.parents.father).toBeInstanceOf(Parent);
    expect(person.state).toMatchObject({
      parents: {
        father: {
          name: "John Doe",
        },
        mother: {
          name: "Jane Doe",
        },
      },
    });
  });
});
