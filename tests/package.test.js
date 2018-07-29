import expect from 'expect';

const pkg = require('../dist/microstates.es.js');

describe('package', () => {
  it('exports create', () => expect(pkg.create).toBeDefined());
  it('exports from', () => expect(pkg.from).toBeDefined());
  it('exports filter', () => expect(pkg.filter).toBeDefined());
  it('exports reduce', () => expect(pkg.reduce).toBeDefined());
  it('exports ArrayType', () => expect(pkg.ArrayType).toBeDefined());
  it('exports ObjectType', () => expect(pkg.ObjectType).toBeDefined());
});