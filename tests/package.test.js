import expect from 'expect';
import * as exports from '../index';

describe('package', () => {
  it('exports create', () => expect(exports.create).toBeDefined());
  it('exports from', () => expect(exports.from).toBeDefined());
  it('exports filter', () => expect(exports.filter).toBeDefined());
  it('exports reduce', () => expect(exports.reduce).toBeDefined());
  it('exports ArrayType', () => expect(exports.ArrayType).toBeDefined());
  it('exports ObjectType', () => expect(exports.ObjectType).toBeDefined());
});