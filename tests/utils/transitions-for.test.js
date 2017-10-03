import 'jest';

import transitionsFor from '../../src/utils/transitions-for';

describe('transitionsFor', () => {
  describe('composed', () => {
    let transitions = transitionsFor(
      class {
        action() {}
      }
    );
    it('has set transition', () => {
      expect(transitions.set).toBeDefined();
    });
    it('has initialize transition', () => {
      expect(transitions.initialize).toBeDefined();
    });
    it('has custom transition', () => {
      expect(transitions.action).toBeDefined();
    });
  });
});
