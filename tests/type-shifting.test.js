import 'jest';
import { create } from 'microstates';

describe('type-shifting', () => {

  class Shape {
    static create({ a, b, c } = {}) {
      if (a && b && c) {
        return create(Triangle, { a, b, c });
      }
      if (a && b) {
        return create(Angle, { a, b });
      }
      if (a) {
        return create(Line, { a });
      }
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

  describe('create', function() {

    it('can initialize to itself', () => {
      let shape = create(Shape);
      expect(shape.state).toBeInstanceOf(Shape);
    });

    it('initializes to first type', () => {
      let triangle = Shape.create({a: 10, b: 20, c: 30 });
      expect(triangle.state).toBeInstanceOf(Triangle);
      expect(triangle.state).toMatchObject({
        a: 10,
        b: 20,
        c: 30
      });
    });

    it('initializes to second type', () => {
      let angle = Shape.create({a: 10, b: 20 });
      expect(angle.state).toBeInstanceOf(Angle);
      expect(angle.state).toMatchObject({
        a: 10,
        b: 20,
      });
    });

    it(`can be initialized from descendant's create`, function() {
      let line = Line.create({ a: 10 });      
      expect(line.state).toBeInstanceOf(Line);
      expect(line.state).toMatchObject({
        a: 10
      });
    });

    it('is used to initialize composed object', function() {     
      let composed = create(Glass, { shape : {a: 10, b: 20, c: 30 }}); 
      expect(composed.state.shape).toBeInstanceOf(Triangle);
      expect(composed.state).toMatchObject({
        shape: {
          a: 10,
          b: 20,
          c: 30
        }
      });
    });

    it('supports being initialized in parameterized arrays', () => {
      class Drawing {
        shapes = [Shape]
      }
      let drawing = create(Drawing, { shapes: [ { a: 10 }, { a: 20, b: 30 }, { a: 100, b: 200, c: 300 }]});
      expect(drawing.state.shapes[0]).toBeInstanceOf(Line);
      expect(drawing.state.shapes[1]).toBeInstanceOf(Angle);
      expect(drawing.state.shapes[2]).toBeInstanceOf(Triangle);            
    });

    describe('can type-shift into a parameterized type', () => {
      class Container {
        static create(content) {
          if (Array.isArray(content)) {
            return create([String], content);
          } else {
            return create({String}, content);
          }
        }
      }
      it('can initialize into a parameterized array', () => {
        let array = Container.create(['a', 'b', 'c']);
        expect(array.state).toMatchObject(['a', 'b', 'c']);
        expect(array[0].concat).toBeInstanceOf(Function);
      });
      it('can initialize into a parameterized object', () => {
        let object = Container.create({a: 'A', b: 'B', c: 'C'});
        expect(object.state).toMatchObject({a: 'A', b: 'B', c: 'C'});
        expect(object.a.concat).toBeInstanceOf(Function);
      });
    });

  });

  describe('transitions', function() {
    let ms = create(Line);
    let line, corner, triangle;
    beforeEach(() => {
      line = ms.a.set(10);
      corner = line.add(20);
      triangle = corner.add(30);
    });
    it('constructs a line', () => {
      expect(line.state).toBeInstanceOf(Line);
      expect(line.state).toMatchObject({
        a: 10,
      });
      expect(line.valueOf()).toEqual({ a: 10 });
    });
    it('constructs a Corner', () => {
      expect(corner.state).toBeInstanceOf(Angle);
      expect(corner.state).toMatchObject({
        a: 10,
        b: 20,
      });
      expect(corner.valueOf()).toEqual({ a: 10, b: 20 });
    });
    it('constructs a Triangle', () => {
      expect(triangle.state).toBeInstanceOf(Triangle);
      expect(triangle.state).toMatchObject({
        a: 10,
        b: 20,
        c: 30,
      });
      expect(triangle.valueOf()).toEqual({ a: 10, b: 20, c: 30 });
    });
    it('can be done down tree', () => {
      let string = create(String, '100');
      let cString = triangle.c.set(string)
      expect(cString.state.c).toBe('100');
      expect(cString.c.concat).toBeDefined();
    });
  });
});

describe('type-shifting with constant values', () => {
  class Async {
    content = null;
    isLoaded = false;
    isLoading = false;
    isError = false;

    loading() {
      return create(AsyncLoading);
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
      return create(class extends AsyncLoaded {
        content = content;
      });
    }

    error(msg) {
      return create(class extends AsyncError {
        error = msg;
      });
    }
  }

  class AsyncLoaded extends Async {
    isLoaded = true;
    isLoading = false;
    isError = false;
  }
  describe('successful loading siquence', () => {
    let async = create(Async);
    it('can transition to loading', () => {
      expect(async.loading().state).toMatchObject({
        content: null,
        isLoaded: false,
        isLoading: true,
        isError: false,
      });
    });
    it('can transition from loading to loaded', () => {
      expect(async.loading().loaded('GREAT SUCCESS').state).toMatchObject({
        content: 'GREAT SUCCESS',
        isLoaded: true,
        isLoading: false,
        isError: false,
      });
    });
  });
  describe('error loading sequence', () => {
    let async = create(Async);
    it('can transition from loading to error', () => {
      expect(async.loading().error(':(').state).toMatchObject({
        content: null,
        isLoaded: true,
        isError: true,
        isLoading: false,
        error: ':(',
      });
    });
  });
});


describe("type-shifting into a deeply composed microstate", () => {
  class Node {
    name = String;
    node = Node;
  }

  let root;
  beforeEach(() => {
    root = create(Node);
  })
  
  describe('shifting the root node', () => {

    let shiftedRoot;
    beforeEach(() => {
      shiftedRoot = root.set(
        create(Node, { name: "n1", node: { name: "n2", node: { name: "n3" } } })
      )
    });

    it("preserves type shifting value", () => {
      expect(
        shiftedRoot.state
      ).toMatchObject({
        name: 'n1',
        node: { name: 'n2', node: { name: "n3" }}
      });
    });

    it('preserves valueOf', () => {
      expect(shiftedRoot.valueOf()).toEqual({
        name: 'n1',
        node: { name: 'n2', node: { name: "n3" }}
      })
    });
  });

  describe('shifting deeply composted state with new value', () => {

    let shiftedDeeply;
    beforeEach(() => {
      shiftedDeeply = root.node.node.node.set({ name: "soooo deep", node: { name: 'one more' }});
    });

    it("preserves type shifting value", () => {
      expect(
        shiftedDeeply.state
      ).toMatchObject({
        node: { node: { node: { name: 'soooo deep', node: { name: 'one more' }}}}
      });
    });

    it('preserves valueOf', () => {
      expect(shiftedDeeply.valueOf()).toEqual({
        node: { node: { node: { name: 'soooo deep', node: { name: 'one more' }}}}
      })
    });
  });
});

describe("type-shifting in a getter", () => {
  class Node {
    depth = Number;

    get next() {
      return create(Node, { depth: this.depth + 1 }).state;
    }
  }

  let root;
  beforeEach(() => {
    root = create(Node);
  });

  it('allows to create nodes', () => {
    expect(root.state.depth).toBe(0);
    expect(root.state.next.depth).toBe(1);
    expect(root.state.next.next.depth).toBe(2);
  });
});

describe.skip("type-shifting recursively with create", () => {
  // this fails with: RangeError: Maximum call stack size exceeded
  // I suspect this is because `create` is eager, it would be cool if
  // we could make this lazy and thereby allow tree to be pulled on demand

  class Node {
    depth = Number;
    node = Node;

    static create({ depth = 0 } = {}) {
      return create(Node, { depth, node: { depth: depth + 1 } });
    }
  }

  let root;
  beforeEach(() => {
    root = create(Node);
  });


  it('allows to create nodes', () => {
    expect(root.state.depth).toBe(0);
    expect(root.state.node.depth).toBe(1)
  });
});

describe('type-shifting from create to parameterized array', () => {
  class Person {
    name = String;
  }

  class Group {
    members = [Person]

    static create({ members } = {}) {
      if (!members) {
        return create(Group, { members: [
          { name: 'Taras' },
          { name: 'Charles' },
          { name: 'Siva' }
        ]});
      }
    }
  }

  let group;
  let value;

  beforeEach(() => {
    group = create(Group);
    value = group.valueOf();
  });


  it('initializes to value', () => {
    expect(value).toMatchObject({
      members: [
        { name: 'Taras' },
        { name: 'Charles' },
        { name: 'Siva' }
      ]
    });
  });

  it('has a POJO as value', () => {
    let descriptor = Object.getOwnPropertyDescriptor(value, 'members');
    expect(descriptor).toHaveProperty('value', [
      { name: 'Taras' },
      { name: 'Charles' },
      { name: 'Siva' }
    ]);
    expect(descriptor.get).toBeUndefined();
  });

  it('provides data to parameterized array', () => {
    expect(group.state.members).toHaveLength(3);
    expect(group.state).toMatchObject({
      members: [
        { name: 'Taras' },
        { name: 'Charles' },
        { name: 'Siva' }
      ]
    });
    expect(group.state.members[0]).toBeInstanceOf(Person);
  });

  describe('transitioning shifted value', () => {
    let acclaimed;
    let value;

    beforeEach(() => {
      acclaimed = group.members[1].name.set('!!Charles!!');
      value = acclaimed.valueOf();
    });

    it('has the transitioned state', () => {
      expect(acclaimed.state).toMatchObject({
        members: [
          { name: 'Taras' },
          { name: '!!Charles!!' },
          { name: 'Siva' }
        ]
      })
    });

    it('carries the value of', () => {
      expect(value).toEqual({
        members: [
          { name: 'Taras' },
          { name: '!!Charles!!' },
          { name: 'Siva' }
        ]
      });
    });

    it('has a POJO as value', () => {
      let descriptor = Object.getOwnPropertyDescriptor(value, 'members');
      expect(descriptor).toHaveProperty('value', [
        { name: 'Taras' },
        { name: '!!Charles!!' },
        { name: 'Siva' }
      ]);
      expect(descriptor.get).toBeUndefined();
    });
  });
});

describe('type-shifting from create to parameterized object', () => {
  class Parent {
    name = String;
  }
  class Person {
    parents = { Parent }

    static create({ parents } = {}) {
      if (!parents) {
        return create(Person, {
          parents: {
            father: {
              name: 'John Doe'
            },
            mother: {
              name: 'Jane Doe'
            }
          }
        });
      }
    }
  }

  let person;
  beforeEach(() => {
    person = create(Person);
  });

  it('has name with initial values', () => {
    expect(person.state.parents.father).toBeInstanceOf(Parent);
    expect(person.state).toMatchObject({
      parents: {
        father: {
          name: 'John Doe'
        },
        mother: {
          name: 'Jane Doe'
        }
      }
    })
  });

  it('has valueOf', () => {
    expect(person.valueOf()).toEqual({
      parents: {
        father: {
          name: 'John Doe'
        },
        mother: {
          name: 'Jane Doe'
        }
      }
    });
  });
});

describe('type-shifting from create nodes in single operation', () => {
  class Root {
    static create(params) {
      if (!params) {
        return create(Root, { name: 'Default for Root', first: { second: { name: 'Provided name for Second' } } })
      }
    }
    name = String;
    first = class First {
      name = String;
      second = class Second {
        name = String;
        third = class Third {
          name = String;
          static create(params) {
            if (!params) {
              return create(Third, { name: 'Default for Third' });
            }
          }
        }
      }
    }
  }

  let root;
  beforeEach(() => {
    root = create(Root);
  });

  it('has state for root', () => {
    expect(root.state).toMatchObject({
      name: 'Default for Root',
      first: {
        name: '',
        second: {
          name: 'Provided name for Second',
          third: {
            name: 'Default for Third'
          }
        }
      }
    })
  });

  it('has valueOf', () => {
    expect(root.valueOf()).toMatchObject({
      name: 'Default for Root',
      first: {
        name: undefined,
        second: {
          name: 'Provided name for Second',
          third: {
            name: 'Default for Third'
          }
        }
      }
    })
  });
});

describe('type-shifting with create in from none root node', () => {

  class Root {
    first = class First {
      second = class Second {
        name = String;
        static create(props) {
          if (!props) {
            return create(Second, { name: 'default' });
          }
        }
      }
    }
  }

  let root, changed;
  beforeEach(() => {
    root = create(Root);
    changed = root.first.second.name.concat('!!!');
  });


  it('has result of create of second node', () => {
    expect(root.state).toMatchObject({
      first: {
        second: {
          name: 'default'
        }
      }
    });
  });

  it('has result after transition valueOf', () => {
    expect(changed.valueOf()).toEqual({
      first: {
        second: {
          name: 'default!!!'
        }
      }
    });
  });

});