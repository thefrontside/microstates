import 'jest';

import desugar, { isSugar } from '../src/desugar';
import types, { params } from '../src/types';

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

it('converts [Type] into parameterized(Array, Type)', () => {
  let Parameterized = desugar([Boolean]);
  expect(Parameterized.prototype).toBeInstanceOf(types.Array);
  expect(params(Parameterized).T).toBe(types.Boolean);
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