import expect from 'expect';
import * as exports from '../index';

describe('package', () => {
  it('exports create', () => expect(exports.create).toBeDefined());
  it('exports from', () => expect(exports.from).toBeDefined());
  it('exports map', () => expect(exports.map).toBeDefined());
  it('exports filter', () => expect(exports.filter).toBeDefined());
  it('exports reduce', () => expect(exports.reduce).toBeDefined());
  it('exports store', () => expect(exports.Store).toBeInstanceOf(Function));
  it('exports metaOf', () => expect(exports.metaOf).toBeInstanceOf(Function));
  it('exports valueOf', () => expect(exports.valueOf).toBeInstanceOf(Function));
  it('exports types', () => {
    expect(exports.Any).toBeInstanceOf(Function);
    expect(exports.Primitive).toBeInstanceOf(Function);
    expect(exports.ObjectType).toBeInstanceOf(Function);
    expect(exports.ArrayType).toBeInstanceOf(Function);
    expect(exports.NumberType).toBeInstanceOf(Function);
    expect(exports.StringType).toBeInstanceOf(Function);
    expect(exports.BooleanType).toBeInstanceOf(Function);
  });
});
