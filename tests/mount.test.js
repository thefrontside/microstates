import expect from 'expect';
import { create } from '../index';
import { Meta } from '../src/microstates';
import { set } from '../src/lens';

const { mount, At } = Meta;

describe('mounting', function() {

  class Node {}
  let parent;
  beforeEach(function() {
    parent = create(Node);
    parent.child = mount(parent, 'child', create(Node));
  });

  it('focuses the lens of this structure to return the containing state', function() {
    expect(parent.child.set('Ricardio')).toEqual({
      state: {
        child: 'Ricardio'
      },
      child: {
        state: 'Ricardio'
      }
    })
  });

  describe('nested mounting', function() {
    let child, grandchild;
    beforeEach(function() {
      grandchild = parent.child.grandchild = mount(parent.child, 'grandchild', create(Node));
    });

    it('transitions from the grandchild to the root', function() {
      let transitioned = grandchild.set('Barry');
      expect(transitioned).toEqual({
        state: {
          child: {
            grandchild: 'Barry'
          }
        },
        child: {
          state: { grandchild: 'Barry' },
          grandchild: {
            state: 'Barry'
          }
        }
      })
    });
    it('tolerates multiple transitions', function() {
      let transitioned = grandchild.set('Barry').child.grandchild.set('Larry');
      expect(transitioned).toEqual({
        state: {
          child: {
            grandchild: 'Larry'
          }
        },
        child: {
          state: { grandchild: 'Larry' },
          grandchild: {
            state: 'Larry'
          }
        }
      })
    });
    it('tolerates multiple transitions at different levels of the tree', function() {
      let transitioned = grandchild.set('Barry').child.grandchild.set('Larry');
      expect(transitioned).toEqual({
        state: {
          child: {
            grandchild: 'Larry'
          }
        },
        child: {
          state: { grandchild: 'Larry' },
          grandchild: {
            state: 'Larry'
          }
        }
      })
    });
  });

});
