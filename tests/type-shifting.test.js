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
      return create(Shape);
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
      let shape = Shape.create();
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