import 'jest';

import MicrostateArray from '../../src/primitives/array';
import TypeTree from '../../src/utils/TypeTree';
import mapTransitions from '../../src/utils/mapTransitions';

describe('mapTransitions', () => {
  class Item {
    related = Item;
  }

  class State {
    string = String;
    number = Number;
    boolean = Boolean;
    array = Array;
    object = Object;
    item = Item;
    items = [Item];
  }

  let tree = new TypeTree(State);

  describe('root', () => {
    describe('set transition', () => {
      let onTransition;
      let transitions;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        transitions = mapTransitions(tree, [], onTransition);
        transitions.set({});
      });
      it('is present', () => {
        expect(typeof transitions.set).toEqual('function');
      });
      it('invokes onTransition', () => {
        expect(onTransition.mock.calls.length).toBe(1);
      });
      it('passes argument', () => {
        expect(onTransition.mock.calls[0][1]).toEqual({});
      });
    });

    describe('merge transition', () => {
      let onTransition;
      let transitions;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        transitions = mapTransitions(tree, [], onTransition);
        transitions.merge({});
      });
      it('is present', () => {
        expect(typeof transitions.merge).toEqual('function');
      });
      it('invokes onTransition', () => {
        expect(onTransition.mock.calls.length).toBe(1);
      });
      it('passes argument', () => {
        expect(onTransition.mock.calls[0][1]).toEqual({});
      });
    });
  });

  describe('string', () => {
    let onTransition;
    let transitions;
    beforeEach(() => {
      onTransition = jest.fn().mockImplementation(v => v);
      transitions = mapTransitions(tree, [], onTransition);
      transitions.string.concat('foo');
    });
    it('is an object', () => {
      expect(transitions.string).toBeInstanceOf(Object);
    });
    it('has concat', () => {
      expect(typeof transitions.string.concat).toEqual('function');
    });
    it('invokes onTransition', () => {
      expect(onTransition.mock.calls.length).toBe(1);
    });
    it('passes argument', () => {
      expect(onTransition.mock.calls[0][1]).toEqual('foo');
    });
  });

  describe('number', () => {
    let transitions;
    beforeEach(() => {
      let onTransition = jest.fn().mockImplementation(v => v);
      transitions = mapTransitions(tree, [], onTransition);
    });
    it('is an object', () => {
      expect(transitions.number).toBeInstanceOf(Object);
    });
    it('has increment', () => {
      expect(typeof transitions.number.increment).toEqual('function');
    });
    it('has decrement', () => {
      expect(typeof transitions.number.decrement).toEqual('function');
    });
    it('has sum', () => {
      expect(typeof transitions.number.sum).toEqual('function');
    });
    it('has subtract', () => {
      expect(typeof transitions.number.subtract).toEqual('function');
    });
    describe('invocation', () => {
      let onTransition;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        let transitions = mapTransitions(tree, [], onTransition);
        transitions.number.increment();
      });
      it('called onTransition', () => {
        expect(onTransition.mock.calls.length).toEqual(1);
      });
      it('recieved no argument', () => {
        expect(onTransition.mock.calls[0][1]).toBeUndefined;
      });
    });
  });

  describe('boolean', () => {
    let transitions;
    beforeEach(() => {
      let onTransition = jest.fn().mockImplementation(v => v);
      transitions = mapTransitions(tree, [], onTransition);
    });
    it('is an object', () => {
      expect(transitions.boolean).toBeInstanceOf(Object);
    });
    it('has toggle', () => {
      expect(typeof transitions.boolean.toggle).toEqual('function');
    });
    describe('invocation', () => {
      let onTransition;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        let transitions = mapTransitions(tree, [], onTransition);
        transitions.boolean.toggle();
      });
      it('called onTransition', () => {
        expect(onTransition.mock.calls.length).toEqual(1);
      });
      it('received no argument', () => {
        expect(onTransition.mock.calls[0][1]).toBeUndefined();
      });
    });
  });

  describe('object', () => {
    let transitions;
    beforeEach(() => {
      let onTransition = jest.fn().mockImplementation(v => v);
      transitions = mapTransitions(tree, [], onTransition);
    });
    it('is an object', () => {
      expect(transitions.object).toBeInstanceOf(Object);
    });
    it('has assign', () => {
      expect(typeof transitions.object.assign).toEqual('function');
    });
    describe('invocation', () => {
      let onTransition;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        let transitions = mapTransitions(tree, [], onTransition);
        transitions.object.assign({});
      });
      it('called onTransition', () => {
        expect(onTransition.mock.calls.length).toEqual(1);
      });
      it('received argument', () => {
        expect(onTransition.mock.calls[0][1]).toEqual({});
      });
    });
  });

  describe('array', () => {
    let onTransition;
    let transitions;
    beforeEach(() => {
      onTransition = jest.fn().mockImplementation(v => v);
      transitions = mapTransitions(tree, [], onTransition);
    });
    it('is an array', () => {
      expect(transitions.array).toBeInstanceOf(Object);
    });
    it('has push', () => {
      expect(typeof transitions.array.push).toEqual('function');
    });
    describe('invocation', () => {
      let onTransition;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        let transitions = mapTransitions(tree, [], onTransition);
        transitions.array.push('foo');
      });
      it('called onTransition', () => {
        expect(onTransition.mock.calls.length).toEqual(1);
      });
      it('received argument', () => {
        expect(onTransition.mock.calls[0][1]).toEqual('foo');
      });
    });
  });

  describe('composed object', () => {
    let transitions;
    beforeEach(() => {
      let onTransition = jest.fn().mockImplementation(v => v);
      transitions = mapTransitions(tree, [], onTransition);
    });
    it('has transitions', () => {
      expect(transitions.item).toBeDefined();
    });
    it('has set transition', () => {
      expect(transitions.item.set).toBeDefined();
    });
    describe('shallow composition', () => {
      let transitions;
      let onTransition;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        transitions = mapTransitions(tree, [], onTransition);
        transitions.item.set({});
      });
      it('invokes onTransition', () => {
        expect(onTransition.mock.calls.length).toBe(1);
      });
      it('received argument', () => {
        expect(onTransition.mock.calls[0][1]).toEqual({});
      });
    });
    describe('deep composition', () => {
      let transitions;
      let onTransition;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        transitions = mapTransitions(tree, [], onTransition);
        transitions.item.related.set({});
      });
      it('invokes onTransition', () => {
        expect(onTransition.mock.calls.length).toBe(1);
      });
      it('received argument', () => {
        expect(onTransition.mock.calls[0][1]).toEqual({});
      });
    });
  });

  describe('parameterized array', () => {
    let transitions;
    beforeEach(() => {
      let onTransition = jest.fn().mockImplementation(v => v);
      transitions = mapTransitions(tree, [], onTransition);
    });
    it('has transitions', () => {
      expect(transitions.items).toBeDefined();
    });
    it('has set transition', () => {
      expect(transitions.items.set).toBeDefined();
    });

    describe('shallow composition', () => {
      let transitions;
      let onTransition;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        transitions = mapTransitions(tree, [], onTransition);
        transitions.items[0].set({});
      });
      it('invokes onTransition', () => {
        expect(onTransition.mock.calls.length).toBe(1);
      });
      it('received argument', () => {
        expect(onTransition.mock.calls[0][1]).toEqual({});
      });
    });
    describe('deep composition', () => {
      let transitions;
      let onTransition;
      beforeEach(() => {
        onTransition = jest.fn().mockImplementation(v => v);
        transitions = mapTransitions(tree, [], onTransition);
        transitions.items[0].related.set({});
      });
      it('invokes onTransition', () => {
        expect(onTransition.mock.calls.length).toBe(1);
      });
      it('received arguement', () => {
        expect(onTransition.mock.calls[0][1]).toEqual({});
      });
    });
  });
});
