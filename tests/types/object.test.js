import "jest";

import { create, from, reveal, Tree } from "microstates";

describe("created without value", () => {
  class Thing {
    value = String;
  }

  let object;
  beforeEach(() => {
    object = create({ Thing });
  });

  it("has empty object as state", () => {
    expect(object.state).toEqual({});
  });

  describe("assign once", () => {
    let assigned;
    beforeEach(() => {
      assigned = object.assign({ foo: { value: "bar" } });
    });

    it("received the assigned value", () => {
      expect(assigned.valueOf()).toEqual({ foo: { value: "bar" } });
    });

    it("wraps the assigned values the parameterized type", function() {
      expect(assigned.state.foo).toBeInstanceOf(Thing);
      expect(assigned.state.foo.value).toEqual("bar");
    });

    describe("assign twice", () => {
      let assignedAgain;
      beforeEach(() => {
        assignedAgain = assigned.assign({ bar: { value: "baz" } });
      });

      it("received the assigned value", () => {
        expect(assignedAgain.valueOf()).toEqual({
          foo: { value: "bar" },
          bar: { value: "baz" }
        });
      });
      it("maintains stability of the state", function() {
        expect(assignedAgain.state.foo).toBe(assigned.state.foo);
      });
    });
  });
});

describe("created with value", () => {
  let object;
  beforeEach(() => {
    object = create(Object, { foo: { value: "bar" } });
  });

  it("has empty object as state", () => {
    expect(object.state).toEqual({ foo: { value: "bar" } });
  });

  describe("assign once", () => {
    let assigned;
    beforeEach(() => {
      assigned = object.assign({ bar: { value: "baz" } });
    });

    it("received the assigned value", () => {
      expect(assigned.valueOf()).toEqual({
        foo: { value: "bar" },
        bar: { value: "baz" }
      });
    });

    describe("assign twice", () => {
      let assignedAgain;
      beforeEach(() => {
        assignedAgain = assigned.assign({ zoo: { value: "zar" } });
      });

      it("received the assigned value", () => {
        expect(assignedAgain.valueOf()).toEqual({
          foo: { value: "bar" },
          bar: { value: "baz" },
          zoo: { value: "zar" }
        });
      });
    });
  });

  describe("assign microstate", () => {
    describe("primitive type", () => {
      let assigned;
      beforeEach(() => {
        assigned = object.assign({
          name: from("Taras")
        });
      });

      it("assigned is not a microstate", () => {
        expect(assigned.name.state).toBe("Taras");
      });

      it("microstate value to be part of valueOf", () => {
        expect(assigned.valueOf()).toEqual({ foo: {value: "bar"}, name: "Taras" });
      });
    });

    describe("AAAA composed type", () => {
      class Person {
        name = String;
      }

      let assigned, value;
      beforeEach(() => {
        value = create(Person, { name: "Taras" });
        assigned = object.assign({
          taras: value
        });
      });

      it("has new type in the state", () => {
        expect(assigned.taras.state).toBeInstanceOf(Person);
        expect(assigned.state.taras).toBeInstanceOf(Person);
      });

      it("is stable", () => {
        expect(assigned.taras.state).toBe(value.state);
        expect(assigned.state.taras).toBe(value.state);
      });

      it("was grafted into place", () => {
        expect(reveal(assigned.taras.name).path).toEqual(["taras", "name"]);
      });
    });
  });
});

describe("put and delete", () => {
  let object;
  beforeEach(() => {
    object = create(Object, { a: "b" });
  });

  describe("putting a value or two", function() {
    beforeEach(function() {
      object = object.put("w", "x").put("y", "z");
    });
    it("includes those values in the state", function() {
      expect(object.valueOf()).toMatchObject({ a: "b", w: "x", y: "z" });
    });
    describe("deleting a value", function() {
      beforeEach(() => {
        object = object.delete("w");
      });
      it("removes it from the value", function() {
        expect(object.valueOf()).toMatchObject({ a: "b", y: "z" });
      });
    });
  });

  describe("putting microstate", () => {
    describe("primitive value", () => {
      beforeEach(() => {
        object = object.put("name", from("Taras"));
      });

      it("has name string", () => {
        expect(object.name.state).toBe("Taras");
      });

      it("has valueOf", () => {
        expect(object.valueOf()).toEqual({ a: "b", name: "Taras" });
      });
    });

    describe("composed type", () => {
      class Person {
        name = String;
      }

      let value;
      beforeEach(() => {
        value = create(Person, { name: "Taras" });
        object = object.put("taras", value);
      });

      it("has new type in the state", () => {
        expect(object.taras.state).toBeInstanceOf(Person);
        expect(object.state.taras).toBeInstanceOf(Person);
      });

      it("is stable", () => {
        expect(object.state.taras).toBe(value.state);
      });
    });
  });
});
