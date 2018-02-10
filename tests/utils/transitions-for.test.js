import 'jest';
import transitionsFor from '../../src/utils/transitions-for';

it('gets array transitions', () => {
  expect(transitionsFor(Array)).toMatchObject({
    set: expect.any(Function),
    push: expect.any(Function),
  });
});

it('get string transitions', () => {
  expect(transitionsFor(String)).toMatchObject({
    set: expect.any(Function),
    concat: expect.any(Function),
  });
});

it('gets number transitions', () => {
  expect(transitionsFor(Number)).toMatchObject({
    set: expect.any(Function),
    increment: expect.any(Function),
  });
});

it('gets boolean transitions', () => {
  expect(transitionsFor(Boolean)).toMatchObject({
    set: expect.any(Function),
    toggle: expect.any(Function),
  });
});

it('gets object transitions', () => {
  expect(transitionsFor(Object)).toMatchObject({
    set: expect.any(Function),
    assign: expect.any(Function),
  });
});

class MyClass {
  string = String;
  action() {}
}

it('gets composed type transitions', () => {
  expect(transitionsFor(
    MyClass
  )).toMatchObject({
    set: expect.any(Function),
    merge: expect.any(Function),
  });
});

it('gets custom transition', () => {
  expect(transitionsFor(
    MyClass
  ).action).toBeDefined();
});

class Parent {
  fromParent() {}
}
class Child extends Parent {}

it('inherits transitions', () => {
  expect(transitionsFor(Child)).toMatchObject({
    fromParent: expect.any(Function),
  });
});