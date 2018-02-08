import 'jest';
import { map } from 'funcadelic';
import { create } from '../src';

describe('type-shifting', () => {
  class Line {
    a = Number;
    add(b) {
      let { a } = this.state;
      return create(Corner, { a, b });
    }
  }
  class Corner extends Line {
    a = Number;
    b = Number;
    add(c) {
      let { a, b } = this.state;
      return create(Triangle, { a, b, c });
    }
  }
  class Triangle extends Corner {
    c = Number;
  }
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
    expect(corner.state).toBeInstanceOf(Corner);
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