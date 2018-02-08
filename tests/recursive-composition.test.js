import 'jest';
import { map } from 'funcadelic';
import create from '../src';

class Container {
  contains = Container;
  x = Number;
  y = Number;
}

describe('without initial value', () => {
  let ms;
  beforeEach(() => {
    ms = create(Container);
  });
  it('initializes first level', () => {
    expect(ms.state).toMatchObject({
      contains: expect.any(Object),
      x: 0,
      y: 0,
    });
  });
  it('initializes recursively', () => {
    expect(ms.state).toMatchObject({
      contains: {
        x: 0,
        y: 0,
        contains: expect.any(Object),
      },
      x: 0,
      y: 0,
    });
  });
  it('transitions non recursive value', () => {
    expect(ms.x.increment().valueOf()).toEqual({
      x: 1,
    });
  });
  it('transition recursive value', () => {
    expect(ms.contains.y.increment().valueOf()).toEqual({
      contains: {
        y: 1,
      },
    });
  });
});
describe('with initial value', () => {
  let ms;
  beforeEach(() => {
    ms = create(Container, {
      x: 10,
      y: 0,
      contains: { y: 20, x: 0, contains: { x: 30, y: 25, contains: {} } },
    });
  });
  it('restores state tree from initial value', () => {
    expect(ms.state).toMatchObject({
      x: 10,
      y: 0,
      contains: {
        y: 20,
        x: 0,
        contains: {
          x: 30,
          y: 25,
        },
      },
    });
  });
  it('transitions deeply nested state', () => {
    expect(ms.contains.contains.x.increment().valueOf()).toEqual({
      x: 10,
      y: 0,
      contains: { y: 20, contains: { x: 31, y: 25, contains: {} }, x: 0 },
    });
  });
  it('transitions deeply nested state without initial value', () => {
    expect(ms.contains.contains.contains.y.decrement().valueOf()).toEqual({
      x: 10,
      y: 0,
      contains: {
        y: 20,
        x: 0,
        contains: { x: 30, y: 25, contains: { y: -1 } },
      },
    });
  });
});