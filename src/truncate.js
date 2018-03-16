import { append } from 'funcadelic';
import { flatMap } from './monad';
import { view, lensTree } from './lens';

export default function truncate(fn, tree) {
  return flatMap(node => {
    let subtree = view(lensTree(node.path), tree);
    if (fn(subtree.data)) {
      return append(subtree, { children: [] });
    } else {
      return subtree;
    }
  }, tree);
}