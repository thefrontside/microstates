/* global describe, it, beforeEach */

import expect from 'expect';

import { Any } from '../src/types';
import { relationship } from '../src/relationship';

describe('relationships', () => {
  let rel;
  describe('with absolutely nothing specified', () => {
    beforeEach(() => {
      rel = relationship(10);
    });

    it('reifies to using Any for the type and the passed value, }', () => {
      expect(rel.traverse(5)).toEqual({ Type: Any, value: 5 });
    });

    it('uses the supplied value if non is given', () => {
      expect(rel.traverse()).toEqual({ Type: Any, value: 10 });
    });
  });

  describe('depending on the parent microstate that they are a part of', () => {
    beforeEach(() => {
      rel = relationship((value, parent) => {
        if (typeof parent === 'number') {
          return { Type: Number, value: Number(value) };
        } else if (typeof parent === 'string') {
          return { Type: String, value: String(value) };
        } else {
          return { Type: Object, value: Object(value) };
        }
      });
    });
    it('generates numbers when the parent is a number', () => {
      expect(rel.traverse(5, 'parent')).toEqual({ Type: String, value: '5'});
    });

    it('generates strings when the parent is a string', () => {
      expect(rel.traverse(5, 0)).toEqual({ Type: Number, value: 5});
    });
  });

  describe('that are mapped', () => {
    beforeEach(() => {
      rel = relationship()
        .map(({ value }) => ({Type: Number, value: value * 2 }));
    });

    it('executes the mapping as part of the traversal', () => {
      expect(rel.traverse(3)).toEqual({Type: Number, value: 6});
    });
  });
});
