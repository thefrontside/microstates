import 'jest';

import desugar, { isSugar, ContainsTypes, isPossibleSugar } from '../src/desugar';
import types, { params } from '../src/types';
import { any } from '../src/types/parameters';

describe('isSugar', () => {
  it('Array is not sugar', () => {
    expect(isSugar(Array)).toBe(false);
  });
  
  it('Object is not sugar', () => {
    expect(isSugar(Object)).toBe(false);
  });
  
  it('detects [] as sugar', () => {
    expect(isSugar([])).toBe(true);
  });
  
  it('detects {} as sugar', () => {
    expect(isSugar({})).toBe(true);
  });
  
  it('detects [Type] as sugar', () => {
    expect(isSugar([Boolean])).toBe(true);
    expect(isSugar([class Item {}])).toBe(true);
  });
  
  it('detects {Type} as sugar', () => {
    expect(isSugar({Boolean})).toBe(true);
  });
  
  it('detects {[Number]} as sugar', function() {
    let Numbers = [Number];
    expect(isSugar({Numbers})).toBe(true);
  });
  
  it('detects [[Number]] as sugar', function() {
    expect(isSugar([[Number]])).toBe(true);
  });
})

describe('desugar', () => {
  it('passes Array through without modification', () => {
    expect(desugar(Array)).toBe(Array);
  });
  
  it('converts [] into parameterized(Array)', () => {
    let Parameterized = desugar([]);
    expect(Parameterized.prototype).toBeInstanceOf(types.Array);
    expect(params(Parameterized).T).toBe(any);
  });
  
  it('converts [Type] into parameterized(Array, Type)', () => {
    let Parameterized = desugar([Boolean]);
    expect(Parameterized.prototype).toBeInstanceOf(types.Array);
    expect(params(Parameterized).T).toBe(types.Boolean);
  });
  
  it('converts {} into parameterized(Object)', () => {
    let Parameterized = desugar({});
    expect(Parameterized.prototype).toBeInstanceOf(types.Object);
    expect(params(Parameterized).T).toBe(any);
  });
  
  it('converts {Type} into parameterized(Object, Type)', () => {
    let Parameterized = desugar({Boolean});
    expect(Parameterized.prototype).toBeInstanceOf(types.Object);
    expect(params(Parameterized).T).toBe(types.Boolean);
  });
  
  it('converts {[Number]} into parameterized(Object, parameterized(Array, Number))', function() {
    let Numbers = [Number];
    
    let Parameterized = desugar({Numbers});
    expect(Parameterized.prototype).toBeInstanceOf(types.Object);
    
    let { T } = params(Parameterized);
    expect(T.prototype).toBeInstanceOf(types.Array);
  
    expect(params(T).T).toBe(types.Number);
  });
  
  it('converts [[Number]] into parameterized(Array, parameterized(Array, Number))', function() {
    let Parameterized = desugar([[Number]]);
    expect(Parameterized.prototype).toBeInstanceOf(types.Array);
  
    let { T } = params(Parameterized);
    expect(T.prototype).toBeInstanceOf(types.Array);
  
    expect(params(T).T).toBe(types.Number);
  });
});

describe('isPossibleSugar', () => {
  it('result false for String', () => {
    expect(isPossibleSugar(String)).toBe(false);
  });
  it('returns true for [String]', () => {
    expect(isPossibleSugar([String])).toBe(true);
  });
});