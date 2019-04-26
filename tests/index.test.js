/* global describe, it */
import expect from 'expect';

import * as index from '../index';

describe('index of module exports', () => {
  it('has a create function', () => {
    expect(index.create).toBeInstanceOf(Function);
  });
  it('has a from function for instatiating literals', () => {
    expect(index.from).toBeInstanceOf(Function);
  });
  it('has map, filter, reduce, and find queries', () => {
    expect(index.filter).toBeInstanceOf(Function);
    expect(index.map).toBeInstanceOf(Function);
    expect(index.reduce).toBeInstanceOf(Function);
    expect(index.find).toBeInstanceOf(Function);
  });
  it('has Store constructor', () => {
    expect(index.Store).toBeInstanceOf(Function);
  });
  it('has metaOf() and valueOf() for opening microstate boxes', () => {
    expect(index.metaOf).toBeInstanceOf(Function);
    expect(index.valueOf).toBeInstanceOf(Function);
  });
});
