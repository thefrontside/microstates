import expect from 'expect';
import * as exports from '../index';

describe('package', () => {
  it('exports create', () => expect(exports.create).toBeDefined());
  it('exports from', () => expect(exports.from).toBeDefined());
  it('exports map', () => expect(exports.map).toBeDefined());
  it('exports filter', () => expect(exports.filter).toBeDefined());
  it('exports reduce', () => expect(exports.reduce).toBeDefined());
});
