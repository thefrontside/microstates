import 'jest';
import { map } from 'funcadelic';
import microstate, * as MS from '../src';

describe('type-shifting', () => {
  class Line {
    a = MS.Number;
    add({ a }, b) {
      return this(Corner, { a, b });
    }
  }
  class Corner extends Line {
    a = MS.Number;
    b = MS.Number;
    add({ a, b }, c) {
      return this(Triangle, { a, b, c });
    }
  }
  class Triangle extends Corner {
    c = MS.Number;
  }
  let ms = microstate(Line);
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
});
describe('type-shifting + constant values', () => {
  class Async {
    content = null;
    isLoaded = false;
    isLoading = false;
    isError = false;

    loading() {
      return this(AsyncLoading);
    }
  }

  class AsyncError extends Async {
    isError = true;
    isLoading = false;
    isLoaded = true;
  }

  class AsyncLoading extends Async {
    isLoading = true;

    loaded(current, content) {
      return this(
        class extends AsyncLoaded {
          content = content;
        }
      );
    }

    error(current, msg) {
      return this(
        class extends AsyncError {
          error = msg;
        }
      );
    }
  }

  class AsyncLoaded extends Async {
    isLoaded = true;
    isLoading = false;
    isError = false;
  }
  describe('successful loading siquence', () => {
    let async = microstate(Async);
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
    let async = microstate(Async);
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