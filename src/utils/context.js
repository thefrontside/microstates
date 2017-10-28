import Tree from './tree';
import { map } from 'funcadelic';

export default function contextFactory(Type) {
  let tree = Tree.from(Type);
  let transitions = map(
    ({ Type, path }) => ({ Type, path, transitions: transitionsFor(Type) }),
    tree
  );
  return function context(value) {};
}
