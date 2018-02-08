import 'jest';
import '../src';
import Tree from '../src/utils/tree';
import { view, set, lensTree, lensTreeData, compose } from '../src/lens';
import { Applicative } from 'funcadelic';

function pure(Type, value) {
  return Applicative.for(Type.prototype).pure(value);
}

const tree = new Tree({
  data: () => 'root',
  children: () => ({
    one: new Tree({
      data: () => 1,
    }),
    two: new Tree({
      data: () => 2,
    }),
    arrayKids: new Tree({
      data: () => 'My children are an array',
      children: () => [
        new Tree({
          data: () => 'Child 0',
        }),
        new Tree({
          data: () => 'Child 1',
        }),
      ],
    }),
  }),
});

describe('Tree lenses', () => {
  it('can get shallow values', function() {
    let lens = lensTree();
    expect(view(lens, tree).data).toEqual('root');
  });

  it('can set shallow values', function() {
    let lens = lensTree();
    let next = set(lens, pure(Tree, 'still root'), tree);
    expect(next.data).toEqual('still root');
    expect(next.children).toEqual({});
  });

  it('can read deep values from an object', function() {
    expect(view(lensTree(['one']), tree).data).toEqual(1);
    expect(view(lensTree(['two']), tree).data).toEqual(2);
  });

  it('can read deep values from an array', function() {
    expect(view(lensTree(['arrayKids', 0]), tree).data).toEqual('Child 0');
    expect(view(lensTree(['arrayKids', 1]), tree).data).toEqual('Child 1');
  });

  it('can write deep values in an object', function() {
    let next = set(lensTree(['one']), pure(Tree, 'won'), tree);
    expect(next.data).toEqual('root');
    expect(next.children.two.data).toBe(tree.children.two.data);
    expect(next.children.one.data).toEqual('won');
  });

  it('can write deep values in an array', function() {
    let next = set(lensTree(['arrayKids', 0]), pure(Tree, 'Kid 0'), tree);
    expect(next.children.arrayKids.children[0].data).toEqual('Kid 0');
  });

  it('can compose values in an array', function() {
    let lens = compose(lensTree(['arrayKids']), lensTree([0]));
    let next = set(lens, pure(Tree, 'Kid 0'), tree);
    expect(next.children.arrayKids.children[0].data).toEqual('Kid 0');
  });
});
