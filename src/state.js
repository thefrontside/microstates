import { append, map } from 'funcadelic';
import { flatMap } from './monad';
import { Collapse, collapse } from './typeclasses/collapse';
import { view, lensTree } from './lens';

export default class State {
  constructor(tree) {
    this.tree = tree;
  }
}

Collapse.instance(State, {
  collapse(state) {
    let truncated = truncate(node => node.isSimple, state.tree);
    return collapse(map(node => node.state, truncated));
  }
})

function truncate(fn, tree) {
  return flatMap(node => {
    let subtree = view(lensTree(node.path), tree);
    if (fn(node)) {
      return append(subtree, { children: [] });
    } else {
      return subtree;
    }
  }, tree);
}
