import 'jest';
import { map } from 'funcadelic';
import create from '../src';

class Modal {
  name = String;
  isOpen = Boolean;
}
describe('types', () => {
  describe('value', () => {
    let ms;
    beforeEach(() => {
      ms = create(Modal);
    });
    it('is instance of Modal', () => {
      expect(ms.state).toBeInstanceOf(Modal);
    });
    it('initializes default', () => {
      expect(ms.state).toEqual({ name: '', isOpen: false });
    });
    it('has transitions', () => {
      expect(ms).toMatchObject({
        set: expect.any(Function),
        merge: expect.any(Function),
        name: {
          set: expect.any(Function),
          concat: expect.any(Function),
        },
        isOpen: {
          set: expect.any(Function),
          toggle: expect.any(Function),
        },
      });
    });
    it('replaces value when set is called on the node', () => {
      expect(ms.set({ name: 'taras' }).valueOf()).toEqual({ name: 'taras' });
    });
    it('replaces value when set is called on leaf state', () => {
      expect(ms.name.set('taras').valueOf()).toEqual({ name: 'taras' });
    });
  });
  describe('no value', () => {
    let ms, set, merged;
    beforeEach(() => {
      ms = create(Modal, { isOpen: true });
      set = ms.name.set('taras');
      merged = ms.merge({ name: 'taras' });
    });
    it('uses provided state', () => {
      expect(ms.state).toEqual({ name: '', isOpen: true });
    });
    it('replaces value when set is called but uses provided value', () => {
      expect(set.valueOf()).toEqual({ name: 'taras', isOpen: true });
    });
    it('merges value on merge transition', () => {
      expect(merged.valueOf()).toEqual({ name: 'taras', isOpen: true });
    });
  });
});

describe('arrays and objects', () => {
  class State {
    animals = Array;
    config = Object;
  }
  describe('value', () => {
    let ms;
    beforeEach(() => {
      ms = create(State);
    });
    it('initialies with default', () => {
      expect(ms.state).toEqual({
        animals: [],
        config: {},
      });
    });
    it('returns a new object with value pushed into an array', () => {
      expect(ms.animals.push('cat').valueOf()).toEqual({
        animals: ['cat'],
      });
    });
    it('return a new object with value assigned into the object', () => {
      expect(ms.config.assign({ x: 10, y: 20 }).valueOf()).toEqual({
        config: { x: 10, y: 20 },
      });
    });
  });
  describe('no value', () => {
    let ms;
    beforeEach(() => {
      ms = create(State, { animals: ['cat', 'dog'], config: { color: 'red' } });
    });
    it('uses provided value', () => {
      expect(ms.state).toEqual({
        animals: ['cat', 'dog'],
        config: { color: 'red' },
      });
    });
    it('returns a new object with value pushed into an array', () => {
      expect(ms.animals.push('bird').valueOf()).toEqual({
        animals: ['cat', 'dog', 'bird'],
        config: { color: 'red' },
      });
    });
    it('return a new object with value assigned into the object', () => {
      expect(ms.config.assign({ x: 10, y: 20 }).valueOf()).toEqual({
        animals: ['cat', 'dog'],
        config: { x: 10, y: 20, color: 'red' },
      });
    });
  });
});