import expect from 'expect';
import dsl from '../src/dsl';
import { ObjectType, ArrayType, NumberType, StringType, BooleanType } from '../src/types';

describe('DSL', () => {
  it('expands bare Object', function() {
    let expansion = dsl.expand(Object);
    expect(expansion.Type).toEqual(ObjectType);
    expect(expansion.value).toEqual({});
  });
  it('expands bare Array', function() {
    let expansion = dsl.expand(Array);
    expect(expansion.Type).toBe(ArrayType);
    expect(expansion.value).toEqual([]);
  });
  it('expands bare Number', function() {
    let expansion = dsl.expand(Number);
    expect(expansion.Type).toBe(NumberType);
    expect(expansion.value).toEqual(0);
  });
  it('expands bare Boolean', function() {
    let expansion = dsl.expand(Boolean);
    expect(expansion.Type).toBe(BooleanType);
    expect(expansion.value).toEqual(false);
  });
  it('expands bare String', function() {
    let expansion = dsl.expand(String);
    expect(expansion.Type).toBe(StringType);
    expect(expansion.value).toEqual('');
  });

  it('expands [] as a Array', function() {
    let expansion = dsl.expand([]);
    expect(expansion.Type).toBe(ArrayType);
    expect(expansion.value).toEqual([]);
  });

  it('expands [Number] as an Array parameterized by Number', function() {
    let expansion = dsl.expand([Number]);
    expect(expansion.Type.name).toEqual("Array<Number>");
    expect(expansion.Type.T).toEqual(NumberType);
    expect(expansion.value).toEqual([]);
  });

  it('expands {} as an Object', function() {
    let { Type, value } = dsl.expand({});
    expect(Type).toBe(ObjectType);
    expect(value).toEqual({});
  });

  it('expands {Number} as an Object parameterized by Number', function() {
    let { Type, value } = dsl.expand({ Number });
    expect(Type.name).toEqual("Object<Number>");
    expect(Type.T).toEqual(NumberType);
    expect(value).toEqual({});
  });

  it('recursively expands container types', function() {
    let { Type, value } = dsl.expand([{Class: [Number]}]);
    expect(Type.name).toEqual("Array<Object<Array<Number>>>");
    expect(value).toEqual([]);
  });

  it('expands constants as consntant', function() {
    let { Type, value } = dsl.expand(5);
    expect(Type.name).toEqual("Constant");
    expect(value).toEqual(5);
  });

  it('matches constructors to themselves', function() {
    class MyType {};
    let { Type, value } = dsl.expand(MyType);
    expect(Type).toBe(MyType);
    expect(value).toBeUndefined();
  });
})
